import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions,
  Platform, StatusBar, Image, ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";

const { width: W, height: H } = Dimensions.get("window");
const BASE_URL = "https://yesansh-streekx-search-api.hf.space";
const LOGO = require("@/assets/images/logo.png");
const BG = require("@/assets/images/galaxy_bg.jpg");

type State = "idle" | "listening" | "thinking" | "speaking";

export default function AIAssistantScreen() {
  const insets = useSafeAreaInsets();
  const [state, setState] = useState<State>("idle");
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [displayText, setDisplayText] = useState("");
  const [source, setSource] = useState("");

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ringAnim1 = useRef(new Animated.Value(1)).current;
  const ringAnim2 = useRef(new Animated.Value(1)).current;
  const ringAnim3 = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);
  const typewriterTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const topPad = Platform.OS === "web" ? 60 : insets.top;
  const botPad = Platform.OS === "web" ? 20 : insets.bottom;

  useSpeechRecognitionEvent("result", (event) => {
    const t = event.results?.[0]?.transcript || "";
    if (t) setTranscript(t);
    if (event.isFinal && t) {
      ExpoSpeechRecognitionModule.stop();
      setState("thinking");
      fetchAnswer(t);
    }
  });
  useSpeechRecognitionEvent("end", () => {
    if (state === "listening") setState("idle");
  });
  useSpeechRecognitionEvent("error", () => setState("idle"));

  useEffect(() => {
    return () => {
      Speech.stop();
      ExpoSpeechRecognitionModule.stop();
      if (typewriterTimer.current) clearInterval(typewriterTimer.current);
    };
  }, []);

  useEffect(() => {
    if (state === "listening" || state === "thinking" || state === "speaking") {
      startPulse();
    } else {
      stopPulse();
    }
  }, [state]);

  function startPulse() {
    pulseLoop.current?.stop();
    const anim = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.12, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.delay(0),
          Animated.timing(ringAnim1, { toValue: 1.35, duration: 1200, useNativeDriver: true }),
          Animated.timing(ringAnim1, { toValue: 1, duration: 0, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.delay(400),
          Animated.timing(ringAnim2, { toValue: 1.55, duration: 1200, useNativeDriver: true }),
          Animated.timing(ringAnim2, { toValue: 1, duration: 0, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.delay(800),
          Animated.timing(ringAnim3, { toValue: 1.75, duration: 1200, useNativeDriver: true }),
          Animated.timing(ringAnim3, { toValue: 1, duration: 0, useNativeDriver: true }),
        ]),
        Animated.loop(Animated.sequence([
          Animated.timing(glowAnim, { toValue: 0.9, duration: 800, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0.4, duration: 800, useNativeDriver: true }),
        ])),
      ])
    );
    pulseLoop.current = anim;
    anim.start();
  }

  function stopPulse() {
    pulseLoop.current?.stop();
    Animated.parallel([
      Animated.timing(pulseAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(ringAnim1, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(ringAnim2, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(ringAnim3, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(glowAnim, { toValue: 0.4, duration: 300, useNativeDriver: true }),
    ]).start();
  }

  function typewrite(text: string) {
    if (typewriterTimer.current) clearInterval(typewriterTimer.current);
    setDisplayText("");
    let i = 0;
    typewriterTimer.current = setInterval(() => {
      setDisplayText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) {
        if (typewriterTimer.current) clearInterval(typewriterTimer.current);
      }
    }, 22);
  }

  async function fetchAnswer(query: string) {
    try {
      const res = await fetch(
        `${BASE_URL}/search?q=${encodeURIComponent(query)}&type=all&region=wt-wt`,
        { signal: AbortSignal.timeout(28000) }
      );
      if (!res.ok) throw new Error("API error");
      const data = await res.json();

      let answer = "";
      if (data.ai_overview) answer = data.ai_overview;
      else if (data.knowledge_card?.description) answer = data.knowledge_card.description;
      else {
        const results: any[] = data.results || [];
        const withDesc = results.filter((r: any) =>
          r.description && r.description !== "No description." && r.description.length > 30
        );
        if (withDesc.length > 0) {
          const combined = withDesc.slice(0, 3).map((r: any) => r.description).join(" ");
          const sentences = combined.match(/[^.!?]+[.!?]+/g) || [];
          answer = sentences.slice(0, 3).join(" ").trim() || combined.slice(0, 350);
        }
        if (!answer && results.length > 0) {
          answer = `Here's what I found: ${results.slice(0, 2).map((r: any) => r.title).join(". ")}.`;
        }
        if (results[0]?.url) setSource(results[0].url);
      }

      if (!answer) answer = "I couldn't find information on that. Please try again.";

      setResponse(answer);
      setState("speaking");
      typewrite(answer);
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();

      Speech.speak(answer, {
        language: "en-US",
        rate: 0.94,
        pitch: 1.0,
        onDone: () => setState("idle"),
        onStopped: () => setState("idle"),
        onError: () => setState("idle"),
      });
    } catch {
      const err = "Sorry, I couldn't get an answer. Please check your connection.";
      setResponse(err);
      setState("speaking");
      typewrite(err);
      Speech.speak(err, { language: "en-US", onDone: () => setState("idle") });
    }
  }

  const handleOrbPress = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (state === "listening") {
      ExpoSpeechRecognitionModule.stop();
      setState("idle");
      return;
    }
    if (state === "speaking") {
      Speech.stop();
      setState("idle");
      return;
    }
    if (state === "thinking") return;

    Speech.stop();
    setTranscript("");
    setResponse("");
    setDisplayText("");
    setSource("");
    fadeAnim.setValue(0);

    try {
      const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!perm.granted) {
        setResponse("Microphone permission is required.");
        setState("speaking");
        typewrite("Microphone permission is required.");
        return;
      }
      setState("listening");
      ExpoSpeechRecognitionModule.start({ lang: "en-US", interimResults: true, continuous: false });
    } catch {
      setState("idle");
    }
  }, [state]);

  const orbColor = state === "listening" ? ["#EF4444", "#B91C1C"] :
    state === "thinking" ? ["#F59E0B", "#D97706"] :
    state === "speaking" ? ["#6EB4FF", "#1E6FD9"] :
    ["#FFFFFF", "#A0A0B8"];

  const ringColor = state === "listening" ? "rgba(239,68,68,0.3)" :
    state === "thinking" ? "rgba(245,158,11,0.3)" :
    state === "speaking" ? "rgba(110,180,255,0.3)" :
    "rgba(255,255,255,0.1)";

  const statusText = state === "idle" ? "Tap to speak" :
    state === "listening" ? "Listening..." :
    state === "thinking" ? "Thinking..." :
    "Speaking...";

  return (
    <View style={[ss.container, { paddingTop: topPad }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <View style={StyleSheet.absoluteFill}>
        <Image source={BG} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
        <LinearGradient
          colors={["rgba(0,0,0,0.6)", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.7)"]}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
        />
      </View>

      {/* Header */}
      <View style={ss.header}>
        <TouchableOpacity style={ss.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="rgba(255,255,255,0.9)" />
        </TouchableOpacity>
        <Image source={LOGO} style={ss.headerLogo} resizeMode="contain" />
        <View style={ss.statusBadge}>
          <View style={[ss.statusDot, { backgroundColor: state === "idle" ? "rgba(255,255,255,0.4)" : state === "listening" ? "#EF4444" : state === "thinking" ? "#F59E0B" : "#6EB4FF" }]} />
          <Text style={ss.statusBadgeText}>{statusText}</Text>
        </View>
      </View>

      {/* Transcript */}
      <View style={ss.transcriptWrap}>
        {!!transcript && (
          <View style={ss.transcriptBubble}>
            <Ionicons name="person-circle-outline" size={16} color="rgba(255,255,255,0.6)" />
            <Text style={ss.transcriptText}>{transcript}</Text>
          </View>
        )}
      </View>

      {/* Orb */}
      <View style={ss.orbCenter}>
        <Animated.View style={[ss.ring3, { transform: [{ scale: ringAnim3 }], backgroundColor: ringColor, opacity: glowAnim }]} />
        <Animated.View style={[ss.ring2, { transform: [{ scale: ringAnim2 }], backgroundColor: ringColor }]} />
        <Animated.View style={[ss.ring1, { transform: [{ scale: ringAnim1 }], backgroundColor: ringColor }]} />
        <TouchableOpacity onPress={handleOrbPress} activeOpacity={0.85}>
          <Animated.View style={[ss.orb, { transform: [{ scale: pulseAnim }] }]}>
            <LinearGradient colors={orbColor} style={ss.orbGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Ionicons
                name={state === "listening" ? "mic" : state === "thinking" ? "ellipsis-horizontal" : state === "speaking" ? "volume-high" : "mic-outline"}
                size={42} color="#fff"
              />
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Response */}
      <Animated.View style={[ss.responseWrap, { opacity: fadeAnim }]}>
        {!!displayText && (
          <View style={ss.responseBubble}>
            <Image source={LOGO} style={ss.responseLogo} resizeMode="contain" />
            <ScrollView style={{ maxHeight: H * 0.28 }} showsVerticalScrollIndicator={false}>
              <Text style={ss.responseText}>{displayText}</Text>
            </ScrollView>
          </View>
        )}
      </Animated.View>

      {/* Bottom hint */}
      <View style={[ss.bottomHint, { paddingBottom: botPad + 16 }]}>
        <Text style={ss.hintText}>
          {state === "idle" ? "Tap the orb and ask anything" :
           state === "listening" ? "Speak now — tap to stop" :
           state === "thinking" ? "Searching the web for you..." :
           "Tap to stop • Ask a new question"}
        </Text>
        {state !== "idle" && (
          <TouchableOpacity style={ss.stopBtn} onPress={handleOrbPress}>
            <Ionicons name="stop-circle-outline" size={20} color="rgba(255,255,255,0.6)" />
            <Text style={ss.stopText}>Stop</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const ORB = 130;
const RING1 = ORB + 32;
const RING2 = ORB + 72;
const RING3 = ORB + 116;

const ss = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#040408" },

  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 14, paddingBottom: 10,
    gap: 10,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center", justifyContent: "center",
  },
  headerLogo: { flex: 1, height: 36 },
  statusBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 20, paddingVertical: 6, paddingHorizontal: 12,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.12)",
  },
  statusDot: { width: 7, height: 7, borderRadius: 3.5 },
  statusBadgeText: { fontFamily: "Inter_500Medium", fontSize: 12, color: "rgba(255,255,255,0.75)" },

  transcriptWrap: {
    paddingHorizontal: 24, minHeight: 52,
    justifyContent: "center", alignItems: "center", marginTop: 8,
  },
  transcriptBubble: {
    flexDirection: "row", alignItems: "flex-start", gap: 8,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
    maxWidth: "90%",
  },
  transcriptText: {
    fontFamily: "Inter_500Medium", fontSize: 15, color: "rgba(255,255,255,0.88)",
    flex: 1, lineHeight: 22,
  },

  orbCenter: {
    flex: 1, alignItems: "center", justifyContent: "center",
  },
  ring3: { position: "absolute", width: RING3, height: RING3, borderRadius: RING3 / 2 },
  ring2: { position: "absolute", width: RING2, height: RING2, borderRadius: RING2 / 2 },
  ring1: { position: "absolute", width: RING1, height: RING1, borderRadius: RING1 / 2 },
  orb: { width: ORB, height: ORB, borderRadius: ORB / 2, overflow: "hidden", elevation: 20 },
  orbGrad: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center" },

  responseWrap: {
    paddingHorizontal: 20, marginBottom: 16,
  },
  responseBubble: {
    backgroundColor: "rgba(10,8,25,0.82)",
    borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, shadowRadius: 20, elevation: 10,
  },
  responseLogo: { width: 60, height: 20, marginBottom: 10 },
  responseText: {
    fontFamily: "Inter_400Regular", fontSize: 15,
    color: "rgba(255,255,255,0.9)", lineHeight: 24,
  },

  bottomHint: {
    alignItems: "center", paddingHorizontal: 20, gap: 12,
  },
  hintText: {
    fontFamily: "Inter_400Regular", fontSize: 13,
    color: "rgba(255,255,255,0.45)", textAlign: "center",
  },
  stopBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 20, paddingVertical: 8, paddingHorizontal: 16,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.12)",
  },
  stopText: { fontFamily: "Inter_500Medium", fontSize: 13, color: "rgba(255,255,255,0.65)" },
});
