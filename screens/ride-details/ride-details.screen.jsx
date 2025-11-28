import React, { useEffect, useState, useRef, useMemo, useCallback, useDebugValue } from "react";
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Linking, Alert, Platform, ActivityIndicator } from "react-native";
import MapView, { Marker, AnimatedRegion, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { useLocalSearchParams, router } from "expo-router";
import axiosInstance from "@/api/axiosInstance";
import socketService from "@/utils/socket/socketService";
import { styles } from "./styles";
import getVehicleIcon from "@/utils/ride/getVehicleIcon";
import estimateArrivalFromDriver from "@/utils/ride/getEstimatedDriverArrival";
import { Toast } from "react-native-toast-notifications";
import FooterModal from "@/components/modal/alertModal/footerModal/footer-Modal";
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
        }, 2000);
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
    if (!userConfirmed) return;

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
                    width: 35,
                    height: 35,
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
        <View style={styles.cardHandle} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Ride Details</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusBadgeStyle.backgroundColor },
              ]}
            >
              <Text
                style={[styles.statusText, { color: statusBadgeStyle.color }]}
              >
                {statusBadgeText[ride?.status] || "Ride Booked"}
              </Text>
            </View>
          </View>

          {/* Driver Info */}
          <View style={styles.driverSection}>
            <Image
              source={{
                uri:
                  driver?.profilePic ||
                  ride.driverId?.profilePic ||
                  getAvatar(ride?.driverId?.gender),
              }}
              style={styles.driverAvatar}
            />
            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>
                {driver?.name ||
                  ride.driverId?.name ||
                  "Driver not assigned"}
              </Text>

              <View
                style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}
              >
                <Text style={[styles.driverRating, { color: "#FFC107", marginRight: 8 }]}>
                  {renderStars(driver?.rating || ride.driverId?.ratings || 0)}
                </Text>
                <Text style={styles.driverRating}>
                  {" "}•{" "}
                </Text>
                <Text style={styles.driverRating}>
                  Total Trips: {ride?.driverId?.totalRides}
                </Text>
              </View>

              <Text style={styles.driverVehicle}>
                {driver?.vehicle_type || ride.driverId?.vehicle_type || "-"} •{" "}
                {driver?.vehicle_color || ride.driverId?.vehicle_color || "-"} •{" "}
                {driver?.registration_number || ride.driverId?.registration_number || "-"}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Trip Info */}
          <View style={styles.tripInfoContainer}>
            {/* Pickup Row */}
            <View style={styles.tripInfoRow}>
              <View style={styles.tripInfoIcon}>
                <Text style={styles.tripInfoIconText}>📍</Text>
              </View>
              <View style={styles.tripInfoTextContainer}>
                <Text style={styles.tripInfoLabel}>Pickup Location</Text>
                <Text style={styles.tripInfoValue} numberOfLines={2}>
                  {ride.currentLocationName || "Current location"}
                </Text>
              </View>
            </View>

            {/* Connector line */}
            <View
              style={{
                position: "absolute",
                left: windowWidth(24) + 15,
                top: 38,
                bottom: 38,
                width: 2,
                backgroundColor: "#e0e0e0",
              }}
            />

            {/* Drop Row */}
            <View style={styles.tripInfoRow}>
              <View style={styles.tripInfoIcon}>
                <Text style={styles.tripInfoIconText}>🏁</Text>
              </View>
              <View style={styles.tripInfoTextContainer}>
                <Text style={styles.tripInfoLabel}>Drop Location</Text>
                <Text style={styles.tripInfoValue} numberOfLines={2}>
                  {ride.destinationLocationName || "Destination"}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Fare Info */}
          {/* Fare Info */}
          <View style={styles.fareContainer}>
            {ride.status === "Arrived" && (
              <View style={styles.fareRow}>
                <Text style={styles.fareLabel}>OTP</Text>
                <Text style={[styles.fareValue, styles.otpValue]}>
                  {ride.otp}
                </Text>
              </View>
            )}

            {/* Always show total fare */}
            <View style={styles.fareRow}>
              <Text style={styles.fareLabel}>Total Fare</Text>
              <Text style={styles.fareValue}>₹ {ride.totalFare}</Text>
            </View>

            {/* If ongoing or processing, show arrival estimate */}
            {(ride.status === "Processing" || ride.status === "Ongoing") && (
              <View style={styles.fareRow}>
                <Text style={styles.fareLabel}>
                  {ride.status === "Processing"
                    ? "Estimated Driver Arrival"
                    : "Estimated Time to Reach"}
                </Text>
                <Text style={styles.fareValue}>{arrivalTime}</Text>
              </View>
            )}

            <View style={styles.fareRow}>
              <Text style={styles.fareLabel}>Planned Distance</Text>
              <Text style={styles.fareValue}>{ride.distance} Km</Text>
            </View>

            {/* If ongoing , show remaining distance */}
            {(ride.status === "Ongoing") && (
              <View style={styles.fareRow}>
                <Text style={styles.fareLabel}>
                  Remaining Distance
                </Text>
                <Text style={styles.fareValue}>
                  {remainingDistance} Km
                </Text>
              </View>
            )}

            {/* Show Cancellation Details if cancelled */}
            {ride.status === "Cancelled" && ride.cancelDetails && (
              <>
                <View style={styles.divider} />
                <Text style={[styles.sectionTitle, { color: "red", marginBottom: 8 }]}>
                  Cancellation Details
                </Text>


                <View style={styles.detailItem}>
                  <MaterialIcons name={'cancel'} size={20} color={color.primaryGray} />
                  <View style={styles.detailTextContainer}>
                    <Text style={styles.detailLabel}>Cancelled At</Text>
                    <Text style={styles.detailText} numberOfLines={2}>
                      {new Date(ride.cancelDetails.cancelledAt).toLocaleString()
                      }
                    </Text>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <MaterialIcons name={'location-off'} size={20} color={color.primaryGray} />
                  <View style={styles.detailTextContainer}>
                    <Text style={styles.detailLabel}>Cancelled Location</Text>
                    <Text style={styles.detailText} numberOfLines={2}>
                      {`${ride.cancelDetails.cancelledLocationName}`}
                    </Text>
                  </View>
                </View>


                <View style={styles.fareRow}>
                  <Text style={styles.fareLabel}>Travelled Distance</Text>
                  <Text style={styles.fareValue}>
                    {ride.cancelDetails.travelledDistance} km
                  </Text>
                </View>

                <View style={styles.fareRow}>
                  <Text style={styles.fareLabel}>Fare for Travelled Distance</Text>
                  <Text style={styles.fareValue}>₹ {ride.cancelDetails.totalFare}</Text>
                </View>

                <View style={styles.fareRow}>
                  <Text style={styles.fareLabel}>Cancelled By</Text>
                  <Text style={styles.fareValue}>
                    {ride.cancelDetails.cancelledBy === "user" ? "You" : "Driver"}
                  </Text>
                </View>
              </>
            )}
          </View>

          {ride.status === "Completed" && ride.rating && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ratings Summary</Text>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-around",
                  alignItems: "center",
                  marginTop: 12,
                }}
              >
                {/* User → Driver Rating */}
                <View style={{ alignItems: "center" }}>
                  <Ionicons name="person-circle-outline" size={26} color={color.primaryGray} />
                  <Text
                    style={{
                      fontSize: fontSizes.FONT14,
                      color: color.primaryText,
                      fontFamily: "TT-Octosquares-Medium",
                      marginTop: 5,
                    }}
                  >
                    For You
                  </Text>
                  <View style={{ flexDirection: "row", marginTop: 5 }}>
                    {renderStars(ride.userRating || 0)}
                  </View>
                </View>

                {/* Divider */}
                <View
                  style={{
                    height: 50,
                    width: 1,
                    backgroundColor: color.border,
                    opacity: 0.6,
                  }}
                />

                {/* Driver → User Rating */}
                <View style={{ alignItems: "center" }}>
                  <Ionicons name="id-card-outline" size={26} color={color.primaryGray} />
                  <Text
                    style={{
                      fontSize: fontSizes.FONT14,
                      color: color.primaryText,
                      fontFamily: "TT-Octosquares-Medium",
                      marginTop: 5,
                    }}
                  >
                    For Driver
                  </Text>
                  <View style={{ flexDirection: "row", marginTop: 5 }}>
                    {renderStars(ride.driverRating || 0)}

                  </View>
                </View>

                {/* Divider */}
                <View
                  style={{
                    height: 50,
                    width: 1,
                    backgroundColor: color.border,
                    opacity: 0.6,
                  }}
                />

                {/* Overall Ride Rating */}
                <View style={{ alignItems: "center" }}>
                  <Ionicons name="podium-outline" size={26} color={color.primaryGray} />
                  <Text
                    style={{
                      fontSize: fontSizes.FONT14,
                      color: color.primaryText,
                      fontFamily: "TT-Octosquares-Medium",
                      marginTop: 5,
                    }}
                  >
                    Ride Avg
                  </Text>
                  <View style={{ flexDirection: "row", marginTop: 5 }}>
                    {renderStars(ride.rating || 0)}
                  </View>
                </View>
              </View>
            </View>
          )}

          {ride.status === "Completed" && !ride.driverRating && (
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingTitle}>Rate Your Driver</Text>

              <View style={styles.starContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => !ride.driverRating && setRating(star)} // Disable edit if already rated
                    disabled={!!ride.driverRating || submitted} // disable if rated or after submission
                  >
                    <MaterialIcons
                      name={
                        star <= (ride.driverRating || rating)
                          ? "star"
                          : "star-border"
                      }
                      size={25}
                      color={star <= (ride.driverRating || rating) ? "#FFD700" : "#B0B0B0"}
                      style={{ marginHorizontal: 10, marginBottom: 5 }}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {ride.rating || submitted ? (
                <Text style={styles.thankYouText}>
                  Thank you for your feedback!
                </Text>
              ) : (
                <Button
                  onPress={handleDriverRatings}
                  style={[styles.actionButton, styles.supportButton]}
                  title={isSubmitting ? <ActivityIndicator color={color.primary} /> : "Submit Rating"}
                  disabled={isSubmitting}
                />
              )}
            </View>
          )}


          {/* Action Buttons */}
          {ride.status !== "Cancelled" ? (
            <View style={styles.buttonContainer}>
              {ride.status !== "Completed" ? (
                <>
                  {(ride.status === "Booked" ||
                    ride.status === "Processing" ||
                    ride.status === "Arrived" ||
                    ride.status === "Ongoing") && (
                      <TouchableOpacity
                        onPress={handleCancelRide}
                        style={[
                          styles.actionButton,
                          ride.status === "Ongoing"
                            ? styles.midwayCancelButton
                            : styles.cancelButton,
                        ]}
                      >
                        <Text style={styles.actionButtonText}>
                          {ride.status === "Ongoing" ? "Cancel Midway" : "Cancel Ride"}
                        </Text>
                      </TouchableOpacity>
                    )}

                  <TouchableOpacity
                    onPress={handleCall}
                    style={[styles.actionButton, styles.callButton]}
                  >
                    <Text style={styles.actionButtonText}>Call Driver</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => router.push('/(routes)/profile/help-support')}
                    style={[styles.actionButton, styles.emergencyButton]}
                  >
                    <Text style={styles.actionButtonText}>Emergency</Text>
                  </TouchableOpacity>
                </>
              ) : (
                // ✅ When ride is completed
                <>
                  {/* 📞 Contact Support Button */}
                  <Button
                    onPress={() => router.push('/(routes)/profile/help-support')}
                    style={[styles.actionButton, styles.supportButton]}
                    title={"Contact Support"}
                  />

                </>

              )}
            </View>
          ) : null}

          {/* Footer Note */}
          <Text style={styles.footerNote}>
            {footerMessages[ride.status] || "Your ride is booked."}
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


