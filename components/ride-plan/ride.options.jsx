import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  Animated,
  PanResponder,
  Dimensions,
  Easing,
  Platform,
  StyleSheet,
} from "react-native";
import RideFare from "./ride.fare";
import color from "@/themes/app.colors";
import { fontSizes, windowHeight, windowWidth } from "@/themes/app.constant";
import { LeftArrow } from "@/utils/icons";
import estimateArrivalFromDriver from "@/utils/ride/getEstimatedDriverArrival";
import getEstimatedArrivalTime from "@/utils/ride/getEstimatedArrival";
import Button from "../common/button";
import { CAB_FEATURES } from "@/configs/constants";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const SNAP_POINTS = {
  COLLAPSED: windowHeight(280),
  HALF: Math.round(SCREEN_HEIGHT * 0.55),
  FULL: SCREEN_HEIGHT - (Platform.OS === "ios" ? 40 : 24),
};

export default function RideOptions({
  driverLists = [],
  driverLoader,
  distance,
  district,
  travelTimes = {},
  currentLocation,
  vehicleImages = {},
  vehicleNames = {},
  selectedVehcile,
  setselectedVehcile,
  handleOrder,
  watingForBookingResponse,
  setlocationSelected,
  setWaitingForResponse
}) {
  // Sheet animated value (0..1) -> maps to height between collapsed and full
  const sheetAnim = useRef(new Animated.Value(0)).current; // 0 collapsed, 1 full
  const sheetTranslateY = useRef(new Animated.Value(0)).current; // for gesture
  const panY = useRef(new Animated.Value(0)).current;
  const [expanded, setExpanded] = useState(false);

  // Card controllers per vehicleType
  const cardAnimRefs = useRef({}); // { vehicleType: { expand: Animated.Value(0), arrow: Animated.Value(0), pulse: Animated.Value(1) } }

  // convenience: initialize controllers for a vehicle type
  const ensureCardControllers = (vehicleType) => {
    if (!cardAnimRefs.current[vehicleType]) {
      cardAnimRefs.current[vehicleType] = {
        expand: new Animated.Value(0), // 0 collapsed, 1 expanded
        arrow: new Animated.Value(0), // 0 -> 0deg, 1 -> 180deg
        pulse: new Animated.Value(1), // scale for pulse
      };
    }
    return cardAnimRefs.current[vehicleType];
  };

  // PanResponder for sheet drag
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dy) > 5,
      onPanResponderGrant: () => {
        panY.setValue(0);
      },
      onPanResponderMove: Animated.event(
        [null, { dy: panY }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gesture) => {
        const vy = gesture.vy;
        const dy = gesture.dy;

        // compute new snapshot based on current sheetAnim
        sheetAnim.stopAnimation((val) => {
          // val is between 0 and 1
          // current height:
          const currHeight = getSheetHeightForAnim(val);
          const projected = currHeight - dy - vy * 200;

          // decide nearest snap
          const distances = [
            { key: "COLLAPSED", diff: Math.abs(projected - SNAP_POINTS.COLLAPSED) },
            { key: "HALF", diff: Math.abs(projected - SNAP_POINTS.HALF) },
            { key: "FULL", diff: Math.abs(projected - SNAP_POINTS.FULL) },
          ];
          distances.sort((a, b) => a.diff - b.diff);
          const targetKey = distances[0].key;
          snapTo(targetKey, vy);
        });
        panY.setValue(0);
      }
    })
  ).current;

  // helper: get height for sheetAnim (0..1)
  const getSheetHeightForAnim = (animVal) => {
    // Map animVal 0->COLLAPSED, 0.5->HALF, 1->FULL
    // We'll allow interpolation linear:
    const collapsed = SNAP_POINTS.COLLAPSED;
    const full = SNAP_POINTS.FULL;
    return collapsed + (full - collapsed) * animVal;
  };

  // snapshot of sheetAnim to interpolation values
  const sheetHeight = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [SNAP_POINTS.COLLAPSED, SNAP_POINTS.FULL],
    extrapolate: "clamp",
  });

  const sheetBorderRadius = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 0],
  });

  // Combine panY to temporary translate for drag
  const sheetTranslate = Animated.add(
    panY.interpolate({
      inputRange: [-SCREEN_HEIGHT, 0, SCREEN_HEIGHT],
      outputRange: [-SCREEN_HEIGHT, 0, SCREEN_HEIGHT],
      extrapolate: "clamp",
    }),
    sheetTranslateY
  );

  // snap to named point
  const snapTo = (pointKey, velocity = 0) => {
    let toValue = 0;
    if (pointKey === "COLLAPSED") toValue = 0;
    else if (pointKey === "HALF") {
      // mid value between collapsed and full: compute as fraction
      const frac = (SNAP_POINTS.HALF - SNAP_POINTS.COLLAPSED) / (SNAP_POINTS.FULL - SNAP_POINTS.COLLAPSED);
      toValue = frac;
    } else toValue = 1;

    Animated.spring(sheetAnim, {
      toValue,
      useNativeDriver: false,
      stiffness: 150,
      damping: 20,
      mass: 1,
      overshootClamping: true,
    }).start(() => {
      const isFull = toValue >= 0.95;
      setExpanded(isFull);
    });
  };

  // initialize collapsed on mount
  useEffect(() => {
    sheetAnim.setValue(0);
    setExpanded(false);
  }, []);

  // effect: when parent selectedVehcile changes, animate card expansions accordingly
  useEffect(() => {
    // collapse all, then expand selected
    Object.keys(cardAnimRefs.current).forEach((vehicleType) => {
      const ctrl = cardAnimRefs.current[vehicleType];
      if (!ctrl) return;
      const shouldExpand = vehicleType === selectedVehcile;
      Animated.parallel([
        Animated.timing(ctrl.expand, {
          toValue: shouldExpand ? 1 : 0,
          duration: 260,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(ctrl.arrow, {
          toValue: shouldExpand ? 1 : 0,
          duration: 260,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.sequence(shouldExpand
          ? [
            Animated.timing(ctrl.pulse, { toValue: 1.06, duration: 160, useNativeDriver: true }),
            Animated.timing(ctrl.pulse, { toValue: 1, duration: 300, useNativeDriver: true }),
          ]
          : [Animated.timing(ctrl.pulse, { toValue: 1, duration: 1, useNativeDriver: true })]
        )
      ]).start();
    });
  }, [selectedVehcile]);

  // Helper render function
  const renderCard = (vehicleType) => {
    const driversForType = driverLists.filter(
      (d) => d.vehicle_type === vehicleType && d.latitude && d.longitude
    );
    if (!driversForType || driversForType.length === 0) return null;
    const driver = driversForType[0];
    const ctrl = ensureCardControllers(vehicleType);
    const isSelected = selectedVehcile === vehicleType;

    // animated values for card content
    const cardHeight = ctrl.expand.interpolate({
      inputRange: [0, 1],
      outputRange: [0, windowHeight(400)], // expanded content height
      extrapolate: "clamp",
    });
    const cardOpacity = ctrl.expand.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });
    const cardTranslateY = ctrl.expand.interpolate({
      inputRange: [0, 1],
      outputRange: [10, 0],
    });
    const arrowRotate = ctrl.arrow.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "180deg"],
    });
    const pulseScale = ctrl.pulse; // direct Animated.Value

    return (
      <Animated.View
        key={vehicleType}
        style={[styles.pulseContainer, { transform: [{ scale: pulseScale }] }]}
      >
        {/* !! IMPORTANT FIX !!
        This was changed from <ScrollView> to <View>. 
        The card itself should not be a ScrollView.
      */}
        <View
          style={[
            styles.cardContainer,
            {
              borderColor: isSelected ? color.primaryGray : color.border,
              backgroundColor: color.subPrimary,
            },
          ]}
        >
          {/* === 1. Summary Row (Pressable) === */}
          <Pressable
            onPress={() => {
              const willExpand = !isSelected;
              setselectedVehcile(willExpand ? vehicleType : null);
              if (willExpand && !expanded) {
                snapTo('FULL');
              }
            }}
            style={styles.summaryRow}
          >
            {/* Vehicle Image */}
            <Image
              source={vehicleImages[vehicleType] || vehicleImages['Sedan']}
              style={styles.vehicleImage}
              resizeMode="contain"
            />

            {/* Info Column */}
            <View style={styles.infoContainer}>
              <Text
                style={[
                  styles.vehicleName,
                  { color: color.primaryText, fontSize: fontSizes.FONT18 },
                ]}
              >
                {vehicleNames[vehicleType]}
              </Text>
              {driver && currentLocation && (
                <Text
                  style={[
                    styles.driverEta,
                    { color: color.primaryGray, fontSize: fontSizes.FONT12 },
                  ]}
                >
                  {estimateArrivalFromDriver(driver, currentLocation)} away
                </Text>
              )}
            </View>

            {/* Fare + Arrow Column */}
            <View style={styles.fareContainer}>
              <RideFare driver={driver} distance={distance} district={district} />
              <Animated.View style={{ transform: [{ rotate: arrowRotate }] }}>
                <Text style={[styles.arrowIcon, { color: color.primaryText }]}>
                  {'▾'}
                </Text>
              </Animated.View>
            </View>
          </Pressable>

          <Pressable
            onPress={() => {
              const willExpand = !isSelected;
              setselectedVehcile(willExpand ? vehicleType : null);
            }}
          >

            {/* === 2. Expanded Content (Animated) === */}
            <Animated.View
              style={[
                styles.expandedContainer,
                {
                  // Animated styles
                  height: cardHeight,
                  opacity: cardOpacity,
                  transform: [{ translateY: cardTranslateY }],
                  // Static styles (subtle top border for separation)
                  borderTopColor: '#222',
                },
              ]}
            >
              {/* ScrollView for *internal* details */}
              <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.detailsScrollView}
              >
                {/* Tags (Restyled) */}
                <View style={styles.tagsContainer}>
                  <View style={styles.tag}>
                    <Text
                      style={[
                        styles.tagText,
                        { color: color.primaryText, fontSize: fontSizes.FONT12 },
                      ]}
                    >
                      👤 {driver.capacity} Seats
                    </Text>
                  </View>

                  {distance && (
                    <View style={styles.tag}>
                      <Text
                        style={[
                          styles.tagText,
                          { color: color.primaryText, fontSize: fontSizes.FONT12 },
                        ]}
                      >
                        🚗 {distance.toFixed(1)} km
                      </Text>
                    </View>
                  )}

                  {travelTimes.driving && (
                    <View style={styles.tag}>
                      <Text
                        style={[
                          styles.tagText,
                          { color: color.primaryText, fontSize: fontSizes.FONT10 },
                        ]}
                      >
                        🕒 ETA: {getEstimatedArrivalTime(travelTimes.driving)}
                      </Text>
                    </View>
                  )}
                </View>

                {/* --- Details Section 1: Arrival & Duration --- */}
                <View style={styles.detailSection}>
                  <Text
                    style={[
                      styles.detailHeader,
                      { color: color.primaryText, fontSize: fontSizes.FONT15 },
                    ]}
                  >
                    🚗 Driver arrival: {estimateArrivalFromDriver(
                      driver,
                      currentLocation
                    )}
                  </Text>

                  {travelTimes.driving && (
                    <Text
                      style={[
                        styles.detailText,
                        { color: '#ccc', fontSize: fontSizes.FONT14 },
                      ]}
                    >
                      ⏱ Expected ride duration: {getEstimatedArrivalTime(
                        travelTimes.driving
                      )}
                    </Text>
                  )}
                </View>

                {/* --- Details Section 2: Fare --- */}
                <View style={styles.detailSection}>
                  <Text
                    style={[
                      styles.detailHeader,
                      { color: color.primaryText, fontSize: fontSizes.FONT15 },
                    ]}
                  >
                    💵 Fare Breakdown
                  </Text>
                  {[
                    'Fare calculated based on Km',
                    '5% taxes included in final price',
                  ].map((item, i) => (
                    <Text
                      key={i}
                      style={[
                        styles.detailListItem,
                        { color: '#aaa', fontSize: fontSizes.FONT13 },
                      ]}
                    >
                      • {item}
                    </Text>
                  ))}
                </View>

                {/* --- Details Section 3: Features --- */}
                <View style={styles.detailSection}>
                  <Text
                    style={[
                      styles.detailHeader,
                      { color: color.primaryText, fontSize: fontSizes.FONT15 },
                    ]}
                  >
                    ✨ Features
                  </Text>
                  {CAB_FEATURES[vehicleType].map((feat, idx) => (
                    <Text
                      key={idx}
                      style={[
                        styles.detailListItem,
                        { color: '#aaa', fontSize: fontSizes.FONT13 },
                      ]}
                    >
                      • {feat}
                    </Text>
                  ))}
                </View>

                {/* --- Details Section 4: Safety (no bottom border) --- */}
                <View style={[styles.detailSection, styles.lastDetailSection]}>
                  <Text
                    style={[
                      styles.detailHeader,
                      { color: color.primaryText, fontSize: fontSizes.FONT15 },
                    ]}
                  >
                    🔒 Safety & Info
                  </Text>
                  <Text
                    style={[
                      styles.detailListItem,
                      { color: '#aaa', fontSize: fontSizes.FONT13 },
                    ]}
                  >
                    All rides are monitored for safety. Driver & vehicle details will
                    be shared after booking confirmation.
                  </Text>
                </View>
              </Animated.ScrollView>

            </Animated.View>
          </Pressable>
        </View>
      </Animated.View>
    );
  };

  // If no drivers
  const uniqueVehicleTypes = Array.from(new Set(driverLists?.map((d) => d.vehicle_type)));
  const availableVehicleTypes = uniqueVehicleTypes.filter((vehicleType) =>
    driverLists.some((d) => d.vehicle_type === vehicleType && d.latitude && d.longitude)
  );
  let sortedVehicleTypes;

  if (availableVehicleTypes.length > 0) {
    const vehicleOrder = ["Hatchback", "Sedan", "Suv"];
    sortedVehicleTypes = availableVehicleTypes.sort(
      (a, b) => vehicleOrder.indexOf(a) - vehicleOrder.indexOf(b)
    );
  }

  // sheet container animated style (height + radius)
  const sheetStyle = {
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
    borderColor: "#202020",
  };

  // header shrink animation (optional subtle)
  const headerScale = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.02],
  });

  // toggle full/half when user taps handle
  const toggleSheet = () => {
    sheetAnim.stopAnimation((val) => {
      if (val < 0.5) snapTo("FULL");
      else snapTo("COLLAPSED");
    });
  };

  return (
    <Animated.View style={sheetStyle} {...panResponder.panHandlers}>
      {/* handle */}
      <Animated.View style={{
        padding: 10,
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#1f1f1f",
        transform: [{ scale: headerScale }]
      }}>
        <Pressable onPress={toggleSheet} style={{ width: 60, alignItems: "center" }}>
          <View style={{
            width: 36,
            height: 5,
            borderRadius: 3,
            backgroundColor: "#333",
            marginBottom: 8,
          }} />
        </Pressable>

        {/* Header row */}
        <View style={{
          width: "100%",
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 10,
          justifyContent: "space-between",
        }}>
          <Pressable onPress={() => {
            setlocationSelected(false)
            // setWaitingForResponse(false)
          }}
            style={{ padding: 6 }}
          >
            <LeftArrow />
          </Pressable>
          <Text style={{
            fontSize: 20,
            fontWeight: "600",
            fontFamily: "TT-Octosquares-Medium",
            color: color.primaryText,
          }}>
            Gathering Options
          </Text>

          <View style={{ width: 32 }} />
        </View>
      </Animated.View>

      {/* content */}
      <View style={{ flex: 1 }}>
        {driverLoader ? (
          <View style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}>
            <ActivityIndicator size={"large"} />
          </View>
        ) : (
          availableVehicleTypes.length === 0 ? (
            <View style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              padding: windowWidth(10),
            }}>
              <Text style={{
                fontSize: fontSizes.FONT18,
                color: color.primaryText,
                textAlign: "center",
                fontFamily: 'TT-Octosquares-Medium'
              }}>
                No drivers available in your area.
              </Text>
            </View>
          ) : (
            <>
              {/* Scrollable list inside sheet. When sheet is not full, we disable inner scroll to allow drag */}
              <Animated.ScrollView
                style={{ paddingHorizontal: 10 }}
                contentContainerStyle={{ paddingBottom: 40 }}
                scrollEnabled={expanded}
                showsVerticalScrollIndicator={false}
                // when sheet is not expanded, capture touch to pan instead of scroll
                onScrollBeginDrag={() => {
                  if (!expanded) {
                    // if not expanded, snap to half so user can scroll
                    snapTo("HALF");
                  }
                }}
              >
                {sortedVehicleTypes.map((vehicleType) => renderCard(vehicleType))}
              </Animated.ScrollView>

              {/* Confirm Button fixed at bottom of sheet */}
              <View style={{
                paddingHorizontal: windowWidth(10),
                paddingVertical: 12,
                borderTopWidth: 1,
                borderTopColor: "#1b1b1b",
                backgroundColor: "transparent",
              }}>
                <Button
                  title="Confirm Booking"
                  onPress={() => handleOrder()}
                  disabled={watingForBookingResponse}
                />
              </View>
            </>
          )
        )}
      </View>
    </Animated.View>
  );
}

