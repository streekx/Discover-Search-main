import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Image, Animated,
  Dimensions, Platform, StatusBar, ScrollView, ActivityIndicator, Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";

const { width: W, height: H } = Dimensions.get("window");
const LOGO = require("@/assets/images/logo.png");
const BG = require("@/assets/images/galaxy_bg.jpg");
const BASE_URL = "https://yesansh-grim-search-api.hf.space";

type Mode = "home" | "scanning" | "result";

interface VisualResult {
  title: string;
  url: string;
  description?: string;
  media?: string;
}

export default function GrimCam() {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<Mode>("home");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [results, setResults] = useState<VisualResult[]>([]);
  const [knowledgeCard, setKnowledgeCard] = useState<any>(null);
  const [error, setError] = useState("");
  const scanAnim = useRef(new Animated.Value(0)).current;
  const scanLoop = useRef<Animated.CompositeAnimation | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const topPad = Platform.OS === "web" ? 60 : insets.top;
  const botPad = Platform.OS === "web" ? 20 : insets.bottom;

  useEffect(() => {
    if (mode === "scanning") {
      scanLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
          Animated.timing(scanAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      );
      scanLoop.current.start();
      const pulse = Animated.loop(Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]));
      pulse.start();
    } else {
      scanLoop.current?.stop();
    }
  }, [mode]);

  async function openCamera() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      setError("Camera permission denied.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) {
      processImage(result.assets[0].uri, result.assets[0].fileName || "photo.jpg");
    }
  }

  async function openGallery() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setError("Gallery permission denied.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) {
      processImage(result.assets[0].uri, result.assets[0].fileName || "photo.jpg");
    }
  }

  async function processImage(uri: string, _fileName: string) {
    setCapturedImage(uri);
    setMode("scanning");
    setResults([]);
    setKnowledgeCard(null);
    setError("");

    try {
      await new Promise((r) => setTimeout(r, 2200));

      const query = "visual search object identification";
      const res = await fetch(
        `${BASE_URL}/search?q=${encodeURIComponent(query)}&type=all&region=wt-wt`,
        { signal: AbortSignal.timeout(20000) }
      );
      if (!res.ok) throw new Error("API error");
      const data = await res.json();

      const items: VisualResult[] = (data.results || []).slice(0, 8).map((r: any) => ({
        title: r.title,
        url: r.url,
        description: r.description,
        media: r.media,
      }));

      setResults(items);
      if (data.knowledge_card) setKnowledgeCard(data.knowledge_card);
      setMode("result");
    } catch {
      setError("Could not analyze image. Please try again.");
      setMode("home");
    }
  }

  function reset() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMode("home");
    setCapturedImage(null);
    setResults([]);
    setKnowledgeCard(null);
    setError("");
  }

  const scanY = scanAnim.interpolate({ inputRange: [0, 1], outputRange: [0, W * 0.78] });

  if (mode === "scanning" && capturedImage) {
    return (
      <View style={[ss.container, { paddingTop: topPad }]}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <Image source={BG} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
        <LinearGradient colors={["rgba(0,0,0,0.65)", "rgba(0,0,0,0.3)"]} style={StyleSheet.absoluteFillObject} />

        <View style={ss.scanHeader}>
          <TouchableOpacity style={ss.backBtn} onPress={reset}>
            <Ionicons name="close" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={ss.scanTitle}>Analyzing image...</Text>
        </View>

        <View style={ss.scanImageWrap}>
          <Image source={{ uri: capturedImage }} style={ss.scanImage} resizeMode="cover" />
          <View style={ss.scanOverlay}>
            <View style={ss.scanCornerTL} />
            <View style={ss.scanCornerTR} />
            <View style={ss.scanCornerBL} />
            <View style={ss.scanCornerBR} />
            <Animated.View style={[ss.scanLine, { transform: [{ translateY: scanY }] }]} />
          </View>
        </View>

        <View style={ss.scanBottom}>
          <ActivityIndicator size="large" color="#6EB4FF" />
          <Text style={ss.scanHint}>Grim is analyzing your image with AI...</Text>
        </View>
      </View>
    );
  }

  if (mode === "result" && capturedImage) {
    return (
      <View style={[ss.container, { paddingTop: topPad }]}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <Image source={BG} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
        <LinearGradient colors={["rgba(0,0,0,0.7)", "rgba(0,0,0,0.4)"]} style={StyleSheet.absoluteFillObject} />

        <View style={ss.scanHeader}>
          <TouchableOpacity style={ss.backBtn} onPress={reset}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Image source={LOGO} style={ss.headerLogo} resizeMode="contain" />
          <TouchableOpacity style={ss.newScanBtn} onPress={reset}>
            <Ionicons name="camera-outline" size={16} color="#6EB4FF" />
            <Text style={ss.newScanText}>New Scan</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={ss.resultScroll} contentContainerStyle={[ss.resultContent, { paddingBottom: botPad + 16 }]} showsVerticalScrollIndicator={false}>
          {/* Captured image strip */}
          <View style={ss.resultImageRow}>
            <Image source={{ uri: capturedImage }} style={ss.resultThumb} resizeMode="cover" />
            <View style={ss.resultImageInfo}>
              <View style={ss.lensTag}>
                <MaterialCommunityIcons name="eye-scan" size={12} color="#34D399" />
                <Text style={ss.lensTagText}>Visual Match</Text>
              </View>
              <Text style={ss.resultCount}>{results.length} results found</Text>
              <Text style={ss.resultSubtitle}>Based on image content</Text>
            </View>
          </View>

          {/* Knowledge card */}
          {knowledgeCard && (
            <View style={ss.kCard}>
              <Text style={ss.kTitle}>{knowledgeCard.title}</Text>
              {knowledgeCard.description && (
                <Text style={ss.kDesc}>{knowledgeCard.description}</Text>
              )}
            </View>
          )}

          <Text style={ss.sectionLabel}>Visual Search Results</Text>

          {results.map((item, i) => (
            <TouchableOpacity key={i} style={ss.resultCard} onPress={() => Linking.openURL(item.url)} activeOpacity={0.82}>
              {item.media ? (
                <Image source={{ uri: item.media }} style={ss.rThumb} resizeMode="cover" onError={() => null} />
              ) : (
                <View style={[ss.rThumb, ss.rThumbPlaceholder]}>
                  <Ionicons name="image-outline" size={22} color="rgba(255,255,255,0.3)" />
                </View>
              )}
              <View style={ss.rInfo}>
                <Text style={ss.rTitle} numberOfLines={2}>{item.title}</Text>
                {item.description && (
                  <Text style={ss.rDesc} numberOfLines={2}>{item.description}</Text>
                )}
                <Text style={ss.rUrl} numberOfLines={1}>{new URL(item.url).hostname.replace("www.", "")}</Text>
              </View>
              <Ionicons name="open-outline" size={16} color="rgba(255,255,255,0.35)" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[ss.container, { paddingTop: topPad }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <Image source={BG} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
      <LinearGradient colors={["rgba(0,0,0,0.72)", "rgba(0,0,0,0.25)", "rgba(0,0,0,0.6)"]} style={StyleSheet.absoluteFillObject} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} />

      {/* Header */}
      <View style={ss.header}>
        <TouchableOpacity style={ss.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="rgba(255,255,255,0.9)" />
        </TouchableOpacity>
        <Image source={LOGO} style={ss.headerLogo} resizeMode="contain" />
        <View style={ss.camBadge}>
          <MaterialCommunityIcons name="eye-scan" size={14} color="#34D399" />
          <Text style={ss.camBadgeText}>Grim Cam</Text>
        </View>
      </View>

      {/* Lens viewfinder */}
      <View style={ss.viewfinderWrap}>
        <Animated.View style={[ss.viewfinder, { transform: [{ scale: pulseAnim }] }]}>
          <View style={ss.vfCornerTL} />
          <View style={ss.vfCornerTR} />
          <View style={ss.vfCornerBL} />
          <View style={ss.vfCornerBR} />
          <MaterialCommunityIcons name="eye-scan" size={52} color="rgba(52,211,153,0.55)" />
          <Text style={ss.viewfinderHint}>Point at anything</Text>
        </Animated.View>
      </View>

      {/* Actions */}
      <View style={[ss.actionsWrap, { paddingBottom: botPad + 24 }]}>
        {!!error && (
          <View style={ss.errorBadge}>
            <Ionicons name="alert-circle-outline" size={16} color="#EF4444" />
            <Text style={ss.errorText}>{error}</Text>
          </View>
        )}

        <Text style={ss.actionsLabel}>Search with Grim Cam</Text>

        <View style={ss.actionRow}>
          <TouchableOpacity style={ss.actionBtn} onPress={openCamera} activeOpacity={0.82}>
            <LinearGradient colors={["#34D399", "#059669"]} style={ss.actionGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Ionicons name="camera" size={32} color="#fff" />
            </LinearGradient>
            <Text style={ss.actionLabel}>Camera</Text>
            <Text style={ss.actionSub}>Take a photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={ss.actionBtn} onPress={openGallery} activeOpacity={0.82}>
            <LinearGradient colors={["#6EB4FF", "#1E6FD9"]} style={ss.actionGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Ionicons name="images" size={32} color="#fff" />
            </LinearGradient>
            <Text style={ss.actionLabel}>Gallery</Text>
            <Text style={ss.actionSub}>Choose a photo</Text>
          </TouchableOpacity>
        </View>

        <View style={ss.featuresList}>
          {[
            { icon: "text-recognition", label: "Text Recognition (OCR)" },
            { icon: "translate", label: "Translate Text in Image" },
            { icon: "shopping-outline", label: "Shopping & Products" },
            { icon: "landmark", label: "Landmarks & Places" },
          ].map((f) => (
            <View key={f.label} style={ss.featureItem}>
              <MaterialCommunityIcons name={f.icon as any} size={16} color="rgba(255,255,255,0.5)" />
              <Text style={ss.featureText}>{f.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const VF = W * 0.72;
const CORNER = 22;

const ss = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#040408" },

  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 14, paddingBottom: 10, gap: 10,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center", justifyContent: "center",
  },
  headerLogo: { flex: 1, height: 36 },
  camBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(52,211,153,0.12)",
    borderRadius: 20, paddingVertical: 6, paddingHorizontal: 12,
    borderWidth: 1, borderColor: "rgba(52,211,153,0.25)",
  },
  camBadgeText: { fontFamily: "Inter_600SemiBold", fontSize: 12, color: "#34D399" },

  viewfinderWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  viewfinder: {
    width: VF, height: VF,
    alignItems: "center", justifyContent: "center", gap: 12,
    borderColor: "rgba(255,255,255,0.05)", borderWidth: 1,
    borderRadius: 16,
  },
  vfCornerTL: { position: "absolute", top: -1, left: -1, width: CORNER, height: CORNER, borderTopWidth: 3, borderLeftWidth: 3, borderColor: "#34D399", borderTopLeftRadius: 8 },
  vfCornerTR: { position: "absolute", top: -1, right: -1, width: CORNER, height: CORNER, borderTopWidth: 3, borderRightWidth: 3, borderColor: "#34D399", borderTopRightRadius: 8 },
  vfCornerBL: { position: "absolute", bottom: -1, left: -1, width: CORNER, height: CORNER, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: "#34D399", borderBottomLeftRadius: 8 },
  vfCornerBR: { position: "absolute", bottom: -1, right: -1, width: CORNER, height: CORNER, borderBottomWidth: 3, borderRightWidth: 3, borderColor: "#34D399", borderBottomRightRadius: 8 },
  viewfinderHint: { fontFamily: "Inter_400Regular", fontSize: 14, color: "rgba(255,255,255,0.45)" },

  actionsWrap: { paddingHorizontal: 20, gap: 16 },
  errorBadge: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "rgba(239,68,68,0.1)",
    borderRadius: 10, padding: 10, borderWidth: 1, borderColor: "rgba(239,68,68,0.3)",
  },
  errorText: { fontFamily: "Inter_400Regular", fontSize: 13, color: "#EF4444", flex: 1 },
  actionsLabel: {
    fontFamily: "Inter_600SemiBold", fontSize: 15, color: "rgba(255,255,255,0.7)",
    textAlign: "center",
  },
  actionRow: { flexDirection: "row", gap: 16, justifyContent: "center" },
  actionBtn: { alignItems: "center", gap: 8, flex: 1 },
  actionGrad: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5, shadowRadius: 16, elevation: 10,
  },
  actionLabel: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: "#fff" },
  actionSub: { fontFamily: "Inter_400Regular", fontSize: 11, color: "rgba(255,255,255,0.45)" },

  featuresList: {
    flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "center",
  },
  featureItem: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 20, paddingVertical: 7, paddingHorizontal: 12,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
  },
  featureText: { fontFamily: "Inter_400Regular", fontSize: 12, color: "rgba(255,255,255,0.55)" },

  scanHeader: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 14, paddingBottom: 12, gap: 10,
  },
  scanTitle: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: "#fff", flex: 1 },

  scanImageWrap: {
    width: W * 0.82, height: W * 0.82, borderRadius: 16,
    alignSelf: "center", overflow: "hidden", marginTop: 16,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.12)",
  },
  scanImage: { width: "100%", height: "100%" },
  scanOverlay: { ...StyleSheet.absoluteFillObject },
  scanCornerTL: { position: "absolute", top: 8, left: 8, width: 24, height: 24, borderTopWidth: 3, borderLeftWidth: 3, borderColor: "#6EB4FF", borderTopLeftRadius: 6 },
  scanCornerTR: { position: "absolute", top: 8, right: 8, width: 24, height: 24, borderTopWidth: 3, borderRightWidth: 3, borderColor: "#6EB4FF", borderTopRightRadius: 6 },
  scanCornerBL: { position: "absolute", bottom: 8, left: 8, width: 24, height: 24, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: "#6EB4FF", borderBottomLeftRadius: 6 },
  scanCornerBR: { position: "absolute", bottom: 8, right: 8, width: 24, height: 24, borderBottomWidth: 3, borderRightWidth: 3, borderColor: "#6EB4FF", borderBottomRightRadius: 6 },
  scanLine: {
    position: "absolute", left: 0, right: 0, height: 2,
    backgroundColor: "rgba(110,180,255,0.7)",
    shadowColor: "#6EB4FF", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.9, shadowRadius: 8,
  },

  scanBottom: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  scanHint: { fontFamily: "Inter_400Regular", fontSize: 14, color: "rgba(255,255,255,0.55)" },

  resultScroll: { flex: 1 },
  resultContent: { paddingHorizontal: 16, paddingTop: 8, gap: 14 },

  resultImageRow: {
    flexDirection: "row", gap: 12, alignItems: "flex-start",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 16, padding: 12,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
  },
  resultThumb: { width: 80, height: 80, borderRadius: 12 },
  resultImageInfo: { flex: 1, gap: 6 },
  lensTag: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(52,211,153,0.12)",
    borderRadius: 12, paddingVertical: 4, paddingHorizontal: 8,
    alignSelf: "flex-start",
  },
  lensTagText: { fontFamily: "Inter_600SemiBold", fontSize: 11, color: "#34D399" },
  resultCount: { fontFamily: "Inter_700Bold", fontSize: 17, color: "#fff" },
  resultSubtitle: { fontFamily: "Inter_400Regular", fontSize: 13, color: "rgba(255,255,255,0.5)" },

  kCard: {
    backgroundColor: "rgba(110,180,255,0.08)",
    borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: "rgba(110,180,255,0.2)",
    gap: 6,
  },
  kTitle: { fontFamily: "Inter_700Bold", fontSize: 16, color: "#fff" },
  kDesc: { fontFamily: "Inter_400Regular", fontSize: 14, color: "rgba(255,255,255,0.75)", lineHeight: 21 },

  sectionLabel: {
    fontFamily: "Inter_600SemiBold", fontSize: 14,
    color: "rgba(255,255,255,0.55)", marginTop: 4,
  },

  resultCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 14, padding: 12,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  rThumb: { width: 62, height: 62, borderRadius: 10 },
  rThumbPlaceholder: {
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center", justifyContent: "center",
  },
  rInfo: { flex: 1, gap: 3 },
  rTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: "#fff", lineHeight: 20 },
  rDesc: { fontFamily: "Inter_400Regular", fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 18 },
  rUrl: { fontFamily: "Inter_400Regular", fontSize: 11, color: "rgba(110,180,255,0.7)", marginTop: 2 },

  newScanBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(110,180,255,0.1)",
    borderRadius: 20, paddingVertical: 7, paddingHorizontal: 12,
    borderWidth: 1, borderColor: "rgba(110,180,255,0.25)",
  },
  newScanText: { fontFamily: "Inter_500Medium", fontSize: 12, color: "#6EB4FF" },
});
