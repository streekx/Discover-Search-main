import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  Animated
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import Colors from "@/constants/colors";

interface DiscoverItem {
  id: string;
  title: string;
  image: string;
  query: string;
  category: string;
}

const SAMPLE_DISCOVER_ITEMS: DiscoverItem[] = [
  {
    id: "1",
    title: "Latest AI Breakthroughs",
    image: "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1",
    query: "AI News",
    category: "Technology"
  },
  {
    id: "2",
    title: "Space Exploration Updates",
    image: "https://images.pexels.com/photos/87651/earth-blue-planet-globe-planet-87651.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1",
    query: "Space News",
    category: "Science"
  },
  {
    id: "3",
    title: "Market Trends Today",
    image: "https://images.pexels.com/photos/3938022/pexels-photo-3938022.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1",
    query: "Stock Market",
    category: "Finance"
  },
  {
    id: "4",
    title: "Tech Innovation Today",
    image: "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1",
    query: "Tech Today",
    category: "Technology"
  },
  {
    id: "5",
    title: "Climate & Environment",
    image: "https://images.pexels.com/photos/3951969/pexels-photo-3951969.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1",
    query: "Climate",
    category: "Environment"
  }
];

export default function DynamicDiscoverTile() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [items, setItems] = useState<DiscoverItem[]>(SAMPLE_DISCOVER_ITEMS);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef<NodeJS.Timeout>();

  const currentItem = items[currentIndex];

  useEffect(() => {
    fetchTrendingItems();
  }, []);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [items.length, slideAnim]);

  async function fetchTrendingItems() {
    try {
      const BASE_URL = "https://streekxkk-streekx.hf.space";
      const res = await fetch(`${BASE_URL}/search?q=trending+news&filter=news`, {
        signal: AbortSignal.timeout(8000),
      });

      if (res.ok) {
        const data = await res.json();
        const results = Array.isArray(data) ? data : data.results || [];

        if (results.length > 0) {
          const trendingItems: DiscoverItem[] = results.slice(0, 5).map((item: any, idx: number) => ({
            id: item.url || `trending-${idx}`,
            title: item.title || `Trending ${idx + 1}`,
            image: item.image || SAMPLE_DISCOVER_ITEMS[idx % SAMPLE_DISCOVER_ITEMS.length].image,
            query: item.title || `Trend ${idx}`,
            category: item.source || "News"
          }));

          setItems(trendingItems);
        }
      }
    } catch {
      setItems(SAMPLE_DISCOVER_ITEMS);
    }
  }

  function handleTileTap() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: "/search", params: { q: currentItem.query, filter: "all" } });
  }

  function handleNext() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentIndex((prev) => (prev + 1) % items.length);
    slideAnim.setValue(0);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }

  const opacity = slideAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.5, 1, 1],
  });

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handleTileTap}
      activeOpacity={0.9}
    >
      <View style={styles.tileWrapper}>
        <Image
          source={{ uri: currentItem.image }}
          style={styles.backgroundImage}
          resizeMode="cover"
        />

        <LinearGradient
          colors={["rgba(30,111,217,0.95)", "rgba(30,111,217,0.7)", "rgba(30,111,217,0.5)"]}
          style={styles.overlay}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />

        <View style={styles.glassmorphism}>
          <LinearGradient
            colors={["rgba(255,255,255,0.25)", "rgba(255,255,255,0.1)"]}
            style={styles.glassGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </View>

        <View style={styles.contentWrapper}>
          <Animated.View style={[styles.content, { opacity }]}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{currentItem.category}</Text>
            </View>

            <Text style={styles.title} numberOfLines={2}>
              {currentItem.title}
            </Text>

            <View style={styles.indicators}>
              {items.map((_, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.dot,
                    idx === currentIndex && styles.dotActive,
                  ]}
                />
              ))}
            </View>
          </Animated.View>
        </View>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-forward" size={16} color="#FFF" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 52,
    height: 52,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: Colors.light.tint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  tileWrapper: {
    flex: 1,
    position: "relative",
    borderRadius: 16,
    overflow: "hidden",
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
  },
  glassmorphism: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.3)",
    overflow: "hidden",
  },
  glassGradient: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
    padding: 8,
    justifyContent: "flex-end",
    zIndex: 2,
  },
  content: {
    gap: 6,
  },
  categoryBadge: {
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 7,
    alignSelf: "flex-start",
    backdropFilter: "blur(10px)",
  },
  categoryText: {
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    color: "#FFF",
    letterSpacing: 0.3,
  },
  title: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: "#FFF",
    lineHeight: 14,
  },
  indicators: {
    flexDirection: "row",
    gap: 3,
    marginTop: 3,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  dotActive: {
    backgroundColor: "#FFF",
    width: 8,
  },
  nextButton: {
    position: "absolute",
    bottom: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3,
  },
});
