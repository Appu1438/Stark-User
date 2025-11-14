import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import color from "@/themes/app.colors";
import { fontSizes, windowWidth, windowHeight } from "@/themes/app.constant";
import Button from "@/components/common/button";
import HelpAndSupportSkeleton from "./help-support-skelton.screen";

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function HelpAndSupport() {
  const [expanded, setExpanded] = useState(null);

  const toggleExpand = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(expanded === id ? null : id);
  };

  const faqData = [
    {
      id: 1,
      question: "How can I cancel my ride?",
      answer:
        "You can cancel your ride anytime before pickup from the 'Your Rides' section. However, cancelling repeatedly may affect your account reliability score.",
    },
    {
      id: 2,
      question: "My driver is not responding, what should I do?",
      answer:
        "If your driver is not responding, wait a few minutes and try calling again using the in-app 'Call Driver' option. If the issue continues, cancel the ride and rebook.",
    },
    {
      id: 3,
      question: "How do I rate my driver?",
      answer:
        "After each completed ride, you’ll be prompted to rate your driver and share feedback. You can also view and edit your rating in your ride history.",
    },
    {
      id: 4,
      question: "Can I change my pickup location after booking?",
      answer:
        "Once a driver is assigned, pickup changes are limited. You can cancel and rebook if your new pickup location is significantly different.",
    },
    {
      id: 5,
      question: "My driver asked for extra money. What can I do?",
      answer:
        "Please do not pay any amount beyond the displayed fare. Report such incidents immediately through the 'Register Complaint' section under 'Driver Behavior'.",
    },
    {
      id: 6,
      question: "How do I update my profile information?",
      answer:
        "Go to your 'Profile' section, select 'Profile Information', and edit your details such as name, phone number, or email. Make sure to save the changes before exiting.",
    },
    {
      id: 7,
      question: "What safety measures are in place for users?",
      answer:
        "All our drivers are verified with proper background checks and documentation. You can also share your live trip status with friends or family anytime during a ride.",
    },
    {
      id: 8,
      question: "I left my item in the cab, what should I do?",
      answer:
        "If you’ve left an item in the cab, please register a complaint through the 'Complaints' section with your ride details. Our support team will contact the driver and help recover your belongings as soon as possible.",
    },
  ];

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // simulate data fetch or load delay
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <HelpAndSupportSkeleton />;

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: color.background,
        paddingHorizontal: windowWidth(25),
        paddingTop: windowHeight(40),
        marginBottom: 30,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* ---------- HEADER ---------- */}
      <Text
        style={{
          fontSize: fontSizes.FONT26,
          fontFamily: "TT-Octosquares-Medium",
          color: color.primaryText,
          textAlign: "center",
          marginBottom: 8,
        }}
      >
        Help & Support
      </Text>
      <Text
        style={{
          fontSize: fontSizes.FONT14,
          color: color.primaryGray,
          textAlign: "center",
          fontFamily: "TT-Octosquares-Medium",
          marginBottom: 25,
        }}
      >
        Find answers to common questions or reach out to our team for assistance.
      </Text>

      {/* ---------- SEARCH BOX ---------- */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: color.subPrimary,
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 8,
          marginBottom: 25,
          borderWidth: 1,
          borderColor: color.border,
        }}
      >
        <Ionicons name="search-outline" size={20} color={color.primaryText} />
        <TextInput
          placeholder="Search for help..."
          placeholderTextColor="#888"
          style={{
            flex: 1,
            paddingHorizontal: 10,
            fontFamily: "TT-Octosquares-Medium",
            color: color.primaryText,
          }}
        />
      </View>

      {/* ---------- FAQ SECTION ---------- */}
      <Text
        style={{
          fontSize: fontSizes.FONT22,
          color: color.primaryText,
          fontFamily: "TT-Octosquares-Medium",
          marginBottom: 15,
        }}
      >
        Quick Help
      </Text>

      {faqData.map((faq) => (
        <TouchableOpacity
          key={faq.id}
          onPress={() => toggleExpand(faq.id)}
          activeOpacity={0.8}
          style={{
            backgroundColor: color.subPrimary,
            borderRadius: 12,
            marginBottom: 12,
            paddingHorizontal: 15,
            paddingVertical: 14,
            borderWidth: 1,
            borderColor: color.border,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: fontSizes.FONT16,
                color: color.primaryText,
                fontFamily: "TT-Octosquares-Medium",
                flex: 1,
                marginRight: 10,
              }}
            >
              {faq.question}
            </Text>
            <Ionicons
              name={expanded === faq.id ? "chevron-up" : "chevron-down"}
              size={20}
              color={color.primaryText}
            />
          </View>

          {expanded === faq.id && (
            <Text
              style={{
                fontSize: fontSizes.FONT14,
                color: "#aaa",
                marginTop: 10,
                lineHeight: 22,
                fontFamily: "TT-Octosquares-Medium",
              }}
            >
              {faq.answer}
            </Text>
          )}
        </TouchableOpacity>
      ))}

      {/* ---------- CONTACT SECTION ---------- */}
      <LinearGradient
        colors={[color.darkPrimary, color.bgDark]}
        style={{
          borderRadius: 18,
          padding: 18,
          marginTop: 25,
          marginBottom: 30,
        }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text
          style={{
            fontSize: fontSizes.FONT20,
            color: color.primaryText,
            fontFamily: "TT-Octosquares-Medium",
            marginBottom: 12,
          }}
        >
          Still Need Help?
        </Text>

        <View style={{ marginBottom: 10 }}>
          <View
            style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}
          >
            <MaterialIcons name="email" size={20} color={color.primaryText} />
            <Text
              style={{
                color: color.primaryText,
                marginLeft: 10,
                fontFamily: "TT-Octosquares-Medium",
              }}
            >
              support@starkapp.com
            </Text>
          </View>

          <View
            style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}
          >
            <MaterialIcons name="phone" size={20} color={color.primaryText} />
            <Text
              style={{
                color: color.primaryText,
                marginLeft: 10,
                fontFamily: "TT-Octosquares-Medium",
              }}
            >
              +91 98765 43210
            </Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="time-outline" size={20} color={color.primaryText} />
            <Text
              style={{
                color: color.primaryText,
                marginLeft: 10,
                fontFamily: "TT-Octosquares-Medium",
              }}
            >
              Support Hours: 9 AM – 9 PM (Mon–Sat)
            </Text>
          </View>
        </View>

        <Button
          title="Contact Support"
          onPress={() => { }}
          style={{ marginTop: 10 }}
        />
      </LinearGradient>

      {/* ---------- FOOTER NOTE ---------- */}
      <Text
        style={{
          fontSize: fontSizes.FONT14,
          color: "#888",
          textAlign: "center",
          fontFamily: "TT-Octosquares-Medium",
          marginBottom: 30,
        }}
      >
        © {new Date().getFullYear()} Stark OPC Pvt. Ltd. All rights reserved.
      </Text>
    </ScrollView>
  );
}
