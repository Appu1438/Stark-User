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
      }, 0);
    } catch (error) {
      console.log("Failed to fetch user data:", error);

      // still delay a bit before hiding skeleton, to look smoother
      setTimeout(() => setLoading(false), 0);
    }
  };
  useEffect(() => {
    getLoggedInUserData();
  }, []);

  return { loading, user, refetchData: getLoggedInUserData };
};

export const useGetUserSavedPlaces = () => {
  const [savedPlaces, setSavedPlaces] = useState();
  const [loading, setLoading] = useState(true);


  const fetchSavedPlaces = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/save-place");
      console.log(res.data.data)
      setSavedPlaces(res.data.data || []);
    } catch (err) {
      console.log("Failed to fetch savedPlaces:", err);
    } finally {
      setTimeout(() => setLoading(false), 0);
    }
  };

  // Load saved places
  useEffect(() => {
    fetchSavedPlaces();
  }, []);
  return { loading, savedPlaces, refetchSavedPlaces: fetchSavedPlaces };
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
      }, 0);
    } catch (error) {
      console.log("Failed to fetch rides:", error);
    } finally {
      setTimeout(() => setLoading(false), 0);
    }
  };

  useEffect(() => {
    fetchRides();
  }, []);

  return { loading, recentRides: [...recentRides].reverse(), refetchRides: fetchRides };
};
