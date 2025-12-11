import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  TouchableOpacity,
  TextInput
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
// Internal Utils
import { fontSizes, windowHeight, windowWidth } from "@/themes/app.constant";
import color from "@/themes/app.colors";
import axiosInstance from "@/api/axiosInstance";
import AppAlert from "@/components/modal/alert-modal/alert.modal";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RegistrationScreen() {
  const { user } = useLocalSearchParams();
  const parsedUser = JSON.parse(user);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});

  // --- Handlers ---
  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const triggerAlert = ({ title, message }) => {
    setAlertConfig({
      title,
      message,
      confirmText: "OK",
      showCancel: false,
      onConfirm: () => setShowAlert(false),
    });
    setShowAlert(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      return triggerAlert({ title: "Missing Info", message: "Please fill all fields." });
    }
    if (!validateEmail(formData.email)) {
      return triggerAlert({ title: "Invalid Email", message: "Enter a valid email address." });
    }

    setLoading(true);
    try {
      const res = await axiosInstance.post("/email-otp-request", {
        email: formData.email,
        name: formData.name,
        userId: parsedUser.id,
      });

      const userData = {
        id: parsedUser.id,
        name: formData.name,
        email: formData.email,
        phone_number: parsedUser.phone_number,
        token: res.data.token,
      };

      router.push({
        pathname: "/(routes)/email-verification",
        params: { user: JSON.stringify(userData) },
      });
    } catch (error) {
      triggerAlert({ title: "Error", message: error?.response?.data?.message || "Something went wrong." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Header / Logo Section */}
          <View style={styles.header}>
            <Text style={styles.logoText}>Stark</Text>
            <Text style={styles.subtitle}>Complete your profile to get started.</Text>
          </View>

          {/* Form Card */}
          <View style={styles.formContainer}>

            {/* Name Input */}
            <CustomInput
              label="Full Name"
              placeholder="e.g. John Doe"
              value={formData.name}
              onChangeText={(t) => handleChange("name", t)}
              icon="person"
            />

            {/* Phone (Read Only) */}
            <CustomInput
              label="Phone Number"
              value={parsedUser.phone_number}
              editable={false}
              icon="phone"
              isReadOnly
            />

            {/* Email Input */}
            <CustomInput
              label="Email Address"
              placeholder="john@example.com"
              value={formData.email}
              onChangeText={(t) => handleChange("email", t)}
              keyboardType="email-address"
              icon="email"
            />

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={color.primary} />
              ) : (
                <View style={styles.btnContent}>
                  <Text style={styles.submitText}>Continue</Text>
                  <Ionicons name="arrow-forward" size={20} color={color.primary} />
                </View>
              )}
            </TouchableOpacity>

          </View>

          {/* Footer Terms */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>By continuing, you agree to our</Text>
            <View style={styles.linkRow}>
              <TouchableOpacity onPress={() => router.push("/(routes)/legal/terms-and-conditions")}>
                <Text style={styles.linkText}>Terms & Conditions</Text>
              </TouchableOpacity>
              <Text style={styles.footerText}> and </Text>
              <TouchableOpacity onPress={() => router.push("/(routes)/legal/privacy-policy")}>
                <Text style={styles.linkText}>Privacy Policy</Text>
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      <AppAlert visible={showAlert} {...alertConfig} />
    </SafeAreaView>
  );
}

// --- Reusable Input Component ---
const CustomInput = ({ label, placeholder, value, onChangeText, icon, keyboardType, editable = true, isReadOnly = false }) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <View style={[styles.inputWrapper, isReadOnly && styles.readOnlyWrapper]}>
      <MaterialIcons
        name={icon}
        size={20}
        color={isReadOnly ? color.lightGray : color.primaryText}
        style={{ marginRight: 12, opacity: 0.7 }}
      />
      <TextInput
        style={[styles.input, isReadOnly && { color: color.lightGray }]}
        placeholder={placeholder}
        placeholderTextColor={color.lightGray}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        editable={editable}
      />
      {isReadOnly && <MaterialIcons name="lock" size={16} color={color.lightGray} style={{ opacity: 0.5 }} />}
    </View>
  </View>
);

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.bgDark || "#000", // Ensure dark background
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: windowWidth(24),
    paddingBottom: 40,
    justifyContent: 'center', // Centers content vertically on larger screens
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: windowHeight(40),
    marginTop: windowHeight(20),
  },
  logoText: {
    fontFamily: "TT-Octosquares-Medium",
    fontSize: windowHeight(32),
    color: color.primaryText,
    marginBottom: 8,
    letterSpacing: 1,
  },
  subtitle: {
    fontFamily: "TT-Octosquares-Medium",
    fontSize: fontSizes.FONT14,
    color: color.primaryText,
    opacity: 0.6,
    textAlign: 'center',
  },

  // Form Container
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: fontSizes.FONT13,
    color: color.primaryText,
    marginBottom: 8,
    marginLeft: 4,
    fontFamily: "TT-Octosquares-Medium",
    opacity: 0.8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 52,
    backgroundColor: "transparent",
  },
  readOnlyWrapper: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.1)",
  },
  input: {
    flex: 1,
    fontSize: fontSizes.FONT16,
    color: color.primaryText,
    fontFamily: "TT-Octosquares-Medium",
    height: '100%', // Ensure full height for better touch area
  },

  // Button
  submitButton: {
    backgroundColor: color.buttonBg,
    borderRadius: 14,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: color.buttonBg,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitText: {
    fontSize: fontSizes.FONT16,
    color: color.primary,
    fontFamily: "TT-Octosquares-Medium",
  },

  // Footer
  footer: {
    marginTop: windowHeight(40),
    alignItems: 'center',
  },
  footerText: {
    color: color.primaryText,
    fontSize: fontSizes.FONT12,
    fontFamily: "TT-Octosquares-Medium",
    opacity: 0.5,
  },
  linkRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  linkText: {
    color: color.primaryText, // Or brand color if preferred
    fontSize: fontSizes.FONT12,
    fontFamily: "TT-Octosquares-Medium",
    textDecorationLine: 'underline',
    opacity: 0.9,
  },
});