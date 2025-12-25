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
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import color from "@/themes/app.colors";
import { fontSizes, windowHeight, windowWidth } from "@/themes/app.constant";
import { useGetUserSavedPlaces } from "@/hooks/useGetUserData";
import { Location, Gps } from "@/utils/icons"; // Assuming these are SVG components

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// Adjust snap points for premium feel
const SNAP = {
  COLLAPSED: windowHeight(290), // Slightly taller for better breathing room
  HALF: Math.round(SCREEN_HEIGHT * 0.65),
  FULL: SCREEN_HEIGHT - (Platform.OS === "ios" ? 50 : 30),
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

  const { loading: savedLoading, savedPlaces = [] } = useGetUserSavedPlaces();
  const sheetAnim = useRef(new Animated.Value(0)).current;
  const [expanded, setExpanded] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [pickupPlaceholder, setPickupPlaceholder] = useState(currentLocationName);

  useEffect(() => {
    let placeholder = isFindingLocation
      ? "Fetching location..."
      : currentLocationName === userLocationName
        ? `${currentLocationName}`
        : currentLocationName;
    setPickupPlaceholder(placeholder);
  }, [toggleUserLocation, currentLocationName, isFindingLocation]);

  const sheetHeight = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [SNAP.COLLAPSED, SNAP.FULL],
    extrapolate: "clamp",
  });

  const sheetBorderRadius = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [24, 0], // Smoother radius transition
    extrapolate: "clamp",
  });

  const snapTo = (pointKey) => {
    let toVal = 0;
    if (pointKey === "COLLAPSED") { toVal = 0; Keyboard.dismiss(); }
    else if (pointKey === "HALF") {
      const frac = (SNAP.HALF - SNAP.COLLAPSED) / (SNAP.FULL - SNAP.COLLAPSED);
      toVal = frac;
    } else toVal = 1;

    Animated.spring(sheetAnim, {
      toValue: toVal,
      useNativeDriver: false,
      stiffness: 140,
      damping: 16,
      mass: 1,
    }).start(() => setExpanded(toVal >= 0.95));
  };

  useEffect(() => { sheetAnim.setValue(0); setExpanded(false); }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 10,
      onPanResponderGrant: () => setIsPanning(true),
      onPanResponderMove: () => { },
      onPanResponderRelease: (_, gesture) => {
        const { dy, vy } = gesture;
        sheetAnim.stopAnimation((val) => {
          const currHeight = SNAP.COLLAPSED + (SNAP.FULL - SNAP.COLLAPSED) * val;
          const projected = currHeight - dy - vy * 150;
          const candidates = [
            { key: "COLLAPSED", diff: Math.abs(projected - SNAP.COLLAPSED) },
            { key: "HALF", diff: Math.abs(projected - SNAP.HALF) },
            { key: "FULL", diff: Math.abs(projected - SNAP.FULL) },
          ].sort((a, b) => a.diff - b.diff);
          snapTo(candidates[0].key);
        });
        setTimeout(() => setIsPanning(false), 50);
      },
      onPanResponderTerminate: () => setIsPanning(false),
    })
  ).current;

  const toggleHandle = () => sheetAnim.stopAnimation((val) => {
    if (val < 0.5) snapTo("FULL");
    else snapTo("COLLAPSED");
  });

  const renderSavedPlace = (place, idx) => (
    <Pressable
      key={`saved-${idx}`}
      style={styles.resultRow}
      onPress={() => {
        handlePlaceSelect(place.placeId || place.place_id || place.id, place.address || place.name);
        snapTo("COLLAPSED");
      }}
    >
      <View style={styles.iconBox}>
        <Ionicons name="location" size={20} color={color.primaryText} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.resultMain}>{place.label || place.description}</Text>
        <Text style={styles.resultSub} numberOfLines={1}>{place.address || place.vicinity || ""}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#666" />
    </Pressable>
  );

  return (
    <Animated.View
      style={[styles.sheetContainer, { height: sheetHeight, borderTopLeftRadius: sheetBorderRadius, borderTopRightRadius: sheetBorderRadius }]}
      {...panResponder.panHandlers}
    >
      {/* BACKGROUND GRADIENT */}
      <LinearGradient
        colors={[color.subPrimary, color.bgDark]}
        style={StyleSheet.absoluteFill}
      />

      {/* HANDLE & HEADER */}
      <View style={styles.headerWrapper}>
        <Pressable onPress={toggleHandle} style={styles.handleContainer}>
          <View style={styles.handleBar} />
        </Pressable>

        <View style={styles.navRow}>
          <Pressable
            onPress={() => {
              if (isWaitingForResponse) {
                setAlertConfig({
                  title: "Please Wait",
                  message: "We are processing your booking request.",
                  confirmText: "OK",
                  cancelText: "Exit",
                  onConfirm: () => setShowAlert(false),
                  onCancel: () => router.back()
                });
                setShowAlert(true);
                return;
              }
              router.back();
            }}
            style={styles.iconButton}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </Pressable>

          <Text style={styles.headerTitle}>Plan Your Ride</Text>

          <Pressable
            onPress={() => { if (currentLocation && marker) setlocationSelected(true); }}
            style={styles.iconButton}
          >
            <Ionicons name="map-outline" size={22} color={color.primaryText} />
          </Pressable>
        </View>
      </View>

      {/* CONTENT BODY */}
      <View style={styles.contentBody}>

        {/* INPUTS CARD */}
        <View style={styles.inputCard}>
          {/* Pickup Input */}
          <View style={styles.inputRow}>
            <View style={styles.dotIndicator} />
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>PICKUP</Text>
              <TextInput
                ref={fromSearchInputRef}
                style={styles.textInput}
                placeholder={pickupPlaceholder}
                placeholderTextColor="#666"
                editable={!isFindingLocation}
                value={fromQuery}
                onFocus={() => !isFindingLocation && snapTo("FULL")}
                onChangeText={setFromQuery}
              />
            </View>
          </View>

          {/* Divider Line */}
          <View style={styles.dividerContainer}>
            <View style={styles.verticalLine} />
          </View>

          {/* Dropoff Input */}
          <View style={styles.inputRow}>
            <View style={[styles.dotIndicator, { backgroundColor: color.primaryText }]} />
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>DROP-OFF</Text>
              <TextInput
                ref={toSearchInputRef}
                style={styles.textInput}
                placeholder={destLocationName}
                placeholderTextColor="#666"
                editable={!isFindingLocation}
                value={query}
                onFocus={() => !isFindingLocation && snapTo("FULL")}
                onChangeText={setQuery}
              />
            </View>
          </View>
        </View>

        {/* RESULTS LIST */}
        <Animated.ScrollView
          contentContainerStyle={styles.scrollList}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={() => { if (!expanded) snapTo("HALF"); }}
        >

          {/* Use Current Location Option */}
          {!isFindingLocation && userLocation && (
            <Pressable
              style={styles.currentLocationRow}
              onPress={() => {
                toggleUserLocation(prev => !prev);
                setFromQuery("");
                snapTo("COLLAPSED");
              }}
            >
              <View style={[styles.iconBox, { backgroundColor: 'rgba(0, 224, 255, 0.1)' }]}>
                <Ionicons name="navigate" size={18} color={color.primaryText} />
              </View>
              <Text style={styles.currentLocationText}>Use Current Location</Text>
            </Pressable>
          )}

          {/* Suggestions */}
          {(fromPlaces?.length > 0 || places?.length > 0) ? (
            <>
              {fromPlaces?.length > 0 && <Text style={styles.sectionHeader}>Pickup Suggestions</Text>}
              {fromPlaces.map((place, idx) => (
                <Pressable
                  key={`from-${idx}`}
                  style={styles.resultRow}
                  onPress={() => {
                    handleFromPlaceSelect(place.place_id || place.placeId, place.description);
                    snapTo("COLLAPSED");
                  }}
                >
                  <View style={styles.iconBox}><Ionicons name="location-outline" size={20} color="#ccc" /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.resultMain}>{place.description}</Text>
                    <Text style={styles.resultSub} numberOfLines={1}>{place.structured_formatting?.secondary_text}</Text>
                  </View>
                </Pressable>
              ))}

              {places?.length > 0 && <Text style={styles.sectionHeader}>Destinations</Text>}
              {places.map((place, idx) => (
                <Pressable
                  key={`to-${idx}`}
                  style={styles.resultRow}
                  onPress={() => {
                    handlePlaceSelect(place.place_id || place.placeId, place.description);
                    snapTo("COLLAPSED");
                  }}
                >
                  <View style={styles.iconBox}><Ionicons name="flag-outline" size={20} color="#ccc" /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.resultMain}>{place.description}</Text>
                    <Text style={styles.resultSub} numberOfLines={1}>{place.structured_formatting?.secondary_text}</Text>
                  </View>
                </Pressable>
              ))}
            </>
          ) : (
            // SAVED PLACES (Only show if not searching)
            !isFindingLocation && (
              <>
                <View style={styles.savedHeader}>
                  <Text style={styles.sectionHeader}>Saved Places</Text>
                  <Text style={styles.savedCount}>{savedLoading ? "..." : savedPlaces.length}</Text>
                </View>
                {savedPlaces.length === 0 ? (
                  <Text style={styles.emptyText}>No saved places yet.</Text>
                ) : (
                  savedPlaces.map((p, i) => renderSavedPlace(p, i))
                )}
              </>
            )
          )}

        </Animated.ScrollView>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheetContainer: {
    position: "absolute",
    left: 0, right: 0, bottom: 0,
    backgroundColor: color.subPrimary,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },

  // Header Area
  headerWrapper: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 5 },
  handleContainer: { width: '100%', alignItems: 'center', paddingVertical: 10 },
  handleBar: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)' },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  iconButton: { padding: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 },
  headerTitle: { fontSize: fontSizes.FONT18, color: '#fff', fontFamily: "TT-Octosquares-Medium" },

  // Body
  contentBody: { flex: 1, paddingHorizontal: 20 },

  // Inputs Card
  inputCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginTop: 15,
    marginBottom: 10,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  dotIndicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#888', marginTop: 14 },
  inputWrapper: { flex: 1, marginLeft: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', paddingBottom: 8 },
  inputLabel: { fontSize: fontSizes.FONT10, color: '#666', fontFamily: "TT-Octosquares-Medium", marginBottom: 2, letterSpacing: 1 },
  textInput: { fontSize: fontSizes.FONT16, color: '#fff', fontFamily: "TT-Octosquares-Medium", height: 24, padding: 0 },
  dividerContainer: { marginLeft: 3.5, height: 20, justifyContent: 'center' },
  verticalLine: { width: 1, height: '100%', backgroundColor: 'rgba(255,255,255,0.1)' },

  // List
  scrollList: { paddingBottom: 100, paddingTop: 10 },
  currentLocationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 5 },
  currentLocationText: { fontSize: fontSizes.FONT16, color: color.primaryText, fontFamily: "TT-Octosquares-Medium", marginLeft: 0 },

  sectionHeader: { fontSize: fontSizes.FONT14, color: '#666', fontFamily: "TT-Octosquares-Medium", marginTop: 15, marginBottom: 10, textTransform: 'uppercase' },
  savedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, marginBottom: 10 },
  savedCount: { fontSize: fontSizes.FONT12, color: '#444', fontFamily: "TT-Octosquares-Medium" },

  resultRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.03)' },
  iconBox: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  resultMain: { fontSize: fontSizes.FONT16, color: '#eee', fontFamily: "TT-Octosquares-Medium" },
  resultSub: { fontSize: fontSizes.FONT12, color: '#888', marginTop: 3, fontFamily: "TT-Octosquares-Medium" },
  emptyText: { fontSize: fontSizes.FONT14, color: '#555', textAlign: 'center', marginTop: 20, fontFamily: "TT-Octosquares-Medium" },
});