import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Dimensions,
  Animated,
  PanResponder,
  Platform,
  StyleSheet,
  Keyboard,
  TextInput,
} from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { Clock, Gps, LeftArrow, RightArrow, Location } from "@/utils/icons";
import color from "@/themes/app.colors";
import { fontSizes, windowHeight, windowWidth } from "@/themes/app.constant";
import { useGetUserSavedPlaces } from "@/hooks/useGetUserData";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// SNAP points per your request
const SNAP = {
  COLLAPSED: windowHeight(220), // Q1 value
  HALF: Math.round(SCREEN_HEIGHT * 0.65),
  FULL: SCREEN_HEIGHT - (Platform.OS === "ios" ? 40 : 40),
};

export default function RideLocationSelector({
  toggleUserLocation,
  router,
  userLocation,
  userLocationName,
  currentLocation,
  marker,
  setlocationSelected,
  currentLocationName = "Current location",
  destLocationName = "Where to?",
  fromSearchInputRef,
  toSearchInputRef,
  fromPlaces = [],
  places = [],
  handleFromPlaceSelect,
  handlePlaceSelect,
  setQuery,
  setFromQuery,
  fromQuery,
  query,
  isFindingLocation,
  isWaitingForResponse,
  setAlertConfig,
  setShowAlert
}) {

  // saved places
  const { loading: savedLoading, savedPlaces = [] } = useGetUserSavedPlaces();

  // state: sheetAnim (0..1) controls height between COLLAPSED and FULL
  const sheetAnim = useRef(new Animated.Value(0)).current; // 0 collapsed, 1 full
  const [expanded, setExpanded] = useState(false); // full-screen?
  const [isPanning, setIsPanning] = useState(false); // block inner scroll while pan

  const [pickupPlaceholder, setPickupPlaceholder] = useState(currentLocationName); // block inner scroll while pan

  useEffect(() => {
    let pickupPlaceholder = isFindingLocation
      ? "Fetching location..."
      : currentLocationName === userLocationName
        ? `${currentLocationName} (Current Location)`
        : currentLocationName;

    setPickupPlaceholder(pickupPlaceholder)
  }, [toggleUserLocation, currentLocationName, isFindingLocation])

  // map sheetAnim to height and border radius (no translateY)
  const sheetHeight = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [SNAP.COLLAPSED, SNAP.FULL],
    extrapolate: "clamp",
  });
  const sheetBorderRadius = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [18, 0],
    extrapolate: "clamp",
  });

  // snap function same logic as RideOptions
  const snapTo = (pointKey) => {
    let toVal = 0;
    if (pointKey === "COLLAPSED") {
      toVal = 0;
      Keyboard.dismiss()
    }
    else if (pointKey === "HALF") {
      const frac = (SNAP.HALF - SNAP.COLLAPSED) / (SNAP.FULL - SNAP.COLLAPSED);
      toVal = frac;
    } else toVal = 1;

    Animated.spring(sheetAnim, {
      toValue: toVal,
      useNativeDriver: false,
      stiffness: 160,
      damping: 18,
      mass: 1,
      overshootClamping: true,
    }).start(() => {
      setExpanded(toVal >= 0.95);
    });
  };

  // initialize collapsed
  useEffect(() => {
    sheetAnim.setValue(0);
    setExpanded(false);
  }, []);

  // PanResponder: we DO NOT move sheet while dragging; only compute on release and snap
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 6,
      onPanResponderGrant: () => {
        setIsPanning(true);
      },
      onPanResponderMove: () => {
        // purposely do nothing so sheet doesn't follow finger
      },
      onPanResponderRelease: (_, gesture) => {
        const { dy, vy } = gesture;

        // determine projected height based on current sheetAnim value
        sheetAnim.stopAnimation((val) => {
          const currHeight =
            SNAP.COLLAPSED + (SNAP.FULL - SNAP.COLLAPSED) * val;
          // project: note dy > 0 means drag down, so subtract dy to go up
          const projected = currHeight - dy - vy * 200;

          // choose nearest snap
          const candidates = [
            { key: "COLLAPSED", diff: Math.abs(projected - SNAP.COLLAPSED) },
            { key: "HALF", diff: Math.abs(projected - SNAP.HALF) },
            { key: "FULL", diff: Math.abs(projected - SNAP.FULL) },
          ].sort((a, b) => a.diff - b.diff);

          snapTo(candidates[0].key);
        });

        // small delay to avoid immediate scroll toggling
        setTimeout(() => setIsPanning(false), 50);
      },
      onPanResponderTerminate: () => {
        // cancelled — ensure we stop panning
        setIsPanning(false);
      },
    })
  ).current;

  // toggle behavior for handle
  const toggleHandle = () =>
    sheetAnim.stopAnimation((val) => {
      if (val < 0.5) snapTo("FULL");
      else snapTo("COLLAPSED");
    });

  // helper render saved place row
  const renderSavedPlace = (place, idx) => (
    <Pressable
      key={`saved-${idx}`}
      style={styles.resultRow}
      onPress={() => {
        handlePlaceSelect(
          place.placeId || place.place_id || place.id,
          place.address || place.name
        );
        snapTo("COLLAPSED");
      }}
    >
      <Location colors={color.primaryText} />
      <View style={{ marginLeft: 12, flex: 1 }}>
        <Text style={styles.resultMain}>{place.label || place.description}</Text>
        <Text style={styles.resultSub}>{place.address || place.vicinity || ""}</Text>
      </View>
    </Pressable>
  );

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: sheetHeight,
          borderTopLeftRadius: sheetBorderRadius,
          borderTopRightRadius: sheetBorderRadius,
          backgroundColor: color.subPrimary,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: "#1d1d1d",
        },
      ]}
      {...panResponder.panHandlers}
    >
      {/* Header / handle */}
      <View style={styles.handleWrap}>
        <Pressable onPress={toggleHandle}>
          <View style={styles.handle} />
        </Pressable>

        <View style={styles.headerRow}>
          <Pressable
            onPress={() => {
              if (isWaitingForResponse) {
                setAlertConfig({
                  title: "Please Wait",
                  message: "We are processing your booking request. You cannot go back right now.",
                  confirmText: "OK",
                  showCancel: false,
                  onConfirm: () => setShowAlert(false),
                });
                setShowAlert(true);
                return;
              }

              router.back(); // Normal behavior
            }}
            style={styles.headerLeft}
          >
            <LeftArrow />
          </Pressable>

          <Text style={styles.headerTitle}>Plan Your Ride</Text>

          <Pressable
            onPress={() => { if (currentLocation && marker) setlocationSelected(true); }}
            style={styles.headerRight}
          >
            <RightArrow iconColor={color.primaryText} />
          </Pressable>
        </View>
      </View>

      {/* body */}
      <View style={styles.body}>
        <View style={styles.pickupPill}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Clock />
            <Text style={styles.pickupText}>Pick-up Now</Text>
          </View>
        </View>

        {/* Search Inputs */}
        <View
          style={{
            borderWidth: 2,
            borderColor: color.border,
            borderRadius: 15,
            marginBottom: windowHeight(15),
            paddingHorizontal: windowWidth(15),
            paddingVertical: windowHeight(10),
          }}
        >
          {/* FROM LOCATION */}
          <View style={{ flexDirection: "row" }}>
            <View style={{ marginTop: windowHeight(4.5) }}>
              <Location colors={color.primaryGray} />
            </View>

            <View
              style={{
                borderBottomWidth: 1,
                borderBottomColor: color.primaryGray,
                width: Dimensions.get("window").width - 110,
                marginLeft: windowWidth(15),
                marginTop: windowHeight(-4),
                height: windowHeight(35),
              }}
            >

              <TextInput
                ref={fromSearchInputRef}
                style={{
                  height: windowHeight(30),
                  color: isFindingLocation ? "#777" : color.primaryText,
                  fontSize: fontSizes.FONT15,
                  fontFamily: "TT-Octosquares-Medium",
                  backgroundColor: color.subPrimary,
                }}
                placeholder={pickupPlaceholder}
                placeholderTextColor={color.primaryText}
                editable={!isFindingLocation}
                value={fromQuery}
                // autoCapitalize="true"
                onFocus={() => {
                  if (!isFindingLocation) snapTo("FULL");
                }}
                onChangeText={(text) => {
                  setFromQuery(text);
                }}
              />
            </View>
          </View>


          {/* TO LOCATION */}
          <View style={{ flexDirection: "row", }}>
            <View style={{ marginTop: windowHeight(12) }}>
              <Gps colors={color.primaryGray} />
            </View>

            <View
              style={{
                width: Dimensions.get("window").width - 110,
                marginLeft: windowWidth(15),
                marginTop: windowHeight(5),
                height: windowHeight(35),
              }}
            >
              <TextInput
                ref={toSearchInputRef}
                style={{
                  height: windowHeight(30),
                  color: isFindingLocation ? "#777" : color.primaryText,
                  fontSize: fontSizes.FONT15,
                  fontFamily: "TT-Octosquares-Medium",
                  backgroundColor: color.subPrimary,
                }}
                placeholder={destLocationName}
                placeholderTextColor={color.primaryText}
                editable={!isFindingLocation}
                value={query}
                // autoCapitalize="none"
                onFocus={() => {
                  if (!isFindingLocation) snapTo("FULL");
                }}
                onChangeText={(text) => {
                  setQuery(text);
                }}
              />
            </View>
          </View>

        </View>

        {/* Content: saved places & suggestions.
            - inner ScrollView is enabled only when sheet is FULL (expanded)
            - when user is typing, hide saved places (isTyping)
        */}
        <Animated.ScrollView
          style={styles.resultsContainer}
          contentContainerStyle={{ paddingBottom: 120 }}
          // scrollEnabled={expanded && !isPanning}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={() => {
            if (!expanded) snapTo("HALF");
          }}
        >
          {!isFindingLocation && userLocation && (
            <Pressable
              style={{
                padding: 5,
                borderRadius: 10,
                // backgroundColor: color.primaryGray,
                marginBottom: 10,
                flexDirection: "row",
                alignItems: "center",
              }}
              onPress={() => {
                // Trigger reset
                toggleUserLocation(prev => !prev);

                // Clear user typed text
                setFromQuery("");

                // Collapse sheet if needed
                snapTo("COLLAPSED");
              }}
            >
              <Location colors={color.primaryText} />
              <Text style={{ marginLeft: 10, color: color.primaryText, fontSize: fontSizes.FONT15, fontFamily: "TT-Octosquares-Medium" }}>
                Use Current Location
              </Text>
            </Pressable>

          )}

          {/* From suggestions */}
          {fromPlaces?.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Pickup Suggestions</Text>
              </View>

              {fromPlaces.map((place, idx) => (
                <Pressable
                  key={`from-${idx}`}
                  style={styles.resultRow}
                  onPress={() => {
                    console.log("📍 Selected Place:", place); // <-- LOG FULL PLACE

                    handleFromPlaceSelect(
                      place.place_id || place.placeId || place?.result?.place_id,
                      place.description || place?.description || place?.result?.formatted_address
                    );
                    snapTo("COLLAPSED");
                  }}
                >
                  <Location colors={color.primaryText} />
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={styles.resultMain}>{place.description || place?.result?.formatted_address}</Text>
                    <Text style={styles.resultSub}>{place.structured_formatting?.secondary_text || ""}</Text>
                  </View>
                </Pressable>
              ))}
            </>
          )}

          {/* To suggestions */}
          {places?.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Destination Suggestions</Text>
              </View>

              {places.map((place, idx) => (
                <Pressable
                  key={`to-${idx}`}
                  style={styles.resultRow}
                  onPress={() => {
                    console.log("📍 Selected Place:", place); // <-- LOG FULL PLACE
                    handlePlaceSelect(
                      place.place_id || place.placeId || place?.result?.place_id,
                      place.description || place?.description || place?.result?.formatted_address
                    );
                    snapTo("COLLAPSED");
                  }}
                >
                  <Gps colors={color.primaryText} />
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={styles.resultMain}>{place.description || place?.result?.formatted_address}</Text>
                    <Text style={styles.resultSub}>{place.structured_formatting?.secondary_text || ""}</Text>
                  </View>
                </Pressable>
              ))}
            </>
          )}

          {/* Saved Places */}
          {!isFindingLocation && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Saved Places</Text>
                <Text style={styles.sectionSub}>{savedLoading ? "Loading..." : `${savedPlaces.length} items`}</Text>
              </View>

              {savedPlaces.length === 0 ? (
                <View style={styles.emptySaved}>
                  <Text style={styles.emptyText}>No saved places yet.</Text>
                </View>
              ) : (
                savedPlaces.map((p, i) => renderSavedPlace(p, i))
              )}
            </>
          )}

        </Animated.ScrollView>
      </View>
    </Animated.View >
  );
}

