const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// 👇 This line fixes the BVLinearGradient crash
config.resolver.extraNodeModules = {
  "react-native-linear-gradient": path.resolve(
    __dirname,
    "node_modules/expo-linear-gradient"
  ),
};

module.exports = config;
