import axiosInstance from "./axiosInstance";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";
import { CommonActions } from '@react-navigation/native';

/**
 * Logout Function
 */
export const logout = async () => {
    try {

        console.log('logout')

        // Call backend logout route to clear cookie & DB token
        await axiosInstance.post("/logout", {}, { withCredentials: true });

        // Clear stored access token
        await AsyncStorage.removeItem("accessToken");

        // Navigate to login screen
        router.replace("/(routes)/login"); // replaces home screen

    } catch (error) {
        console.log("Logout failed:", error.message);
        // Even if request fails, clear local tokens to force re-login
        await AsyncStorage.removeItem("accessToken");
        router.replace("/(routes)/login"); // replaces home screen

    }
};

/**
 * Refresh Token Function
 */
export const refreshAccessToken = async () => {
    try {
        const res = await axios.post(`${process.env.EXPO_PUBLIC_API_URI}/refresh-token`, {}, { withCredentials: true });

        if (res.data?.accessToken) {
            await AsyncStorage.setItem("accessToken", res.data.accessToken);

            // Update axiosInstance with new token
            // axiosInstance.defaults.headers.Authorization = `Bearer ${res.data.accessToken}`;

            return res.data.accessToken;
        }
        throw new Error("No access token returned");
    } catch (error) {
        console.log("Refresh token failed:", error);
        // If refresh fails, force logout
        await logout();
        return null;
    }
};
