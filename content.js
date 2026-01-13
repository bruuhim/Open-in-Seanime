// ============================================
// Open in Seanime - Content Script v1.1.0
// Adds native button to MAL and AniList pages
// Supports both anime and manga
// ============================================

const browserAPI = typeof browser !== 'undefined' ? browser : chrome;
// ============================================

const BUTTON_CLASS = 'seanime-btn';

// ============================================
// Media Type Detection
// ============================================

function getMediaType() {
  const path = window.location.pathname;
  if (path.includes('/manga/')) {
    return 'manga';
  }
  return 'anime';
}

// ============================================
// AniList API Query
// ============================================

async function fetchAniListId(malId, mediaType) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { type: 'FETCH_ANILIST_ID', malId: malId, mediaType: mediaType },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error('Open in Seanime: Message error:', chrome.runtime.lastError);
          resolve(null);
        } else {
          resolve(response?.id || null);
        }
      }
    );
  });
}

// ============================================
// Helper: Build Seanime URL based on media type
// ============================================

function buildSeanimeUrl(seanimeHost, aniListId, mediaType) {
  if (mediaType === 'manga') {
    return `${seanimeHost}/manga/entry?id=${aniListId}`;
  }
  return `${seanimeHost}/entry?id=${aniListId}`;
}

// ============================================
// Helper: Wait for element (for SPA like AniList)
// ============================================

function awaitLoadOf(selector, text, callback) {
  return new Promise((resolve) => {
    let found = false;

    const checkElements = () => {
      const elements = document.querySelectorAll(selector);
      for (const elm of elements) {
        if (found) return;
        if (elm.textContent.includes(text)) {
          found = true;
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

  // Match Nyaa Linker styling EXACTLY (lines 466-473)
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

  const settings = await browserAPI.storage.sync.get({
    seanimeUrl: 'http://127.0.0.1',
    seanimePort: '43211'
  });
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

    const settings = await browserAPI.storage.sync.get({
      seanimeUrl: 'http://127.0.0.1',
      seanimePort: '43211'
    });
    const seanimeUrl = `${settings.seanimeUrl}:${settings.seanimePort}`;

    createAniListButton(aniListId, seanimeUrl, mediaType);
  });
}

// ============================================
// Main Initialization
// ============================================

function init() {
  const domain = window.location.hostname;

  if (domain.includes('myanimelist.net')) {
    initMAL();
  } else if (domain.includes('anilist.co')) {
    initAniList();
  }
}

// Run on page load
init();

// Re-run on URL changes (for SPA navigation)
let currentPage = window.location.pathname;
const observer = new MutationObserver(() => {
  if (window.location.pathname !== currentPage) {
    currentPage = window.location.pathname;
    document.querySelectorAll(`.${BUTTON_CLASS}`).forEach(el => el.remove());
    init();
  }
});
observer.observe(document.body, { childList: true, subtree: true });
