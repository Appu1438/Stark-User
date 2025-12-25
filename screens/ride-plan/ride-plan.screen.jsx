import {
  View, Text, KeyboardAvoidingView, Platform, TouchableOpacity,
  Dimensions, Pressable, ScrollView,
  ActivityIndicator,
  Image,
  Keyboard,
  BackHandler
} from 'react-native';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { external } from '@/styles/external.style';
import { fontSizes, windowHeight, windowWidth } from '@/themes/app.constant';
import MapView, { AnimatedRegion, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from "react-native-maps-directions";
import { styles } from './styles';
import { router, useFocusEffect } from 'expo-router';
import { Clock, Gps, LeftArrow, PickLocation, RightArrow } from '@/utils/icons';
import color from '@/themes/app.colors';
import PlaceHolder from '@/assets/icons/placeHolder';
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import 'react-native-get-random-values';
import axios from 'axios';
import _ from "lodash";
import * as Location from "expo-location";
import { Toast } from 'react-native-toast-notifications';
import 'react-native-get-random-values';
import { parseDuration } from '@/utils/time/parse.duration';
import moment from "moment";
import Button from '@/components/common/button';
import { Person } from '@/assets/icons/person';
import calculateFare from '@/utils/ride/calculateFare';
import getVehicleIcon from '@/utils/ride/getVehicleIcon';
import getEstimatedArrivalTime from '@/utils/ride/getEstimatedArrival';
import estimateArrivalFromDriver from '@/utils/ride/getEstimatedDriverArrival';
import { useGetUserData } from '@/hooks/useGetUserData';
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import AsyncStorage from '@react-native-async-storage/async-storage';
import socketService from '@/utils/socket/socketService';
import { useDriverStore } from '@/store/driverStore';
import { sendPushNotification } from '@/utils/notifications/sendPushNotification';
import axiosInstance from '@/api/axiosInstance';
import { latitude } from 'geolib';
import { getDistrict } from '@/utils/ride/getDistrict';
import { calculateDistance } from '@/utils/ride/calculateDistance';
import Images from '@/utils/images';
import { customMapStyle } from '@/utils/map/mapStyle';
import fonts from '@/themes/app.fonts';
import RideOptions from '@/components/ride-plan/ride.options';
import RideLocationSelector from '@/components/ride-plan/ride.location';
import RideRoute from '@/components/ride-plan/ride.route';
import SkeletonRidePlan from './ride-plan-skelton.screen';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import AppAlert from '@/components/modal/alert-modal/alert.modal';
import FooterModal from '@/components/modal/footer-modal/footer.modal';
import { checkUserActiveRide } from '@/utils/ride/checkActiveRide';
import { vehicleImages, vehicleNames } from '@/configs/constants';
import { useUserLocationStore } from '@/store/userLocationStore';

export default function RidePlanScreen() {
  const mapRef = useRef(null);
  const fromSearchInputRef = useRef(null);
  const toSearchInputRef = useRef(null);

  const { user } = useGetUserData()


  const [expanded, setExpanded] = useState(false);

  // const [findingLocation, setFindingLocation] = useState();
  const [toggleUserLocation, setToggleUserLocation] = useState(false);
  const [currentLocationName, setCurrentLocationName] = useState("From (Current Location)");
  const [destLocationName, setDestLocationName] = useState("Where to?");
  const [places, setPlaces] = useState([]);
  const [fromPlaces, setFromPlaces] = useState([]);
  const [query, setQuery] = useState("");
  const [fromQuery, setFromQuery] = useState("");
  const [region, setRegion] = useState({
    latitude: 9.4981,
    longitude: 76.3388,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [district, setDistrict] = useState(null);
  const [marker, setMarker] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [locationSelected, setlocationSelected] = useState(false);
  const [selectedVehcile, setselectedVehcile] = useState("");
  const [travelTimes, setTravelTimes] = useState({
    driving: null,
    walking: null,
    bicycling: null,
    transit: null,
  });
  const driverLists = useDriverStore.getState().driverLists;
  const { setDriverLists, updateDriverLocation } = useDriverStore();

  const [driverLoader, setdriverLoader] = useState(true);
  const [watingForBookingResponse, setWaitingForBookingResponse] = useState(false);


  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalSubMessage, setModalSubMessage] = useState("");
  const [modalType, setModalType] = useState("success");

  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    confirmText: "OK",
    cancelText: "Cancel",
    showCancel: false,
    onConfirm: () => setShowAlert(false),
    onCancel: () => setShowAlert(false),
  });


  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (watingForBookingResponse) {
          // Show your custom AppAlert
          setAlertConfig({
            title: "Please Wait",
            message: "We are processing your booking request. Do not exit this screen.",
            confirmText: "OK",
            cancelText: "Exit",
            onConfirm: () => setShowAlert(false),
            onCancel: () => router.back()
          });
          setShowAlert(true);

          return true; // block back press
        }

        // Allow normal back behaviour
        return false;
      };

      if (Platform.OS === "android") {
        const sub = BackHandler.addEventListener("hardwareBackPress", onBackPress);
        return () => sub.remove();
      }
    }, [watingForBookingResponse])
  );

  useEffect(() => {
    const activeDrivers = driverLists.filter(
      d => d.latitude !== null && d.longitude !== null
    );

    if (activeDrivers.length === 0) {
      setWaitingForBookingResponse(false);
    }
  }, [driverLists]);


  //Location Setups
  const {
    userLocation,
    userLocationName,
    userDistrict,
    userRegion,
    findingLocation,
    fetchLocation,
  } = useUserLocationStore();

  useEffect(() => {
    fetchLocation(mapRef, getDistrict);
  }, [toggleUserLocation]);

  useEffect(() => {
    setCurrentLocation(userLocation)
    setCurrentLocationName(userLocationName)
    setRegion(userRegion)
    setDistrict(userDistrict)
  }, [userLocation]);


  //Socket
  useEffect(() => {
    socketService.onNearbyDrivers(async (driversFromSocket) => {
      if (!driversFromSocket || driversFromSocket.length === 0) {
        setDriverLists([]);
        setdriverLoader(false);
        return;
      }

      const driverIds = driversFromSocket.map(d => d.id).join(",");

      try {
        const res = await axiosInstance.get(`/driver/get-drivers-data`, {
          params: { ids: driverIds },
        });

        const dbDrivers = res.data;

        const merged = dbDrivers.map((dbDriver) => {
          const socketDriver = driversFromSocket.find(d => d.id === dbDriver.id);
          return {
            ...dbDriver,
            latitude: socketDriver.current.latitude,
            longitude: socketDriver.current.longitude,
            heading: socketDriver.heading,
            animatedLocation: new AnimatedRegion({
              latitude: socketDriver.current.latitude,
              longitude: socketDriver.current.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }),
          };
        });

        setDriverLists(merged);
        useDriverStore.getState().setDriverLists(merged); // global Zustand store

      } catch (error) {
        console.error("Failed to fetch driver data:", error);
      } finally {
        setdriverLoader(false);
      }
    });

    socketService.onDriverLocationUpdates((updates) => {
      updateDriverLocation(updates);
    });

    return () => {
      socketService.clearListeners();
    };
  }, []);


  useEffect(() => {
    if (!(locationSelected && currentLocation && marker)) return;
    socketService.requestNearbyDrivers(currentLocation);
  }, [locationSelected, currentLocation, marker]); // 👈 react to changes


  const fetchPlaces = async (input) => {
    try {
      const res = await axios.get(`https://maps.googleapis.com/maps/api/place/autocomplete/json`, {
        params: {
          input,
          key: process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY,
          language: "en",
        },
      });
      setPlaces(res.data.predictions);
    } catch (error) {
      console.log(error);
    }
  };

  const debouncedFetchPlaces = useCallback(_.debounce(fetchPlaces, 100), []);
  useEffect(() => {
    if (query && query.length > 2 && query != destLocationName) {
      console.log(query, destLocationName)
      debouncedFetchPlaces(query);
    }
    else {
      setPlaces([]);
    }
  }, [query]);

  const fetchFromPlaces = async (input) => {
    try {
      const res = await axios.get(`https://maps.googleapis.com/maps/api/place/autocomplete/json`, {
        params: {
          input,
          key: process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY,
          language: "en",
        },
      });
      setFromPlaces(res.data.predictions);
    } catch (error) {
      console.log(error);
    }
  };

  const debouncedFetchFromPlaces = useCallback(_.debounce(fetchFromPlaces, 100), []);
  useEffect(() => {
    if (fromQuery && fromQuery.length > 2 && fromQuery != currentLocationName) {
      console.log(fromQuery, currentLocationName)
      debouncedFetchFromPlaces(fromQuery);
    }
    else {
      setFromPlaces([]);
    }

  }, [fromQuery]);

  const handlePlaceSelect = async (placeId, description) => {
    Keyboard.dismiss();
    setDestLocationName(description);
    setQuery(description)
    try {
      // toSearchInputRef.current?.setAddressText(description);

      const res = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json`, {
        params: {
          place_id: placeId,
          key: process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY,
        },
      });
      const { lat, lng } = res.data.result.geometry.location;
      const coords = { latitude: lat, longitude: lng };
      setMarker(coords);
      const newRegion = {
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setRegion(newRegion);
      mapRef.current?.fitToCoordinates([currentLocation, coords], {
        edgePadding: { top: 100, bottom: 100, left: 100, right: 100 },
        animated: true,
      }); setPlaces([]);
      // requestNearbyDrivers()
      setlocationSelected(true);
      if (currentLocation) await fetchTravelTimes(currentLocation, coords);
    } catch (err) {
      console.log(err);
    }
  };

  const handleFromPlaceSelect = async (placeId, description) => {
    Keyboard.dismiss();
    setCurrentLocationName(description);
    setFromQuery(description)
    try {

      // fromSearchInputRef.current?.setAddressText(description);

      const res = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json`, {
        params: {
          place_id: placeId,
          key: process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY,
        },
      });
      const { lat, lng } = res.data.result.geometry.location;
      const coords = { latitude: lat, longitude: lng };
      getDistrict(lat, lng, setDistrict)
      setCurrentLocation(coords);
      const newRegion = {
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 1000);
      setFromPlaces([]);
      if (marker) {
        mapRef.current?.fitToCoordinates([currentLocation, marker], {
          edgePadding: { top: 100, bottom: 100, left: 100, right: 100 },
          animated: true,
        });
        await fetchTravelTimes(coords, marker);
        // requestNearbyDrivers()
        setlocationSelected(true);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const fetchTravelTimes = async (origin, destination) => {

    const modes = ["driving", "walking", "bicycling", "transit"];
    const times = {};
    await Promise.all(
      modes.map(async (mode) => {
        try {
          const params = {
            origins: `${origin.latitude},${origin.longitude}`,
            destinations: `${destination.latitude},${destination.longitude}`,
            key: process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY,
            mode,
            ...(mode === "driving" && { departure_time: "now" }),
          };
          const res = await axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json`, { params });
          const el = res.data.rows[0]?.elements[0];
          if (el?.status === "OK") {
            times[mode] = el.duration.text;
          }
        } catch (error) {
          console.log(error);
        }
      })
    );
    setTravelTimes(times);
  };

  useEffect(() => {
    const getDistanceAndFitMap = async () => {
      if (marker && currentLocation && mapRef?.current) {
        // 🧮 Calculate distance
        const dist = await calculateDistance(
          currentLocation.latitude,
          currentLocation.longitude,
          marker.latitude,
          marker.longitude
        );
        setDistance(dist);

        // 🗺️ Fit map to show both markers nicely
        mapRef.current.fitToCoordinates(
          [currentLocation, marker],
          {
            edgePadding: {
              top: 200,
              bottom: 450,
              left: 100,
              right: 100,
            },
            animated: true,
          }
        );
      }
    };

    getDistanceAndFitMap();
  }, [marker, currentLocation]);

  const confirmOrder = () => {
    setAlertConfig({
      title: "Confirm Ride Booking",
      message: "Are you sure you want to request a ride?\nPlease avoid pressing back while the system finds a driver.",
      confirmText: "Yes",
      cancelText: "No",
      showCancel: true,
      onConfirm: () => {
        setShowAlert(false);
        handleOrder();   // ⭐ Proceed only after confirming
      },
      onCancel: () => setShowAlert(false),
    });

    setShowAlert(true);
  };

  const handleOrder = async () => {
    // -------------------------------------
    // 🚨 BASIC VALIDATIONS
    // -------------------------------------
    if (!selectedVehcile) {
      Toast.show("Please select your cab!", {
        type: "warning",
        placement: "bottom",
      });
      return;
    }

    const driversForType = driverLists.filter(
      (d) => d.vehicle_type === selectedVehcile
    );

    if (driversForType.length === 0) {
      Toast.show("No drivers available for this vehicle type!", {
        type: "danger",
      });
      return;
    }

    // -------------------------------------
    // 🔁 LOCAL STATE
    // -------------------------------------
    let assigned = false;
    let rejectedCount = 0;
    let expiryTimer = null;

    try {
      setWaitingForBookingResponse(true);

      // -------------------------------------
      // 1️⃣ CHECK ACTIVE RIDE
      // -------------------------------------
      const { hasActiveRide, ride } = await checkUserActiveRide();

      if (hasActiveRide) {
        setWaitingForBookingResponse(false);

        setModalMessage("You already have an ongoing ride!");
        setModalSubMessage(
          "Please finish or cancel your current ride before booking a new one."
        );
        setModalType("error");
        setModalVisible(true);

        setTimeout(() => {
          router.replace({
            pathname: "/(routes)/ride-details",
            params: { rideId: JSON.stringify(ride.id) },
          });
        }, 3000);

        return;
      }

      // -------------------------------------
      // 2️⃣ CREATE RIDE REQUEST (BACKEND)
      // -------------------------------------
      const uniqueRideKey = `${user?.id}_${Date.now()}`;

      try {
        await axiosInstance.post("/ride-request/create", {
          uniqueRideKey,
          userId: user?.id,
        });
      } catch (err) {
        setWaitingForBookingResponse(false);

        const message = err?.response?.data?.message;

        if (message?.includes("request")) {
          Toast.show("A ride request is already in progress. Please wait.", {
            type: "warning",
            placement: "bottom",
          });
        } else {
          Toast.show("Unable to create ride request. Please try again.", {
            type: "danger",
            placement: "bottom",
          });
        }

        return;
      }

      // -------------------------------------
      // 3️⃣ CALCULATE FARE
      // -------------------------------------
      const fareDetails = await calculateFare({
        driver: driversForType[0],
        distance,
        district,
      });

      const rideRequestData = {
        uniqueRideKey,
        user,
        currentLocation,
        marker,
        distance: distance.toFixed(2),
        currentLocationName,
        destinationLocation: destLocationName,
        fare: {
          totalFare: fareDetails.totalFare,
          driverEarnings: fareDetails.driverEarnings,
          platformShare: fareDetails.platformShare,
        },
      };

      // -------------------------------------
      // 📢 USER NOTIFICATION
      // -------------------------------------
      sendPushNotification(
        user?.notificationToken,
        "Ride Request Sent",
        "Finding a driver for you. Don't press back button."
      );

      Toast.show("Finding a driver for you... Please wait.", {
        type: "success",
      });

      // -------------------------------------
      // 4️⃣ BROADCAST TO DRIVERS
      // -------------------------------------
      driversForType.forEach((driver) => {
        sendPushNotification(
          driver.notificationToken,
          "New Ride Request",
          "You have a new ride request."
        );

        socketService.send({
          type: "rideRequest",
          role: "user",
          userId: user?.id,
          driverId: driver.id,
          rideRequest: rideRequestData,
        });
      });

      // -------------------------------------
      // 5️⃣ UX EXPIRY TIMER (60s)
      // -------------------------------------
      expiryTimer = setTimeout(() => {
        if (!assigned) {
          setWaitingForBookingResponse(false);

          setModalMessage("🚫 No drivers available!");
          setModalSubMessage("Please try again later or choose a different cab.");
          setModalType("error");
          setModalVisible(true);
        }
      }, 60_000);

      // -------------------------------------
      // 6️⃣ SOCKET LISTENER
      // -------------------------------------
      const onMessage = async (message) => {
        if (assigned) return;

        // 🎉 ACCEPTED
        if (
          message.type === "rideAccepted" &&
          message.rideData?.rideData &&
          message.rideData.driver
        ) {
          assigned = true;

          const matchedDriver = driverLists.find(
            (d) => d.id === message.rideData.driver.id
          );

          setModalMessage("✅ Your ride has been accepted!");
          setModalSubMessage(
            `Driver ${matchedDriver?.name} is assigned. Have a safe trip!`
          );
          setModalType("success");
          setModalVisible(true);

          setWaitingForBookingResponse(false);

          setTimeout(() => {
            router.replace({
              pathname: "/(routes)/ride-details",
              params: {
                rideId: JSON.stringify(message.rideData.rideData.id),
              },
            });
          }, 3000);
        }

        // ❌ REJECTED
        if (message.type === "rideRejected" && !assigned) {
          rejectedCount++;

          if (rejectedCount === driversForType.length) {
            await axiosInstance.post("/ride-request/expire", {
              uniqueRideKey,
              userId: user?.id,
            });

            setWaitingForBookingResponse(false);

            setModalMessage("🚫 No drivers available!");
            setModalSubMessage(
              "Please try again later or choose a different cab."
            );
            setModalType("error");
            setModalVisible(true);
          }
        }
      };

      socketService.onMessage(onMessage);
    } catch (error) {
      console.error(error);

      setWaitingForBookingResponse(false);
      Toast.show(
        error?.response?.data?.message ||
        "Something went wrong. Please try again.",
        { type: "danger" }
      );
    }
  };




  return (
    <BottomSheetModalProvider>
      <View style={{ flex: 1 }}>

        {/* MAP ALWAYS BEHIND */}
        <View style={{ flex: 1 }}>
          {findingLocation && (
            <View style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
            }}>
              <ActivityIndicator size="large" color={color.primaryText} style={{ marginBottom: 15 }} />
              <Text style={{ color: color.primaryText, fontSize: fontSizes.FONT20, fontFamily: 'TT-Octosquares-Medium' }}>
                Finding your location...
              </Text>
            </View>
          )}
          <RideRoute
            currentLocation={currentLocation}
            marker={marker}
            region={region}
            setRegion={setRegion}
            currentLocationName={currentLocationName}
            destLocationName={destLocationName}
            locationSelected={locationSelected}
            driverLists={driverLists}
            mapRef={mapRef}
            expanded={expanded}
            distance={distance}
          />
        </View>

        {/* BOTTOM SHEET ALWAYS ABOVE MAP */}
        {locationSelected && distance ? (
          <RideOptions
            driverLists={driverLists}
            driverLoader={driverLoader}
            distance={distance}
            district={district}
            travelTimes={travelTimes}
            currentLocation={currentLocation}
            vehicleImages={vehicleImages}
            vehicleNames={vehicleNames}
            selectedVehcile={selectedVehcile}
            setselectedVehcile={setselectedVehcile}
            handleOrder={confirmOrder}
            watingForBookingResponse={watingForBookingResponse}
            setlocationSelected={setlocationSelected}
            setWaitingForResponse={setWaitingForBookingResponse}
            setExpansion={setExpanded}
          />
        ) : (
          <RideLocationSelector
            toggleUserLocation={setToggleUserLocation}
            router={router}
            userLocation={userLocation}
            userLocationName={userLocationName}
            currentLocation={currentLocation}
            marker={marker}
            setlocationSelected={setlocationSelected}
            currentLocationName={currentLocationName}
            destLocationName={destLocationName}
            fromSearchInputRef={fromSearchInputRef}
            toSearchInputRef={toSearchInputRef}
            fromPlaces={fromPlaces}
            places={places}
            handleFromPlaceSelect={handleFromPlaceSelect}
            handlePlaceSelect={handlePlaceSelect}
            setQuery={setQuery}
            setFromQuery={setFromQuery}
            fromQuery={fromQuery}
            query={query}
            isFindingLocation={findingLocation}
            setExpansion={setExpanded}
            isWaitingForResponse={watingForBookingResponse}
            setAlertConfig={setAlertConfig}
            setShowAlert={setShowAlert}

          />


        )}

        {/* MODAL */}
        {modalVisible && (
          <FooterModal
            isVisible={modalVisible}
            type={modalType}
            title={modalMessage}
            subText={modalSubMessage}
            onHide={() => setModalVisible(false)}
          />
        )}

      </View>
      <AppAlert
        visible={showAlert}
        title={alertConfig.title}
        message={alertConfig.message}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
        onConfirm={alertConfig.onConfirm}
        onCancel={alertConfig.onCancel}
      />

    </BottomSheetModalProvider>
  );
}
