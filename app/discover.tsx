import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, Image,
  Platform, RefreshControl, ActivityIndicator, Dimensions, Animated,
  Share, Modal, Pressable, Linking, StatusBar
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useSearch } from "@/context/SearchContext";
import GalaxyBackground from "@/components/GalaxyBackground";

const { width: W } = Dimensions.get("window");
const LOGO = require("@/assets/images/logo.jpg");
const BASE_URL = "https://yesansh-streekx-search-api.hf.space";

const CATEGORIES = [
  { key: "all",           label: "For You",      icon: "star-outline",          query: "trending news today 2025" },
  { key: "news",          label: "News",          icon: "newspaper-outline",     query: "breaking news today 2025" },
  { key: "tech",          label: "Tech",          icon: "hardware-chip-outline", query: "technology artificial intelligence 2025" },
  { key: "sports",        label: "Sports",        icon: "football-outline",      query: "sports cricket football 2025" },
  { key: "entertainment", label: "Entertainment", icon: "film-outline",          query: "bollywood hollywood entertainment 2025" },
  { key: "science",       label: "Science",       icon: "planet-outline",        query: "science discovery space 2025" },
  { key: "business",      label: "Business",      icon: "briefcase-outline",     query: "business economy finance 2025" },
  { key: "health",        label: "Health",        icon: "heart-outline",         query: "health medicine wellness 2025" },
];

interface Article {
  id: string; title: string; url: string; description: string;
  image?: string; icon?: string; source: string;
  published?: string; category: string; video?: boolean;
}

function getDomain(u: string) {
  try { return new URL(u).hostname.replace("www.", ""); } catch { return ""; }
}
function getFav(u: string) {
  return `https://www.google.com/s2/favicons?domain=${getDomain(u)}&sz=64`;
}
function timeAgo(s?: string) {
  if (!s) return "Now";
  try {
    const d = Date.now() - new Date(s).getTime();
    const m = Math.floor(d / 60000);
    if (m < 1) return "Now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  } catch { return "Now"; }
}
function validUrl(u?: string) {
  if (!u) return false;
  try { new URL(u); return true; } catch { return false; }
}
function mapItem(item: any, idx: number, cat: string): Article {
  return {
    id: `${cat}-${idx}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: item.title || "Untitled",
    url: item.url || item.link || "",
    description: (item.description && item.description !== "No description." && item.description !== "N/A")
      ? item.description.trim() : "",
    image: item.image_url || item.image || item.thumbnail || item.media || undefined,
    icon: item.icon || undefined,
    source: item.source || getDomain(item.url || item.link || "") || "Source",
    published: item.published || item.date || undefined,
    category: cat,
    video: !!item.video,
  };
}
async function fetchCategory(cat: string, query: string, region: string): Promise<Article[]> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 25000);
  try {
    if (cat === "all") {
      const r = await fetch(`${BASE_URL}/discover`, { signal: ctrl.signal, headers: { Accept: "application/json" } });
      clearTimeout(t);
      if (r.ok) {
        const d = await r.json();
        const raw: any[] = Array.isArray(d) ? d : (d.results || d.data || []);
        if (raw.length > 0) return raw.filter(i => i.title && i.url).map((i, idx) => mapItem(i, idx, cat));
      }
    }
    const r2 = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(query)}&filter=news&region=${region}`, {
      signal: ctrl.signal, headers: { Accept: "application/json" },
    });
    clearTimeout(t);
    if (!r2.ok) return [];
    const d2 = await r2.json();
    const raw2: any[] = Array.isArray(d2) ? d2 : (d2.results || d2.data || []);
    return raw2.filter(i => i.title && i.url).map((i, idx) => mapItem(i, idx, cat));
  } catch { clearTimeout(t); return []; }
}

