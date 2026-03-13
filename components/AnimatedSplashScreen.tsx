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
  LinearGradient as SvgLinearGradient,
  RadialGradient as SvgRadialGradient,
  Ellipse,
  Line,
} from "react-native-svg";

const { width: W, height: H } = Dimensions.get("window");

const LOGO_SIZE = 138;
const LOGO_CX = W * 0.5;
const LOGO_CY = H * 0.44;

const STARS = [
  { x: 0.09, y: 0.06, r: 1.3, d: 0 },
  { x: 0.22, y: 0.03, r: 0.9, d: 200 },
  { x: 0.38, y: 0.08, r: 1.6, d: 500 },
  { x: 0.55, y: 0.04, r: 1.1, d: 100 },
  { x: 0.70, y: 0.07, r: 1.4, d: 350 },
  { x: 0.86, y: 0.05, r: 0.9, d: 650 },
  { x: 0.14, y: 0.15, r: 1.2, d: 280 },
  { x: 0.31, y: 0.13, r: 1.8, d: 420 },
  { x: 0.48, y: 0.17, r: 1.0, d: 750 },
  { x: 0.64, y: 0.12, r: 1.5, d: 180 },
  { x: 0.79, y: 0.16, r: 1.2, d: 530 },
  { x: 0.93, y: 0.10, r: 1.4, d: 70 },
  { x: 0.07, y: 0.26, r: 1.1, d: 600 },
  { x: 0.25, y: 0.24, r: 1.6, d: 340 },
  { x: 0.44, y: 0.29, r: 1.0, d: 460 },
  { x: 0.60, y: 0.22, r: 1.8, d: 220 },
  { x: 0.75, y: 0.28, r: 1.3, d: 710 },
  { x: 0.91, y: 0.23, r: 1.0, d: 390 },
  { x: 0.17, y: 0.36, r: 1.4, d: 55 },
  { x: 0.35, y: 0.32, r: 1.2, d: 580 },
  { x: 0.52, y: 0.38, r: 1.6, d: 130 },
  { x: 0.68, y: 0.35, r: 1.0, d: 440 },
  { x: 0.83, y: 0.34, r: 1.5, d: 310 },
  { x: 0.10, y: 0.70, r: 1.1, d: 490 },
  { x: 0.28, y: 0.75, r: 1.4, d: 240 },
  { x: 0.46, y: 0.72, r: 1.0, d: 680 },
  { x: 0.63, y: 0.77, r: 1.6, d: 160 },
  { x: 0.80, y: 0.73, r: 1.2, d: 560 },
  { x: 0.19, y: 0.83, r: 1.4, d: 320 },
  { x: 0.54, y: 0.87, r: 1.1, d: 480 },
  { x: 0.78, y: 0.85, r: 1.5, d: 200 },
];

