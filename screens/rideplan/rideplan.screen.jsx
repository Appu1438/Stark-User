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
import MapView, { AnimatedRegion, Marker } from 'react-native-maps';
import MapViewDirections from "react-native-maps-directions";
import { styles } from './styles';
import { router } from 'expo-router';
import { Clock, LeftArrow, PickLocation, RightArrow } from '@/utils/icons';
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
import { useRideStore } from '@/store/rideStore';
import { useDriverStore } from '@/store/driverStore';
import { sendPushNotification } from '@/utils/notifications/sendPushNotification';
import RideFare from '@/components/ride/ride-fare';
import axiosInstance from '@/api/axiosInstance';
import { latitude } from 'geolib';
import { getDistrict } from '@/utils/ride/getDistrict';
import FooterModal from '@/components/modal/footerModal/footer-Modal';
export default function RidePlanScreen() {
  const mapRef = useRef(null);
  const fromSearchInputRef = useRef(null);
  const toSearchInputRef = useRef(null);

  const { loading, user } = useGetUserData()


  const [findingLocation, setFindingLocation] = useState(true);

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
  const [keyboardAvoidingHeight, setkeyboardAvoidingHeight] = useState(false);
  const [selectedVehcile, setselectedVehcile] = useState("");
  const [travelTimes, setTravelTimes] = useState({
    driving: null,
    walking: null,
    bicycling: null,
    transit: null,
  });
  // const [driverLists, setDriverLists] = useState([]);
  const driverLists = useDriverStore.getState().driverLists;
  const { setDriverLists, updateDriverLocation } = useDriverStore();

  // const [selectedDriver, setselectedDriver] = useState<DriverType>();
  const [driverLoader, setdriverLoader] = useState(true);
  const [watingForBookingResponse, setwatingForBookingResponse] = useState(false);

  const vehicleImages = {
    Auto: require("@/assets/images/vehicles/auto.png"),
    Sedan: require("@/assets/images/vehicles/sedan.png"),
    Suv: require("@/assets/images/vehicles/suv.png"),
    Hatchback: require("@/assets/images/vehicles/hatchback.png"),
  };

  const vehicleNames = {
    Auto: "Stark Mini",
    Sedan: "Stark Prime",
    Hatchback: "Stark Zip",
    Suv: "Stark Max",
  };

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalSubMessage, setModalSubMessage] = useState("");
  const [modalType, setModalType] = useState("success");


  //Keyboard Settings
  useEffect(() => {
    if (Platform.OS === 'android') {
      const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
        if (fromSearchInputRef.current?.isFocused?.()) {
          fromSearchInputRef.current?.blur?.(); // manually blur on soft back
          setkeyboardAvoidingHeight(false); // your onBlur logic
        } else if (toSearchInputRef.current?.isFocused?.()) {
          toSearchInputRef.current?.blur?.(); // manually blur on soft back
          setkeyboardAvoidingHeight(false); // your onBlur logic
        }
      });

      return () => keyboardDidHideListener.remove();
    }
  }, []);

  //Location Setups
  useEffect(() => {
    (async () => {
      try {
        setFindingLocation(true); // Start loader

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Toast.show("Location permission denied. Enable it to use this feature.", {
            type: "danger",
            placement: "bottom",
          });
          return;
        }

        const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        const { latitude, longitude } = location.coords;
        const coords = { latitude, longitude };

        getDistrict(latitude, longitude, setDistrict)

        setCurrentLocation(coords);
        setRegion(prev => ({
          ...prev,
          latitude,
          longitude,
        }));

        // Animate after a slight delay to smoothen UX on iOS
        setTimeout(() => {
          mapRef.current?.animateToRegion({
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }, 1000);
        }, 200); // 200ms delay
      } catch (error) {
        console.error("Location fetch error:", error);
        Toast.show("Unable to retrieve location. Please try again.", {
          type: "danger",
          placement: "bottom",
        });
      } finally {
        setFindingLocation(false); // Stop loader
      }
    })();
  }, []);


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
    if (query.length > 2) debouncedFetchPlaces(query);
    else setPlaces([]);
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
    if (fromQuery.length > 2) debouncedFetchFromPlaces(fromQuery);
    else setFromPlaces([]);
  }, [fromQuery]);

  const handlePlaceSelect = async (placeId, description) => {
    Keyboard.dismiss();
    setDestLocationName(description);
    try {
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
      setkeyboardAvoidingHeight(false);
      if (currentLocation) await fetchTravelTimes(currentLocation, coords);
    } catch (err) {
      console.log(err);
    }
  };

  const handleFromPlaceSelect = async (placeId, description) => {
    Keyboard.dismiss();
    setCurrentLocationName(description);
    try {
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
      setkeyboardAvoidingHeight(false);
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


  const calculateDistance = async (lat1, lon1, lat2, lon2) => {

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${lat1},${lon1}&destinations=${lat2},${lon2}&mode=driving&key=${process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY}`
    );
    const data = await response.json();

    if (data.status === "OK" && data.rows[0].elements[0].status === "OK") {
      const distanceInKm = data.rows[0].elements[0].distance.value / 1000;
      console.log(distanceInKm)
      return distanceInKm;
    } else {
      throw new Error("Could not calculate driving distance");
    }
  };

  useEffect(() => {
    const getDistance = async () => {
      if (marker && currentLocation) {
        const dist = await calculateDistance(
          currentLocation.latitude,
          currentLocation.longitude,
          marker.latitude,
          marker.longitude
        );
        console.log("Distance inside async:", dist);
        setDistance(dist);
      }
    }
    getDistance();

  }, [marker, currentLocation]);

  const handleOrder = async () => {
    if (!selectedVehcile) {
      Toast.show("Please select your cab!", { type: "warning", placement: "bottom" });
      return;
    }

    const driversForType = driverLists.filter(d => d.vehicle_type === selectedVehcile);
    if (driversForType.length === 0) {
      Toast.show("No drivers available for this vehicle type!", { type: "danger" });
      return;
    }

    try {
      sendPushNotification(
        user?.notificationToken,
        "Ride Request Sent",
        "Finding a driver for you Don't press back button."
      );
      setwatingForBookingResponse(true)
      // Fetch addresses
      const [pickupRes, dropoffRes] = await Promise.all([
        axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${currentLocation.latitude},${currentLocation.longitude}&key=${process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY}`),
        axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${marker.latitude},${marker.longitude}&key=${process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY}`),
      ]);

      const currentLocationName = pickupRes?.data?.results?.[0]?.formatted_address || "Pickup Location";
      const destinationLocationName = dropoffRes?.data?.results?.[0]?.formatted_address || "Dropoff Location";

      const fareDetails = await calculateFare({
        driver: driversForType[0], // use first driver for fare calculation
        distance,
        duration: parseDuration(travelTimes.driving),
        district: district
      });

      const rideRequestData = {
        user,
        currentLocation,
        marker,
        distance: distance.toFixed(2),
        currentLocationName,
        destinationLocation: destinationLocationName,
        fare: {
          totalFare: fareDetails.totalFare,
          driverEarnings: fareDetails.driverEarnings,
          platformShare: fareDetails.platformShare,
        },
      };

      Toast.show("Finding a driver for you Don't press back button", { type: "success" });

      let index = 0;
      let assigned = false;
      const tryNextDriver = async () => {
        if (index >= driversForType.length) {
          if (!assigned) {
            sendPushNotification(
              user?.notificationToken,
              "🚫 No Drivers Available 🚫",
              "Sorry, no drivers are available right now. Please try a different cab or try again shortly."
            );

            setModalMessage("🚫 No drivers are currently available for your selected cab 🚫");
            setModalSubMessage(" Please try choosing a different cab or try again later. Thank you! ")
            setModalType("error");
            setModalVisible(true);
            // Toast.show(
            //   "No drivers are currently available for your selected cab. Please try choosing a different cab or try again later. Thank you!",
            //   { type: "info" }
            // );

            setwatingForBookingResponse(false);
          }
          return;
        }


        const currentDriver = driversForType[index];
        index++;

        // Send ride request to this driver only

        sendPushNotification(currentDriver.notificationToken,
          "New Ride Request",
          "You have a new ride request."
        );
        socketService.send({
          type: "rideRequest",
          role: "user",
          userId: user?.id,
          driverId: currentDriver.id,
          rideRequest: rideRequestData,
        });


        // Listen for driver response
        socketService.onMessage((message) => {
          if (message.type === "rideAccepted" && message.rideData.driver?.id === currentDriver.id && !assigned) {
            assigned = true;

            const matchedDriver = driverLists.find(d => d.id === message.rideData.driver?.id);
            // message.rideData.driver = matchedDriver;
            // useRideStore.getState().setRideDetails(message.rideData);
            setModalMessage("✅ Your ride has been accepted! Enjoy your ride.");
            setModalSubMessage(`${matchedDriver.name} is assigned for your Ride . Please pay your driver after reaching your Destination. Have a nice trip . Thank You `)
            setModalType("success");
            setModalVisible(true);
            // Toast.show("Ride Accepted . Enjoy Your Ride", { type: "success" });

            // Delay navigation so modal is visible
            setTimeout(() => {
              router.replace({
                pathname: "/(routes)/ride-details",
                params: { rideId: JSON.stringify(message.rideData.rideData.id) },
              });
            }, 5000); // 2 seconds delay
          } else if (message.type === "rideRejected" && message.driverId === currentDriver.id && !assigned) {
            console.log(`Driver ${currentDriver.id} rejected, trying next`);
            tryNextDriver();
          }
        });
      };

      tryNextDriver(); // Start with first driver
    } catch (error) {
      setwatingForBookingResponse(false)
      console.error(error);
      Toast.show("Something went wrong. Please try again.", { type: "danger" });
    }
  };


  return (
    <KeyboardAvoidingView style={external.fx_1}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? -50 : -90}

    >
      <View>

        <View style={{ height: windowHeight(keyboardAvoidingHeight ? 300 : 500) }}>
          {findingLocation && (
            <View style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
            }}>
              <ActivityIndicator size="large" color="#fff" style={{ marginBottom: 15 }} />
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>
                Finding your location...
              </Text>
            </View>
          )}

          <MapView
            style={{ flex: 1 }}
            ref={mapRef}
            initialRegion={region}
            onRegionChangeComplete={setRegion}
            showsUserLocation
            showsMyLocationButton
            loadingEnabled
          >
            {marker && <Marker coordinate={marker} />}
            {currentLocation && <Marker coordinate={currentLocation} />}
            {currentLocation && marker && (
              <MapViewDirections
                origin={currentLocation}
                destination={marker}
                apikey={process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY}
                strokeWidth={4}
                strokeColor="blue"
                optimizeWaypoints
                mode="DRIVING"
                timePrecision="now"
              />
            )}

            {/* 🚗 Nearby Drivers */}
            {locationSelected && driverLists
              ?.filter(driver => driver.latitude != null && driver.longitude != null) // ✅ Only valid drivers
              .map((driver) => (
                <Marker.Animated
                  key={driver.id}
                  coordinate={driver.animatedLocation}
                  anchor={{ x: 0.5, y: 0.5 }}
                >
                  <Image
                    source={getVehicleIcon(driver.vehicle_type)}
                    style={{
                      width: 45,
                      height: 45,
                      resizeMode: 'contain',
                      transform: [
                        {
                          rotate: `${driver.vehicle_type === "Auto"
                            ? driver.heading + 180 // Flip for autos
                            : driver.heading
                            }deg`
                        }
                      ]
                    }}
                  />
                </Marker.Animated>
              ))}
          </MapView>
        </View>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.container}>
          {locationSelected && distance !== null && distance !== undefined ? (
            <>
              <ScrollView style={{ paddingBottom: windowHeight(0), height: windowHeight(280) }}>
                {/* Header */}
                <View
                  style={{
                    borderBottomWidth: 1,
                    borderBottomColor: "#b5b5b5",
                    paddingBottom: windowHeight(10),
                    flexDirection: "row",
                  }}
                >
                  <Pressable onPress={() => setlocationSelected(false)}>
                    <LeftArrow />
                  </Pressable>
                  <Text
                    style={{
                      margin: "auto",
                      fontSize: 20,
                      fontWeight: "600",
                      fontFamily: 'TT-Octosquares-Medium'

                    }}
                  >
                    Gathering Options
                  </Text>
                </View>

                {driverLoader ? (
                  // Loader while fetching drivers
                  <View
                    style={{
                      flex: 1,
                      alignItems: "center",
                      justifyContent: "center",
                      height: 400,
                    }}
                  >
                    <ActivityIndicator size={"large"} />
                  </View>
                ) : (
                  (() => {
                    // ✅ Unique vehicle types
                    const uniqueVehicleTypes = Array.from(
                      new Set(driverLists?.map((d) => d.vehicle_type))
                    );

                    // Filter only those types with drivers
                    const availableVehicleTypes = uniqueVehicleTypes.filter((vehicleType) =>
                      driverLists.some(
                        (d) => d.vehicle_type === vehicleType && d.latitude && d.longitude
                      )
                    );

                    // ✅ If no available vehicles, show message
                    if (availableVehicleTypes.length === 0) {
                      return (
                        <View
                          style={{
                            flex: 1,
                            justifyContent: "center",
                            alignItems: "center",
                            padding: windowWidth(10),
                          }}
                        >
                          <Text
                            style={{ fontSize: 16, color: "#888", textAlign: "center" }}
                          >
                            No drivers available in your area.
                          </Text>
                        </View>
                      );
                    }

                    // ✅ Otherwise show available vehicle types + confirm button
                    return (
                      <>
                        {availableVehicleTypes.map((vehicleType) => {
                          const driversForType = driverLists.filter(
                            (d) => d.vehicle_type === vehicleType && d.latitude && d.longitude
                          );

                          return (
                            <Pressable
                              key={vehicleType}
                              onPress={() => setselectedVehcile(vehicleType)}
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                padding: 15,
                                marginVertical: 6,
                                borderRadius: 16,
                                borderWidth: selectedVehcile === vehicleType ? 2 : 1,
                                borderColor: selectedVehcile === vehicleType ? "#1f1f1f" : "#ddd",
                                backgroundColor: "#fff",
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.08,
                                shadowRadius: 5,
                                elevation: 3,
                              }}
                            >
                              {/* Vehicle Image */}
                              <View>

                                <Image
                                  source={vehicleImages[vehicleType] || vehicleImages["Sedan"]}
                                  style={{ width: 65, height: 55, marginRight: 16 }}
                                  resizeMode="contain"
                                />
                                {driversForType[0].latitude && driversForType[0].longitude && currentLocation && (
                                  <Text style={{ fontSize: fontSizes.FONT12, color: "#555", fontFamily: "TT-Octosquares-Medium" }}>
                                    {estimateArrivalFromDriver(driversForType[0], currentLocation)} away
                                  </Text>
                                )}
                              </View>

                              {/* Vehicle Info */}
                              <View style={{ flex: 1 }}>
                                {/* Top Row: Vehicle Name + Fare */}
                                <View
                                  style={{
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: 8,
                                  }}
                                >
                                  <Text style={{ fontSize: fontSizes.FONT18, fontFamily: "TT-Octosquares-Medium", color: "#1a1a1a" }}>
                                    {vehicleNames[vehicleType]}
                                  </Text>

                                  <RideFare
                                    driver={driversForType[0]}
                                    distance={distance}
                                    travelTimes={travelTimes}
                                    district={district}
                                  />
                                </View>

                                {/* Divider */}
                                <View
                                  style={{
                                    height: 1,
                                    backgroundColor: "#eee",
                                    marginVertical: 6,
                                  }}
                                />

                                {/* Middle Row: Capacity + Distance */}
                                <View
                                  style={{
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    marginBottom: 5,
                                  }}
                                >
                                  <Text style={{ fontSize: fontSizes.FONT14, color: "#555", fontFamily: "TT-Octosquares-Medium" }}>
                                    Capacity: {driversForType[0].capacity}
                                  </Text>

                                  {distance && (
                                    <Text style={{ fontSize: fontSizes.FONT14, color: "#555", fontFamily: "TT-Octosquares-Medium" }}>
                                      Distance: {distance.toFixed(2)} km
                                    </Text>
                                  )}
                                </View>

                                {/* Divider */}
                                <View
                                  style={{
                                    height: 1,
                                    backgroundColor: "#eee",
                                    marginVertical: 6,
                                  }}
                                />

                                {/* Bottom Row: ETD & ETA */}
                                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>

                                  {/* {driversForType[0].latitude && driversForType[0].longitude && currentLocation && (
                                    <Text style={{ fontSize: fontSizes.FONT12, color: "#555", fontFamily: "TT-Octosquares-Medium" }}>
                                      Driver: {estimateArrivalFromDriver(driversForType[0], currentLocation)} away
                                    </Text>
                                  )} */}
                                  {travelTimes.driving && (
                                    <Text style={{ fontSize: fontSizes.FONT12, color: "#555", fontFamily: "TT-Octosquares-Medium" }}>
                                      Estimated Arrival: {getEstimatedArrivalTime(travelTimes.driving)}
                                    </Text>
                                  )}
                                </View>
                              </View>
                            </Pressable>



                          );

                        })}

                        {/* ✅ Confirm Button */}
                        <View
                          style={{
                            paddingHorizontal: windowWidth(10),
                            marginTop: windowHeight(15),
                          }}
                        >
                          <Button
                            backgroundColor={"#000"}
                            textColor="#fff"
                            title="Confirm Booking"
                            onPress={() => handleOrder()}
                            disabled={watingForBookingResponse}
                          />
                        </View>
                      </>
                    );
                  })()
                )}
              </ScrollView>
            </>
          ) : (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => router.back()}>
                  <LeftArrow />
                </TouchableOpacity>
                <Text style={{
                  margin: 'auto',
                  fontSize: windowWidth(20),
                  fontWeight: '600',
                  fontFamily: 'TT-Octosquares-Medium'

                }}>
                  Plan Your Ride
                </Text>
                {currentLocation && marker && (
                  <TouchableOpacity onPress={() => setlocationSelected(true)}>
                    <RightArrow iconColor='#000' />
                  </TouchableOpacity>
                )}
              </View>

              <View style={{
                width: windowWidth(200),
                height: windowHeight(28),
                borderRadius: 20,
                backgroundColor: color.lightGray,
                alignItems: "center",
                justifyContent: 'center',
                marginVertical: windowHeight(18)
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Clock />
                  <Text style={{
                    fontSize: windowHeight(12),
                    fontWeight: '600',
                    paddingHorizontal: 8,
                    fontFamily: 'TT-Octosquares-Medium'

                  }}>
                    Pick-up Now
                  </Text>
                </View>
              </View>

              <View style={{
                borderWidth: 2, borderColor: '#000', borderRadius: 15,
                marginBottom: windowHeight(15),
                paddingHorizontal: windowWidth(15),
                paddingVertical: windowHeight(10)
              }}>
                <View style={{ flexDirection: 'row' }}>
                  <PickLocation />
                  <View style={{
                    borderBottomWidth: 1,
                    borderBottomColor: '#999',
                    width: Dimensions.get('window').width * 1 - 110,
                    marginLeft: 5,
                    height: windowHeight(30),
                  }}>
                    <GooglePlacesAutocomplete
                      ref={fromSearchInputRef}
                      placeholder={currentLocationName}
                      onPress={(data) => {
                        setFromPlaces([{ ...data }]);
                      }}
                      query={{
                        key: process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY,
                        language: 'en',
                      }}
                      styles={{
                        textInputContainer: { width: '100%' },
                        textInput: {
                          height: 30, color: '#000', fontSize: 13, fontFamily: 'TT-Octosquares-Medium'
                        },
                      }}
                      textInputProps={{
                        onChangeText: setFromQuery,
                        value: fromQuery,
                        onFocus: () => setkeyboardAvoidingHeight(true),
                        onBlur: () => setkeyboardAvoidingHeight(false)
                      }}
                      fetchDetails={true}
                      debounce={200}
                      predefinedPlaces={[]}
                    />
                  </View>
                </View>

                <View style={{
                  flexDirection: 'row',
                  paddingVertical: 12,
                }}>
                  <PlaceHolder />
                  <View style={{
                    marginLeft: 5,
                    width: Dimensions.get('window').width * 1 - 110,
                  }}>
                    <GooglePlacesAutocomplete
                      ref={toSearchInputRef}
                      placeholder={destLocationName}
                      onPress={(data) => {
                        setPlaces([{ ...data }]);
                      }}
                      query={{
                        key: process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY,
                        language: 'en',
                      }}
                      styles={{
                        textInputContainer: { width: '100%' },
                        textInput: {
                          height: 25, color: '#000', fontSize: 13, fontFamily: 'TT-Octosquares-Medium'
                        },
                      }}
                      textInputProps={{
                        onChangeText: setQuery,
                        value: query,
                        onFocus: () => setkeyboardAvoidingHeight(true),
                        onBlur: () => setkeyboardAvoidingHeight(false)
                      }}
                      fetchDetails={true}
                      debounce={200}
                      predefinedPlaces={[]}

                    />
                  </View>
                </View>
              </View>

              <ScrollView style={{ maxHeight: windowHeight(150) }} keyboardShouldPersistTaps="handled">
                {places.map((place, index) => (
                  <Pressable
                    key={index}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: windowHeight(10),
                      paddingVertical: 8,
                      paddingHorizontal: 10,
                      borderRadius: 8,
                      marginTop: 4,
                    }}
                    onPress={() => handlePlaceSelect(place.place_id, place.description)}
                  >
                    <PickLocation colors='#000' />
                    <Text style={{
                      paddingLeft: 15, fontSize: 16,
                      flexShrink: 1, color: '#333'
                    }}>
                      {place.description || 'Unknown location'}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              <ScrollView style={{ maxHeight: windowHeight(150) }} keyboardShouldPersistTaps="handled">
                {fromPlaces.map((place, index) => (
                  <Pressable
                    key={index}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: windowHeight(10),
                      paddingVertical: 8,
                      paddingHorizontal: 10,
                      borderRadius: 8,
                      marginTop: 4,
                    }}
                    onPress={() => handleFromPlaceSelect(place.place_id, place.description)}
                  >
                    <PickLocation colors='#000' />
                    <Text style={{
                      paddingLeft: 15, fontSize: 16,
                      flexShrink: 1, color: '#333'
                    }}>
                      {place.description || 'Unknown location'}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </>
          )}
        </View>
      </View>

      {modalVisible && modalMessage && modalType && modalSubMessage && (
        <FooterModal
          isVisible={modalVisible}
          type={modalType}
          title={modalMessage}
          subText={modalSubMessage}
          onHide={() => setModalVisible(false)}
        />
      )}
    </KeyboardAvoidingView>
  );
}
