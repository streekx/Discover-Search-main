import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  Animated,
  Modal,
  Dimensions,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useSearch } from "@/context/SearchContext";
import DynamicDiscoverTile from "@/components/DynamicDiscoverTile";

const { width: W, height: H } = Dimensions.get("window");
const C = Colors.dark;

const LOGO = require("@/assets/images/logo.png");

const TRENDING = [
  "AI News", "Budget 2025", "IPL Score", "Gold Price",
  "Tech Today", "Space News", "Climate", "Cricket",
  "Bollywood", "Stock Market",
];

const MW_STARS: [number, number, number, number][] = [
  [0.48, 0.01, 1.4, 0.95], [0.55, 0.02, 1.0, 0.85], [0.42, 0.03, 1.2, 0.9],
  [0.62, 0.03, 0.9, 0.75], [0.35, 0.04, 1.1, 0.8],  [0.70, 0.04, 1.3, 0.85],
  [0.27, 0.05, 0.8, 0.7],  [0.78, 0.05, 1.0, 0.8],  [0.20, 0.07, 1.2, 0.75],
  [0.83, 0.07, 0.9, 0.7],  [0.50, 0.06, 1.5, 0.9],  [0.57, 0.08, 1.1, 0.85],
  [0.44, 0.08, 0.8, 0.7],  [0.65, 0.09, 1.2, 0.8],  [0.38, 0.10, 1.0, 0.75],
  [0.73, 0.11, 0.9, 0.8],  [0.30, 0.12, 1.3, 0.85], [0.85, 0.10, 1.1, 0.7],
  [0.52, 0.13, 0.8, 0.75], [0.60, 0.12, 1.2, 0.8],
];

const OUTER_STARS: [number, number, number, number][] = [
  [0.05, 0.03, 1.8, 0.9], [0.93, 0.06, 1.6, 0.85], [0.10, 0.15, 2.0, 0.9],
  [0.97, 0.18, 1.7, 0.8], [0.02, 0.28, 1.5, 0.75], [0.95, 0.30, 2.0, 0.85],
  [0.07, 0.38, 1.6, 0.7], [0.91, 0.42, 1.8, 0.75],
];

const TWINKLE_INDICES = [0, 5, 11, 18];

