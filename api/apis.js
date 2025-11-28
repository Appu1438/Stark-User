import axiosInstance from "./axiosInstance";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";
import { CommonActions } from '@react-navigation/native';

/**
 * Logout Function
 */
export const logout = async (setLoading) => {
    try {
        // If a loading state setter is provided, start loading
        if (typeof setLoading === "function") {
            setLoading(true);
        }

        console.log("logout");

        // Backend logout
        await axiosInstance.post("/logout", {}, { withCredentials: true });

        // Clear token
        await AsyncStorage.removeItem("accessToken");

        // Stop loader before navigating
        if (typeof setLoading === "function") {
            setLoading(false);
        }

        router.replace("/(routes)/login");

    } catch (error) {
        console.log("Logout failed:", error.message);

        // Always clear token even if backend fails
        await AsyncStorage.removeItem("accessToken");

        // Stop loader before navigation
        if (typeof setLoading === "function") {
            setLoading(false);
        }

        router.replace("/(routes)/login");
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
