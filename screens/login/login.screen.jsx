import { View, Text, Image, Platform } from 'react-native'
import React, { useState } from 'react'
import AuthContainer from '@/utils/container/auth-container'
import { windowHeight } from '@/themes/app.constant'
import { styles } from './styles'
import Images from '@/utils/images'
import SignInText from '@/components/login/signin.text'
import { external } from '@/styles/external.style'
import PhoneNumberInput from '@/components/login/phone-number.input'
import Button from '@/components/common/button'
import { router } from 'expo-router'
import { useToast } from 'react-native-toast-notifications'
import axios from 'axios'
import { useFocusEffect } from '@react-navigation/native';
import { BackHandler, Alert } from 'react-native';
import { useCallback } from 'react';
import axiosInstance from '@/api/axiosInstance'
export default function LoginScreen() {
  const [phone_number, setphone_number] = useState("");
  const [loading, setloading] = useState(false);
  const [countryCode, setCountryCode] = useState("91");
  const toast = useToast();

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        Alert.alert(
          "Exit App",
          "Are you sure you want to exit?",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Exit", onPress: () => BackHandler.exitApp() },
          ],
          { cancelable: true }
        );
        return true; // Prevent default back behavior
      };

      if (Platform.OS === "android") {
        const subscription = BackHandler.addEventListener(
          "hardwareBackPress",
          onBackPress
        );

        // Cleanup on unmount
        return () => subscription.remove();
      }
    }, [])
  );

  const handleSubmit = async () => {
    if (!phone_number || !countryCode) {
      toast.show("Please fill the fields!", {
        placement: "bottom",
      });
      return;
    }

    setloading(true);

    const phoneNumber = `+${countryCode}${phone_number}`;
    console.log("Phone number:", phoneNumber);
    console.log("API URI:", process.env.EXPO_PUBLIC_API_URI);

    try {
      const res = await axiosInstance.post(
        "/registration",
        { phone_number: phoneNumber },
        { withCredentials: true } // ✅ send cookies if your backend uses refresh tokens
      );

      setloading(false);

      // Navigate to OTP verification screen
      router.push({
        pathname: "/(routes)/otp-verification",
        params: { phoneNumber },
      });
    } catch (error) {
      console.error("Registration error:", error);
      setloading(false);

      toast.show(
        "Something went wrong! Please check your phone number.",
        {
          type: "danger",
          placement: "bottom",
        }
      );
    }
  };

  return (
    <AuthContainer
      topSpace={windowHeight(150)}
      imageShow={true}
      container={
        <View>
          <View>
            <Image
              style={styles.transformLine}
              source={Images.line}
            />
            <SignInText />
            <View style={[external.mt_25, external.Pb_10]}>
              <PhoneNumberInput
                phone_number={phone_number}
                setphone_number={setphone_number}
                countryCode={countryCode}
                setCountryCode={setCountryCode}
              />
              <View style={[external.mt_25, external.Pb_15]}>
                <Button
                  title='Get OTP'
                  onPress={() => handleSubmit()}
                  disabled={loading}
                />
              </View>
            </View>
          </View>
        </View>
      }
    />
  )
}