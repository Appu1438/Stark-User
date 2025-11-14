
import {
  View,
  Text,
  KeyboardTypeOptions,
  StyleSheet,
  TextInput,
  Platform,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import fonts from "@/themes/app.fonts";
import { windowHeight, windowWidth } from "@/themes/app.constant";
import color from "@/themes/app.colors";


export default function Input({
  title,
  placeholder,
  keyboardType,
  value,
  warning,
  onChangeText,
  showWarning,
  emailFormatWarning,
  disabled,
}) {
  const { colors } = useTheme();

  return (
    <View>
      <Text style={[styles.title, {
        color: color.primaryText, fontFamily: "TT-Octosquares-Medium",
      }]}>{title}</Text>
      <TextInput
        style={[
          styles.input,
          {
            // backgroundColor: color.lightGray,
            borderColor: color.border,
            fontFamily: "TT-Octosquares-Medium",

          },
        ]}
        placeholder={placeholder}
        placeholderTextColor={color.primaryText}
        keyboardType={keyboardType}
        value={value}
        editable={disabled}
        aria-disabled={disabled}
        onChangeText={onChangeText}
      />
      {showWarning && <Text style={[styles.warning]}>{warning}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: fonts.medium,
    fontSize: windowWidth(20),
    marginVertical: windowHeight(8),
  },
  input: {
    borderRadius: 5,
    borderWidth: 1,
    marginBottom: 5,
    height: Platform.OS === "ios" ? windowHeight(40) : windowHeight(40),
    color: color.secondaryFont,
    paddingHorizontal: 10,
  },
  warning: {
    color: color.red,
    marginTop: 3,
  },
});
