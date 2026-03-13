import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  Animated as RNAnimated,
  Dimensions,
  Image,
  View,
} from "react-native";
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
import Svg, {
  Path,
  Circle,
  Defs,
  Stop,
  G,
  Rect,
  Ellipse,
  LinearGradient as SvgLinearGradient,
  RadialGradient as SvgRadialGradient,
  Polygon,
} from "react-native-svg";

const { width: W, height: H } = Dimensions.get("window");

const LOGO_SIZE = 140;
const LOGO_CX = W * 0.5;
const LOGO_CY = H * 0.43;

const P0 = { x: W * 0.92, y: -H * 0.02 };
const P1 = { x: W * 0.66, y: H * 0.18 };
const P2 = { x: LOGO_CX, y: LOGO_CY };

const VW = 360;
const VH_RATIO = H / W;
const VH = Math.round(VW * VH_RATIO);
const PILLAR = 38;
const SILL = 64;
const ARCH_PEAK = 30;
const ARCH_SPRING = Math.round(VH * 0.26);
const GLASS_LEFT = PILLAR + 2;
const GLASS_RIGHT = VW - PILLAR - 2;
const GLASS_BOTTOM = VH - SILL - 2;

const GLASS_PATH = `M ${GLASS_LEFT} ${ARCH_SPRING} Q ${GLASS_LEFT} ${ARCH_PEAK} ${VW / 2} ${ARCH_PEAK - 10} Q ${GLASS_RIGHT} ${ARCH_PEAK} ${GLASS_RIGHT} ${ARCH_SPRING} L ${GLASS_RIGHT} ${GLASS_BOTTOM} L ${GLASS_LEFT} ${GLASS_BOTTOM} Z`;

const OUTER_ARCH = `M ${PILLAR} ${ARCH_SPRING} Q ${PILLAR} ${ARCH_PEAK - 8} ${VW / 2} ${ARCH_PEAK - 18} Q ${VW - PILLAR} ${ARCH_PEAK - 8} ${VW - PILLAR} ${ARCH_SPRING}`;
const INNER_ARCH_1 = `M ${PILLAR + 8} ${ARCH_SPRING} Q ${PILLAR + 8} ${ARCH_PEAK} ${VW / 2} ${ARCH_PEAK - 8} Q ${VW - PILLAR - 8} ${ARCH_PEAK} ${VW - PILLAR - 8} ${ARCH_SPRING}`;
const INNER_ARCH_2 = `M ${PILLAR + 15} ${ARCH_SPRING} Q ${PILLAR + 15} ${ARCH_PEAK + 7} ${VW / 2} ${ARCH_PEAK} Q ${VW - PILLAR - 15} ${ARCH_PEAK + 7} ${VW - PILLAR - 15} ${ARCH_SPRING}`;
const GLASS_ARCH_EDGE = `M ${GLASS_LEFT} ${ARCH_SPRING} Q ${GLASS_LEFT} ${ARCH_PEAK + 2} ${VW / 2} ${ARCH_PEAK - 8} Q ${GLASS_RIGHT} ${ARCH_PEAK + 2} ${GLASS_RIGHT} ${ARCH_SPRING}`;

const TOP_MASK = `M 0 0 L ${VW} 0 L ${VW} ${ARCH_SPRING + 2} Q ${VW - PILLAR} ${ARCH_PEAK - 8} ${VW / 2} ${ARCH_PEAK - 18} Q ${PILLAR} ${ARCH_PEAK - 8} 0 ${ARCH_SPRING + 2} Z`;

