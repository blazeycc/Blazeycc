# Blazeycc Mobile

Capacitor-based mobile app for Android. Record your screen while browsing websites.

## Architecture

- **Web layer:** Existing HTML/CSS/JS adapted for mobile (touch-friendly, responsive)
- **Native layer:** Custom Capacitor plugins using MediaProjection (screen record) + llama.cpp (on-device AI)
- **Recording:** Native screen capture, not canvas-based

## Prerequisites

```bash
cd mobile
npm install
```

## Android Setup

### 1. Clone llama.cpp (required for on-device AI)

```bash
cd mobile/plugins/local-llm/android/src/main/cpp
git clone https://github.com/ggerganov/llama.cpp.git
cd llama.cpp
git checkout b4000  # stable release around late 2024
cd ../../../../../../../..
```

### 2. Add Android platform

```bash
npx cap add android
npx cap sync android
npx cap open android
```

Then build in Android Studio. Requires Android SDK 33+ and NDK 25+.

## Development (Web)

```bash
npm run dev
```

## Build for Production

```bash
npm run build
npx cap sync android
```

## Plugins

### Screen Recorder
Located in `plugins/screen-recorder/`. Uses `MediaProjection` API for native screen capture with H.264 hardware encoding.

```typescript
ScreenRecorder.startRecording(): Promise<{ started: boolean }>
ScreenRecorder.stopRecording(): Promise<{ path: string }>
```

### Local LLM
Located in `plugins/local-llm/`. Uses llama.cpp via JNI for on-device AI inference.

```typescript
LocalLlm.downloadModel({ url, filename }): Promise<{ success: boolean }>
LocalLlm.loadModel({ path }): Promise<{ success: boolean }>
LocalLlm.generate({ prompt, maxTokens, temperature }): Promise<{ text: string }>
```

## AI Backends

The mobile app supports **two AI backends**:

### 1. On-Device (Local) — Default
Runs qwen2.5 directly on your phone using llama.cpp.
- **Pros:** Works offline, no WiFi needed, private
- **Cons:** First download ~1.1GB, slower (2-5 tokens/sec)
- **Setup:** Download model in app → Load → Generate

### 2. Ollama on Desktop (Remote)
Connects to Ollama running on your laptop via WiFi.
- **Pros:** Faster, same model as desktop
- **Cons:** Requires laptop on same network
- **Setup:** On laptop run `OLLAMA_HOST=0.0.0.0:11434 ollama serve`, then enter laptop IP in app

## Feature Comparison

| Feature | Desktop | Mobile |
|---------|---------|--------|
| URL-to-video | ✅ Direct webview capture | ✅ Screen recording |
| Annotations | ✅ Canvas overlay | ✅ Canvas overlay |
| Auto-zoom | ✅ CSS transform | ✅ CSS transform |
| Auto-scroll | ✅ | ✅ |
| Zoom controls | ✅ | ✅ |
| Motion blur | ✅ FFmpeg tmix | ❌ Not possible |
| Webcam bubble | ✅ FFmpeg overlay | ❌ Not possible |
| AI (local) | ❌ | ✅ llama.cpp JNI |
| AI (remote) | ✅ Ollama | ✅ Ollama WiFi |
| Batch recording | ✅ | ✅ |
| Scheduled recording | ✅ | ✅ |
| Bookmarks | ✅ | ✅ |
| History | ✅ | ✅ |
| Theme toggle | ✅ | ✅ |

## Differences from Desktop

1. **No embedded browser** — Uses iframe (limited by CORS)
2. **Native screen recording** — Captures entire screen via MediaProjection
3. **Mobile-optimized presets** — Defaults to 9:16 (Shorts/Reels/TikTok)
4. **Touch UI** — Bottom sheet settings, floating action button, swipe gestures
5. **Native share** — System share sheet to TikTok/Instagram/Reels

## Known Issues

- Android requires screen capture permission every session
- Audio capture uses microphone (system audio requires root)
- iframe CORS may block some websites
- On-device AI is slow (~2-5 tokens/sec) but usable for metadata