function GalaxyBackground() {
  const twinkleAnims = useRef(
    TWINKLE_INDICES.map(() => new Animated.Value(1))
  ).current;

  useEffect(() => {
    const animations = twinkleAnims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 370),
          Animated.timing(anim, { toValue: 0.3, duration: 900 + i * 120, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 1, duration: 900 + i * 120, useNativeDriver: true }),
        ])
      )
    );
    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={["#020205", "#030309", "#020204"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      {MW_STARS.map(([x, y, size, opacity], i) => {
        const isTwinkle = TWINKLE_INDICES.includes(i);
        const twinkleIdx = TWINKLE_INDICES.indexOf(i);
        if (isTwinkle) {
          return (
            <Animated.View
              key={`mw-${i}`}
              style={{
                position: "absolute",
                left: x * W - size / 2, top: y * H - size / 2,
                width: size, height: size, borderRadius: size / 2,
                backgroundColor: "#FFFFFF",
                opacity: Animated.multiply(new Animated.Value(opacity), twinkleAnims[twinkleIdx]),
              }}
            />
          );
        }
        return (
          <View key={`mw-${i}`}
            style={{ position: "absolute", left: x * W - size / 2, top: y * H - size / 2,
              width: size, height: size, borderRadius: size / 2, backgroundColor: "#FFFFFF", opacity }}
          />
        );
      })}
      {OUTER_STARS.map(([x, y, size, opacity], i) => (
        <View key={`out-${i}`}
          style={{ position: "absolute", left: x * W - size / 2, top: y * H - size / 2,
            width: size, height: size, borderRadius: size / 2, backgroundColor: "#FFFFFF", opacity }}
        />
      ))}
      <LinearGradient
        colors={["transparent", "rgba(10,8,18,0.55)", "rgba(6,4,12,0.75)", "#030208"]}
        style={{ position: "absolute", left: 0, right: 0, top: H * 0.55, bottom: 0 }}
        start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
      />
      <LinearGradient
        colors={["transparent", "rgba(2,1,6,0.6)", "#020106"]}
        style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: H * 0.18 }}
        start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
      />
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { history, search, settings } = useSearch();
  const [menuVisible, setMenuVisible] = useState(false);
  const logoAnim = useRef(new Animated.Value(0)).current;

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  useEffect(() => {
    Animated.spring(logoAnim, {
      toValue: 1, useNativeDriver: true, tension: 70, friction: 10,
    }).start();
  }, []);

  const handleSearchBarTap = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/search-input");
  }, []);

  const handleTrending = useCallback((term: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    search(term, "all");
    router.push({ pathname: "/search", params: { q: term, filter: "all" } });
  }, [search]);

  const handleVoice = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({ pathname: "/search-input", params: { voiceMode: "1" } });
  }, []);

  const handleAi = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/ai-assistant");
  }, []);

  const handleAiMode = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/ai-mode");
  }, []);

  const handleCam = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/streekx-cam");
  }, []);

  const navItems = [
    { label: "History", icon: "time-outline", path: "/(tabs)/history" },
    { label: "Saved", icon: "bookmark-outline", path: "/(tabs)/saved" },
    { label: "Settings", icon: "settings-outline", path: "/(tabs)/settings" },
  ];

  return (
    <View style={[styles.container, { paddingTop: topPad, paddingBottom: botPad }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <GalaxyBackground />

      <View style={styles.topBar}>
        <DynamicDiscoverTile />
        <TouchableOpacity
          style={styles.menuBtn}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMenuVisible(true); }}
        >
          <Ionicons name="menu-outline" size={26} color={C.text} />
        </TouchableOpacity>
      </View>

      <Animated.View style={[styles.logoSection, {
        opacity: logoAnim,
        transform: [{ translateY: logoAnim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }],
      }]}>
        <Image source={LOGO} style={styles.logoImage} resizeMode="contain" />
        <Text style={styles.tagline}>
          {settings.incognitoMode ? "🕶 Incognito — not saving searches" : "Search anything, find everything"}
        </Text>
      </Animated.View>

      <TouchableOpacity style={styles.searchBar} onPress={handleSearchBarTap} activeOpacity={0.9}>
        <Ionicons name="search-outline" size={20} color={C.textSecondary} style={{ marginRight: 8 }} />
        <Text style={styles.searchPlaceholder}>Ask anything...</Text>
        <View style={styles.searchRight}>
          <TouchableOpacity style={styles.iconBtn} onPress={handleVoice} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="mic-outline" size={21} color={C.tint} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={handleAi} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <MaterialCommunityIcons name="robot-outline" size={20} color={C.tint} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      <View style={styles.aiShortcuts}>
        <TouchableOpacity style={styles.aiShortcut} onPress={handleAi} activeOpacity={0.8}>
          <View style={[styles.aiIconWrapper, { backgroundColor: "rgba(110,180,255,0.14)" }]}>
            <MaterialCommunityIcons name="creation" size={18} color="#6EB4FF" />
          </View>
          <Text style={styles.aiShortcutText}>AI Mode</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.aiShortcut} onPress={handleAiMode} activeOpacity={0.8}>
          <View style={[styles.aiIconWrapper, { backgroundColor: "rgba(167,139,250,0.14)" }]}>
            <Ionicons name="mic-outline" size={18} color="#A78BFA" />
          </View>
          <Text style={styles.aiShortcutText}>AI Assistant</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.aiShortcut} onPress={handleCam} activeOpacity={0.8}>
          <View style={[styles.aiIconWrapper, { backgroundColor: "rgba(52,211,153,0.14)" }]}>
            <Ionicons name="scan-outline" size={18} color="#34D399" />
          </View>
          <Text style={styles.aiShortcutText}>StreekX Cam</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.trendingSection}>
        <Text style={styles.trendingLabel}>Trending</Text>
        <View style={styles.trendingList}>
          {TRENDING.slice(0, 8).map((term, idx) => (
            <TouchableOpacity key={idx} style={styles.trendPill} onPress={() => handleTrending(term)} activeOpacity={0.8}>
              <Text style={styles.trendPillText}>{term}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Modal visible={menuVisible} transparent animationType="slide">
        <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setMenuVisible(false)}>
          <View style={[styles.menuSheet, { paddingBottom: botPad + 20 }]}>
            <View style={styles.menuHandle} />
            <Image source={LOGO} style={styles.menuLogo} resizeMode="contain" />
            {navItems.map((item, idx) => (
              <TouchableOpacity key={idx} style={styles.menuItem} onPress={() => {
                setMenuVisible(false);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(item.path as any);
              }}>
                <View style={styles.menuItemIcon}>
                  <Ionicons name={item.icon as any} size={22} color={C.tint} />
                </View>
                <Text style={styles.menuItemLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={16} color={C.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#05050A", paddingHorizontal: 20 },

  topBar: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginBottom: 24, marginTop: 12,
  },
  menuBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center", justifyContent: "center",
  },

  logoSection: { alignItems: "center", marginBottom: 28 },
  logoImage: { width: W * 0.52, height: 80 },
  tagline: {
    fontFamily: "Inter_400Regular", fontSize: 13,
    color: C.textSecondary, textAlign: "center", marginTop: 6,
  },

  searchBar: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 32, paddingHorizontal: 18, height: 62,
    borderWidth: 1.5, borderColor: "rgba(152,152,176,0.35)",
    marginBottom: 20,
    shadowColor: "rgba(152,152,176,0.3)",
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 14, elevation: 6,
  },
  searchPlaceholder: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 16, color: C.textMuted },
  searchRight: { flexDirection: "row", alignItems: "center", gap: 4 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },

  aiShortcuts: { flexDirection: "row", gap: 12, marginBottom: 24 },
  aiShortcut: {
    flex: 1, flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.055)",
    borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
  },
  aiIconWrapper: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: "rgba(152,152,176,0.14)",
    alignItems: "center", justifyContent: "center", marginRight: 8,
  },
  aiShortcutText: { fontFamily: "Inter_500Medium", fontSize: 13, color: C.text },

  trendingSection: { marginBottom: 20 },
  trendingLabel: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: C.text, marginBottom: 12 },
  trendingList: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "center" },
  trendPill: {
    backgroundColor: "rgba(255,255,255,0.055)", borderRadius: 28,
    paddingVertical: 10, paddingHorizontal: 18,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
  },
  trendPillText: { fontFamily: "Inter_500Medium", fontSize: 14, color: C.text, letterSpacing: 0.2 },

  menuOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  menuSheet: {
    backgroundColor: "#0D0D18", borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingTop: 12, paddingHorizontal: 20,
    borderTopWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  menuHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.15)", alignSelf: "center", marginBottom: 16,
  },
  menuLogo: { width: W * 0.45, height: 56, alignSelf: "center", marginBottom: 20 },
  menuItem: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 15, borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.07)", gap: 14,
  },
  menuItemIcon: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "rgba(152,152,176,0.14)",
    alignItems: "center", justifyContent: "center",
  },
  menuItemLabel: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 16, color: C.text },
});
