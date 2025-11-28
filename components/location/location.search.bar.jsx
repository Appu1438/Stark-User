import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  Animated,
  Easing,
  StyleSheet,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Search, Clock } from "@/utils/icons";
import DownArrow from "@/assets/icons/downArrow";
import color from "@/themes/app.colors";
import { fontSizes, windowHeight, windowWidth } from "@/themes/app.constant";

export default function LocationSearchBar() {
  const quotes = [
    "Where to?",
    "Your next stop?",
    "Ready for a ride?",
    "Heading somewhere?",
    "Let’s go!",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // ✨ Animate between quote texts smoothly
  useEffect(() => {
    const interval = setInterval(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 600,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -6,
          duration: 600,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentIndex((prev) => (prev + 1) % quotes.length);
        slideAnim.setValue(6);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 600,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Pressable
      style={styles.container}
      onPress={() => router.push("/(routes)/ride-plan")}
    >
      {/* Glass-like gradient background */}
      <LinearGradient
        colors={[
          "rgba(255, 255, 255, 0.05)",
          "rgba(255, 255, 255, 0.02)",
          "transparent",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Left Section */}
      <View style={styles.leftSection}>
        <View style={styles.searchIconContainer}>
          <Search width={18} height={18} color={color.primaryText} />
        </View>
        <Animated.Text
          style={[
            styles.placeholderText,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {quotes[currentIndex]}
        </Animated.Text>
      </View>

      {/* Right Section (Now button) */}
      {/* Right section */}
      <View style={styles.rightSection}>
        <Clock />
        <Text style={styles.nowText}>Now</Text>
        {/* <DownArrow /> */}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: color.bgDark,
    height: windowHeight(42),
    borderRadius: windowHeight(20),
    marginTop: windowHeight(12),
    paddingHorizontal: windowWidth(14),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1.5,
    borderColor: color.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
    overflow: "hidden",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: windowWidth(10),
  },
  searchIconContainer: {
    // backgroundColor: "rgba(255,255,255,0.05)",
    padding: 6,
    borderRadius: 10,
  },
  placeholderText: {
    fontSize: fontSizes.FONT15,
    fontWeight: "500",
    color: color.primaryText,
    fontFamily: "TT-Octosquares-Medium",
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: color.buttonBg,
    borderRadius: 20,
    paddingHorizontal: windowWidth(10),
    height: windowHeight(28),
  },
  nowText: {
    fontSize: windowHeight(12),
    fontWeight: "600",
    paddingHorizontal: windowWidth(5),
    fontFamily: 'TT-Octosquares-Medium'

  },
});
