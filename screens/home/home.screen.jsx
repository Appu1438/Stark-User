import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  RefreshControl,
  FlatList,
  Platform,
  Alert,
  BackHandler,
  StyleSheet,
  Animated,
} from "react-native";
import { styles } from "./styles";
import { commonStyles } from "@/styles/common.style";
import { external } from "@/styles/external.style";
import LocationSearchBar from "@/components/location/location.search.bar";
import color from "@/themes/app.colors";
import { useEffect, useState, useCallback, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "@/api/axiosInstance";
import { useFocusEffect } from "@react-navigation/native";
import socketService from "@/utils/socket/socketService";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Toast } from "react-native-toast-notifications";
import { useGetUserRideHistories } from "@/hooks/useGetUserData";
import HomeSkeleton from "./home-skelton.screen";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { fontSizes, windowHeight, windowWidth } from "@/themes/app.constant";
import RideCard from "@/components/ride/ride.card";
import { CAB_TYPES, DAILY_DESTINATIONS, EXPLORE_MORE, FEATURES, NEARBY_PLACES } from "@/configs/constants";


export default function Home() {
  const { recentRides, loading, refetchRides } = useGetUserRideHistories();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetchRides();
    setRefreshing(false);
  }, [refetchRides]);

  useEffect(() => {
    socketService.connect();
    socketService.clearListeners();
    return () => {
      socketService.clearListeners();
      socketService.disconnect();
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        Alert.alert("Exit App", "Are you sure you want to exit?", [
          { text: "Cancel", style: "cancel" },
          { text: "Exit", onPress: () => BackHandler.exitApp() },
        ]);
        return true;
      };

      if (Platform.OS === "android") {
        const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
        return () => subscription.remove();
      }
    }, [])
  );

  const scrollY = useRef(new Animated.Value(0)).current;

  // 🔥 Search bar animated movement (0 → -15)
  const searchTranslateY = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, -15],
    extrapolate: "clamp",
  });

  const searchOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 100],
    extrapolate: "clamp",
  });

  if (loading) return <HomeSkeleton />;

  return (
    <View style={[commonStyles.flexContainer, { backgroundColor: color.subPrimary }]}>
      {/* 🔥 FIXED SEARCH BAR WITH ANIMATION */}
      <Animated.View
        style={[
          styles.stickySearchWrapper,
          {
            transform: [{ translateY: searchTranslateY }],
            opacity: searchOpacity,
          },
        ]}
      >
        <Text style={styles.logoText}>Stark</Text>
        <LocationSearchBar />
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={{ paddingTop: windowHeight(110) }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#f73939"]} />
        }
      >
        {/* Header */}
        {/* <View style={[styles.container, external.ph_20]}>
          <Text
            style={{
              fontFamily: "TT-Octosquares-Medium",
              fontSize: fontSizes.FONT25,
              color: color.primaryText,
              marginTop: windowHeight(15),
            }}
          >
            Stark
          </Text>
          <LocationSearchBar />
        </View> */}

        {/* Intro / Hero Card */}
        <LinearGradient
          colors={["#2A2A2A", "#1A1A1A"]}
          style={{
            marginHorizontal: 15,
            marginTop: 25,
            borderRadius: 20,
            padding: 20,
          }}
        >
          <Text
            style={{
              color: color.primaryText,
              fontFamily: "TT-Octosquares-Medium",
              fontSize: fontSizes.FONT20,
              marginBottom: 8,
            }}
          >
            Your Ride, Reinvented.
          </Text>
          <Text
            style={{
              color: color.secondaryFont,
              fontFamily: "TT-Octosquares-Medium",
              fontSize: fontSizes.FONT14,
            }}
          >
            Experience luxury, speed, and safety at your fingertips — powered by Stark.
          </Text>
          <Pressable
            onPress={() => router.push("/(routes)/ride-plan")}
            style={{
              backgroundColor: color.buttonBg,
              borderRadius: 12,
              paddingVertical: 10,
              paddingHorizontal: 18,
              alignSelf: "flex-start",
              marginTop: 15,
            }}
          >
            <Text
              style={{
                color: color.primary,
                fontFamily: "TT-Octosquares-Medium",
                fontSize: fontSizes.FONT14,
              }}
            >
              Book a Ride →
            </Text>
          </Pressable>
        </LinearGradient>

        {/* Choose Your Ride */}
        <Section title="Choose Your Ride">
          <FlatList
            data={CAB_TYPES}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/(routes)/feature-details",
                    params: {
                      id: item.id,
                      title: item.name,
                      quote: item.detailedQuote,
                      // image: Image.resolveAssetSource(item.image).uri,
                      image: item.image
                    },
                  })
                }
                style={{
                  marginRight: 15,
                  borderRadius: 18,
                  overflow: "hidden",
                  width: windowWidth(280),
                  height: windowHeight(150),
                  backgroundColor: color.darkPrimary,
                }}
              >
                <Image source={item.image} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                <LinearGradient colors={["transparent", "rgba(0,0,0,0.75)"]} style={StyleSheet.absoluteFillObject} />
                <View style={{ position: "absolute", bottom: 10, left: 10 }}>
                  <Text style={{ color: color.primaryText, fontFamily: "TT-Octosquares-Medium", fontSize: fontSizes.FONT14 }}>
                    {item.name}
                  </Text>
                  <Text
                    style={{
                      color: color.secondaryFont,
                      fontFamily: "TT-Octosquares-Medium",
                      fontSize: fontSizes.FONT12,
                      marginTop: 4,
                    }}
                  >
                    {item.quote}
                  </Text>
                </View>
              </Pressable>
            )}
          />
        </Section>

        {/* Features Section */}
        <Section title="Built for Comfort. Designed for You.">
          <FlatList
            data={FEATURES}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/(routes)/feature-details",
                    params: {
                      id: item.id,
                      title: item.title,
                      quote: item.detailedQuote,
                      // image: Image.resolveAssetSource(item.image).uri,
                      image: item.image
                    },
                  })
                } style={{
                  marginRight: 12,
                  width: windowWidth(320),
                }}
              >
                {/* Full Image */}
                <View
                  style={{
                    borderRadius: 15,
                    overflow: "hidden",
                    height: windowHeight(150),
                    backgroundColor: color.darkPrimary,
                  }}
                >
                  <Image
                    source={item.image}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                  />
                </View>

                {/* Title */}
                <Text
                  style={{
                    color: color.primaryText,
                    fontFamily: "TT-Octosquares-Medium",
                    fontSize: fontSizes.FONT15,
                    marginTop: 8,
                    paddingHorizontal: 5.0
                  }}
                >
                  {item.title}
                </Text>

                {/* Quote */}
                <Text
                  style={{
                    color: color.secondaryFont,
                    fontFamily: "TT-Octosquares-Medium",
                    fontSize: fontSizes.FONT12,
                    marginTop: 2,
                    width: 240,
                    paddingHorizontal: 5.0

                  }}
                  numberOfLines={2}
                >
                  {item.quote}
                </Text>
              </Pressable>
            )}
          />
        </Section>

        <Section title="Your Everyday Places">
          <FlatList
            horizontal
            data={DAILY_DESTINATIONS}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/(routes)/feature-details",
                    params: {
                      id: item.id,
                      title: item.title,
                      quote: item.detailedQuote,
                      // image: Image.resolveAssetSource(item.image).uri,
                      image: item.image
                    },
                  })
                } style={{
                  marginRight: 12,
                  borderRadius: 15,
                  overflow: "hidden",
                  width: windowWidth(280),
                  height: windowHeight(150),
                  backgroundColor: color.darkPrimary,
                }}
              >
                <Image source={item.image} style={{ width: "100%", height: "100%" }} />
                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.75)"]}
                  style={StyleSheet.absoluteFillObject}
                />
                <View style={{ position: "absolute", bottom: 10, left: 10 }}>
                  <Text
                    style={{
                      color: color.primaryText,
                      fontFamily: "TT-Octosquares-Medium",
                      fontSize: fontSizes.FONT14,
                      paddingHorizontal: 5

                    }}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={{
                      color: color.secondaryFont,
                      fontFamily: "TT-Octosquares-Medium",
                      fontSize: fontSizes.FONT12,
                      marginTop: 2,
                      paddingHorizontal: 5
                    }}
                  >
                    {item.quote}
                  </Text>
                </View>
              </Pressable>
            )}
          />
        </Section>

        <Section title="Explore More Ways to Ride">
          <FlatList
            horizontal
            data={EXPLORE_MORE}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/(routes)/feature-details",
                    params: {
                      id: item.id,
                      title: item.title,
                      quote: item.detailedQuote,
                      // image: Image.resolveAssetSource(item.image).uri,
                      image: item.image
                    },
                  })
                } style={{
                  marginRight: 12,
                  width: windowWidth(320),
                }}
              >
                {/* Full Image */}
                <View
                  style={{
                    borderRadius: 15,
                    overflow: "hidden",
                    height: windowHeight(150),
                    backgroundColor: color.darkPrimary,
                  }}
                >
                  <Image
                    source={item.image}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                  />
                </View>

                {/* Title */}
                <Text
                  style={{
                    color: color.primaryText,
                    fontFamily: "TT-Octosquares-Medium",
                    fontSize: fontSizes.FONT15,
                    marginTop: 8,
                    paddingHorizontal: 5.0
                  }}
                >
                  {item.title}
                </Text>

                {/* Quote */}
                <Text
                  style={{
                    color: color.secondaryFont,
                    fontFamily: "TT-Octosquares-Medium",
                    fontSize: fontSizes.FONT12,
                    marginTop: 2,
                    width: 240,
                    paddingHorizontal: 5.0

                  }}
                  numberOfLines={2}
                >
                  {item.quote}
                </Text>
              </Pressable>
            )}
          />
        </Section>


        {/* Discover What’s Beyond */}
        <Section title="Where Do You Want to Go?">
          <FlatList
            data={NEARBY_PLACES}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/(routes)/feature-details",
                    params: {
                      id: item.id,
                      title: item.title,
                      quote: item.detailedQuote,
                      // image: Image.resolveAssetSource(item.image).uri,
                      image: item.image
                    },
                  })
                } style={{
                  marginRight: 12,
                  borderRadius: 15,
                  overflow: "hidden",
                  width: windowWidth(320),
                  height: windowHeight(150),
                }}
              >
                <Image source={item.image} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                <LinearGradient colors={["transparent", "rgba(0,0,0,0.7)"]} style={StyleSheet.absoluteFillObject} />
                <View style={{ position: "absolute", bottom: 10, left: 10 }}>
                  <Text
                    style={{
                      color: "white",
                      fontFamily: "TT-Octosquares-Medium",
                      fontSize: fontSizes.FONT14,
                      marginBottom: 2,
                    }}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={{
                      color: color.secondaryFont,
                      fontFamily: "TT-Octosquares-Medium",
                      fontSize: fontSizes.FONT12,
                    }}
                  >
                    {item.quote}
                  </Text>
                </View>
              </Pressable>
            )}
          />
        </Section>

        {/* Recent Rides */}
        <Section title="Your Recent Rides">
          <FlatList
            data={recentRides.slice(0, 3)}
            keyExtractor={(item, index) => item.id || index.toString()}
            renderItem={({ item }) => <RideCard item={item} />}
            ListEmptyComponent={
              <Text
                style={{
                  fontFamily: "TT-Octosquares-Medium",
                  color: color.secondaryFont,
                  textAlign: "center",
                  marginVertical: 10,
                }}
              >
                No rides yet! Start your journey today.
              </Text>
            }
          />
        </Section>

      </Animated.ScrollView>
    </View>
  );
}

const Section = ({ title, children }) => (
  <View style={{ paddingHorizontal: 7.5, marginTop: 30 }}>
    <Text
      style={{
        color: color.primaryText,
        fontFamily: "TT-Octosquares-Medium",
        fontSize: fontSizes.FONT17,
        marginBottom: 10,
        paddingHorizontal: 10
      }}
    >
      {title}
    </Text>
    {children}
  </View>
);
