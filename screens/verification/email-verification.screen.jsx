import { View, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import AuthContainer from "@/utils/container/auth-container";
import { windowHeight } from "@/themes/app.constant";
import SignInText from "@/components/login/signin.text";
import { commonStyles } from "@/styles/common.style";
import { external } from "@/styles/external.style";
import Button from "@/components/common/button";
import { style } from "./styles";
import color from "@/themes/app.colors";
import { Toast } from "react-native-toast-notifications";
import OTPTextInput from "react-native-otp-textinput";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "@/api/axiosInstance";
import { CommonActions, useNavigation } from '@react-navigation/native';

export default function EmailVerificationScreen() {
  const [otp, setOtp] = useState("");
  const [loader, setLoader] = useState(false);
  const { user } = useLocalSearchParams();
  const parsedUser = JSON.parse(user);
  const navigation = useNavigation(); // if TS complains use `useNavigation>()`

  const handleSubmit = async () => {
    setLoader(true);
    const otpNumbers = `${otp}`;

    try {
      const res = await axiosInstance.put(
        "/email-otp-verify",
        {
          token: parsedUser.token,
          otp: otpNumbers,
        },
        {
          withCredentials: true, // ✅ send cookies (refresh token)
        }
      );

      // Save access token and navigate
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
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "Something went wrong. Please try again.";

      Toast.show(errorMessage, {
        placement: "bottom",
        type: "danger",
      });
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
            title={"Email Verification"}
            subtitle={"Check your email address for the otp!"}
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
                fontFamily: 'TT-Octosquares-Medium',
              }]}>Not Received yet?</Text>
              <TouchableOpacity onPress={() => {
                router.back()
              }}>
                <Text style={[style.signUpText]}>
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