export default function AnimatedSplashScreen({
  onFinish,
}: {
  onFinish: () => void;
}) {
  const bgOpacity = useSharedValue(0);
  const frameOpacity = useSharedValue(0);
  const moonOpacity = useSharedValue(0);
  const cometTX = useSharedValue(W * 0.52);
  const cometTY = useSharedValue(-H * 0.42);
  const cometOpacity = useSharedValue(0);
  const trailOpacity = useSharedValue(0);
  const burstScale = useSharedValue(0.1);
  const burstOpacity = useSharedValue(0);
  const ringScale = useSharedValue(0.3);
  const ringOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const glowPulse = useSharedValue(0.3);
  const textOpacity = useSharedValue(0);
  const textTransY = useSharedValue(22);
  const subOpacity = useSharedValue(0);
  const subTransY = useSharedValue(14);
  const screenOpacity = useSharedValue(1);

  const starOpacities = useRef(
    STARS.map(() => new RNAnimated.Value(Math.random() * 0.4 + 0.2))
  ).current;

  useEffect(() => {
    starOpacities.forEach((anim, i) => {
      const dur = 900 + Math.random() * 1600;
      const delay = STARS[i].d + 500;
      RNAnimated.loop(
        RNAnimated.sequence([
          RNAnimated.delay(delay),
          RNAnimated.timing(anim, { toValue: 1, duration: dur, useNativeDriver: true }),
          RNAnimated.timing(anim, { toValue: 0.06, duration: dur * 1.4, useNativeDriver: true }),
          RNAnimated.timing(anim, { toValue: 0.7, duration: dur * 0.7, useNativeDriver: true }),
        ])
      ).start();
    });

    const T = Easing.out(Easing.cubic);
    const TI = Easing.in(Easing.ease);

    bgOpacity.value = withTiming(1, { duration: 850, easing: T });
    frameOpacity.value = withDelay(300, withTiming(1, { duration: 900, easing: T }));
    moonOpacity.value = withDelay(700, withTiming(1, { duration: 1100, easing: T }));

    cometOpacity.value = withDelay(1500, withTiming(1, { duration: 220, easing: T }));
    trailOpacity.value = withDelay(1550, withTiming(1, { duration: 200, easing: T }));
    cometTX.value = withDelay(1500, withTiming(0, { duration: 1050, easing: Easing.out(Easing.quad) }));
    cometTY.value = withDelay(1500, withTiming(0, { duration: 1050, easing: Easing.out(Easing.quad) }));

    cometOpacity.value = withDelay(2500, withTiming(0, { duration: 180, easing: TI }));
    trailOpacity.value = withDelay(2500, withTiming(0, { duration: 180, easing: TI }));

    burstOpacity.value = withDelay(
      2600,
      withSequence(
        withTiming(1, { duration: 120 }),
        withTiming(0, { duration: 550, easing: TI })
      )
    );
    burstScale.value = withDelay(2600, withTiming(1, { duration: 670, easing: T }));

    ringOpacity.value = withDelay(
      2640,
      withSequence(
        withTiming(0.9, { duration: 150 }),
        withTiming(0, { duration: 500, easing: TI })
      )
    );
    ringScale.value = withDelay(2640, withTiming(1, { duration: 650, easing: T }));

    logoOpacity.value = withDelay(2650, withTiming(1, { duration: 500, easing: T }));
    logoScale.value = withDelay(2650, withSpring(1, { damping: 11, stiffness: 90, mass: 0.9 }));

    glowPulse.value = withDelay(
      3150,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 850, easing: Easing.inOut(Easing.sine) }),
          withTiming(0.22, { duration: 850, easing: Easing.inOut(Easing.sine) })
        ),
        3,
        false
      )
    );

    textOpacity.value = withDelay(3100, withTiming(1, { duration: 700, easing: T }));
    textTransY.value = withDelay(3100, withTiming(0, { duration: 700, easing: T }));

    subOpacity.value = withDelay(3500, withTiming(1, { duration: 650, easing: T }));
    subTransY.value = withDelay(3500, withTiming(0, { duration: 650, easing: T }));

    screenOpacity.value = withDelay(
      5200,
      withTiming(0, { duration: 800, easing: TI }, (done) => {
        if (done) runOnJS(onFinish)();
      })
    );
  }, []);

  const bgStyle = useAnimatedStyle(() => ({ opacity: bgOpacity.value }));
  const frameStyle = useAnimatedStyle(() => ({ opacity: frameOpacity.value }));
  const moonStyle = useAnimatedStyle(() => ({ opacity: moonOpacity.value }));
  const cometStyle = useAnimatedStyle(() => ({
    opacity: cometOpacity.value,
    transform: [{ translateX: cometTX.value }, { translateY: cometTY.value }],
  }));
  const trailStyle = useAnimatedStyle(() => ({
    opacity: trailOpacity.value,
    transform: [{ translateX: cometTX.value }, { translateY: cometTY.value }],
  }));
  const burstStyle = useAnimatedStyle(() => ({
    opacity: burstOpacity.value,
    transform: [{ scale: burstScale.value }],
  }));
  const ringStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value,
    transform: [{ scale: ringScale.value }],
  }));
  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glowPulse.value }));
  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTransY.value }],
  }));
  const subStyle = useAnimatedStyle(() => ({
    opacity: subOpacity.value,
    transform: [{ translateY: subTransY.value }],
  }));
  const screenStyle = useAnimatedStyle(() => ({ opacity: screenOpacity.value }));

  const VW = 360;
  const VH = Math.round((H / W) * 360);

  const PILLAR = 34;
  const SILL = 62;
  const ARCH_CY = 40;

  const glassPillar = PILLAR + 2;
  const glassSillY = VH - SILL - 2;

  const glassPath = `M ${glassPillar} ${ARCH_CY + 100} Q ${glassPillar} ${ARCH_CY} ${VW / 2} ${ARCH_CY - 18} Q ${VW - glassPillar} ${ARCH_CY} ${VW - glassPillar} ${ARCH_CY + 100} L ${VW - glassPillar} ${glassSillY} L ${glassPillar} ${glassSillY} Z`;

  const archMoldPath = `M ${PILLAR} ${ARCH_CY + 100} Q ${PILLAR} ${ARCH_CY} ${VW / 2} ${ARCH_CY - 18} Q ${VW - PILLAR} ${ARCH_CY} ${VW - PILLAR} ${ARCH_CY + 100}`;

  const topMask = `M 0 0 L ${VW} 0 L ${VW} ${ARCH_CY + 100} Q ${VW - PILLAR} ${ARCH_CY} ${VW / 2} ${ARCH_CY - 18} Q ${PILLAR} ${ARCH_CY} ${PILLAR} ${ARCH_CY + 100} L 0 ${ARCH_CY + 100} Z`;

  const moonCX = VW * 0.245;
  const moonCY = VH * 0.175;

  return (
    <Animated.View style={[styles.root, screenStyle]}>
      <Animated.View style={[StyleSheet.absoluteFillObject, bgStyle]}>
        <LinearGradient
          colors={["#000205", "#010612", "#02091A", "#010510", "#000204"]}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0.35, y: 0 }}
          end={{ x: 0.6, y: 1 }}
        />
      </Animated.View>

      {STARS.map((star, i) => (
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
            shadowOpacity: 0.9,
            shadowRadius: star.r * 2,
          }}
        />
      ))}

      <Animated.View style={[StyleSheet.absoluteFillObject, frameStyle]}>
        <Svg width={W} height={H} viewBox={`0 0 ${VW} ${VH}`}>
          <Defs>
            <SvgLinearGradient id="skyGrad" x1="0.5" y1="0" x2="0.5" y2="1">
              <Stop offset="0" stopColor="#010812" />
              <Stop offset="0.3" stopColor="#020A1C" />
              <Stop offset="0.65" stopColor="#030C20" />
              <Stop offset="1" stopColor="#010810" />
            </SvgLinearGradient>

            <SvgLinearGradient id="pillarL" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="#040302" />
              <Stop offset="0.25" stopColor="#100E0B" />
              <Stop offset="0.55" stopColor="#1C1915" />
              <Stop offset="0.78" stopColor="#151210" />
              <Stop offset="1" stopColor="#080706" />
            </SvgLinearGradient>
            <SvgLinearGradient id="pillarR" x1="1" y1="0" x2="0" y2="0">
              <Stop offset="0" stopColor="#040302" />
              <Stop offset="0.25" stopColor="#100E0B" />
              <Stop offset="0.55" stopColor="#1C1915" />
              <Stop offset="0.78" stopColor="#151210" />
              <Stop offset="1" stopColor="#080706" />
            </SvgLinearGradient>
            <SvgLinearGradient id="topMaskGrad" x1="0.5" y1="0" x2="0.5" y2="1">
              <Stop offset="0" stopColor="#080704" />
              <Stop offset="0.5" stopColor="#100E0A" />
              <Stop offset="1" stopColor="#0D0B09" />
            </SvgLinearGradient>
            <SvgLinearGradient id="sillGrad" x1="0.5" y1="0" x2="0.5" y2="1">
              <Stop offset="0" stopColor="#1A1714" />
              <Stop offset="0.3" stopColor="#0E0C0A" />
              <Stop offset="1" stopColor="#060504" />
            </SvgLinearGradient>
            <SvgLinearGradient id="goldTrimH" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="#3A2E1A" stopOpacity="0" />
              <Stop offset="0.15" stopColor="#6A5530" stopOpacity="0.7" />
              <Stop offset="0.5" stopColor="#907040" stopOpacity="0.9" />
              <Stop offset="0.85" stopColor="#6A5530" stopOpacity="0.7" />
              <Stop offset="1" stopColor="#3A2E1A" stopOpacity="0" />
            </SvgLinearGradient>
            <SvgLinearGradient id="innerGlowL" x1="1" y1="0" x2="0" y2="0">
              <Stop offset="0" stopColor="#4A3C22" stopOpacity="0.35" />
              <Stop offset="1" stopColor="#2A2010" stopOpacity="0" />
            </SvgLinearGradient>
            <SvgLinearGradient id="innerGlowR" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="#4A3C22" stopOpacity="0.35" />
              <Stop offset="1" stopColor="#2A2010" stopOpacity="0" />
            </SvgLinearGradient>
            <SvgRadialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="#F8EDD0" stopOpacity="0.45" />
              <Stop offset="0.45" stopColor="#EEDD90" stopOpacity="0.18" />
              <Stop offset="0.75" stopColor="#D0B860" stopOpacity="0.07" />
              <Stop offset="1" stopColor="#B09040" stopOpacity="0" />
            </SvgRadialGradient>
            <SvgRadialGradient id="nebulaA" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="#142850" stopOpacity="0.22" />
              <Stop offset="1" stopColor="#0A1830" stopOpacity="0" />
            </SvgRadialGradient>
            <SvgRadialGradient id="nebulaB" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="#281440" stopOpacity="0.18" />
              <Stop offset="1" stopColor="#14082A" stopOpacity="0" />
            </SvgRadialGradient>
            <SvgLinearGradient id="archInnerGlow" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#7A6035" stopOpacity="0.5" />
              <Stop offset="1" stopColor="#5A4525" stopOpacity="0.15" />
            </SvgLinearGradient>
            <SvgLinearGradient id="sillTopGlow" x1="0" y1="1" x2="0" y2="0">
              <Stop offset="0" stopColor="#7A6035" stopOpacity="0" />
              <Stop offset="1" stopColor="#907040" stopOpacity="0.45" />
            </SvgLinearGradient>
            <SvgRadialGradient id="keystoneGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="#C0A060" stopOpacity="0.6" />
              <Stop offset="1" stopColor="#806030" stopOpacity="0" />
            </SvgRadialGradient>
          </Defs>

          <Path d={glassPath} fill="url(#skyGrad)" />

          <Ellipse cx={VW * 0.3} cy={VH * 0.28} rx={80} ry={110} fill="url(#nebulaA)" />
          <Ellipse cx={VW * 0.72} cy={VH * 0.22} rx={70} ry={90} fill="url(#nebulaB)" />
          <Ellipse cx={VW * 0.55} cy={VH * 0.55} rx={100} ry={65} fill="url(#nebulaA)" />

          {[
            [VW * 0.32, VH * 0.08, 2.4],
            [VW * 0.51, VH * 0.05, 1.5],
            [VW * 0.68, VH * 0.09, 2.0],
            [VW * 0.79, VH * 0.06, 1.5],
            [VW * 0.18, VH * 0.14, 1.7],
            [VW * 0.43, VH * 0.12, 2.6],
            [VW * 0.60, VH * 0.15, 1.4],
            [VW * 0.75, VH * 0.18, 2.2],
            [VW * 0.22, VH * 0.22, 1.5],
            [VW * 0.50, VH * 0.20, 1.8],
            [VW * 0.72, VH * 0.26, 1.5],
            [VW * 0.35, VH * 0.30, 2.0],
            [VW * 0.62, VH * 0.32, 1.6],
            [VW * 0.82, VH * 0.28, 1.4],
            [VW * 0.28, VH * 0.37, 1.5],
            [VW * 0.55, VH * 0.38, 2.2],
            [VW * 0.78, VH * 0.38, 1.6],
            [VW * 0.12, VH * 0.50, 1.4],
            [VW * 0.40, VH * 0.48, 1.8],
            [VW * 0.65, VH * 0.52, 1.5],
            [VW * 0.88, VH * 0.47, 1.6],
          ].map(([cx, cy, r], i) => (
            <G key={`s${i}`}>
              {(r as number) > 1.8 && (
                <Circle cx={cx as number} cy={cy as number} r={(r as number) * 2.8} fill="white" opacity={0.07} />
              )}
              <Circle cx={cx as number} cy={cy as number} r={r as number} fill="white" opacity={0.75 + Math.random() * 0.22} />
            </G>
          ))}

          <Circle cx={moonCX} cy={moonCY} r={55} fill="url(#moonGlow)" />
          <Circle cx={moonCX} cy={moonCY} r={24} fill="#F6F1E8" />
          <Circle cx={moonCX + 8} cy={moonCY - 7} r={20} fill="#020A1C" />
          <Circle cx={moonCX - 1} cy={moonCY + 2} r={3.5} fill="#F6F1E8" opacity={0.18} />

          <Rect x={0} y={0} width={PILLAR} height={VH} fill="url(#pillarL)" />
          <Rect x={VW - PILLAR} y={0} width={PILLAR} height={VH} fill="url(#pillarR)" />
          <Rect x={0} y={VH - SILL} width={VW} height={SILL} fill="url(#sillGrad)" />
          <Path d={topMask} fill="url(#topMaskGrad)" />

          <Rect x={PILLAR} y={VH - SILL} width={VW - PILLAR * 2} height={8} fill="url(#sillTopGlow)" />

          <Rect x={PILLAR - 6} y={ARCH_CY + 90} width={6} height={VH - SILL - ARCH_CY - 90} fill="url(#innerGlowL)" />
          <Rect x={VW - PILLAR} y={ARCH_CY + 90} width={6} height={VH - SILL - ARCH_CY - 90} fill="url(#innerGlowR)" />

          <Path
            d={archMoldPath}
            fill="none"
            stroke="url(#goldTrimH)"
            strokeWidth={3.5}
            strokeLinecap="round"
          />
          <Path
            d={`M ${PILLAR + 5} ${ARCH_CY + 102} Q ${PILLAR + 5} ${ARCH_CY + 8} ${VW / 2} ${ARCH_CY - 8} Q ${VW - PILLAR - 5} ${ARCH_CY + 8} ${VW - PILLAR - 5} ${ARCH_CY + 102}`}
            fill="none"
            stroke="#7A6030"
            strokeWidth={1.5}
            strokeOpacity={0.3}
            strokeLinecap="round"
          />

          <Circle cx={VW / 2} cy={ARCH_CY - 14} r={14} fill="url(#topMaskGrad)" />
          <Circle cx={VW / 2} cy={ARCH_CY - 14} r={9} fill="url(#keystoneGlow)" />
          <Circle cx={VW / 2} cy={ARCH_CY - 14} r={5} fill="#C0A060" opacity={0.7} />
          <Circle cx={VW / 2} cy={ARCH_CY - 14} r={2.5} fill="#E8D090" opacity={0.85} />

          <Rect x={0} y={VH - SILL - 2} width={VW} height={3} fill="url(#goldTrimH)" opacity={0.9} />

          <Rect x={PILLAR - 2} y={ARCH_CY + 80} width={2} height={VH - SILL - ARCH_CY - 80} fill="#7A6030" opacity={0.5} />
          <Rect x={VW - PILLAR} y={ARCH_CY + 80} width={2} height={VH - SILL - ARCH_CY - 80} fill="#7A6030" opacity={0.5} />

          <Path d={`M ${PILLAR} ${VH - SILL - 2} L ${PILLAR} ${VH - SILL + 14}`} stroke="#5A4520" strokeWidth={1} strokeOpacity={0.6} />
          <Path d={`M ${VW - PILLAR} ${VH - SILL - 2} L ${VW - PILLAR} ${VH - SILL + 14}`} stroke="#5A4520" strokeWidth={1} strokeOpacity={0.6} />

          <Rect x={0} y={0} width={VW} height={4} fill="url(#goldTrimH)" opacity={0.3} />

          <Path
            d={`M 0 ${ARCH_CY + 100} Q 0 ${ARCH_CY - 4} ${PILLAR / 2} ${ARCH_CY - 10}`}
            fill="none"
            stroke="#5A4520"
            strokeWidth={1}
            strokeOpacity={0.4}
          />
          <Path
            d={`M ${VW} ${ARCH_CY + 100} Q ${VW} ${ARCH_CY - 4} ${VW - PILLAR / 2} ${ARCH_CY - 10}`}
            fill="none"
            stroke="#5A4520"
            strokeWidth={1}
            strokeOpacity={0.4}
          />
        </Svg>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFillObject, moonStyle]} pointerEvents="none" />

      <Animated.View
        style={[
          styles.trail,
          trailStyle,
          {
            left: LOGO_CX - 4,
            top: LOGO_CY - 4,
          },
        ]}
      >
        <Svg width={W * 0.6} height={H * 0.48} viewBox={`0 0 ${W * 0.6} ${H * 0.48}`}>
          <Defs>
            <SvgLinearGradient id="trailGrad" x1="1" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
              <Stop offset="0.25" stopColor="#C8EAFF" stopOpacity="0.7" />
              <Stop offset="0.6" stopColor="#6AA8FF" stopOpacity="0.35" />
              <Stop offset="1" stopColor="#2255CC" stopOpacity="0" />
            </SvgLinearGradient>
          </Defs>
          <Path
            d={`M 8 8 L ${W * 0.6} 0 L ${W * 0.6} ${H * 0.04} Z`}
            fill="url(#trailGrad)"
          />
          <Path
            d={`M 8 8 L ${W * 0.52} ${H * 0.48}`}
            stroke="url(#trailGrad)"
            strokeWidth={1.5}
            strokeOpacity={0.25}
          />
        </Svg>
      </Animated.View>

      <Animated.View
        style={[
          styles.comet,
          cometStyle,
          { left: LOGO_CX - 18, top: LOGO_CY - 18 },
        ]}
      >
        <Svg width={36} height={36} viewBox="0 0 36 36">
          <Defs>
            <SvgRadialGradient id="cometGrad" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity="1" />
              <Stop offset="0.28" stopColor="#D0EEFF" stopOpacity="0.9" />
              <Stop offset="0.58" stopColor="#80AAFF" stopOpacity="0.55" />
              <Stop offset="1" stopColor="#3366DD" stopOpacity="0" />
            </SvgRadialGradient>
          </Defs>
          <Circle cx={18} cy={18} r={18} fill="url(#cometGrad)" />
          <Circle cx={18} cy={18} r={7} fill="white" />
          <Circle cx={18} cy={18} r={3.5} fill="#EEF8FF" />
        </Svg>
      </Animated.View>

      <Animated.View
        style={[
          styles.burst,
          burstStyle,
          {
            left: LOGO_CX - 140,
            top: LOGO_CY - 140,
          },
        ]}
      >
        <Svg width={280} height={280} viewBox="0 0 280 280">
          <Defs>
            <SvgRadialGradient id="burstG" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.92" />
              <Stop offset="0.22" stopColor="#C8E8FF" stopOpacity="0.65" />
              <Stop offset="0.5" stopColor="#5588FF" stopOpacity="0.28" />
              <Stop offset="0.78" stopColor="#2244BB" stopOpacity="0.1" />
              <Stop offset="1" stopColor="#1133AA" stopOpacity="0" />
            </SvgRadialGradient>
          </Defs>
          <Circle cx={140} cy={140} r={140} fill="url(#burstG)" />
        </Svg>
      </Animated.View>

      <Animated.View
        style={[
          styles.ring,
          ringStyle,
          {
            left: LOGO_CX - 110,
            top: LOGO_CY - 110,
          },
        ]}
      >
        <Svg width={220} height={220} viewBox="0 0 220 220">
          <Defs>
            <SvgRadialGradient id="ringG" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
              <Stop offset="0.68" stopColor="#88BBFF" stopOpacity="0.45" />
              <Stop offset="0.82" stopColor="#4488FF" stopOpacity="0.65" />
              <Stop offset="0.92" stopColor="#2255CC" stopOpacity="0.3" />
              <Stop offset="1" stopColor="#1133AA" stopOpacity="0" />
            </SvgRadialGradient>
          </Defs>
          <Circle cx={110} cy={110} r={110} fill="url(#ringG)" />
        </Svg>
      </Animated.View>

      <Animated.View
        style={[
          styles.glow,
          glowStyle,
          {
            left: LOGO_CX - 90,
            top: LOGO_CY - 90,
          },
        ]}
      >
        <Svg width={180} height={180} viewBox="0 0 180 180">
          <Defs>
            <SvgRadialGradient id="glowG" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="#AADDFF" stopOpacity="0.1" />
              <Stop offset="0.45" stopColor="#66AAFF" stopOpacity="0.5" />
              <Stop offset="0.7" stopColor="#4488EE" stopOpacity="0.28" />
              <Stop offset="1" stopColor="#2244CC" stopOpacity="0" />
            </SvgRadialGradient>
          </Defs>
          <Circle cx={90} cy={90} r={90} fill="url(#glowG)" />
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

      <Animated.Text
        style={[
          styles.appName,
          textStyle,
          { top: LOGO_CY + LOGO_SIZE / 2 + 24 },
        ]}
      >
        StreekX
      </Animated.Text>

      <Animated.Text
        style={[
          styles.tagline,
          subStyle,
          { top: LOGO_CY + LOGO_SIZE / 2 + 70 },
        ]}
      >
        Search the universe
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  trail: {
    position: "absolute",
  },
  comet: {
    position: "absolute",
  },
  burst: {
    position: "absolute",
  },
  ring: {
    position: "absolute",
  },
  glow: {
    position: "absolute",
  },
  logo: {
    position: "absolute",
  },
  appName: {
    position: "absolute",
    width: "100%",
    textAlign: "center",
    color: "#EEEEFF",
    fontSize: 38,
    fontWeight: "700",
    letterSpacing: 6,
    fontFamily: "Inter_700Bold",
    textShadowColor: "#6699FF",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 22,
  },
  tagline: {
    position: "absolute",
    width: "100%",
    textAlign: "center",
    color: "#7A9ACC",
    fontSize: 13.5,
    fontWeight: "400",
    letterSpacing: 4,
    fontFamily: "Inter_400Regular",
  },
});
