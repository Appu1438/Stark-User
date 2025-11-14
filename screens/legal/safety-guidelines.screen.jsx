import { View, Text, ScrollView } from "react-native";
import React from "react";
import { fontSizes, windowHeight, windowWidth } from "@/themes/app.constant";
import color from "@/themes/app.colors";

export default function SafetyGuidelines() {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{
        flex: 1,
        backgroundColor: color.background,
        paddingHorizontal: windowWidth(20),
        paddingTop: windowHeight(40),
        paddingBottom: windowHeight(50),
      }}
    >
      <Text
        style={{
          fontSize: fontSizes.FONT26,
          fontFamily: "TT-Octosquares-Medium",
          color: color.primaryText,
          marginBottom: 25,
          textAlign: "center",
        }}
      >
        Safety Guidelines
      </Text>

      <Section
        title="1. Commitment to Safety"
        content={`Your safety is our top priority. We continuously work to maintain a secure and reliable environment for both riders and drivers. Our platform includes features, policies, and monitoring tools designed to protect everyone throughout the ride experience.`}
      />

      <Section
        title="2. Verified Drivers"
        content={`All drivers undergo identity verification, driving-license checks, and background screening before being approved. Regular evaluations ensure drivers continue to meet our community standards.`}
      />

      <Section
        title="3. Safe Riding Practices"
        content={`• Always verify the vehicle number and driver name before starting your ride.\n• Wear your seatbelt during the entire journey.\n• Avoid sharing personal details with drivers or co-passengers.\n• Do not request the driver to violate traffic or route rules.\n• Keep valuables secured and avoid displaying large amounts of cash.`}
      />

      <Section
        title="4. In-App Safety Features"
        content={`Our app includes multiple tools to enhance your safety:\n• Live ride tracking and share-trip feature.\n• Emergency assistance or SOS button connecting you directly with support or local authorities.\n• Driver and trip rating system to ensure accountability.\n• Real-time GPS monitoring of active rides.`}
      />

      <Section
        title="5. Conduct Expectations"
        content={`We expect all users and drivers to treat each other with mutual respect and courtesy. Any form of verbal or physical harassment, discrimination, or unsafe conduct will lead to investigation and may result in suspension or permanent account deactivation.`}
      />

      <Section
        title="6. Night-Time & Solo Travel Tips"
        content={`• Share your live trip status with trusted contacts.\n• Confirm the route shown in the app before the trip starts.\n• Prefer well-lit pickup and drop-off points.\n• If you feel unsafe at any time, use the emergency button or contact support immediately.`}
      />

      <Section
        title="7. Health & Hygiene"
        content={`Drivers and riders are encouraged to maintain cleanliness and hygiene inside the vehicle. Smoking, alcohol, or any prohibited substance use during rides is strictly forbidden.`}
      />

      <Section
        title="8. Reporting Safety Concerns"
        content={`If you experience or witness unsafe behavior, please report it through the “Help & Support” section of the App or contact our safety team at support@yourapp.com. All reports are treated seriously and investigated promptly.`}
      />

      <Section
        title="9. Continuous Improvement"
        content={`We regularly review safety data and user feedback to update our policies and introduce new safety measures. Your input helps us make every ride safer and more reliable.`}
      />

      <Text
        style={{
          fontSize: fontSizes.FONT14,
          color: "#999",
          textAlign: "center",
          marginTop: 20,
          fontFamily: "TT-Octosquares-Medium",
          marginBottom: 25,
        }}
      >
        © {new Date().getFullYear()} Stark OPC Pvt. Ltd. All rights reserved.
      </Text>
    </ScrollView>
  );
}

/* ---------- SECTION COMPONENT ---------- */
const Section = ({ title, content }) => (
  <View style={{ marginBottom: 25 }}>
    <Text
      style={{
        fontSize: fontSizes.FONT18,
        fontFamily: "TT-Octosquares-Medium",
        color: color.primaryText,
        marginBottom: 6,
      }}
    >
      {title}
    </Text>
    <Text
      style={{
        fontSize: fontSizes.FONT15,
        lineHeight: 24,
        color: color.primaryText,
        fontFamily: "TT-Octosquares-Medium",
        opacity: 0.9,
      }}
    >
      {content}
    </Text>
  </View>
);
