import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput,
  KeyboardAvoidingView, Platform, ActivityIndicator, Image, Dimensions,
  Animated, StatusBar, Linking, Alert, ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";

const { width: W } = Dimensions.get("window");
const BASE_URL = "https://yesansh-streekx-search-api.hf.space";
const LOGO = require("@/assets/images/logo.png");

type FocusMode = { key: string; label: string; icon: string; color: string };
const FOCUS_MODES: FocusMode[] = [
  { key: "web",      label: "Web",      icon: "globe-outline",         color: "#6EB4FF" },
  { key: "academic", label: "Academic", icon: "school-outline",        color: "#A78BFA" },
  { key: "writing",  label: "Writing",  icon: "create-outline",        color: "#34D399" },
  { key: "creative", label: "Creative", icon: "color-palette-outline", color: "#F59E0B" },
  { key: "video",    label: "Video",    icon: "videocam-outline",      color: "#EF4444" },
  { key: "math",     label: "Math",     icon: "calculator-outline",    color: "#06B6D4" },
];

type Source = { title: string; url: string; snippet?: string };
type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  image?: string;
  loading?: boolean;
  focusMode?: string;
  timestamp: number;
};

function getDomain(url: string) {
  try { return new URL(url).hostname.replace("www.", ""); } catch { return url; }
}

function GalaxyBg() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={["#020205", "#030309", "#020204"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
      />
      <LinearGradient
        colors={["transparent", "rgba(10,8,18,0.5)", "#030208"]}
        style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 200 }}
        start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
      />
    </View>
  );
}

