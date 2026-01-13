// ==UserScript==
// @name         Open in Seanime
// @namespace    https://github.com/bruuhim/Open-in-Seanime
// @version      1.2.0
// @description  Adds a button to MyAnimeList and AniList pages to open them in your local Seanime instance
// @author       bruuhim
// @match        *://*.myanimelist.net/anime/*
// @match        *://*.myanimelist.net/manga/*
// @match        *://*.anilist.co/anime/*
// @match        *://*.anilist.co/manga/*
// @icon         https://raw.githubusercontent.com/bruuhim/Open-in-Seanime/main/icons/seanime.png
// @homepageURL  https://github.com/bruuhim/Open-in-Seanime
// @supportURL   https://github.com/bruuhim/Open-in-Seanime/issues
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM.registerMenuCommand
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @license      MIT
// @run-at       document-end
// ==/UserScript==

// ============================================
// Constants
// ============================================

const BUTTON_CLASS = 'seanime-button';

// ============================================
// Settings Management
// ============================================

// GreaseMonkey 4.x shim
let getValue;
if (typeof GM_getValue === 'undefined' && typeof GM !== 'undefined') {
    self.GM_setValue = GM.setValue;
    self.GM_registerMenuCommand = GM.registerMenuCommand;
    getValue = GM.getValue;
} else {
    getValue = function (key, fallback) {
        return new Promise(function (resolve, reject) {
            try {
                resolve(GM_getValue(key, fallback));
            }
            catch (e) {
                reject(e);
            }
        });
    };
}

let settings;

const defaultSettings = {
    seanimeUrl: 'http://127.0.0.1',
    seanimePort: '43211'
};

