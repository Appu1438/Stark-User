import React, { useEffect, useRef } from "react";
import {
  View,
  Animated,
  Dimensions,
  StyleSheet,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import color from "@/themes/app.colors";
import { windowHeight, windowWidth } from "@/themes/app.constant";

export default function ProfileSkeleton() {
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

  const SkeletonBox = ({
    width,
    height,
    radius = 10,
    marginBottom = 10,
    marginTop = 0,
  }) => (
    <View
      style={{
        width,
        height,
        borderRadius: radius,
        backgroundColor: "rgba(255,255,255,0.08)",
        overflow: "hidden",
        marginBottom,
        marginTop,
      }}
    >
      <ShimmerOverlay />
    </View>
  );

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        alignItems: "center",
        paddingBottom: 50,
        backgroundColor: color.background,
      }}
    >
      {/* ---------- HEADER ---------- */}
      <View
        style={{
          width: "100%",
          height: windowHeight(270),
          justifyContent: "center",
          alignItems: "center",
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
          backgroundColor: color.subPrimary,
        }}
      >
        <SkeletonBox width={115} height={115} radius={60} marginBottom={12} />
        <SkeletonBox width={120} height={18} />
        <SkeletonBox width={90} height={14} marginTop={6} />
      </View>

      {/* ---------- STATS CARD ---------- */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
          width: windowWidth(320),
          height: windowHeight(70),
          borderRadius: 20,
          backgroundColor: color.subPrimary,
          marginTop: windowHeight(-40),
          overflow: "hidden",
        }}
      >
        <SkeletonBox width={60} height={40} />
        <SkeletonBox width={60} height={40} />
      </View>

      {/* ---------- ACCOUNT DETAILS ---------- */}
      <View style={{ marginTop: 50, width: "85%" }}>
        <SkeletonBox width={150} height={18} marginBottom={16} />
        {[1, 2, 3].map((i) => (
          <SkeletonBox key={i} width="100%" height={40} marginBottom={10} />
        ))}
      </View>

      {/* ---------- SUPPORT & HELP ---------- */}
      <View style={{ marginTop: 45, width: "85%" }}>
        <SkeletonBox width={140} height={18} marginBottom={16} />
        {[1, 2].map((i) => (
          <SkeletonBox key={i} width="100%" height={40} marginBottom={10} />
        ))}
      </View>

      {/* ---------- LEGAL SECTION ---------- */}
      <View style={{ marginTop: 45, width: "85%" }}>
        <SkeletonBox width={160} height={18} marginBottom={16} />
        <SkeletonBox width="100%" height={40} />
      </View>

      {/* ---------- LOGOUT BUTTON ---------- */}
      <SkeletonBox
        width="85%"
        height={50}
        radius={14}
        marginBottom={50}
        marginTop={60}
      />
    </ScrollView>
  );
}
