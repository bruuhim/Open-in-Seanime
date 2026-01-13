# Open in Seanime

A Chrome/Edge extension that adds a native **"Open in Seanime"** button to MyAnimeList and AniList anime and manga pages.

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-green?logo=googlechrome)
![Edge Compatible](https://img.shields.io/badge/Edge-Compatible-blue?logo=microsoftedge)

## Preview

| MyAnimeList | AniList |
|-------------|---------|
| ![MAL Preview](assets/preview-mal.png) | ![AniList Preview](assets/preview-anilist.png) |

## Features

- 🔗 **One-click access** — Open any anime or manga directly in your local Seanime instance
- 🔄 **Automatic ID conversion** — Converts MAL IDs to AniList IDs using the AniList GraphQL API
- 🌐 **Multi-site support** — Works on both MyAnimeList and AniList
- 🎨 **Native integration** — Button styling matches each site's theme seamlessly
- ⚙️ **Configurable** — Customize your Seanime URL and port in the options page

## Installation

### From Source (Developer Mode)

1. Download or clone this repository
2. **For Chrome/Edge**: 
   - Rename `manifest.chrome.json` to `manifest.json` (replacing the default one) OR use the build script.
3. Open browser and navigate to `chrome://extensions` (Chrome/Edge) or `about:debugging` (Firefox)
4. Click **Load unpacked** (Chrome) or **Load Temporary Add-on...** (Firefox)
5. Select the `Open in Seanime` folder (select `manifest.json` for Firefox)

### Building Packages

This repository contains a `build.py` script to generate browser-specific zip files for distribution.

1. Ensure you have Python installed.
2. Run: `python build.py`
3. This will generate:
   - `open-in-seanime-firefox.zip` (Uses default `manifest.json`)
   - `open-in-seanime-chrome.zip` (Uses `manifest.chrome.json`)

## Browser Compatibility

| Browser | Manifest File | Background Type |
|---------|---------------|-----------------|
| **Firefox** | `manifest.json` (Default) | Background Script |
| **Chrome/Edge** | `manifest.chrome.json` | Service Worker |

### Userscript Installation (Tampermonkey/Violentmonkey)

If you prefer to use a userscript instead of the browser extension:

1. Install [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/)
2. Click on [open-in-seanime.user.js](open-in-seanime.user.js) in this repository
3. Click **Raw** button on GitHub - your userscript manager will prompt to install
4. Configure settings via the userscript manager menu (default: `http://127.0.0.1:43211`)


## Configuration

1. Right-click the extension icon → **Options** (or go to `chrome://extensions` → Open in Seanime → Details → Extension options)
2. Set your Seanime URL (default: `http://127.0.0.1`)
3. Set your Seanime Port (default: `43211`)
4. Click **Save Settings**

## Usage

1. Navigate to any anime or manga page on:
   - MyAnimeList: `https://myanimelist.net/anime/...` or `https://myanimelist.net/manga/...`
   - AniList: `https://anilist.co/anime/...` or `https://anilist.co/manga/...`
2. Look for the **"Open in Seanime"** button in the sidebar
3. Click to open the entry in your Seanime instance

## How It Works

```
MAL Page → Extract MAL ID → Query AniList API (Anime/Manga) → Get AniList ID → Open Seanime
AniList Page → Extract AniList ID directly → Open Seanime
```

## Credits

- Inspired by [Stremio Movie Search](https://github.com/AliSultan00/Stremio-Movie-Search)
- Button placement logic adapted from [Nyaa Linker](https://github.com/po5/nyaa-linker)
- Built for use with [Seanime](https://seanime.rahim.app/)

## License

MIT License - see [LICENSE](LICENSE) file for details.
