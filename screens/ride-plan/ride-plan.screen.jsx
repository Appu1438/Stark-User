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

export default function RidePlanScreen() {
  const mapRef = useRef(null);
  const fromSearchInputRef = useRef(null);
  const toSearchInputRef = useRef(null);

  const { loading, user } = useGetUserData()


  const [expanded, setExpanded] = useState(false);
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
  const [watingForBookingResponse, setWaitingForBookingResponse] = useState(false);

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

  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    confirmText: "OK",
    showCancel: false,
    onConfirm: () => setShowAlert(false),
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
            showCancel: false,
            onConfirm: () => setShowAlert(false),
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
        const [place] = await Location.reverseGeocodeAsync(coords);
        console.log(place)
        // This gives fields like: { city, district, region, name, street, postalCode, country }

        // 🏙️ Build a readable location name
        const locationName =
          place?.street ||
          place?.city ||
          place?.name ||
          place?.district ||
          place?.region ||
          "Unknown Location";

        // 🏢 Optional: call your district function
        getDistrict(latitude, longitude, setDistrict);

        // 📍 Set the location + name
        setCurrentLocation(coords);
        setCurrentLocationName(locationName);
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
    try {
      toSearchInputRef.current?.setAddressText(description);

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

      fromSearchInputRef.current?.setAddressText(description);

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

      setWaitingForBookingResponse(true)

      const { hasActiveRide, ride } = await checkUserActiveRide();

      if (hasActiveRide) {
        // Show AppAlert or Toast
        setModalMessage("You already have an ongoing ride!");
        setModalSubMessage("Please finish or cancel your current ride before booking a new one.");
        setModalType("error");
        setModalVisible(true);

        setWaitingForBookingResponse(false)

        setTimeout(() => {
          router.replace({
            pathname: "/(routes)/ride-details",
            params: { rideId: JSON.stringify(ride.id) },
          });
        }, 3000);

        return; // stop order flow
      }
    } catch (error) {

      console.log("Active ride check failed:", error);
      Toast.show("Could not verify ride status. Please try again.", { type: "danger" });
      setWaitingForBookingResponse(false)

      return;
    }

    try {
      sendPushNotification(
        user?.notificationToken,
        "Ride Request Sent",
        "Finding a driver for you Don't press back button."
      );


      const fareDetails = await calculateFare({
        driver: driversForType[0], // use first driver for fare calculation
        distance,
        district: district
      });

      const rideRequestData = {
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

            setWaitingForBookingResponse(false);
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
            setModalSubMessage(`Driver ${matchedDriver.name} is assigned for your Ride . Please pay your driver after reaching your Destination. Have a nice trip . Thank You `)
            setModalType("success");
            setModalVisible(true);
            // Toast.show("Ride Accepted . Enjoy Your Ride", { type: "success" });

            // Delay navigation so modal is visible
            setTimeout(() => {
              router.replace({
                pathname: "/(routes)/ride-details",
                params: { rideId: JSON.stringify(message.rideData.rideData.id) },
              });
            }, 3000); // 2 seconds delay
          } else if (message.type === "rideRejected" && message.driverId === currentDriver.id && !assigned) {
            console.log(`Driver ${currentDriver.id} rejected, trying next`);
            tryNextDriver();
          }
        });
      };

      tryNextDriver(); // Start with first driver
    } catch (error) {
      setWaitingForBookingResponse(false)
      console.error(error);
      Toast.show("Something went wrong. Please try again.", { type: "danger" });
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
            handleOrder={handleOrder}
            watingForBookingResponse={watingForBookingResponse}
            setlocationSelected={setlocationSelected}
            setWaitingForResponse={setWaitingForBookingResponse}
            setExpansion={setExpanded}
          />
        ) : (
          <RideLocationSelector
            router={router}
            currentLocation={currentLocation}
            marker={marker}
            setlocationSelected={setlocationSelected}
            currentLocationName={currentLocationName}
            destLocationName={destLocationName}
            fromSearchInputRef={fromSearchInputRef}
            toSearchInputRef={toSearchInputRef}
            setFromPlaces={setFromPlaces}
            setPlaces={setPlaces}
            fromPlaces={fromPlaces}
            places={places}
            handleFromPlaceSelect={handleFromPlaceSelect}
            handlePlaceSelect={handlePlaceSelect}
            setkeyboardAvoidingHeight={setkeyboardAvoidingHeight}
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
        showCancel={alertConfig.showCancel}
        onConfirm={alertConfig.onConfirm}
      />

    </BottomSheetModalProvider>
  );
}
