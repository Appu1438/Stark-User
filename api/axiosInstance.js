import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { logout, refreshAccessToken } from "./apis";

const axiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URI,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false; // flag for refresh in progress
let failedQueue = []; // requests to retry after refresh

const processQueue = (error, token) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      if (token && prom.config) {
        prom.config.headers["Authorization"] = `Bearer ${token}`;
        axiosInstance(prom.config).then(prom.resolve).catch(prom.reject);
      }
    }
  });
  failedQueue = [];
};

// Request interceptor
axiosInstance.interceptors.request.use(async (config) => {
  try {
    const accessToken = await AsyncStorage.getItem("accessToken");
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  } catch (err) {
    return config;
  }
});

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ✅ Device mismatch
    if (error.response?.status === 470) {
      console.log('Not Approved Logging Out')
      await logout();
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue the request while token is refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newAccessToken = await refreshAccessToken();
        
        // await AsyncStorage.setItem("accessToken", newAccessToken);

        processQueue(null, newAccessToken);

        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (err) {
        processQueue(err, null);
        await logout();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