// Make sure to import StyleSheet from 'react-native'
// Make sure to import StyleSheet from 'react-native'
const styles = StyleSheet.create({
  pulseContainer: {
    marginVertical: 10, // Added a bit more vertical space
  },
  cardContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1, // Base border width
    // --- Premium Finish: Shadow ---
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  vehicleImage: {
    width: 80, // Slightly larger image
    height: 60,
  },
  infoContainer: {
    flex: 1,
    gap: 4,
  },
  vehicleName: {
    fontFamily: 'TT-Octosquares-Medium',
    fontWeight: '600', // Make the name pop
  },
  driverEta: {
    fontFamily: 'TT-Octosquares-Medium',
  },
  fareContainer: {
    alignItems: 'flex-end',
    gap: 8,
  },
  arrowIcon: {
    fontSize: 18,
  },
  expandedContainer: {
    overflow: 'hidden',
    borderTopWidth: 1, // Separator line
  },
  detailsScrollView: {
    // The animated view controls the height
    paddingBottom: 16, // Ensure scroll content has padding at the bottom
    flex: 1
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 16, // Give tags their own vertical space
  },
  // --- Premium Finish: Pill Tags ---
  tag: {
    flexDirection: 'row', // To align icon/emoji with text
    alignItems: 'center',
    gap: 6, // Space between emoji and text
    backgroundColor: 'rgba(255, 255, 255, 0.08)', // More subtle background
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20, // Pill shape
  },
  tagText: {
    fontFamily: 'TT-Octosquares-Medium',
    color: '#E0E0E0', // Slightly brighter text
  },
  // --- Premium Finish: Section Dividers ---
  detailSection: {
    paddingHorizontal: 16, // Indent the content
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222', // Subtle divider
  },
  lastDetailSection: {
    borderBottomWidth: 0, // No border on the last item
  },
  detailHeader: {
    fontFamily: 'TT-Octosquares-Medium',
    marginBottom: 10, // More space after the header
  },
  detailText: {
    fontFamily: 'TT-Octosquares-Medium',
    lineHeight: 22, // Better readability
    marginBottom: 8,
  },
  detailListItem: {
    fontFamily: 'TT-Octosquares-Medium',
    lineHeight: 22, // Better readability
    marginBottom: 6,
  },
});