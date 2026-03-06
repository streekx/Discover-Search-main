# StreekX — replit.md

## Overview

StreekX is a mobile-first search engine app built with React Native (Expo). It functions like a full-featured mobile browser and search experience, including:

- A home screen with trending searches and weather widget
- Web search with multiple filter modes (All, Images, Videos, News, Shopping, Books, Maps, AI)
- An in-app browser (WebView-based) with desktop/mobile mode toggle
- An AI assistant that queries a hosted HuggingFace Space backend to summarize web results
- Voice search using `expo-speech-recognition` and `expo-speech`
- Search history and bookmarks (saved items) stored locally via AsyncStorage
- User settings (safe search, incognito mode, region, language, voice language)

The app targets iOS and Android primarily (portrait orientation, no tablet support on iOS). A companion Express server handles API routing and serves a static web landing page in production.

---

## User Preferences

Preferred communication style: Simple, everyday language.

---

## System Architecture

### Frontend (Mobile App)

- **Framework:** React Native via Expo (~54), using the **Expo Router** file-based routing system
- **Navigation structure:**
  - `app/(tabs)/` — tab layout with 4 screens: Home, History, Saved, Settings (tab bar is hidden; navigation is handled manually)
  - `app/search.tsx` — full search results page, pushed as a stack screen
  - `app/browser.tsx` — in-app WebView browser, modal-style from bottom
  - `app/ai-assistant.tsx` — AI chat interface, modal-style from bottom
- **State management:** React Context (`SearchContext`) handles all search state — query, results, history, saved items, filters, and settings. TanStack React Query (`@tanstack/react-query`) is available for server-side data fetching via the Express API.
- **Local persistence:** `@react-native-async-storage/async-storage` stores history, saved items, and settings on-device.
- **Fonts:** Inter (body) and Caveat (accent/handwritten) loaded via `@expo-google-fonts`.
- **UI libraries:** `expo-linear-gradient`, `expo-blur`, `expo-haptics`, `expo-image`, `@expo/vector-icons`, `react-native-gesture-handler`, `react-native-reanimated`, `expo-glass-effect`
- **Keyboard handling:** `react-native-keyboard-controller` with a web-compatible fallback component (`KeyboardAwareScrollViewCompat`)

### Backend (Express Server)

- **Framework:** Express 5 (`server/index.ts`)
- **Purpose:** Serves as an API layer between the mobile app and any server-side logic. Currently routes are minimal (placeholder in `server/routes.ts`).
- **CORS:** Dynamically allows Replit dev/deployment domains and localhost for Expo web dev.
- **Storage layer:** `server/storage.ts` defines an `IStorage` interface with a `MemStorage` in-memory implementation. This is designed to be swapped for a database-backed implementation.
- **Production:** The server is bundled with esbuild and serves a static HTML landing page.

### Database

- **ORM:** Drizzle ORM with PostgreSQL dialect (`drizzle.config.ts`)
- **Schema:** `shared/schema.ts` defines a `users` table (id, username, password) with Drizzle-Zod validation schemas
- **Current state:** The database schema exists but the server-side storage currently uses in-memory storage (`MemStorage`). Postgres integration via `pg` is included in dependencies and ready to wire up.
- **Migrations:** Output to `./migrations/`, managed via `drizzle-kit push`

### AI Integration

- **External AI service:** A HuggingFace Space hosted at `https://streekxkk-streekx.hf.space` handles AI-powered search summarization and the AI assistant chat. Both `context/SearchContext.tsx` and `app/ai-assistant.tsx` call this endpoint directly from the client.

### Voice Features

- **Speech recognition:** `expo-speech-recognition` for voice input
- **Text-to-speech:** `expo-speech` for reading AI responses aloud
- **Permissions:** Microphone and speech recognition permissions declared in `app.json` for both iOS and Android

### Path Aliases

- `@/*` maps to the project root
- `@shared/*` maps to `./shared/` (shared types/schema between server and client)

---

## External Dependencies

| Dependency / Service | Purpose |
|---|---|
| `https://streekxkk-streekx.hf.space` | HuggingFace-hosted AI backend for search summaries and AI assistant |
| `expo-location` + open weather source | Weather widget on the home screen |
| Google Favicon API (`google.com/s2/favicons`) | Favicon images for search results and saved items |
| PostgreSQL (via `pg`) | Primary database (provisioned via `DATABASE_URL` env var) |
| Drizzle ORM | Database schema management and query building |
| AsyncStorage | On-device persistence for history, bookmarks, settings |
| TanStack React Query | Server state/data fetching cache |
| `expo-speech-recognition` / `expo-speech` | Voice input and TTS output |
| `react-native-webview` | In-app browser rendering |
| Expo Router | File-based navigation for React Native |
| Express 5 | Node.js API server |
| esbuild | Server bundle for production |