# Blazeycc Mobile

Capacitor-based mobile app for Android. Record your screen while browsing websites.

## Quick Start

### Option A: Prebuilt .so files already in repo (no NDK needed)

If native libraries exist in `jniLibs/`:

```bash
cd mobile
npm install
npm run build
npx cap sync android
npx cap open android
# Click ▶️ Run in Android Studio
```

**Requirements:** Android Studio + SDK 33+ only. No NDK, no CMake, no C++ needed.

### Option B: Native libraries missing (first-time setup)

If `mobile/plugins/local-llm/android/src/main/jniLibs/` is empty, the CI will build them automatically on the next push to `main`. Or build manually:

```bash
# Install Android NDK via Android Studio first
export ANDROID_NDK_HOME="$HOME/Android/Sdk/ndk/25.2.9519653"
cd mobile/plugins/local-llm
./build-native.sh
```

This clones llama.cpp and builds `.so` files for ~3 minutes.

---

## How Native Libraries Are Managed

| Step | What Happens | Who Does It |
|------|-------------|-------------|
| 1. C++ code changes | `build-native-libs.yml` auto-triggers | GitHub Actions |
| 2. Build .so files | NDK + CMake cross-compile for 3 ABIs | GitHub Actions |
| 3. Commit .so files | Commits back to `main` with `[ci skip]` | GitHub Actions bot |
| 4. Anyone clones repo | Gets prebuilt `.so` files | You |
| 5. Build Android app | Gradle picks up `.so` files, no NDK needed | You |

**Result:** Once CI commits the `.so` files, anyone can build the Android app with just Android Studio + SDK.

---

## Architecture

- **Web layer:** HTML/CSS/JS adapted for mobile (touch-friendly, responsive)
- **Native layer:** Custom Capacitor plugins
  - `screen-recorder` — MediaProjection API for screen capture
  - `local-llm` — llama.cpp via JNI for on-device AI

---

## Plugins

### Screen Recorder
Located in `plugins/screen-recorder/`. Uses `MediaProjection` API for native screen recording with H.264 hardware encoding.

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

---

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

---

## Feature Comparison

| Feature | Desktop | Mobile |
|---------|---------|--------|
| URL-to-video | ✅ Direct webview | ✅ Screen recording |
| Annotations | ✅ Canvas overlay | ✅ Canvas overlay |
| Auto-zoom | ✅ CSS transform | ✅ CSS transform |
| Auto-scroll | ✅ | ✅ |
| Zoom controls | ✅ | ✅ |
| Motion blur | ✅ FFmpeg tmix | ❌ No FFmpeg |
| Webcam bubble | ✅ FFmpeg overlay | ❌ Not possible |
| AI (local) | ❌ | ✅ llama.cpp JNI |
| AI (remote) | ✅ Ollama | ✅ Ollama WiFi |
| Batch recording | ✅ | ✅ |
| Scheduled recording | ✅ | ✅ |
| Bookmarks | ✅ | ✅ |
| History | ✅ | ✅ |
| Theme toggle | ✅ | ✅ |

---

## Known Issues

- Android requires screen capture permission every session
- Audio capture uses microphone (system audio requires root)
- iframe CORS may block some websites
- On-device AI is slow (~2-5 tokens/sec) but usable for metadata
- Native libraries must be built once (handled by CI) before local AI works
