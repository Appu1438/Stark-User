
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import React, { useState } from "react";
import AuthContainer from "@/utils/container/auth-container";
import { windowHeight } from "@/themes/app.constant";
import SignInText from "@/components/login/signin.text";
import OTPTextInput from "react-native-otp-textinput";
import { style } from "./styles";
import color from "@/themes/app.colors";
import { external } from "@/styles/external.style";
import Button from "@/components/common/button";
import { router, useLocalSearchParams } from "expo-router";
import { commonStyles } from "@/styles/common.style";
import { useToast } from "react-native-toast-notifications";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "@/api/axiosInstance";
import { CommonActions, useNavigation } from '@react-navigation/native';

export default function OtpVerificationScreen() {
  const [otp, setOtp] = useState("");
  const [loader, setLoader] = useState(false);
  const toast = useToast();
  const { phoneNumber } = useLocalSearchParams();
  const navigation = useNavigation(); // if TS complains use `useNavigation<any>()`

  const handleSubmit = async () => {
    if (!otp) {
      toast.show("Please fill the fields!", { placement: "bottom" });
      return;
    }

    setLoader(true);
    const otpNumbers = `${otp}`;

    try {
      const res = await axiosInstance.post(
        "/verify-otp",
        {
          phone_number: phoneNumber,
          otp: otpNumbers,
        },
        { withCredentials: true } // ✅ send cookies automatically
      );

      const user = res.data.user;

      if (!user.email) {
        router.push({
          pathname: "/(routes)/registration",
          params: { user: JSON.stringify(user) },
        });
        toast.show("Account verified!");
      } else {
        await AsyncStorage.setItem("accessToken", res.data.accessToken);
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                // set the tabs navigator as the single root route
                // route name here should be the name of the tabs navigator or the top-level route,
                // try "(tabs)" or the actual name used in your app. If that fails, use nested state below.
                name: "(tabs)",
                state: {
                  index: 0,
                  routes: [{ name: "home" }], // 'home' must match your Tabs.Screen name
                },
              },
            ],
          })
        );
      }
    } catch (error) {
      toast.show(
        error.response.data.message,
        { type: "danger", placement: "bottom" }
      );
      console.error("OTP verification error:", error);
    } finally {
      setLoader(false);
    }
  };

  return (
    <AuthContainer
      topSpace={windowHeight(240)}
      imageShow={true}
      container={
        <View>
          <SignInText
            title={"OTP Verification"}
            subtitle={"Check your phone number for the otp!"}
          />
          <OTPTextInput
            handleTextChange={(code) => setOtp(code)}
            inputCount={4}
            textInputStyle={style.otpTextInput}
            tintColor={color.primaryText}
            autoFocus={false}
          />
          <View style={[external.mt_30]}>
            <Button
              title={loader ? <ActivityIndicator color={color.primary} /> : 'Verify OTP'}
              onPress={() => handleSubmit()}
              disabled={loader}
            />
          </View>
          <View style={[external.mb_15]}>
            <View
              style={[
                external.pt_10,
                external.Pb_10,
                { flexDirection: "row", gap: 5, justifyContent: "center" },
              ]}
            >
              <Text style={[commonStyles.regularText, {
                fontFamily: 'TT-Octosquares-Medium'
              }]}>Not Received yet?</Text>
              <TouchableOpacity onPress={() => {
                router.back()
              }}>
                <Text style={[style.signUpText, {
                  fontFamily: 'TT-Octosquares-Medium'
                }]}>
                  Resend it
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      }
    />
  );
}
