import { View, Text, Pressable } from "react-native";
import { styles } from "./styles";
import color from "@/themes/app.colors";
import { Clock, Search } from "@/utils/icons";
import { windowHeight, windowWidth } from "@/themes/app.constant";
import DownArrow from "@/assets/icons/downArrow";
import { router } from "expo-router";

export default function LocationSearchBar() {
  return (

    <Pressable
      style={styles.container}
      onPress={() => router.push("/(routes)/rideplan")}
    >
      {/* Left section: Search icon and text */}
      <View style={styles.leftSection}>
        <Search />
        <Text style={styles.textInputStyle}>Where to?</Text>
      </View>

      {/* Right section: Clock + Now + DownArrow */}
      <View style={styles.rightSection}>
        <Clock />
        <Text style={styles.nowText}>Now</Text>
        <DownArrow />
      </View>
    </Pressable>
  );
}
