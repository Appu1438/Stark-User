import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { useTheme } from "@react-navigation/native";
import { windowHeight, windowWidth } from "@/themes/app.constant";
import Button from "@/components/common/button";
import color from "@/themes/app.colors";
import { router, useLocalSearchParams } from "expo-router";
import TitleView from "@/components/signup/title.view";
import Input from "@/components/common/input";
import axiosInstance from "@/api/axiosInstance";
import AppAlert from "@/components/modal/alert-modal/alert.modal";

export default function RegistrationScreen() {
  const { colors } = useTheme();
  const { user } = useLocalSearchParams();
  const parsedUser = JSON.parse(user);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);

  // ------ ALERT HANDLER ------
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    confirmText: "OK",
    showCancel: false,
    onConfirm: () => setShowAlert(false),
  });

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

  // Input handler
  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Email validator
  const validateEmail = (email) => {
    const regex =
      /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return regex.test(email);
  };

  // ------ SUBMIT ------
  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      return triggerAlert({
        title: "Missing Information",
        message: "Please fill all required fields.",
      });
    }

    if (!validateEmail(formData.email)) {
      return triggerAlert({
        title: "Invalid Email",
        message: "Please enter a valid email address.",
      });
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
      triggerAlert({
        title: "Error",
        message:
          error?.response?.data?.message ||
          "Something went wrong! Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView>
      <View>
        {/* LOGO */}
        <Text
          style={{
            fontFamily: "TT-Octosquares-Medium",
            fontSize: windowHeight(25),
            paddingTop: windowHeight(50),
            textAlign: "center",
            color: color.primaryText,
          }}
        >
          Stark
        </Text>

        <View style={{ padding: windowWidth(20) }}>
          <View
            style={[styles.subView, { backgroundColor: colors.background }]}
          >
            <View style={styles.space}>
              <TitleView
                title={"Create your account"}
                subTitle="Explore your life by joining Stark"
              />

              <Input
                title="Name"
                placeholder="Enter your name"
                value={formData.name}
                onChangeText={(text) => handleChange("name", text)}
              />

              <Input
                title="Phone Number"
                placeholder="Enter your phone number"
                value={parsedUser.phone_number}
                editable={false}
                disabled={true}
              />

              <Input
                title="Email Address"
                placeholder="Enter your email address"
                keyboardType="email-address"
                value={formData.email}
                onChangeText={(text) => handleChange("email", text)}
              />

              <View style={styles.margin}>
                <Button
                  onPress={handleSubmit}
                  disabled={loading}
                  title={
                    loading ? (
                      <ActivityIndicator color={color.primary} />
                    ) : (
                      "Next"
                    )
                  }
                />
              </View>
              <View style={{ marginTop: 10, marginBottom: 20 }}>
                <Text
                  style={{
                    color: color.primaryText,
                    fontSize: windowHeight(10),
                    fontFamily: "TT-Octosquares-Medium",
                    textAlign: "center",
                    opacity: 0.7,
                  }}
                >
                  By continuing, you agree to our
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    flexWrap: "wrap",
                    marginTop: 4,
                  }}
                >
                  <Text
                    style={{
                      color: color.primaryText,
                      fontSize: windowHeight(10),
                      fontFamily: "TT-Octosquares-Medium",
                    }}
                    onPress={() =>
                      router.push("/(routes)/legal/terms-and-conditions")
                    }
                  >
                    Terms & Conditions
                  </Text>

                  <Text
                    style={{
                      color: color.primaryText,
                      fontSize: windowHeight(10),
                      fontFamily: "TT-Octosquares-Medium",
                      opacity: 0.7,
                    }}
                  >
                    {"  and  "}
                  </Text>

                  <Text
                    style={{
                      color: color.primaryText,
                      fontSize: windowHeight(10),
                      fontFamily: "TT-Octosquares-Medium",
                    }}
                    onPress={() =>
                      router.push("/(routes)/legal/privacy-policy")
                    }
                  >
                    Privacy Policy
                  </Text>
                </View>
              </View>

            </View>
          </View>
        </View>
      </View>

      {/* GLOBAL ALERT */}
      <AppAlert
        visible={showAlert}
        title={alertConfig.title}
        message={alertConfig.message}
        confirmText={alertConfig.confirmText}
        showCancel={alertConfig.showCancel}
        onConfirm={alertConfig.onConfirm}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  subView: {
    height: "100%",
    borderRadius: 12,
    paddingVertical: 10,
  },
  space: {
    marginHorizontal: windowWidth(4),
  },
  margin: {
    marginVertical: windowHeight(12),
  },
});
