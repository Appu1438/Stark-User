import { create } from "zustand";
import * as Location from "expo-location";
import axios from "axios";

export const useUserLocationStore = create((set) => ({
    userLocation: null,
    userLocationName: "",
    userPlaceId: "",
    userDistrict: "",
    userRegion: {
        latitude: 0,
        longitude: 0,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    },
    findingLocation: false,

    // 🔥 Fetch Location Action
    fetchLocation: async (mapRef, getDistrict) => {
        try {
            set({ findingLocation: true });

            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                return { error: "Location permission denied" };
            }

            const loc = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

            const { latitude, longitude } = loc.coords;
            const coords = { latitude, longitude };

            const [place] = await Location.reverseGeocodeAsync(coords);

            const locationName =
                place?.street ||
                place?.city ||
                place?.name ||
                place?.district ||
                place?.region ||
                "Unknown Location";

            // 🆕 🔥 Fetch Place ID using Google Places API
            let placeId = "";
            try {
                const res = await axios.get(
                    "https://maps.googleapis.com/maps/api/geocode/json",
                    {
                        params: {
                            latlng: `${latitude},${longitude}`,
                            key: process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY,
                        },
                    }
                );

                placeId = res?.data?.results?.[0]?.place_id || "";
            } catch (err) {
                console.log("Error fetching placeId:", err?.response?.data || err);
            }

            // Optional callback for district
            if (getDistrict) {
                let district = await getDistrict(latitude, longitude);
                set({ userDistrict: district });
            }

            console.log("store value", coords, locationName, placeId);

            // Update Zustand store
            set({
                userLocation: coords,
                userLocationName: locationName,
                userPlaceId: placeId,
                userRegion: {
                    latitude,
                    longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                },
            });

            // Animate map
            if (mapRef?.current) {
                setTimeout(() => {
                    mapRef.current.animateToRegion(
                        {
                            latitude,
                            longitude,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                        },
                        1000
                    );
                }, 200);
            }

            return { success: true };
        } catch (error) {
            console.log("Location error:", error);
            return { error: "Unable to fetch location" };
        } finally {
            set({ findingLocation: false });
        }
    },
}));
