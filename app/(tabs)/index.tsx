import React, { useRef, useState, useEffect } from "react";
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ScrollView, StatusBar, Platform, Animated, Modal,
  Dimensions, Image
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import Colors from "@/constants/colors";
import { useSearch } from "@/context/SearchContext";

const { width } = Dimensions.get("window");

const TRENDING = [
  "AI News 2025", "Budget India", "IPL 2025", "Cricket Score",
  "Stock Market", "Gold Price", "Bollywood", "Tech Startups",
  "Climate Change", "Space Mission", "FIFA 2026", "Olympics"
];

const LOGO_COLORS = ["#1E6FD9","#EF4444","#F59E0B","#1E6FD9","#22C55E","#EF4444","#8B5CF6"];
const LOGO_LETTERS = ["s","t","r","e","e","k","x"];

interface WeatherData { temp: number; condition: string; iconName: string }

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { history, search, settings } = useSearch();
  const [inputValue, setInputValue] = useState("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const logoAnim = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  useEffect(() => {
    Animated.spring(logoAnim, {
      toValue: 1, useNativeDriver: true, tension: 80, friction: 9,
    }).start();
    fetchWeather();
  }, []);

  async function fetchWeather() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      let lat = 28.6139, lon = 77.2090;
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
        lat = loc.coords.latitude;
        lon = loc.coords.longitude;
      }
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`,
        { signal: AbortSignal.timeout(5000) }
      );
      if (res.ok) {
        const data = await res.json();
        const code = data.current_weather.weathercode as number;
        setWeather({
          temp: Math.round(data.current_weather.temperature),
          condition: getCondition(code),
          iconName: getIconName(code),
        });
      }
    } catch (_) {}
  }

  function getCondition(code: number): string {
    if (code === 0) return "Clear sky";
    if (code <= 3) return "Partly cloudy";
    if (code <= 48) return "Foggy";
    if (code <= 67) return "Rainy";
    if (code <= 77) return "Snowy";
    if (code <= 82) return "Showers";
    return "Thunderstorm";
  }

  function getIconName(code: number): string {
    if (code === 0) return "sunny-outline";
    if (code <= 3) return "partly-sunny-outline";
    if (code <= 67) return "rainy-outline";
    if (code <= 77) return "snow-outline";
    return "thunderstorm-outline";
  }

  function handleSearch() {
    const q = inputValue.trim();
    if (!q) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    search(q, "all");
    router.push({ pathname: "/search", params: { q, filter: "all" } });
    setInputValue("");
  }

  function handleTrending(term: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    search(term, "all");
    router.push({ pathname: "/search", params: { q: term, filter: "all" } });
  }

  function handleVoice() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({ pathname: "/search", params: { q: "", filter: "all", voiceMode: "1" } });
  }

  function handleAi() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/ai-assistant");
  }

  const navItems = [
    { label: "History", icon: "time-outline", path: "/(tabs)/history" },
    { label: "Saved", icon: "bookmark-outline", path: "/(tabs)/saved" },
    { label: "Settings", icon: "settings-outline", path: "/(tabs)/settings" },
    { label: "AI Assistant", icon: "robot-outline", path: "/ai-assistant" },
  ];

  const recentHistory = history.slice(0, 5);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={["rgba(162,210,255,0.22)", "rgba(240,248,255,0.1)", "rgba(255,255,255,0)"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: topPad + 12, paddingBottom: botPad + 32 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.topBar}>
          <View style={styles.discoverIcon}>
            <LinearGradient
              colors={["#1E6FD9", "#0EA5E9"]}
              style={styles.discoverGradient}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            >
              <MaterialCommunityIcons name="compass-outline" size={22} color="#FFF" />
            </LinearGradient>
          </View>

          <TouchableOpacity
            style={styles.menuBtn}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMenuVisible(true); }}
          >
            <Ionicons name="menu-outline" size={26} color={Colors.light.text} />
          </TouchableOpacity>
        </View>

        <Animated.View
          style={[styles.logoSection, {
            opacity: logoAnim,
            transform: [{ translateY: logoAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
          }]}
        >
          <View style={styles.logoRow}>
            {LOGO_LETTERS.map((letter, i) => (
              <Text key={i} style={[styles.logoLetter, { color: LOGO_COLORS[i] }]}>
                {letter}
              </Text>
            ))}
          </View>
          {weather ? (
            <View style={styles.weatherRow}>
              <Ionicons name={weather.iconName as any} size={15} color="#F59E0B" />
              <Text style={styles.weatherText}>{weather.condition}, {weather.temp}°C</Text>
            </View>
          ) : (
            <View style={styles.weatherRow}>
              <Ionicons name="partly-sunny-outline" size={15} color="#F59E0B" />
              <Text style={styles.weatherText}>Loading weather...</Text>
            </View>
          )}
        </Animated.View>

        <View style={styles.searchWrap}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color={Colors.light.textSecondary} style={{ marginRight: 8 }} />
            <TextInput
              ref={inputRef}
              style={styles.searchInput}
              placeholder="Find anything"
              placeholderTextColor={Colors.light.textMuted}
              value={inputValue}
              onChangeText={setInputValue}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.searchRight}>
              <TouchableOpacity style={styles.iconBtn} onPress={handleAi}>
                <MaterialCommunityIcons name="robot-excited-outline" size={20} color={Colors.light.tint} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={handleVoice}>
                <Ionicons name="mic-outline" size={21} color={Colors.light.tint} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {recentHistory.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Recent</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipRow}>
                {recentHistory.map((item, idx) => (
                  <TouchableOpacity key={idx} style={styles.recentChip} onPress={() => handleTrending(item.query)}>
                    <Ionicons name="time-outline" size={13} color={Colors.light.textSecondary} />
                    <Text style={styles.recentText} numberOfLines={1}>{item.query}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Trending now</Text>
          <View style={styles.trendingWrap}>
            {TRENDING.map((term, idx) => (
              <TouchableOpacity key={idx} style={styles.trendChip} onPress={() => handleTrending(term)} activeOpacity={0.7}>
                <Text style={styles.trendText}>{term}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <Modal visible={menuVisible} transparent animationType="slide">
        <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setMenuVisible(false)}>
          <View style={[styles.menuSheet, { paddingBottom: botPad + 20 }]}>
            <View style={styles.menuHandle} />
            <View style={styles.menuLogoRow}>
              {LOGO_LETTERS.map((letter, i) => (
                <Text key={i} style={[styles.menuLogo, { color: LOGO_COLORS[i] }]}>{letter}</Text>
              ))}
            </View>
            {navItems.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(item.path as any);
                }}
              >
                <View style={styles.menuItemIcon}>
                  <Ionicons name={item.icon as any} size={22} color={Colors.light.tint} />
                </View>
                <Text style={styles.menuItemLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.light.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  content: { paddingHorizontal: 20 },

  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 40,
  },
  discoverIcon: { borderRadius: 14, overflow: "hidden" },
  discoverGradient: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  menuBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(162,210,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },

  logoSection: { alignItems: "center", marginBottom: 36 },
  logoRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  logoLetter: {
    fontFamily: "Caveat_700Bold",
    fontSize: 56,
    lineHeight: 64,
    letterSpacing: 2,
  },
  weatherRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  weatherText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.light.textSecondary,
  },

  searchWrap: { marginBottom: 28 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 30,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1.5,
    borderColor: Colors.light.tint,
    shadowColor: Colors.light.tint,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: Colors.light.text,
  },
  searchRight: { flexDirection: "row", alignItems: "center" },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  section: { marginBottom: 28 },
  sectionLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.light.text,
    marginBottom: 12,
    textAlign: "center",
  },
  chipRow: { flexDirection: "row", gap: 8 },
  recentChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(162,210,255,0.18)",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    maxWidth: 160,
  },
  recentText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.light.text,
  },
  trendingWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  trendChip: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  trendText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.light.text,
  },

  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  menuSheet: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: 20,
  },
  menuHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.light.border,
    alignSelf: "center",
    marginBottom: 20,
  },
  menuLogoRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
  },
  menuLogo: {
    fontFamily: "Caveat_700Bold",
    fontSize: 36,
    letterSpacing: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    gap: 14,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.light.accentLight,
    alignItems: "center",
    justifyContent: "center",
  },
  menuItemLabel: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    color: Colors.light.text,
  },
});
