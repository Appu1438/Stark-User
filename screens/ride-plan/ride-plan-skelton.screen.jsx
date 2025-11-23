import React, { useRef, useEffect } from "react";
import { View, Animated, StyleSheet, Dimensions } from "react-native";
import color from "@/themes/app.colors";

const { width } = Dimensions.get("window");

export default function SkeletonRidePlan() {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  // FIXED: Now it returns a *new* component each time
  const ShimmerOverlay = () => (
    <Animated.View
      style={[
        styles.shimmer,
        {
          transform: [{ translateX }],
        },
      ]}
    />
  );

  const Block = ({ style }) => (
    <View style={[styles.skeletonBlock, style]}>
      <ShimmerOverlay />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.mapSkeleton}>
        <ShimmerOverlay />
      </View>

      <View style={styles.sheetSkeleton}>
        <Block style={{ width: 80, height: 8, marginVertical: 10 }} />
        <Block style={styles.inputSkeleton} />
        <Block style={[styles.inputSkeleton, { marginTop: 12 }]} />

        <Block style={{ width: 140, height: 8, marginTop: 20 }} />

        <Block style={styles.listItemSkeleton} />
        <Block style={styles.listItemSkeleton} />
        <Block style={styles.listItemSkeleton} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    backgroundColor: "rgba(0,0,0,0.6)",
  },

  shimmer: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: "50%",
    backgroundColor: "rgba(255,255,255,0.15)",
    opacity: 0.7,
    borderRadius: 10,
  },

  mapSkeleton: {
    height: "55%",
    backgroundColor: "#1A1A1A",
    overflow: "hidden",
  },

  sheetSkeleton: {
    flex: 1,
    padding: 15,
    backgroundColor: color.subPrimary,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },

  skeletonBlock: {
    backgroundColor: "#222",
    overflow: "hidden",
    borderRadius: 10,
  },

  inputSkeleton: {
    height: 45,
    width: "100%",
    borderRadius: 10,
  },

  listItemSkeleton: {
    width: "100%",
    height: 50,
    marginTop: 14,
    borderRadius: 10,
  },
});
