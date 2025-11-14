import axiosInstance from "@/api/axiosInstance";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

export const useGetUserData = () => {
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(true);

  const getLoggedInUserData = async () => {
    try {
      const res = await axiosInstance.get("/me");

      // ⏳ Artificial delay (2.5 seconds)
      setTimeout(() => {
        setUser(res.data.user);
        setLoading(false);
      }, 3000);
    } catch (error) {
      console.log("Failed to fetch user data:", error);

      // still delay a bit before hiding skeleton, to look smoother
      setTimeout(() => setLoading(false), 3000);
    }
  };
  useEffect(() => {
    getLoggedInUserData();
  }, []);

  return { loading, user, refetchData: getLoggedInUserData };
};

export const useGetUserRideHistories = () => {
  const [recentRides, setRecentRides] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRides = async () => {
    try {
      const res = await axiosInstance.get("/get-rides");
      setTimeout(() => {
        setRecentRides(res.data.rides || []);
        setLoading(false);
      }, 3000);
    } catch (error) {
      console.log("Failed to fetch rides:", error);
    } finally {
      setTimeout(() => setLoading(false), 3000);
    }
  };

  useEffect(() => {
    fetchRides();
  }, []);

  return { loading, recentRides: [...recentRides].reverse(), refetchRides: fetchRides };
};
