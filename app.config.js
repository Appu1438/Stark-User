import 'dotenv/config';

export default {
  expo: {
    name: "Stark",
    slug: "stark-user",
    version: "1.0.0",
    orientation: "portrait",
    scheme: "stark",
    userInterfaceStyle: "light",

    plugins: [
      [
        "expo-splash-screen",
        {
          backgroundColor: "#000000",
          image: "./assets/images/logo/FullLogo.png",
          dark: {
            image: "./assets/images/logo/FullLogo.png",
            backgroundColor: "#000000",
          },
          imageWidth: 250,
        },
      ],
      [
        "expo-font",
        {
          fonts: ["./assets/fonts/TT-Octosquares-Medium.ttf"],
        },
      ],
      "expo-router",
    ],

    android: {
      package: "com.adithyanskumar.stark",
      versionCode: 1,
      permissions: [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "NOTIFICATIONS",
      ],
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY,
        },
      },
    },

    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.adithyanskumar.stark",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
      config: {
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY,
      },
    },

    extra: {
      eas: {
        projectId: "56aee935-c73a-470b-825f-34e350e13bff",
      },
    },
  },
};
