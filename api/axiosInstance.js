import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { logout, refreshAccessToken } from "./apis";

const axiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URI,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(async (config) => {
  try {
    // Only read token if not retrying
    if (!config._retry) {
      console.log('Req with storage token')
      const accessToken = await AsyncStorage.getItem("accessToken");
      if (accessToken) {
        config.headers["Authorization"] = `Bearer ${accessToken}`;
      } else {
        console.log("Request without token");
      }
    } else {
      // Add other custom headers
      console.log('Req with new Token')
      config.headers["X-Custom-Header"] = "customHeaderValue";

    }


    return config;
  } catch (err) {
    console.error("Request interceptor error:", err);
    return config;
  }
});


// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log("Attempting token refresh...");

        const newAccessToken = await refreshAccessToken();

        // if (!newAccessToken) throw new Error("No new access token");

        // IMPORTANT: directly overwrite the Authorization header
        console.log('New  ', newAccessToken)
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        // Retry the request manually
        return axiosInstance(originalRequest);
      } catch (err) {
        await logout();
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);


export default axiosInstance;
