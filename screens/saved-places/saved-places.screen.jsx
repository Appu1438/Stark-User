import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
  RefreshControl,
  Image,
  StyleSheet,
  FlatList,
  Keyboard,
  ScrollView,
} from "react-native";

import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import axios from "axios";
import axiosInstance from "@/api/axiosInstance";
import color from "@/themes/app.colors";
import { fontSizes, windowHeight, windowWidth } from "@/themes/app.constant";
import Button from "@/components/common/button";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import _ from "lodash";
import { useGetUserSavedPlaces } from "@/hooks/useGetUserData";
import { customMapStyle } from "@/utils/map/mapStyle";
import Images from "@/utils/images";

/* Icon selector */
const getPlaceIcon = (label = "") => {
  const lower = label.toLowerCase();
  if (lower.includes("home")) return "home";
  if (lower.includes("work")) return "briefcase";
  if (lower.includes("gym")) return "barbell";
  if (lower.includes("school")) return "school";
  return "location";
};

export default function SavedPlaces() {
  const { loading, savedPlaces, refetchSavedPlaces } =
    useGetUserSavedPlaces();

  const [label, setLabel] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [autocompleteResults, setAutocompleteResults] = useState([]);
  const [location, setLocation] = useState(null);
  const [placeId, setPlaceId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const dropdownAnim = useRef(new Animated.Value(0)).current;
  const mapRef = useRef(null);

  // Debounce API
  const fetchPlaces = async (input) => {
    try {
      const res = await axios.get(
        "https://maps.googleapis.com/maps/api/place/autocomplete/json",
        {
          params: {
            input,
            key: process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY,
            language: "en",
          },
        }
      );

      const preds = res?.data?.predictions || [];
      setAutocompleteResults(preds);

      Animated.timing(dropdownAnim, {
        toValue: preds.length > 0 ? 1 : 0,
        duration: 180,
        useNativeDriver: false,
      }).start();
    } catch (err) {
      console.warn("Autocomplete error:", err);
    }
  };

  const debouncedFetchPlaces = useCallback(_.debounce(fetchPlaces, 250), []);

  useEffect(() => {
    if (searchQuery.length > 2) debouncedFetchPlaces(searchQuery);
    else {
      setAutocompleteResults([]);
      dropdownAnim.setValue(0);
    }
  }, [searchQuery]);

  // Select place
  const handleSelectPlace = async (placeId, description) => {
    Keyboard.dismiss();

    setSearchQuery(description);
    setPlaceId(placeId)
    setAutocompleteResults([]);
    dropdownAnim.setValue(0);

    try {
      const res = await axios.get(
        "https://maps.googleapis.com/maps/api/place/details/json",
        {
          params: {
            place_id: placeId,
            key: process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY,
          },
        }
      );

      const loc = res?.data?.result?.geometry?.location;
      if (!loc) return;

      const coords = { latitude: loc.lat, longitude: loc.lng };
      setLocation(coords);

      mapRef.current?.animateToRegion(
        {
          ...coords,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        400
      );
    } catch (err) {
      console.warn("Place details error:", err);
    }
  };

  // Save Place
  const handleSavePlace = async () => {
    if (!label.trim() || !searchQuery.trim() || !location) {
      Alert.alert("Missing Fields", "Please fill all fields correctly.");
      return;
    }

    try {
      // setSaving(true);

      const payload = { label: label.trim(), address: searchQuery, location, placeId };
      await axiosInstance.post("/save-place", payload);

      setLabel("");
      setSearchQuery("");
      setLocation(null);

      Alert.alert(
        "Success",
        "Your place has been saved. Pull down to refresh the list."
      );
      // refetchSavedPlaces();
    } catch (err) {
      console.warn("Save error:", err);
      Alert.alert("Error", "Unable to save place.");
    } finally {
      setSaving(false);
    }
  };

  // Delete
  const handleDelete = (id) => {
    Alert.alert("Delete", "Remove this saved place?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await axiosInstance.delete(`/save-place/${id}`);
            // refetchSavedPlaces();
          } catch {
            Alert.alert("Error", "Could not delete the place.");
          }
        },
      },
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchSavedPlaces();
    setRefreshing(false);
  };

  const dropdownHeight = dropdownAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 220],
  });

  /* ------------------ List Card ------------------ */
  const RenderPlaceCard = ({ item }) => (
    <LinearGradient colors={[color.darkPrimary, color.bgDark]} style={styles.placeCard}>
      <View style={styles.iconWrap}>
        <Ionicons name={getPlaceIcon(item.label)} size={20} color={color.primaryText} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.placeLabel}>{item.label}</Text>
        <Text numberOfLines={2} style={styles.placeAddr}>
          {item.address}
        </Text>
      </View>

      {/* Map Center Button */}
      <TouchableOpacity
        style={{ marginRight: 14 }}
        onPress={() => {
          setLocation(item.location);
          mapRef.current?.animateToRegion(
            {
              ...item.location,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            },
            400
          );
        }}
      >
        <Ionicons name="navigate-circle-outline" size={26} color={color.primaryText} />
      </TouchableOpacity>

      {/* DELETE BUTTON (no swipe) */}
      <TouchableOpacity onPress={() => handleDelete(item._id || item._id)}>
        <Ionicons name="trash-outline" size={22} color={color.primaryText} />
      </TouchableOpacity>
    </LinearGradient>
  );

  const Shimmer = ({ width, height, radius = 8, style }) => {
    const translateX = useRef(new Animated.Value(-300)).current;

    useEffect(() => {
      Animated.loop(
        Animated.timing(translateX, {
          toValue: 300,
          duration: 1200,
          useNativeDriver: true,
        })
      ).start();
    }, []);

    return (
      <View
        style={[
          {
            width,
            height,
            borderRadius: radius,
            backgroundColor: "#1d1d1d",
            overflow: "hidden",
          },
          style,
        ]}
      >
        <Animated.View
          style={{
            width: "50%",
            height: "100%",
            opacity: 0.3,
            backgroundColor: "#444",
            transform: [{ translateX }],
          }}
        />
      </View>
    );
  };

  const SavedPlacesSkeleton = () => {
    return (
      <View style={{ paddingHorizontal: windowWidth(25), paddingTop: 40 }}>

        {/* HEADER */}
        <Shimmer width={180} height={26} radius={6} />
        <Shimmer width={250} height={18} radius={6} style={{ marginTop: 10 }} />

        {/* FORM */}
        <LinearGradient
          colors={[color.darkPrimary, color.bgDark]}
          style={{ padding: 18, borderRadius: 18, marginTop: 25 }}
        >
          <Shimmer width={"100%"} height={48} radius={10} />

          <Shimmer
            width={"100%"}
            height={48}
            radius={10}
            style={{ marginTop: 16 }}
          />

          <Shimmer
            width={"100%"}
            height={46}
            radius={10}
            style={{ marginTop: 16 }}
          />
        </LinearGradient>

        {/* MAP PREVIEW */}
        <Shimmer
          width={"100%"}
          height={120}
          radius={12}
          style={{ marginTop: 20 }}
        />

        {/* LIST SKELETON ITEMS */}
        {[1, 2, 3, 4].map((i) => (
          <LinearGradient
            key={i}
            colors={[color.darkPrimary, color.bgDark]}
            style={{
              padding: 16,
              borderRadius: 14,
              marginTop: 16,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Shimmer width={40} height={40} radius={8} />

            <View style={{ marginLeft: 12, flex: 1 }}>
              <Shimmer width={"60%"} height={16} radius={6} />
              <Shimmer
                width={"80%"}
                height={14}
                radius={6}
                style={{ marginTop: 8 }}
              />
            </View>

            <Shimmer width={24} height={24} radius={6} />
          </LinearGradient>
        ))}
      </View>
    );
  };

  if (loading) return <SavedPlacesSkeleton />;


  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View
        style={{
          paddingHorizontal: windowWidth(25),
          paddingTop: windowHeight(40),
          // paddingBottom: windowHeight(120),
        }}
      >
        {/* ---------------- HEADER ---------------- */}
        <Text
          style={{
            fontSize: fontSizes.FONT26,
            color: color.primaryText,
            fontFamily: "TT-Octosquares-Medium",
            textAlign: "center",
            marginBottom: 10,
          }}
        >
          Saved Places
        </Text>

        <Text
          style={{
            fontSize: fontSizes.FONT14,
            color: color.primaryGray,
            textAlign: "center",
            marginBottom: 25,
            fontFamily: "TT-Octosquares-Medium",
          }}
        >
          Add shortcuts for your favourite locations.
        </Text>
      </View>
      <ScrollView
        style={{
          paddingHorizontal: windowWidth(25),
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#f73939"]}
            tintColor="#f73939"
          />
        }
      >

        {/* ---------------- FORM CARD ---------------- */}
        <LinearGradient
          colors={[color.darkPrimary, color.bgDark]}
          style={{
            padding: 18,
            borderRadius: 18,
            marginBottom: 25,
          }}
        >
          {/* Label Input */}
          <TextInput
            placeholder="Place Label (Home, Work, Gym...)"
            placeholderTextColor="#888"
            value={label}
            onChangeText={setLabel}
            style={{
              backgroundColor: "#1d1d1d",
              padding: 12,
              borderRadius: 10,
              color: color.primaryText,
              marginBottom: 12,
              fontFamily: "TT-Octosquares-Medium",
            }}
          />

          {/* Search Address */}
          <View>
            <TextInput
              placeholder="Search address…"
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{
                backgroundColor: "#1d1d1d",
                padding: 12,
                borderRadius: 10,
                color: color.primaryText,
                fontFamily: "TT-Octosquares-Medium",
              }}
            />

            {/* -------- Autocomplete Dropdown -------- */}
            {autocompleteResults.length > 0 && (
              <Animated.View
                style={{
                  opacity: dropdownAnim,
                  backgroundColor: "#1c1c1c",
                  marginTop: 6,
                  borderRadius: 10,
                  paddingVertical: 6,
                  elevation: 20,
                  zIndex: 9999,
                }}
              >
                {autocompleteResults.map((place) => (
                  <TouchableOpacity
                    key={place.place_id}
                    onPress={() =>
                      handleSelectPlace(place.place_id, place.description)
                    }
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      flexDirection: "row",
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontFamily: "TT-Octosquares-Medium",
                      }}
                    >
                      {place.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </Animated.View>
            )}
          </View>

          {/* Save Button */}
          <View style={{ marginTop: 20 }}>
            <Button
              title={saving ? "Saving..." : "Save Place"}
              onPress={handleSavePlace}
            />
          </View>
        </LinearGradient>

        {location && (
          <View style={styles.mapWrap}>
            <MapView
              ref={mapRef}
              style={{ flex: 1 }}
              provider={PROVIDER_GOOGLE}
              customMapStyle={customMapStyle}
              initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker coordinate={location}>
                <Image
                  source={Images.mapPickupMarker}
                  style={styles.mapMarker}
                  resizeMode="contain"
                />
              </Marker>
            </MapView>
          </View>
        )}

        <ScrollView
          style={{
            // flex:1
          }}>


          {/* ---------------- SAVED LIST ---------------- */}
          <FlatList
            data={savedPlaces || []}
            keyExtractor={(item) => item.id?.toString() || item._id?.toString()}
            renderItem={({ item }) => <RenderPlaceCard item={item} />}
            contentContainerStyle={{
              paddingBottom: 30,
              paddingTop: 5,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <Text
                style={{
                  color: "#aaa",
                  textAlign: "center",
                  fontFamily: "TT-Octosquares-Medium",
                  marginTop: 20,
                }}
              >
                No saved places yet.
              </Text>

            }
          />
        </ScrollView>

      </ScrollView>
    </KeyboardAvoidingView>
  );

}

/* ---------------------------- Styles ---------------------------- */

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: fontSizes.FONT26,
    color: color.primaryText,
    fontFamily: "TT-Octosquares-Medium",
  },
  headerSub: {
    marginTop: 6,
    color: color.primaryGray,
    fontSize: fontSizes.FONT14,
    fontFamily: "TT-Octosquares-Medium",
    marginBottom: 18,
  },
  formCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#141414",
    padding: 12,
    borderRadius: 10,
    color: color.primaryText,
    fontFamily: "TT-Octosquares-Medium",
  },
  dropdown: {
    overflow: "hidden",
    backgroundColor: "#111",
    borderRadius: 10,
    marginTop: 8,
  },
  dropRow: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    borderBottomColor: "rgba(255,255,255,0.05)",
    borderBottomWidth: 1,
  },
  dropText: {
    color: "#ddd",
    fontFamily: "TT-Octosquares-Medium",
    fontSize: fontSizes.FONT14,
    flex: 1,
  },
  mapWrap: {
    height: 120,
    marginTop: 10,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 30
  },
  mapMarker: {
    width: windowWidth(36),
    height: 36,
    tintColor: color.primaryGray,
  },
  sectionTitle: {
    fontSize: fontSizes.FONT18,
    color: color.primaryText,
    fontFamily: "TT-Octosquares-Medium",
    marginTop: 10,
  },
  placeCard: {
    padding: 14,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  placeLabel: {
    color: color.primaryText,
    fontSize: fontSizes.FONT17,
    fontFamily: "TT-Octosquares-Medium",
  },
  placeAddr: {
    color: "#aaa",
    fontSize: fontSizes.FONT13,
    marginTop: 4,
    fontFamily: "TT-Octosquares-Medium",
  },
});
