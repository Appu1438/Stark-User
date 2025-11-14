import color from "@/themes/app.colors";
import { fontSizes, windowHeight, windowWidth } from "@/themes/app.constant";
import Images from "@/utils/images";
import { customMapStyle } from "@/utils/map/mapStyle";
import getVehicleIcon from "@/utils/ride/getVehicleIcon";
import React, { useState, useEffect, useRef } from "react";
import { Image, Platform, Text, View } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";

export default function RideRoute({
  currentLocation,
  marker,
  region,
  setRegion,
  currentLocationName,
  destLocationName,
  locationSelected,
  driverLists,
  mapRef
}) {
  const strokeColor = Platform.select({
    ios: color.strokeColor,
    android: color.strokeColor,
  });

  const lineDash = Platform.select({
    ios: [0, 0],
    android: undefined,
  });


  const [pickupPt, setPickupPt] = useState(null);
  const [dropPt, setDropPt] = useState(null);
  const rafRef = useRef(null); // throttle via requestAnimationFrame

  const updateLabelPoints = async () => {
    if (!mapRef?.current) return;
    try {
      if (currentLocation) {
        const p = await mapRef.current.pointForCoordinate(currentLocation);
        setPickupPt(p);
      } else setPickupPt(null);

      if (marker) {
        const d = await mapRef.current.pointForCoordinate(marker);
        setDropPt(d);
      } else setDropPt(null);
    } catch (e) {
      // map not ready yet; ignore
    }
  };

  // call once when layout is ready / props change
  useEffect(() => {
    updateLabelPoints();
  }, [currentLocation, marker]);

  const handleRegionChange = () => {
    if (rafRef.current) return;          // already queued
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      updateLabelPoints();               // keep overlays glued to markers
    });
  };

  const handleRegionChangeComplete = (r) => {
    setRegion?.(r);
    updateLabelPoints();                 // final snap (optional)
  };

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);



  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={region}
        onRegionChange={handleRegionChange}
        onRegionChangeComplete={handleRegionChangeComplete}
        onLayout={updateLabelPoints}
        provider={PROVIDER_GOOGLE}
        customMapStyle={customMapStyle}
        pitchEnabled={false}
        rotateEnabled={false}
      >
        {/* keep your routes / drivers / markers (icon-only) here */}

        {currentLocation && (
          <Marker coordinate={currentLocation} anchor={{ x: 0.5, y: 1 }}>
            <Image
              source={Images.mapMarker}
              style={{
                width: windowWidth(35),
                height: windowHeight(35),
                tintColor: color.primaryGray,
              }}
              resizeMode="contain"
            />
          </Marker>
        )}

        {marker && (
          <Marker coordinate={marker} anchor={{ x: 0.5, y: 1 }}>
            <Image
              source={Images.mapMarker}
              style={{
                width: windowWidth(35),
                height: windowHeight(35),
                tintColor: color.primaryGray,
              }}
              resizeMode="contain"
            />
          </Marker>
        )}

        {/* 🛣️ Route Directions */}
        {currentLocation && marker && (
          <MapViewDirections
            origin={currentLocation}
            destination={marker}
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

        {/* 🚗 Nearby Drivers */}
        {locationSelected &&
          driverLists
            ?.filter(d => d.latitude != null && d.longitude != null)
            .map(driver => (
              <Marker.Animated
                key={driver.id}
                coordinate={driver.animatedLocation}
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <Image
                  source={getVehicleIcon(driver.vehicle_type)}
                  style={{
                    width: 35,
                    height: 35,
                    resizeMode: "contain",
                    transform: [
                      {
                        rotate: `${driver.vehicle_type === "Auto"
                          ? driver.heading + 180
                          : driver.heading
                          }deg`,
                      },
                    ],
                  }}
                />
              </Marker.Animated>
            ))}
      </MapView>

      {/* 🎯 MOVE LABELS OUTSIDE MAPVIEW */}
      {pickupPt && currentLocation && marker && (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: pickupPt.x - 100,
            top: pickupPt.y - 85,
            width: 200,
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: color.buttonBg,
              borderColor: color.border,
              borderWidth: 1,
              borderRadius: 8,
              paddingHorizontal: 10,
              paddingVertical: 4,
              shadowColor: "#000",
              shadowOpacity: 0.25,
              shadowOffset: { width: 0, height: 2 },
              shadowRadius: 3,
              elevation: 3,
              maxWidth: 200,
            }}
          >
            <Text
              style={{
                fontFamily: "TT-Octosquares-Medium",
                fontSize: fontSizes.FONT12,
                color: color.primary,
                textAlign: "center",
              }}
              numberOfLines={2}
            >
              {currentLocationName || "Pickup Point"}
            </Text>
          </View>
          <View
            style={{
              width: 0,
              height: 0,
              borderLeftWidth: 6,
              borderRightWidth: 6,
              borderTopWidth: 6,
              borderLeftColor: "transparent",
              borderRightColor: "transparent",
              borderTopColor: color.buttonBg,
            }}
          />
        </View>
      )}

      {dropPt && currentLocation && marker && (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: dropPt.x - 100,
            top: dropPt.y - 85,
            width: 200,
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: color.buttonBg,
              borderColor: color.border,
              borderWidth: 1,
              borderRadius: 8,
              paddingHorizontal: 10,
              paddingVertical: 4,
              shadowColor: "#000",
              shadowOpacity: 0.25,
              shadowOffset: { width: 0, height: 2 },
              shadowRadius: 3,
              elevation: 3,
              maxWidth: 200,
            }}
          >
            <Text
              style={{
                fontFamily: "TT-Octosquares-Medium",
                fontSize: fontSizes.FONT12,
                color: color.primary,
                textAlign: "center",
              }}
              numberOfLines={2}
            >
              {destLocationName || "Drop Point"}
            </Text>
          </View>
          <View
            style={{
              width: 0,
              height: 0,
              borderLeftWidth: 6,
              borderRightWidth: 6,
              borderTopWidth: 6,
              borderLeftColor: "transparent",
              borderRightColor: "transparent",
              borderTopColor: color.buttonBg,
            }}
          />
        </View>
      )}
    </View>
  );

}
