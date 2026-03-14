/**
 * StreekX — Animated Splash Screen
 *
 * HOW TO CUSTOMIZE:
 *  - Change LOGO_LETTERS / LOGO_COLORS to update the logo.
 *  - Swap <GalaxyBg /> for any background you like.
 *  - Adjust timing constants (ORBIT_MS, LOGO_IN_MS, etc.) to speed up/slow down.
 *  - The onFinish() callback is called when the animation ends.
 *
 * IMPORTANT: Only use Easing.bezier() or Easing.linear here.
 *            Easing.cubic / Easing.sine are NOT available in Reanimated 4.
 */

import React, { useEffect } from "react";
import { StyleSheet, View, Text, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
  withSpring,
  withDelay,
  withRepeat,
  withSequence,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

// ─── Timing constants — edit these to customize the splash ────────────────
const STAR_APPEAR_DELAY  = 500;   // ms before star appears
const ORBIT_MS           = 2200;  // ms for the orbit animation
const LOGO_IN_DELAY      = 2800;  // ms before logo appears
const GLOW_START_DELAY   = 3200;  // ms before glow pulse starts
const TAG_DELAY          = 3100;  // ms before tagline slides up
const FADE_OUT_DELAY     = 5600;  // ms before screen fades to transparent
const FADE_OUT_MS        = 750;   // ms for the fade-out duration

// ─── Safe easing curves (Reanimated 4 compatible) ───────────────────────
// Use Easing.bezier() — these are equivalent to cubic / sine but always work.
const EASE_OUT  = Easing.bezier(0.33, 1, 0.68, 1);     // ease-out cubic
const EASE_IN   = Easing.bezier(0.32, 0, 0.67, 0);     // ease-in cubic
const EASE_INOUT = Easing.bezier(0.45, 0, 0.55, 1);    // ease-in-out sine-like

// ─── Layout ──────────────────────────────────────────────────────────────
const { width: W, height: H } = Dimensions.get("window");
const CX       = W * 0.5;
const CY       = H * 0.44;
const ORBIT_R  = 80;
const DEG2RAD  = Math.PI / 180;

// ─── Logo config — edit to change letters/colors ─────────────────────────
const LOGO_LETTERS = ["s", "t", "r", "e", "e", "k", "x"];
const LOGO_COLORS  = [
  "#6EB4FF", "#EF4444", "#F59E0B",
  "#6EB4FF", "#22C55E", "#EF4444", "#C0C0D0",
];

// ─── Static star field positions [xFrac, yFrac, size, opacity] ───────────
const MW_STARS: [number, number, number, number][] = [
  [0.48,0.01,1.4,0.95],[0.55,0.02,1.0,0.85],[0.42,0.03,1.2,0.90],
  [0.62,0.03,0.9,0.75],[0.35,0.04,1.1,0.80],[0.70,0.04,1.3,0.85],
  [0.27,0.05,0.8,0.70],[0.78,0.05,1.0,0.80],[0.20,0.07,1.2,0.75],
  [0.83,0.07,0.9,0.70],[0.50,0.06,1.5,0.90],[0.57,0.08,1.1,0.85],
  [0.44,0.08,0.8,0.70],[0.65,0.09,1.2,0.80],[0.38,0.10,1.0,0.75],
  [0.73,0.11,0.9,0.80],[0.30,0.12,1.3,0.85],[0.85,0.10,1.1,0.70],
  [0.52,0.13,0.8,0.75],[0.60,0.12,1.2,0.80],[0.23,0.14,0.9,0.65],
  [0.79,0.14,1.0,0.75],[0.46,0.16,1.1,0.80],[0.67,0.15,0.8,0.70],
  [0.16,0.17,1.0,0.65],[0.88,0.13,0.9,0.65],[0.54,0.18,1.3,0.85],
  [0.40,0.19,0.8,0.70],[0.75,0.18,1.1,0.75],[0.32,0.21,0.9,0.70],
  [0.82,0.20,1.0,0.65],[0.48,0.22,0.8,0.70],[0.62,0.21,1.2,0.75],
  [0.25,0.24,1.0,0.65],[0.70,0.23,0.8,0.70],[0.57,0.26,0.9,0.65],
  [0.18,0.27,0.8,0.60],[0.85,0.24,1.1,0.65],[0.43,0.28,1.0,0.70],
  [0.76,0.27,0.8,0.60],[0.36,0.31,0.9,0.65],[0.64,0.30,0.8,0.60],
  [0.52,0.33,1.0,0.65],[0.28,0.34,0.7,0.55],[0.79,0.32,0.9,0.60],
  [0.45,0.36,0.8,0.55],[0.68,0.35,0.7,0.55],[0.22,0.38,0.9,0.55],
  [0.88,0.36,0.8,0.50],[0.55,0.39,0.7,0.55],[0.35,0.41,0.8,0.50],
  [0.72,0.40,0.7,0.50],[0.47,0.43,0.8,0.50],[0.60,0.44,0.7,0.45],
  [0.17,0.42,0.7,0.45],[0.84,0.43,0.7,0.45],[0.40,0.46,0.6,0.40],
  [0.66,0.47,0.7,0.45],[0.30,0.48,0.6,0.40],[0.77,0.48,0.6,0.40],
];
const OUTER_STARS: [number, number, number, number][] = [
  [0.05,0.03,1.8,0.90],[0.93,0.06,1.6,0.85],[0.10,0.15,2.0,0.90],
  [0.97,0.18,1.7,0.80],[0.02,0.28,1.5,0.75],[0.95,0.30,2.0,0.85],
  [0.07,0.38,1.6,0.70],[0.91,0.42,1.8,0.75],[0.04,0.50,1.5,0.65],
  [0.96,0.52,1.6,0.65],[0.11,0.56,1.4,0.60],[0.89,0.57,1.5,0.60],
];
const WATER_STARS: [number, number, number, number][] = [
  [0.25,0.67,0.7,0.22],[0.55,0.70,0.6,0.18],[0.75,0.73,0.7,0.20],
  [0.40,0.76,0.6,0.16],[0.65,0.80,0.5,0.14],[0.20,0.84,0.5,0.16],
  [0.80,0.87,0.6,0.14],[0.50,0.91,0.5,0.12],[0.35,0.95,0.4,0.12],
];

// ─── Galaxy Background ────────────────────────────────────────────────────
function GalaxyBg() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={["#020205", "#030309", "#040408", "#020204"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      {/* Milky Way outer haze */}
      <View style={styles.mwHaze}>
        <LinearGradient
          colors={[
            "transparent",
            "rgba(140,140,165,0.04)",
            "rgba(175,175,200,0.10)",
            "rgba(190,190,215,0.13)",
            "rgba(175,175,200,0.10)",
            "rgba(140,140,165,0.04)",
            "transparent",
          ]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </View>
      {/* Milky Way bright core */}
      <View style={styles.mwCore}>
        <LinearGradient
          colors={[
            "transparent",
            "rgba(200,200,225,0.05)",
            "rgba(225,225,248,0.12)",
            "rgba(200,200,225,0.05)",
            "transparent",
          ]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </View>
      {/* Nebula tint */}
      <View style={styles.nebula} />
      {/* Dense star field */}
      {MW_STARS.map(([x, y, size, opacity], i) => (
        <View key={`mw${i}`} style={[styles.star, { left: x * W - size / 2, top: y * H - size / 2, width: size, height: size, borderRadius: size / 2, opacity }]} />
      ))}
      {OUTER_STARS.map(([x, y, size, opacity], i) => (
        <View key={`out${i}`} style={[styles.star, { left: x * W - size / 2, top: y * H - size / 2, width: size, height: size, borderRadius: size / 2, opacity }]} />
      ))}
      {/* Horizon mist */}
      <LinearGradient
        colors={["transparent","rgba(155,155,180,0.05)","rgba(135,135,160,0.03)","transparent"]}
        style={styles.horizonMist}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      {/* Water reflection gradient */}
      <LinearGradient
        colors={["transparent","rgba(8,6,16,0.60)","rgba(4,3,10,0.80)","#020108"]}
        style={styles.waterGrad}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      {/* Reflection stars */}
      {WATER_STARS.map(([x, y, size, opacity], i) => (
        <View key={`wat${i}`} style={[styles.star, { left: x * W - size / 2, top: y * H - size / 2, width: size, height: size, borderRadius: size / 2, opacity }]} />
      ))}
      {/* Bottom vignette */}
      <LinearGradient
        colors={["transparent","rgba(1,0,4,0.65)","#010105"]}
        style={styles.bottomVignette}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
    </View>
  );
}

// ─── Orbiting Star ────────────────────────────────────────────────────────
interface OrbitProps {
  angle: Animated.SharedValue<number>;
  visible: Animated.SharedValue<number>;
}
function OrbitingStar({ angle, visible }: OrbitProps) {
  const sx  = useDerivedValue(() => CX + ORBIT_R * Math.cos(angle.value * DEG2RAD));
  const sy  = useDerivedValue(() => CY + ORBIT_R * Math.sin(angle.value * DEG2RAD));
  const g1x = useDerivedValue(() => CX + ORBIT_R * Math.cos((angle.value - 30)  * DEG2RAD));
  const g1y = useDerivedValue(() => CY + ORBIT_R * Math.sin((angle.value - 30)  * DEG2RAD));
  const g2x = useDerivedValue(() => CX + ORBIT_R * Math.cos((angle.value - 60)  * DEG2RAD));
  const g2y = useDerivedValue(() => CY + ORBIT_R * Math.sin((angle.value - 60)  * DEG2RAD));
  const g3x = useDerivedValue(() => CX + ORBIT_R * Math.cos((angle.value - 90)  * DEG2RAD));
  const g3y = useDerivedValue(() => CY + ORBIT_R * Math.sin((angle.value - 90)  * DEG2RAD));
  const g4x = useDerivedValue(() => CX + ORBIT_R * Math.cos((angle.value - 115) * DEG2RAD));
  const g4y = useDerivedValue(() => CY + ORBIT_R * Math.sin((angle.value - 115) * DEG2RAD));

  const mainStyle = useAnimatedStyle(() => ({ position: "absolute", left: sx.value - 6, top: sy.value - 6, opacity: visible.value }));
  const g1Style   = useAnimatedStyle(() => ({ position: "absolute", left: g1x.value - 4.5, top: g1y.value - 4.5, opacity: visible.value * 0.60 }));
  const g2Style   = useAnimatedStyle(() => ({ position: "absolute", left: g2x.value - 3,   top: g2y.value - 3,   opacity: visible.value * 0.35 }));
  const g3Style   = useAnimatedStyle(() => ({ position: "absolute", left: g3x.value - 2,   top: g3y.value - 2,   opacity: visible.value * 0.18 }));
  const g4Style   = useAnimatedStyle(() => ({ position: "absolute", left: g4x.value - 1.5, top: g4y.value - 1.5, opacity: visible.value * 0.08 }));

  return (
    <>
      <Animated.View style={g4Style}><View style={styles.ghost4} /></Animated.View>
      <Animated.View style={g3Style}><View style={styles.ghost3} /></Animated.View>
      <Animated.View style={g2Style}><View style={styles.ghost2} /></Animated.View>
      <Animated.View style={g1Style}><View style={styles.ghost1} /></Animated.View>
      <Animated.View style={mainStyle}>
        <View style={styles.starHalo} />
        <View style={styles.starCore} />
      </Animated.View>
    </>
  );
}

// ─── Main Splash Screen ───────────────────────────────────────────────────
export default function AnimatedSplashScreen({ onFinish }: { onFinish: () => void }) {
  const screenOpacity = useSharedValue(1);
  const orbitAngle    = useSharedValue(-90);
  const orbitVisible  = useSharedValue(0);
  const logoScale     = useSharedValue(0);
  const logoOpacity   = useSharedValue(0);
  const glowScale     = useSharedValue(1.0);
  const glowOpacity   = useSharedValue(0);
  const tagOpacity    = useSharedValue(0);
  const tagY          = useSharedValue(16);

  useEffect(() => {
    // Phase 1: Star appears
    orbitVisible.value = withDelay(STAR_APPEAR_DELAY, withTiming(1, { duration: 250, easing: EASE_OUT }));

    // Phase 2: Orbit 1.5 turns clockwise
    orbitAngle.value = withDelay(STAR_APPEAR_DELAY, withTiming(-90 + 540, { duration: ORBIT_MS, easing: EASE_INOUT }));

    // Phase 3: Star fades out
    orbitVisible.value = withDelay(STAR_APPEAR_DELAY + ORBIT_MS + 200, withTiming(0, { duration: 350, easing: EASE_IN }));

    // Phase 4: Logo springs in
    logoOpacity.value = withDelay(LOGO_IN_DELAY, withTiming(1, { duration: 450, easing: EASE_OUT }));
    logoScale.value   = withDelay(LOGO_IN_DELAY, withSpring(1, { damping: 10, stiffness: 78, mass: 0.85 }));

    // Phase 5: Glow pulse
    glowOpacity.value = withDelay(GLOW_START_DELAY, withRepeat(
      withSequence(
        withTiming(0.75, { duration: 950, easing: EASE_INOUT }),
        withTiming(0.08, { duration: 950, easing: EASE_INOUT })
      ), 3, false
    ));
    glowScale.value = withDelay(GLOW_START_DELAY, withRepeat(
      withSequence(
        withTiming(1.22, { duration: 950, easing: EASE_INOUT }),
        withTiming(0.94, { duration: 950, easing: EASE_INOUT })
      ), 3, false
    ));

    // Phase 6: Tagline slides up
    tagOpacity.value = withDelay(TAG_DELAY, withTiming(1, { duration: 700, easing: EASE_OUT }));
    tagY.value       = withDelay(TAG_DELAY, withTiming(0, { duration: 700, easing: EASE_OUT }));

    // Phase 7: Fade out → finish
    screenOpacity.value = withDelay(FADE_OUT_DELAY, withTiming(0, { duration: FADE_OUT_MS, easing: EASE_IN }, (done) => {
      if (done) runOnJS(onFinish)();
    }));
  }, []);

  const screenStyle = useAnimatedStyle(() => ({ opacity: screenOpacity.value }));
  const logoStyle   = useAnimatedStyle(() => ({ opacity: logoOpacity.value, transform: [{ scale: logoScale.value }] }));
  const glowStyle   = useAnimatedStyle(() => ({ opacity: glowOpacity.value, transform: [{ scale: glowScale.value }] }));
  const tagStyle    = useAnimatedStyle(() => ({ opacity: tagOpacity.value, transform: [{ translateY: tagY.value }] }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { zIndex: 9999 }, screenStyle]}>
      <GalaxyBg />

      {/* Orbiting star */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <OrbitingStar angle={orbitAngle} visible={orbitVisible} />
      </View>

      {/* Orbit ring guide */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: CX - ORBIT_R,
          top: CY - ORBIT_R,
          width: ORBIT_R * 2,
          height: ORBIT_R * 2,
          borderRadius: ORBIT_R,
          borderWidth: 0.5,
          borderColor: "rgba(255,255,255,0.07)",
        }}
      />

      {/* Glow behind logo */}
      <View pointerEvents="none" style={[styles.glowContainer, { left: CX - 90, top: CY - 50 }]}>
        <Animated.View style={[styles.glowBlob, glowStyle]} />
      </View>

      {/* Logo + tagline */}
      <View style={[StyleSheet.absoluteFill, styles.logoCenter]} pointerEvents="none">
        <Animated.View style={[styles.logoWrapper, logoStyle]}>
          <View style={styles.logoRow}>
            {LOGO_LETTERS.map((letter, i) => (
              <Text key={i} style={[styles.logoLetter, { color: LOGO_COLORS[i] }]}>
                {letter}
              </Text>
            ))}
          </View>
        </Animated.View>
        <Animated.Text style={[styles.tagline, tagStyle]}>
          Search anything, find everything
        </Animated.Text>
      </View>
    </Animated.View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Background layers
  mwHaze: {
    position: "absolute",
    width: W * 2.2,
    height: H * 0.55,
    top: -H * 0.12,
    left: -W * 0.6,
    transform: [{ rotate: "-32deg" }],
  },
  mwCore: {
    position: "absolute",
    width: W * 1.8,
    height: H * 0.26,
    top: H * 0.03,
    left: -W * 0.4,
    transform: [{ rotate: "-32deg" }],
  },
  nebula: {
    position: "absolute",
    width: W * 0.65,
    height: H * 0.28,
    top: 0,
    right: -W * 0.06,
    borderRadius: W * 0.4,
    opacity: 0.07,
    backgroundColor: "#C8C8E8",
  },
  star: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
  },
  horizonMist: {
    position: "absolute",
    left: 0, right: 0,
    top: H * 0.52,
    height: H * 0.12,
  },
  waterGrad: {
    position: "absolute",
    left: 0, right: 0,
    top: H * 0.55,
    bottom: 0,
  },
  bottomVignette: {
    position: "absolute",
    left: 0, right: 0,
    bottom: 0,
    height: H * 0.16,
  },

  // Orbit star pieces
  starHalo: {
    position: "absolute",
    width: 22, height: 22,
    borderRadius: 11,
    top: -5, left: -5,
    backgroundColor: "rgba(255,255,255,0.20)",
  },
  starCore: {
    width: 12, height: 12,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  },
  ghost1: { width: 9,   height: 9,   borderRadius: 4.5, backgroundColor: "#FFFFFF", shadowColor: "#FFFFFF", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.9, shadowRadius: 5 },
  ghost2: { width: 6,   height: 6,   borderRadius: 3,   backgroundColor: "#FFFFFF", shadowColor: "#FFFFFF", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 3 },
  ghost3: { width: 4,   height: 4,   borderRadius: 2,   backgroundColor: "#E0E0FF" },
  ghost4: { width: 3,   height: 3,   borderRadius: 1.5, backgroundColor: "#C0C0E8" },

  // Glow
  glowContainer: {
    position: "absolute",
    width: 180, height: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  glowBlob: {
    width: 180, height: 100,
    borderRadius: 90,
    backgroundColor: "rgba(180,180,255,0.18)",
  },

  // Logo
  logoCenter: { alignItems: "center", justifyContent: "center" },
  logoWrapper: { alignItems: "center" },
  logoRow:     { flexDirection: "row", alignItems: "center" },
  logoLetter: {
    fontFamily: "Caveat_700Bold",
    fontSize: 62,
    lineHeight: 70,
    letterSpacing: 3,
  },
  tagline: {
    fontFamily: "Inter_400Regular",
    fontSize: 13.5,
    color: "rgba(200,200,220,0.70)",
    letterSpacing: 0.4,
    marginTop: 6,
    textAlign: "center",
  },
});
