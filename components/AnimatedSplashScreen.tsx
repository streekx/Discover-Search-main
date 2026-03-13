import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
  Text,
} from "react-native";
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
} from "react-native-svg";

const { width: W, height: H } = Dimensions.get("window");

const LOGO_SIZE = 130;
const WINDOW_W = W * 0.86;
const WINDOW_H = H * 0.66;
const WINDOW_TOP = H * 0.09;

const LOGO_CENTER_X = W * 0.5 - LOGO_SIZE / 2;
const LOGO_CENTER_Y = WINDOW_TOP + WINDOW_H * 0.415 - LOGO_SIZE / 2;

const STAR_DATA = [
  { x: 0.07, y: 0.04, s: 2.5, d: 0 },
  { x: 0.22, y: 0.02, s: 1.5, d: 300 },
  { x: 0.41, y: 0.07, s: 3, d: 600 },
  { x: 0.62, y: 0.03, s: 2, d: 150 },
  { x: 0.79, y: 0.06, s: 1.8, d: 450 },
  { x: 0.91, y: 0.14, s: 2.2, d: 750 },
  { x: 0.05, y: 0.18, s: 1.5, d: 200 },
  { x: 0.33, y: 0.15, s: 2.8, d: 550 },
  { x: 0.55, y: 0.21, s: 1.5, d: 100 },
  { x: 0.74, y: 0.12, s: 2, d: 400 },
  { x: 0.16, y: 0.28, s: 1.8, d: 700 },
  { x: 0.87, y: 0.24, s: 2.5, d: 250 },
  { x: 0.03, y: 0.38, s: 1.5, d: 500 },
  { x: 0.48, y: 0.33, s: 2, d: 850 },
  { x: 0.68, y: 0.40, s: 1.5, d: 350 },
  { x: 0.93, y: 0.36, s: 2.2, d: 50 },
  { x: 0.20, y: 0.72, s: 1.8, d: 650 },
  { x: 0.82, y: 0.76, s: 2.5, d: 180 },
  { x: 0.11, y: 0.80, s: 1.5, d: 430 },
  { x: 0.60, y: 0.84, s: 1.8, d: 720 },
  { x: 0.37, y: 0.88, s: 2, d: 290 },
  { x: 0.75, y: 0.91, s: 1.5, d: 560 },
  { x: 0.50, y: 0.93, s: 1.8, d: 80 },
  { x: 0.26, y: 0.96, s: 2, d: 620 },
  { x: 0.89, y: 0.88, s: 1.5, d: 380 },
];

const PARTICLE_DATA = [
  { angle: 0, dist: 70 },
  { angle: 45, dist: 60 },
  { angle: 90, dist: 80 },
  { angle: 135, dist: 55 },
  { angle: 180, dist: 75 },
  { angle: 225, dist: 65 },
  { angle: 270, dist: 70 },
  { angle: 315, dist: 60 },
];

