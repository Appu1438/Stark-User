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

// Maximum distance (km) for showing Auto option
const AUTO_MAX_DISTANCE = 25;

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
  const cardAnimRefs = useRef({});

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
            Animated.timing(ctrl.pulse, { toValue: 1.02, duration: 160, useNativeDriver: true }),
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
      outputRange: [0, windowHeight(430)], // Slightly increased for better spacing
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
        <View
          style={[
            styles.cardContainer,
            {
              borderColor: isSelected ? color.primaryGray : 'rgba(255,255,255,0.08)',
              backgroundColor: color.subPrimary,
              elevation: isSelected ? 10 : 2,
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
                  height: cardHeight,
                  opacity: cardOpacity,
                  transform: [{ translateY: cardTranslateY }],
                  borderTopColor: 'rgba(255,255,255,0.05)',
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
                    <Text style={[styles.tagText, { color: color.primaryText, fontSize: fontSizes.FONT12 }]}>
                      Capacity : {driver.capacity} Seats
                    </Text>
                  </View>

                  {distance && (
                    <View style={styles.tag}>
                      <Text style={[styles.tagText, { color: color.primaryText, fontSize: fontSizes.FONT12 }]}>
                        Distance : {Number(distance).toFixed(1)} km
                      </Text>
                    </View>
                  )}

                  {travelTimes.driving && (
                    <View style={styles.tag}>
                      <Text style={[styles.tagText, { color: color.primaryText, fontSize: fontSizes.FONT12 }]}>
                        Drop Off : {getEstimatedArrivalTime(travelTimes.driving)}
                      </Text>
                    </View>
                  )}
                </View>

                {/* --- Details Section 1: Arrival & Duration --- */}
                <View style={styles.detailSection}>
                  <Text style={[styles.premiumHeader, { color: color.primaryGray }]}>
                    TRIP DETAILS
                  </Text>
                  <Text style={[styles.detailText, { color: color.primaryText, fontSize: fontSizes.FONT15 }]}>
                    Driver arrival in {estimateArrivalFromDriver(driver, currentLocation)}
                  </Text>

                  {travelTimes.driving && (
                    <Text style={[styles.detailSubText, { color: '#888', fontSize: fontSizes.FONT13 }]}>
                      Expected drop off : {getEstimatedArrivalTime(travelTimes.driving)}
                    </Text>
                  )}
                </View>

                {/* --- Details Section 2: Fare --- */}
                <View style={styles.detailSection}>
                  <Text style={[styles.premiumHeader, { color: color.primaryGray }]}>
                    FARE BREAKDOWN
                  </Text>
                  {[
                    'Base fare calculated based on Km',
                    'Includes applicable taxes (5%)',
                  ].map((item, i) => (
                    <View key={i} style={styles.bulletRow}>
                      <View style={styles.bullet} />
                      <Text style={[styles.detailListItem, { color: '#aaa', fontSize: fontSizes.FONT13 }]}>
                        {item}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* --- Details Section 3: Features --- */}
                <View style={styles.detailSection}>
                  <Text style={[styles.premiumHeader, { color: color.primaryGray }]}>
                    VEHICLE FEATURES
                  </Text>
                  {(CAB_FEATURES[vehicleType] || []).map((feat, idx) => (
                    <View key={idx} style={styles.bulletRow}>
                      <View style={styles.bullet} />
                      <Text style={[styles.detailListItem, { color: '#ddd', fontSize: fontSizes.FONT13 }]}>
                        {feat}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* --- Details Section 4: IMPORTANT NOTE (Replaces Safety) --- */}
                <View style={[styles.detailSection, styles.lastDetailSection]}>
                  <View style={styles.noteContainer}>
                    <View style={styles.noteHeaderRow}>
                      <Text style={[styles.premiumHeader, { color: color.primaryText, marginBottom: 0 }]}>
                        IMPORTANT NOTE
                      </Text>
                    </View>
                    <Text style={[styles.detailListItem, { color: '#ccc', fontSize: fontSizes.FONT13, lineHeight: 20, marginTop: 4 }]}>
                      Tolls, parking fees, and interstate permits are extra and applicable over the fare.
                    </Text>
                  </View>
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
  // filter only vehicle types that have valid lat/lng
  const availableVehicleTypes = uniqueVehicleTypes.filter((vehicleType) =>
    driverLists.some((d) => d.vehicle_type === vehicleType && d.latitude && d.longitude)
  );

  // Exclude Auto when distance > AUTO_MAX_DISTANCE
  const numericDistance = Number(distance);
  const filteredVehicleTypes = availableVehicleTypes.filter((v) => {
    if (v === "Auto" && !Number.isNaN(numericDistance) && numericDistance > AUTO_MAX_DISTANCE) {
      return false;
    }
    return true;
  });

  let sortedVehicleTypes = filteredVehicleTypes;
  if (filteredVehicleTypes.length > 0) {
    const vehicleOrder = ["Auto", "Hatchback", "Sedan", "Suv"];
    sortedVehicleTypes = filteredVehicleTypes.sort(
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
    outputRange: [1, 1.01],
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
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "rgba(255,255,255,0.1)",
        transform: [{ scale: headerScale }]
      }}>
        <Pressable onPress={toggleSheet} style={{ width: 60, alignItems: "center", paddingBottom: 5 }}>
          <View style={{
            width: 40,
            height: 4,
            borderRadius: 2,
            backgroundColor: "rgba(255,255,255,0.3)",
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
            letterSpacing: 0.5
          }}>
            {driverLoader ? 'Gathering Options' : ' Select Ride'}
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
            <ActivityIndicator size={"large"} color={color.primaryGray} />
          </View>
        ) : (
          (sortedVehicleTypes.length === 0) ? (
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
                contentContainerStyle={{ paddingBottom: 40, paddingTop: 10 }}
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
                borderTopWidth: StyleSheet.hairlineWidth,
                borderTopColor: "rgba(255,255,255,0.1)",
                backgroundColor: "transparent",
              }}>
                <Button
                  title={watingForBookingResponse ? <ActivityIndicator color={color.primary} /> : "Confirm Booking"}
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

const styles = StyleSheet.create({
  pulseContainer: {
    marginVertical: 6,
  },
  cardContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    // --- Premium Shadow ---
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  vehicleImage: {
    width: 85,
    height: 60,
  },
  infoContainer: {
    flex: 1,
    gap: 4,
    justifyContent: 'center'
  },
  vehicleName: {
    fontFamily: 'TT-Octosquares-Medium',
    letterSpacing: 0.5,
  },
  driverEta: {
    fontFamily: 'TT-Octosquares-Medium',
    opacity: 0.8
  },
  fareContainer: {
    alignItems: 'flex-end',
    gap: 6,
  },
  arrowIcon: {
    fontSize: 20,
    opacity: 0.7
  },
  expandedContainer: {
    overflow: 'hidden',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  detailsScrollView: {
    paddingBottom: 20,
    flex: 1
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  tagText: {
    fontFamily: 'TT-Octosquares-Medium',
    opacity: 0.9,
  },
  detailSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  lastDetailSection: {
    borderBottomWidth: 0,
  },
  premiumHeader: {
    fontFamily: 'TT-Octosquares-Medium',
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
    opacity: 0.7,
  },
  detailText: {
    fontFamily: 'TT-Octosquares-Medium',
    lineHeight: 22,
    marginBottom: 4,
  },
  detailSubText: {
    fontFamily: 'TT-Octosquares-Medium',
    marginTop: 2
  },
  detailListItem: {
    fontFamily: 'TT-Octosquares-Medium',
    lineHeight: 20,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#666',
    marginTop: 8,
    marginRight: 10,
  },
  noteContainer: {
    backgroundColor: 'rgba(255, 200, 0, 0.05)', // Very subtle yellow tint
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 200, 0, 0.1)',
  },
  noteHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6
  }
});