function SourceCard({ source }: { source: Source }) {
  const domain = getDomain(source.url);
  return (
    <TouchableOpacity style={ss.sourceCard} onPress={() => Linking.openURL(source.url)} activeOpacity={0.8}>
      <Image source={{ uri: `https://www.google.com/s2/favicons?domain=${domain}&sz=32` }} style={ss.sourceFavicon} />
      <View style={ss.sourceInfo}>
        <Text style={ss.sourceTitle} numberOfLines={1}>{source.title}</Text>
        <Text style={ss.sourceDomain} numberOfLines={1}>{domain}</Text>
      </View>
      <Ionicons name="open-outline" size={14} color="rgba(255,255,255,0.4)" />
    </TouchableOpacity>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";

  if (msg.loading) {
    const dot1 = useRef(new Animated.Value(0.3)).current;
    const dot2 = useRef(new Animated.Value(0.3)).current;
    const dot3 = useRef(new Animated.Value(0.3)).current;
    useEffect(() => {
      const makeAnim = (val: Animated.Value, delay: number) =>
        Animated.loop(Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(val, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ]));
      const a1 = makeAnim(dot1, 0);
      const a2 = makeAnim(dot2, 180);
      const a3 = makeAnim(dot3, 360);
      a1.start(); a2.start(); a3.start();
      return () => { a1.stop(); a2.stop(); a3.stop(); };
    }, []);
    return (
      <View style={[ss.msgWrap, ss.assistantWrap]}>
        <View style={ss.thinkingBubble}>
          <View style={ss.assistantHeader}>
            <Image source={LOGO} style={ss.assistantLogo} resizeMode="contain" />
          </View>
          <View style={ss.dotsRow}>
            {[dot1, dot2, dot3].map((d, i) => (
              <Animated.View key={i} style={[ss.dot, { opacity: d }]} />
            ))}
            <Text style={ss.thinkingText}>Searching the web...</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[ss.msgWrap, isUser ? ss.userWrap : ss.assistantWrap]}>
      {msg.image && !isUser && null}
      {isUser ? (
        <View>
          {msg.image && (
            <Image source={{ uri: msg.image }} style={ss.attachedImage} resizeMode="cover" />
          )}
          <LinearGradient
            colors={["#1E6FD9", "#1558B0"]}
            style={ss.userBubble}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          >
            <Text style={ss.userText}>{msg.content}</Text>
          </LinearGradient>
        </View>
      ) : (
        <View style={ss.assistantBubble}>
          <View style={ss.assistantHeader}>
            <Image source={LOGO} style={ss.assistantLogo} resizeMode="contain" />
            {msg.focusMode && (
              <View style={[ss.modeBadge, { backgroundColor: `${FOCUS_MODES.find(m => m.key === msg.focusMode)?.color}22` }]}>
                <Ionicons name={FOCUS_MODES.find(m => m.key === msg.focusMode)?.icon as any} size={11} color={FOCUS_MODES.find(m => m.key === msg.focusMode)?.color || "#6EB4FF"} />
                <Text style={[ss.modeBadgeText, { color: FOCUS_MODES.find(m => m.key === msg.focusMode)?.color || "#6EB4FF" }]}>
                  {FOCUS_MODES.find(m => m.key === msg.focusMode)?.label || "Web"}
                </Text>
              </View>
            )}
          </View>
          <Text style={ss.assistantText}>{msg.content}</Text>
          {msg.sources && msg.sources.length > 0 && (
            <View style={ss.sourcesWrap}>
              <Text style={ss.sourcesLabel}>Sources</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={ss.sourcesScroll}>
                {msg.sources.map((s, i) => <SourceCard key={i} source={s} />)}
              </ScrollView>
            </View>
          )}
        </View>
      )}
      <Text style={[ss.timestamp, isUser ? ss.timestampRight : ss.timestampLeft]}>
        {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </Text>
    </View>
  );
}

export default function AIChatScreen() {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm StreekX AI. I can search the web in real time, answer questions, help with writing, math, and more.\n\nChoose a focus mode above, then ask me anything!",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedMode, setSelectedMode] = useState<FocusMode>(FOCUS_MODES[0]);
  const [showModes, setShowModes] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useSpeechRecognitionEvent("result", (event) => {
    if (event.results?.[0]?.transcript) {
      setInput(prev => (prev ? prev + " " : "") + event.results[0].transcript);
    }
  });
  useSpeechRecognitionEvent("end", () => setIsListening(false));
  useSpeechRecognitionEvent("error", () => setIsListening(false));

  const scrollToBottom = useCallback(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 120);
  }, []);

  const toggleVoice = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isListening) {
      ExpoSpeechRecognitionModule.stop();
      setIsListening(false);
    } else {
      try {
        const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
        if (!perm.granted) { Alert.alert("Permission needed", "Please allow microphone access."); return; }
        setIsListening(true);
        ExpoSpeechRecognitionModule.start({ lang: "en-US", interimResults: true, continuous: false });
      } catch { setIsListening(false); }
    }
  }, [isListening]);

  const pickImage = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert("Permission needed", "Please allow photo access."); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8, allowsEditing: true,
    });
    if (!result.canceled && result.assets[0]) {
      setAttachedImage(result.assets[0].uri);
    }
  }, []);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text && !attachedImage) return;
    if (loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoading(true);
    setInput("");
    const imgUri = attachedImage;
    setAttachedImage(null);

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text || "Analyze this image",
      image: imgUri || undefined,
      timestamp: Date.now(),
    };
    const loadingMsg: Message = {
      id: `l-${Date.now()}`,
      role: "assistant",
      content: "",
      loading: true,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg, loadingMsg]);

    try {
      const searchQuery = text || "analyze image";
      const modeParam = selectedMode.key === "academic" ? "scholar"
        : selectedMode.key === "video" ? "videos"
        : selectedMode.key === "creative" ? "images"
        : "all";

      const res = await fetch(
        `${BASE_URL}/search?q=${encodeURIComponent(searchQuery)}&type=${modeParam}&region=wt-wt`,
        { signal: AbortSignal.timeout(30000) }
      );

      if (!res.ok) throw new Error("API error");
      const data = await res.json();

      let aiContent = "";
      const sources: Source[] = [];

      if (data.ai_overview) aiContent = data.ai_overview;
      else if (data.knowledge_card?.description) aiContent = data.knowledge_card.description;

      if (data.results?.length) {
        data.results.slice(0, 6).forEach((r: any) => {
          sources.push({
            title: r.title || "",
            url: r.url || r.link || "",
            snippet: r.description || r.snippet || "",
          });
        });
        if (!aiContent && sources.length > 0) {
          aiContent = sources.slice(0, 3)
            .map(s => `${s.title}\n${s.snippet}`)
            .filter(t => t.trim().length > 5)
            .join("\n\n");
        }
      }

      if (!aiContent && data.answer) aiContent = data.answer;
      if (!aiContent && data.infobox) aiContent = data.infobox.content || data.infobox.description || "";
      if (!aiContent) aiContent = sources.length > 0
        ? `Here are the top results for "${searchQuery}".`
        : `I couldn't find specific information about "${searchQuery}". Try rephrasing your question.`;

      const aiMsg: Message = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: aiContent,
        sources,
        focusMode: selectedMode.key,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev.filter(m => !m.loading), aiMsg]);
    } catch {
      const errMsg: Message = {
        id: `e-${Date.now()}`,
        role: "assistant",
        content: "Sorry, I couldn't get a response right now. Please check your connection and try again.",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev.filter(m => !m.loading), errMsg]);
    } finally {
      setLoading(false);
    }
  }, [input, attachedImage, selectedMode, loading]);

  const topPad = Platform.OS === "web" ? 60 : insets.top;
  const botPad = Platform.OS === "web" ? 20 : insets.bottom;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#05050A" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <GalaxyBg />

      {/* Header */}
      <View style={[ss.header, { paddingTop: topPad }]}>
        <TouchableOpacity style={ss.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Image source={LOGO} style={ss.headerLogo} resizeMode="contain" />
        <TouchableOpacity
          style={[ss.modeBtn, { borderColor: `${selectedMode.color}55` }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowModes(v => !v); }}
        >
          <Ionicons name={selectedMode.icon as any} size={15} color={selectedMode.color} />
          <Text style={[ss.modeBtnText, { color: selectedMode.color }]}>{selectedMode.label}</Text>
          <Ionicons name={showModes ? "chevron-up" : "chevron-down"} size={13} color={selectedMode.color} />
        </TouchableOpacity>
      </View>

      {/* Mode selector dropdown */}
      {showModes && (
        <View style={ss.modesDropdown}>
          {FOCUS_MODES.map(mode => (
            <TouchableOpacity
              key={mode.key}
              style={[ss.modeOption, selectedMode.key === mode.key && ss.modeOptionSelected]}
              onPress={() => { setSelectedMode(mode); setShowModes(false); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
            >
              <Ionicons name={mode.icon as any} size={18} color={mode.color} />
              <Text style={[ss.modeOptionText, { color: mode.color }]}>{mode.label}</Text>
              {selectedMode.key === mode.key && (
                <Ionicons name="checkmark-circle" size={16} color={mode.color} style={{ marginLeft: "auto" }} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={m => m.id}
        renderItem={({ item }) => <MessageBubble msg={item} />}
        contentContainerStyle={[ss.msgList, { paddingBottom: botPad + 16 }]}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={scrollToBottom}
        onLayout={scrollToBottom}
      />

      {/* Attached image preview */}
      {attachedImage && (
        <View style={ss.attachPreview}>
          <Image source={{ uri: attachedImage }} style={ss.attachThumb} />
          <Text style={ss.attachLabel}>Image attached</Text>
          <TouchableOpacity onPress={() => setAttachedImage(null)} style={{ marginLeft: "auto" }}>
            <Ionicons name="close-circle" size={22} color="#EF4444" />
          </TouchableOpacity>
        </View>
      )}

      {/* Input bar */}
      <View style={[ss.inputBar, { paddingBottom: botPad + 6 }]}>
        <TouchableOpacity style={ss.inputAction} onPress={pickImage}>
          <Ionicons name="attach" size={22} color="rgba(255,255,255,0.55)" />
        </TouchableOpacity>

        <TextInput
          style={ss.textInput}
          value={input}
          onChangeText={setInput}
          placeholder={isListening ? "Listening..." : "Ask anything..."}
          placeholderTextColor={isListening ? "#EF4444" : "rgba(255,255,255,0.35)"}
          multiline
          maxLength={2000}
          returnKeyType="default"
          blurOnSubmit={false}
          selectionColor="#6EB4FF"
        />

        <TouchableOpacity
          style={[ss.inputAction, isListening && ss.voiceActive]}
          onPress={toggleVoice}
        >
          <Ionicons
            name={isListening ? "mic" : "mic-outline"}
            size={22}
            color={isListening ? "#EF4444" : "rgba(255,255,255,0.55)"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[ss.sendBtn, (!input.trim() && !attachedImage) && ss.sendBtnDisabled]}
          onPress={sendMessage}
          disabled={loading || (!input.trim() && !attachedImage)}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="arrow-up" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const ss = StyleSheet.create({
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 14, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.07)",
    zIndex: 10,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.07)",
    alignItems: "center", justifyContent: "center", marginRight: 8,
  },
  headerLogo: { flex: 1, height: 34 },
  modeBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 20, paddingVertical: 7, paddingHorizontal: 11,
    borderWidth: 1,
  },
  modeBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },

  modesDropdown: {
    position: "absolute", right: 14, zIndex: 200,
    backgroundColor: "#0F0F20",
    borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
    padding: 6,
    shadowColor: "#000", shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.7, shadowRadius: 24, elevation: 24,
    top: 95,
  },
  modeOption: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10,
    minWidth: 170,
  },
  modeOptionSelected: { backgroundColor: "rgba(255,255,255,0.07)" },
  modeOptionText: { fontFamily: "Inter_500Medium", fontSize: 14 },

  msgList: { paddingHorizontal: 14, paddingTop: 14, flexGrow: 1 },

  msgWrap: { marginBottom: 18 },
  userWrap: { alignItems: "flex-end" },
  assistantWrap: { alignItems: "flex-start" },

  userBubble: {
    maxWidth: W * 0.78, borderRadius: 20, borderBottomRightRadius: 5,
    paddingHorizontal: 16, paddingVertical: 12,
  },
  userText: { fontFamily: "Inter_400Regular", fontSize: 15, color: "#fff", lineHeight: 22 },

  assistantBubble: {
    maxWidth: W * 0.90,
    backgroundColor: "rgba(255,255,255,0.055)",
    borderRadius: 20, borderBottomLeftRadius: 5,
    paddingHorizontal: 16, paddingVertical: 14,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.09)",
  },
  assistantHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 8 },
  assistantLogo: { width: 55, height: 18 },
  modeBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3,
  },
  modeBadgeText: { fontFamily: "Inter_500Medium", fontSize: 11 },
  assistantText: { fontFamily: "Inter_400Regular", fontSize: 15, color: "rgba(255,255,255,0.9)", lineHeight: 24 },

  thinkingBubble: {
    backgroundColor: "rgba(255,255,255,0.055)",
    borderRadius: 20, borderBottomLeftRadius: 5,
    paddingHorizontal: 16, paddingVertical: 14,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.09)",
  },
  dotsRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#6EB4FF" },
  thinkingText: { fontFamily: "Inter_400Regular", fontSize: 13, color: "rgba(255,255,255,0.45)", marginLeft: 4 },

  sourcesWrap: { marginTop: 14 },
  sourcesLabel: {
    fontFamily: "Inter_600SemiBold", fontSize: 11,
    color: "rgba(255,255,255,0.45)", marginBottom: 8,
    textTransform: "uppercase", letterSpacing: 0.8,
  },
  sourcesScroll: { marginHorizontal: -4 },
  sourceCard: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8,
    marginRight: 8, maxWidth: 185,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  sourceFavicon: { width: 18, height: 18, borderRadius: 4 },
  sourceInfo: { flex: 1 },
  sourceTitle: { fontFamily: "Inter_500Medium", fontSize: 11, color: "rgba(255,255,255,0.85)" },
  sourceDomain: { fontFamily: "Inter_400Regular", fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 1 },

  timestamp: { fontFamily: "Inter_400Regular", fontSize: 10, color: "rgba(255,255,255,0.28)", marginTop: 4 },
  timestampRight: { textAlign: "right" },
  timestampLeft: { textAlign: "left" },

  attachedImage: { width: W * 0.65, height: 180, borderRadius: 14, marginBottom: 6 },

  attachPreview: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.07)", gap: 10,
  },
  attachThumb: { width: 42, height: 42, borderRadius: 8 },
  attachLabel: { fontFamily: "Inter_500Medium", fontSize: 13, color: "rgba(255,255,255,0.7)" },

  inputBar: {
    flexDirection: "row", alignItems: "flex-end",
    paddingHorizontal: 10, paddingTop: 10,
    backgroundColor: "rgba(8,6,18,0.98)",
    borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.08)",
    gap: 6,
  },
  inputAction: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.07)",
    marginBottom: 0,
  },
  voiceActive: { backgroundColor: "rgba(239,68,68,0.18)" },
  textInput: {
    flex: 1, minHeight: 40, maxHeight: 120,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 22, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10,
    fontFamily: "Inter_400Regular", fontSize: 15, color: "#fff",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.12)",
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "#1E6FD9", alignItems: "center", justifyContent: "center",
    shadowColor: "#1E6FD9", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, shadowRadius: 10, elevation: 6,
  },
  sendBtnDisabled: { backgroundColor: "rgba(30,111,217,0.25)", shadowOpacity: 0 },
});
