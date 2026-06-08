import React, { useRef, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Share,
    ScrollView,
    Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import color from "@/themes/app.colors";
import { fontSizes } from "@/themes/app.constant";

const FEATURES = [
    {
        icon: "car-sport-outline",
        title: "Safe & Reliable",
        desc: "Professional drivers committed to your comfort every ride.",
        accent: "rgba(255,200,80,0.10)",
        iconColor: "#FFC850",
    },
    {
        icon: "navigate-outline",
        title: "Live Tracking",
        desc: "Real-time ride tracking and seamless booking at your fingertips.",
        accent: "rgba(80,200,255,0.09)",
        iconColor: "#50C8FF",
    },
    {
        icon: "star-outline",
        title: "Top-Rated",
        desc: "Verified drivers with consistently high passenger ratings.",
        accent: "rgba(180,100,255,0.09)",
        iconColor: "#B464FF",
    },
    {
        icon: "flash-outline",
        title: "24/7 Available",
        desc: "Fast, on-demand rides ready whenever you need them.",
        accent: "rgba(80,255,160,0.09)",
        iconColor: "#50FFA0",
    },
];

export default function ReferFriend() {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]).start();
    }, []);

    const handleShare = async () => {
        try {
            await Share.share({
                message: `🚖 Stark – Your Travel Partner

Experience safe, reliable, and comfortable rides with Stark.

Whether it's your daily commute, airport transfer, or outstation journey, Stark makes travel simple and convenient.

📲 Download the app:
https://play.google.com/store/apps/details?id=com.starkcabs.stark

Travel smarter with Stark.`            });
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <View style={styles.mainContainer}>
            <LinearGradient colors={[color.bgDark, color.subPrimary]} style={StyleSheet.absoluteFill} />

            {/* Decorative glow blobs */}
            {/* <View style={styles.glowTopRight} />
            <View style={styles.glowBottomLeft} /> */}

            <SafeAreaView style={{ flex: 1 }}>
                {/* HEADER */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={22} color="#fff" />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.pageTitle}>Invite Friends</Text>
                        <Text style={styles.pageSubtitle}>Spread the word about Stark</Text>
                    </View>
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

                        {/* HERO CARD */}
                        <View style={styles.heroCard}>
                            <LinearGradient
                                colors={["rgba(255,200,80,0.07)", "transparent"]}
                                style={StyleSheet.absoluteFill}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            />

                            <View style={styles.heroIconRing}>
                                <View style={styles.heroIconInner}>
                                    <Text style={styles.heroEmoji}>🚖</Text>
                                </View>
                            </View>

                            <Text style={styles.heroTitle}>Invite Friends</Text>
                            <Text style={styles.heroSubtitle}>
                                Share Stark with friends and family. Help them discover
                                reliable, comfortable rides — anytime, anywhere.
                            </Text>

                            {/* Stat strip */}
                            {/* <View style={styles.statStrip}>
                                <View style={styles.statItem}>
                                    <Text style={styles.statNumber}>4.9★</Text>
                                    <Text style={styles.statLabel}>App Rating</Text>
                                </View>
                                <View style={styles.statDivider} />
                                <View style={styles.statItem}>
                                    <Text style={styles.statNumber}>10K+</Text>
                                    <Text style={styles.statLabel}>Happy Riders</Text>
                                </View>
                                <View style={styles.statDivider} />
                                <View style={styles.statItem}>
                                    <Text style={styles.statNumber}>24/7</Text>
                                    <Text style={styles.statLabel}>Available</Text>
                                </View>
                            </View> */}
                        </View>

                        {/* SECTION HEADER */}
                        <View style={styles.sectionRow}>
                            <Text style={styles.sectionTitle}>Why They'll Love It</Text>
                            <View style={styles.sectionLine} />
                        </View>

                        {/* FEATURE GRID — 2 columns */}
                        <View style={styles.featureGrid}>
                            {FEATURES.map((f, i) => (
                                <View key={i} style={[styles.featureCard, { backgroundColor: f.accent }]}>
                                    <View style={[styles.featureIconWrap, { borderColor: f.iconColor + "33" }]}>
                                        <Ionicons name={f.icon} size={22} color={f.iconColor} />
                                    </View>
                                    <Text style={styles.featureTitle}>{f.title}</Text>
                                    <Text style={styles.featureDesc}>{f.desc}</Text>
                                </View>
                            ))}
                        </View>

                        {/* SHARE BUTTON */}
                        <TouchableOpacity style={styles.shareButton} onPress={handleShare} activeOpacity={0.85}>
                            <Ionicons name="share-social-outline" size={20} color="#000" style={{ marginRight: 8 }} />
                            <Text style={styles.shareButtonText}>Share with Friends</Text>
                        </TouchableOpacity>

                        {/* <Text style={styles.footerNote}>Available on Android · Play Store</Text> */}

                    </Animated.View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: "#050505" },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 50, paddingTop: 10 },

    /* Glow blobs */
    glowTopRight: {
        position: "absolute", top: -80, right: -80,
        width: 240, height: 240, borderRadius: 120,
        backgroundColor: "rgba(255,200,80,0.05)",
    },
    glowBottomLeft: {
        position: "absolute", bottom: 100, left: -60,
        width: 200, height: 200, borderRadius: 100,
        backgroundColor: "rgba(80,180,255,0.04)",
    },

    /* Header */
    header: {
        flexDirection: "row", alignItems: "center",
        gap: 15, paddingHorizontal: 20, paddingTop: 6, paddingBottom: 20,
    },
    backButton: {
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.08)",
        alignItems: "center", justifyContent: "center",
        borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
    },
    pageTitle: { fontSize: fontSizes.FONT20, color: "#fff", fontFamily: "TT-Octosquares-Medium" },
    pageSubtitle: { fontSize: fontSizes.FONT13, color: "#666", fontFamily: "TT-Octosquares-Medium" },

    /* Hero */
    heroCard: {
        borderRadius: 24, padding: 28,
        borderWidth: 1, borderColor: "rgba(255,255,255,0.07)",
        backgroundColor: "rgba(255,255,255,0.03)",
        alignItems: "center", marginBottom: 28, overflow: "hidden",
    },
    heroIconRing: {
        width: 80, height: 80, borderRadius: 40,
        borderWidth: 1, borderColor: "rgba(255,200,80,0.25)",
        alignItems: "center", justifyContent: "center", marginBottom: 18,
    },
    heroIconInner: {
        width: 64, height: 64, borderRadius: 32,
        backgroundColor: "rgba(255,200,80,0.1)",
        alignItems: "center", justifyContent: "center",
    },
    heroEmoji: { fontSize: 30 },
    heroTitle: {
        fontSize: fontSizes.FONT22, color: "#fff",
        fontFamily: "TT-Octosquares-Medium", marginBottom: 10, textAlign: "center",
    },
    heroSubtitle: {
        fontSize: fontSizes.FONT14, color: "#777",
        fontFamily: "TT-Octosquares-Medium",
        textAlign: "center", lineHeight: 22, marginBottom: 24,
    },
    statStrip: {
        flexDirection: "row", width: "100%",
        backgroundColor: "rgba(255,255,255,0.04)",
        borderRadius: 16, paddingVertical: 16,
        borderWidth: 1, borderColor: "rgba(255,255,255,0.05)",
    },
    statItem: { flex: 1, alignItems: "center" },
    statNumber: {
        fontSize: fontSizes.FONT18, color: "#fff",
        fontFamily: "TT-Octosquares-Medium", marginBottom: 2,
    },
    statLabel: { fontSize: fontSizes.FONT11, color: "#555", fontFamily: "TT-Octosquares-Medium" },
    statDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.08)" },

    /* Section */
    sectionRow: { flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 12 },
    sectionTitle: {
        fontSize: fontSizes.FONT15, color: "#666",
        fontFamily: "TT-Octosquares-Medium", flexShrink: 0,
    },
    sectionLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.06)" },

    /* Feature grid */
    featureGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 28 },
    featureCard: {
        width: "47.5%", borderRadius: 18, padding: 18,
        borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
    },
    featureIconWrap: {
        width: 42, height: 42, borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.05)",
        alignItems: "center", justifyContent: "center",
        marginBottom: 12, borderWidth: 1,
    },
    featureTitle: {
        fontSize: fontSizes.FONT14, color: "#fff",
        fontFamily: "TT-Octosquares-Medium", marginBottom: 6,
    },
    featureDesc: {
        fontSize: fontSizes.FONT12, color: "#666",
        fontFamily: "TT-Octosquares-Medium", lineHeight: 18,
    },

    /* Share button */
    shareButton: {
        backgroundColor: color.buttonBg,
        paddingVertical: 17, borderRadius: 16,
        alignItems: "center", justifyContent: "center",
        flexDirection: "row",
    },
    shareButtonText: {
        color: "#000", fontSize: fontSizes.FONT16,
        fontFamily: "TT-Octosquares-Medium",
    },

    footerNote: {
        textAlign: "center", color: "#444",
        fontSize: fontSizes.FONT12,
        fontFamily: "TT-Octosquares-Medium", marginTop: 16,
    },
});