function FeaturedCard({ item, onPress }: { item: Article; onPress: () => void }) {
  const [imgErr, setImgErr] = useState(false);
  const [favErr, setFavErr] = useState(false);
  const hasImg = validUrl(item.image) && !imgErr;
  return (
    <TouchableOpacity style={s.featCard} onPress={onPress} activeOpacity={0.92}>
      {hasImg ? (
        <Image source={{ uri: item.image }} style={StyleSheet.absoluteFillObject} resizeMode="cover" onError={() => setImgErr(true)} />
      ) : (
        <LinearGradient colors={["#0F1B33", "#1E3A5F"]} style={StyleSheet.absoluteFillObject} />
      )}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.25)", "rgba(0,0,0,0.88)"]}
        style={[StyleSheet.absoluteFillObject, { justifyContent: "flex-end", padding: 18 }]}
        start={{ x: 0, y: 0.3 }} end={{ x: 0, y: 1 }}
      >
        <View style={s.featSourceRow}>
          {!favErr && (
            <Image source={{ uri: item.icon || getFav(item.url) }} style={s.featFav} onError={() => setFavErr(true)} />
          )}
          <Text style={s.featSource}>{item.source}</Text>
          <View style={s.dot} />
          <Text style={s.featTime}>{timeAgo(item.published)}</Text>
          {item.video && (
            <View style={s.videoBadge}>
              <Ionicons name="play-circle" size={11} color="#fff" />
              <Text style={s.videoBadgeText}>Video</Text>
            </View>
          )}
        </View>
        <Text style={s.featTitle} numberOfLines={3}>{item.title}</Text>
        {!!item.description && (
          <Text style={s.featDesc} numberOfLines={2}>{item.description}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

function ArticleCard({ item, onPress, onShare, onMore }: {
  item: Article; onPress: () => void; onShare: () => void; onMore: () => void;
}) {
  const [imgErr, setImgErr] = useState(false);
  const [favErr, setFavErr] = useState(false);
  const hasImg = validUrl(item.image) && !imgErr;
  const showThumb = hasImg;

  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.88}>
      <View style={s.cardInner}>
        <View style={s.cardContent}>
          <View style={s.cardSourceRow}>
            {!favErr && (
              <Image source={{ uri: item.icon || getFav(item.url) }} style={s.favicon} onError={() => setFavErr(true)} />
            )}
            <Text style={s.sourceName} numberOfLines={1}>{item.source}</Text>
            <View style={s.dotSmall} />
            <Text style={s.timeText}>{timeAgo(item.published)}</Text>
          </View>
          <Text style={s.cardTitle} numberOfLines={showThumb ? 3 : 4}>{item.title}</Text>
          {!showThumb && !!item.description && (
            <Text style={s.cardDesc} numberOfLines={2}>{item.description}</Text>
          )}
        </View>
        {showThumb && (
          <Image source={{ uri: item.image }} style={s.cardThumb} resizeMode="cover" onError={() => setImgErr(true)} />
        )}
      </View>
      <View style={s.cardFooter}>
        <View style={s.cardFooterLeft}>
          {item.video && (
            <View style={s.videoBadge}>
              <Ionicons name="play-circle" size={11} color="#6EB4FF" />
              <Text style={[s.videoBadgeText, { color: "#6EB4FF" }]}>Video</Text>
            </View>
          )}
        </View>
        <View style={s.cardFooterRight}>
          <TouchableOpacity onPress={onShare} style={s.actionBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="share-outline" size={18} color="rgba(255,255,255,0.45)" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onMore} style={s.actionBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="ellipsis-horizontal" size={18} color="rgba(255,255,255,0.45)" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function SkeletonCard() {
  const anim = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(anim, { toValue: 0.8, duration: 800, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 0.4, duration: 800, useNativeDriver: true }),
    ])).start();
  }, []);
  return (
    <Animated.View style={[s.card, { opacity: anim }]}>
      <View style={[s.skeletonImg]} />
      <View style={{ padding: 14, gap: 8 }}>
        <View style={s.skeletonLine} />
        <View style={[s.skeletonLine, { width: "80%" }]} />
        <View style={[s.skeletonLine, { width: "60%" }]} />
      </View>
    </Animated.View>
  );
}