export default function AnimatedSplashScreen({
  onFinish,
}: {
  onFinish: () => void;
}) {
  const bgOpacity = useRef(new Animated.Value(0)).current;
  const windowScale = useRef(new Animated.Value(0.12)).current;
  const windowOpacity = useRef(new Animated.Value(0)).current;
  const cometTX = useRef(new Animated.Value(W * 0.58)).current;
  const cometTY = useRef(new Animated.Value(-H * 0.38)).current;
  const cometOpacity = useRef(new Animated.Value(0)).current;
  const cometScale = useRef(new Animated.Value(1)).current;
  const burstScale = useRef(new Animated.Value(0)).current;
  const burstOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoGlowPulse = useRef(new Animated.Value(0.4)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const screenFade = useRef(new Animated.Value(1)).current;

  const starOpacities = useRef(
    STAR_DATA.map(() => new Animated.Value(Math.random() * 0.5 + 0.2))
  ).current;

  const particleAnims = useRef(
    PARTICLE_DATA.map(() => ({
      dist: new Animated.Value(0),
      opacity: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    starOpacities.forEach((anim, i) => {
      const dur = 700 + Math.random() * 1400;
      const delay = STAR_DATA[i].d;
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: dur,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.08,
            duration: dur * 1.3,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.75,
            duration: dur * 0.8,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });

    Animated.sequence([
      Animated.timing(bgOpacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),

      Animated.parallel([
        Animated.timing(windowOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(windowScale, {
          toValue: 1,
          friction: 7,
          tension: 35,
          useNativeDriver: true,
        }),
      ]),

      Animated.delay(350),

      Animated.parallel([
        Animated.timing(cometOpacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(cometTX, {
          toValue: 0,
          duration: 950,
          useNativeDriver: true,
        }),
        Animated.timing(cometTY, {
          toValue: 0,
          duration: 950,
          useNativeDriver: true,
        }),
      ]),

      Animated.parallel([
        Animated.timing(cometOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(cometScale, {
          toValue: 2.5,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(burstOpacity, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.parallel([
            Animated.timing(burstScale, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(burstOpacity, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.sequence([
          Animated.delay(80),
          Animated.parallel([
            Animated.spring(logoScale, {
              toValue: 1,
              friction: 5,
              tension: 55,
              useNativeDriver: true,
            }),
            Animated.timing(logoOpacity, {
              toValue: 1,
              duration: 380,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]),

      Animated.parallel([
        Animated.loop(
          Animated.sequence([
            Animated.timing(logoGlowPulse, {
              toValue: 1,
              duration: 900,
              useNativeDriver: true,
            }),
            Animated.timing(logoGlowPulse, {
              toValue: 0.35,
              duration: 900,
              useNativeDriver: true,
            }),
          ]),
          { iterations: 3 }
        ),
        Animated.sequence([
          Animated.delay(150),
          Animated.timing(textOpacity, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(450),
          Animated.timing(subtitleOpacity, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ]),
      ]),

      Animated.delay(800),

      Animated.timing(screenFade, {
        toValue: 0,
        duration: 750,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onFinish();
    });

    particleAnims.forEach((p) => {
      Animated.sequence([
        Animated.delay(2600),
        Animated.parallel([
          Animated.timing(p.opacity, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(p.dist, {
            toValue: 1,
            duration: 450,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(p.opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, []);

  const SVG_W = 340;
  const SVG_H = 540;

  return (
    <Animated.View style={[styles.root, { opacity: screenFade }]}>
      <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: bgOpacity }]}>
        <LinearGradient
          colors={["#010509", "#030C1A", "#020912", "#010408", "#000102"]}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0.3, y: 0 }}
          end={{ x: 0.6, y: 1 }}
        />
      </Animated.View>

      {STAR_DATA.map((star, i) => (
        <Animated.View
          key={i}
          style={[
            styles.star,
            {
              left: star.x * W,
              top: star.y * H,
              width: star.s,
              height: star.s,
              borderRadius: star.s / 2,
              opacity: starOpacities[i],
              shadowRadius: star.s * 1.5,
            },
          ]}
        />
      ))}

      <Animated.View
        style={[
          styles.windowWrap,
          {
            opacity: windowOpacity,
            transform: [{ scale: windowScale }],
            width: WINDOW_W,
            height: WINDOW_H,
            top: WINDOW_TOP,
          },
        ]}
      >
        <Svg
          width={WINDOW_W}
          height={WINDOW_H}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        >
          <Defs>
            <SvgLinearGradient id="goldH" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="#5A3A00" />
              <Stop offset="0.18" stopColor="#C8880A" />
              <Stop offset="0.38" stopColor="#F0C030" />
              <Stop offset="0.5" stopColor="#FFE066" />
              <Stop offset="0.62" stopColor="#F0C030" />
              <Stop offset="0.82" stopColor="#C8880A" />
              <Stop offset="1" stopColor="#5A3A00" />
            </SvgLinearGradient>
            <SvgLinearGradient id="goldV" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#FFE066" />
              <Stop offset="0.4" stopColor="#D4A020" />
              <Stop offset="1" stopColor="#7A5000" />
            </SvgLinearGradient>
            <SvgLinearGradient id="glassBg" x1="0.2" y1="0" x2="0.8" y2="1">
              <Stop offset="0" stopColor="#040F22" stopOpacity="0.97" />
              <Stop offset="0.5" stopColor="#061428" stopOpacity="0.98" />
              <Stop offset="1" stopColor="#020A14" stopOpacity="0.99" />
            </SvgLinearGradient>
            <SvgLinearGradient id="sillGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#C8880A" />
              <Stop offset="0.5" stopColor="#7A5000" />
              <Stop offset="1" stopColor="#3A2000" />
            </SvgLinearGradient>
            <SvgRadialGradient id="moonHalo" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="#FFFDE0" stopOpacity="0.5" />
              <Stop offset="0.5" stopColor="#FFF8A0" stopOpacity="0.2" />
              <Stop offset="1" stopColor="#FFE060" stopOpacity="0" />
            </SvgRadialGradient>
            <SvgRadialGradient id="nebulaL" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="#1A3A6A" stopOpacity="0.35" />
              <Stop offset="1" stopColor="#0A1A3A" stopOpacity="0" />
            </SvgRadialGradient>
            <SvgRadialGradient id="nebulaR" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="#2A1A5A" stopOpacity="0.3" />
              <Stop offset="1" stopColor="#100820" stopOpacity="0" />
            </SvgRadialGradient>
            <SvgLinearGradient id="glassSheen" x1="0" y1="0" x2="0.6" y2="1">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.04" />
              <Stop offset="0.4" stopColor="#FFFFFF" stopOpacity="0.01" />
              <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
            </SvgLinearGradient>
          </Defs>

          <Path
            d="M 28 200 Q 28 18 170 12 Q 312 18 312 200 L 312 518 L 28 518 Z"
            fill="url(#glassBg)"
          />

          <Ellipse cx="90" cy="280" rx="65" ry="90" fill="url(#nebulaL)" />
          <Ellipse cx="250" cy="200" rx="55" ry="75" fill="url(#nebulaR)" />

          <Circle cx="68" cy="95" r="32" fill="url(#moonHalo)" />
          <Circle cx="68" cy="95" r="19" fill="#FFFCE8" />
          <Circle cx="76" cy="88" r="15.5" fill="#061428" />

          {[
            [218, 50, 2.2],
            [258, 72, 1.5],
            [244, 118, 2.7],
            [283, 62, 1.5],
            [196, 88, 1.5],
            [272, 138, 2],
            [210, 162, 1.5],
            [294, 105, 1],
            [232, 198, 1.5],
            [182, 132, 1],
            [88, 155, 1.5],
            [118, 182, 2],
            [58, 200, 1.5],
            [100, 238, 1],
            [128, 128, 1.5],
            [155, 58, 2],
            [175, 190, 1.5],
            [295, 175, 1.8],
            [50, 260, 1.2],
            [140, 225, 1.5],
            [265, 220, 1],
            [80, 310, 1],
            [145, 340, 1.5],
            [230, 300, 1.2],
            [295, 340, 1],
            [60, 380, 1.2],
            [185, 370, 1.5],
            [260, 380, 1],
          ].map(([cx, cy, r], i) => (
            <Circle key={i} cx={cx} cy={cy} r={r} fill="white" opacity={0.55 + Math.random() * 0.4} />
          ))}

          {[
            [110, 65, 3.5],
            [155, 42, 2.5],
            [190, 72, 3],
            [132, 108, 2],
            [288, 88, 2],
          ].map(([cx, cy, r], i) => (
            <G key={`bright-${i}`}>
              <Circle cx={cx} cy={cy} r={r * 2.5} fill="white" opacity={0.08} />
              <Circle cx={cx} cy={cy} r={r} fill="white" opacity={0.92} />
            </G>
          ))}

          <Path
            d="M 28 200 Q 28 18 170 12 Q 312 18 312 200 L 312 518 L 28 518 Z"
            fill="url(#glassSheen)"
          />

          <Path
            d="M 10 208 Q 10 5 170 0 Q 330 5 330 208 L 330 530 L 10 530 Z"
            fill="none"
            stroke="url(#goldH)"
            strokeWidth="22"
          />

          <Path
            d="M 20 210 Q 20 12 170 7 Q 320 12 320 210"
            fill="none"
            stroke="url(#goldV)"
            strokeWidth="6"
          />
          <Path
            d="M 32 215 Q 32 22 170 17 Q 308 22 308 215"
            fill="none"
            stroke="#FFE066"
            strokeWidth="2"
            strokeOpacity="0.35"
          />

          <Path
            d="M 10 208 L 10 530 L 330 530 L 330 208"
            fill="none"
            stroke="url(#goldH)"
            strokeWidth="22"
          />

          <Rect x="159" y="200" width="22" height="328" fill="url(#goldV)" rx="3" />
          <Rect x="10" y="328" width="320" height="20" fill="url(#goldH)" />

          <Path
            d="M 155 3 Q 170 -10 185 3 L 188 28 L 152 28 Z"
            fill="url(#goldV)"
          />
          <Circle cx="170" cy="0" r="10" fill="#FFE066" />
          <Circle cx="170" cy="0" r="5" fill="url(#goldV)" />

          <Circle cx="72" cy="338" r="13" fill="url(#goldV)" />
          <Circle cx="72" cy="338" r="8" fill="#C8880A" />
          <Circle cx="72" cy="338" r="4" fill="#FFE066" />
          <Circle cx="268" cy="338" r="13" fill="url(#goldV)" />
          <Circle cx="268" cy="338" r="8" fill="#C8880A" />
          <Circle cx="268" cy="338" r="4" fill="#FFE066" />

          <Circle cx="32" cy="215" r="7" fill="url(#goldV)" />
          <Circle cx="308" cy="215" r="7" fill="url(#goldV)" />

          <Path d="M 52 255 Q 60 242 68 255" fill="none" stroke="#FFE066" strokeWidth="2" strokeOpacity="0.4" />
          <Path d="M 272 255 Q 280 242 288 255" fill="none" stroke="#FFE066" strokeWidth="2" strokeOpacity="0.4" />

          <Rect x="0" y="522" width="340" height="18" rx="5" fill="url(#goldH)" />
          <Rect x="-5" y="537" width="350" height="8" rx="3" fill="#7A5000" />

          <Rect x="155" y="322" width="30" height="14" rx="4" fill="#C8880A" />
          <Rect x="162" y="318" width="16" height="22" rx="3" fill="#D4A020" />
        </Svg>
      </Animated.View>

      {PARTICLE_DATA.map((p, i) => {
        const rad = (p.angle * Math.PI) / 180;
        const tx = particleAnims[i].dist.interpolate({
          inputRange: [0, 1],
          outputRange: [0, Math.cos(rad) * p.dist],
        });
        const ty = particleAnims[i].dist.interpolate({
          inputRange: [0, 1],
          outputRange: [0, Math.sin(rad) * p.dist],
        });
        return (
          <Animated.View
            key={`part-${i}`}
            style={[
              styles.particle,
              {
                left: W * 0.5,
                top: LOGO_CENTER_Y + LOGO_SIZE / 2,
                opacity: particleAnims[i].opacity,
                transform: [{ translateX: tx }, { translateY: ty }],
              },
            ]}
          />
        );
      })}

      <Animated.View
        style={[
          styles.cometWrap,
          {
            left: W * 0.5 - 30,
            top: LOGO_CENTER_Y + LOGO_SIZE / 2 - 30,
            opacity: cometOpacity,
            transform: [
              { translateX: cometTX },
              { translateY: cometTY },
              { scale: cometScale },
            ],
          },
        ]}
      >
        <Svg width={60} height={60} viewBox="0 0 60 60">
          <Defs>
            <SvgRadialGradient id="cometCore" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity="1" />
              <Stop offset="0.3" stopColor="#CCE8FF" stopOpacity="0.9" />
              <Stop offset="0.65" stopColor="#6699FF" stopOpacity="0.5" />
              <Stop offset="1" stopColor="#2244CC" stopOpacity="0" />
            </SvgRadialGradient>
          </Defs>
          <Circle cx="30" cy="30" r="30" fill="url(#cometCore)" />
          <Circle cx="30" cy="30" r="9" fill="white" />
          <Circle cx="30" cy="30" r="5" fill="#E8F4FF" />
        </Svg>
      </Animated.View>

      <Animated.View
        style={[
          styles.burstWrap,
          {
            left: W * 0.5 - 110,
            top: LOGO_CENTER_Y + LOGO_SIZE / 2 - 110,
            opacity: burstOpacity,
            transform: [{ scale: burstScale }],
          },
        ]}
      >
        <Svg width={220} height={220} viewBox="0 0 220 220">
          <Defs>
            <SvgRadialGradient id="burstGrad" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
              <Stop offset="0.3" stopColor="#AACCFF" stopOpacity="0.6" />
              <Stop offset="0.65" stopColor="#4466FF" stopOpacity="0.25" />
              <Stop offset="1" stopColor="#2233AA" stopOpacity="0" />
            </SvgRadialGradient>
          </Defs>
          <Circle cx="110" cy="110" r="110" fill="url(#burstGrad)" />
        </Svg>
      </Animated.View>

      <Animated.View
        style={[
          styles.logoGlowRing,
          {
            left: LOGO_CENTER_X - 28,
            top: LOGO_CENTER_Y - 28,
            opacity: logoGlowPulse,
          },
        ]}
      >
        <Svg width={LOGO_SIZE + 56} height={LOGO_SIZE + 56} viewBox="0 0 186 186">
          <Defs>
            <SvgRadialGradient id="glowRing" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="#AADDFF" stopOpacity="0" />
              <Stop offset="0.55" stopColor="#88CCFF" stopOpacity="0.55" />
              <Stop offset="0.78" stopColor="#4499FF" stopOpacity="0.3" />
              <Stop offset="1" stopColor="#2266CC" stopOpacity="0" />
            </SvgRadialGradient>
          </Defs>
          <Circle cx="93" cy="93" r="93" fill="url(#glowRing)" />
        </Svg>
      </Animated.View>

      <Animated.View
        style={[
          styles.logoContainer,
          {
            left: LOGO_CENTER_X,
            top: LOGO_CENTER_Y,
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        <Image
          source={require("../assets/images/icon.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.Text style={[styles.appName, { opacity: textOpacity, top: LOGO_CENTER_Y + LOGO_SIZE + 18 }]}>
        StreekX
      </Animated.Text>

      <Animated.Text style={[styles.tagline, { opacity: subtitleOpacity, top: LOGO_CENTER_Y + LOGO_SIZE + 60 }]}>
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
  windowWrap: {
    position: "absolute",
    alignSelf: "center",
  },
  star: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    elevation: 2,
  },
  cometWrap: {
    position: "absolute",
  },
  burstWrap: {
    position: "absolute",
  },
  logoGlowRing: {
    position: "absolute",
  },
  logoContainer: {
    position: "absolute",
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  particle: {
    position: "absolute",
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#AADDFF",
    shadowColor: "#88BBFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  appName: {
    position: "absolute",
    alignSelf: "center",
    width: "100%",
    textAlign: "center",
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "700",
    letterSpacing: 5,
    fontFamily: "Inter_700Bold",
    textShadowColor: "#88CCFF",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  tagline: {
    position: "absolute",
    alignSelf: "center",
    width: "100%",
    textAlign: "center",
    color: "#8BBCEE",
    fontSize: 14,
    fontWeight: "400",
    letterSpacing: 3.5,
    fontFamily: "Inter_400Regular",
  },
});