const STARS_BG = [
  { x: 0.11, y: 0.04, r: 1.4, d: 0 }, { x: 0.25, y: 0.02, r: 0.9, d: 220 },
  { x: 0.40, y: 0.07, r: 1.7, d: 480 }, { x: 0.57, y: 0.03, r: 1.1, d: 90 },
  { x: 0.72, y: 0.06, r: 1.5, d: 350 }, { x: 0.88, y: 0.04, r: 0.9, d: 620 },
  { x: 0.16, y: 0.13, r: 1.2, d: 260 }, { x: 0.33, y: 0.11, r: 1.9, d: 410 },
  { x: 0.50, y: 0.15, r: 1.0, d: 730 }, { x: 0.66, y: 0.10, r: 1.6, d: 170 },
  { x: 0.81, y: 0.14, r: 1.2, d: 520 }, { x: 0.94, y: 0.09, r: 1.4, d: 60 },
  { x: 0.07, y: 0.24, r: 1.1, d: 590 }, { x: 0.24, y: 0.22, r: 1.6, d: 330 },
  { x: 0.42, y: 0.27, r: 1.0, d: 445 }, { x: 0.61, y: 0.20, r: 1.8, d: 210 },
  { x: 0.76, y: 0.26, r: 1.3, d: 700 }, { x: 0.90, y: 0.21, r: 1.0, d: 380 },
  { x: 0.18, y: 0.34, r: 1.4, d: 50 }, { x: 0.36, y: 0.30, r: 1.2, d: 570 },
  { x: 0.53, y: 0.36, r: 1.6, d: 125 }, { x: 0.69, y: 0.33, r: 1.0, d: 430 },
  { x: 0.84, y: 0.32, r: 1.5, d: 290 }, { x: 0.12, y: 0.68, r: 1.1, d: 470 },
  { x: 0.30, y: 0.73, r: 1.4, d: 235 }, { x: 0.48, y: 0.70, r: 1.0, d: 665 },
  { x: 0.65, y: 0.75, r: 1.6, d: 155 }, { x: 0.82, y: 0.71, r: 1.2, d: 545 },
  { x: 0.20, y: 0.81, r: 1.4, d: 315 }, { x: 0.56, y: 0.85, r: 1.1, d: 470 },
  { x: 0.79, y: 0.83, r: 1.5, d: 195 },
];

