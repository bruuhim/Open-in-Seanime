// ============================================
// Open in Seanime - Background Script
// Handles API requests to bypass CSP
// ============================================

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'FETCH_ANILIST_ID') {
        fetchAniListId(request.malId, request.mediaType)
            .then(id => sendResponse({ id: id }))
            .catch(error => {
                console.error('Open in Seanime: Background fetch error:', error);
                sendResponse({ id: null, error: error.message });
            });
        return true; // Keep the message channel open for sendResponse
    }
});

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