// styles (kept same as you provided; no layout changes)
const styles = StyleSheet.create({
  handleWrap: {
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: "transparent",
  },
  handle: {
    width: 40,
    height: 6,
    borderRadius: 6,
    backgroundColor: "#333",
    alignSelf: "center",
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    justifyContent: "space-between",
  },
  headerLeft: { padding: 8 },
  headerRight: { padding: 8 },
  headerTitle: {
    fontSize: fontSizes.FONT20,
    fontWeight: "600",
    color: color.primaryText,
    fontFamily: "TT-Octosquares-Medium",
  },

  body: {
    flex: 1,
    paddingHorizontal: 12,
  },

  pickupPill: {
    width: windowWidth(220),
    height: windowHeight(34),
    borderRadius: 22,
    backgroundColor: color.buttonBg,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginVertical: windowHeight(12),
    alignSelf: 'flex-start'
  },
  pickupText: {
    fontSize: fontSizes.FONT15,
    paddingHorizontal: 8,
    fontFamily: "TT-Octosquares-Medium",
    color: color.primary,
  },

  inputsCard: {
    borderWidth: 2,
    borderColor: color.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  autocompleteWrap: {
    flex: 1,
    marginLeft: 8,
    height: 40,
    justifyContent: "center",
  },

  resultsContainer: {
    flex: 1,
    marginTop: 6,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 2,
    marginTop: 12,
    marginBottom: 6,
  },
  sectionTitle: {
    color: color.primaryText,
    fontSize: fontSizes.FONT16,
    fontFamily: "TT-Octosquares-Medium",
  },
  sectionSub: {
    color: color.primaryGray,
    fontSize: fontSizes.FONT12,
    fontFamily: "TT-Octosquares-Medium",

  },

  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: color.primaryGray,
  },
  resultMain: {
    color: color.primaryText,
    fontSize: fontSizes.FONT15,
    fontFamily: "TT-Octosquares-Medium",
  },
  resultText: {
    color: color.primaryText,
    fontSize: fontSizes.FONT15,
    fontFamily: "TT-Octosquares-Medium",
  },
  resultSub: {
    color: color.primaryGray,
    fontSize: fontSizes.FONT12,
    fontFamily: "TT-Octosquares-Medium",
    marginTop: 2,
  },

  emptySaved: {
    paddingVertical: 12,
    alignItems: "center",
  },
  emptyText: {
    color: color.primaryGray,
    fontSize: fontSizes.FONT14,
    fontFamily: "TT-Octosquares-Medium",
  },
});
