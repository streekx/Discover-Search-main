/**
 * StreekX — Animated Splash Screen
 *
 * HOW TO CUSTOMIZE:
 *  - LOGO_LETTERS / LOGO_COLORS  — change the logo letters and their colors
 *  - TAGLINE                     — text shown below the logo
 *  - Timing constants at top     — control speed of each animation phase
 *
 * Uses React Native's built-in Animated API only (no Reanimated dependency).
 * All easings use Easing.bezier() which works on all RN versions.
 */

import React, { useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, Animated, Dimensions, Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

// ─── Customizable constants ────────────────────────────────────────────────
const LOGO_LETTERS = ["S", "T", "R", "E", "E", "K", "X"];
const LOGO_COLORS  = ["#6EB4FF", "#EF4444", "#F59E0B", "#6EB4FF", "#22C55E", "#EF4444", "#C0C0D0"];
const TAGLINE = "Search anything, find everything";

// Timing (ms)
const ORBIT_DURATION  = 1800;  // how long stars orbit
const LOGO_IN_DELAY   = 1900;  // when logo fades in
const LOGO_IN_MS      = 500;
const TAG_DELAY       = 2300;  // when tagline slides up
const TAG_MS          = 600;
const HOLD_MS         = 1800;  // how long logo is held visible
const FADE_OUT_MS     = 600;   // final fade-out
const TOTAL_MS        = LOGO_IN_DELAY + LOGO_IN_MS + HOLD_MS + FADE_OUT_MS; // ~4800ms

// ─── Layout ────────────────────────────────────────────────────────────────
const { width: W, height: H } = Dimensions.get("window");
const ORBIT_R = 70; // orbit circle radius
const ORBIT_COUNT = 4; // number of orbiting dots

// Static star positions [xFrac, yFrac, size, opacity]
const STARS: [number, number, number, number][] = [
  [0.12, 0.08, 1.8, 0.9], [0.88, 0.05, 1.4, 0.8], [0.45, 0.03, 1.2, 0.85],
  [0.72, 0.11, 1.6, 0.75],[0.28, 0.15, 1.0, 0.7], [0.60, 0.07, 1.3, 0.8],
  [0.92, 0.22, 1.1, 0.65],[0.08, 0.30, 1.4, 0.7], [0.55, 0.20, 0.9, 0.6],
  [0.38, 0.25, 1.2, 0.65],[0.78, 0.28, 1.0, 0.6], [0.20, 0.40, 0.8, 0.55],
  [0.65, 0.35, 1.1, 0.6], [0.50, 0.12, 1.5, 0.85],[0.82, 0.42, 0.9, 0.5],
  [0.18, 0.50, 0.8, 0.45],[0.70, 0.55, 0.7, 0.4], [0.35, 0.60, 0.9, 0.45],
  [0.90, 0.58, 0.8, 0.4], [0.05, 0.62, 1.0, 0.5],
];

export default function AnimatedSplashScreen({ onFinish }: { onFinish: () => void }) {
  // Screen fade
  const screenOpacity = useRef(new Animated.Value(1)).current;

  // Orbit rotation (0 → 1 = one full spin)
  const orbitSpin = useRef(new Animated.Value(0)).current;
  const orbitOpacity = useRef(new Animated.Value(1)).current;

  // Logo
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale   = useRef(new Animated.Value(0.6)).current;

  // Tagline
  const tagOpacity = useRef(new Animated.Value(0)).current;
  const tagY       = useRef(new Animated.Value(14)).current;

  const EO   = Easing.bezier(0.33, 1, 0.68, 1);   // ease-out
  const EI   = Easing.bezier(0.32, 0, 0.67, 0);   // ease-in
  const EIO  = Easing.bezier(0.45, 0, 0.55, 1);   // ease-in-out

  useEffect(() => {
    // Phase 1: orbit spins
    Animated.timing(orbitSpin, {
      toValue: 1,
      duration: ORBIT_DURATION,
      easing: EIO,
      useNativeDriver: true,
    }).start();

    // Orbit dots fade out just before logo appears
    Animated.sequence([
      Animated.delay(LOGO_IN_DELAY - 300),
      Animated.timing(orbitOpacity, { toValue: 0, duration: 300, easing: EI, useNativeDriver: true }),
    ]).start();

    // Phase 2: logo fades in
    Animated.sequence([
      Animated.delay(LOGO_IN_DELAY),
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: LOGO_IN_MS, easing: EO, useNativeDriver: true }),
        Animated.spring(logoScale, { toValue: 1, friction: 7, tension: 60, useNativeDriver: true }),
      ]),
    ]).start();

    // Phase 3: tagline slides up
    Animated.sequence([
      Animated.delay(TAG_DELAY),
      Animated.parallel([
        Animated.timing(tagOpacity, { toValue: 1, duration: TAG_MS, easing: EO, useNativeDriver: true }),
        Animated.timing(tagY,      { toValue: 0, duration: TAG_MS, easing: EO, useNativeDriver: true }),
      ]),
    ]).start();

    // Phase 4: fade to black → call onFinish
    Animated.sequence([
      Animated.delay(TOTAL_MS),
      Animated.timing(screenOpacity, { toValue: 0, duration: FADE_OUT_MS, easing: EI, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) onFinish();
    });
  }, []);

  const spin = orbitSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.root, { opacity: screenOpacity }]}>
      {/* Deep space background */}
      <LinearGradient
        colors={["#02020A", "#030410", "#050308", "#020205"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.4, y: 0 }}
        end={{ x: 0.6, y: 1 }}
      />

      {/* Milky Way haze */}
      <View style={styles.mwHaze}>
        <LinearGradient
          colors={["transparent", "rgba(160,160,200,0.08)", "rgba(180,180,220,0.14)", "rgba(160,160,200,0.08)", "transparent"]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </View>

      {/* Static stars */}
      {STARS.map(([x, y, size, opacity], i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            left: x * W - size / 2,
            top: y * H - size / 2,
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: "#FFF",
            opacity,
          }}
        />
      ))}

      {/* Orbiting dots */}
      <Animated.View
        pointerEvents="none"
        style={[styles.orbitContainer, { opacity: orbitOpacity, transform: [{ rotate: spin }] }]}
      >
        {Array.from({ length: ORBIT_COUNT }).map((_, i) => {
          const angle = (i / ORBIT_COUNT) * 2 * Math.PI;
          const dx = ORBIT_R * Math.cos(angle);
          const dy = ORBIT_R * Math.sin(angle);
          return (
            <View
              key={i}
              style={[
                styles.orbitDot,
                {
                  transform: [{ translateX: dx }, { translateY: dy }],
                  opacity: 1 - i * 0.18,
                },
              ]}
            />
          );
        })}
      </Animated.View>

      {/* Orbit ring guide */}
      <View style={styles.orbitRing} />

      {/* Logo */}
      <Animated.View style={[styles.logoContainer, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
        <View style={styles.logoRow}>
          {LOGO_LETTERS.map((letter, i) => (
            <Text key={i} style={[styles.logoLetter, { color: LOGO_COLORS[i] }]}>
              {letter}
            </Text>
          ))}
        </View>
        <Animated.Text style={[styles.tagline, { opacity: tagOpacity, transform: [{ translateY: tagY }] }]}>
          {TAGLINE}
        </Animated.Text>
      </Animated.View>

      {/* Bottom vignette */}
      <LinearGradient
        colors={["transparent", "rgba(1,0,4,0.7)", "#010106"]}
        style={styles.bottomVignette}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        pointerEvents="none"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    zIndex: 9999,
    alignItems: "center",
    justifyContent: "center",
  },
  mwHaze: {
    position: "absolute",
    width: W * 2,
    height: H * 0.45,
    top: -H * 0.08,
    left: -W * 0.5,
    transform: [{ rotate: "-30deg" }],
  },
  orbitContainer: {
    position: "absolute",
    width: 0,
    height: 0,
    top: H * 0.44,
    left: W * 0.5,
    alignItems: "center",
    justifyContent: "center",
  },
  orbitDot: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FFFFFF",
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 6,
  },
  orbitRing: {
    position: "absolute",
    top: H * 0.44 - ORBIT_R,
    left: W * 0.5 - ORBIT_R,
    width: ORBIT_R * 2,
    height: ORBIT_R * 2,
    borderRadius: ORBIT_R,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.08)",
  },
  logoContainer: {
    position: "absolute",
    top: H * 0.44 - 50,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoLetter: {
    fontSize: 58,
    fontFamily: "Caveat_700Bold",
    lineHeight: 68,
    letterSpacing: 2,
    textShadowColor: "rgba(255,255,255,0.15)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  tagline: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "rgba(200,200,220,0.68)",
    letterSpacing: 0.4,
    marginTop: 8,
    textAlign: "center",
  },
  bottomVignette: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: H * 0.18,
  },
});
