import axiosInstance from "@/api/axiosInstance";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

export const useGetUserData = () => {
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getLoggedInUserData = async () => {
      try {
        const res = await axiosInstance.get("/me");
        setUser(res.data.user);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setLoading(false);
      }
    };

    getLoggedInUserData();
  }, []);

  return { loading, user };
};

export const useGetUserRideHistories = () => {
  const [recentRides, setRecentRides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getRecentRides = async () => {
      try {
        const res = await axiosInstance.get("/get-rides");
        setRecentRides(res.data.rides || []);
      } catch (error) {
        console.error("Failed to fetch rides:", error);
      } finally {
        setLoading(false);
      }
    };

    getRecentRides();
  }, []);

  return { loading, recentRides: [...recentRides].reverse() };
};