export default function AnimatedSplashScreen({ onFinish }: { onFinish: () => void }) {
  const screenOpacity = useSharedValue(1);

  const camScale = useSharedValue(1.0);

  const bgOpacity = useSharedValue(0);
  const starsOpacity = useSharedValue(0);
  const frameOpacity = useSharedValue(0);
  const moonOpacity = useSharedValue(0);

  const cometProgress = useSharedValue(0);
  const cometAlpha = useSharedValue(0);

  const burstScale = useSharedValue(0);
  const burstAlpha = useSharedValue(0);
  const shockwaveScale = useSharedValue(0.2);
  const shockwaveAlpha = useSharedValue(0);

  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);

  const glowScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  const outerRingScale = useSharedValue(0.8);
  const outerRingOpacity = useSharedValue(0);

  const textOpacity = useSharedValue(0);
  const textY = useSharedValue(28);
  const tagOpacity = useSharedValue(0);
  const tagY = useSharedValue(18);

  const starOpacities = useRef(STARS_BG.map(() => new RNAnimated.Value(Math.random() * 0.35 + 0.15))).current;

  const cometX = useDerivedValue(() => {
    const t = cometProgress.value;
    return (1 - t) * (1 - t) * P0.x + 2 * (1 - t) * t * P1.x + t * t * P2.x;
  });
  const cometY_val = useDerivedValue(() => {
    const t = cometProgress.value;
    return (1 - t) * (1 - t) * P0.y + 2 * (1 - t) * t * P1.y + t * t * P2.y;
  });
  const cometAngle = useDerivedValue(() => {
    const t = Math.min(cometProgress.value, 0.999);
    const dx = 2 * (1 - t) * (P1.x - P0.x) + 2 * t * (P2.x - P1.x);
    const dy = 2 * (1 - t) * (P1.y - P0.y) + 2 * t * (P2.y - P1.y);
    return (Math.atan2(dy, dx) * 180) / Math.PI;
  });
  const cometSize = useDerivedValue(() => {
    const t = cometProgress.value;
    return 1 + t * 0.65;
  });

  const camStyle = useAnimatedStyle(() => ({
    transform: [{ scale: camScale.value }],
  }));
  const bgStyle = useAnimatedStyle(() => ({ opacity: bgOpacity.value }));
  const starsContainerStyle = useAnimatedStyle(() => ({ opacity: starsOpacity.value }));
  const frameStyle = useAnimatedStyle(() => ({ opacity: frameOpacity.value }));
  const moonContainerStyle = useAnimatedStyle(() => ({ opacity: moonOpacity.value }));
  const cometStyle = useAnimatedStyle(() => ({
    opacity: cometAlpha.value,
    transform: [
      { translateX: cometX.value - LOGO_CX },
      { translateY: cometY_val.value - LOGO_CY },
      { rotate: `${cometAngle.value}deg` },
      { scale: cometSize.value },
    ],
  }));
  const burstStyle = useAnimatedStyle(() => ({
    opacity: burstAlpha.value,
    transform: [{ scale: burstScale.value }],
  }));
  const shockwaveStyle = useAnimatedStyle(() => ({
    opacity: shockwaveAlpha.value,
    transform: [{ scale: shockwaveScale.value }],
  }));
  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }));
  const outerRingStyle = useAnimatedStyle(() => ({
    opacity: outerRingOpacity.value,
    transform: [{ scale: outerRingScale.value }],
  }));
  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textY.value }],
  }));
  const tagStyle = useAnimatedStyle(() => ({
    opacity: tagOpacity.value,
    transform: [{ translateY: tagY.value }],
  }));
  const screenStyle = useAnimatedStyle(() => ({ opacity: screenOpacity.value }));

  useEffect(() => {
    starOpacities.forEach((anim, i) => {
      const dur = 1000 + Math.random() * 1800;
      const delay = STARS_BG[i].d + 600;
      RNAnimated.loop(
        RNAnimated.sequence([
          RNAnimated.delay(delay),
          RNAnimated.timing(anim, { toValue: 0.9 + Math.random() * 0.1, duration: dur, useNativeDriver: true }),
          RNAnimated.timing(anim, { toValue: 0.04, duration: dur * 1.5, useNativeDriver: true }),
          RNAnimated.timing(anim, { toValue: 0.65, duration: dur * 0.8, useNativeDriver: true }),
        ])
      ).start();
    });

    const EO = Easing.out(Easing.cubic);
    const EOQ = Easing.out(Easing.quad);
    const EI = Easing.in(Easing.cubic);
    const EIO = Easing.inOut(Easing.sine);

    bgOpacity.value = withTiming(1, { duration: 900, easing: EOQ });
    starsOpacity.value = withDelay(300, withTiming(1, { duration: 1100, easing: EOQ }));
    frameOpacity.value = withDelay(200, withTiming(1, { duration: 1000, easing: EO }));
    moonOpacity.value = withDelay(600, withTiming(1, { duration: 1200, easing: EO }));

    camScale.value = withTiming(1.1, { duration: 5800, easing: Easing.out(Easing.sine) });

    cometAlpha.value = withDelay(1600, withTiming(1, { duration: 200, easing: EOQ }));
    cometProgress.value = withDelay(1600, withTiming(1, { duration: 1150, easing: Easing.in(Easing.cubic) }));

    const IMPACT = 2780;

    cometAlpha.value = withDelay(IMPACT - 50, withTiming(0, { duration: 160 }));

    burstAlpha.value = withDelay(IMPACT, withSequence(
      withTiming(1, { duration: 80 }),
      withTiming(0, { duration: 580, easing: EI })
    ));
    burstScale.value = withDelay(IMPACT, withTiming(1, { duration: 660, easing: EO }));

    shockwaveAlpha.value = withDelay(IMPACT + 40, withSequence(
      withTiming(0.85, { duration: 100 }),
      withTiming(0, { duration: 500, easing: EI })
    ));
    shockwaveScale.value = withDelay(IMPACT + 40, withTiming(1, { duration: 600, easing: EO }));

    logoOpacity.value = withDelay(IMPACT + 100, withTiming(1, { duration: 500, easing: EO }));
    logoScale.value = withDelay(IMPACT + 100, withSpring(1, { damping: 9, stiffness: 85, mass: 0.8 }));

    const GLOW_START = IMPACT + 550;
    glowOpacity.value = withDelay(GLOW_START, withRepeat(
      withSequence(
        withTiming(0.88, { duration: 900, easing: EIO }),
        withTiming(0.15, { duration: 900, easing: EIO })
      ), 4, false
    ));
    glowScale.value = withDelay(GLOW_START, withRepeat(
      withSequence(
        withTiming(1.18, { duration: 900, easing: EIO }),
        withTiming(0.92, { duration: 900, easing: EIO })
      ), 4, false
    ));

    outerRingOpacity.value = withDelay(GLOW_START, withRepeat(
      withSequence(
        withTiming(0.5, { duration: 1300, easing: EIO }),
        withTiming(0.05, { duration: 1300, easing: EIO })
      ), 3, false
    ));
    outerRingScale.value = withDelay(GLOW_START, withRepeat(
      withSequence(
        withTiming(1.35, { duration: 1300, easing: EIO }),
        withTiming(0.98, { duration: 1300, easing: EIO })
      ), 3, false
    ));

    textOpacity.value = withDelay(IMPACT + 700, withTiming(1, { duration: 750, easing: EO }));
    textY.value = withDelay(IMPACT + 700, withTiming(0, { duration: 750, easing: EO }));

    tagOpacity.value = withDelay(IMPACT + 1100, withTiming(1, { duration: 650, easing: EO }));
    tagY.value = withDelay(IMPACT + 1100, withTiming(0, { duration: 650, easing: EO }));

    screenOpacity.value = withDelay(5500, withTiming(0, { duration: 800, easing: EI }, (done) => {
      if (done) runOnJS(onFinish)();
    }));
  }, []);

  const moonSVGX = VW * 0.24;
  const moonSVGY = VH * 0.16;

  return (
    <Animated.View style={[StyleSheet.absoluteFillObject, { zIndex: 9999 }, screenStyle]}>

      <Animated.View style={[StyleSheet.absoluteFillObject, camStyle]}>
        <Animated.View style={[StyleSheet.absoluteFillObject, bgStyle]}>
          <LinearGradient
            colors={["#000104", "#010510", "#020919", "#030B1F", "#020916", "#010407", "#000103"]}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0.4, y: 0 }}
            end={{ x: 0.55, y: 1 }}
          />
        </Animated.View>

        <Animated.View style={[StyleSheet.absoluteFillObject, starsContainerStyle]}>
          {STARS_BG.map((star, i) => (
            <RNAnimated.View
              key={i}
              style={{
                position: "absolute",
                left: star.x * W - star.r,
                top: star.y * H - star.r,
                width: star.r * 2,
                height: star.r * 2,
                borderRadius: star.r,
                backgroundColor: "#FFFFFF",
                opacity: starOpacities[i],
                shadowColor: "#FFFFFF",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 1,
                shadowRadius: star.r * 2.5,
              }}
            />
          ))}
        </Animated.View>

        <Animated.View style={[StyleSheet.absoluteFillObject, frameStyle]}>
          <Svg width={W} height={H} viewBox={`0 0 ${VW} ${VH}`}>
            <Defs>
              <SvgLinearGradient id="sky" x1="0.5" y1="0" x2="0.5" y2="1">
                <Stop offset="0" stopColor="#000A1A" />
                <Stop offset="0.35" stopColor="#010D22" />
                <Stop offset="0.65" stopColor="#020F26" />
                <Stop offset="1" stopColor="#010A1C" />
              </SvgLinearGradient>

              <SvgLinearGradient id="pL" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor="#040302" />
                <Stop offset="0.2" stopColor="#0E0C09" />
                <Stop offset="0.48" stopColor="#1C1916" />
                <Stop offset="0.7" stopColor="#161310" />
                <Stop offset="1" stopColor="#090807" />
              </SvgLinearGradient>
              <SvgLinearGradient id="pR" x1="1" y1="0" x2="0" y2="0">
                <Stop offset="0" stopColor="#040302" />
                <Stop offset="0.2" stopColor="#0E0C09" />
                <Stop offset="0.48" stopColor="#1C1916" />
                <Stop offset="0.7" stopColor="#161310" />
                <Stop offset="1" stopColor="#090807" />
              </SvgLinearGradient>
              <SvgLinearGradient id="topMask" x1="0.5" y1="1" x2="0.5" y2="0">
                <Stop offset="0" stopColor="#0D0B08" />
                <Stop offset="0.5" stopColor="#0A0907" />
                <Stop offset="1" stopColor="#070604" />
              </SvgLinearGradient>
              <SvgLinearGradient id="sill" x1="0.5" y1="0" x2="0.5" y2="1">
                <Stop offset="0" stopColor="#1E1B17" />
                <Stop offset="0.15" stopColor="#141210" />
                <Stop offset="0.55" stopColor="#0C0A08" />
                <Stop offset="1" stopColor="#050403" />
              </SvgLinearGradient>
              <SvgLinearGradient id="sillFace" x1="0.5" y1="0" x2="0.5" y2="1">
                <Stop offset="0" stopColor="#161310" />
                <Stop offset="1" stopColor="#060504" />
              </SvgLinearGradient>

              <SvgLinearGradient id="goldH" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor="#2A2010" stopOpacity="0" />
                <Stop offset="0.12" stopColor="#6A5430" stopOpacity="0.75" />
                <Stop offset="0.32" stopColor="#9A7A45" stopOpacity="0.92" />
                <Stop offset="0.5" stopColor="#C0A060" stopOpacity="1" />
                <Stop offset="0.68" stopColor="#9A7A45" stopOpacity="0.92" />
                <Stop offset="0.88" stopColor="#6A5430" stopOpacity="0.75" />
                <Stop offset="1" stopColor="#2A2010" stopOpacity="0" />
              </SvgLinearGradient>
              <SvgLinearGradient id="goldV" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#C0A060" stopOpacity="0.9" />
                <Stop offset="0.4" stopColor="#8A6A38" stopOpacity="0.6" />
                <Stop offset="1" stopColor="#4A3820" stopOpacity="0.2" />
              </SvgLinearGradient>
              <SvgLinearGradient id="archGold" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor="#3A2C14" stopOpacity="0" />
                <Stop offset="0.25" stopColor="#8A6A35" stopOpacity="0.8" />
                <Stop offset="0.5" stopColor="#B89050" stopOpacity="1" />
                <Stop offset="0.75" stopColor="#8A6A35" stopOpacity="0.8" />
                <Stop offset="1" stopColor="#3A2C14" stopOpacity="0" />
              </SvgLinearGradient>

              <SvgLinearGradient id="innerEdgeL" x1="1" y1="0" x2="0" y2="0">
                <Stop offset="0" stopColor="#5A4828" stopOpacity="0.4" />
                <Stop offset="0.4" stopColor="#3A3020" stopOpacity="0.2" />
                <Stop offset="1" stopColor="#1A1610" stopOpacity="0" />
              </SvgLinearGradient>
              <SvgLinearGradient id="innerEdgeR" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor="#5A4828" stopOpacity="0.4" />
                <Stop offset="0.4" stopColor="#3A3020" stopOpacity="0.2" />
                <Stop offset="1" stopColor="#1A1610" stopOpacity="0" />
              </SvgLinearGradient>

              <SvgRadialGradient id="moonHalo" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor="#FFF5D0" stopOpacity="0.5" />
                <Stop offset="0.35" stopColor="#EEDD90" stopOpacity="0.22" />
                <Stop offset="0.65" stopColor="#C8A840" stopOpacity="0.08" />
                <Stop offset="1" stopColor="#907020" stopOpacity="0" />
              </SvgRadialGradient>
              <SvgRadialGradient id="nebulaA" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor="#0E2650" stopOpacity="0.28" />
                <Stop offset="1" stopColor="#060E28" stopOpacity="0" />
              </SvgRadialGradient>
              <SvgRadialGradient id="nebulaB" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor="#20103C" stopOpacity="0.22" />
                <Stop offset="1" stopColor="#100820" stopOpacity="0" />
              </SvgRadialGradient>
              <SvgRadialGradient id="nebulaC" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor="#081830" stopOpacity="0.2" />
                <Stop offset="1" stopColor="#040C18" stopOpacity="0" />
              </SvgRadialGradient>
              <SvgRadialGradient id="ksGlow" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor="#E0C070" stopOpacity="0.75" />
                <Stop offset="0.4" stopColor="#A07830" stopOpacity="0.4" />
                <Stop offset="1" stopColor="#604820" stopOpacity="0" />
              </SvgRadialGradient>
              <SvgRadialGradient id="capGlow" cx="50%" cy="100%" r="80%">
                <Stop offset="0" stopColor="#907040" stopOpacity="0.5" />
                <Stop offset="1" stopColor="#504030" stopOpacity="0" />
              </SvgRadialGradient>
              <SvgLinearGradient id="ambientBottom" x1="0.5" y1="1" x2="0.5" y2="0">
                <Stop offset="0" stopColor="#1A3060" stopOpacity="0.12" />
                <Stop offset="1" stopColor="#0A1830" stopOpacity="0" />
              </SvgLinearGradient>
              <SvgLinearGradient id="glassSheen" x1="0" y1="0" x2="0.5" y2="1">
                <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.025" />
                <Stop offset="0.6" stopColor="#FFFFFF" stopOpacity="0.008" />
                <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
              </SvgLinearGradient>
            </Defs>

            <Path d={GLASS_PATH} fill="url(#sky)" />

            <Ellipse cx={VW * 0.28} cy={VH * 0.26} rx={78} ry={108} fill="url(#nebulaA)" />
            <Ellipse cx={VW * 0.71} cy={VH * 0.20} rx={68} ry={88} fill="url(#nebulaB)" />
            <Ellipse cx={VW * 0.50} cy={VH * 0.52} rx={105} ry={68} fill="url(#nebulaC)" />
            <Ellipse cx={VW * 0.38} cy={VH * 0.42} rx={55} ry={72} fill="url(#nebulaA)" />

            {([
              [VW * 0.30, VH * 0.07, 2.5, 0.95],
              [VW * 0.50, VH * 0.04, 1.5, 0.8],
              [VW * 0.68, VH * 0.08, 2.2, 0.88],
              [VW * 0.80, VH * 0.05, 1.4, 0.75],
              [VW * 0.17, VH * 0.13, 1.8, 0.82],
              [VW * 0.44, VH * 0.11, 2.8, 0.92],
              [VW * 0.60, VH * 0.14, 1.4, 0.72],
              [VW * 0.76, VH * 0.17, 2.3, 0.9],
              [VW * 0.22, VH * 0.21, 1.5, 0.78],
              [VW * 0.51, VH * 0.19, 1.9, 0.85],
              [VW * 0.73, VH * 0.25, 1.5, 0.7],
              [VW * 0.36, VH * 0.29, 2.1, 0.88],
              [VW * 0.63, VH * 0.31, 1.6, 0.76],
              [VW * 0.83, VH * 0.27, 1.4, 0.8],
              [VW * 0.28, VH * 0.38, 1.5, 0.72],
              [VW * 0.56, VH * 0.37, 2.3, 0.9],
              [VW * 0.79, VH * 0.37, 1.6, 0.78],
              [VW * 0.40, VH * 0.47, 1.8, 0.8],
              [VW * 0.66, VH * 0.51, 1.5, 0.7],
            ] as [number, number, number, number][]).map(([cx, cy, r, op], i) => (
              <G key={`gs${i}`}>
                {r > 1.9 && <Circle cx={cx} cy={cy} r={r * 3} fill="white" opacity={0.06} />}
                {r > 1.5 && <Circle cx={cx} cy={cy} r={r * 1.8} fill="white" opacity={0.12} />}
                <Circle cx={cx} cy={cy} r={r} fill="white" opacity={op} />
              </G>
            ))}

            <Path d={GLASS_PATH} fill="url(#ambientBottom)" />
            <Path d={GLASS_PATH} fill="url(#glassSheen)" />

            <Circle cx={VW * 0.225} cy={VH * 0.158} r={62} fill="url(#moonHalo)" />
            <Circle cx={VW * 0.225} cy={VH * 0.158} r={26} fill="#F7F3EC" />
            <Circle cx={VW * 0.225 + 9} cy={VH * 0.158 - 8} r={21.5} fill="#010D22" />
            <Circle cx={VW * 0.213} cy={VH * 0.168} r={4} fill="#F7F3EC" opacity={0.12} />

            <Rect x={0} y={0} width={PILLAR} height={VH} fill="url(#pL)" />
            <Rect x={VW - PILLAR} y={0} width={PILLAR} height={VH} fill="url(#pR)" />
            <Path d={TOP_MASK} fill="url(#topMask)" />
            <Rect x={0} y={VH - SILL} width={VW} height={SILL} fill="url(#sill)" />
            <Rect x={PILLAR} y={VH - SILL} width={VW - PILLAR * 2} height={6} fill="url(#sillFace)" />

            <Rect x={PILLAR - 7} y={ARCH_SPRING} width={7} height={VH - SILL - ARCH_SPRING} fill="url(#innerEdgeL)" />
            <Rect x={VW - PILLAR} y={ARCH_SPRING} width={7} height={VH - SILL - ARCH_SPRING} fill="url(#innerEdgeR)" />

            <Path d={OUTER_ARCH} fill="none" stroke="#1C1914" strokeWidth={24} strokeLinecap="round" />
            <Path d={OUTER_ARCH} fill="none" stroke="#0A0907" strokeWidth={24} strokeLinecap="round" strokeOpacity={0.6} />

            <Path d={INNER_ARCH_1} fill="none" stroke="#252018" strokeWidth={10} strokeLinecap="round" />
            <Path d={INNER_ARCH_1} fill="none" stroke="url(#archGold)" strokeWidth={2.5} strokeLinecap="round" />

            <Path d={INNER_ARCH_2} fill="none" stroke="#181510" strokeWidth={5} strokeLinecap="round" />
            <Path d={INNER_ARCH_2} fill="none" stroke="url(#archGold)" strokeWidth={1.5} strokeLinecap="round" strokeOpacity={0.55} />

            <Path d={GLASS_ARCH_EDGE} fill="none" stroke="url(#archGold)" strokeWidth={1.2} strokeLinecap="round" strokeOpacity={0.4} />

            <Path d={`M ${PILLAR} ${ARCH_SPRING} L ${PILLAR} ${VH - SILL}`} stroke="#1A1714" strokeWidth={6} />
            <Path d={`M ${PILLAR} ${ARCH_SPRING} L ${PILLAR} ${VH - SILL}`} stroke="url(#goldV)" strokeWidth={1.2} />
            <Path d={`M ${VW - PILLAR} ${ARCH_SPRING} L ${VW - PILLAR} ${VH - SILL}`} stroke="#1A1714" strokeWidth={6} />
            <Path d={`M ${VW - PILLAR} ${ARCH_SPRING} L ${VW - PILLAR} ${VH - SILL}`} stroke="url(#goldV)" strokeWidth={1.2} />

            <Circle cx={VW / 2} cy={ARCH_PEAK - 9} r={18} fill="url(#topMask)" />
            <Circle cx={VW / 2} cy={ARCH_PEAK - 9} r={12} fill="url(#ksGlow)" />
            <Circle cx={VW / 2} cy={ARCH_PEAK - 9} r={7} fill="#D4A858" opacity={0.8} />
            <Circle cx={VW / 2} cy={ARCH_PEAK - 9} r={3.5} fill="#F0D090" opacity={0.95} />
            <Circle cx={VW / 2} cy={ARCH_PEAK - 9} r={1.5} fill="white" opacity={0.9} />

            <Rect x={0} y={VH - SILL - 1} width={VW} height={3} fill="url(#goldH)" />
            <Rect x={0} y={VH - SILL + 2} width={VW} height={1.5} fill="url(#goldH)" opacity={0.4} />
            <Rect x={0} y={0} width={VW} height={2.5} fill="url(#goldH)" opacity={0.25} />

            <Rect x={PILLAR - 2} y={ARCH_SPRING - 5} width={4} height={12} rx={2} fill="#907040" opacity={0.6} />
            <Rect x={VW - PILLAR - 2} y={ARCH_SPRING - 5} width={4} height={12} rx={2} fill="#907040" opacity={0.6} />

            <Rect x={PILLAR - 4} y={VH - SILL - 12} width={8} height={14} rx={2} fill="#252018" />
            <Rect x={VW - PILLAR - 4} y={VH - SILL - 12} width={8} height={14} rx={2} fill="#252018" />
            <Circle cx={PILLAR} cy={VH - SILL - 5} r={4} fill="#2A2218" />
            <Circle cx={VW - PILLAR} cy={VH - SILL - 5} r={4} fill="#2A2218" />
            <Circle cx={PILLAR} cy={VH - SILL - 5} r={2} fill="#9A8040" opacity={0.5} />
            <Circle cx={VW - PILLAR} cy={VH - SILL - 5} r={2} fill="#9A8040" opacity={0.5} />

            <Rect x={PILLAR + 4} y={VH - SILL} width={VW - PILLAR * 2 - 8} height={4} fill="url(#capGlow)" />
          </Svg>
        </Animated.View>
      </Animated.View>

      <Animated.View
        style={[
          styles.comet,
          cometStyle,
          { left: LOGO_CX, top: LOGO_CY },
        ]}
        pointerEvents="none"
      >
        <Svg width={200} height={50} viewBox="-180 -25 200 50">
          <Defs>
            <SvgLinearGradient id="tailG" x1="-1" y1="0" x2="0.2" y2="0">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
              <Stop offset="0.4" stopColor="#AADDFF" stopOpacity="0.3" />
              <Stop offset="0.72" stopColor="#DDEEFF" stopOpacity="0.65" />
              <Stop offset="0.9" stopColor="#EEEEFF" stopOpacity="0.85" />
              <Stop offset="1" stopColor="#FFFFFF" stopOpacity="1" />
            </SvgLinearGradient>
            <SvgLinearGradient id="tailG2" x1="-1" y1="0" x2="0" y2="0">
              <Stop offset="0" stopColor="#AAAAFF" stopOpacity="0" />
              <Stop offset="0.6" stopColor="#8899FF" stopOpacity="0.25" />
              <Stop offset="1" stopColor="#AABBFF" stopOpacity="0.45" />
            </SvgLinearGradient>
            <SvgRadialGradient id="headG" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity="1" />
              <Stop offset="0.3" stopColor="#E8F4FF" stopOpacity="0.95" />
              <Stop offset="0.6" stopColor="#AACCFF" stopOpacity="0.65" />
              <Stop offset="1" stopColor="#5588FF" stopOpacity="0" />
            </SvgRadialGradient>
          </Defs>
          <Path d="M -175 0 L -8 -9 L 0 0 L -8 9 Z" fill="url(#tailG)" />
          <Path d="M -175 0 L -4 -18 L 0 0 L -4 18 Z" fill="url(#tailG2)" />
          <Circle cx={0} cy={0} r={22} fill="url(#headG)" />
          <Circle cx={0} cy={0} r={9} fill="white" opacity={0.95} />
          <Circle cx={0} cy={0} r={4.5} fill="#EEF6FF" />
        </Svg>
      </Animated.View>

      <Animated.View
        style={[styles.centered, burstStyle, { left: LOGO_CX - 170, top: LOGO_CY - 170 }]}
        pointerEvents="none"
      >
        <Svg width={340} height={340} viewBox="0 0 340 340">
          <Defs>
            <SvgRadialGradient id="burstG" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
              <Stop offset="0.18" stopColor="#DDEEFF" stopOpacity="0.78" />
              <Stop offset="0.4" stopColor="#88BBFF" stopOpacity="0.45" />
              <Stop offset="0.68" stopColor="#3366DD" stopOpacity="0.18" />
              <Stop offset="1" stopColor="#1133AA" stopOpacity="0" />
            </SvgRadialGradient>
          </Defs>
          <Circle cx={170} cy={170} r={170} fill="url(#burstG)" />
        </Svg>
      </Animated.View>

      <Animated.View
        style={[styles.centered, shockwaveStyle, { left: LOGO_CX - 200, top: LOGO_CY - 200 }]}
        pointerEvents="none"
      >
        <Svg width={400} height={400} viewBox="0 0 400 400">
          <Defs>
            <SvgRadialGradient id="swG" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
              <Stop offset="0.6" stopColor="#88AAFF" stopOpacity="0" />
              <Stop offset="0.78" stopColor="#6688FF" stopOpacity="0.6" />
              <Stop offset="0.88" stopColor="#4466EE" stopOpacity="0.35" />
              <Stop offset="1" stopColor="#2244CC" stopOpacity="0" />
            </SvgRadialGradient>
          </Defs>
          <Circle cx={200} cy={200} r={200} fill="url(#swG)" />
        </Svg>
      </Animated.View>

      <Animated.View
        style={[styles.centered, outerRingStyle, { left: LOGO_CX - 130, top: LOGO_CY - 130 }]}
        pointerEvents="none"
      >
        <Svg width={260} height={260} viewBox="0 0 260 260">
          <Defs>
            <SvgRadialGradient id="orG" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
              <Stop offset="0.62" stopColor="#99CCFF" stopOpacity="0" />
              <Stop offset="0.76" stopColor="#77AAFF" stopOpacity="0.5" />
              <Stop offset="0.86" stopColor="#5588EE" stopOpacity="0.3" />
              <Stop offset="1" stopColor="#3355CC" stopOpacity="0" />
            </SvgRadialGradient>
          </Defs>
          <Circle cx={130} cy={130} r={130} fill="url(#orG)" />
        </Svg>
      </Animated.View>

      <Animated.View
        style={[styles.centered, glowStyle, { left: LOGO_CX - 100, top: LOGO_CY - 100 }]}
        pointerEvents="none"
      >
        <Svg width={200} height={200} viewBox="0 0 200 200">
          <Defs>
            <SvgRadialGradient id="glG" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="#CCDDFF" stopOpacity="0.15" />
              <Stop offset="0.4" stopColor="#88AAFF" stopOpacity="0.55" />
              <Stop offset="0.68" stopColor="#5580EE" stopOpacity="0.32" />
              <Stop offset="1" stopColor="#2255CC" stopOpacity="0" />
            </SvgRadialGradient>
          </Defs>
          <Circle cx={100} cy={100} r={100} fill="url(#glG)" />
        </Svg>
      </Animated.View>

      <Animated.View
        style={[
          styles.logo,
          logoStyle,
          {
            left: LOGO_CX - LOGO_SIZE / 2,
            top: LOGO_CY - LOGO_SIZE / 2,
            width: LOGO_SIZE,
            height: LOGO_SIZE,
          },
        ]}
      >
        <Image
          source={require("../assets/images/icon.png")}
          style={{ width: LOGO_SIZE, height: LOGO_SIZE }}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.Text style={[styles.appName, textStyle, { top: LOGO_CY + LOGO_SIZE / 2 + 22 }]}>
        StreekX
      </Animated.Text>

      <Animated.Text style={[styles.tagline, tagStyle, { top: LOGO_CY + LOGO_SIZE / 2 + 70 }]}>
        Search the universe
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  centered: { position: "absolute" },
  comet: { position: "absolute" },
  logo: { position: "absolute" },
  appName: {
    position: "absolute",
    width: "100%",
    textAlign: "center",
    color: "#EEF2FF",
    fontSize: 40,
    fontWeight: "700",
    letterSpacing: 7,
    fontFamily: "Inter_700Bold",
    textShadowColor: "#5577EE",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 26,
  },
  tagline: {
    position: "absolute",
    width: "100%",
    textAlign: "center",
    color: "#6A88BB",
    fontSize: 13,
    letterSpacing: 4.5,
    fontFamily: "Inter_400Regular",
  },
});
