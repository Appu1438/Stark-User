import React, { useEffect, useRef } from "react";
import { View, Animated, ScrollView, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import color from "@/themes/app.colors";
import { windowHeight, windowWidth } from "@/themes/app.constant";

export default function RideDetailsSkeleton() {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1300,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, Dimensions.get("window").width + 200],
  });

  const ShimmerOverlay = () => (
    <Animated.View
      style={{
        ...StyleSheet.absoluteFillObject,
        transform: [{ translateX }],
      }}
    >
      <LinearGradient
        colors={["transparent", "rgba(255,255,255,0.25)", "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ flex: 1 }}
      />
    </Animated.View>
  );

  const SkeletonBox = ({ width, height, radius = 8, marginBottom = 10, style }) => (
    <View
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: "rgba(255,255,255,0.08)",
          overflow: "hidden",
          marginBottom,
        },
        style,
      ]}
    >
      <ShimmerOverlay />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: color.bgDark }}>
      {/* ---------- MAP SKELETON ---------- */}
      <View
        style={{
          width: "100%",
          height: windowHeight(450),
          backgroundColor: "rgba(255,255,255,0.08)",
          overflow: "hidden",
        }}
      >
        <ShimmerOverlay />
      </View>

      {/* ---------- CARD / DETAILS SECTION ---------- */}
      <View
        style={{
          flex: 1,
          marginTop: -40,
          backgroundColor: color.subPrimary,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          padding: windowWidth(25),
          paddingTop: 20,
        }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header + Status */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <SkeletonBox width={150} height={20} />
            <SkeletonBox width={90} height={25} radius={12} />
          </View>

          {/* Driver Info */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 15,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: color.border,
              marginBottom: 20,
            }}
          >
            <SkeletonBox width={64} height={64} radius={16} style={{ marginRight: 15 }} />
            <View style={{ flex: 1 }}>
              <SkeletonBox width={"60%"} height={18} />
              <SkeletonBox width={"40%"} height={14} />
              <SkeletonBox width={"70%"} height={14} />
            </View>
          </View>

          {/* Trip Info */}
          <SkeletonBox width={"40%"} height={16} marginBottom={8} />
          <SkeletonBox width={"100%"} height={50} marginBottom={10} />
          <SkeletonBox width={"100%"} height={50} marginBottom={20} />

          {/* Fare Details */}
          <View
            style={{
              borderRadius: 16,
              borderWidth: 1,
              borderColor: color.border,
              padding: 15,
              marginBottom: 25,
            }}
          >
            {[1, 2, 3, 4].map((_, idx) => (
              <View
                key={idx}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <SkeletonBox width={"35%"} height={16} />
                <SkeletonBox width={"25%"} height={16} />
              </View>
            ))}
          </View>

          {/* Rating Section */}
          <View
            style={{
              borderRadius: 16,
              borderWidth: 1,
              borderColor: color.border,
              padding: 20,
              alignItems: "center",
              marginBottom: 25,
            }}
          >
            <SkeletonBox width={140} height={16} marginBottom={10} />
            <View style={{ flexDirection: "row", justifyContent: "center" }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <SkeletonBox
                  key={i}
                  width={24}
                  height={24}
                  radius={12}
                  style={{ marginHorizontal: 8 }}
                />
              ))}
            </View>
          </View>

          {/* Buttons */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 25,
            }}
          >
            <SkeletonBox width={"30%"} height={45} radius={10} />
            <SkeletonBox width={"30%"} height={45} radius={10} />
            <SkeletonBox width={"30%"} height={45} radius={10} />
          </View>

          {/* Footer */}
          <SkeletonBox width={"70%"} height={14} radius={6} marginBottom={50} />
        </ScrollView>
      </View>
    </View>
  );
}
