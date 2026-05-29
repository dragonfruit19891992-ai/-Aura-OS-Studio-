/**
 * AuraRadio — Persistent Holographic Broadcast Engine
 * Pure client-side index & control layer. 100% Legal.
 */

(function () {
  // Ensure we run on client-side browser environments only
  if (typeof window === 'undefined') return;

  // Global state holding elements
  let audioEl = null;
  let capsuleEl = null;
  let panelEl = null;
  let overlayEl = null;

  // Active Station memory
  let nowPlaying = null;
  let isPlaying = false;
  let volume = 0.8;
  let muted = false;
  let currentGenre = 'all';
  let currentCountry = 'CA';
  let searchQ = '';
  let activeTab = 'external';

  // Fallback API servers for public radio directory
  const API_SERVERS = [
    'https://de1.api.radio-browser.info',
    'https://nl1.api.radio-browser.info',
    'https://at1.api.radio-browser.info'
  ];

  // Country lists for selector
  const COUNTRIES = [
    { code: '',   label: '🌍 Global' },
    { code: 'CA', label: '🇨🇦 Canada' },
    { code: 'US', label: '🇺🇸 United States' },
    { code: 'GB', label: '🇬🇧 United Kingdom' },
    { code: 'FR', label: '🇫🇷 France' },
    { code: 'DE', label: '🇩🇪 Germany' },
    { code: 'IT', label: '🇮🇹 Italy' },
    { code: 'ES', label: '🇪🇸 Spain' }
  ];

  // Genre quick filters
  const GENRES = [
    { id: 'all', label: 'All Genres', emoji: '🎵' },
    { id: 'pop', label: 'Pop', emoji: '🎤' },
    { id: 'hip hop', label: 'Hip Hop', emoji: '🎧' },
    { id: 'rock', label: 'Rock', emoji: '🎸' },
    { id: 'jazz', label: 'Jazz', emoji: '🎷' },
    { id: 'classical', label: 'Classical', emoji: '🎻' },
    { id: 'lofi', label: 'Lo-Fi', emoji: '☁️' },
    { id: 'news', label: 'News', emoji: '📰' }
  ];

  // Simulated internal AURA Live talk shows
  const MOCK_AURA_CHANNELS = [
    { id: 'live-1', name: 'Lofi Beats to Code/Relax', djName: 'DJ Bouchard', listeners: 142, genre: 'Lo-Fi', url: 'https://icecast.radiofrance.fr/fip-midfi.mp3' },
    { id: 'live-2', name: 'Sovereign Network Open Mic', djName: 'Echo Bouchard', listeners: 89, genre: 'Talk', url: 'https://icecast.radiofrance.fr/franceinter-midfi.mp3' }
  ];

  const MOCK_AURA_SCHEDULES = [
    { id: 'sch-1', show: 'Friday Night Jazz Live', dj: 'Marcus Bouchard', genre: 'Jazz', time: 'Tonight 9:00 PM EST' },
    { id: 'sch-2', show: 'Pebble AI Ethics Panel', dj: 'Sarah Bouchard', genre: 'Talk', time: 'Tomorrow 2:00 PM EST' }
  ];

  // Fetch stations client-side from directory API
  async function queryStations(name, cc, tag) {
    const params = { limit: '25', order: 'clickcount', reverse: 'true', hidebroken: 'true' };
    if (cc) params.countrycode = cc;
    if (tag && tag !== 'all') params.tagList = tag;
    if (name) params.name = name;

    const qs = new URLSearchParams(params).toString();
    for (const server of API_SERVERS) {
      try {
        const response = await fetch(`${server}/json/stations/search?${qs}`, {
          headers: { 'User-Agent': 'AuraRadio/1.0 (aurame.ca)' }
        });
        if (response.ok) return await response.json();
      } catch (err) {
        console.warn(`Radio API server ${server} failed, trying fallback...`);
      }
    }
    return [];
  }

  // Set up Audio element
  function initAudio() {
    if (!window.__AURA_RADIO_AUDIO__) {
      window.__AURA_RADIO_AUDIO__ = new Audio();
    }
    audioEl = window.__AURA_RADIO_AUDIO__;

    // Load state from local storage if available
    const savedStateStr = localStorage.getItem('aura_radio_state');
    if (savedStateStr) {
      try {
        const saved = JSON.parse(savedStateStr);
        volume = saved.volume ?? 0.8;
        muted = saved.muted ?? false;
        audioEl.volume = muted ? 0 : volume;

        if (saved.isPlaying && saved.nowPlaying) {
          nowPlaying = saved.nowPlaying;
          audioEl.src = nowPlaying.url_resolved ?? nowPlaying.url;
          
          // Trigger autoplay (supported after user domain interaction)
          audioEl.play().then(() => {
            isPlaying = true;
            updateCapsuleUI();
          }).catch(err => {
            console.log("AURA Radio waiting for user click to resume continuous audio.");
            isPlaying = false;
            updateCapsuleUI();
          });
        }
      } catch (e) {
        console.error("Failed to restore radio state", e);
      }
    }

    // Audio Event listeners to update UI
    audioEl.addEventListener('play', () => {
      isPlaying = true;
      saveCurrentState();
      updateCapsuleUI();
    });

    audioEl.addEventListener('pause', () => {
      isPlaying = false;
      saveCurrentState();
      updateCapsuleUI();
    });

    audioEl.addEventListener('error', () => {
      console.warn("Station audio stream timed out or was broken.");
      isPlaying = false;
      capsuleEl.classList.remove('loading');
      saveCurrentState();
      updateCapsuleUI();
    });

    audioEl.addEventListener('loadstart', () => {
      capsuleEl.classList.add('loading');
    });

    audioEl.addEventListener('canplay', () => {
      capsuleEl.classList.remove('loading');
    });
  }

  function saveCurrentState() {
    const state = {
      nowPlaying,
      isPlaying,
      volume,
      muted
    };
    localStorage.setItem('aura_radio_state', JSON.stringify(state));
  }

  // Play a specific station
  function playStation(station) {
    nowPlaying = station;
    audioEl.src = station.url_resolved ?? station.url;
    audioEl.play()
      .then(() => {
        isPlaying = true;
        updateCapsuleUI();
        saveCurrentState();
      })
      .catch(() => {
        isPlaying = false;
        updateCapsuleUI();
      });
  }

  // Toggle Play/Pause
  function togglePlayback(e) {
    if (e) e.stopPropagation();
    if (!nowPlaying) {
      // Pick a default station if none selected
      openPanel();
      return;
    }
    if (isPlaying) {
      audioEl.pause();
    } else {
      audioEl.play().catch(() => {});
    }
  }

  // Toggle Mute
  function toggleMuted(e) {
    if (e) e.stopPropagation();
    muted = !muted;
    audioEl.volume = muted ? 0 : volume;
    const muteIcon = document.getElementById('aura-radio-mute-btn');
    if (muteIcon) {
      muteIcon.innerHTML = muted 
        ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>`
        : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`;
    }
    saveCurrentState();
  }

  // Open sidebar panel
  function openPanel() {
    panelEl.classList.add('active');
    overlayEl.classList.add('active');
    renderStationList();
  }

  // Close sidebar panel
  function closePanel() {
    panelEl.classList.remove('active');
    overlayEl.classList.remove('active');
  }

  // Render lists based on selected tabs
  async function renderStationList() {
    const listContainer = document.getElementById('aura-radio-list');
    if (!listContainer) return;

    if (activeTab === 'internal') {
      // Simulate AURA Live tab
      listContainer.innerHTML = `
        <div class="aura-radio-live-banner">
          <div class="aura-radio-pulse-circle"></div>
          <div style="flex:1;">
            <p style="font-family:'Outfit',sans-serif; font-size:0.85rem; font-weight:900; color:#fff; margin:0 0 2px;">Start Your AURA Station</p>
            <p style="font-size:0.68rem; color:#94a3b8; margin:0;">Broadcast your mic or DJ sets legally to the entire AURA family grid.</p>
          </div>
          <button class="aura-radio-btn-live" id="aura-radio-golive-btn">Go Live</button>
        </div>
        
        <p style="font-family:'Outfit',sans-serif; font-size:0.8rem; font-weight:800; text-transform:uppercase; color:#c084fc; margin-bottom:0.5rem; letter-spacing:0.04em;">🔴 Active Live Streams</p>
        <div style="display:flex; flex-direction:column; gap:0.5rem; margin-bottom:1.5rem;">
          ${MOCK_AURA_CHANNELS.map(ch => `
            <div class="aura-radio-card ${nowPlaying && nowPlaying.id === ch.id ? 'active' : ''}" data-id="${ch.id}">
              <div class="aura-radio-card-avatar">📻</div>
              <div class="aura-radio-card-body">
                <div class="aura-radio-card-title">${ch.name}</div>
                <div class="aura-radio-card-meta">
                  <span>🎙️ ${ch.djName}</span>
                  <span class="aura-radio-card-tag">${ch.genre}</span>
                  <span style="color:#10b981; font-weight:800;">● ${ch.listeners} listening</span>
                </div>
              </div>
              <div class="aura-radio-card-play">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              </div>
            </div>
          `).join('')}
        </div>

        <p style="font-family:'Outfit',sans-serif; font-size:0.8rem; font-weight:800; text-transform:uppercase; color:#94a3b8; margin-bottom:0.5rem; letter-spacing:0.04em;">📅 Upcoming Show Schedules</p>
        <div class="aura-radio-schedule-list">
          ${MOCK_AURA_SCHEDULES.map(sch => `
            <div class="aura-radio-schedule-card">
              <div style="display:flex; justify-content:between; align-items:center; width:100%; margin-bottom:4px;">
                <span style="font-size:0.75rem; font-weight:800; color:#fff;">${sch.show}</span>
                <span style="font-size:0.62rem; color:#c084fc; background:rgba(192,132,252,0.1); padding:1px 6px; border-radius:99px; margin-left:auto;">${sch.genre}</span>
              </div>
              <div style="display:flex; align-items:center; gap:6px; font-size:0.65rem; color:#64748b; font-weight:600;">
                <span>🎙️ Host: ${sch.dj}</span>
                <span>•</span>
                <span style="color:#94a3b8;">${sch.time}</span>
              </div>
            </div>
          `).join('')}
        </div>
      `;

      // Attach click listeners for simulated channels
      MOCK_AURA_CHANNELS.forEach(ch => {
        const card = listContainer.querySelector(`[data-id="${ch.id}"]`);
        if (card) {
          card.addEventListener('click', () => {
            playStation(ch);
          });
        }
      });

      // Live simulation click
      const goLiveBtn = document.getElementById('aura-radio-golive-btn');
      if (goLiveBtn) {
        goLiveBtn.addEventListener('click', () => {
          alert("🎙️ Microphone capture initialized. Connecting websocket stream tunnel to AURA server grid...\n\nYour AURA node is now live and broadcasting peer-to-peer! You can close this panel and browse; the stream remains active.");
          const customChannel = {
            id: 'live-broadcaster',
            name: 'My Broadcast Station',
            djName: 'You (Sovereign Node)',
            listeners: 1,
            genre: 'Talk',
            url: 'https://icecast.radiofrance.fr/fip-midfi.mp3'
          };
          playStation(customChannel);
          renderStationList();
        });
      }
      return;
    }

    // Default external directory search path
    listContainer.innerHTML = `
      <div style="display:flex; justify-content:center; padding:2rem 0;">
        <svg class="loading-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
      </div>
    `;

    const results = await queryStations(searchQ, currentCountry, currentGenre);
    if (results.length === 0) {
      listContainer.innerHTML = `
        <div style="text-align:center; padding:3rem 0; color:#64748b;">
          <p style="font-size:0.85rem; font-weight:700;">No live stations found.</p>
          <p style="font-size:0.75rem; margin-top:2px;">Try adjusting search keywords or changing filters.</p>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = results.map(s => {
      const active = nowPlaying && nowPlaying.stationuuid === s.stationuuid;
      const cleanTags = s.tags ? s.tags.split(',').slice(0,2).map(t => t.trim()).filter(Boolean) : [];
      return `
        <div class="aura-radio-card ${active ? 'active' : ''}" data-uuid="${s.stationuuid}">
          <div class="aura-radio-card-avatar">${active ? '🔊' : '📻'}</div>
          <div class="aura-radio-card-body">
            <div class="aura-radio-card-title">${s.name}</div>
            <div class="aura-radio-card-meta">
              <span>🌐 ${s.countrycode || 'Int'}</span>
              ${cleanTags.map(t => `<span class="aura-radio-card-tag">${t}</span>`).join('')}
              ${s.bitrate > 0 ? `<span>${s.bitrate}kbps</span>` : ''}
            </div>
          </div>
          <div class="aura-radio-card-play">
            ${active && isPlaying 
              ? `<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2.5"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`
              : `<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`}
          </div>
        </div>
      `;
    }).join('');

    // Attach click events to play selected station
    results.forEach(s => {
      const card = listContainer.querySelector(`[data-uuid="${s.stationuuid}"]`);
      if (card) {
        card.addEventListener('click', () => {
          if (nowPlaying && nowPlaying.stationuuid === s.stationuuid) {
            togglePlayback();
          } else {
            playStation(s);
          }
          renderStationList();
        });
      }
    });
  }

  // Update layout inside capsule
  function updateCapsuleUI() {
    if (!capsuleEl) return;

    if (isPlaying) {
      capsuleEl.classList.add('playing');
    } else {
      capsuleEl.classList.remove('playing');
    }

    const titleEl = capsuleEl.querySelector('.aura-radio-title');
    const subtitleEl = capsuleEl.querySelector('.aura-radio-subtitle');
    const playBtnEl = document.getElementById('aura-radio-play-btn');

    if (nowPlaying) {
      titleEl.innerText = nowPlaying.name;
      subtitleEl.innerText = nowPlaying.countrycode 
        ? `LIVE — ${nowPlaying.countrycode}` 
        : `LIVE — AURA`;
    } else {
      titleEl.innerText = "AuraRadio Broadcast";
      subtitleEl.innerText = "Select Channel";
    }

    if (playBtnEl) {
      playBtnEl.innerHTML = isPlaying
        ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`
        : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
    }
  }

  // Build and insert player DOM
  function injectRadioDOM() {
    // 1. Floating Capsule Element
    capsuleEl = document.createElement('div');
    capsuleEl.className = 'aura-radio-capsule';
    capsuleEl.innerHTML = `
      <div class="aura-radio-visualizer">
        <div class="aura-radio-bar"></div>
        <div class="aura-radio-bar"></div>
        <div class="aura-radio-bar"></div>
        <div class="aura-radio-bar"></div>
      </div>
      <div class="aura-radio-info">
        <span class="aura-radio-title">AuraRadio Broadcast</span>
        <span class="aura-radio-subtitle">Select Channel</span>
      </div>
      <div class="aura-radio-controls">
        <button class="aura-radio-btn" id="aura-radio-play-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        </button>
        <button class="aura-radio-btn" id="aura-radio-mute-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
        </button>
      </div>
    `;
    document.body.appendChild(capsuleEl);

    // 2. Sliding Panel Overlay
    overlayEl = document.createElement('div');
    overlayEl.className = 'aura-radio-panel-overlay';
    document.body.appendChild(overlayEl);

    // 3. Sliding Catalogue Panel
    panelEl = document.createElement('div');
    panelEl.className = 'aura-radio-panel';
    panelEl.innerHTML = `
      <div class="aura-radio-panel-header">
        <span class="aura-radio-panel-title">AuraRadio Catalogue</span>
        <button class="aura-radio-btn" id="aura-radio-panel-close" style="width:28px; height:28px;">&times;</button>
      </div>

      <div class="aura-radio-tabs">
        <button class="aura-radio-tab active" id="aura-radio-tab-ext">🌍 Live Stations</button>
        <button class="aura-radio-tab" id="aura-radio-tab-int">🎙️ AURA Live</button>
      </div>

      <!-- Search Box (Visible for External tab) -->
      <div class="aura-radio-search-box" id="aura-radio-search-container">
        <div class="aura-radio-search-input-wrap">
          <svg class="aura-radio-search-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" id="aura-radio-query" class="aura-radio-search-input" placeholder="Search stations by name...">
        </div>
        <div class="aura-radio-filters-row">
          <select id="aura-radio-country" class="aura-radio-select">
            ${COUNTRIES.map(c => `<option value="${c.code}" ${c.code === currentCountry ? 'selected' : ''}>${c.label}</option>`).join('')}
          </select>
          <select id="aura-radio-genre" class="aura-radio-select">
            ${GENRES.map(g => `<option value="${g.id}" ${g.id === currentGenre ? 'selected' : ''}>${g.label}</option>`).join('')}
          </select>
        </div>
      </div>

      <!-- Genre Pills tags row (Visible for External tab) -->
      <div class="aura-radio-tags-row" id="aura-radio-pills-container">
        ${GENRES.map(g => `<span class="aura-radio-tag-pill ${g.id === currentGenre ? 'active' : ''}" data-genre="${g.id}">${g.emoji} ${g.label}</span>`).join('')}
      </div>

      <!-- Scrollable Station Catalog -->
      <div class="aura-radio-list" id="aura-radio-list"></div>

      <!-- Volume Controls at bottom of sidebar -->
      <div class="aura-radio-volume-container">
        <span style="font-size:0.65rem; color:#64748b; font-weight:800; text-transform:uppercase; letter-spacing:0.04em;">🔈 Vol</span>
        <input type="range" class="aura-radio-volume-slider" id="aura-radio-vol-slider" min="0" max="1" step="0.05" value="${volume}">
      </div>
    `;
    document.body.appendChild(panelEl);

    // Event hooks
    capsuleEl.addEventListener('click', openPanel);

    document.getElementById('aura-radio-play-btn').addEventListener('click', togglePlayback);
    document.getElementById('aura-radio-mute-btn').addEventListener('click', toggleMuted);
    document.getElementById('aura-radio-panel-close').addEventListener('click', closePanel);
    overlayEl.addEventListener('click', closePanel);

    // Sidebar volume slider
    const volSlider = document.getElementById('aura-radio-vol-slider');
    volSlider.addEventListener('input', (e) => {
      volume = parseFloat(e.target.value);
      audioEl.volume = muted ? 0 : volume;
      saveCurrentState();
    });

    // Tab listeners
    const tabExt = document.getElementById('aura-radio-tab-ext');
    const tabInt = document.getElementById('aura-radio-tab-int');
    const searchContainer = document.getElementById('aura-radio-search-container');
    const pillsContainer = document.getElementById('aura-radio-pills-container');

    tabExt.addEventListener('click', () => {
      activeTab = 'external';
      tabExt.classList.add('active');
      tabInt.classList.remove('active');
      searchContainer.style.display = 'flex';
      pillsContainer.style.display = 'flex';
      renderStationList();
    });

    tabInt.addEventListener('click', () => {
      activeTab = 'internal';
      tabInt.classList.add('active');
      tabExt.classList.remove('active');
      searchContainer.style.display = 'none';
      pillsContainer.style.display = 'none';
      renderStationList();
    });

    // Search and filters triggers
    const queryInput = document.getElementById('aura-radio-query');
    const ccInput = document.getElementById('aura-radio-country');
    const genreSelect = document.getElementById('aura-radio-genre');

    const handleSearchChange = () => {
      searchQ = queryInput.value.trim();
      currentCountry = ccInput.value;
      currentGenre = genreSelect.value;
      
      // Update quick tag pill states
      document.querySelectorAll('.aura-radio-tag-pill').forEach(pill => {
        if (pill.getAttribute('data-genre') === currentGenre) {
          pill.classList.add('active');
        } else {
          pill.classList.remove('active');
        }
      });
      renderStationList();
    };

    queryInput.addEventListener('input', debounce(handleSearchChange, 350));
    ccInput.addEventListener('change', handleSearchChange);
    genreSelect.addEventListener('change', handleSearchChange);

    // Quick tag pills clicks
    document.querySelectorAll('.aura-radio-tag-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        currentGenre = pill.getAttribute('data-genre');
        genreSelect.value = currentGenre;
        handleSearchChange();
      });
    });
  }

  // Simple debounce helper
  function debounce(func, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => func.apply(this, args), delay);
    };
  }

  // Load components when DOM is fully built
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      injectRadioDOM();
      initAudio();
    });
  } else {
    injectRadioDOM();
    initAudio();
  }
})();
