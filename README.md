# Blazeycc

**Record any website as video** - Capture demos, tutorials, and presentations as high-quality MP4, WebM, or GIF.

![License](https://img.shields.io/badge/license-GPL--3.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux-lightgrey.svg)

## Features

- 🌐 **Webview Capture** - Record any website directly, no screen sharing needed
- 🎬 **Multiple Formats** - Export as MP4, WebM, or animated GIF
- 📱 **23 Platform Presets** - Optimized for YouTube, Instagram, TikTok, Twitter, and more
- 📜 **Auto-Scroll** - Automatically scroll through long pages while recording
- 👁️ **Preview Before Save** - Review recordings before exporting
- 🔖 **Bookmarks & History** - Save URLs and access recording history
- 🌙 **Dark & Light Mode** - Theme support with system sync

## Download

Download the latest release for your platform:

- **Windows**: [blazeycc-setup-1.0.0.exe](https://github.com/theKennethy/blazeycc/releases/latest)
- **Linux AppImage**: [blazeycc-1.0.0.AppImage](https://github.com/theKennethy/blazeycc/releases/latest)
- **Linux .deb**: [blazeycc_1.0.0_amd64.deb](https://github.com/theKennethy/blazeycc/releases/latest)
- **Linux .rpm**: [blazeycc-1.0.0.x86_64.rpm](https://github.com/theKennethy/blazeycc/releases/latest)

## Development

```bash
# Install dependencies
npm install

# Run in development
npm start

# Build for Linux
npm run build:linux

# Build for Windows
npm run build:win
```

## Tech Stack

- Electron 40
- FFmpeg (via ffmpeg-static)
- MediaRecorder API with webview capture

## License

GPL-3.0 License - see [LICENSE](LICENSE) for details.
