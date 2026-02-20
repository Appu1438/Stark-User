import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { Stack } from "expo-router";
import { ToastProvider } from "react-native-toast-notifications";
import { AppState, AppStateStatus, LogBox, StyleSheet, View } from "react-native";
import { useFonts } from "expo-font";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import * as Notifications from "expo-notifications";
import { ThemeProvider, DefaultTheme } from "@react-navigation/native";
import color from "@/themes/app.colors";
import socketService from "@/utils/socket/socketService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
export { ErrorBoundary } from "expo-router";

const MyDarkTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: color.subPrimary,
    card: color.bgDark,
    text: color.primaryText,
    border: color.border,
  },
};

SplashScreen.setOptions({
  duration: 2000,
  fade: true,
});
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    "TT-Octosquares-Medium": require("../assets/fonts/TT-Octosquares-Medium.ttf"),
  });

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  useEffect(() => {
    LogBox.ignoreAllLogs(true);
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  /**
   * ✅ CONNECT SOCKET ONCE (APP LIFETIME)
   */
  useEffect(() => {
    socketService.connect();
  }, []);

  /**
   * ✅ RECONNECT WHEN APP RETURNS TO FOREGROUND
   */
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (state: AppStateStatus) => {
        console.log("📱 AppState:", state);
        if (state === "active") {
          console.log("🔁 App active → reconnect socket");
          socketService.connect();
        }
      }
    );

    return () => subscription.remove();
  }, []);

  /**
  * ✅ IDENTIFY USER AFTER SOCKET IS CONNECTED
  */
  useEffect(() => {
    const identifyUser = async () => {
      const stored = await AsyncStorage.getItem("userData");
      console.log(stored)
      if (!stored) return;

      const userData = JSON.parse(stored);
      console.log(userData)
      if (!userData?.id) return;

      console.log("🆔 [APP] identifying user:", userData.id);

      socketService.send({
        type: "identify",
        role: "user",
        userId: userData.id,
      });
    };

    // 🔥 ONLY identify AFTER socket opens
    const unsubscribe = socketService.onConnected(() => {
      identifyUser();
    });

    return () => {
      unsubscribe?.();
    };
  }, []);


  if (!loaded && !error) {
    return null;
  }

  return <RootLayoutNav />;
}
function RootLayoutNav() {
  return (
    <SafeAreaProvider>
      <MainApp />
    </SafeAreaProvider>
  );
}

function MainApp() {
  const insets = useSafeAreaInsets();

  return (
    <ThemeProvider value={MyDarkTheme}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Animated.View
          style={{
            flex: 1,
            paddingBottom: insets.bottom   // 🔥 GLOBAL FIX
          }}
        >
          <ToastProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </ToastProvider>
        </Animated.View>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
});