function MoreMenu({ visible, item, onClose, onSave, onOpen }: {
  visible: boolean; item: Article | null; onClose: () => void; onSave: () => void; onOpen: () => void;
}) {
  if (!item) return null;
  const rows = [
    { icon: "open-outline", label: "Open in browser", action: onOpen },
    { icon: "bookmark-outline", label: "Save article", action: onSave },
    { icon: "share-outline", label: "Share", action: () => { Share.share({ title: item.title, message: item.url, url: item.url }); onClose(); } },
    { icon: "eye-off-outline", label: "Not interested", action: onClose },
  ];
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.overlay} onPress={onClose}>
        <View style={s.sheet}>
          <View style={s.sheetHandle} />
          <Text style={s.sheetTitle} numberOfLines={2}>{item.title}</Text>
          {rows.map((r, i) => (
            <TouchableOpacity key={i} style={s.sheetRow} onPress={r.action}>
              <View style={s.sheetIcon}>
                <Ionicons name={r.icon as any} size={20} color="rgba(255,255,255,0.85)" />
              </View>
              <Text style={s.sheetRowText}>{r.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const { settings, saveItem } = useSearch();
  const [activeCategory, setActiveCategory] = useState("all");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [moreItem, setMoreItem] = useState<Article | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const topPad = Platform.OS === "web" ? 60 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const loadArticles = useCallback(async (cat: string, isRefresh = false) => {
    if (!isRefresh) { setLoading(true); fadeAnim.setValue(0); }
    setError(null);
    const catInfo = CATEGORIES.find(c => c.key === cat) || CATEGORIES[0];
    const items = await fetchCategory(cat, catInfo.query, settings.region || "wt-wt");
    if (items.length === 0) {
      setError("Could not load articles. Pull to retry.");
    } else {
      setArticles(items);
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
    }
    setLoading(false);
    setRefreshing(false);
  }, [settings.region, fadeAnim]);

  useEffect(() => { loadArticles(activeCategory); }, [activeCategory]);

  const openItem = (item: Article) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (settings.openLinksInApp !== false) {
      router.push({ pathname: "/browser", params: { url: item.url } });
    } else {
      Linking.openURL(item.url);
    }
  };

  const featured = articles[0] || null;
  const rest = articles.slice(1);

  return (
    <View style={[s.container, { paddingTop: topPad }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <GalaxyBackground />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="rgba(255,255,255,0.85)" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Discover</Text>
          <Text style={s.headerSub}>Real-time news & stories</Text>
        </View>
        <Image source={LOGO} style={s.headerLogo} resizeMode="contain" />
        <TouchableOpacity
          style={s.refreshBtn}
          onPress={() => { setRefreshing(true); loadArticles(activeCategory, true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
        >
          <Ionicons name="refresh-outline" size={20} color="#6EB4FF" />
        </TouchableOpacity>
      </View>

      {/* Category chips */}
      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={c => c.key}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.catRow}
        style={s.catList}
        renderItem={({ item: cat }) => {
          const active = activeCategory === cat.key;
          return (
            <TouchableOpacity
              style={[s.catChip, active && s.catChipOn]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveCategory(cat.key); }}
            >
              <Ionicons name={cat.icon as any} size={13} color={active ? "#FFF" : "rgba(255,255,255,0.5)"} />
              <Text style={[s.catLabel, active && s.catLabelOn]}>{cat.label}</Text>
            </TouchableOpacity>
          );
        }}
      />

      {loading ? (
        <FlatList
          data={[1, 2, 3, 4]}
          keyExtractor={i => `sk-${i}`}
          contentContainerStyle={[s.listContent, { paddingBottom: botPad + 28 }]}
          renderItem={() => <SkeletonCard />}
          showsVerticalScrollIndicator={false}
        />
      ) : error ? (
        <View style={s.errorWrap}>
          <Ionicons name="cloud-offline-outline" size={56} color="rgba(255,255,255,0.25)" />
          <Text style={s.errorTitle}>No stories loaded</Text>
          <Text style={s.errorMsg}>{error}</Text>
          <TouchableOpacity style={s.retryBtn} onPress={() => loadArticles(activeCategory)}>
            <Text style={s.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Animated.FlatList
          data={rest}
          keyExtractor={item => item.id}
          contentContainerStyle={[s.listContent, { paddingBottom: botPad + 28 }]}
          showsVerticalScrollIndicator={false}
          style={{ opacity: fadeAnim }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); loadArticles(activeCategory, true); }}
              tintColor="#6EB4FF"
              colors={["#6EB4FF"]}
            />
          }
          ListHeaderComponent={
            featured ? <FeaturedCard item={featured} onPress={() => openItem(featured)} /> : null
          }
          ListEmptyComponent={
            <View style={s.emptyWrap}>
              <Ionicons name="newspaper-outline" size={52} color="rgba(255,255,255,0.2)" />
              <Text style={s.emptyText}>No articles found</Text>
              <TouchableOpacity style={s.retryBtn} onPress={() => loadArticles(activeCategory)}>
                <Text style={s.retryText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <ArticleCard
              item={item}
              onPress={() => openItem(item)}
              onShare={async () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                await Share.share({ title: item.title, message: item.url, url: item.url });
              }}
              onMore={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMoreItem(item); }}
            />
          )}
        />
      )}

      <MoreMenu
        visible={!!moreItem}
        item={moreItem}
        onClose={() => setMoreItem(null)}
        onSave={() => { if (moreItem) saveItem({ ...moreItem, media: moreItem.image }); setMoreItem(null); }}
        onOpen={() => { if (moreItem) openItem(moreItem); setMoreItem(null); }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#05050A" },

  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 14, paddingBottom: 10, gap: 8,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 20, color: "#FFF" },
  headerSub: { fontFamily: "Inter_400Regular", fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 1 },
  headerLogo: { width: 60, height: 28 },
  refreshBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "rgba(110,180,255,0.1)",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "rgba(110,180,255,0.2)",
  },

  catList: { maxHeight: 52 },
  catRow: { paddingHorizontal: 14, gap: 8, alignItems: "center", paddingVertical: 8 },
  catChip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingVertical: 7, paddingHorizontal: 13, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
  },
  catChipOn: { backgroundColor: "#1A5FBB", borderColor: "#1E6FD9" },
  catLabel: { fontFamily: "Inter_500Medium", fontSize: 12, color: "rgba(255,255,255,0.5)" },
  catLabelOn: { color: "#FFF" },

  listContent: { paddingHorizontal: 14, paddingTop: 10 },

  featCard: {
    borderRadius: 20, overflow: "hidden", height: 260,
    marginBottom: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5, shadowRadius: 16, elevation: 10,
  },
  featSourceRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  featFav: { width: 16, height: 16, borderRadius: 4 },
  featSource: { fontFamily: "Inter_600SemiBold", fontSize: 12, color: "rgba(255,255,255,0.9)" },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: "rgba(255,255,255,0.5)" },
  dotSmall: { width: 2.5, height: 2.5, borderRadius: 1.25, backgroundColor: "rgba(255,255,255,0.3)", marginHorizontal: 2 },
  featTime: { fontFamily: "Inter_400Regular", fontSize: 11, color: "rgba(255,255,255,0.65)" },
  featTitle: { fontFamily: "Inter_700Bold", fontSize: 19, color: "#FFF", lineHeight: 26, marginBottom: 7 },
  featDesc: { fontFamily: "Inter_400Regular", fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 18 },
  videoBadge: {
    flexDirection: "row", alignItems: "center", gap: 3,
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingVertical: 2, paddingHorizontal: 6, borderRadius: 6, marginLeft: "auto",
  },
  videoBadgeText: { fontFamily: "Inter_600SemiBold", fontSize: 10, color: "#fff" },

  card: {
    backgroundColor: "rgba(255,255,255,0.065)",
    borderRadius: 16, marginBottom: 10,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.09)",
    overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  cardInner: { flexDirection: "row", padding: 14, gap: 12 },
  cardContent: { flex: 1 },
  cardSourceRow: { flexDirection: "row", alignItems: "center", marginBottom: 7 },
  favicon: { width: 16, height: 16, borderRadius: 4, marginRight: 6 },
  sourceName: { fontFamily: "Inter_500Medium", fontSize: 12, color: "rgba(255,255,255,0.5)", flex: 1 },
  timeText: { fontFamily: "Inter_400Regular", fontSize: 11, color: "rgba(255,255,255,0.35)" },
  cardTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: "#FFF", lineHeight: 20 },
  cardDesc: { fontFamily: "Inter_400Regular", fontSize: 12, color: "rgba(255,255,255,0.58)", lineHeight: 17, marginTop: 5 },
  cardThumb: {
    width: 90, height: 90, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  cardFooter: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 14, paddingVertical: 8,
    borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.07)",
  },
  cardFooterLeft: { flex: 1, flexDirection: "row", alignItems: "center" },
  cardFooterRight: { flexDirection: "row", alignItems: "center", gap: 4 },
  actionBtn: { padding: 5 },

  skeletonImg: {
    height: 160, backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 16, marginBottom: 0,
  },
  skeletonLine: {
    height: 12, borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.07)", width: "100%",
  },

  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14 },

  errorWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 32 },
  errorTitle: { fontFamily: "Inter_600SemiBold", fontSize: 18, color: "#FFF" },
  errorMsg: { fontFamily: "Inter_400Regular", fontSize: 14, color: "rgba(255,255,255,0.55)", textAlign: "center" },

  emptyWrap: { alignItems: "center", justifyContent: "center", paddingTop: 60, gap: 16 },
  emptyText: { fontFamily: "Inter_500Medium", fontSize: 16, color: "rgba(255,255,255,0.5)" },
  retryBtn: {
    backgroundColor: "#1E6FD9", borderRadius: 14,
    paddingVertical: 11, paddingHorizontal: 28,
  },
  retryText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: "#FFF" },

  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#0E0E1E", borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingTop: 12, paddingHorizontal: 20, paddingBottom: 36,
    borderTopWidth: 1, borderColor: "rgba(255,255,255,0.09)",
  },
  sheetHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.18)", alignSelf: "center", marginBottom: 18,
  },
  sheetTitle: {
    fontFamily: "Inter_600SemiBold", fontSize: 14,
    color: "rgba(255,255,255,0.75)", marginBottom: 18, paddingHorizontal: 4,
  },
  sheetRow: {
    flexDirection: "row", alignItems: "center", gap: 14,
    paddingVertical: 14, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.07)",
  },
  sheetIcon: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.07)",
    alignItems: "center", justifyContent: "center",
  },
  sheetRowText: { fontFamily: "Inter_500Medium", fontSize: 15, color: "rgba(255,255,255,0.85)" },
});
