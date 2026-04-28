const { appWindow, LogicalSize, WebviewWindow } = window.__TAURI__.window;

const WINDOW_WIDTH = 336;
const WINDOW_HEIGHT = 296;

const STORAGE_KEYS = {
  showSeconds: 'cw_showSeconds',
  use24h: 'cw_use24h',
  timeZone: 'cw_timeZone',
  alwaysOnTop: 'cw_alwaysOnTop',
  style: 'cw_style',
  pinned: 'cw_pinned',
};

const THEMES = {
  classic: 'theme-classic',
  liquidLight: 'theme-liquid-light',
  minimal: 'theme-minimal',
};

const FALLBACK_TIMEZONES = [
  'UTC',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Warsaw',
  'Europe/Kyiv',
  'Europe/Moscow',
  'Europe/Istanbul',
  'Europe/Tbilisi',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Bangkok',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
  'Pacific/Auckland',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Anchorage',
  'America/Sao_Paulo',
];

const TIMEZONE_ALIASES = {
  tbilisi: 'Europe/Tbilisi',
  london: 'Europe/London',
  paris: 'Europe/Paris',
  berlin: 'Europe/Berlin',
  warsaw: 'Europe/Warsaw',
  kyiv: 'Europe/Kyiv',
  kiev: 'Europe/Kyiv',
  moscow: 'Europe/Moscow',
  istanbul: 'Europe/Istanbul',
  dubai: 'Asia/Dubai',
  kolkata: 'Asia/Kolkata',
  bangkok: 'Asia/Bangkok',
  singapore: 'Asia/Singapore',
  tokyo: 'Asia/Tokyo',
  sydney: 'Australia/Sydney',
  auckland: 'Pacific/Auckland',
  'new york': 'America/New_York',
  chicago: 'America/Chicago',
  denver: 'America/Denver',
  'los angeles': 'America/Los_Angeles',
  anchorage: 'America/Anchorage',
  'sao paulo': 'America/Sao_Paulo',
  'sao-paulo': 'America/Sao_Paulo',
  utc: 'UTC',
};

// DOM refs
const widget = document.getElementById('widget');
const ctxMenu = document.getElementById('ctxMenu');
const tzOverlay = document.getElementById('tzOverlay');
const tzSearch = document.getElementById('tzSearch');
const tzList = document.getElementById('tzList');

const windowKeyPrefix = `${appWindow.label}_`;

// --- Storage helpers ---

function loadBool(key, fallback) {
  const value = localStorage.getItem(windowKeyPrefix + key);
  if (value === null) return fallback;
  return value === 'true';
}

function saveBool(key, value) {
  localStorage.setItem(windowKeyPrefix + key, value ? 'true' : 'false');
}

function loadString(key, fallback) {
  const value = localStorage.getItem(windowKeyPrefix + key);
  return value === null ? fallback : value;
}

function saveString(key, value) {
  localStorage.setItem(windowKeyPrefix + key, value);
}

// --- Timezone utilities ---

function safeResolvedTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  } catch (_) {
    return null;
  }
}

function uniqueTimeZones(list) {
  const seen = new Set();
  const output = [];
  for (const tz of list) {
    if (!tz || typeof tz !== 'string' || seen.has(tz)) continue;
    seen.add(tz);
    output.push(tz);
  }
  return output;
}

function getTimeZones() {
  try {
    if (typeof Intl.supportedValuesOf === 'function') {
      return uniqueTimeZones(Intl.supportedValuesOf('timeZone'));
    }
  } catch (_) {}

  const localTz = safeResolvedTimeZone();
  return uniqueTimeZones([localTz, ...FALLBACK_TIMEZONES].filter(Boolean));
}

function getTimeZoneNameShort(timeZone, now) {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'short',
    }).formatToParts(now);
    return parts.find((part) => part.type === 'timeZoneName')?.value || null;
  } catch (_) {
    return null;
  }
}

function shortTimeZoneLabel(tz) {
  if (!tz) return '-';
  if (tz === 'UTC') return 'UTC';
  return (tz.split('/').pop() || tz).replaceAll('_', ' ');
}

