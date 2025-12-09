import React, { useEffect, useState, useRef, useMemo, useCallback, useDebugValue } from "react";
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Linking, Alert, Platform, ActivityIndicator, Animated } from "react-native";
import MapView, { Marker, AnimatedRegion, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { useLocalSearchParams, router } from "expo-router";
import axiosInstance from "@/api/axiosInstance";
import socketService from "@/utils/socket/socketService";
// import { styles } from "./styles";
import getVehicleIcon from "@/utils/ride/getVehicleIcon";
import estimateArrivalFromDriver from "@/utils/ride/getEstimatedDriverArrival";
import { Toast } from "react-native-toast-notifications";
import FooterModal from '@/components/modal/footer-modal/footer.modal';
import { getAvatar } from "@/utils/avatar/getAvatar";
import { fontSizes, windowHeight, windowWidth } from "@/themes/app.constant";
import { sendPushNotification } from "@/utils/notifications/sendPushNotification";
import { calculateDistance } from "@/utils/ride/calculateDistance";
import { getDistrict } from "@/utils/ride/getDistrict";
import calculateFare from "@/utils/ride/calculateFare";
import axios from "axios";
import { MaterialIcons, FontAwesome, Ionicons } from "@expo/vector-icons";
import Images from "@/utils/images";
import color from "@/themes/app.colors";
import { customMapStyle } from "@/utils/map/mapStyle";
import Button from "@/components/common/button";
import { useGetUserRideHistories } from "@/hooks/useGetUserData";
import RideDetailsSkeleton from "./ride-details-skelton.screen";
import AppAlert from "@/components/modal/alert-modal/alert.modal";
import { renderStars } from "@/components/ride/ride.rating.stars";


export default function RideDetailScreen() {
  const { rideId } = useLocalSearchParams();
  const [ride, setRide] = useState(null);
  const [driver, setDriver] = useState(null);
  const [driverHeading, setDriverHeading] = useState(0);
  const [driverLocation, setDriverLocation] = useState(null);
  const [region, setRegion] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const mapRef = useRef(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalSubMessage, setModalSubMessage] = useState("");
  const [modalType, setModalType] = useState("success");

  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isCancelling, setIsCancelling] = useState(false);

  const [remainingDistance, setRemainingDistance] = useState(0);



  // ✅ Fetch Ride
  useEffect(() => {
    const fetchRide = async () => {
      try {
        setLoading(true);
        const id = JSON.parse(rideId);

        const { data } = await axiosInstance.get(`/ride/${id}`);
        if (data.success) {
          setRide(data.ride);
          console.log(data.ride)

        } else {
          setError("Ride not found");
        }
      } catch (err) {
        console.log("Error fetching ride:", err);
        setError("Failed to fetch ride details. Please try again.");
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 0);
      }
    };

    fetchRide();
  }, [rideId]);

  // ✅ Match Driver
  useEffect(() => {
    if (!ride) return;

    // If driverId exists, request current driver location from socket
    if (ride.driverId?._id) {
      socketService.send({
        type: "requestDriver",
        driverId: ride.driverId._id,
        userId: ride.userId._id,
        role: "user",
      });
    }
  }, [ride]);


  // ✅ Live Driver Location via Socket
  useEffect(() => {
    socketService.onDriverLocationUpdates((updates) => {
      const live = updates.find((d) => d.id === driver.id);
      if (live?.current) {
        const newCoordinate = {
          latitude: live.current.latitude,
          longitude: live.current.longitude,
        };
        driverLocation?.timing({
          ...newCoordinate,
          duration: 1000,
          useNativeDriver: false,
        }).start();
        // Update actual driver state too
        setDriver((prev) => ({
          ...prev,
          latitude: live.current.latitude,
          longitude: live.current.longitude,
          heading: live.heading,
        }));
        setDriverHeading(live.heading);
      }
    });

    socketService.onMessage((message) => {
      console.log(message)

      if (message.type === "driverLocation") {
        const live = message.drivers.find(d => d.id === ride?.driverId?._id);
        console.log(live)
        if (live?.current) {
          if (!driver) {
            // Initialize driver if not already set
            setDriver({
              id: live.id,
              latitude: live.current.latitude,
              longitude: live.current.longitude,
              heading: live.heading,
              vehicle_type: ride.driverId.vehicle_type,
              vehicle_color: ride.driverId.vehicle_color,
              registration_number: ride.driverId.registration_number,
              name: ride.driverId.name,
            });

            setDriverLocation(
              new AnimatedRegion({
                latitude: live.current.latitude,
                longitude: live.current.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              })
            );

            setDriverHeading(live.heading);
          } else {
            // Update driver position
            driverLocation?.timing({
              latitude: live.current.latitude,
              longitude: live.current.longitude,
              duration: 1000,
              useNativeDriver: false,
            }).start();
            setDriverHeading(live.heading);
          }
        }
      }

      if (message.type === "rideStatusUpdate") {
        // Only update if this message belongs to the current ride
        if (ride?.id === message.rideId) {
          setRide((prevRide) => ({
            ...prevRide,
            status: message.status,
          }));
          // Optional toast alert
          Toast.show(message.message, { type: "success" });
        }
      }

    });

    return () => socketService.clearListeners();
  }, [driver, driverLocation, ride]);

  // ✅ Calculate Map Region
  const regionSetRef = useRef(false); // to track if initial region was set

  useEffect(() => {
    if (!ride) return; // driver may be null

    // Only set region initially or when ride status changes
    if (!regionSetRef.current || ride.status !== regionSetRef.currentStatus) {
      const from = ride.currentLocation;
      const to = ride.destinationLocation;

      const calculateRegion = () => {
        switch (ride.status) {
          case "Booked":
            // Region covering both pickup and drop
            const lat = (from.latitude + to.latitude) / 2;
            const lng = (from.longitude + to.longitude) / 2;
            const latDelta = Math.max(0.05, Math.abs(to.latitude - from.latitude) * 1.5);
            const lngDelta = Math.max(0.05, Math.abs(to.longitude - from.longitude) * 1.5);
            return { latitude: lat, longitude: lng, latitudeDelta: latDelta, longitudeDelta: lngDelta };

          case "Processing":
            // Focus around driver and pickup
            const latP = driver ? (driver.latitude + from.latitude) / 2 : from.latitude;
            const lngP = driver ? (driver.longitude + from.longitude) / 2 : from.longitude;
            const latDeltaP = driver ? Math.max(0.05, Math.abs(driver.latitude - from.latitude) * 1.5) : 0.1;
            const lngDeltaP = driver ? Math.max(0.05, Math.abs(driver.longitude - from.longitude) * 1.5) : 0.1;
            return { latitude: latP, longitude: lngP, latitudeDelta: latDeltaP, longitudeDelta: lngDeltaP };

          case "Ongoing":
            // Focus around driver and destination
            const latO = driver ? (driver.latitude + to.latitude) / 2 : (from.latitude + to.latitude) / 2;
            const lngO = driver ? (driver.longitude + to.longitude) / 2 : (from.longitude + to.longitude) / 2;
            const latDeltaO = driver ? Math.max(0.05, Math.abs(driver.latitude - to.latitude) * 1.5) : Math.max(0.05, Math.abs(from.latitude - to.latitude) * 1.5);
            const lngDeltaO = driver ? Math.max(0.05, Math.abs(driver.longitude - to.longitude) * 1.5) : Math.max(0.05, Math.abs(from.longitude - to.longitude) * 1.5);
            return { latitude: latO, longitude: lngO, latitudeDelta: latDeltaO, longitudeDelta: lngDeltaO };

          case "Completed":
            // Focus exactly on destination
            return { latitude: to.latitude, longitude: to.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 };


          default:
            const latD = (from.latitude + to.latitude) / 2;
            const lngD = (from.longitude + to.longitude) / 2;
            const latDeltaD = Math.max(0.05, Math.abs(to.latitude - from.latitude) * 1.5);
            const lngDeltaD = Math.max(0.05, Math.abs(to.longitude - from.longitude) * 1.5);
            return { latitude: latD, longitude: lngD, latitudeDelta: latDeltaD, longitudeDelta: lngDeltaD };

        }
      };

      setRegion(calculateRegion());
      regionSetRef.current = true;
      regionSetRef.currentStatus = ride.status;
    }
  }, [ride, driver]);

  useEffect(() => {
    if (!ride) return;

    const { status, driverId } = ride;

    let message = "";
    let subMessage = "";
    let type = "success";

    switch (status) {
      case "Arrived":
        message = ` ${driverId.name} Arrived!`;
        subMessage = `Driver has arrived at your pickup location. Please share your ride OTP with the driver. Wishing you a happy journey!`;
        break;

      case "Reached":
        message = "Destination Reached!";
        subMessage = `${driverId.name} has successfully reached your destination. Please settle your fare. Thank you for riding with us!`;
        break;

      case "Completed":
        message = "Ride Completed!";
        subMessage = "We hope you enjoyed your ride. Please take a moment to rate your driver and share your feedback. Thank you!";
        break;

      default:
        return; // no modal for other statuses
    }

    setModalMessage(message);
    setModalSubMessage(subMessage);
    setModalType(type);
    setModalVisible(true);
  }, [ride]);


  // ✅ Helpers
  const driverIcon = useMemo(() => getVehicleIcon(driver?.vehicle_type), [driver?.vehicle_type]);

  const handleCall = useCallback(() => {
    if (driver.phone_number || ride.driverId.phone_number) Linking.openURL(`tel:${driver.phone_number ? driver.phone_number : ride.driverId.phone_number}`);
  }, [driver]);

  const handleEmergency = () => Linking.openURL("tel:112");

  const arrivalTime = useMemo(() => {
    if (!ride || !driver) return 0;
    if (ride.status === "Processing") return estimateArrivalFromDriver(driver, ride.currentLocation);
    if (ride.status === "Ongoing") return estimateArrivalFromDriver(driver, ride.destinationLocation);
    return 0;
  }, [ride, driver]);


  useEffect(() => {
    if (!ride || !driver) return;
    if (ride.status !== "Ongoing") return;

    updateRemainingDistance(driver, ride);

  }, [driver]);

  const throttle = (func, delay) => {
    let lastCall = 0;
    return (...args) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func(...args);
      }
    };
  };

  const updateRemainingDistance = useRef(
    throttle(async (driver, ride) => {
      const dist = await calculateDistance(
        driver.latitude,
        driver.longitude,
        ride.destinationLocation.latitude,
        ride.destinationLocation.longitude
      );
      setRemainingDistance(dist.toFixed(1));
    }, 3000)
  ).current;



  // Status badge color based on status 
  const getStatusBadgeStyle = () => {
    switch (ride?.status || "Booked") {
      case "Booked":
        return { backgroundColor: "#FFF8E1", color: "#F57C00" }; // Orange
      case "Processing":
        return { backgroundColor: "#E3F2FD", color: "#1976D2" }; // Blue
      case "Arrived":
        return { backgroundColor: "#FFE0B2", color: "#F57C00" }; // Light Orange
      case "Ongoing":
        return { backgroundColor: "#E8F5E9", color: "#388E3C" }; // Green
      case "Reached":
        return { backgroundColor: "#D1C4E9", color: "#673AB7" }; // Purple
      case "Completed":
        return { backgroundColor: "#F3E5F5", color: "#8E24AA" }; // Purple
      case "Cancelled":
        return { backgroundColor: "#FFF8E1", color: "#F57C00" }; // Orange
      default:
        return { backgroundColor: "#E3F2FD", color: "#1976D2" }; // Default Blue
    }
  };


  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    confirmText: "OK",
    showCancel: false,
    onConfirm: () => setShowAlert(false),
    onCancel: () => setShowAlert(false),
  });

  // Temporary holder for cancellation prompt
  let pendingCancelMessage = "";

  // ⭐ Async confirm helper
  const confirmAction = () =>
    new Promise((resolve) => {
      setAlertConfig({
        title: "Confirm Cancellation",
        message: pendingCancelMessage,
        confirmText: "Yes",
        showCancel: true,
        onCancel: () => {
          setShowAlert(false);
          resolve(false);
        },
        onConfirm: () => {
          setShowAlert(false);
          resolve(true);
        },
      });
      setShowAlert(true);
    });

  // ⭐ MAIN FUNCTION
  const handleCancelRide = async () => {
    if (!ride) return;

    setIsCancelling(true)
    sendPushNotification(
      ride?.driverId?.notificationToken,
      "Ride Cancellation Attempt",
      `User trying to cancel the ride from ${ride.currentLocationName}.`
    );

    sendPushNotification(
      ride?.userId?.notificationToken,
      "Ride Cancellation Attempt",
      `You are trying to cancel the ride from ${ride.currentLocationName}.`
    );

    let fineAmount = 0;
    let fare = { totalFare: 0, driverEarnings: 0, platformShare: 0 };
    let distanceTravelled = 0;
    let cancelledLocationName = ride.currentLocationName;
    let finalMessage = "";

    // SWITCH CASE — SAME AS ORIGINAL
    switch (ride.status) {
      case "Booked":
      case "Processing": {
        pendingCancelMessage = "Are you sure you want to cancel this ride?";
        finalMessage = `Ride from ${ride.currentLocationName} got cancelled.`;
        break;
      }

      case "Arrived": {
        if (ride.totalFare <= 200) fineAmount = 100;
        else if (ride.totalFare <= 500) fineAmount = 150;
        else fineAmount = 200;

        fare = {
          totalFare: fineAmount,
          driverEarnings: fineAmount,
          platformShare: 0,
        };

        pendingCancelMessage = `Driver has arrived. Cancelling now will charge ₹${fineAmount} as compensation.`;
        finalMessage = `Driver compensated ₹${fineAmount} for arrival and waiting time.`;
        break;
      }

      case "Ongoing": {
        const district = await getDistrict(
          ride.currentLocation.latitude,
          ride.currentLocation.longitude
        );

        const cancelledRes = await axios.get(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${driver.latitude},${driver.longitude}&key=${process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY}`
        );

        cancelledLocationName =
          cancelledRes?.data?.results?.[0]?.formatted_address ||
          "Cancelled Location";

        distanceTravelled = await calculateDistance(
          ride.currentLocation.latitude,
          ride.currentLocation.longitude,
          driver.latitude,
          driver.longitude
        );

        const farePayload = {
          driver: ride.driverId,
          distance: distanceTravelled,
          district: district || "Default",
        };

        const calcFare = await calculateFare(farePayload);
        fare = calcFare;

        pendingCancelMessage = `You are midway. Cancelling will charge ₹${calcFare.totalFare}.`;
        finalMessage = `Partial fare charged: ₹${calcFare.totalFare}.`;
        break;
      }

      default:
        Toast.show("Cannot cancel this ride at this stage.", { type: "danger" });
        return;
    }

    // ⭐ REPLACED Alert.alert WITH CUSTOM MODAL
    const userConfirmed = await confirmAction();
    if (!userConfirmed) {
      setIsCancelling(false)
      return;
    }

    // CALL BACKEND
    const response = await axiosInstance.put("/ride/cancel", {
      rideId: ride.id,
      fare,
      distanceTravelled:
        ride.status === "Ongoing" ? distanceTravelled : 0,
      location:
        ride.status === "Ongoing"
          ? { latitude: driver.latitude, longitude: driver.longitude }
          : ride.currentLocation,
      cancelledLocationName,
    });

    sendPushNotification(
      ride?.driverId?.notificationToken,
      "Ride Cancelled",
      finalMessage
    );

    sendPushNotification(
      ride?.userId?.notificationToken,
      "Ride Cancelled",
      finalMessage
    );

    setRide(response.data.updatedRide);
    Toast.show("Ride cancelled successfully.", { type: "success" });

    socketService.send({
      type: "rideStatusUpdate",
      role: "user",
      rideData: {
        id: ride.id,
        user: { id: ride.userId._id },
        driver: { id: ride.driverId._id },
      },
      status: response.data.updatedRide.status,
    });

    setIsCancelling(false)
  };



  const handleDriverRatings = async () => {
    try {
      // Validation
      if (!rating) {
        setAlertConfig({
          title: "Rating Required",
          message: "Please select a star rating before submitting.",
          confirmText: "OK",
          showCancel: false,
          onCancel: () => setShowAlert(false),
          onConfirm: () => setShowAlert(false),
        });
        setShowAlert(true);
        return;
      }

      setIsSubmitting(true)
      const id = JSON.parse(rideId);

      const payload = {
        rating,
        rideId: id,
      };

      const response = await axiosInstance.put(
        "/ride/rating-driver",
        payload
      );

      if (response.status === 200 || response.status === 201) {

        // Notify driver
        sendPushNotification(
          ride?.driverId?.notificationToken,
          "You Received a New Rating ⭐",
          `${ride?.userId?.name || "A user"} rated you ${rating} star${rating > 1 ? "s" : ""} for the recent ride from ${ride?.currentLocationName} to ${ride?.destinationLocationName}.`
        );

        // 🎉 CUSTOM THANK YOU POPUP
        setAlertConfig({
          title: "Thank You!",
          message: "Your rating has been submitted successfully.",
          confirmText: "OK",
          showCancel: false,
          onConfirm: () => setShowAlert(false),
        });
        setShowAlert(true);

        // Update ride
        setRide(response.data.updatedRide);
        setSubmitted(true);

      } else {
        setAlertConfig({
          title: "Error",
          message: "Failed to submit rating. Please try again later.",
          confirmText: "OK",
          showCancel: false,
          onConfirm: () => setShowAlert(false),
        });
        setShowAlert(true);
      }

    } catch (error) {
      console.log("❌ Error submitting rating:", error);

      setAlertConfig({
        title: "Error",
        message: "Something went wrong. Please try again later.",
        confirmText: "OK",
        showCancel: false,
        onConfirm: () => setShowAlert(false),
      });
      setShowAlert(true);
    } finally {
      setIsSubmitting(false)
    }
  };




  const statusBadgeStyle = getStatusBadgeStyle();
  const statusBadgeText = {
    Booked: "Ride Confirmed",
    Processing: "Waiting for Pickup",
    Arrived: "Driver Arrived",
    Ongoing: "Trip Ongoing",
    Reached: "Destination Reached",
    Completed: "Trip Completed",
    Cancelled: "Cancelled",
  };

  const footerMessages = {
    Booked: "Your ride is booked.",
    Processing: "Your driver is on the way. Please be ready at the pickup location.",
    Arrived: "Your driver has arrived. Share your ride OTP to start the trip.",
    Ongoing: "Your trip is in progress. Enjoy your ride!",
    Reached: "You have reached your destination. Please pay your driver.",
    Completed: "Thank you for riding with us. Rate your experience!",
    Cancelled: "Your ride has been cancelled!.",
  };

  const markerIcon = Images.mapMarker

  const strokeColor = Platform.select({
    ios: color.primaryGray,   // light gray for iOS
    android: color.primaryGray, // same gray, but Android renders differently
  });

  const lineDash = Platform.select({
    ios: [0, 0],     // forces solid line on iOS
    android: undefined, // Android doesn't need it for solid
  });

  // ✅ UI
  if (loading) {
    return (
      <RideDetailsSkeleton />
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>{error}</Text>
      </View>
    );
  }

  if (!ride) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>Ride not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ========== MAP SECTION ========== */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={region}
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          customMapStyle={customMapStyle}
          showsMyLocationButton={false}
          pitchEnabled={false}
          rotateEnabled={false}
        >
          {/* Driver Marker (only before completion or cancellation) */}
          {driverLocation &&
            ride.status !== "Completed" &&
            ride.status !== "Cancelled" && (
              <Marker.Animated
                coordinate={driverLocation}
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <Image
                  source={driverIcon}
                  style={{
                    width: windowWidth(35),
                    height: windowHeight(35),
                    resizeMode: "contain",
                    transform: [
                      {
                        rotate: `${driver?.vehicle_type === "Auto"
                          ? driverHeading + 180
                          : driverHeading
                          }deg`,
                      },
                    ],
                  }}
                />
              </Marker.Animated>
            )}

          {/* Pickup & Drop Markers */}
          {ride.status != "Completed"
            && (
              <>
                {/* Pickup Marker */}
                <Marker
                  coordinate={ride.currentLocation}
                  title={`Pickup : ${ride.currentLocationName}`}
                  zIndex={1000}
                >
                  <Image
                    source={Images.mapPickupMarker}
                    style={{ width: windowWidth(35), height: windowHeight(35), tintColor: color.primaryGray }}
                    resizeMode="contain"
                  />
                </Marker>

                {/* Drop Marker */}
                <Marker
                  coordinate={ride.destinationLocation}
                  title={`Drop : ${ride.destinationLocationName}`}
                  zIndex={1000}                >
                  <Image
                    source={Images.mapDropMarker}
                    style={{ width: windowWidth(35), height: windowHeight(35), tintColor: color.primaryGray }}
                    resizeMode="contain"
                  />
                </Marker>
              </>
            )}

          {/* Completed marker */}
          {ride.status === "Completed" && (
            <Marker coordinate={ride.destinationLocation}>
              <View style={styles.completedMarker}>
                <Text style={styles.completedMarkerText}>✓</Text>
              </View>
            </Marker>
          )}

          {/* Route Directions */}
          {(ride.status === "Processing" || ride.status === "Arrived") &&
            driverLocation && (
              <MapViewDirections
                origin={{
                  latitude: driver.latitude,
                  longitude: driver.longitude,
                }}
                destination={ride.currentLocation}
                apikey={process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY}
                strokeWidth={4}
                strokeColor={strokeColor}
                lineCap="round"
                lineJoin="round"
                optimizeWaypoints
                mode="DRIVING"
                precision="high"
                lineDashPattern={lineDash}
              />
            )}

          {(ride.status === "Ongoing" || ride.status === "Reached") &&
            driverLocation && (
              <MapViewDirections
                origin={{
                  latitude: driver.latitude,
                  longitude: driver.longitude,
                }}
                destination={ride.destinationLocation}
                apikey={process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY}
                strokeWidth={4}
                strokeColor={strokeColor}
                lineCap="round"
                lineJoin="round"
                optimizeWaypoints
                mode="DRIVING"
                precision="high"
                lineDashPattern={lineDash}
              />
            )}

          {(ride.status === "Booked" || ride.status === "Cancelled") && (
            <MapViewDirections
              origin={ride.currentLocation}
              destination={ride.destinationLocation}
              apikey={process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY}
              strokeWidth={4}
              strokeColor={strokeColor}
              lineCap="round"
              lineJoin="round"
              optimizeWaypoints
              mode="DRIVING"
              precision="high"
              lineDashPattern={lineDash}
            />
          )}
        </MapView>
      </View>

      {/* ========== DETAILS SECTION ========== */}
      <View style={styles.cardWrapper}>
        {/* Handle Bar for Bottom Sheet feel */}
        <View style={styles.cardHandle} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* --- HEADER: Title & Status --- */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>Ride Details</Text>
              <Text style={styles.headerSubtitle}>{ride?.distance} Km • Trip ID : {ride?.id?.slice(-6)}</Text>
            </View>

            <View style={[styles.statusBadge, { backgroundColor: statusBadgeStyle.backgroundColor }]}>
              <Text style={[styles.statusText, { color: statusBadgeStyle.color }]}>
                {statusBadgeText[ride?.status] || "Booked"}
              </Text>
            </View>
          </View>

          {/* --- HERO SECTION: Driver & Vehicle Card --- */}
          <View style={styles.cardContainer}>
            <View style={styles.driverRow}>
              <Image
                source={{
                  uri: driver?.profilePic || ride.driverId?.profilePic || getAvatar(ride?.driverId?.gender),
                }}
                style={styles.driverAvatarLarge}
              />
              <View style={styles.driverContent}>
                <Text style={styles.driverName}>
                  {driver?.name || ride.driverId?.name || "Driver assigning..."}
                </Text>

                <View style={styles.ratingPill}>
                  <MaterialIcons name="star" size={14} color="#FFC107" />
                  <Text style={styles.ratingText}>
                    {driver?.rating || ride.driverId?.ratings || "New"}
                  </Text>
                  <Text style={styles.dotSeparator}>•</Text>
                  <Text style={styles.tripCountText}>{ride?.driverId?.totalRides || 0} Trips</Text>
                </View>
              </View>
            </View>

            <View style={styles.vehicleFooter}>
              <View style={styles.vehicleInfoItem}>
                {/* <Ionicons name="car-sport-outline" size={16} color={color.primaryGray} /> */}
                <Text style={styles.vehicleText}>
                  {driver?.vehicle_type || ride.driverId?.vehicle_type || "-"}
                </Text>
              </View>
              <View style={styles.verticalDivider} />
              <View style={styles.vehicleInfoItem}>
                <Text style={[styles.vehicleText, { fontFamily: "TT-Octosquares-Medium" }]}>
                  {driver?.registration_number || ride.driverId?.registration_number || "-"}
                </Text>
              </View>
              <View style={styles.verticalDivider} />
              <View style={styles.vehicleInfoItem}>
                {/* <View style={[styles.colorDot, { backgroundColor: (driver?.vehicle_color || ride.driverId?.vehicle_color ||  "gray").toLowerCase() }]} /> */}
                <Text style={styles.vehicleText}>
                  {driver?.vehicle_color || ride.driverId?.vehicle_color || "-"}
                </Text>
              </View>
            </View>
          </View>

          {/* --- OTP & ARRIVAL HIGHLIGHT --- */}
          {(ride.status === "Arrived" || ride.status === "Processing" || ride.status === "Ongoing") && (
            <View style={styles.infoHighlightRow}>
              {ride.status === "Arrived" && (
                <View style={styles.otpBox}>
                  <Text style={styles.otpLabel}>START OTP</Text>
                  <Text style={styles.otpNumber}>{ride.otp}</Text>
                </View>
              )}

              {(ride.status === "Processing" || ride.status === "Ongoing") && (
                <View style={styles.etaBox}>
                  <Text style={styles.etaLabel}>{ride.status === "Processing" ? "Driver Arrives in" : "Reach Destination in"}</Text>
                  <Text style={styles.etaTime}>{arrivalTime}</Text>
                </View>
              )}
            </View>
          )}

          {/* --- ROUTE TIMELINE --- */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeaderLabel}>ROUTE</Text>

            <View style={styles.timelineContainer}>
              {/* The Connector Line */}
              <View style={styles.timelineLine} />

              {/* Pickup */}
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, styles.dotPickup]} />
                <View style={styles.timelineContent}>
                  <Text style={styles.addressLabel}>Pickup</Text>
                  <Text style={styles.addressValue} numberOfLines={2}>{ride.currentLocationName || "Current Location"}</Text>
                </View>
              </View>

              {/* Drop */}
              <View style={[styles.timelineItem, { marginTop: 24 }]}>
                <View style={[styles.timelineDot, styles.dotDrop]} />
                <View style={styles.timelineContent}>
                  <Text style={styles.addressLabel}>Drop-off</Text>
                  <Text style={styles.addressValue} numberOfLines={2}>{ride.destinationLocationName || "Destination"}</Text>
                </View>
              </View>
            </View>

            {/* Remaining Distance (Conditional) */}
            {ride.status === "Ongoing" && (
              <View style={styles.miniStatusRow}>
                <MaterialIcons name="near-me" size={16} color={color.primary} />
                <Text style={styles.miniStatusText}>{remainingDistance} km remaining</Text>
              </View>
            )}
          </View>


          {/* --- FARE BREAKDOWN --- */}
          <View style={styles.sectionContainer}>
            <View style={styles.fareTotalRow}>
              <Text style={styles.fareTotalLabel}>Total Estimate</Text>
              <Text style={styles.fareTotalValue}>₹{ride.totalFare}</Text>
            </View>
          </View>

          {/* --- CANCELLATION INFO (Conditional) --- */}
          {ride.status === "Cancelled" && ride.cancelDetails && (
            <View style={[styles.cardContainer, { borderColor: '#ffebee' }]}>
              <Text style={[styles.sectionHeaderLabel, { color: 'red', marginBottom: 10 }]}>CANCELLATION RECEIPT</Text>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Time</Text>
                <Text style={styles.detailValue}>{new Date(ride.cancelDetails.cancelledAt).toLocaleTimeString()}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue} numberOfLines={1}>{ride.cancelDetails.cancelledLocationName}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Charge</Text>
                <Text style={[styles.detailValue, { color: 'red' }]}>₹ {ride.cancelDetails.totalFare}</Text>
              </View>
            </View>
          )}

          {/* --- RATINGS SECTION (Conditional) --- */}
          {/* --- RATINGS SECTION --- */}
          {ride.status === "Completed" && (
            <View style={styles.ratingSectionWrapper}>

              {ride.rating ? (
                /* --- STATE 1: RATING SUMMARY (Completed) --- */
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryTitle}>Ride Scorecard</Text>

                  <View style={styles.statsRow}>
                    {/* 1. Rating YOU gave the Driver (driverRating) */}
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>
                        {(ride.driverRating || 0).toFixed(1)}
                      </Text>
                      <Text style={styles.statLabel}>You Rated</Text>
                    </View>

                    <View style={styles.verticalLine} />

                    {/* 2. Rating YOU received from Driver (userRating) */}
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>
                        {(ride.userRating || 0).toFixed(1)}
                      </Text>
                      <Text style={styles.statLabel}>You Received</Text>
                    </View>

                    <View style={styles.verticalLine} />

                    {/* 3. Overall Trip Rating */}
                    <View style={styles.statItem}>
                      <Text style={[styles.statValue, { color: '#FFC107' }]}>
                        {(ride.rating || 0).toFixed(1)}
                      </Text>
                      <Text style={styles.statLabel}>Overall</Text>
                    </View>
                  </View>
                </View>

              ) : (
                !ride.driverRating && (
                  /* --- STATE 2: RATING INPUT (Active) --- */
                  <View style={styles.ratingInputCard}>

                    {/* Context Header */}
                    <View style={styles.ratingHeader}>
                      <Image
                        source={{ uri: driver?.profilePic || ride.driverId?.profilePic || getAvatar(ride?.driverId?.gender) }}
                        style={styles.ratingAvatar}
                      />
                      <View>
                        <Text style={styles.ratingTitle}>Rate {driver?.name?.split(' ')[0] || "Driver"}</Text>
                        <Text style={styles.ratingSubtitle}>
                          {rating > 0 ? ["Terrible", "Bad", "Okay", "Good", "Excellent"][rating - 1] : "How was your trip?"}
                        </Text>
                      </View>
                    </View>

                    {/* Star Interactive Area */}
                    <View style={styles.starContainerLarge}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <TouchableOpacity
                          key={star}
                          onPress={() => setRating(star)}
                          activeOpacity={0.7}
                          disabled={submitted}
                        >
                          <Animated.View style={{ transform: [{ scale: star === rating ? 1.1 : 1 }] }}>
                            <MaterialIcons
                              name={star <= rating ? "star" : "star-border"}
                              size={38}
                              color={star <= rating ? "#FFC107" : "#E0E0E0"} // Golden vs Gray
                              style={{ marginHorizontal: 8 }}
                            />
                          </Animated.View>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* Submit Button */}
                    {!submitted && (
                      <TouchableOpacity
                        onPress={handleDriverRatings}
                        disabled={isSubmitting || rating === 0}
                        style={[
                          styles.submitRatingBtn,
                          rating === 0 && styles.submitRatingBtnDisabled // Gray out if no stars selected
                        ]}
                      >
                        {isSubmitting ? (
                          <ActivityIndicator color="#fff" size="small" />
                        ) : (
                          <Text style={styles.submitRatingText}>Submit Review</Text>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                )
              )}
            </View>
          )}

          {/* --- ACTION BUTTONS --- */}
          {ride.status !== "Cancelled" && (
            <View style={styles.actionGrid}>
              {ride.status !== "Completed" ? (
                <>
                  {(ride.status === "Booked" || ride.status === "Processing" || ride.status === "Arrived" || ride.status === "Ongoing") && (
                    <TouchableOpacity
                      onPress={handleCancelRide}
                      disabled={isCancelling}
                      style={[styles.actionBtn, styles.btnOutline]}
                    >
                      {isCancelling ? <ActivityIndicator size="small" color={color.primaryText} /> : (
                        <Text style={styles.btnTextOutline}>{ride.status === "Ongoing" ? "End Trip" : "Cancel"}</Text>
                      )}
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity onPress={handleCall} style={[styles.actionBtn, styles.btnPrimary]}>
                    {/* <Ionicons name="call" size={18} color={color.primary} style={{ marginRight: 8 }} /> */}
                    <Text style={styles.btnTextPrimary}>Call Driver</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => router.push('/(routes)/profile/help-support')}
                    style={[styles.actionBtn, styles.btnDanger]}
                  >
                    <MaterialIcons name="sos" size={18} color={color.primaryText} />
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  onPress={() => router.push('/(routes)/profile/help-support')}
                  style={[styles.actionBtn, styles.btnOutline, { width: '100%' }]}
                >
                  <Text style={styles.btnTextOutline}>Get Help with this Ride</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <Text style={styles.footerNote}>
            {footerMessages[ride.status] || "Safe travels with our secure ride system."}
          </Text>

        </ScrollView>
      </View>

      {/* ========== MODAL SECTION ========== */}
      {modalType && modalVisible && modalMessage && modalSubMessage && (
        <FooterModal
          isVisible={modalVisible}
          type={modalType}
          title={modalMessage}
          subText={modalSubMessage}
          onHide={() => setModalVisible(false)}
        />
      )}

      <AppAlert
        visible={showAlert}
        title={alertConfig.title}
        message={alertConfig.message}
        confirmText={alertConfig.confirmText}
        showCancel={alertConfig.showCancel}
        onCancel={alertConfig.onCancel}
        onConfirm={alertConfig.onConfirm}
      />

    </View>
  );

}



// --- Design System Constants ---
const PADDING_HORIZONTAL = windowWidth(24);
const FONT_REGULAR = "TT-Octosquares-Medium"; // Use a regular font for body text
const FONT_MEDIUM = "TT-Octosquares-Medium"; // Use a medium font for titles and values
const COLOR_PRIMARY = "#1976D2"; // Brand Blue - for active elements/call to action
const COLOR_SECONDARY = "#4CAF50"; // Green - for completed/success
const COLOR_ACCENT = "#FFC107"; // Yellow/Amber - for rating and high-attention (like OTP)
const COLOR_DANGER = '#D32F2F'; // Red - for emergency
const PRIMARY_COLOR = color.buttonBg; // Your main brand color
const SECONDARY_TEXT = '#5F6368'; // Muted text for labels
const HEADING_TEXT = '#202124'; // Dark text for titles and values
const CARD_BG = '#F7F8FA'; // Subtle background for card elements
const SEPARATOR_COLOR = '#EAEAEA'; // Light divider color

const styles = StyleSheet.create({
  completedMarker: {

    backgroundColor: color.primary,

    width: 36,

    height: 36,

    borderRadius: 18,

    justifyContent: 'center',

    alignItems: 'center',

    borderWidth: 3,

    borderColor: color.border,

  },

  completedMarkerText: {

    color: color.primaryText,

    fontSize: 20,

    fontFamily: FONT_MEDIUM,

  },

  centered: {
    flex: 1,
    justifyContent: "center",  // centers vertically
    alignItems: "center",       // centers horizontally
  },
  loadingText: {
    color: 'grey',
    fontSize: 18,
    fontFamily: FONT_REGULAR,  // 👈 custom font
    textAlign: "center",
    letterSpacing: 1,                     // makes it more clean
  },
  container: {
    flex: 1,
    backgroundColor: color.bgDark,
  },
  mapContainer: {
    // Keep map large and prominent
    height: windowHeight(450),
  },
  map: {
    flex: 1,
  },
  cardWrapper: {
    flex: 1,
    marginTop: -40,
    backgroundColor: color.subPrimary, // Assuming this is white or very light
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 12,
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 15,
  },
  cardHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 20,
  },
  scrollContent: {
    paddingBottom: 50,
  },

  // --- Header ---
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerTitle: {
    fontFamily: 'TT-Octosquares-Medium',
    fontSize: fontSizes.FONT20,
    color: color.primaryText,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontFamily: FONT_REGULAR,
    fontSize: fontSizes.FONT12,
    color: color.primaryGray,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontFamily: FONT_MEDIUM,
    fontSize: fontSizes.FONT11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // --- Driver Card (Premium Box) ---
  cardContainer: {
    // backgroundColor: '#fff', // Or slightly lighter than background
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.05,
    // shadowRadius: 10,
    // elevation: 3,
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  driverAvatarLarge: {
    width: 56,
    height: 56,
    borderRadius: 20, // Squircle shape
    marginRight: 16,
    backgroundColor: '#f0f0f0',
  },
  driverContent: {
    flex: 1,
  },
  driverName: {
    fontFamily: 'TT-Octosquares-Medium',
    fontSize: 17,
    color: color.primaryText,
    marginBottom: 6,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1', // Very light yellow
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontFamily: FONT_MEDIUM,
    fontSize: 12,
    color: '#FFA000',
    marginLeft: 4,
  },
  dotSeparator: {
    marginHorizontal: 6,
    color: '#FFD54F',
  },
  tripCountText: {
    fontFamily: FONT_REGULAR,
    fontSize: 11,
    color: '#FFA000',
  },

  // --- Vehicle Footer inside Card ---
  vehicleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  vehicleInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  vehicleText: {
    fontFamily: FONT_MEDIUM,
    fontSize: 13,
    color: color.primaryText,
    textTransform: 'capitalize',
  },
  verticalDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#E0E0E0',
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },

  // --- OTP & Highlights ---
  infoHighlightRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  otpBox: {
    flex: 1,
    backgroundColor: '#E3F2FD', // Light Blue
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpLabel: {
    fontSize: 10,
    color: color.primary,
    fontFamily: FONT_MEDIUM,
    letterSpacing: 1,
    marginBottom: 4,
  },
  otpNumber: {
    fontSize: 24,
    fontFamily: 'TT-Octosquares-Medium',
    color: color.primary,
    letterSpacing: 2,
  },
  etaBox: {
    flex: 1.5,
    backgroundColor: '#E3F2FD', // Light Blue
    borderColor: color.primaryGray,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'center',
    borderWidth: 1
  },
  etaLabel: {
    fontSize: 10,
    color: color.primary,
    fontFamily: FONT_MEDIUM,
    letterSpacing: 1,
    marginBottom: 4,
  },
  etaTime: {
    fontSize: 16,
    fontFamily: 'TT-Octosquares-Medium',
    color: color.primary,
    letterSpacing: 2,
  },

  // --- Route Timeline ---
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeaderLabel: {
    fontSize: 11,
    color: color.primaryGray,
    fontFamily: FONT_MEDIUM,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  timelineContainer: {
    position: 'relative',
    paddingLeft: 10,
  },
  timelineLine: {
    position: 'absolute',
    left: 17, // Center of dots
    top: 15,
    bottom: 25,
    width: 2,
    backgroundColor: '#E0E0E0',
    zIndex: -1,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    backgroundColor: '#fff',
    marginRight: 16,
    marginTop: 2, // Align with text cap height
  },
  dotPickup: {
    borderColor: color.primary, // Or green
  },
  dotDrop: {
    borderColor: '#F44336', // Or red/destination color
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 4,
  },
  addressLabel: {
    fontSize: 11,
    color: color.primaryGray,
    marginBottom: 2,
    fontFamily: FONT_REGULAR,
  },
  addressValue: {
    fontSize: 15,
    color: color.primaryText,
    fontFamily: FONT_MEDIUM,
    lineHeight: 20,
  },
  miniStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: '#F0F8FF',
    padding: 8,
    borderRadius: 8,
    alignSelf: 'flex-start'
  },
  miniStatusText: {
    marginLeft: 6,
    fontSize: 12,
    color: color.primary,
    fontFamily: FONT_MEDIUM
  },

  // --- Financials ---
  fareTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  fareTotalLabel: {
    fontSize: 16,
    fontFamily: 'TT-Octosquares-Medium',
    color: color.primaryText,
  },
  fareTotalValue: {
    fontSize: 20,
    fontFamily: 'TT-Octosquares-Medium',
    color: color.primaryText,
  },

  // --- Cancellation Details ---
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 13,
    color: color.primaryGray,
    fontFamily: FONT_REGULAR,
  },
  detailValue: {
    fontSize: 13,
    color: color.primaryText,
    fontFamily: FONT_MEDIUM,
    maxWidth: '60%',
    textAlign: 'right'
  },
  // --- Rating Section Wrapper ---
  ratingSectionWrapper: {
    marginTop: 10,
    marginBottom: 24,
  },

  // --- STATE 1: Summary Card (The Scorecard) ---
  summaryCard: {
    // backgroundColor: '#FAFAFA', // Very light gray, distinct from white background
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  summaryTitle: {
    fontFamily: 'TT-Octosquares-Medium',
    fontSize: 14,
    color: color.primaryGray,
    marginBottom: 16,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: color.primary, // Brand color
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    shadowColor: color.primary,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  statValue: {
    fontFamily: 'TT-Octosquares-Medium',
    fontSize: 18,
    color: color.primaryText,
    marginBottom: 2,
  },
  statLabel: {
    fontFamily: FONT_REGULAR,
    fontSize: 11,
    color: color.lightGray,
  },
  verticalLine: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
  },
  starsRowSmall: {
    flexDirection: 'row',
    marginBottom: 4,
  },

  // --- STATE 2: Input Card (The Interaction) ---
  ratingInputCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08, // Very soft shadow
    shadowRadius: 20,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  ratingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  ratingAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  ratingTitle: {
    fontFamily: 'TT-Octosquares-Medium',
    fontSize: 18,
    color: color.primary,
  },
  ratingSubtitle: {
    fontFamily: FONT_MEDIUM,
    fontSize: 13,
    color: color.primary, // Highlight the feedback text (e.g., "Excellent")
    marginTop: 2,
  },
  starContainerLarge: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA', // Subtle backing for stars
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 20,
  },
  submitRatingBtn: {
    backgroundColor: color.bgDark, // Solid black or dark brand color
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: color.primaryText,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitRatingBtnDisabled: {
    backgroundColor: color.subPrimary, // Solid black or dark brand color
    shadowOpacity: 0,
    elevation: 0,
  },
  submitRatingText: {
    color: '#fff',
    fontFamily: 'TT-Octosquares-Medium',
    fontSize: 15,
    letterSpacing: 0.5,
  },

  // --- Action Buttons ---
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  btnPrimary: {
    backgroundColor: color.buttonBg, // Or primary color
    flex: 2, // Take up more space
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  btnDanger: {
    backgroundColor: '#ef1535ff',
    width: 48,
    flex: 0, // Fixed width
    borderColor: '#ff5c6cff',
    borderWidth: 1,
  },
  btnTextPrimary: {
    color: color.primary,
    fontFamily: FONT_MEDIUM,
    fontSize: 14,
  },
  btnTextOutline: {
    color: color.primaryText,
    fontFamily: FONT_MEDIUM,
    fontSize: 13,
  },
  footerNote: {
    fontFamily: FONT_MEDIUM,
    textAlign: 'center',
    fontSize: 11,
    color: color.lightGray,
    marginTop: 10,
  },
});
