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

export default function HomeSkeleton() {
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

  const SkeletonBox = ({ width, height, radius = 10, marginBottom = 10 }) => (
    <View
      style={{
        width,
        height,
        borderRadius: radius,
        backgroundColor: "rgba(255,255,255,0.08)",
        overflow: "hidden",
        marginBottom,
      }}
    >
      <ShimmerOverlay />
    </View>
  );

  const HorizontalCardSkeleton = () => (
    <View style={{ marginRight: 12 }}>
      <SkeletonBox width={230} height={150} radius={18} />
      <SkeletonBox width={150} height={14} radius={6} />
      <SkeletonBox width={120} height={12} radius={6} />
    </View>
  );

  const WideCardSkeleton = () => (
    <View style={{ marginRight: 12 }}>
      <SkeletonBox width={280} height={150} radius={18} />
      <SkeletonBox width={180} height={14} radius={6} />
      <SkeletonBox width={150} height={12} radius={6} />
    </View>
  );

  const RideCardSkeleton = () => (
    <View
      style={{
        width: "100%",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
        borderRadius: 12,
        padding: windowWidth(15),
        marginVertical: 8,
        backgroundColor: "rgba(255,255,255,0.05)",
      }}
    >
      <ShimmerOverlay />

      {/* Row 1 */}
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <SkeletonBox width="40%" height={16} marginBottom={8} />
        <SkeletonBox width={80} height={16} marginBottom={8} />
      </View>

      {/* Row 2 */}
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <SkeletonBox width="30%" height={12} />
        <SkeletonBox width="20%" height={12} />
      </View>

      {/* Divider */}
      <View
        style={{
          borderBottomWidth: 1,
          borderColor: "rgba(255,255,255,0.15)",
          marginVertical: 10,
        }}
      />

      {/* Pickup + Drop */}
      <SkeletonBox width="90%" height={14} />
      <SkeletonBox width="85%" height={14} />
    </View>
  );

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingTop: 20,
        paddingHorizontal: 15,
        paddingBottom: 60,
        backgroundColor: color.subPrimary,
      }}
    >
      {/* Sticky header */}
      <SkeletonBox width={80} height={25} radius={6} />
      <SkeletonBox width="100%" height={45} radius={20} marginBottom={25} />

      {/* Hero card */}
      <SkeletonBox width="100%" height={120} radius={20} marginBottom={30} />

      {/* SECTION: Choose Your Ride */}
      <SkeletonBox width={170} height={20} radius={6} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {[1, 2, 3].map((i) => (
          <HorizontalCardSkeleton key={i} />
        ))}
      </ScrollView>

      {/* SECTION: Features */}
      <SkeletonBox width={200} height={20} radius={6} marginBottom={10} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {[1, 2, 3, 4].map((i) => (
          <WideCardSkeleton key={i} />
        ))}
      </ScrollView>

      {/* SECTION: Daily Spots */}
      <SkeletonBox width={190} height={20} radius={6} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {[1, 2, 3, 4, 5].map((i) => (
          <HorizontalCardSkeleton key={i} />
        ))}
      </ScrollView>

      {/* SECTION: Explore More */}
      <SkeletonBox width={210} height={20} radius={6} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {[1, 2, 3, 4].map((i) => (
          <WideCardSkeleton key={i} />
        ))}
      </ScrollView>

      {/* SECTION: Nearby Places */}
      <SkeletonBox width={220} height={20} radius={6} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {[1, 2, 3, 4].map((i) => (
          <WideCardSkeleton key={i} />
        ))}
      </ScrollView>

      {/* Recent Rides */}
      <SkeletonBox width={160} height={20} radius={6} />
      {[1, 2, 3].map((i) => (
        <RideCardSkeleton key={i} />
      ))}
    </ScrollView>
  );
}