function fullTimeZoneLabel(tz) {
  if (!tz) return '-';
  if (tz === 'UTC') return 'UTC';
  return tz.split('/').slice(1).join(' / ').replaceAll('_', ' ');
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeQuery(value) {
  return value.toLowerCase().replaceAll('_', ' ').replaceAll('/', ' ').trim();
}

function matchesTimeZone(query, tz) {
  if (!query) return true;
  const normalizedTz = normalizeQuery(tz);
  const city = normalizeQuery(shortTimeZoneLabel(tz));
  if (normalizedTz.includes(query) || city.includes(query)) return true;

  for (const [alias, aliasTz] of Object.entries(TIMEZONE_ALIASES)) {
    if (aliasTz !== tz) continue;
    if (alias.includes(query)) return true;
  }

  return false;
}

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// --- App state ---
// Centralised mutable state; avoids polluting the global scope with loose variables.

const state = {
  showSeconds: loadBool(STORAGE_KEYS.showSeconds, true),
  use24h: loadBool(STORAGE_KEYS.use24h, false),
  alwaysOnTop: loadBool(STORAGE_KEYS.alwaysOnTop, false),
  pinned: loadBool(STORAGE_KEYS.pinned, false),
  timeZone: loadString(STORAGE_KEYS.timeZone, safeResolvedTimeZone() || 'UTC'),
  widgetStyle: loadString(STORAGE_KEYS.style, 'classic'),
  sizeSyncScheduled: false,
  filteredZones: [],
};

// --- Theme ---

function applyTheme() {
  const themeClass = THEMES[state.widgetStyle] || THEMES.classic;
  document.body.classList.remove(...Object.values(THEMES));
  document.body.classList.add(themeClass);
}

function setWidgetStyle(nextStyle) {
  if (!THEMES[nextStyle]) return;
  state.widgetStyle = nextStyle;
  saveString(STORAGE_KEYS.style, nextStyle);
  applyTheme();
  refreshMenuLabels();
}

async function applyWindowMode() {
  try {
    await appWindow.setAlwaysOnTop(state.alwaysOnTop);
    refreshMenuLabels();
  } catch (error) {
    console.error('Failed to update always-on-top mode', error);
  }
}

function refreshMenuLabels() {
  document.getElementById('toggleSeconds').textContent = state.showSeconds ? 'Hide seconds' : 'Show seconds';
  document.getElementById('toggle24h').textContent = state.use24h ? '12h format' : '24h format';
  document.getElementById('toggleOnTop').textContent = state.alwaysOnTop ? 'Always on top: On' : 'Always on top: Off';
  document.getElementById('windowModeState').textContent = state.alwaysOnTop ? 'Always on top: On' : 'Always on top: Off';
  document.getElementById('togglePin').textContent = state.pinned ? 'Pin widget: On' : 'Pin widget: Off';
  widget.classList.toggle('pinned', state.pinned);
  document.getElementById('styleClassic').classList.toggle('active', state.widgetStyle === 'classic');
  document.getElementById('styleLiquidLight').classList.toggle('active', state.widgetStyle === 'liquidLight');
  document.getElementById('styleMinimal').classList.toggle('active', state.widgetStyle === 'minimal');
}

// --- Clock ---

function updateClock() {
  const now = new Date();
  const hourOption = state.use24h ? '2-digit' : 'numeric';
  let timeParts = {};

  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: state.timeZone,
      hour: hourOption,
      minute: '2-digit',
      second: '2-digit',
      hour12: !state.use24h,
    });

    for (const part of formatter.formatToParts(now)) {
      if (part.type === 'literal') continue;
      timeParts[part.type] = part.value;
    }
  } catch (_) {
    timeParts = { hour: '--', minute: '--', second: '--', dayPeriod: '' };
  }

  document.getElementById('time').childNodes[0].textContent = `${timeParts.hour}:${timeParts.minute}`;
  document.getElementById('secs').textContent = `:${timeParts.second}`;
  document.getElementById('secs').style.display = state.showSeconds ? 'inline' : 'none';
  document.getElementById('ampm').style.display = state.use24h ? 'none' : 'inline';
  document.getElementById('ampm').nextElementSibling.style.display = state.use24h ? 'none' : '';
  document.getElementById('ampm').textContent = timeParts.dayPeriod || '';

  try {
    document.getElementById('date').textContent = new Intl.DateTimeFormat('en-US', {
      timeZone: state.timeZone,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(now);
  } catch (_) {
    document.getElementById('date').textContent = '-';
  }

  const tzOffset = getTimeZoneNameShort(state.timeZone, now);
  const tzLabel = document.getElementById('tzLabel');
  tzLabel.textContent = fullTimeZoneLabel(state.timeZone);
  tzLabel.title = state.timeZone;
  document.getElementById('currentTz').textContent =
    `Time zone: ${state.timeZone}${tzOffset ? ` (${tzOffset})` : ''}`;
}

// --- Window size sync ---

async function syncWindowSize() {
  try {
    await appWindow.setSize(new LogicalSize(WINDOW_WIDTH, WINDOW_HEIGHT));
  } catch (error) {
    console.error('Failed to sync window size', error);
  }
}

function scheduleWindowSizeSync() {
  if (state.sizeSyncScheduled) return;
  state.sizeSyncScheduled = true;

  requestAnimationFrame(async () => {
    state.sizeSyncScheduled = false;
    await syncWindowSize();
  });
}

// --- Context menu ---

function showContextMenu() {
  const widgetRect = widget.getBoundingClientRect();
  ctxMenu.classList.add('show');
  ctxMenu.style.visibility = 'hidden';
  ctxMenu.style.left = '0px';
  ctxMenu.style.top = '0px';

  const menuRect = ctxMenu.getBoundingClientRect();
  const left = widgetRect.left + (widgetRect.width - menuRect.width) / 2;
  const gap = 10;
  const spaceAbove = widgetRect.top - gap;
  const spaceBelow = window.innerHeight - widgetRect.bottom - gap;
  const prefersBelow = spaceBelow >= menuRect.height || spaceBelow > spaceAbove;
  const top = prefersBelow
    ? widgetRect.bottom + gap
    : widgetRect.top - menuRect.height - gap;

  ctxMenu.scrollTop = 0;
  ctxMenu.style.left = `${clamp(left, 10, window.innerWidth - menuRect.width - 10)}px`;
  ctxMenu.style.top = `${clamp(top, 10, window.innerHeight - menuRect.height - 10)}px`;
  ctxMenu.style.visibility = '';
}

// --- Timezone picker ---

function openTzPicker() {
  ctxMenu.classList.remove('show');
  tzOverlay.classList.add('show');
  tzOverlay.setAttribute('aria-hidden', 'false');
  tzSearch.value = '';
  renderTzList();
  setTimeout(() => tzSearch.focus(), 0);
}

function closeTzPicker() {
  tzOverlay.classList.remove('show');
  tzOverlay.setAttribute('aria-hidden', 'true');
}

function setTimeZone(nextTimeZone) {
  state.timeZone = nextTimeZone;
  saveString(STORAGE_KEYS.timeZone, nextTimeZone);
  updateClock();
  renderTzList();
  tzSearch.value = fullTimeZoneLabel(nextTimeZone);
}

function renderTzList() {
  const query = normalizeQuery(tzSearch.value);
  const now = new Date();
  const zones = getTimeZones().filter((tz) => matchesTimeZone(query, tz));
  state.filteredZones = zones;

  tzList.innerHTML = '';
  for (const tz of zones) {
    const item = document.createElement('div');
    item.className = `tz-item${tz === state.timeZone ? ' selected' : ''}`;
    item.setAttribute('data-tz', tz);

    const check = document.createElement('div');
    check.className = 'check';

    const name = document.createElement('div');
    name.className = 'tz-name';
    name.textContent = tz;
    name.title = tz;

    const offset = document.createElement('div');
    offset.className = 'tz-offset';
    offset.textContent = getTimeZoneNameShort(tz, now) || '';

    item.appendChild(check);
    item.appendChild(name);
    item.appendChild(offset);
    tzList.appendChild(item);
  }
}

// --- Event binding helper ---

function bindMenuAction(elementId, handler) {
  document.getElementById(elementId).addEventListener('click', async (event) => {
    event.stopPropagation();
    ctxMenu.classList.remove('show');
    await handler(event);
  });
}

// --- Event listeners ---

document.addEventListener('contextmenu', (event) => {
  event.preventDefault();
  if (tzOverlay.classList.contains('show')) return;
  showContextMenu();
});

ctxMenu.addEventListener('mousedown', (event) => {
  event.stopPropagation();
});

ctxMenu.addEventListener('click', (event) => {
  event.stopPropagation();
});

document.addEventListener('click', (event) => {
  if (event.target.closest('#ctxMenu')) return;
  ctxMenu.classList.remove('show');
});

bindMenuAction('addWidget', async () => {
  // Separate inner try so a position failure still creates the widget with a safe fallback.
  let x = 80;
  let y = 80;
  try {
    const pos = await appWindow.outerPosition();
    x = pos.x + 28;
    y = pos.y + 28;
  } catch (_) {}

  try {
    const label = `widget-${Date.now()}`;
    new WebviewWindow(label, {
      url: 'index.html',
      title: 'Clock Widget',
      width: WINDOW_WIDTH,
      height: WINDOW_HEIGHT,
      resizable: false,
      fullscreen: false,
      decorations: false,
      transparent: true,
      alwaysOnTop: false,
      skipTaskbar: true,
      focus: true,
      x,
      y,
    });
  } catch (error) {
    console.error('Failed to create widget', error);
  }
});

bindMenuAction('togglePin', async () => {
  state.pinned = !state.pinned;
  saveBool(STORAGE_KEYS.pinned, state.pinned);
  refreshMenuLabels();
});

widget.addEventListener('mousedown', async (event) => {
  if (state.pinned || event.button !== 0) return;
  if (event.target.closest('#tzLabel')) return;
  try {
    await appWindow.setFocus();
    await appWindow.startDragging();
  } catch (error) {
    console.error('Failed to start dragging from widget', error);
  }
});

bindMenuAction('toggleOnTop', async () => {
  state.alwaysOnTop = !state.alwaysOnTop;
  saveBool(STORAGE_KEYS.alwaysOnTop, state.alwaysOnTop);
  refreshMenuLabels();
  await applyWindowMode();
});

bindMenuAction('toggleSeconds', async () => {
  state.showSeconds = !state.showSeconds;
  saveBool(STORAGE_KEYS.showSeconds, state.showSeconds);
  refreshMenuLabels();
  updateClock();
});

bindMenuAction('toggle24h', async () => {
  state.use24h = !state.use24h;
  saveBool(STORAGE_KEYS.use24h, state.use24h);
  refreshMenuLabels();
  updateClock();
});

bindMenuAction('styleClassic', async () => { setWidgetStyle('classic'); });
bindMenuAction('styleLiquidLight', async () => { setWidgetStyle('liquidLight'); });
bindMenuAction('styleMinimal', async () => { setWidgetStyle('minimal'); });

bindMenuAction('closeBtn', async () => {
  try {
    await appWindow.close();
  } catch (error) {
    console.error('Failed to close widget', error);
  }
});

bindMenuAction('openTz', async () => { openTzPicker(); });

document.getElementById('tzLabel').addEventListener('click', (event) => {
  event.stopPropagation();
  openTzPicker();
});

tzSearch.addEventListener('input', debounce(renderTzList, 150));

tzSearch.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter') return;
  const exactAlias = TIMEZONE_ALIASES[normalizeQuery(tzSearch.value)];
  const nextTimeZone = exactAlias || state.filteredZones[0];
  if (!nextTimeZone) return;
  setTimeZone(nextTimeZone);
  closeTzPicker();
});

tzList.addEventListener('click', (event) => {
  const row = event.target.closest('.tz-item');
  if (!row) return;
  const tz = row.getAttribute('data-tz');
  if (tz) setTimeZone(tz);
  closeTzPicker();
});

tzOverlay.addEventListener('mousedown', (event) => {
  if (event.target === tzOverlay) closeTzPicker();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeTzPicker();
    ctxMenu.classList.remove('show');
  }
});

window.addEventListener('resize', () => {
  ctxMenu.classList.remove('show');
  scheduleWindowSizeSync();
});

// --- Init ---

applyTheme();
refreshMenuLabels();
scheduleWindowSizeSync();
applyWindowMode();
updateClock();
renderTzList();
setInterval(updateClock, 1000);
