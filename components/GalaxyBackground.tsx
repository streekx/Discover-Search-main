import React from "react";
import { StyleSheet, ImageBackground, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const BG = require("@/assets/images/galaxy_bg.jpg");

export default function GalaxyBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <ImageBackground source={BG} style={StyleSheet.absoluteFill} resizeMode="cover">
        <LinearGradient
          colors={["rgba(0,0,0,0.35)", "rgba(0,0,0,0.15)", "rgba(0,0,0,0.55)"]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
        />
      </ImageBackground>
    </View>
  );
}
