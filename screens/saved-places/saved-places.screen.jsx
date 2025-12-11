import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
  RefreshControl,
  Image,
  StyleSheet,
  FlatList,
  Keyboard,
  ScrollView,
  Pressable,
  StatusBar,
} from "react-native";

import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import axios from "axios";
import axiosInstance from "@/api/axiosInstance";
import color from "@/themes/app.colors";
import { fontSizes, windowHeight, windowWidth } from "@/themes/app.constant";
import Button from "@/components/common/button";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import _ from "lodash";
import { useGetUserSavedPlaces } from "@/hooks/useGetUserData";
import { customMapStyle } from "@/utils/map/mapStyle";
import Images from "@/utils/images";
import AppAlert from "@/components/modal/alert-modal/alert.modal";
import { useUserLocationStore } from "@/store/userLocationStore";
import { Location } from "@/utils/icons";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

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
  const { loading, savedPlaces, refetchSavedPlaces } = useGetUserSavedPlaces();
  const { userLocation, userLocationName, findingLocation, userPlaceId } = useUserLocationStore();

  const [label, setLabel] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [autocompleteResults, setAutocompleteResults] = useState([]);
  const [location, setLocation] = useState(null);
  const [placeId, setPlaceId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const dropdownAnim = useRef(new Animated.Value(0)).current;
  const mapRef = useRef(null);

  /* ⭐ Custom global alert state */
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "", message: "", confirmText: "OK", showCancel: false,
    onConfirm: () => setShowAlert(false), onCancel: () => setShowAlert(false),
  });

  const triggerAlert = (config) => {
    setAlertConfig({
      title: config.title || "Alert",
      message: config.message || "",
      confirmText: config.confirmText || "OK",
      showCancel: config.showCancel || false,
      onConfirm: config.onConfirm || (() => setShowAlert(false)),
      onCancel: config.onCancel || (() => setShowAlert(false)),
    });
    setShowAlert(true);
  };

  // ---------- Debounced Autocomplete ----------
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
    if (searchQuery.length > 2 && searchQuery !== selectedLocation) debouncedFetchPlaces(searchQuery);
    else {
      setAutocompleteResults([]);
      dropdownAnim.setValue(0);
    }
  }, [searchQuery]);

  // ---------- Select Place ----------
  const handleSelectPlace = async (placeId, description) => {
    Keyboard.dismiss();
    setSearchQuery(description);
    setSelectedLocation(description)
    setPlaceId(placeId);
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
        { ...coords, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 400
      );
    } catch (err) {
      console.warn("Place details error:", err);
    }
  };

  // ---------- Save Place ----------
  const handleSavePlace = async () => {
    if (!label.trim() || !searchQuery.trim() || !location) {
      return triggerAlert({ title: "Missing Fields", message: "Please fill all fields correctly." });
    }
    try {
      setSaving(true);
      const payload = { label: label.trim(), address: searchQuery, location, placeId };
      await axiosInstance.post("/save-place", payload);
      setLabel(""); setSearchQuery(""); setLocation(null);
      triggerAlert({ title: "Success", message: "Your place has been saved successfully. Please Refresh" });
    } catch (err) {
      triggerAlert({ title: "Error", message: "Unable to save place." });
    } finally {
      setSaving(false);
    }
  };

  // ---------- Delete Place ----------
  const handleDelete = (id) => {
    if (deletingId !== null) return;
    triggerAlert({
      title: "Delete",
      message: "Remove this saved place?",
      confirmText: "Delete",
      showCancel: true,
      onConfirm: async () => {
        setShowAlert(false);
        setDeletingId(id);
        try {
          await axiosInstance.delete(`/save-place/${id}`);
          refetchSavedPlaces();
        } catch (error) {
          triggerAlert({ title: "Error", message: "Could not delete the place." });
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchSavedPlaces();
    setRefreshing(false);
  };

  const RenderPlaceCard = ({ item }) => (
    <View style={styles.placeCard}>
      <View style={styles.iconWrap}>
        <Ionicons name={getPlaceIcon(item.label)} size={22} color={color.primaryGray} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.placeLabel}>{item.label}</Text>
        <Text numberOfLines={1} style={styles.placeAddr}>{item.address}</Text>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => {
            setLocation(item.location);
            mapRef.current?.animateToRegion(
              { ...item.location, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 400
            );
          }}
        >
          <Ionicons name="navigate-circle-outline" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: 'rgba(255, 82, 82, 0.1)' }]}
          onPress={() => handleDelete(item._id)}
          disabled={deletingId === item._id}
        >
          {deletingId === item._id ? (
            <ActivityIndicator size={18} color="#FF5252" />
          ) : (
            <Ionicons name="trash-outline" size={20} color="#FF5252" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  /* ------------------ SKELETON ------------------ */
  const Shimmer = ({ width, height, radius = 8, style }) => {
    const translateX = useRef(new Animated.Value(-300)).current;
    useEffect(() => {
      Animated.loop(Animated.timing(translateX, { toValue: 300, duration: 1200, useNativeDriver: true })).start();
    }, []);
    return (
      <View style={[{ width, height, borderRadius: radius, backgroundColor: "rgba(255,255,255,0.05)", overflow: "hidden" }, style]}>
        <Animated.View style={{ width: "50%", height: "100%", opacity: 0.3, backgroundColor: "#444", transform: [{ translateX }] }} />
      </View>
    );
  };

  const SavedPlacesSkeleton = () => (
    <View style={{ paddingHorizontal: 20, paddingTop: 40 }}>
      <Shimmer width={150} height={24} radius={6} />
      <Shimmer width={220} height={16} radius={6} style={{ marginTop: 10, marginBottom: 30 }} />
      <Shimmer width="100%" height={280} radius={20} style={{ marginBottom: 25 }} />
      {[1, 2, 3].map((i) => (
        <Shimmer key={i} width="100%" height={70} radius={16} style={{ marginBottom: 15 }} />
      ))}
    </View>
  );

  if (loading) return (
    <View style={styles.mainContainer}>
      <LinearGradient colors={[color.bgDark || "#050505", "#111"]} style={StyleSheet.absoluteFill} />
      <SavedPlacesSkeleton />
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      <LinearGradient colors={[color.bgDark, color.subPrimary]} style={StyleSheet.absoluteFill} />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={color.primary} />}>

            {/* HEADER */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <View>
                <Text style={styles.pageTitle}>Saved Places</Text>
                <Text style={styles.pageSubtitle}>Manage your favorite locations</Text>
              </View>
            </View>

            {/* FORM CARD */}
            <View style={styles.formCard}>
              <Text style={styles.cardTitle}>Add New Place</Text>

              <Text style={styles.label}>Label</Text>
              <TextInput
                placeholder="e.g. Home, Work, Gym"
                placeholderTextColor="#666"
                value={label}
                onChangeText={setLabel}
                style={styles.input}
              />

              <Text style={styles.label}>Address</Text>
              <TextInput
                placeholder="Search address..."
                placeholderTextColor="#666"
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.input}
              />

              {!findingLocation && userLocation && (
                <TouchableOpacity
                  style={styles.currentLocBtn}
                  onPress={() => {
                    if (!userLocation) return;
                    setSearchQuery(userLocationName);
                    setSelectedLocation(userLocationName);
                    setLocation(userLocation);
                    setPlaceId(userPlaceId);
                    mapRef.current?.animateToRegion({ ...userLocation, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 400);
                  }}
                >
                  <Ionicons name="locate" size={18} color={color.primaryText} />
                  <Text style={styles.currentLocText}>Use Current Location</Text>
                </TouchableOpacity>
              )}

              {/* AUTOCOMPLETE DROPDOWN */}
              {autocompleteResults.length > 0 && (
                <ScrollView style={styles.dropdownContainer}>
                  {autocompleteResults.map((place) => (
                    <TouchableOpacity
                      key={place.place_id}
                      onPress={() => handleSelectPlace(place.place_id, place.description)}
                      style={styles.dropRow}
                    >
                      <Ionicons name="location-outline" size={16} color="#888" style={{ marginTop: 2 }} />
                      <Text style={styles.dropText}>{place.description}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              {/* MAP PREVIEW */}
              {location && (
                <View style={styles.mapContainer}>
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
                      <Image source={Images.mapPickupMarker} style={{ width: 36, height: 36, tintColor: color.primaryText }} resizeMode="contain" />
                    </Marker>
                  </MapView>
                </View>
              )}

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSavePlace}
                disabled={saving}
              >
                {saving ? <ActivityIndicator color="#000" /> : <Text style={styles.saveText}>Save Location</Text>}
              </TouchableOpacity>
            </View>

            {/* SAVED LIST */}
            <Text style={styles.sectionTitle}>Your Places</Text>

            <FlatList
              data={savedPlaces || []}
              keyExtractor={(item) => item.id?.toString() || item._id?.toString()}
              renderItem={({ item }) => <RenderPlaceCard item={item} />}
              scrollEnabled={false}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons name="map-marker-off" size={40} color="#333" />
                  <Text style={styles.emptyText}>No saved places yet.</Text>
                </View>
              }
            />

          </ScrollView>
        </KeyboardAvoidingView>

        <AppAlert
          visible={showAlert}
          title={alertConfig.title}
          message={alertConfig.message}
          confirmText={alertConfig.confirmText}
          showCancel={alertConfig.showCancel}
          onCancel={alertConfig.onCancel}
          onConfirm={alertConfig.onConfirm}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#050505" },
  scrollContent: { padding: 20, paddingBottom: 50 },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 25, gap: 15 },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  pageTitle: { fontSize: fontSizes.FONT20, color: "#fff", fontFamily: "TT-Octosquares-Medium" },
  pageSubtitle: { fontSize: fontSizes.FONT14, color: "#888", fontFamily: "TT-Octosquares-Medium" },

  // Form Card
  formCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: 30 },
  cardTitle: { fontSize: fontSizes.FONT18, color: '#fff', fontFamily: "TT-Octosquares-Medium", marginBottom: 20 },

  label: { fontSize: fontSizes.FONT12, color: '#888', marginBottom: 8, marginTop: 10, fontFamily: "TT-Octosquares-Medium" },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 14, fontSize: fontSizes.FONT16, color: '#fff', fontFamily: "TT-Octosquares-Medium", borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },

  currentLocBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 10, alignSelf: 'flex-start' },
  currentLocText: { color: color.primaryText, fontSize: fontSizes.FONT14, fontFamily: "TT-Octosquares-Medium", marginLeft: 6 },

  dropdownContainer: { flex: 1, backgroundColor: '#1a1a1a', borderRadius: 12, marginTop: 20, padding: 5, zIndex: 10, position: 'absolute', top: 200, left: 20, right: 20, borderWidth: 1, borderColor: '#333' },
  dropRow: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', gap: 10 },
  dropText: { color: '#eee', fontSize: fontSizes.FONT14, fontFamily: "TT-Octosquares-Medium", flex: 1 },

  mapContainer: { height: 180, borderRadius: 16, overflow: 'hidden', marginTop: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  saveButton: { backgroundColor: color.buttonBg, paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 20 },
  saveText: { color: '#000', fontSize: fontSizes.FONT16, fontFamily: "TT-Octosquares-Medium", },

  // List
  sectionTitle: { fontSize: fontSizes.FONT18, color: '#fff', fontFamily: "TT-Octosquares-Medium", marginBottom: 15 },
  placeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.03)' },
  iconWrap: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  placeLabel: { fontSize: fontSizes.FONT16, color: '#fff', fontFamily: "TT-Octosquares-Medium", marginBottom: 2 },
  placeAddr: { fontSize: fontSizes.FONT12, color: '#888', fontFamily: "TT-Octosquares-Medium", maxWidth: '90%' },

  actionRow: { flexDirection: 'row', gap: 10, marginLeft: 10 },
  actionBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },

  emptyState: { alignItems: 'center', padding: 40 },
  emptyText: { color: '#444', marginTop: 10, fontFamily: "TT-Octosquares-Medium" },
});