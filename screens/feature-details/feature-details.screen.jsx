import React from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  Dimensions,
  StyleSheet,
  Platform,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import color from "@/themes/app.colors";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  FadeIn,
  SlideInDown,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons"; // Standard Expo Icon Library

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

export default function FeatureDetails() {
  const { title, quote, image } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      {/* Background Image with Gradient Overlay */}
      <View style={styles.imageContainer}>
        <Image
          source={image} // Ensure this is a valid URI or require path
          style={styles.heroImage}
          resizeMode="cover"
        />
        {/* Dark Gradient Overlay for text readability & smooth transition */}
        <LinearGradient
          colors={[
            "rgba(0,0,0,0.1)",
            "rgba(0,0,0,0.0)",
            color.primary || "#000",
          ]}
          locations={[0, 0.6, 1]}
          style={styles.gradientOverlay}
        />
      </View>

      {/* Header / Back Button */}
      <Animated.View
        entering={FadeIn.delay(1000).duration(1000)}
        style={styles.headerContainer}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={color.primaryText || "#FFF"}
          />
        </Pressable>
      </Animated.View>

      {/* Scrollable Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
      >
        {/* Spacer to push content below image */}
        <View style={{ height: SCREEN_HEIGHT * 0.45 }} />

        <Animated.View
          entering={FadeIn.delay(500).duration(1000)}
        >
          {/* Decorative Tag/Line */}
          <View style={styles.decorativeLine} />

          {/* Title */}
          <Text style={styles.titleText}>{title}</Text>

          {/* Description / Quote */}
          <Text style={styles.quoteText}>{quote}</Text>

          {/* Extra padding at bottom so text isn't covered by button */}
          <View style={{ height: 120 }} />
        </Animated.View>
      </ScrollView>

      {/* Fixed Bottom Action Bar */}
      <Animated.View
        entering={SlideInDown.delay(500).duration(2000)}
        style={styles.bottomBarContainer}
      >
        {/* Subtle gradient behind button for depth */}
        <LinearGradient
          colors={['transparent', color.primary || '#000']}
          style={styles.bottomGradientParams}
          pointerEvents="none"
        />

        <Pressable
          onPress={() => router.push("/(routes)/ride-plan")}
          style={({ pressed }) => [
            styles.actionButton,
            { transform: [{ scale: pressed ? 0.98 : 1 }] },
          ]}
        >
          <Text style={styles.actionButtonText}>Book a Ride</Text>
          <Ionicons
            name="arrow-forward"
            size={20}
            color={color.primary || "#000"}
            style={{ marginLeft: 8 }}
          />
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.primary || "#000",
  },
  imageContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.6, // Image takes up 60% of screen initially
    zIndex: 0,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  gradientOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "100%",
  },
  headerContainer: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 40,
    left: 20,
    zIndex: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.3)", // Glass effect base
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)", // Subtle border
    backdropFilter: "blur(10px)", // Works on web, ignored on native but looks okay
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  decorativeLine: {
    width: 40,
    height: 4,
    backgroundColor: color.buttonBg || "#FFF", // Accent color
    marginBottom: 20,
    borderRadius: 2,
  },
  titleText: {
    fontFamily: "TT-Octosquares-Medium",
    fontSize: 34,
    color: color.primaryText || "#FFF",
    marginBottom: 16,
    letterSpacing: 0.5,
    textTransform: "capitalize",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  quoteText: {
    fontFamily: "TT-Octosquares-Medium",
    fontSize: 16,
    color: color.secondaryFont || "#AAA",
    lineHeight: 28, // Increased line height for elegance
    letterSpacing: 0.3,
  },
  bottomBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    paddingTop: 20,
    zIndex: 20,
  },
  bottomGradientParams: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: -40, // Fade out upwards
  },
  actionButton: {
    backgroundColor: color.buttonBg || "#FFF",
    borderRadius: 16,
    height: 56,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    // Premium Shadow
    shadowColor: color.buttonBg || "#FFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  actionButtonText: {
    fontFamily: "TT-Octosquares-Medium",
    fontSize: 16,
    color: color.primary || "#000",
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
});