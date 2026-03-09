import React, { useState, useEffect, useRef } from "react";
import {
  View, StyleSheet, TouchableOpacity, Image,
  Animated, Dimensions
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import Colors from "@/constants/colors";

interface DiscoverItem {
  id: string;
  title: string;
  image: string;
}

const SAMPLE_DISCOVER_ITEMS: DiscoverItem[] = [
  {
    id: "1",
    title: "AI Breakthroughs",
    image: "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1",
  },
  {
    id: "2",
    title: "Space Exploration",
    image: "https://images.pexels.com/photos/87651/earth-blue-planet-globe-planet-87651.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1",
  },
  {
    id: "3",
    title: "Market Trends",
    image: "https://images.pexels.com/photos/3938022/pexels-photo-3938022.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1",
  },
  {
    id: "4",
    title: "Tech Innovation",
    image: "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1",
  },
  {
    id: "5",
    title: "Climate",
    image: "https://images.pexels.com/photos/3951969/pexels-photo-3951969.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1",
  }
];

const { width } = Dimensions.get("window");
const TILE_SIZE = 120;

export default function DynamicDiscoverTile() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [items, setItems] = useState<DiscoverItem[]>(SAMPLE_DISCOVER_ITEMS);
  const [hasImage, setHasImage] = useState(true);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef<NodeJS.Timeout>();

  const currentItem = items[currentIndex];

  useEffect(() => {
    fetchTrendingItems();
  }, []);

  useEffect(() => {
    if (items.length === 0) {
      setHasImage(false);
      return;
    }

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 6000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [items.length]);

  async function fetchTrendingItems() {
    try {
      const BASE_URL = "https://streekxkk-streekx.hf.space";
      const res = await fetch(`${BASE_URL}/search?q=trending+today&filter=news`, {
        signal: AbortSignal.timeout(8000),
      });

      if (res.ok) {
        const data = await res.json();
        const results = Array.isArray(data) ? data : data.results || [];

        if (results.length > 0) {
          const trendingItems: DiscoverItem[] = results.slice(0, 5).map((item: any, idx: number) => ({
            id: item.url || `trending-${idx}`,
            title: item.title || "",
            image: item.image || SAMPLE_DISCOVER_ITEMS[idx % SAMPLE_DISCOVER_ITEMS.length].image,
          }));

          setItems(trendingItems);
          setHasImage(true);
        } else {
          setItems([]);
          setHasImage(false);
        }
      }
    } catch {
      setItems(SAMPLE_DISCOVER_ITEMS);
      setHasImage(true);
    }
  }

  function handleTileTap() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/discover");
  }

  if (!hasImage || items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <LinearGradient
          colors={["rgba(162,210,255,0.2)", "rgba(30,111,217,0.1)"]}
          style={styles.emptyTile}
        />
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handleTileTap}
      activeOpacity={0.85}
    >
      {/* Back layered square */}
      <View style={[styles.layeredSquare, styles.backLayer]} />

      {/* Front main tile */}
      <View style={[styles.layeredSquare, styles.frontLayer]}>
        <Image
          source={{ uri: currentItem.image }}
          style={styles.backgroundImage}
          resizeMode="cover"
        />

        {/* Dark gradient overlay at bottom for text readability */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.4)"]}
          style={styles.bottomGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    position: "relative",
  },
  emptyContainer: {
    width: TILE_SIZE,
    height: TILE_SIZE,
  },
  emptyTile: {
    flex: 1,
    borderRadius: 16,
  },
  layeredSquare: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: 16,
    overflow: "hidden",
  },
  backLayer: {
    position: "absolute",
    bottom: -6,
    right: -6,
    backgroundColor: "rgba(162,210,255,0.3)",
    borderWidth: 1,
    borderColor: "rgba(162,210,255,0.2)",
  },
  frontLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
  },
  bottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
  },
});