if (typeof GM_registerMenuCommand !== 'undefined') {
    GM_registerMenuCommand('Open in Seanime Settings', () => {
        if (document.getElementById('seanime-settings')) return;
        const settingsPanel = document.createElement('div');
        settingsPanel.id = 'seanime-settings';
        settingsPanel.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: hsl(0, 0%, 10%);
            color: hsl(0, 0%, 87%);
            padding: 20px;
            border: 1px solid hsl(210, 100%, 60%);
            z-index: 10000;
            font-family: Verdana, Arial;
            font-size: 11px;
            line-height: 16px;
        `;

        settingsPanel.innerHTML = `
            <h3 style="margin-bottom: 15px;">Open in Seanime Settings</h3>
            <div style="display: grid; grid-template-columns: auto auto; gap: 10px; margin-bottom: 15px;">
                <label for="seanime-url-input">Seanime URL:</label>
                <input type="text" id="seanime-url-input" value="${settings.seanimeUrl}" style="width: 200px;">
                <label for="seanime-port-input">Seanime Port:</label>
                <input type="text" id="seanime-port-input" value="${settings.seanimePort}" style="width: 200px;">
            </div>
            <button id="seanime-save-button" style="width: 100%; cursor: pointer; background: hsl(210, 100%, 60%); color: hsl(0, 0%, 10%); padding: 5px;">Save and Close</button>
        `;

        document.body.appendChild(settingsPanel);

        document.getElementById('seanime-save-button').onclick = () => {
            const newSettings = {
                seanimeUrl: document.getElementById('seanime-url-input').value,
                seanimePort: document.getElementById('seanime-port-input').value
            };
            GM_setValue('settings', newSettings);
            settings = newSettings;
            settingsPanel.remove();
            document.querySelectorAll('.' + BUTTON_CLASS).forEach((e) => e.remove());
            init();
        };
    });
}

// ============================================
// Helper Functions
// ============================================

function getMediaType() {
    const path = window.location.pathname;
    if (path.includes('/manga/')) {
        return 'manga';
    }
    return 'anime';
}

function buildSeanimeUrl(seanimeHost, aniListId, mediaType) {
    if (mediaType === 'manga') {
        return `${seanimeHost}/manga/entry?id=${aniListId}`;
    }
    return `${seanimeHost}/entry?id=${aniListId}`;
}

async function fetchAniListId(malId, mediaType) {
    const type = mediaType === 'manga' ? 'MANGA' : 'ANIME';

    const query = `
    query ($malId: Int, $type: MediaType) {
      Media(idMal: $malId, type: $type) {
        id
      }
    }
  `;

    try {
        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query: query,
                variables: { malId: malId, type: type }
            })
        });

        const data = await response.json();
        return data?.data?.Media?.id || null;
    } catch (error) {
        console.error('Open in Seanime: Fetch failed', error);
        return null;
    }
}

function awaitLoadOf(selector, text, callback) {
    return new Promise((resolve) => {
        const checkElements = () => {
            const elms = document.querySelectorAll(selector);
            for (let elm of elms) {
                if (elm.textContent.includes(text)) {
                    resolve(elm);
                    callback();
                    return true;
                }
            }
            return false;
        };

        if (checkElements()) return;

        const observer = new MutationObserver(() => {
            if (checkElements()) {
                observer.disconnect();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    });
}

// ============================================
// Button Creation - MAL
// ============================================

function createMALButton(aniListId, seanimeUrl, mediaType, isError = false) {
    // Remove existing button if any
    document.querySelectorAll(`.${BUTTON_CLASS}`).forEach(el => el.remove());

    // Find insertion point (same as Nyaa Linker)
    const btnSpace = document.getElementById('broadcast-block') ||
        document.querySelector('.leftside')?.children[0];

    if (!btnSpace) {
        console.log('Open in Seanime: Could not find MAL sidebar');
        return null;
    }

    const btn = document.createElement('a');
    btn.classList.add(BUTTON_CLASS);
    // Use the native MAL button class (same as Nyaa Linker)
    btn.classList.add('left-info-block-broadcast-button');
    btn.textContent = isError ? 'Not Found on Seanime' : 'Open in Seanime';
    btn.target = '_blank';

    // Nyaa Linker only adds marginTop, rest comes from MAL's native class
    btn.style.marginTop = '4px';

    // Ensure text decoration is removed for link element
    btn.style.textDecoration = 'none';

    if (!isError) {
        btn.href = buildSeanimeUrl(seanimeUrl, aniListId, mediaType);
    } else {
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
    }

    btnSpace.appendChild(btn);
    return btn;
}

// ============================================
// Button Creation - AniList
// ============================================

function createAniListButton(aniListId, seanimeUrl, mediaType, isError = false) {
    // Remove existing button if any
    document.querySelectorAll(`.${BUTTON_CLASS}`).forEach(el => el.remove());

    // Find insertion point (same as Nyaa Linker)
    const btnSpace = document.querySelector('.cover-wrap-inner');

    if (!btnSpace) {
        console.log('Open in Seanime: Could not find AniList sidebar');
        return null;
    }

    const btn = document.createElement('a');
    btn.classList.add(BUTTON_CLASS);
    btn.textContent = isError ? 'Not Found on Seanime' : 'Open in Seanime';
    btn.target = '_blank';

    // Match Nyaa Linker styling EXACTLY (lines 466-473) + font fix
    btn.style.display = 'flex';
    btn.style.alignItems = 'center';
    btn.style.justifyContent = 'center';
    btn.style.height = '35px';
    btn.style.borderRadius = '3px';
    btn.style.marginBottom = '20px';
    btn.style.background = 'rgb(var(--color-blue))';
    btn.style.color = 'rgb(var(--color-white))';
    btn.style.fontFamily = 'Overpass, -apple-system, BlinkMacSystemFont, "Segoe UI", Oxygen, Ubuntu, Cantarell, "Helvetica Neue", Arial, sans-serif';

    if (!isError) {
        btn.href = buildSeanimeUrl(seanimeUrl, aniListId, mediaType);
    } else {
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
    }

    btnSpace.appendChild(btn);
    return btn;
}

// ============================================
// Site-specific Initialization
// ============================================

async function initMAL() {
    const mediaType = getMediaType();
    const idRegex = mediaType === 'manga' ? /\/manga\/(\d+)/ : /\/anime\/(\d+)/;
    const match = window.location.pathname.match(idRegex);

    if (!match) {
        console.log(`Open in Seanime: No MAL ${mediaType} ID found in URL`);
        return;
    }

    const malId = parseInt(match[1], 10);
    console.log(`Open in Seanime: Found MAL ${mediaType} ID:`, malId);

    const seanimeUrl = `${settings.seanimeUrl}:${settings.seanimePort}`;

    try {
        const aniListId = await fetchAniListId(malId, mediaType);

        if (aniListId) {
            console.log('Open in Seanime: Found AniList ID:', aniListId);
            createMALButton(aniListId, seanimeUrl, mediaType);
        } else {
            console.log('Open in Seanime: AniList ID not found');
            createMALButton(null, null, mediaType, true);
        }
    } catch (error) {
        console.error('Open in Seanime: Error fetching AniList ID:', error);
        createMALButton(null, null, mediaType, true);
    }
}

async function initAniList() {
    const mediaType = getMediaType();

    // Wait for sidebar to load (AniList is a SPA)
    awaitLoadOf('.sidebar .type', 'Romaji', async () => {
        const idRegex = mediaType === 'manga' ? /\/manga\/(\d+)/ : /\/anime\/(\d+)/;
        const match = window.location.pathname.match(idRegex);

        if (!match) {
            console.log(`Open in Seanime: No AniList ${mediaType} ID found in URL`);
            return;
        }

        const aniListId = parseInt(match[1], 10);
        console.log(`Open in Seanime: Found AniList ${mediaType} ID:`, aniListId);

        const seanimeUrl = `${settings.seanimeUrl}:${settings.seanimePort}`;

        createAniListButton(aniListId, seanimeUrl, mediaType);
    });
}

// ============================================
// Main Initialization
// ============================================

function init() {
    const domain = window.location.href;

    if (domain.includes('myanimelist.net')) {
        initMAL();
    } else if (domain.includes('anilist.co')) {
        initAniList();
    }
}

// ============================================
// Entry Point
// ============================================

getValue('settings', defaultSettings).then((v) => {
    settings = v;
    let currentPage = window.location.href.split('/')[4];
    init();

    // Watch for SPA navigation on AniList
    const observer = new MutationObserver(() => {
        if (window.location.href.split('/')[4] !== currentPage) {
            currentPage = window.location.href.split('/')[4];
            document.querySelectorAll('.' + BUTTON_CLASS).forEach((e) => e.remove());
            init();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
});
