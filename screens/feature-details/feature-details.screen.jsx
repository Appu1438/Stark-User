import { View, Text, Image, Pressable, ScrollView, Dimensions } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import color from "@/themes/app.colors";
import { fontSizes } from "@/themes/app.constant";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { SlideInUp , SlideInDown} from "react-native-reanimated";



export default function FeatureDetails() {
  const { title, quote, image } = useLocalSearchParams();

  const screenHeight = Dimensions.get("window").height;

  return (
    <Animated.View
      entering={SlideInUp.duration(1000)}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1, backgroundColor: color.primary }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 120, // space for fixed button
          }}
        >
          {/* HERO IMAGE */}
          <View style={{ width: "100%", height: screenHeight * 0.38 }}>
            <Image
              source={image}
              style={{
                width: "100%",
                height: "100%",
              }}
              resizeMode="cover"
            />

            {/* Gradient overlay for better text visibility if needed */}
            <LinearGradient
              colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0)"]}
              style={{ position: "absolute", width: "100%", height: "100%" }}
            />
          </View>

          {/* CONTENT */}
          <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
            {/* TITLE */}
            <Text
              style={{
                color: color.primaryText,
                fontFamily: "TT-Octosquares-Medium",
                fontSize: 26,
                marginBottom: 10,
              }}
            >
              {title}
            </Text>

            {/* DESCRIPTION */}
            <Text
              style={{
                color: color.secondaryFont,
                fontFamily: "TT-Octosquares-Medium",
                fontSize: 15,
                lineHeight: 24,
                paddingRight: 10,
              }}
            >
              {quote}
            </Text>
          </View>
        </ScrollView>

        {/* FIXED BOTTOM BUTTON */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: 20,
            backgroundColor: color.bgDark,
            borderTopColor: color.darkBorder,
            borderTopWidth: 1,
          }}
        >
          <Pressable
            onPress={() => router.push("/(routes)/ride-plan")}
            style={{
              paddingVertical: 16,
              borderRadius: 14,
              backgroundColor: color.buttonBg,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: color.primary,
                fontFamily: "TT-Octosquares-Medium",
                fontSize: 17,
              }}
            >
              Book a Ride →
            </Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>

  );
}
