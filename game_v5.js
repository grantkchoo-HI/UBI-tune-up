/* UBI Tune-Up v5 — Wrench Path
 * Diagnostic + Self-Check + Wheels & Tires Mastery + Confusable Web + Multi-Step Chains.
 * Anti-memorization: shuffled choices, position-bias guard, variant rephrasing,
 * dynamic distractor rotation. See randomization_v5.js for the helper module.
 */
(function () {
'use strict';

const SAVE_KEY = 'ubi_quiz_state_v5';
const LEGACY_V4_KEY = 'ubi_quiz_state_v4';
const LEGACY_V3_KEY = 'ubi_quiz_state_v3';
const LEGACY_V2_KEY = 'ubi_quiz_state_v2';
const LEGACY_V1_KEY = 'ubi_quiz_state_v1';
const PLAYDATES_KEY = 'ubi_quiz_playdates_v5';
const DAILY_KEY = 'ubi_quiz_daily_v5';
const INTRO_KEY = 'ubi_quiz_intro_v5';
const SAVE_VERSION = 5;

const RAND = window.RANDOM_V5;

// ============= GLOSSARY / SCENARIOS VALIDATION =============
if (!window.GLOSSARY || !Array.isArray(window.GLOSSARY) || window.GLOSSARY.length === 0) {
  document.body.innerHTML = '<div style="padding:40px;color:#fff;font-family:system-ui">' +
    '<h2>Glossary failed to load</h2><p>Check glossary.js.</p></div>';
  return;
}
if (!window.SCENARIOS_V3 || !Array.isArray(window.SCENARIOS_V3) || window.SCENARIOS_V3.length === 0) {
  document.body.innerHTML = '<div style="padding:40px;color:#fff;font-family:system-ui">' +
    '<h2>Scenarios failed to load</h2><p>Check scenarios_v5.js.</p></div>';
  return;
}
if (!window.WHEELHOUSE || !window.WHEELHOUSE.stages || window.WHEELHOUSE.stages.length === 0) {
  document.body.innerHTML = '<div style="padding:40px;color:#fff;font-family:system-ui">' +
    '<h2>Wheelhouse module failed to load</h2><p>Check wheels_v5.js.</p></div>';
  return;
}
if (!window.APPENDIX || !window.APPENDIX.stages || window.APPENDIX.stages.length === 0) {
  document.body.innerHTML = '<div style="padding:40px;color:#fff;font-family:system-ui">' +
    '<h2>Spec Vault (Appendix) module failed to load</h2><p>Check appendix_v5.js.</p></div>';
  return;
}
if (!window.SUSPENSION || !window.SUSPENSION.stages || window.SUSPENSION.stages.length === 0) {
  document.body.innerHTML = '<div style="padding:40px;color:#fff;font-family:system-ui">' +
    '<h2>Suspension module failed to load</h2><p>Check suspension_v5.js.</p></div>';
  return;
}
if (!window.RANDOM_V5) {
  document.body.innerHTML = '<div style="padding:40px;color:#fff;font-family:system-ui">' +
    '<h2>Randomization module failed to load</h2><p>Check randomization_v5.js.</p></div>';
  return;
}
if (!window.WRENCH_PATH || !Array.isArray(window.WRENCH_PATH.chains) || window.WRENCH_PATH.chains.length === 0) {
  document.body.innerHTML = '<div style="padding:40px;color:#fff;font-family:system-ui">' +
    '<h2>Wrench Path module failed to load</h2><p>Check wrench_path_v5.js.</p></div>';
  return;
}

const GLOSSARY = window.GLOSSARY;
const SCENARIOS = window.SCENARIOS_V3;
const WHEELHOUSE = window.WHEELHOUSE;
const APPENDIX = window.APPENDIX;
const SUSPENSION = window.SUSPENSION;
const TERM_COUNT = GLOSSARY.length;
const SCENARIO_COUNT = SCENARIOS.length;
const WH_STAGE_BY_ID = {};
for (const s of WHEELHOUSE.stages) WH_STAGE_BY_ID[s.id] = s;
const APPX_STAGE_BY_ID = {};
for (const s of APPENDIX.stages) APPX_STAGE_BY_ID[s.id] = s;
const SU_STAGE_BY_ID = {};
for (const s of SUSPENSION.stages) SU_STAGE_BY_ID[s.id] = s;

// Build lookup maps
const TERMS_BY_ID = {};
const TERMS_BY_LOWER = {};
const TERMS_BY_LETTER = {};
for (const t of GLOSSARY) {
  TERMS_BY_ID[t.id] = t;
  TERMS_BY_LOWER[t.termLower] = t;
  if (!TERMS_BY_LETTER[t.firstLetter]) TERMS_BY_LETTER[t.firstLetter] = [];
  TERMS_BY_LETTER[t.firstLetter].push(t);
}
const SCENARIO_BY_ID = {};
for (const s of SCENARIOS) SCENARIO_BY_ID[s.id] = s;

// ============= DIFFICULTY =============
function classifyDifficulty(term) {
  const dl = term.definition.length;
  const commaCount = (term.definition.match(/,/g) || []).length;
  const complexScore = dl + commaCount * 20 + (term.definition.match(/\b(bottom bracket|derailleur|hydraulic|electronic|tolerance|asymmetric|perpendicular)\b/gi) || []).length * 30;
  if (complexScore < 120) return 'easy';
  if (complexScore < 240) return 'medium';
  return 'hard';
}
for (const t of GLOSSARY) t.difficulty = classifyDifficulty(t);

// ============= KEYWORDS =============
const STOPWORDS = new Set([
  'the','and','that','which','with','from','this','these','those','their','them','they','have','been','were','when','where','what','some','such','only','also','into','like','than','other','used','being','each','most','more','over','part','made','while','usually','type','types','example','examples','including','designed','because','another','material','components','using','two','one','often','very','between','along','through','during','rider','bicycle','bike','force','system','mount','located','within','allow','allows','without','cannot','specifically','manufactured','several','either','whether','would','should','could','many','will','may','might','however','typically','generally','commonly','various','different','specific','above','below','around','about','typical','single','must','does','applied','caused','causes','connected','connect','connects','known','allowing','enabled','provides','provide'
]);
function keywordsFromDef(def, max) {
  max = max || 5;
  const words = def.toLowerCase().replace(/[^\w\s\-]/g, ' ').split(/\s+/);
  const uniq = []; const seen = new Set();
  for (const w of words) {
    if (w.length < 5) continue;
    if (STOPWORDS.has(w)) continue;
    if (seen.has(w)) continue;
    seen.add(w); uniq.push(w);
    if (uniq.length >= max) break;
  }
  return uniq;
}
for (const t of GLOSSARY) t._keywords = keywordsFromDef(t.definition, 6);

// ============= CONFUSABLES =============
const CONFUSABLE_PAIRS = [];
(function buildConfusables() {
  const kwIndex = {};
  for (const t of GLOSSARY) {
    for (const k of t._keywords) {
      if (!kwIndex[k]) kwIndex[k] = [];
      kwIndex[k].push(t.id);
    }
  }
  const pairScore = {};
  for (const k in kwIndex) {
    const ids = kwIndex[k];
    if (ids.length > 40) continue;
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const a = ids[i], b = ids[j];
        const key = a < b ? a + '_' + b : b + '_' + a;
        pairScore[key] = (pairScore[key] || 0) + 1;
      }
    }
  }
  const entries = Object.entries(pairScore).filter(([_, s]) => s >= 2);
  entries.sort((a, b) => b[1] - a[1]);
  const used = new Set();
  for (const [key, score] of entries) {
    const [a, b] = key.split('_').map(Number);
    if (used.has(a) || used.has(b)) continue;
    const ta = TERMS_BY_ID[a], tb = TERMS_BY_ID[b];
    if (!ta || !tb) continue;
    if (ta.termLower.indexOf(tb.termLower) >= 0 || tb.termLower.indexOf(ta.termLower) >= 0) continue;
    if (ta.term.length > 40 || tb.term.length > 40) continue;
    CONFUSABLE_PAIRS.push({ a, b, score });
    used.add(a); used.add(b);
    if (CONFUSABLE_PAIRS.length >= 80) break;
  }
})();

// ============= MEMORY HINTS =============
const MANUAL_HINTS = {
  'accuracy': 'Accuracy = correct target. Precision = repeatable. A wide tolerance can still be accurate.',
  'precision': 'Precision = tight grouping. Accuracy = on target. A tight shot cluster that misses the bullseye is precise but inaccurate.',
  'cassette': 'Cassette slides ON a freehub body. Freewheel screws ON like a jar lid. If it unscrews, it is a freewheel.',
  'freewheel': 'Freewheel threads ON (older). Cassette slides onto a freehub (modern). Threading = freewheel.',
  'a-type (rim)': 'A = Asymmetric toward NON-drive side. First hole RIGHT of valve is offset non-drive.',
  'b-type (rim)': 'B = opposite of A. First hole RIGHT of valve is offset DRIVE side.',
  'lockring': 'Lockring LOCKS a part in place — holds cups, cogs, or cranks against movement.',
  'adjustable cup': 'Non-drive side cup you ADJUST for bearing play. Locks with lockring.',
  'fixed cup': 'Drive side cup — fixed, you do not adjust it. Left-hand thread (usually English).',
  'dish (wheels)': 'Dish = how centered the rim sits between hub locknuts. Off-dish = pull rim toward center with opposite-side spokes.',
  'chainline': 'Chainline = straight line from front chainring to rear cog. Off-center = chainline problem. Big-big and small-small stress it most.',
  'truing': 'Lateral truing = side-to-side. Radial truing = up-and-down (roundness). Dishing = centering.',
  'torque': 'Torque = rotational force. Use a wrench in its calibrated range. Over-torque = broken fasteners.',
  'bleeding': 'Bleeding = pushing fluid through to remove air. Spongy lever = air in system.',
  'contamination': 'Contamination = oil / grease where it shouldn\'t be. Kills braking even after new pads.',
};
function autoHint(term) {
  const m = MANUAL_HINTS[term.termLower];
  if (m) return m;
  const kws = term._keywords.slice(0, 3);
  if (kws.length === 0) return null;
  const first = term.term.charAt(0).toUpperCase();
  return `Key words to anchor: <strong>${kws.join(', ')}</strong>. Starts with "${first}".`;
}

// ============= STATE =============
function defaultWheelhouseState() {
  const stages = {};
  for (const s of WHEELHOUSE.stages) {
    stages[s.id] = { started: false, completed: false, bestScore: 0, lastScore: 0, attempts: 0, perfect: false, missedIds: [], lastPlayedAt: null };
  }
  return {
    wxp: 0,
    totalAttempts: 0,
    badges: {},
    stages,
    boss: { started: false, completed: false, bestScore: 0, lastScore: 0, attempts: 0, perfect: false, lastPlayedAt: null },
  };
}
function ensureWheelhouseState() {
  if (!state.wheelhouse) state.wheelhouse = defaultWheelhouseState();
  if (!state.wheelhouse.stages) state.wheelhouse.stages = {};
  if (!state.wheelhouse.badges) state.wheelhouse.badges = {};
  for (const s of WHEELHOUSE.stages) {
    if (!state.wheelhouse.stages[s.id]) state.wheelhouse.stages[s.id] = { started: false, completed: false, bestScore: 0, lastScore: 0, attempts: 0, perfect: false, missedIds: [], lastPlayedAt: null };
  }
  if (!state.wheelhouse.boss) state.wheelhouse.boss = { started: false, completed: false, bestScore: 0, lastScore: 0, attempts: 0, perfect: false, lastPlayedAt: null };
}

function defaultAppendixState() {
  const stages = {};
  for (const s of APPENDIX.stages) {
    stages[s.id] = { started: false, completed: false, bestScore: 0, lastScore: 0, attempts: 0, perfect: false, missedIds: [], lastPlayedAt: null };
  }
  return {
    wxp: 0,
    totalAttempts: 0,
    badges: {},
    stages,
    boss: { started: false, completed: false, bestScore: 0, lastScore: 0, attempts: 0, perfect: false, lastPlayedAt: null },
  };
}
function ensureAppendixState() {
  if (!state.appendix) state.appendix = defaultAppendixState();
  if (!state.appendix.stages) state.appendix.stages = {};
  if (!state.appendix.badges) state.appendix.badges = {};
  for (const s of APPENDIX.stages) {
    if (!state.appendix.stages[s.id]) state.appendix.stages[s.id] = { started: false, completed: false, bestScore: 0, lastScore: 0, attempts: 0, perfect: false, missedIds: [], lastPlayedAt: null };
  }
  if (!state.appendix.boss) state.appendix.boss = { started: false, completed: false, bestScore: 0, lastScore: 0, attempts: 0, perfect: false, lastPlayedAt: null };
}

function defaultSuspensionState() {
  const stages = {};
  for (const s of SUSPENSION.stages) {
    stages[s.id] = { started: false, completed: false, bestScore: 0, lastScore: 0, attempts: 0, perfect: false, missedIds: [], lastPlayedAt: null };
  }
  return {
    wxp: 0,
    totalAttempts: 0,
    badges: {},
    stages,
    boss: { started: false, completed: false, bestScore: 0, lastScore: 0, attempts: 0, perfect: false, lastPlayedAt: null },
  };
}
function ensureSuspensionState() {
  if (!state.suspension) state.suspension = defaultSuspensionState();
  if (!state.suspension.stages) state.suspension.stages = {};
  if (!state.suspension.badges) state.suspension.badges = {};
  for (const s of SUSPENSION.stages) {
    if (!state.suspension.stages[s.id]) state.suspension.stages[s.id] = { started: false, completed: false, bestScore: 0, lastScore: 0, attempts: 0, perfect: false, missedIds: [], lastPlayedAt: null };
  }
  if (!state.suspension.boss) state.suspension.boss = { started: false, completed: false, bestScore: 0, lastScore: 0, attempts: 0, perfect: false, lastPlayedAt: null };
}

// Zone-aware helpers — let the Wheelhouse engine drive ALL zones.
function zKey()   { return (session && session.zone) || 'wheelhouse'; }
function zState() { return state[zKey()]; }
function zMod()   {
  const k = zKey();
  if (k === 'appendix') return APPENDIX;
  if (k === 'suspension') return SUSPENSION;
  return WHEELHOUSE;
}
function zHubScreen() {
  const k = zKey();
  if (k === 'appendix') return 'appendix';
  if (k === 'suspension') return 'suspension';
  return 'wheelhouse';
}
function zRenderHub() {
  const k = zKey();
  if (k === 'appendix') return renderAppendixHub();
  if (k === 'suspension') return renderSuspensionHub();
  return renderWheelhouseHub();
}
function zStartStageFn() {
  const k = zKey();
  if (k === 'appendix') return startAppendixStage;
  if (k === 'suspension') return startSuspensionStage;
  return startWheelhouseStage;
}
function zStartBossFn() {
  const k = zKey();
  if (k === 'appendix') return startAppendixBoss;
  if (k === 'suspension') return startSuspensionBoss;
  return startWheelhouseBoss;
}
function zIsBossUnlocked() {
  const k = zKey();
  if (k === 'appendix') return appxIsBossUnlocked();
  if (k === 'suspension') return suIsBossUnlocked();
  return whIsBossUnlocked();
}
function zStageBadgeId(stageId) {
  const k = zKey();
  if (k === 'appendix') {
    return ({ appx_standards: 'ax_standards', appx_sizing: 'ax_sizing', appx_cockpit: 'ax_cockpit', appx_convert: 'ax_convert' })[stageId];
  }
  if (k === 'suspension') {
    return ({ su_anatomy: 'su_anatomy_master', su_spring: 'su_spring_savant', su_damper: 'su_damper_doctor', su_service: 'su_service_steady', su_sag: 'su_sag_sage', su_trail: 'su_trail_tuner' })[stageId];
  }
  return ({ anatomy: 'wh_anatomy_master', sizing: 'wh_size_savant', tubeless: 'wh_tubeless_pro', pressure: 'wh_pressure_perfectionist', diagnosis: 'wh_wheel_doctor', build: 'wh_wheel_builder' })[stageId];
}
function zApprenticeBadgeId() {
  const k = zKey();
  if (k === 'appendix') return 'ax_apprentice';
  if (k === 'suspension') return 'su_apprentice';
  return 'wh_apprentice';
}
function zChampionBadgeId() {
  const k = zKey();
  if (k === 'appendix') return 'ax_champion';
  if (k === 'suspension') return 'su_champion';
  return 'wh_champion';
}
function zPerfectBadgeId() {
  const k = zKey();
  if (k === 'appendix') return 'ax_perfectionist';
  if (k === 'suspension') return 'su_perfectionist';
  return 'wh_perfectionist';
}

const DEFAULT_STATE = () => ({
  meta: { version: SAVE_VERSION, createdAt: Date.now(), lastPlayedAt: Date.now() },
  player: {
    xp: 0, level: 1, streak: 0, bestStreak: 0, combo: 0,
    badges: {}, muted: false,
    dailyStreak: 0, lastDailyDate: null, dailyCompletedToday: false,
    stats: {
      totalAnswered: 0, totalCorrect: 0, sessionsPlayed: 0, modeCompletions: {},
      scenariosCompleted: 0, selfCheckBatches: 0, overconfidenceSpots: 0,
      wrenchPathChainsCompleted: 0, whyRecallAnswered: 0,
    },
  },
  terms: {},
  wheelhouse: defaultWheelhouseState(),
  appendix: defaultAppendixState(),
  suspension: defaultSuspensionState(),
  wrenchPath: defaultWrenchPathState(),
});
let state = DEFAULT_STATE();
let session = null;
let answerLocked = false;
let advanceTimer = null;
let speedTimer = null;

function defaultTermStats() {
  return {
    mastery: 0, attempts: 0, correct: 0,
    lastSeenAt: 0, lastCorrectAt: 0,
    cooldownUntil: 0, nextDueAt: 0, overconfidence: 0,
    confusedWith: {},        // v5: { otherTermId: count } — Confusable Web
    lastDistractorIds: [],   // v5: last 12 distractor termIds used (rotation)
  };
}
function defaultWrenchPathState() {
  return {
    chainsCompleted: {},   // chainId -> { attempts, bestScore, lastPlayedAt }
    totalAttempts: 0,
    badges: {},
  };
}
function getTermStats(id) {
  if (!state.terms[id]) state.terms[id] = defaultTermStats();
  const s = state.terms[id];
  if (s.nextDueAt === undefined) s.nextDueAt = s.cooldownUntil || 0;
  if (s.overconfidence === undefined) s.overconfidence = 0;
  if (!s.confusedWith) s.confusedWith = {};
  if (!s.lastDistractorIds) s.lastDistractorIds = [];
  return s;
}

// ============= PERSISTENCE =============
let saveTimer = null;
function persist() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ version: SAVE_VERSION, savedAt: Date.now(), state }));
      recordPlayDate();
    } catch (e) { toast('⚠️ Couldn\'t save progress', 'warn'); }
  }, 600);
}
function persistNow() {
  if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ version: SAVE_VERSION, savedAt: Date.now(), state }));
    recordPlayDate();
  } catch (e) {}
}
function loadState() {
  try {
    let raw = localStorage.getItem(SAVE_KEY);
    if (!raw) {
      const v4 = localStorage.getItem(LEGACY_V4_KEY);
      if (v4) { toast('Migrated v4 progress ✓', 'levelup'); return migrateFrom(v4); }
      const v3 = localStorage.getItem(LEGACY_V3_KEY);
      if (v3) { toast('Migrated v3 progress ✓', 'levelup'); return migrateFrom(v3); }
      const v2 = localStorage.getItem(LEGACY_V2_KEY);
      if (v2) { toast('Migrated v2 progress ✓', 'levelup'); return migrateFrom(v2); }
      const v1 = localStorage.getItem(LEGACY_V1_KEY);
      if (v1) { toast('Migrated v1 progress ✓', 'levelup'); return migrateFrom(v1); }
      return DEFAULT_STATE();
    }
    const blob = JSON.parse(raw);
    if (!blob || !blob.state) return DEFAULT_STATE();
    const s = blob.state;
    s.meta = s.meta || { version: SAVE_VERSION, createdAt: Date.now(), lastPlayedAt: Date.now() };
    s.player = Object.assign({}, DEFAULT_STATE().player, s.player || {});
    s.player.stats = Object.assign({}, DEFAULT_STATE().player.stats, s.player.stats || {});
    s.player.stats.modeCompletions = s.player.stats.modeCompletions || {};
    s.player.badges = s.player.badges || {};
    s.terms = s.terms || {};
    // v5: backfill new term-level fields without disturbing existing data
    for (const id in s.terms) {
      const t = s.terms[id];
      if (!t.confusedWith) t.confusedWith = {};
      if (!t.lastDistractorIds) t.lastDistractorIds = [];
    }
    if (!s.wheelhouse) s.wheelhouse = defaultWheelhouseState();
    if (!s.appendix) s.appendix = defaultAppendixState();
    if (!s.suspension) s.suspension = defaultSuspensionState();
    if (!s.wrenchPath) s.wrenchPath = defaultWrenchPathState();
    return s;
  } catch (e) { return DEFAULT_STATE(); }
}
function migrateFrom(rawLegacy) {
  try {
    const blob = JSON.parse(rawLegacy);
    if (!blob || !blob.state) return DEFAULT_STATE();
    const s = blob.state;
    const fresh = DEFAULT_STATE();
    fresh.player.xp = s.player?.xp || 0;
    fresh.player.level = s.player?.level || 1;
    fresh.player.streak = s.player?.streak || 0;
    fresh.player.bestStreak = s.player?.bestStreak || 0;
    fresh.player.badges = s.player?.badges || {};
    fresh.player.dailyStreak = s.player?.dailyStreak || 0;
    fresh.player.stats = Object.assign(fresh.player.stats, s.player?.stats || {});
    fresh.terms = s.terms || {};
    // v5: backfill new term-level fields without disturbing existing data
    for (const id in fresh.terms) {
      const t = fresh.terms[id];
      if (!t.confusedWith) t.confusedWith = {};
      if (!t.lastDistractorIds) t.lastDistractorIds = [];
    }
    if (s.wheelhouse) fresh.wheelhouse = s.wheelhouse;
    if (s.appendix) fresh.appendix = s.appendix;
    if (s.suspension) fresh.suspension = s.suspension;
    if (s.wrenchPath) fresh.wrenchPath = s.wrenchPath;
    return fresh;
  } catch (e) { return DEFAULT_STATE(); }
}
function recordPlayDate() {
  try {
    const today = todayStr();
    const raw = localStorage.getItem(PLAYDATES_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    if (!arr.includes(today)) {
      arr.push(today);
      if (arr.length > 365) arr.shift();
      localStorage.setItem(PLAYDATES_KEY, JSON.stringify(arr));
    }
    updateDailyStreak(arr);
    return arr;
  } catch (e) { return []; }
}
function getPlayDates() {
  try { const raw = localStorage.getItem(PLAYDATES_KEY); return raw ? JSON.parse(raw) : []; }
  catch (e) { return []; }
}
function todayStr() { return new Date().toISOString().slice(0, 10); }
function dateAddDays(d, n) { const x = new Date(d + 'T00:00:00Z'); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); }
function updateDailyStreak(dates) {
  const today = todayStr();
  const yest = dateAddDays(today, -1);
  const set = new Set(dates);
  if (!set.has(today) && !set.has(yest)) { state.player.dailyStreak = 0; return; }
  let cur = set.has(today) ? today : yest;
  let count = 0;
  while (set.has(cur)) { count++; cur = dateAddDays(cur, -1); }
  state.player.dailyStreak = count;
}

// ============= DAILY =============
function getDailyState() {
  try { const raw = localStorage.getItem(DAILY_KEY); if (!raw) return null; return JSON.parse(raw); }
  catch (e) { return null; }
}
function setDailyState(obj) { try { localStorage.setItem(DAILY_KEY, JSON.stringify(obj)); } catch (e) {} }
function dailyAvailable() {
  const d = getDailyState();
  if (!d) return true;
  return d.date !== todayStr() || !d.completed;
}
function markDailyComplete() {
  setDailyState({ date: todayStr(), completed: true });
  state.player.lastDailyDate = todayStr();
  state.player.dailyCompletedToday = true;
}

// ============= XP / LEVEL =============
function xpForLevel(n) { return 100 * n + 50 * n * (n - 1); }
function totalXpForLevel(n) { let total = 0; for (let k = 1; k < n; k++) total += xpForLevel(k); return total; }
function levelFromXp(xp) { let level = 1; while (xp >= totalXpForLevel(level + 1)) level++; return level; }
function rankTitle(level) {
  if (level <= 2) return 'Apprentice';
  if (level <= 5) return 'Shop Helper';
  if (level <= 9) return 'Wrench';
  if (level <= 14) return 'Senior Wrench';
  if (level <= 19) return 'Lead Mechanic';
  if (level <= 29) return 'Master Mechanic';
  if (level <= 49) return 'Frame Builder';
  return 'UBI Legend';
}

// ============= MODES =============
const MODES = {
  flashcard: { id: 'flashcard', name: 'Flashcards', icon: '🃏', category: 'train',
    desc: 'Flip through cards. Rate how well you knew it.',
    questionCount: 12, timed: false, xpMult: 1.0, builder: 'flashcard', unlock: null },
  quick: { id: 'quick', name: 'Quick Quiz', icon: '🚴', category: 'train',
    desc: 'See a term, pick its definition. Gentle warmup.',
    questionCount: 15, timed: false, xpMult: 1.0, builder: 'term_to_def', unlock: null },
  reverse: { id: 'reverse', name: 'Reverse Quiz', icon: '⚙️', category: 'train',
    desc: 'Read a definition, pick the matching term.',
    questionCount: 15, timed: false, xpMult: 1.1, builder: 'def_to_term', unlock: { level: 2 } },
  learn: { id: 'learn', name: 'Learn Mode', icon: '📚', category: 'train',
    desc: 'Study each term, then get quizzed. No pressure.',
    questionCount: 8, timed: false, xpMult: 1.0, builder: 'learn', unlock: null },

  self_check: { id: 'self_check', name: 'Self-Check', icon: '🧠', category: 'drill', isNew: true,
    desc: 'Type your own definition + rate confidence. Delayed feedback boosts retention.',
    questionCount: 4, timed: false, xpMult: 1.6, builder: 'self_check', unlock: { level: 2 }, batchSize: 4 },
  matching: { id: 'matching', name: 'Matching Sprint', icon: '🧩', category: 'drill',
    desc: 'Match 5 terms to 5 definitions. Think fast.',
    questionCount: 3, timed: false, xpMult: 1.3, builder: 'matching', unlock: { level: 2 }, roundSize: 5 },
  fill_blank: { id: 'fill_blank', name: 'Fill the Blank', icon: '✏️', category: 'drill',
    desc: 'Type the missing keyword in a definition.',
    questionCount: 10, timed: false, xpMult: 1.4, builder: 'fill_blank', unlock: { level: 2 } },
  speed: { id: 'speed', name: 'Speed Drill', icon: '⏱️', category: 'drill',
    desc: '6 seconds per question. Combo bonuses!',
    questionCount: 20, timed: true, perQuestionMs: 6000, xpMult: 1.3, builder: 'random_mc', unlock: { level: 3 } },
  typing: { id: 'typing', name: 'Typing Challenge', icon: '⌨️', category: 'drill',
    desc: 'Type the term from its definition. Big XP!',
    questionCount: 10, timed: false, xpMult: 1.5, builder: 'typing', unlock: { level: 4 } },

  scenario: { id: 'scenario', name: 'Diagnostic Cases', icon: '🔧', category: 'apply', isNew: true,
    desc: 'Real shop cases. Combine terms to solve.',
    questionCount: 6, timed: false, xpMult: 1.6, builder: 'scenario_v3', unlock: { level: 3 } },
  wrench_path: { id: 'wrench_path', name: 'Wrench Path', icon: '🛠️', category: 'apply', isNew: true,
    desc: 'Multi-step diagnostics — symptom → test → fix. Walk the whole chain.',
    questionCount: 3, timed: false, xpMult: 1.7, builder: 'wrench_path', unlock: null },
  confusables: { id: 'confusables', name: 'Confusables', icon: '🔀', category: 'apply',
    desc: 'Sort out commonly mixed-up term pairs.',
    questionCount: 12, timed: false, xpMult: 1.3, builder: 'confusables', unlock: { level: 3 }, pool: confusablePool },

  tuneup: { id: 'tuneup', name: 'Weak Spot Tune-Up', icon: '🛠️', category: 'focus',
    desc: 'Focus on terms you\'ve missed. Sharpen up.',
    questionCount: 10, timed: false, xpMult: 1.2, builder: 'term_to_def', pool: weakTermsPool, unlock: { attemptedCount: 10 } },
  due_review: { id: 'due_review', name: 'Due for Review', icon: '⏰', category: 'focus',
    desc: 'Terms your memory says you should see now. Spaced repetition.',
    questionCount: 12, timed: false, xpMult: 1.25, builder: 'mixed_light', pool: duePool, unlock: { duePool: 5 } },
  overcon_tuneup: { id: 'overcon_tuneup', name: 'Overconfidence Check', icon: '⚠️', category: 'focus', isNew: true,
    desc: 'Terms you were sure you knew — but missed. Danger zone.',
    questionCount: 8, timed: false, xpMult: 1.5, builder: 'mixed_light', pool: overconfidentPool, unlock: { overconfidentPool: 3 } },
  boss: { id: 'boss', name: 'Boss Ride', icon: '🏁', category: 'focus',
    desc: '30 mixed questions. Timed. All the glory.',
    questionCount: 30, timed: true, perQuestionMs: 10000, xpMult: 1.75, builder: 'mixed', unlock: { level: 6 } },
  daily_ride: { id: 'daily_ride', name: 'Daily Ride', icon: '☀️', category: 'focus',
    desc: 'Today\'s 10-question mission. Bonus XP, once a day.',
    questionCount: 10, timed: false, xpMult: 1.5, builder: 'mixed_light', pool: dailyPool, unlock: null, daily: true },
};

function weakTermsPool() {
  const pool = [];
  for (const t of GLOSSARY) {
    const s = state.terms[t.id];
    if (s && s.attempts > 0) {
      const ratio = s.correct / s.attempts;
      if (ratio < 0.7 || s.mastery < 3) pool.push(t);
    }
  }
  return pool.length >= 5 ? pool : GLOSSARY.slice();
}
function duePool() {
  const now = Date.now();
  const pool = [];
  for (const t of GLOSSARY) {
    const s = state.terms[t.id];
    if (!s) continue;
    if (s.mastery >= 1 && s.nextDueAt && s.nextDueAt <= now) pool.push(t);
  }
  return pool.length >= 5 ? pool : GLOSSARY.slice();
}
function countDue() {
  const now = Date.now();
  let c = 0;
  for (const id in state.terms) {
    const s = state.terms[id];
    if (s.mastery >= 1 && s.nextDueAt && s.nextDueAt <= now) c++;
  }
  return c;
}
function overconfidentPool() {
  const pool = [];
  for (const t of GLOSSARY) {
    const s = state.terms[t.id];
    if (s && s.overconfidence > 0) pool.push(t);
  }
  return pool.length >= 3 ? pool : weakTermsPool();
}
function countOverconfident() {
  let c = 0;
  for (const id in state.terms) {
    if ((state.terms[id].overconfidence || 0) > 0) c++;
  }
  return c;
}
function confusablePool() {
  const ids = new Set();
  for (const p of CONFUSABLE_PAIRS) { ids.add(p.a); ids.add(p.b); }
  const pool = [];
  ids.forEach(id => { if (TERMS_BY_ID[id]) pool.push(TERMS_BY_ID[id]); });
  return pool.length >= 6 ? pool : GLOSSARY.slice();
}
function dailyPool() {
  const seed = todayStr().split('-').join('');
  const n = parseInt(seed, 10) % GLOSSARY.length;
  const candidates = GLOSSARY.filter(t => {
    const s = state.terms[t.id];
    const m = s ? s.mastery : 0;
    return m <= 3;
  });
  if (candidates.length < 15) return GLOSSARY.slice();
  const arr = candidates.slice();
  const rng = mulberry32(n);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, 30);
}
function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function isModeUnlocked(mode) {
  if (mode.daily && !dailyAvailable()) return false;
  if (!mode.unlock) return true;
  if (mode.unlock.level && state.player.level < mode.unlock.level) return false;
  if (mode.unlock.attemptedCount) {
    let count = 0;
    for (const k in state.terms) if (state.terms[k].attempts > 0) count++;
    if (count < mode.unlock.attemptedCount) return false;
  }
  if (mode.unlock.duePool && countDue() < mode.unlock.duePool) return false;
  if (mode.unlock.overconfidentPool && countOverconfident() < mode.unlock.overconfidentPool) return false;
  return true;
}
function unlockLabel(mode) {
  if (mode.daily && !dailyAvailable()) return '✓ Done today';
  if (!mode.unlock) return '';
  if (mode.unlock.level) return `🔒 Level ${mode.unlock.level}`;
  if (mode.unlock.attemptedCount) return `🔒 Play ${mode.unlock.attemptedCount} terms`;
  if (mode.unlock.duePool) return `🔒 ${mode.unlock.duePool} due terms`;
  if (mode.unlock.overconfidentPool) return `🔒 ${mode.unlock.overconfidentPool} overconfident misses`;
  return '🔒';
}

// ============= TERM SELECTION =============
function recentIds() { if (!session) return new Set(); return new Set(session.questions.slice(-8).map(q => q.termId)); }
function pickNextTerm(mode) {
  const now = Date.now();
  const pool = mode.pool ? mode.pool() : GLOSSARY;
  const recent = recentIds();
  const weights = [];
  for (let i = 0; i < pool.length; i++) {
    const t = pool[i];
    const s = state.terms[t.id];
    let w;
    if (!s) { w = 12; }
    else {
      if (s.cooldownUntil > now && pool.length > 10) { weights.push(0); continue; }
      let base = 6 - s.mastery;
      if (base < 1) base = 1;
      let wrongBoost = 1;
      if (s.attempts > 1 && s.correct / s.attempts < 0.5) wrongBoost = 2;
      // Overconfidence boost: user was sure, got it wrong
      const ocBoost = 1 + Math.min(s.overconfidence || 0, 3);
      w = base * wrongBoost * ocBoost;
    }
    if (recent.has(t.id)) w *= 0.15;
    weights.push(w);
  }
  let sum = 0;
  for (const w of weights) sum += w;
  if (sum === 0) {
    for (let i = 0; i < pool.length; i++) {
      const t = pool[i];
      const s = state.terms[t.id];
      weights[i] = 6 - (s ? s.mastery : 0);
      sum += weights[i];
    }
  }
  let r = Math.random() * sum;
  for (let i = 0; i < pool.length; i++) { r -= weights[i]; if (r <= 0) return pool[i]; }
  return pool[pool.length - 1];
}

// ============= DISTRACTORS =============
function firstRefSection(refs) { if (!refs || refs.length === 0) return null; const r = refs[0]; const m = r.match(/^([A-Z]?\d+)/); return m ? m[1] : null; }
function shuffle(arr) { return RAND.shuffle(arr); }
function sampleN(arr, n) { return shuffle(arr).slice(0, n); }

// V5 — Confusable Web seed. Returns up to `wantConfused` terms the user has
// historically confused with `correct`, ordered by confusion frequency.
function pickConfusedDistractors(correct, wantConfused) {
  const stats = state.terms[correct.id];
  if (!stats || !stats.confusedWith) return [];
  const sorted = Object.entries(stats.confusedWith)
    .filter(([id, count]) => count >= 1 && Number(id) !== correct.id && TERMS_BY_ID[id])
    .sort((a, b) => b[1] - a[1])
    .slice(0, wantConfused)
    .map(([id]) => TERMS_BY_ID[id])
    .filter(Boolean);
  return sorted;
}

function pickDistractors(correct, n) {
  n = n || 3;
  // V5: Confusable Web — guarantee the user's top confusions appear.
  // Cap at n-1 so at least one distractor still comes from the broader pool
  // (keeps practice from collapsing to the same two confusables forever).
  const confusedSlots = Math.min(pickConfusedDistractors(correct, 1).length, Math.max(0, n - 1));
  const confused = pickConfusedDistractors(correct, confusedSlots);

  const scores = new Map();
  const bump = (t, by) => { if (t.id === correct.id) return; scores.set(t.id, (scores.get(t.id) || 0) + by); };
  const sameLetter = TERMS_BY_LETTER[correct.firstLetter] || [];
  for (const t of sampleN(sameLetter, Math.min(sameLetter.length, n * 3))) bump(t, 2);
  const kws = correct._keywords || keywordsFromDef(correct.definition);
  if (kws.length > 0) {
    const matches = [];
    for (const t of GLOSSARY) {
      if (t.id === correct.id) continue;
      const dl = t.definition.toLowerCase();
      for (const k of kws) { if (dl.indexOf(k) >= 0) { matches.push(t); break; } }
    }
    for (const t of sampleN(matches, Math.min(matches.length, n * 3))) bump(t, 2);
  }
  const section = firstRefSection(correct.refs);
  if (section) {
    const sect = GLOSSARY.filter(t => t.id !== correct.id && t.refs.some(r => (r.match(/^([A-Z]?\d+)/) || [])[1] === section));
    for (const t of sampleN(sect, Math.min(sect.length, n * 2))) bump(t, 1);
  }
  const similarLen = GLOSSARY.filter(t => t.id !== correct.id && Math.abs(t.length - correct.length) <= 4);
  for (const t of sampleN(similarLen, Math.min(similarLen.length, n))) bump(t, 1);
  const ranked = Array.from(scores.entries()).map(([id, s]) => ({ id, s })).sort((a, b) => b.s - a.s || Math.random() - 0.5);

  // V5: distractor rotation — exclude recently-used distractors when pool allows.
  const stats = state.terms[correct.id];
  const recentIds = stats ? (stats.lastDistractorIds || []) : [];
  const recentSet = new Set(recentIds);

  const distractors = confused.slice();
  const usedDefs = new Set([correct.definition.trim().toLowerCase()].concat(distractors.map(t => t.definition.trim().toLowerCase())));
  const usedTerms = new Set([correct.termLower].concat(distractors.map(t => t.termLower)));

  // Pass 1: rotation-respecting (skip recent)
  for (const r of ranked) {
    if (distractors.length >= n) break;
    const t = TERMS_BY_ID[r.id];
    if (!t) continue;
    if (usedTerms.has(t.termLower)) continue;
    if (usedDefs.has(t.definition.trim().toLowerCase())) continue;
    if (recentSet.has(t.id)) continue;
    distractors.push(t); usedTerms.add(t.termLower); usedDefs.add(t.definition.trim().toLowerCase());
  }
  // Pass 2: backfill from ranked even if recent (only if pool was too small)
  for (const r of ranked) {
    if (distractors.length >= n) break;
    const t = TERMS_BY_ID[r.id];
    if (!t) continue;
    if (usedTerms.has(t.termLower)) continue;
    if (usedDefs.has(t.definition.trim().toLowerCase())) continue;
    distractors.push(t); usedTerms.add(t.termLower); usedDefs.add(t.definition.trim().toLowerCase());
  }
  while (distractors.length < n) {
    const t = GLOSSARY[Math.floor(Math.random() * GLOSSARY.length)];
    if (t.id === correct.id) continue;
    if (usedTerms.has(t.termLower)) continue;
    distractors.push(t); usedTerms.add(t.termLower);
  }

  // Record which distractors we used so next call can rotate.
  if (stats) {
    for (const d of distractors) {
      stats.lastDistractorIds.push(d.id);
    }
    while (stats.lastDistractorIds.length > 12) stats.lastDistractorIds.shift();
  }
  return distractors;
}

// ============= SCENARIO POOL =============
function pickScenario() {
  // Prefer unseen scenarios
  if (!session.seenScenarios) session.seenScenarios = new Set();
  const unseen = SCENARIOS.filter(s => !session.seenScenarios.has(s.id));
  const pool = unseen.length > 0 ? unseen : SCENARIOS;
  const pick = pool[Math.floor(Math.random() * pool.length)];
  session.seenScenarios.add(pick.id);
  return pick;
}

// V5: Why-Recall builder. For repeat scenario exposure, instead of asking
// what to pick, ask WHY the right pick is right — with reasonings as choices.
// Distractors are first-sentences pulled from OTHER scenarios' `why` text;
// same-topic preferred for sharper discrimination.
function _stripHtmlFirstSentence(html) {
  if (!html) return '';
  const stripped = html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  const m = stripped.match(/^[^.!?]+[.!?]/);
  return (m ? m[0] : stripped).trim();
}
function buildWhyRecall(scen) {
  const correctReasoning = _stripHtmlFirstSentence(scen.why);
  const sameTopic = SCENARIOS.filter(s => s.id !== scen.id && s.topic === scen.topic && s.why);
  const others = SCENARIOS.filter(s => s.id !== scen.id && s.topic !== scen.topic && s.why);
  const pool = sameTopic.length >= 3 ? sameTopic.slice() : sameTopic.concat(others);
  const distractorScens = RAND.shuffle(pool).slice(0, 3);
  const distractorTexts = distractorScens.map(s => _stripHtmlFirstSentence(s.why));
  const baseChoices = [
    { text: correctReasoning, correct: true },
    ...distractorTexts.map(d => ({ text: d, correct: false })),
  ];
  state.player.stats.whyRecallAnswered = (state.player.stats.whyRecallAnswered || 0);
  return q({ kind: 'scenario_v3', builder: 'scenario_v3', scenarioId: scen.id,
    story: scen.story,
    question: '🔮 Why-Recall · ' + scen.question + ' — what\'s the reasoning?',
    selectKind: 'single', requiredCorrect: 1,
    choices: baseChoices, baseChoices,
    variants: null,
    terms: scen.terms || [], why: scen.why, scenDifficulty: scen.difficulty,
    isWhyRecall: true,
    userSelection: [] });
}

// V5: Wrench Path chain picker — prefer chains not yet seen this session.
function pickWrenchChain() {
  const all = window.WRENCH_PATH.chains;
  if (!session.seenWrenchChains) session.seenWrenchChains = new Set();
  const unseen = all.filter(c => !session.seenWrenchChains.has(c.id));
  const pool = unseen.length > 0 ? unseen : all;
  const pick = pool[Math.floor(Math.random() * pool.length)];
  session.seenWrenchChains.add(pick.id);
  return pick;
}

// ============= QUESTION BUILDERS =============
function buildQuestion(mode, termId) {
  const term = TERMS_BY_ID[termId];
  let builder = mode.builder;
  if (builder === 'random_mc') builder = Math.random() < 0.5 ? 'term_to_def' : 'def_to_term';
  if (builder === 'mixed') {
    const r = Math.random();
    if (r < 0.3) builder = 'term_to_def';
    else if (r < 0.55) builder = 'def_to_term';
    else if (r < 0.75) builder = 'typing';
    else if (r < 0.9) builder = 'fill_blank';
    else builder = 'scenario_v3';
  }
  if (builder === 'mixed_light') {
    const r = Math.random();
    if (r < 0.4) builder = 'term_to_def';
    else if (r < 0.7) builder = 'def_to_term';
    else if (r < 0.85) builder = 'fill_blank';
    else builder = 'term_to_def';
  }

  // V5: Wrench Path — multi-step branching diagnostic chain. The "question"
  // is the entire chain; the renderer walks the user through internal steps.
  if (builder === 'wrench_path') {
    const chain = pickWrenchChain();
    return q({ kind: 'wrench_path', builder, chainId: chain.id,
      title: chain.title, story: chain.story, terms: chain.terms || [],
      _stepId: 'start', _wrongSteps: 0, _stepLog: [], _ended: false });
  }

  // Scenario mode uses authored scenarios — no termId here
  if (builder === 'scenario_v3') {
    const scen = pickScenario();

    // V5: 20% of scenarios become why-recall once the learner has cleared 6+
    // — converts passive after-answer reading into active retrieval.
    const completed = state.player.stats.scenariosCompleted || 0;
    if (completed >= 6 && Math.random() < 0.20) {
      return buildWhyRecall(scen);
    }

    // V5: store unshuffled choices on the question; renderScenarioV3 shuffles
    // with bias guard each time so re-rolls produce a fresh order.
    const baseChoices = scen.choices.map((c, i) => ({ ...c, origIdx: i }));
    return q({ kind: 'scenario_v3', builder, scenarioId: scen.id,
      story: scen.story, question: scen.question, selectKind: scen.kind,
      requiredCorrect: scen.requiredCorrect || 1,
      choices: baseChoices, baseChoices,
      variants: scen.variants || null,
      terms: scen.terms || [], why: scen.why, scenDifficulty: scen.difficulty,
      userSelection: [] });
  }

  if (builder === 'self_check') {
    return q({ termId, kind: 'self_check', builder,
      promptText: term.term, correctTermId: term.id,
      userAnswer: '', confidence: 0, selfGrade: null, revealed: false });
  }

  const termStats = state.terms[termId];
  const mastery = termStats ? termStats.mastery : 0;
  const isEasy = term.difficulty === 'easy';
  const nChoices = (isEasy && mastery >= 2) ? 3 : 4;

  if (builder === 'term_to_def') {
    const distractors = pickDistractors(term, nChoices - 1);
    const biasKey = 'mc_t2d_' + (mode.id || 'mixed');
    const choices = RAND.shuffleWithBiasGuard([term, ...distractors], (t) => t.id === term.id, biasKey);
    return q({ termId, kind: 'mc', builder, promptKind: 'term',
      promptText: term.term, promptRefs: term.refs,
      choices: choices.map(t => ({ termId: t.id, text: t.definition })),
      correctTermId: term.id });
  }
  if (builder === 'def_to_term') {
    const distractors = pickDistractors(term, nChoices - 1);
    const biasKey = 'mc_d2t_' + (mode.id || 'mixed');
    const choices = RAND.shuffleWithBiasGuard([term, ...distractors], (t) => t.id === term.id, biasKey);
    return q({ termId, kind: 'mc', builder, promptKind: 'definition',
      promptText: term.definition, promptRefs: term.refs,
      choices: choices.map(t => ({ termId: t.id, text: t.term })),
      correctTermId: term.id });
  }
  if (builder === 'typing') {
    return q({ termId, kind: 'typing', builder, promptKind: 'definition',
      promptText: term.definition, promptRefs: term.refs,
      correctTermId: term.id, correctAnswer: term.term });
  }
  if (builder === 'flashcard') {
    return q({ termId, kind: 'flashcard', builder, promptKind: 'term', promptText: term.term, correctTermId: term.id });
  }
  if (builder === 'learn') {
    const distractors = pickDistractors(term, 3);
    const choices = RAND.shuffleWithBiasGuard([term, ...distractors], (t) => t.id === term.id, 'mc_learn');
    return q({ termId, kind: 'learn', builder, promptKind: 'term',
      promptText: term.term, promptRefs: term.refs,
      choices: choices.map(t => ({ termId: t.id, text: t.definition })),
      correctTermId: term.id, learnShown: false });
  }
  if (builder === 'matching') {
    const m = MODES.matching;
    const roundSize = m.roundSize || 5;
    const seedTerm = term;
    const sameLetter = (TERMS_BY_LETTER[seedTerm.firstLetter] || []).filter(t => t.id !== seedTerm.id);
    let pool = sameLetter.slice();
    if (pool.length < roundSize - 1) pool = pool.concat(GLOSSARY.filter(t => t.id !== seedTerm.id && !pool.find(p => p.id === t.id)));
    const picks = [seedTerm, ...sampleN(pool, roundSize - 1)];
    const shuffledDefs = shuffle(picks);
    return q({ termId, kind: 'matching', builder,
      terms: picks.map(t => ({ id: t.id, term: t.term })),
      defs: shuffledDefs.map(t => ({ id: t.id, text: t.definition })),
      termIds: picks.map(t => t.id),
      matched: {}, wrongCount: 0, correctTermId: seedTerm.id });
  }
  if (builder === 'fill_blank') {
    const blanked = makeBlankSentence(term);
    return q({ termId, kind: 'fill_blank', builder, promptKind: 'fill-blank',
      promptHtml: blanked.html, promptRefs: term.refs,
      correctTermId: term.id, correctAnswer: blanked.target, termHint: term.term });
  }
  if (builder === 'confusables') {
    const pair = CONFUSABLE_PAIRS.find(p => p.a === term.id || p.b === term.id);
    let partner = null;
    if (pair) partner = TERMS_BY_ID[pair.a === term.id ? pair.b : pair.a];
    if (!partner) partner = pickDistractors(term, 1)[0];
    const whichIsPrompt = Math.random() < 0.5 ? term : partner;
    const choices = RAND.shuffleWithBiasGuard([term, partner], (t) => t.id === whichIsPrompt.id, 'mc_confusables');
    return q({ termId: whichIsPrompt.id, kind: 'confusables', builder,
      promptKind: 'definition', promptText: whichIsPrompt.definition, promptRefs: whichIsPrompt.refs,
      choices: choices.map(t => ({ termId: t.id, text: t.term })),
      correctTermId: whichIsPrompt.id,
      partnerTermId: (whichIsPrompt.id === term.id ? partner.id : term.id) });
  }
  return buildQuestion({ ...mode, builder: 'term_to_def' }, termId);
}
function q(base) { return Object.assign({ startedAt: 0, userAnswer: null, correct: false, timeMs: 0 }, base); }

// ============= FILL-BLANK =============
function makeBlankSentence(term) {
  const def = term.definition;
  const words = def.split(/(\s+|[,.;:])/);
  let best = null, bestScore = 0;
  for (const w of words) {
    const clean = w.replace(/[^\w\-]/g, '').toLowerCase();
    if (clean.length < 5) continue;
    if (STOPWORDS.has(clean)) continue;
    if (term.termLower.indexOf(clean) >= 0) continue;
    let score = clean.length;
    let count = 0;
    for (const t of GLOSSARY) { if (t.definition.toLowerCase().indexOf(clean) >= 0) count++; if (count > 30) break; }
    if (count < 10) score += 6;
    if (score > bestScore) { bestScore = score; best = { full: w, clean }; }
  }
  if (!best) {
    for (const w of words) {
      const clean = w.replace(/[^\w\-]/g, '').toLowerCase();
      if (clean.length >= 5) { best = { full: w, clean }; break; }
    }
  }
  if (!best) best = { full: words[0], clean: words[0].toLowerCase() };
  let replacedOnce = false;
  const rebuilt = words.map(w => {
    if (replacedOnce) return escapeHtml(w);
    const clean = w.replace(/[^\w\-]/g, '').toLowerCase();
    if (clean === best.clean) { replacedOnce = true; return '<span class="blank-slot">_____</span>'; }
    return escapeHtml(w);
  }).join('');
  return { html: rebuilt, target: best.clean };
}

// ============= TYPING / FILL MATCH =============
function normalizeTyped(s) { return (s || '').toLowerCase().trim().replace(/\s+/g, ' ').replace(/[^\w\s\-\(\)'\/]/g, ''); }
function stripForLoose(s) { return normalizeTyped(s).replace(/\([^)]*\)/g, '').replace(/\bs\b/g, '').replace(/-/g, '').replace(/\s+/g, ' ').trim(); }
function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const m = a.length, n = b.length;
  const dp = new Array(n + 1);
  for (let j = 0; j <= n; j++) dp[j] = j;
  for (let i = 1; i <= m; i++) {
    let prev = dp[0]; dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const t = dp[j];
      if (a[i-1] === b[j-1]) dp[j] = prev;
      else dp[j] = 1 + Math.min(prev, dp[j], dp[j-1]);
      prev = t;
    }
  }
  return dp[n];
}
function typingMatches(typed, correct) {
  if (!typed) return false;
  const nt = normalizeTyped(typed);
  const nc = normalizeTyped(correct);
  if (nt === nc) return true;
  const lt = stripForLoose(typed);
  const lc = stripForLoose(correct);
  if (lt === lc) return true;
  const bareCorrect = nc.replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
  if (nt === bareCorrect) return true;
  const allowed = Math.max(1, Math.floor(bareCorrect.length / 10));
  if (levenshtein(nt, bareCorrect) <= allowed) return true;
  return false;
}
function fillMatches(typed, target) {
  if (!typed) return false;
  const nt = normalizeTyped(typed);
  const tc = target.toLowerCase();
  if (nt === tc) return true;
  if (nt === tc + 's' || nt + 's' === tc) return true;
  if (nt === tc + 'es' || nt + 'es' === tc) return true;
  if (levenshtein(nt, tc) <= 1 && tc.length >= 5) return true;
  return false;
}

// ============= SRS =============
const SRS_INTERVALS = { 0: 0, 1: 30_000, 2: 120_000, 3: 600_000, 4: 86_400_000, 5: 604_800_000 };

function onAnswer(termId, correct, firstTry, timeMs) {
  const s = getTermStats(termId);
  s.attempts++;
  s.lastSeenAt = Date.now();
  if (correct) {
    s.correct++;
    s.lastCorrectAt = Date.now();
    s.mastery = Math.min(5, s.mastery + 1);
    s.cooldownUntil = Date.now() + SRS_INTERVALS[s.mastery];
    s.nextDueAt = s.cooldownUntil;
    state.player.streak++;
    if (state.player.streak > state.player.bestStreak) state.player.bestStreak = state.player.streak;
    state.player.combo++;
  } else {
    s.mastery = Math.max(0, s.mastery - 1);
    s.cooldownUntil = Date.now() + 30_000;
    s.nextDueAt = Date.now();
    state.player.streak = 0;
    state.player.combo = 0;
  }
  state.player.stats.totalAnswered++;
  if (correct) state.player.stats.totalCorrect++;
}

// Self-check specific: combines confidence + self-grade
function onSelfCheckAnswer(termId, selfGrade, confidence) {
  const s = getTermStats(termId);
  s.attempts++;
  s.lastSeenAt = Date.now();
  const now = Date.now();
  let delta = 0, correct = false;
  if (selfGrade === 'spot_on') { delta = 1; correct = true; }
  else if (selfGrade === 'close') { delta = 0; correct = true; }
  else if (selfGrade === 'off') { delta = -1; correct = false; }
  s.mastery = Math.max(0, Math.min(5, s.mastery + delta));
  if (correct) {
    s.correct++;
    s.lastCorrectAt = now;
    state.player.streak++;
    if (state.player.streak > state.player.bestStreak) state.player.bestStreak = state.player.streak;
    state.player.combo++;
  } else {
    state.player.streak = 0;
    state.player.combo = 0;
  }
  s.cooldownUntil = now + SRS_INTERVALS[s.mastery];
  s.nextDueAt = s.cooldownUntil;
  // Overconfidence: confident (≥4) but graded off → bump
  if (confidence >= 4 && selfGrade === 'off') {
    s.overconfidence = (s.overconfidence || 0) + 1;
    state.player.stats.overconfidenceSpots = (state.player.stats.overconfidenceSpots || 0) + 1;
  }
  // Redemption: graded spot_on → clear overconfidence flag
  if (selfGrade === 'spot_on' && s.overconfidence > 0) s.overconfidence = Math.max(0, s.overconfidence - 1);
  state.player.stats.totalAnswered++;
  if (correct) state.player.stats.totalCorrect++;
}

function onFlashcardRate(termId, rating) {
  const s = getTermStats(termId);
  s.attempts++;
  s.lastSeenAt = Date.now();
  const now = Date.now();
  let delta = 0, correct = false;
  if (rating === 'again') { delta = -1; correct = false; }
  else if (rating === 'hard') { delta = 0; correct = true; }
  else if (rating === 'good') { delta = 1; correct = true; }
  else if (rating === 'easy') { delta = 2; correct = true; }
  s.mastery = Math.max(0, Math.min(5, s.mastery + delta));
  if (correct) {
    s.correct++; s.lastCorrectAt = now;
    state.player.streak++;
    if (state.player.streak > state.player.bestStreak) state.player.bestStreak = state.player.streak;
    state.player.combo++;
  } else { state.player.streak = 0; state.player.combo = 0; }
  s.cooldownUntil = now + SRS_INTERVALS[s.mastery];
  s.nextDueAt = s.cooldownUntil;
  state.player.stats.totalAnswered++;
  if (correct) state.player.stats.totalCorrect++;
}

// Scenario: award mastery to ALL tagged terms
function onScenarioAnswer(q, correct) {
  state.player.stats.scenariosCompleted++;
  for (const termLower of (q.terms || [])) {
    const t = TERMS_BY_LOWER[termLower];
    if (!t) continue;
    const s = getTermStats(t.id);
    s.attempts++;
    s.lastSeenAt = Date.now();
    if (correct) {
      s.correct++;
      s.lastCorrectAt = Date.now();
      s.mastery = Math.min(5, s.mastery + 1);
      s.cooldownUntil = Date.now() + SRS_INTERVALS[s.mastery];
      s.nextDueAt = s.cooldownUntil;
    } else {
      // Don't drop mastery (scenario is transfer, not direct recall) — but pull due date forward
      s.nextDueAt = Date.now();
    }
  }
  state.player.stats.totalAnswered++;
  if (correct) {
    state.player.stats.totalCorrect++;
    state.player.streak++;
    if (state.player.streak > state.player.bestStreak) state.player.bestStreak = state.player.streak;
    state.player.combo++;
  } else {
    state.player.streak = 0;
    state.player.combo = 0;
  }
}

// ============= XP =============
function awardXp(q, wasFirstTry) {
  const mode = MODES[session.mode];
  const termRef = q._termRef || (q.correctTermId ? TERMS_BY_ID[q.correctTermId] : null);
  const oldMastery = q.correctTermId ? Math.max(0, (getTermStats(q.correctTermId).mastery - 1)) : 0;
  let base = 10;
  let comboBonus = Math.min(state.player.combo - 1, 9) * 2;
  if (comboBonus < 0) comboBonus = 0;
  const firstTryBonus = wasFirstTry ? 5 : 0;
  const speedBonus = mode.timed && q.timeMs < 2000 ? 3 : 0;
  const masteryBonus = oldMastery < 5 ? (5 - oldMastery) : 0;
  const difficultyBonus = termRef?.difficulty === 'hard' ? 4 : termRef?.difficulty === 'medium' ? 2 : 0;
  // Scenario difficulty bonus
  const scenarioDiffBonus = q.scenDifficulty === 'hard' ? 8 : q.scenDifficulty === 'medium' ? 4 : 0;
  const total = Math.round((base + comboBonus + firstTryBonus + speedBonus + masteryBonus + difficultyBonus + scenarioDiffBonus) * mode.xpMult);
  state.player.xp += total;
  session.xpEarnedThisSession += total;
  session.xpBreakdown.base += Math.round(base * mode.xpMult);
  session.xpBreakdown.combo += Math.round(comboBonus * mode.xpMult);
  session.xpBreakdown.firstTry += Math.round(firstTryBonus * mode.xpMult);
  session.xpBreakdown.speed += Math.round(speedBonus * mode.xpMult);
  session.xpBreakdown.mastery += Math.round(masteryBonus * mode.xpMult);
  session.xpBreakdown.difficulty += Math.round((difficultyBonus + scenarioDiffBonus) * mode.xpMult);
  return total;
}
function checkLevelUp() {
  const newLevel = levelFromXp(state.player.xp);
  const leveled = newLevel > state.player.level;
  const oldLevel = state.player.level;
  state.player.level = newLevel;
  return leveled ? { from: oldLevel, to: newLevel } : null;
}

// ============= BADGES =============
const BADGES = [
  { id: 'first_ride', icon: '🚴', name: 'First Ride', desc: 'Kickstand up. Let\'s go.', hint: 'Complete your first quiz',
    check: (ctx) => ctx.kind === 'session_end' && state.player.stats.sessionsPlayed >= 1 },
  { id: 'granny_gear', icon: '🚵', name: 'Granny Gear', desc: 'Lowest gear, steady climb.', hint: 'Get 10 correct in a row',
    check: () => state.player.streak >= 10 },
  { id: 'full_pedal', icon: '💨', name: 'Full Pedal', desc: 'No coasting.', hint: 'Get 25 correct in a row',
    check: () => state.player.streak >= 25 },
  { id: 'drafting', icon: '🪁', name: 'Drafting', desc: 'Tuck in, follow the wheel.', hint: 'Hit a 5-combo in Speed Drill',
    check: () => session && session.mode === 'speed' && state.player.combo >= 5 },
  { id: 'true_wheel', icon: '⭕', name: 'True Wheel', desc: 'No wobble.', hint: '100% on a Quick Quiz round',
    check: (ctx) => ctx.kind === 'session_end' && session.mode === 'quick' && session.correctCount === session.questions.length && session.questions.length > 0 },
  { id: 'torque_wrench', icon: '🔩', name: 'Torque Wrench', desc: 'Precision to spec.', hint: '100% on a Typing Challenge',
    check: (ctx) => ctx.kind === 'session_end' && session.mode === 'typing' && session.correctCount === session.questions.length && session.questions.length > 0 },
  { id: 'tune_up_tech', icon: '🔧', name: 'Tune-Up Tech', desc: 'Tight cables, smooth shifts.', hint: 'Ace the Weak Spot Tune-Up',
    check: (ctx) => ctx.kind === 'session_end' && session.mode === 'tuneup' && session.correctCount === session.questions.length && session.questions.length > 0 },
  { id: 'century_rider', icon: '💯', name: 'Century Rider', desc: '100 miles logged.', hint: 'Answer 100 questions total',
    check: () => state.player.stats.totalAnswered >= 100 },
  { id: 'gran_fondo', icon: '🏔️', name: 'Gran Fondo', desc: 'Long day in the saddle.', hint: 'Answer 500 questions total',
    check: () => state.player.stats.totalAnswered >= 500 },
  { id: 'lanterne_rouge', icon: '🔴', name: 'Lanterne Rouge', desc: 'Finish the stage anyway.', hint: 'Complete a round after missing 3 in a row',
    check: (ctx) => ctx.kind === 'session_end' && session.longestWrongStreak >= 3 && session.correctCount > 0 },
  { id: 'shop_rat', icon: '🐀', name: 'Shop Rat', desc: 'In the shop every day.', hint: 'Play on 7 different days',
    check: () => getPlayDates().length >= 7 },
  { id: 'mechanic_of_year', icon: '🏆', name: 'Mechanic of the Year', desc: 'Trophy on the wall.', hint: 'Master 100+ terms (mastery 5)',
    check: () => { let c = 0; for (const k in state.terms) if (state.terms[k].mastery >= 5) c++; return c >= 100; } },
  { id: 'flashcard_fan', icon: '🃏', name: 'Flashcard Fan', desc: 'Turn, turn, turn.', hint: 'Complete 5 flashcard sessions',
    check: () => (state.player.stats.modeCompletions.flashcard || 0) >= 5 },
  { id: 'sprinter', icon: '🏎️', name: 'Sprinter', desc: 'Match five in a flash.', hint: 'Complete a Matching Sprint with 0 misses',
    check: (ctx) => ctx.kind === 'session_end' && session.mode === 'matching' && session.wrongMatches === 0 && session.questions.length > 0 },
  { id: 'sleuth', icon: '🕵️', name: 'Sleuth', desc: 'Spot the imposter.', hint: 'Ace a Confusables round',
    check: (ctx) => ctx.kind === 'session_end' && session.mode === 'confusables' && session.correctCount === session.questions.length && session.questions.length > 0 },
  { id: 'wordsmith', icon: '✏️', name: 'Wordsmith', desc: 'Right word, right blank.', hint: 'Ace a Fill the Blank round',
    check: (ctx) => ctx.kind === 'session_end' && session.mode === 'fill_blank' && session.correctCount === session.questions.length && session.questions.length > 0 },
  { id: 'daily_grinder', icon: '☀️', name: 'Daily Grinder', desc: 'Rain or shine.', hint: 'Complete the Daily Ride 3 days in a row',
    check: () => state.player.dailyStreak >= 3 },
  { id: 'week_commuter', icon: '🗓️', name: 'Week Commuter', desc: 'Show up every day.', hint: 'Daily streak of 7',
    check: () => state.player.dailyStreak >= 7 },
  { id: 'sr_graduate', icon: '🎓', name: 'SR Graduate', desc: 'Memory on schedule.', hint: 'Complete a Due for Review round',
    check: (ctx) => ctx.kind === 'session_end' && session.mode === 'due_review' && session.correctCount > 0 },
  // V3 new badges
  { id: 'diagnostician', icon: '🔬', name: 'Diagnostician', desc: 'Reads the symptoms, finds the cause.', hint: 'Ace a Diagnostic Cases round',
    check: (ctx) => ctx.kind === 'session_end' && session.mode === 'scenario' && session.correctCount === session.questions.length && session.questions.length > 0 },
  { id: 'transfer_master', icon: '🧰', name: 'Transfer Master', desc: 'Real cases, real skill.', hint: 'Complete 10 diagnostic scenarios',
    check: () => (state.player.stats.scenariosCompleted || 0) >= 10 },
  { id: 'self_checker', icon: '🧠', name: 'Self-Checker', desc: 'Know what you don\'t know.', hint: 'Complete 3 Self-Check batches',
    check: () => (state.player.stats.selfCheckBatches || 0) >= 3 },
  { id: 'metacognitive', icon: '🔮', name: 'Metacognitive', desc: 'Tuned your confidence calibration.', hint: 'Clear 5 overconfidence flags',
    check: () => {
      let cleared = state.player.stats.overconfidenceSpots || 0;
      let active = 0;
      for (const k in state.terms) if ((state.terms[k].overconfidence || 0) > 0) active++;
      return cleared - active >= 5;
    } },
  { id: 'fixie', icon: '🚲', name: 'Fixie', desc: 'One gear. No skipping.', hint: '???', hidden: true,
    check: (ctx) => ctx.kind === 'session_end' && session.mode === 'boss' && session.skippedCount === 0 && session.questions.length >= 30 },
];

function checkBadges(kind) {
  const ctx = { kind };
  const newly = [];
  for (const b of BADGES) {
    if (state.player.badges[b.id]) continue;
    try { if (b.check(ctx)) { state.player.badges[b.id] = { earnedAt: Date.now() }; newly.push(b); } }
    catch (e) {}
  }
  return newly;
}

// ============= AUDIO =============
let audioCtx = null;
function getAudio() { if (audioCtx) return audioCtx; try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { audioCtx = null; } return audioCtx; }
function tone(freq, duration, type, gain, freqEnd) {
  if (state.player.muted) return;
  const ctx = getAudio(); if (!ctx) return;
  const o = ctx.createOscillator(); const g = ctx.createGain();
  o.type = type || 'sine';
  o.frequency.setValueAtTime(freq, ctx.currentTime);
  if (freqEnd) o.frequency.exponentialRampToValueAtTime(freqEnd, ctx.currentTime + duration);
  g.gain.setValueAtTime(gain || 0.15, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  o.connect(g).connect(ctx.destination);
  o.start(); o.stop(ctx.currentTime + duration);
}
function sfxCorrect() { tone(523, 0.10, 'sine', 0.18); setTimeout(() => tone(784, 0.10, 'sine', 0.18), 80); }
function sfxWrong() { tone(220, 0.18, 'sine', 0.18, 140); }
function sfxCombo(n) { if (n < 3) return; const freqs = [523, 659, 784]; freqs.forEach((f, i) => setTimeout(() => tone(f, 0.10, 'triangle', 0.14), i * 60)); }
function sfxLevelUp() { const notes = [523, 659, 784, 1047]; notes.forEach((f, i) => setTimeout(() => tone(f, 0.15, 'triangle', 0.18), i * 90)); }
function sfxBadge() { tone(880, 0.25, 'sine', 0.2, 660); }
function sfxStart() { tone(220, 0.25, 'triangle', 0.15, 440); }
function sfxTick() { tone(440, 0.04, 'sine', 0.10); }
function sfxFlip() { tone(660, 0.05, 'sine', 0.08, 880); }
function sfxReveal() { tone(392, 0.15, 'sine', 0.14, 587); }

// ============= HOST VOICE =============
const HOST_CORRECT = ['Smooth shift!', 'Right on spec.', 'Chainline is true.', 'Torqued to spec!', 'Nailed it — keep spinning.', 'Clean cable pull.', 'Tight and true.', 'That\'s the one.', 'Money shot.', 'Mechanic\'s eye!', 'Boom. Next gear.', 'Dialed in.', 'In the drops!', 'Keep that cadence up.', 'Well-greased.'];
const HOST_WRONG = ['Hang tight — we\'ll revisit it.', 'Bike rack it — we\'ll come back.', 'Off by a cog.', 'Close, but not torqued yet.', 'Tweak the cable, try again.', 'Not this one — back to the stand.', 'Swap that out and retry.', 'That one\'s in the parts bin for later.', 'We\'ll drill this one in.'];
const HOST_COMBO = ['You\'re on a roll!', 'Chain\'s spinning.', 'Keep the pace!', 'In the paceline now.', 'Gap is growing.', 'Off the front!', 'Nobody can catch you.'];
const HOST_SESSION_S = ['Perfect. Straight off the stand.', 'Chef\'s kiss — clean tune-up.', 'You just built a bike in your head.', 'Spin to win. Flawless.', 'That\'s race pace.'];
const HOST_SESSION_A = ['Strong ride. One or two knocks but the wheel is true.', 'Solid tune-up. Small adjustment and you\'re racing.', 'You could open a shop with that score.'];
const HOST_SESSION_B = ['Decent. Torque it a notch tighter next time.', 'Climbing well — steady pedal strokes.', 'Keep at it, the groove is forming.'];
const HOST_SESSION_C = ['You finished the stage — that counts.', 'Still in the peloton. Tomorrow\'s a new ride.', 'Regroup at the feed zone and try again.'];
const HOST_SESSION_D = ['Everyone bonks sometimes. Back on the saddle.', 'Take a lap — this ride was scouting.', 'That one was a prologue. Warm up, hit it again.'];
const HOST_INTRO = ['Welcome to the shop. Let\'s tune some brain cells.', 'Grab an apron. Wrench time.', 'Kickstand up. Let\'s ride.', 'Time to spin some vocab.'];
const HOST_OVERCONFIDENT = ['Oof — you were sure on that one. That\'s the danger zone.', 'Confidence + miss = priority review. We\'ll come back hard.', 'Logged in the "thought I knew it" pile. Good — now you do.'];
const HOST_SCENARIO_CORRECT = ['Diagnosed. Customer rolls out happy.', 'Read the symptoms, found the cause.', 'That\'s what UBI trains — transfer.', 'Real shop thinking.'];
const HOST_SCENARIO_WRONG = ['Good guess, but the real mechanic\'s move is below.', 'This is why we run cases — transfer takes practice.', 'Close, but not the diagnosis.'];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function hostQuip(msg) {
  const el = document.getElementById('host-quip');
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('show');
  void el.offsetWidth;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 1800);
}
function hostSessionMessage(pct) {
  if (pct === 100) return pick(HOST_SESSION_S);
  if (pct >= 85) return pick(HOST_SESSION_A);
  if (pct >= 70) return pick(HOST_SESSION_B);
  if (pct >= 50) return pick(HOST_SESSION_C);
  return pick(HOST_SESSION_D);
}

// ============= DOM =============
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function showScreen(id) {
  $$('.screen').forEach(s => s.classList.remove('active'));
  $('#screen-' + id).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'instant' });
}
function toast(msg, kind) {
  const el = document.createElement('div');
  el.className = 'toast ' + (kind || '');
  el.textContent = msg;
  $('#toast-layer').appendChild(el);
  setTimeout(() => { el.classList.add('fade'); setTimeout(() => el.remove(), 400); }, 3000);
}
function updateHud() {
  const lv = state.player.level;
  $('#hud-level').textContent = lv;
  $('#hud-rank').textContent = rankTitle(lv);
  const baseXp = totalXpForLevel(lv);
  const nextXp = totalXpForLevel(lv + 1);
  const progress = state.player.xp - baseXp;
  const span = nextXp - baseXp;
  const pct = Math.max(0, Math.min(100, (progress / span) * 100));
  $('#xp-fill').style.width = pct + '%';
  $('#xp-text').textContent = progress + ' / ' + span;
  $('#hud-streak').textContent = state.player.streak;
  $('#hud-combo').textContent = state.player.combo;
  $('#hud-daily').textContent = state.player.dailyStreak;
  $('.hud-stat.streak').classList.toggle('dim', state.player.streak < 2);
  $('.hud-stat.combo').classList.toggle('dim', state.player.combo < 2);
  $('.hud-stat.daily').classList.toggle('dim', state.player.dailyStreak < 1);
  $('#btn-mute').textContent = state.player.muted ? '🔕' : '🔔';
}
function showCombo(n) {
  const el = $('#combo-indicator');
  el.textContent = 'x' + n + ' COMBO!';
  el.classList.remove('show');
  void el.offsetWidth;
  el.classList.add('show');
}

function levelUpCelebration(lv) {
  sfxLevelUp();
  const overlay = $('#levelup-overlay');
  $('#levelup-title').textContent = 'GEAR UP!';
  $('#levelup-subtitle').textContent = 'Level ' + lv + ' — ' + rankTitle(lv);
  overlay.classList.remove('hide');
  overlay.classList.add('show');
  for (let i = 0; i < 24; i++) {
    const c = document.createElement('div');
    c.className = 'confetti';
    const angle = (Math.PI * 2 * i) / 24 + Math.random() * 0.3;
    const dist = 200 + Math.random() * 160;
    c.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
    c.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
    c.style.setProperty('--rot', (Math.random() * 1440 - 720) + 'deg');
    c.style.background = Math.random() < 0.5 ? 'var(--accent)' : 'var(--accent-2)';
    c.style.animationDelay = (Math.random() * 0.2) + 's';
    overlay.appendChild(c);
    setTimeout(() => c.remove(), 1500);
  }
  return new Promise(resolve => {
    const dismiss = () => {
      overlay.classList.remove('show');
      overlay.classList.add('hide');
      overlay.removeEventListener('click', dismiss);
      setTimeout(resolve, 240);
    };
    overlay.addEventListener('click', dismiss);
    setTimeout(dismiss, 2200);
  });
}

// ============= MENU =============
// V5: collect the user's top confusion pairs across all terms.
// Returns: array of { aId, aTerm, bId, bTerm, count }, sorted desc by count.
function topConfusionPairs(limit) {
  const pairs = {};
  for (const aId in state.terms) {
    const aStats = state.terms[aId];
    if (!aStats || !aStats.confusedWith) continue;
    for (const bId in aStats.confusedWith) {
      const count = aStats.confusedWith[bId] || 0;
      if (count <= 0) continue;
      // Symmetric key so a→b and b→a roll up.
      const key = Number(aId) < Number(bId) ? aId + '_' + bId : bId + '_' + aId;
      if (!pairs[key]) pairs[key] = { a: Number(aId), b: Number(bId), count: 0 };
      pairs[key].count += count;
    }
  }
  const out = Object.values(pairs)
    .map(p => ({
      aId: p.a, aTerm: TERMS_BY_ID[p.a] ? TERMS_BY_ID[p.a].term : '?',
      bId: p.b, bTerm: TERMS_BY_ID[p.b] ? TERMS_BY_ID[p.b].term : '?',
      count: p.count,
    }))
    .sort((x, y) => y.count - x.count);
  return limit ? out.slice(0, limit) : out;
}

function renderDashboard() {
  const dash = $('#dashboard');
  const due = countDue();
  const oc = countOverconfident();
  const mastered = Object.values(state.terms).filter(t => t.mastery >= 5).length;
  const learning = Object.values(state.terms).filter(t => t.mastery > 0 && t.mastery < 5).length;
  const acc = state.player.stats.totalAnswered > 0
    ? Math.round((state.player.stats.totalCorrect / state.player.stats.totalAnswered) * 100) : 0;
  // V5: Confusable Web summary
  const topPairs = topConfusionPairs(5);
  const totalConfusionEvents = topPairs.reduce((s, p) => s + p.count, 0);
  dash.innerHTML =
    `<div class="dash-card daily"><span class="dash-label">Daily Streak</span><span class="dash-value">${state.player.dailyStreak}</span><span class="dash-sub">${state.player.dailyStreak ? 'Keep it lit' : 'Play today'}</span></div>` +
    `<div class="dash-card due clickable" id="dash-due"><span class="dash-label">Due for Review</span><span class="dash-value">${due}</span><span class="dash-sub">${due > 0 ? 'Tap to study' : 'All caught up'}</span></div>` +
    (oc > 0 ? `<div class="dash-card overcon clickable" id="dash-oc"><span class="dash-label">Overconfident</span><span class="dash-value">${oc}</span><span class="dash-sub">High risk — review</span></div>` : '') +
    (topPairs.length > 0 ? `<div class="dash-card clickable" id="dash-confweb" style="border-left:3px solid var(--accent-3)"><span class="dash-label">🕸️ Confusable Web</span><span class="dash-value">${topPairs.length}</span><span class="dash-sub">${totalConfusionEvents} mix-up${totalConfusionEvents === 1 ? '' : 's'} · tap for list</span></div>` : '') +
    `<div class="dash-card"><span class="dash-label">Mastered</span><span class="dash-value">${mastered}</span><span class="dash-sub">of ${TERM_COUNT}</span></div>` +
    `<div class="dash-card"><span class="dash-label">Accuracy</span><span class="dash-value">${acc}%</span><span class="dash-sub">all-time</span></div>`;
  const dashDue = $('#dash-due');
  if (dashDue) dashDue.addEventListener('click', () => {
    if (due >= 5) startSession('due_review');
    else if (due > 0) toast(`Only ${due} due — need 5+ for review mode`, 'warn');
    else toast('Nothing due yet. Great job!', '');
  });
  const dashOc = $('#dash-oc');
  if (dashOc) dashOc.addEventListener('click', () => {
    if (oc >= 3) startSession('overcon_tuneup');
    else toast(`Need 3+ overconfident misses (have ${oc})`, 'warn');
  });
  const dashCw = $('#dash-confweb');
  if (dashCw) dashCw.addEventListener('click', () => showConfusableWebModal(topPairs));
}

// V5: modal listing the user's top confusion pairs. Each pair becomes a
// guaranteed distractor for that term until the user successfully discriminates.
function showConfusableWebModal(pairs) {
  const items = pairs.map(p => `
    <div class="cw-row" style="display:flex;justify-content:space-between;align-items:center;padding:10px;border-bottom:1px solid var(--border);">
      <span><strong>${escapeHtml(p.aTerm)}</strong> ↔ <strong>${escapeHtml(p.bTerm)}</strong></span>
      <span class="diff-badge ${p.count >= 3 ? 'hard' : (p.count >= 2 ? 'medium' : 'easy')}">${p.count} mix-up${p.count === 1 ? '' : 's'}</span>
    </div>
  `).join('');
  const html = `
    <p style="margin:0 0 14px 0;color:var(--text-dim)">These are the term pairs you've confused most. Each pair will appear as a guaranteed distractor in your next round — drill the discrimination directly.</p>
    <div style="background:var(--bg-elev-2);border-radius:10px;overflow:hidden">${items || '<div style="padding:14px;color:var(--text-dim)">No active confusions yet. Keep playing — the web builds itself.</div>'}</div>
    <p style="margin:14px 0 0 0;color:var(--text-faint);font-size:13px">Pairs decay one count per correct discrimination of the term being asked.</p>
  `;
  showModal('🕸️ Your Confusable Web', html, null, 'Got it', null);
}

function renderDailyBanner() {
  const wrap = $('#daily-banner-wrap');
  if (!dailyAvailable()) { wrap.innerHTML = ''; return; }
  wrap.innerHTML =
    `<div class="daily-banner">
      <div class="db-text">☀️ <strong>Daily Ride</strong> is ready — 10 questions, +50% XP, today only.</div>
      <button class="btn secondary" id="btn-start-daily">Start Daily</button>
    </div>`;
  $('#btn-start-daily').addEventListener('click', () => startSession('daily_ride'));
}

function renderZonesGrid() {
  const grid = $('#mode-grid-zones');
  if (!grid) return;
  ensureWheelhouseState();
  ensureAppendixState();
  ensureSuspensionState();
  grid.innerHTML = '';

  // --- Wheelhouse zone card ---
  const stagesDone = whCountStagesComplete();
  const bossDone = !!state.wheelhouse.boss?.completed;
  const totalStages = WHEELHOUSE.stages.length;
  const pct = whTotalProgressPct();
  const card = document.createElement('button');
  card.className = 'mode-card new-mode' + (stagesDone === 0 && !bossDone ? ' recommended' : '');
  card.innerHTML = `
    <div class="mode-icon">🛞</div>
    <h3 class="mode-name">The Wheelhouse</h3>
    <p class="mode-desc">Wheels &amp; Tires Mastery — 6 stages + boss. Separate WXP track.</p>
    <div class="mode-meta"><span>${stagesDone}/${totalStages} stages · ${bossDone ? 'boss ✓' : 'boss locked'}</span><span>${pct}% complete</span></div>
  `;
  card.addEventListener('click', () => { showScreen('wheelhouse'); renderWheelhouseHub(); });
  grid.appendChild(card);

  // --- Spec Vault (Appendix) zone card ---
  const aDone = appxCountStagesComplete();
  const aBossDone = !!state.appendix.boss?.completed;
  const aTotal = APPENDIX.stages.length;
  const aPct = appxTotalProgressPct();
  const aCard = document.createElement('button');
  aCard.className = 'mode-card new-mode' + (aDone === 0 && !aBossDone && stagesDone > 0 ? ' recommended' : '');
  aCard.innerHTML = `
    <div class="mode-icon">📑</div>
    <h3 class="mode-name">The Spec Vault</h3>
    <p class="mode-desc">Chart-driven appendix mastery — 4 stages + boss. Read the chart, choose the spec.</p>
    <div class="mode-meta"><span>${aDone}/${aTotal} stages · ${aBossDone ? 'boss ✓' : 'boss locked'}</span><span>${aPct}% complete</span></div>
  `;
  aCard.addEventListener('click', () => { showScreen('appendix'); renderAppendixHub(); });
  grid.appendChild(aCard);

  // --- Suspension Systems Mastery Zone card ---
  const sDone = suCountStagesComplete();
  const sBossDone = !!state.suspension.boss?.completed;
  const sTotal = SUSPENSION.stages.length;
  const sPct = suTotalProgressPct();
  const sCard = document.createElement('button');
  sCard.className = 'mode-card new-mode' + (sDone === 0 && !sBossDone && (stagesDone > 0 || aDone > 0) ? ' recommended' : '');
  sCard.innerHTML = `
    <div class="mode-icon">🛡️</div>
    <h3 class="mode-name">Suspension Systems Mastery Zone</h3>
    <p class="mode-desc">Forks, shocks, sag, damping — 6 stages + boss. Read the chart, feel the trail, dial it in.</p>
    <div class="mode-meta"><span>${sDone}/${sTotal} stages · ${sBossDone ? 'boss ✓' : 'boss locked'}</span><span>${sPct}% complete</span></div>
  `;
  sCard.addEventListener('click', () => { showScreen('suspension'); renderSuspensionHub(); });
  grid.appendChild(sCard);
}

function renderMenu() {
  renderDashboard();
  renderDailyBanner();
  renderWheelhouseBanner();
  renderZonesGrid();
  const recommended = getRecommendedMode();
  const categories = { train: 'mode-grid-train', drill: 'mode-grid-drill', apply: 'mode-grid-apply', focus: 'mode-grid-focus' };
  for (const cat in categories) {
    const grid = $('#' + categories[cat]);
    grid.innerHTML = '';
    for (const key of Object.keys(MODES)) {
      const m = MODES[key];
      if (m.category !== cat) continue;
      const unlocked = isModeUnlocked(m);
      const btn = document.createElement('button');
      let cls = 'mode-card' + (unlocked ? '' : ' locked');
      if (m.isNew) cls += ' new-mode';
      if (recommended === key && unlocked) cls += ' recommended';
      btn.className = cls;
      btn.disabled = !unlocked;
      const timeEst = m.questionCount * (m.timed ? (m.perQuestionMs / 1000 + 1) : 10);
      const mins = Math.max(1, Math.round(timeEst / 60));
      const countLabel = m.builder === 'matching' ? ' rounds' : (m.builder === 'scenario_v3' ? ' cases' : ' Qs');
      btn.innerHTML =
        '<div class="mode-icon">' + m.icon + '</div>' +
        '<h3 class="mode-name">' + m.name + '</h3>' +
        '<p class="mode-desc">' + m.desc + '</p>' +
        '<div class="mode-meta"><span>' + m.questionCount + countLabel + '</span><span>~' + mins + ' min</span></div>' +
        (unlocked ? '' : '<div class="mode-lock">' + unlockLabel(m) + '</div>');
      btn.addEventListener('click', () => { if (unlocked) startSession(m.id); });
      grid.appendChild(btn);
    }
  }
  const sub = $('#menu-subtitle');
  if (sub && !sub.dataset.seededToday) {
    sub.textContent = pick(HOST_INTRO);
    sub.dataset.seededToday = '1';
  }
}

function getRecommendedMode() {
  if (state.player.stats.totalAnswered === 0) return 'flashcard';
  if (countOverconfident() >= 3) return 'overcon_tuneup';
  if (dailyAvailable() && state.player.level >= 1) return 'daily_ride';
  if (countDue() >= 10) return 'due_review';
  if (state.player.stats.scenariosCompleted < 3 && isModeUnlocked(MODES.scenario)) return 'scenario';
  const weak = Object.values(state.terms).filter(t => t.attempts > 1 && t.correct / t.attempts < 0.6).length;
  if (weak >= 10 && isModeUnlocked(MODES.tuneup)) return 'tuneup';
  return 'quick';
}

// ============= SESSION =============
function startSession(modeId) {
  const mode = MODES[modeId];
  if (!mode) return;
  if (mode.daily && !dailyAvailable()) { toast('Daily Ride already completed today', 'warn'); return; }
  session = {
    mode: modeId,
    questions: [],
    currentIndex: -1,
    correctCount: 0,
    firstTryCorrect: 0,
    skippedCount: 0,
    longestWrongStreak: 0,
    currentWrongStreak: 0,
    wrongMatches: 0,
    startedAt: Date.now(),
    xpEarnedThisSession: 0,
    xpBreakdown: { base: 0, combo: 0, firstTry: 0, speed: 0, mastery: 0, difficulty: 0 },
    badgesEarnedThisSession: [],
    selfCheckPhase: null,
  };
  state.player.stats.sessionsPlayed++;
  state.player.combo = 0;

  // V5: reset position-bias buffer for this mode on session start so retries
  // produce a meaningfully different correct-position distribution.
  RAND.resetSessionEntropy('mc_t2d_' + modeId);
  RAND.resetSessionEntropy('mc_d2t_' + modeId);
  if (modeId === 'scenario') RAND.resetSessionEntropy('scenario');
  if (modeId === 'confusables') RAND.resetSessionEntropy('mc_confusables');

  // Self-check: prebuild the whole batch upfront — and shuffle on retry.
  if (modeId === 'self_check') {
    const batch = [];
    for (let i = 0; i < (mode.batchSize || 4); i++) {
      const term = pickNextTerm(mode);
      const q = buildQuestion(mode, term.id);
      q._termRef = term;
      q.startedAt = 0;
      batch.push(q);
    }
    // V5: shuffle the batch so two consecutive retries don't surface the same
    // 4 terms in the same order.
    session.questions = RAND.shuffle(batch);
    session.selfCheckPhase = 'answering';
  }

  showScreen('quiz');
  $('#quiz-mode-label').textContent = mode.icon + ' ' + mode.name;
  sfxStart();
  updateHud();
  nextQuestion();
}

function nextQuestion() {
  if (!session) return;
  answerLocked = false;
  clearTimeout(advanceTimer);
  clearInterval(speedTimer);
  hideFeedback();
  const mode = MODES[session.mode];

  if (session.mode === 'self_check' && session.selfCheckPhase === 'answering') {
    session.currentIndex++;
    if (session.currentIndex >= session.questions.length) {
      // Switch to review phase
      session.selfCheckPhase = 'reviewing';
      renderSelfCheckReview();
      return;
    }
    const q = session.questions[session.currentIndex];
    q.startedAt = Date.now();
    renderQuestion(q, mode);
    return;
  }

  session.currentIndex++;
  if (session.currentIndex >= mode.questionCount) { finishSession(); return; }

  // Scenario mode: no term to pick, build directly
  if (mode.builder === 'scenario_v3') {
    const q = buildQuestion(mode, null);
    q.startedAt = Date.now();
    session.questions.push(q);
    renderQuestion(q, mode);
    return;
  }

  // V5: Wrench Path — chain-driven, no term seed.
  if (mode.builder === 'wrench_path') {
    const q = buildQuestion(mode, null);
    q.startedAt = Date.now();
    session.questions.push(q);
    renderQuestion(q, mode);
    return;
  }

  const term = pickNextTerm(mode);
  const q = buildQuestion(mode, term.id);
  q._termRef = term;
  q.startedAt = Date.now();
  session.questions.push(q);
  renderQuestion(q, mode);
}

// ============= RENDER =============
function hideAllInputs() {
  $('#learn-block').classList.add('hidden');
  $('#quiz-prompt').classList.add('hidden');
  $('#flashcard-wrap').classList.add('hidden');
  $('#fc-rate-row').classList.add('hidden');
  $('#match-grid').classList.add('hidden');
  $('#quiz-answers-wrap').classList.add('hidden');
  $('#quiz-typing-wrap').classList.add('hidden');
  $('#quiz-fill-wrap').classList.add('hidden');
  $('#btn-quiz-submit').classList.add('hidden');
  $('#btn-quiz-next').classList.add('hidden');
  $('#scenario-block').classList.add('hidden');
  $('#selfcheck-answer-block').classList.add('hidden');
  $('#selfcheck-review-block').classList.add('hidden');
}

function renderQuestion(q, mode) {
  hideAllInputs();
  $('#quiz-counter').textContent = (session.currentIndex + 1) + ' / ' + (session.mode === 'self_check' ? session.questions.length : mode.questionCount);
  $('#quiz-progress-fill').style.width = ((session.currentIndex) / (session.mode === 'self_check' ? session.questions.length : mode.questionCount) * 100) + '%';

  const timerEl = $('#quiz-timer');
  if (mode.timed && q.kind !== 'self_check') {
    timerEl.classList.remove('hidden', 'urgent');
    const start = Date.now();
    const duration = mode.perQuestionMs;
    const tick = () => {
      const rem = Math.max(0, duration - (Date.now() - start));
      const secs = Math.ceil(rem / 1000);
      timerEl.textContent = '0:' + String(secs).padStart(2, '0');
      if (rem <= 3000) timerEl.classList.add('urgent');
      if (rem <= 3000 && Math.floor(rem / 1000) !== Math.floor((rem + 100) / 1000)) sfxTick();
      if (rem <= 0) { clearInterval(speedTimer); if (!answerLocked) submitAnswer(null); }
    };
    tick();
    speedTimer = setInterval(tick, 120);
  } else {
    timerEl.classList.add('hidden');
  }

  if (q.kind === 'flashcard') return renderFlashcard(q);
  if (q.kind === 'learn') return renderLearn(q);
  if (q.kind === 'matching') return renderMatching(q);
  if (q.kind === 'fill_blank') return renderFillBlank(q, TERMS_BY_ID[q.correctTermId]);
  if (q.kind === 'typing') return renderTyping(q, TERMS_BY_ID[q.correctTermId]);
  if (q.kind === 'confusables') return renderConfusables(q, TERMS_BY_ID[q.correctTermId]);
  if (q.kind === 'scenario_v3') return renderScenarioV3(q);
  if (q.kind === 'self_check') return renderSelfCheck(q);
  if (q.kind === 'wrench_path') return renderWrenchPath(q);
  return renderMC(q, TERMS_BY_ID[q.correctTermId]);
}

function renderPromptBlock(text, kind, refs, term, extras) {
  const prompt = $('#quiz-prompt');
  prompt.classList.remove('hidden', 'term', 'definition', 'scenario', 'fill-blank');
  prompt.classList.add(kind);
  let html;
  if (kind === 'fill-blank') html = (extras && extras.html) || escapeHtml(text);
  else html = escapeHtml(text);
  if (term && term.difficulty) html = `<div class="diff-badge-wrap"><span class="diff-badge ${term.difficulty}">${term.difficulty}</span></div>` + html;
  if (refs && refs.length > 0 && kind === 'term') html += '<span class="refs">' + refs.map(r => '[' + r + ']').join(' ') + '</span>';
  prompt.innerHTML = html;
}

function renderMC(q, term) {
  renderPromptBlock(q.promptText, q.promptKind === 'term' ? 'term' : 'definition', q.promptRefs, term);
  $('#quiz-answers-wrap').classList.remove('hidden');
  const area = $('#quiz-answers');
  area.innerHTML = '';
  const letters = ['A', 'B', 'C', 'D', 'E'];
  q.choices.forEach((c, i) => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.innerHTML = '<span class="letter">' + letters[i] + '</span><span>' + escapeHtml(c.text) + '</span>';
    btn.addEventListener('click', () => { if (!answerLocked) submitAnswer(i); });
    area.appendChild(btn);
  });
}

function renderConfusables(q, term) {
  renderPromptBlock(q.promptText, 'definition', q.promptRefs, term);
  $('#quiz-answers-wrap').classList.remove('hidden');
  const area = $('#quiz-answers');
  area.innerHTML = '';
  const letters = ['A', 'B'];
  q.choices.forEach((c, i) => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.innerHTML = '<span class="letter">' + letters[i] + '</span><span><strong>' + escapeHtml(c.text) + '</strong></span>';
    btn.addEventListener('click', () => { if (!answerLocked) submitAnswer(i); });
    area.appendChild(btn);
  });
}

function renderTyping(q, term) {
  renderPromptBlock(q.promptText, 'definition', q.promptRefs, term);
  $('#quiz-typing-wrap').classList.remove('hidden');
  $('#btn-quiz-submit').classList.remove('hidden');
  const input = $('#typing-input');
  const wrap = $('.typing-input-wrap');
  wrap.classList.remove('correct', 'wrong');
  input.value = '';
  input.disabled = false;
  input.focus();
  $('#typing-hint').textContent = 'Press Enter to submit';
}

function renderFillBlank(q, term) {
  renderPromptBlock(q.promptText || q.promptHtml, 'fill-blank', q.promptRefs, term, { html: q.promptHtml });
  const hintLine = `<div class="learn-label" style="margin-bottom:10px">Term: <strong style="color:var(--accent)">${escapeHtml(q.termHint || term.term)}</strong></div>`;
  $('#quiz-prompt').insertAdjacentHTML('afterbegin', hintLine);
  $('#quiz-fill-wrap').classList.remove('hidden');
  $('#btn-quiz-submit').classList.remove('hidden');
  const input = $('#fill-input');
  input.value = '';
  input.disabled = false;
  input.focus();
  $('.typing-input-wrap').classList.remove('correct', 'wrong');
  $('#fill-hint').textContent = 'Type the missing word · Enter to submit';
}

function renderFlashcard(q) {
  const term = TERMS_BY_ID[q.correctTermId];
  $('#flashcard-wrap').classList.remove('hidden');
  const fc = $('#flashcard');
  fc.classList.remove('flipped');
  $('#fc-term').textContent = term.term;
  $('#fc-def').textContent = term.definition;
  q._flipped = false;
  fc.onclick = () => {
    if (answerLocked) return;
    q._flipped = true;
    fc.classList.add('flipped');
    $('#fc-rate-row').classList.remove('hidden');
    sfxFlip();
  };
}

function renderLearn(q) {
  const term = TERMS_BY_ID[q.correctTermId];
  if (!q.learnShown) {
    $('#learn-block').classList.remove('hidden');
    $('#learn-term').textContent = term.term;
    $('#learn-def').textContent = term.definition;
    const hint = autoHint(term);
    if (hint) {
      $('#learn-hint').innerHTML = `<strong>Memory hook:</strong> ${hint}`;
      $('#learn-hint').style.display = 'block';
    } else {
      $('#learn-hint').style.display = 'none';
    }
    $('#btn-learn-got-it').onclick = () => { q.learnShown = true; renderMC(q, term); };
    return;
  }
  renderMC(q, term);
}

function renderMatching(q) {
  $('#match-grid').classList.remove('hidden');
  const colT = $('#match-col-terms');
  const colD = $('#match-col-defs');
  colT.innerHTML = '';
  colD.innerHTML = '';
  q.terms.forEach(t => {
    const el = document.createElement('button');
    el.className = 'match-item term-side';
    el.textContent = t.term;
    el.dataset.id = t.id;
    el.dataset.side = 'term';
    el.addEventListener('click', () => onMatchTap(q, el));
    colT.appendChild(el);
  });
  q.defs.forEach(d => {
    const el = document.createElement('button');
    el.className = 'match-item def-side';
    el.textContent = d.text;
    el.dataset.id = d.id;
    el.dataset.side = 'def';
    el.addEventListener('click', () => onMatchTap(q, el));
    colD.appendChild(el);
  });
  q._selected = null;
  q._matchColor = 0;
}
function onMatchTap(q, el) {
  if (el.classList.contains('matched-1') || el.classList.contains('matched-2') || el.classList.contains('matched-3') || el.classList.contains('matched-4') || el.classList.contains('matched-5')) return;
  if (answerLocked) return;
  if (!q._selected) { q._selected = el; el.classList.add('selected'); return; }
  if (q._selected === el) { el.classList.remove('selected'); q._selected = null; return; }
  if (q._selected.dataset.side === el.dataset.side) { q._selected.classList.remove('selected'); q._selected = el; el.classList.add('selected'); return; }
  const a = q._selected, b = el;
  if (a.dataset.id === b.dataset.id) {
    q._matchColor = (q._matchColor % 5) + 1;
    const cls = 'matched-' + q._matchColor;
    a.classList.remove('selected');
    a.classList.add(cls); b.classList.add(cls);
    a.disabled = true; b.disabled = true;
    q._selected = null;
    q.matched[a.dataset.id] = b.dataset.id;
    sfxCorrect();
    if (Object.keys(q.matched).length >= q.terms.length) setTimeout(() => finishMatchingRound(q), 500);
  } else {
    a.classList.add('wrong-flash'); b.classList.add('wrong-flash');
    sfxWrong();
    q.wrongCount++; session.wrongMatches++;
    setTimeout(() => { a.classList.remove('wrong-flash', 'selected'); b.classList.remove('wrong-flash'); }, 400);
    q._selected = null;
    state.player.combo = 0;
    updateHud();
  }
}
function finishMatchingRound(q) {
  answerLocked = true;
  for (const id of q.termIds) {
    const wasRight = q.matched[id] === String(id);
    onAnswer(Number(id), wasRight, wasRight, 0);
  }
  const mode = MODES[session.mode];
  const baseEach = 10;
  const wrongPenalty = q.wrongCount * 2;
  const clean = q.wrongCount === 0 ? 10 : 0;
  const total = Math.round((baseEach * q.termIds.length + clean - wrongPenalty) * mode.xpMult);
  state.player.xp += Math.max(0, total);
  session.xpEarnedThisSession += Math.max(0, total);
  session.xpBreakdown.base += baseEach * q.termIds.length;
  session.xpBreakdown.mastery += clean;
  session.correctCount++;
  const leveled = checkLevelUp();
  if (leveled) { persistNow(); setTimeout(() => levelUpCelebration(leveled.to), 400); }
  updateHud();
  persist();
  showMatchingFeedback(q);
  const nextBtn = $('#btn-quiz-next');
  nextBtn.classList.remove('hidden');
  nextBtn.onclick = () => nextQuestion();
}
function showMatchingFeedback(q) {
  const fb = $('#feedback');
  fb.classList.add('show');
  fb.classList.remove('wrong');
  fb.classList.add('correct');
  $('#fb-header').innerHTML = q.wrongCount === 0 ? '✓ Perfect round — <strong>clean sweep!</strong>' : `✓ Round complete · ${q.wrongCount} wrong match${q.wrongCount > 1 ? 'es' : ''}`;
  $('#fb-body').textContent = q.wrongCount === 0 ? pick(HOST_CORRECT) : 'Sort the tough ones again later.';
  $('#fb-hint').classList.add('hidden');
}

// ============= SCENARIO V3 =============
function renderScenarioV3(q) {
  $('#scenario-block').classList.remove('hidden');
  const block = $('#scenario-block');
  const diffBadge = q.scenDifficulty ? `<span class="diff-badge ${q.scenDifficulty}">${q.scenDifficulty}</span>` : '';

  // V5: pick a question-text variant (rephrase) every render so repeats look new.
  let qText = q.question;
  if (q.variants && q.variants.length > 0) {
    const picked = RAND.pickVariant(q.variants, 'scen_q_' + q.scenarioId, q.question);
    if (picked.text) qText = picked.text;
  }

  // V5: re-shuffle choices each render with bias guard. Multi-correct: predicate
  // matches any correct cell so the guard tracks at least one correct slot.
  const baseChoices = (q.baseChoices || q.choices).slice();
  q.choices = RAND.shuffleWithBiasGuard(baseChoices, (c) => !!c.correct, 'scenario');

  const multiHint = q.selectKind === 'multi' ? `<div class="scen-multi-hint">Pick <strong>${q.requiredCorrect}</strong> answers.</div>` : '';
  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
  block.innerHTML = `
    <div class="scen-diff">${diffBadge}</div>
    <div class="scen-story">${escapeHtml(q.story)}</div>
    <div class="scen-question">${escapeHtml(qText)}</div>
    ${multiHint}
    <div class="scen-choices" id="scen-choices"></div>
    <button class="btn primary scen-submit-btn" id="btn-scen-submit" disabled>Submit diagnosis</button>
  `;
  const choicesEl = $('#scen-choices');
  q.choices.forEach((c, i) => {
    const row = document.createElement('button');
    row.className = 'scen-choice';
    row.dataset.idx = i;
    row.innerHTML = `<span class="scen-check" aria-hidden="true"></span><span class="scen-letter">${letters[i]}</span><span class="scen-text">${escapeHtml(c.text)}</span>`;
    row.addEventListener('click', () => toggleScenChoice(q, i, row));
    choicesEl.appendChild(row);
  });
  $('#btn-scen-submit').addEventListener('click', () => submitScenario(q));
  q._selectedIdxs = [];
}

function toggleScenChoice(q, idx, el) {
  if (answerLocked) return;
  if (q.selectKind === 'single') {
    q._selectedIdxs = [idx];
    $$('.scen-choice').forEach(e => e.classList.remove('selected'));
    el.classList.add('selected');
  } else {
    const i = q._selectedIdxs.indexOf(idx);
    if (i >= 0) { q._selectedIdxs.splice(i, 1); el.classList.remove('selected'); }
    else {
      if (q._selectedIdxs.length >= q.requiredCorrect) {
        toast(`Only pick ${q.requiredCorrect}`, '');
        return;
      }
      q._selectedIdxs.push(idx);
      el.classList.add('selected');
    }
  }
  const btn = $('#btn-scen-submit');
  const needed = q.selectKind === 'multi' ? q.requiredCorrect : 1;
  btn.disabled = q._selectedIdxs.length !== needed;
}

function submitScenario(q) {
  if (answerLocked) return;
  const needed = q.selectKind === 'multi' ? q.requiredCorrect : 1;
  if (q._selectedIdxs.length !== needed) return;
  answerLocked = true;
  q.timeMs = Date.now() - q.startedAt;
  // Compute correctness: picked set must match correct set exactly
  const pickedSet = new Set(q._selectedIdxs);
  const correctSet = new Set();
  q.choices.forEach((c, i) => { if (c.correct) correctSet.add(i); });
  let correct = true;
  if (pickedSet.size !== correctSet.size) correct = false;
  else for (const i of pickedSet) if (!correctSet.has(i)) { correct = false; break; }
  q.correct = correct;
  q.userAnswer = q._selectedIdxs;

  // Visual feedback on choices
  $$('.scen-choice').forEach((el, i) => {
    el.disabled = true;
    if (correctSet.has(i)) el.classList.add('correct');
    else if (pickedSet.has(i)) el.classList.add('wrong');
    else el.classList.add('dim');
  });
  $('#btn-scen-submit').classList.add('hidden');

  onScenarioAnswer(q, correct);
  if (correct) {
    session.correctCount++;
    session.firstTryCorrect++;
    session.currentWrongStreak = 0;
    sfxCorrect();
    hostQuip(pick(HOST_SCENARIO_CORRECT));
    awardXp(q, true);
    if (state.player.combo >= 3) { showCombo(state.player.combo); sfxCombo(state.player.combo); }
    const newBadges = checkBadges('during');
    for (const b of newBadges) { session.badgesEarnedThisSession.push(b); toast('🏆 ' + b.name + ' unlocked!', 'badge'); sfxBadge(); }
    const leveled = checkLevelUp();
    if (leveled) { persistNow(); setTimeout(() => levelUpCelebration(leveled.to), 400); }
  } else {
    sfxWrong();
    hostQuip(pick(HOST_SCENARIO_WRONG));
    session.currentWrongStreak++;
    if (session.currentWrongStreak > session.longestWrongStreak) session.longestWrongStreak = session.currentWrongStreak;
  }
  // Always show the "why"
  showScenarioFeedback(q, correct);
  updateHud();
  persist();
  const nextBtn = $('#btn-quiz-next');
  nextBtn.classList.remove('hidden');
  nextBtn.onclick = () => nextQuestion();
}

function showScenarioFeedback(q, correct) {
  const fb = $('#feedback');
  fb.classList.remove('hidden');
  fb.classList.add('show');
  fb.classList.toggle('correct', correct);
  fb.classList.toggle('wrong', !correct);
  $('#fb-header').innerHTML = correct ? '✓ Diagnosed correctly' : '✗ Not the diagnosis';
  $('#fb-body').innerHTML = `<div class="scen-why">${q.why}</div>`;
  const hint = $('#fb-hint');
  if (q.terms && q.terms.length > 0) {
    hint.classList.remove('hidden');
    hint.innerHTML = `<span class="hint-label">Terms exercised</span>${q.terms.map(t => `<span class="term-chip">${escapeHtml(t)}</span>`).join(' ')}`;
  } else {
    hint.classList.add('hidden');
  }
}

// ============= WRENCH PATH (V5) =============
// Multi-step branching diagnostic chains. The "question" is a whole chain;
// the renderer walks the user through internal steps and only completes the
// outer session question when the chain reaches an end node.
function renderWrenchPath(q) {
  const chain = window.WRENCH_PATH.byId[q.chainId];
  if (!chain) { toast('Chain not found', 'warn'); nextQuestion(); return; }
  const stepId = q._stepId || 'start';
  const step = chain.steps[stepId];
  if (!step) { toast('Chain step not found', 'warn'); nextQuestion(); return; }

  // End node? Show the chain-end summary, award credit, and move on.
  if (step.end) {
    finishWrenchChain(q, chain, step);
    return;
  }

  $('#scenario-block').classList.remove('hidden');
  const block = $('#scenario-block');
  // Step number from the prompt prefix is informational only — derived per-step.
  const totalSteps = Object.values(chain.steps).filter(s => !s.end).length;
  const stepIdx = q._stepLog.length + 1;
  // V5: shuffle the choices each time the step is shown, with bias guard.
  const baseChoices = step.choices.slice();
  const shuffled = RAND.shuffleWithBiasGuard(baseChoices, (c) => !!c.correct, 'wrench_' + chain.id + '_' + stepId);
  q._currentChoices = shuffled;
  q._currentStep = step;

  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
  block.innerHTML = `
    <div class="scen-diff"><span class="diff-badge medium">🛠️ ${escapeHtml(chain.title)} — step ${stepIdx} of ${totalSteps}</span></div>
    <div class="scen-story">${escapeHtml(chain.story)}</div>
    <div class="scen-question">${escapeHtml(step.prompt)}</div>
    <div class="scen-choices" id="scen-choices"></div>
    <button class="btn primary scen-submit-btn" id="btn-scen-submit" disabled>Take this step →</button>
  `;
  const choicesEl = $('#scen-choices');
  shuffled.forEach((c, i) => {
    const row = document.createElement('button');
    row.className = 'scen-choice';
    row.dataset.idx = i;
    row.innerHTML = `<span class="scen-check" aria-hidden="true"></span><span class="scen-letter">${letters[i]}</span><span class="scen-text">${escapeHtml(c.text)}</span>`;
    row.addEventListener('click', () => {
      if (answerLocked) return;
      $$('.scen-choice').forEach(e => e.classList.remove('selected'));
      row.classList.add('selected');
      q._pickedIdx = i;
      $('#btn-scen-submit').disabled = false;
    });
    choicesEl.appendChild(row);
  });
  $('#btn-scen-submit').addEventListener('click', () => submitWrenchStep(q, chain));
  q._pickedIdx = null;
  answerLocked = false;
}

function submitWrenchStep(q, chain) {
  if (answerLocked) return;
  if (q._pickedIdx == null) return;
  answerLocked = true;
  const choices = q._currentChoices;
  const picked = choices[q._pickedIdx];
  const correctIdx = choices.findIndex(c => c.correct);
  // Highlight: correct (always) + wrong (if user picked wrong) + dim others.
  $$('.scen-choice').forEach((el, i) => {
    el.disabled = true;
    if (i === correctIdx) el.classList.add('correct');
    else if (i === q._pickedIdx && !picked.correct) el.classList.add('wrong');
    else el.classList.add('dim');
  });
  $('#btn-scen-submit').classList.add('hidden');

  const stepResult = picked.correct ? 'correct' : 'wrong';
  q._stepLog.push({ stepId: q._stepId, picked: picked.text, correct: picked.correct });
  if (!picked.correct) q._wrongSteps++;

  // Show step feedback (right answer + teach note for wrong picks).
  const fb = $('#feedback');
  fb.classList.remove('hidden');
  fb.classList.add('show');
  fb.classList.toggle('correct', picked.correct);
  fb.classList.toggle('wrong', !picked.correct);
  $('#fb-header').innerHTML = picked.correct ? '✓ Right step' : '✗ Off-path';
  let body = '';
  if (!picked.correct && picked.teach) body += `<div class="scen-why">${escapeHtml(picked.teach)}</div>`;
  if (!picked.correct) {
    body += `<div class="scen-why" style="margin-top:6px"><strong>The right step here:</strong> ${escapeHtml(choices[correctIdx].text)}</div>`;
  }
  $('#fb-body').innerHTML = body || '<div class="scen-why">Solid call. Continuing.</div>';
  $('#fb-hint').classList.add('hidden');

  if (picked.correct) sfxCorrect(); else sfxWrong();

  // Continue to the next step (chain teaches even on wrong picks).
  q._stepId = picked.next || 'end_wrong';
  const nextBtn = $('#btn-quiz-next');
  nextBtn.classList.remove('hidden');
  nextBtn.onclick = () => {
    fb.classList.remove('show');
    nextBtn.classList.add('hidden');
    answerLocked = false;
    renderWrenchPath(q);
  };
}

function finishWrenchChain(q, chain, endStep) {
  q._ended = true;
  // Chain success = ended on the explicit "end_correct" node OR no wrong steps.
  const success = (q._stepId === 'end_correct') || (q._wrongSteps === 0);
  q.correct = success;
  q.timeMs = Date.now() - q.startedAt;

  // Award mastery to all chain-tagged terms (mirrors scenario credit).
  for (const termLower of (chain.terms || [])) {
    const t = TERMS_BY_LOWER[termLower];
    if (!t) continue;
    const s = getTermStats(t.id);
    s.attempts++;
    s.lastSeenAt = Date.now();
    if (success) {
      s.correct++;
      s.lastCorrectAt = Date.now();
      s.mastery = Math.min(5, s.mastery + 1);
      s.cooldownUntil = Date.now() + SRS_INTERVALS[s.mastery];
      s.nextDueAt = s.cooldownUntil;
    } else {
      s.nextDueAt = Date.now();
    }
  }

  // XP scales with how few wrong steps were taken (5 base per step, +bonus).
  const mode = MODES[session.mode];
  const totalSteps = q._stepLog.length;
  const correctSteps = totalSteps - q._wrongSteps;
  const baseXp = 12 * correctSteps + (success ? 14 : 0);
  const xpGain = Math.round(baseXp * (mode ? mode.xpMult : 1));
  state.player.xp += xpGain;
  session.xpEarnedThisSession += xpGain;
  session.xpBreakdown.base += xpGain;

  if (success) {
    session.correctCount++;
    if (q._wrongSteps === 0) session.firstTryCorrect++;
    session.currentWrongStreak = 0;
    state.player.streak++;
    if (state.player.streak > state.player.bestStreak) state.player.bestStreak = state.player.streak;
    state.player.combo++;
  } else {
    session.currentWrongStreak++;
    if (session.currentWrongStreak > session.longestWrongStreak) session.longestWrongStreak = session.currentWrongStreak;
    state.player.streak = 0;
    state.player.combo = 0;
  }
  state.player.stats.totalAnswered++;
  if (success) state.player.stats.totalCorrect++;
  state.player.stats.wrenchPathChainsCompleted = (state.player.stats.wrenchPathChainsCompleted || 0) + 1;

  // Per-chain stats
  if (!state.wrenchPath.chainsCompleted[chain.id]) {
    state.wrenchPath.chainsCompleted[chain.id] = { attempts: 0, bestSteps: null, lastPlayedAt: 0 };
  }
  const cs = state.wrenchPath.chainsCompleted[chain.id];
  cs.attempts++;
  cs.lastPlayedAt = Date.now();
  if (success && (cs.bestSteps == null || q._wrongSteps < cs.bestSteps)) cs.bestSteps = q._wrongSteps;
  state.wrenchPath.totalAttempts = (state.wrenchPath.totalAttempts || 0) + 1;

  // Render the end-of-chain feedback panel.
  $('#scenario-block').classList.remove('hidden');
  const block = $('#scenario-block');
  block.innerHTML = `
    <div class="scen-diff"><span class="diff-badge ${success ? 'easy' : 'hard'}">${success ? '✓ Chain complete' : '✗ Off the path'}</span></div>
    <div class="scen-story">${escapeHtml(chain.story)}</div>
    <div class="scen-question" style="margin-top:14px;">${escapeHtml(endStep.summary || 'Chain finished.')}</div>
    <div class="scen-choices" style="display:flex;flex-direction:column;gap:8px;">
      <div class="scen-why" style="background:var(--bg-elev-2);padding:14px;border-radius:10px;">
        <strong>${success ? 'Path' : 'Coaching'}:</strong> ${q._wrongSteps === 0 ? 'Walked the full chain without a misstep.' : 'You took ' + q._wrongSteps + ' wrong step' + (q._wrongSteps === 1 ? '' : 's') + ' along the way — the chain still teaches every right move.'}
      </div>
      ${(chain.terms && chain.terms.length) ? `<div class="scen-why" style="background:var(--bg-elev-2);padding:10px 14px;border-radius:10px;">Terms exercised: ${chain.terms.map(t => `<span class="term-chip">${escapeHtml(t)}</span>`).join(' ')}</div>` : ''}
      <div class="scen-why" style="opacity:.8;">+${xpGain} XP</div>
    </div>
    <button class="btn primary scen-submit-btn" id="btn-scen-submit">Continue →</button>
  `;
  $('#btn-scen-submit').addEventListener('click', () => {
    persist();
    nextQuestion();
  });
  if (success) sfxLevelUp(); else sfxReveal();
  hostQuip(success ? pick(HOST_CORRECT) : pick(HOST_WRONG));
  updateHud();
  persist();
}

// ============= SELF-CHECK =============
function renderSelfCheck(q) {
  const term = TERMS_BY_ID[q.correctTermId];
  $('#selfcheck-answer-block').classList.remove('hidden');
  const block = $('#selfcheck-answer-block');
  block.innerHTML = `
    <div class="sc-hero">
      <div class="sc-prompt-label">Describe in your own words:</div>
      <div class="sc-term">${escapeHtml(term.term)}</div>
      ${term.refs && term.refs.length ? '<div class="sc-refs">' + term.refs.map(r => '[' + r + ']').join(' ') + '</div>' : ''}
    </div>
    <textarea id="sc-textarea" class="sc-textarea" placeholder="Explain what it is, what it does, or how you'd know it…" rows="4"></textarea>
    <div class="sc-confidence">
      <div class="sc-conf-label">How confident are you?</div>
      <div class="sc-conf-row" id="sc-conf-row">
        ${[1,2,3,4,5].map(n => `<button class="sc-conf-btn" data-val="${n}">${n}</button>`).join('')}
      </div>
      <div class="sc-conf-hint">1 = no idea · 5 = dead certain</div>
    </div>
    <button class="btn primary" id="btn-sc-next" disabled>Next →</button>
  `;
  const ta = $('#sc-textarea');
  const btn = $('#btn-sc-next');
  ta.value = '';
  ta.focus();
  q.userAnswer = '';
  q.confidence = 0;
  function checkReady() {
    btn.disabled = !(ta.value.trim().length >= 3 && q.confidence >= 1);
  }
  ta.addEventListener('input', () => { q.userAnswer = ta.value; checkReady(); });
  $$('.sc-conf-btn').forEach(b => {
    b.addEventListener('click', () => {
      $$('.sc-conf-btn').forEach(x => x.classList.remove('selected'));
      b.classList.add('selected');
      q.confidence = parseInt(b.dataset.val, 10);
      checkReady();
    });
  });
  btn.addEventListener('click', () => {
    if (q.userAnswer.trim().length < 3 || q.confidence < 1) return;
    q.timeMs = Date.now() - q.startedAt;
    nextQuestion();
  });
}

function renderSelfCheckReview() {
  hideAllInputs();
  $('#quiz-counter').textContent = 'Review';
  $('#quiz-progress-fill').style.width = '100%';
  $('#selfcheck-review-block').classList.remove('hidden');
  const block = $('#selfcheck-review-block');

  const rows = session.questions.map((q, i) => {
    const term = TERMS_BY_ID[q.correctTermId];
    return `
      <div class="sc-review-row" data-idx="${i}">
        <div class="sc-review-term">${escapeHtml(term.term)} <span class="sc-conf-badge">Conf: ${q.confidence}/5</span></div>
        <div class="sc-review-answers">
          <div class="sc-ans-side">
            <div class="sc-ans-label">Your answer</div>
            <div class="sc-ans-text">${escapeHtml(q.userAnswer)}</div>
          </div>
          <div class="sc-ans-side">
            <div class="sc-ans-label">Actual definition</div>
            <div class="sc-ans-text sc-ans-reveal">${escapeHtml(term.definition)}</div>
          </div>
        </div>
        <div class="sc-grade-row">
          <button class="sc-grade-btn spot_on" data-grade="spot_on"><strong>Spot-on</strong><span>+1 mastery</span></button>
          <button class="sc-grade-btn close" data-grade="close"><strong>Close</strong><span>±0 mastery</span></button>
          <button class="sc-grade-btn off" data-grade="off"><strong>Off</strong><span>-1 mastery</span></button>
        </div>
      </div>
    `;
  }).join('');

  block.innerHTML = `
    <div class="sc-review-intro">
      <div class="sc-review-title">Time to self-grade</div>
      <div class="sc-review-body">Compare your answers to the real definitions. Be honest — this is where the learning happens. If you rated yourself confident but your answer is off, we'll flag that term as <em>overconfident</em> and bump it in your review queue.</div>
    </div>
    ${rows}
    <button class="btn primary sc-submit-all" id="btn-sc-submit-all" disabled>Submit all grades</button>
  `;
  sfxReveal();

  const grades = {};
  $$('.sc-grade-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const row = btn.closest('.sc-review-row');
      const idx = parseInt(row.dataset.idx, 10);
      row.querySelectorAll('.sc-grade-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      grades[idx] = btn.dataset.grade;
      const done = Object.keys(grades).length === session.questions.length;
      $('#btn-sc-submit-all').disabled = !done;
    });
  });
  $('#btn-sc-submit-all').addEventListener('click', () => {
    if (Object.keys(grades).length !== session.questions.length) return;
    applySelfCheckGrades(grades);
  });
}

function applySelfCheckGrades(grades) {
  let anyOvercon = false;
  for (let i = 0; i < session.questions.length; i++) {
    const q = session.questions[i];
    const grade = grades[i];
    q.selfGrade = grade;
    q.correct = grade !== 'off';
    onSelfCheckAnswer(q.correctTermId, grade, q.confidence);
    if (q.correct) {
      session.correctCount++;
      if (grade === 'spot_on') session.firstTryCorrect++;
      const mode = MODES.self_check;
      const gain = Math.round((grade === 'spot_on' ? 14 : grade === 'close' ? 8 : 2) * mode.xpMult);
      state.player.xp += gain;
      session.xpEarnedThisSession += gain;
      session.xpBreakdown.base += gain;
    }
    if (q.confidence >= 4 && grade === 'off') anyOvercon = true;
  }
  state.player.stats.selfCheckBatches = (state.player.stats.selfCheckBatches || 0) + 1;
  if (anyOvercon) toast('⚠️ Overconfidence flag set — those terms will come back harder', 'badge');
  const leveled = checkLevelUp();
  if (leveled) { persistNow(); setTimeout(() => levelUpCelebration(leveled.to), 400); }
  persist();
  finishSession();
}

// ============= SUBMIT (MC / TYPING / FILL / CONFUSABLES / LEARN / FLASHCARD handled elsewhere) =============
function submitAnswer(choice) {
  if (!session || answerLocked) return;
  answerLocked = true;
  clearInterval(speedTimer);
  const q = session.questions[session.currentIndex];
  q.timeMs = Date.now() - q.startedAt;
  const term = TERMS_BY_ID[q.correctTermId];
  let correct = false;

  if (q.kind === 'mc' || q.kind === 'confusables' || q.kind === 'learn') {
    if (choice !== null) { q.userAnswer = choice; correct = q.choices[choice].termId === q.correctTermId; }
    const btns = $$('#quiz-answers .answer-btn');
    const correctIdx = q.choices.findIndex(c => c.termId === q.correctTermId);
    btns.forEach((b, i) => {
      b.disabled = true;
      if (i === correctIdx) b.classList.add('correct');
      else if (i === choice) b.classList.add('wrong');
      else b.classList.add('dim');
    });
    // V5: Confusable Web — record specific wrong-pick pairs for targeted drilling.
    if (q.correctTermId) {
      const stats = getTermStats(q.correctTermId);
      if (!correct && choice !== null) {
        const wrongTermId = q.choices[choice].termId;
        if (wrongTermId && wrongTermId !== q.correctTermId) {
          stats.confusedWith[wrongTermId] = (stats.confusedWith[wrongTermId] || 0) + 1;
        }
      } else if (correct) {
        // Discrimination success — decay all confusion counts for this term.
        for (const k of Object.keys(stats.confusedWith)) {
          stats.confusedWith[k] = Math.max(0, (stats.confusedWith[k] || 0) - 1);
          if (stats.confusedWith[k] === 0) delete stats.confusedWith[k];
        }
      }
    }
  } else if (q.kind === 'typing') {
    const input = $('#typing-input');
    const typed = input.value;
    q.userAnswer = typed;
    correct = typingMatches(typed, q.correctAnswer);
    input.disabled = true;
    const wrap = $('.typing-input-wrap');
    wrap.classList.add(correct ? 'correct' : 'wrong');
    $('#typing-hint').textContent = correct ? '✓ ' + q.correctAnswer : '✗ Answer: ' + q.correctAnswer;
  } else if (q.kind === 'fill_blank') {
    const input = $('#fill-input');
    const typed = input.value;
    q.userAnswer = typed;
    correct = fillMatches(typed, q.correctAnswer);
    input.disabled = true;
    const wrap = $('.typing-input-wrap');
    wrap.classList.add(correct ? 'correct' : 'wrong');
    $('#fill-hint').textContent = correct ? '✓ ' + q.correctAnswer : '✗ Answer: ' + q.correctAnswer;
  }

  q.correct = correct;
  onAnswer(q.termId, correct, true, q.timeMs);
  if (correct) {
    session.correctCount++;
    session.firstTryCorrect++;
    session.currentWrongStreak = 0;
    sfxCorrect();
    hostQuip(pick(HOST_CORRECT));
    awardXp(q, true);
    if (state.player.combo >= 3) {
      showCombo(state.player.combo);
      sfxCombo(state.player.combo);
      if (state.player.combo % 5 === 0) hostQuip(pick(HOST_COMBO));
    }
    const newBadges = checkBadges('during');
    for (const b of newBadges) { session.badgesEarnedThisSession.push(b); toast('🏆 ' + b.name + ' unlocked!', 'badge'); sfxBadge(); }
    const leveled = checkLevelUp();
    if (leveled) { persistNow(); setTimeout(() => levelUpCelebration(leveled.to), 400); }
    showFeedback(true, q, term);
  } else {
    sfxWrong();
    session.currentWrongStreak++;
    if (session.currentWrongStreak > session.longestWrongStreak) session.longestWrongStreak = session.currentWrongStreak;
    showFeedback(false, q, term);
  }
  updateHud();
  persist();
  const mode = MODES[session.mode];
  const autoAdvance = correct && !mode.timed ? 1400 : (correct ? 1100 : (mode.timed ? 1800 : null));
  if (autoAdvance) { advanceTimer = setTimeout(nextQuestion, autoAdvance); }
  else {
    const nextBtn = $('#btn-quiz-next');
    nextBtn.classList.remove('hidden');
    nextBtn.onclick = () => nextQuestion();
  }
}

function showFeedback(correct, q, term) {
  const fb = $('#feedback');
  fb.classList.remove('hidden');
  fb.classList.add('show');
  fb.classList.toggle('correct', correct);
  fb.classList.toggle('wrong', !correct);
  const header = $('#fb-header');
  const body = $('#fb-body');
  const hint = $('#fb-hint');

  if (correct) {
    header.textContent = '✓ ' + pick(HOST_CORRECT);
    if (q.kind === 'mc' || q.kind === 'learn' || q.kind === 'confusables') body.innerHTML = `<strong>${escapeHtml(term.term)}</strong> — ${escapeHtml(term.definition)}`;
    else if (q.kind === 'typing') body.innerHTML = `<strong>${escapeHtml(term.term)}</strong> is the one.`;
    else if (q.kind === 'fill_blank') body.innerHTML = `The missing word was <strong>${escapeHtml(q.correctAnswer)}</strong>.`;
    hint.classList.add('hidden');
  } else {
    header.textContent = '✗ ' + pick(HOST_WRONG);
    if (q.kind === 'fill_blank') body.innerHTML = `Answer: <strong>${escapeHtml(q.correctAnswer)}</strong>.`;
    else if (q.kind === 'typing') body.innerHTML = `Answer: <strong>${escapeHtml(q.correctAnswer)}</strong>.`;
    else body.innerHTML = `It's <strong>${escapeHtml(term.term)}</strong>:<br>${escapeHtml(term.definition)}`;
    const memHint = autoHint(term);
    if (memHint) { hint.classList.remove('hidden'); hint.innerHTML = `<span class="hint-label">Memory hook</span>${memHint}`; }
    else hint.classList.add('hidden');
  }
}
function hideFeedback() {
  const fb = $('#feedback');
  fb.classList.remove('show');
  setTimeout(() => fb.classList.add('hidden'), 100);
}

function skipQuestion() {
  if (!session || answerLocked) return;
  session.skippedCount++;
  if (session.mode === 'self_check' && session.selfCheckPhase === 'answering') {
    // Skipping self-check treats answer as empty / confidence 1
    const q = session.questions[session.currentIndex];
    if (!q.userAnswer) q.userAnswer = '(skipped)';
    if (!q.confidence) q.confidence = 1;
    q.timeMs = Date.now() - q.startedAt;
    nextQuestion();
    return;
  }
  submitAnswer(null);
}

function onFlashcardButton(rating) {
  if (!session || answerLocked) return;
  const q = session.questions[session.currentIndex];
  if (!q || q.kind !== 'flashcard') return;
  if (!q._flipped) { toast('Flip the card first', ''); return; }
  answerLocked = true;
  q.timeMs = Date.now() - q.startedAt;
  q.userAnswer = rating;
  q.correct = rating !== 'again';
  onFlashcardRate(q.termId, rating);
  if (q.correct) {
    session.correctCount++;
    if (rating === 'easy' || rating === 'good') session.firstTryCorrect++;
    sfxCorrect();
    hostQuip(rating === 'easy' ? 'Easy money.' : pick(HOST_CORRECT));
    const gain = Math.round((rating === 'easy' ? 12 : rating === 'good' ? 8 : 4) * MODES.flashcard.xpMult);
    state.player.xp += gain;
    session.xpEarnedThisSession += gain;
    session.xpBreakdown.base += gain;
    const newBadges = checkBadges('during');
    for (const b of newBadges) { session.badgesEarnedThisSession.push(b); toast('🏆 ' + b.name + ' unlocked!', 'badge'); sfxBadge(); }
    const leveled = checkLevelUp();
    if (leveled) { persistNow(); setTimeout(() => levelUpCelebration(leveled.to), 400); }
  } else {
    sfxWrong();
    session.currentWrongStreak++;
    hostQuip(pick(HOST_WRONG));
  }
  updateHud();
  persist();
  advanceTimer = setTimeout(nextQuestion, 900);
}

// ============= FINISH =============
function finishSession() {
  if (!session) return;
  clearInterval(speedTimer);
  const mc = state.player.stats.modeCompletions;
  mc[session.mode] = (mc[session.mode] || 0) + 1;
  state.meta.lastPlayedAt = Date.now();
  if (MODES[session.mode]?.daily) markDailyComplete();
  const newBadges = checkBadges('session_end');
  for (const b of newBadges) { session.badgesEarnedThisSession.push(b); sfxBadge(); }
  const seen = new Set();
  session.badgesEarnedThisSession = session.badgesEarnedThisSession.filter(b => { if (seen.has(b.id)) return false; seen.add(b.id); return true; });
  persistNow();
  renderResults();
}

function renderResults() {
  const total = session.questions.length;
  const mode = MODES[session.mode];
  const correct = session.correctCount;
  const effectiveTotal = mode.builder === 'matching' ? mode.questionCount : total;
  const pct = effectiveTotal ? Math.round(correct / effectiveTotal * 100) : 0;
  let grade = 'D';
  if (pct === 100) grade = 'S';
  else if (pct >= 90) grade = 'A';
  else if (pct >= 75) grade = 'B';
  else if (pct >= 60) grade = 'C';
  $('#results-grade').textContent = grade;
  $('#results-score').textContent = correct + ' / ' + effectiveTotal;
  $('#results-pct').textContent = pct + '% correct';
  $('#results-host-msg').textContent = '"' + hostSessionMessage(pct) + '"';

  const br = $('#xp-breakdown');
  const b = session.xpBreakdown;
  const lines = [
    ['Base', b.base], ['Combo bonus', b.combo], ['First try', b.firstTry],
    ['Speed bonus', b.speed], ['Mastery bonus', b.mastery], ['Difficulty bonus', b.difficulty || 0],
  ].filter(l => l[1] > 0);
  const total_xp = lines.reduce((a, x) => a + x[1], 0);
  br.innerHTML = lines.map(l => '<div class="xp-line"><span>' + l[0] + '</span><span>+' + l[1] + ' XP</span></div>').join('') +
    '<div class="xp-line total"><span>Total</span><span>+' + total_xp + ' XP</span></div>';

  const badgeSec = $('#results-badges-section');
  if (session.badgesEarnedThisSession.length > 0) {
    badgeSec.classList.remove('hidden');
    $('#results-badges').innerHTML = session.badgesEarnedThisSession.map(bg =>
      '<div class="review-item"><span style="font-size:22px">' + bg.icon + '</span> <strong>' + bg.name + '</strong> — <span class="text-dim">' + bg.desc + '</span></div>'
    ).join('');
  } else badgeSec.classList.add('hidden');

  // Review: scenarios + wrong MC/typing/fill
  const reviewItems = [];
  for (const q of session.questions) {
    if (q.kind === 'matching') continue;
    if (q.kind === 'self_check') {
      const t = TERMS_BY_ID[q.correctTermId];
      if (q.selfGrade && q.selfGrade !== 'spot_on') {
        reviewItems.push(`<div class="review-item" data-expand><div class="term">${escapeHtml(t.term)} <span class="sc-grade-tag ${q.selfGrade}">${q.selfGrade.replace('_',' ')}</span></div><div class="def"><strong>Real:</strong> ${escapeHtml(t.definition)}<br><strong>You:</strong> ${escapeHtml(q.userAnswer || '(skipped)')}</div></div>`);
      }
    } else if (q.kind === 'scenario_v3' && !q.correct) {
      reviewItems.push(`<div class="review-item" data-expand><div class="term">${escapeHtml(SCENARIO_BY_ID[q.scenarioId]?.title || 'Scenario')}</div><div class="def">${q.why}</div></div>`);
    } else if (!q.correct && q.correctTermId) {
      const t = TERMS_BY_ID[q.correctTermId];
      const hint = autoHint(t);
      reviewItems.push(`<div class="review-item" data-expand><div class="term">${escapeHtml(t.term)}</div><div class="def">${escapeHtml(t.definition)}${hint ? `<br><br><em style="color:var(--accent)">💡 ${hint}</em>` : ''}</div></div>`);
    }
  }
  const reviewSec = $('#results-review-section');
  if (reviewItems.length > 0) {
    reviewSec.classList.remove('hidden');
    $('#results-review').innerHTML = reviewItems.slice(0, 8).join('');
    $$('#results-review .review-item').forEach(el => { el.addEventListener('click', () => el.classList.toggle('expanded')); });
  } else reviewSec.classList.add('hidden');

  const na = $('#next-action-wrap');
  const suggestion = suggestNextAction();
  if (suggestion) {
    na.innerHTML = `<div class="next-action"><div class="na-text">💡 ${suggestion.text}</div><button class="btn secondary" id="btn-next-action">${suggestion.btn}</button></div>`;
    $('#btn-next-action').addEventListener('click', () => {
      if (suggestion.action === 'mode') startSession(suggestion.mode);
      else if (suggestion.action === 'menu') { session = null; showScreen('menu'); renderMenu(); }
    });
  } else na.innerHTML = '';

  showScreen('results');
}

function suggestNextAction() {
  const due = countDue();
  const oc = countOverconfident();
  const weak = Object.values(state.terms).filter(t => t.attempts >= 2 && t.correct / t.attempts < 0.6).length;
  if (oc >= 3 && session.mode !== 'overcon_tuneup') return { text: `You have <strong>${oc} overconfidence flags</strong> — terms you were sure about but missed. High-leverage review.`, btn: 'Fix Blind Spots →', action: 'mode', mode: 'overcon_tuneup' };
  if (due >= 5 && session.mode !== 'due_review') return { text: `You have <strong>${due} terms due</strong> for review — spaced repetition says now.`, btn: 'Due Review →', action: 'mode', mode: 'due_review' };
  if (weak >= 8 && isModeUnlocked(MODES.tuneup) && session.mode !== 'tuneup') return { text: `<strong>${weak} weak terms</strong> could use a tune-up.`, btn: 'Weak Spot →', action: 'mode', mode: 'tuneup' };
  if (dailyAvailable() && session.mode !== 'daily_ride') return { text: `You haven't done today's <strong>Daily Ride</strong>.`, btn: 'Daily Ride →', action: 'mode', mode: 'daily_ride' };
  if (state.player.stats.scenariosCompleted < 5 && isModeUnlocked(MODES.scenario) && session.mode !== 'scenario') return { text: `Try <strong>Diagnostic Cases</strong> — they train transfer, the #1 predictor of test performance.`, btn: 'Diagnostics →', action: 'mode', mode: 'scenario' };
  if (session.correctCount / Math.max(1, session.questions.length) < 0.6) return { text: `Try <strong>Flashcards</strong> to reinforce this topic before drilling it again.`, btn: 'Flashcards →', action: 'mode', mode: 'flashcard' };
  return null;
}

// ============= GLOSSARY =============
let glossaryFilter = 'all';
function renderGlossary() {
  const strip = $('#alphabet-strip');
  strip.innerHTML = '';
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (const L of letters) {
    const btn = document.createElement('button');
    btn.textContent = L;
    const has = !!TERMS_BY_LETTER[L];
    if (!has) btn.classList.add('empty');
    btn.addEventListener('click', () => {
      if (!has) return;
      $('#glossary-search').value = '';
      renderGlossaryList('', L);
      setTimeout(() => {
        const first = document.querySelector('.glossary-item[data-letter="' + L + '"]');
        if (first) first.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    });
    strip.appendChild(btn);
  }
  renderGlossaryList('', null);
}
function renderGlossaryList(searchTerm, jumpLetter) {
  const list = $('#glossary-list');
  const q = (searchTerm || '').toLowerCase().trim();
  const filter = glossaryFilter;
  const now = Date.now();
  const items = GLOSSARY.filter(t => {
    if (q) { if (t.termLower.indexOf(q) < 0 && t.definition.toLowerCase().indexOf(q) < 0) return false; }
    if (filter !== 'all') {
      const s = state.terms[t.id];
      const m = s ? s.mastery : 0;
      if (filter === 'new' && m > 1) return false;
      if (filter === 'learning' && (m < 2 || m > 3)) return false;
      if (filter === 'mastered' && m < 4) return false;
      if (filter === 'due') { if (!s || s.mastery < 1 || !s.nextDueAt || s.nextDueAt > now) return false; }
      if (filter === 'overcon') { if (!s || !(s.overconfidence > 0)) return false; }
    }
    return true;
  });
  list.innerHTML = '';
  if (items.length === 0) { list.innerHTML = '<div style="padding:24px;text-align:center;color:var(--text-dim)">No terms match.</div>'; return; }
  const frag = document.createDocumentFragment();
  for (const t of items) {
    const s = state.terms[t.id] || defaultTermStats();
    const el = document.createElement('div');
    el.className = 'glossary-item';
    el.dataset.letter = t.firstLetter;
    const dots = [];
    for (let i = 0; i < 5; i++) dots.push('<div class="mastery-dot' + (i < s.mastery ? ' filled' : '') + '"></div>');
    const refsHtml = t.refs.length > 0 ? '<span class="ref">' + t.refs.map(r => '[' + r + ']').join(' ') + '</span>' : '';
    const diffBadge = `<span class="diff-badge ${t.difficulty}">${t.difficulty}</span>`;
    const ocBadge = (s.overconfidence || 0) > 0 ? '<span class="diff-badge hard" title="Overconfidence flagged">⚠️ overcon</span>' : '';
    const dueStr = s.nextDueAt && s.nextDueAt > now ? `In ${friendlyDuration(s.nextDueAt - now)}` : 'Due now';
    el.innerHTML =
      '<div class="row"><div><span class="term">' + escapeHtml(t.term) + '</span>' + refsHtml + ' ' + diffBadge + ' ' + ocBadge + '</div>' +
      '<div class="mastery-dots">' + dots.join('') + '</div></div>' +
      '<div class="def">' + escapeHtml(t.definition) + '</div>' +
      '<div class="details">' +
      '<div class="details-row"><span>Mastery</span><span>' + s.mastery + ' / 5</span></div>' +
      '<div class="details-row"><span>Attempts</span><span>' + s.attempts + (s.correct ? ' (' + s.correct + ' correct)' : '') + '</span></div>' +
      '<div class="details-row"><span>Next review</span><span>' + (s.mastery > 0 ? dueStr : '—') + '</span></div>' +
      ((s.overconfidence || 0) > 0 ? '<div class="details-row"><span>Overconfidence flags</span><span>' + s.overconfidence + '</span></div>' : '') +
      '</div>';
    el.addEventListener('click', () => el.classList.toggle('expanded'));
    frag.appendChild(el);
  }
  list.appendChild(frag);
}
function friendlyDuration(ms) {
  if (ms < 60000) return '<1 min';
  if (ms < 3600000) return Math.round(ms / 60000) + ' min';
  if (ms < 86400000) return Math.round(ms / 3600000) + ' hr';
  return Math.round(ms / 86400000) + ' days';
}

// ============= BADGES =============
function renderBadges() {
  const grid = $('#badge-grid');
  grid.innerHTML = '';
  for (const b of BADGES) {
    const earned = !!state.player.badges[b.id];
    if (b.hidden && !earned) {
      const el = document.createElement('div');
      el.className = 'badge-tile locked';
      el.innerHTML = '<span class="badge-icon">❓</span><div class="badge-name">???</div><div class="badge-desc">Secret badge</div>';
      grid.appendChild(el);
      continue;
    }
    const el = document.createElement('div');
    el.className = 'badge-tile ' + (earned ? 'earned' : 'locked');
    let dateText = '';
    if (earned && state.player.badges[b.id].earnedAt) dateText = '<div class="badge-date">Earned ' + new Date(state.player.badges[b.id].earnedAt).toLocaleDateString() + '</div>';
    el.innerHTML =
      '<span class="badge-icon">' + b.icon + '</span>' +
      '<div class="badge-name">' + b.name + '</div>' +
      '<div class="badge-desc">' + (earned ? b.desc : b.hint) + '</div>' +
      dateText;
    grid.appendChild(el);
  }
}

// ============= MODAL / INTRO =============
function showModal(title, bodyHtml, onConfirm, confirmText, cancelText) {
  $('#modal-title').textContent = title;
  $('#modal-body-content').innerHTML = bodyHtml;
  $('#modal-backdrop').classList.remove('hidden');
  const close = () => $('#modal-backdrop').classList.add('hidden');
  const confirmBtn = $('#modal-confirm');
  const cancelBtn = $('#modal-cancel');
  const newConfirm = confirmBtn.cloneNode(true);
  const newCancel = cancelBtn.cloneNode(true);
  newConfirm.textContent = confirmText || 'Confirm';
  newCancel.textContent = cancelText || 'Cancel';
  if (cancelText === null) newCancel.style.display = 'none';
  confirmBtn.parentNode.replaceChild(newConfirm, confirmBtn);
  cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);
  newConfirm.addEventListener('click', () => { close(); if (onConfirm) onConfirm(); });
  newCancel.addEventListener('click', close);
}
function confirmModal(title, body, onConfirm) { showModal(title, '<p>' + body + '</p>', onConfirm); }

function showIntro() {
  const html = `
    <p>Welcome to v5, apprentice. New in this version:</p>
    <ul>
      <li><strong>🛠️ Wrench Path</strong> — multi-step diagnostic chains. Symptom → first test → fix. Wrong steps still teach you the right move. 12 authored chains across drivetrain, brakes, wheels, and fit.</li>
      <li><strong>🕸️ Confusable Web</strong> — when you confuse term A for term B, the game remembers. Next time A appears, B is a guaranteed distractor. Drill discrimination directly. Decays one count per correct discrimination.</li>
      <li><strong>🔮 Why-Recall</strong> — once you've cleared a few diagnostic cases, ~1 in 5 surface as a "why is this answer right?" question instead. Reading the explanation becomes <em>producing</em> it.</li>
      <li><strong>Anti-memorization layer</strong> — answer choices shuffle on every render with a position-bias guard, scenarios get rephrased prompts on repeat, and used distractors rotate so the same wrong choices don't keep showing up.</li>
    </ul>
    <p><strong>Suggested rotation:</strong> Flashcards → Self-Check → Wheelhouse stages → Diagnostic Cases → Wrench Path → Due for Review daily.</p>
  `;
  showModal('🛠️ UBI Tune-Up v5 — Wrench Path', html, null, 'Let\'s ride', null);
}

// ============= UTIL =============
function escapeHtml(s) { return (s || '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch])); }

// ============= KEYBOARD =============
document.addEventListener('keydown', (e) => {
  const active = document.querySelector('.screen.active');
  if (!active) return;
  if (active.id === 'screen-quiz') {
    const q = session && session.questions[session.currentIndex];
    if (!q) return;
    if (session.mode === 'self_check' && session.selfCheckPhase === 'answering') {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        const btn = $('#btn-sc-next');
        if (btn && !btn.disabled) btn.click();
      } else if (!isNaN(parseInt(e.key)) && document.activeElement !== $('#sc-textarea')) {
        const v = parseInt(e.key);
        if (v >= 1 && v <= 5) {
          const btn = document.querySelector(`.sc-conf-btn[data-val="${v}"]`);
          if (btn) btn.click();
        }
      }
      return;
    }
    if (q.kind === 'flashcard') {
      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        const fc = $('#flashcard');
        if (!q._flipped) fc.click();
      } else if (!answerLocked && q._flipped) {
        const ratings = { '1': 'again', '2': 'hard', '3': 'good', '4': 'easy' };
        const r = ratings[e.key];
        if (r) { e.preventDefault(); onFlashcardButton(r); }
      }
      return;
    }
    if (answerLocked) {
      if (e.key === 'Enter' || e.key === ' ') {
        const nextBtn = $('#btn-quiz-next');
        if (!nextBtn.classList.contains('hidden')) { e.preventDefault(); nextBtn.click(); }
      }
      return;
    }
    if (q.kind === 'scenario_v3') {
      const keyMap = { '1': 0, '2': 1, '3': 2, '4': 3, '5': 4, '6': 5, 'a': 0, 'b': 1, 'c': 2, 'd': 3, 'e': 4, 'f': 5 };
      const idx = keyMap[e.key.toLowerCase()];
      if (idx !== undefined && idx < q.choices.length) {
        e.preventDefault();
        const btn = document.querySelector(`.scen-choice[data-idx="${idx}"]`);
        if (btn) btn.click();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const sub = $('#btn-scen-submit');
        if (sub && !sub.disabled) sub.click();
      }
      return;
    }
    if (q.kind === 'mc' || q.kind === 'confusables' || q.kind === 'learn') {
      if (q.kind === 'learn' && !q.learnShown) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('#btn-learn-got-it').click(); }
        return;
      }
      const keyMap = { '1': 0, '2': 1, '3': 2, '4': 3, 'a': 0, 'b': 1, 'c': 2, 'd': 3 };
      const idx = keyMap[e.key.toLowerCase()];
      if (idx !== undefined && idx < q.choices.length) { e.preventDefault(); submitAnswer(idx); }
    } else if (q.kind === 'typing' || q.kind === 'fill_blank') {
      if (e.key === 'Enter') { e.preventDefault(); submitAnswer(null); }
    }
  }
});

// ============= EVENTS =============
function bindUi() {
  $('#btn-mute').addEventListener('click', () => {
    state.player.muted = !state.player.muted;
    updateHud();
    persist();
    if (!state.player.muted) sfxCorrect();
  });
  $('#btn-home').addEventListener('click', () => {
    if (session) {
      const wasWheelhouse = !!session.isWheelhouse;
      const wasZone = session.zone || 'wheelhouse';
      confirmModal('Quit session?', 'Your progress so far will not count.', () => {
        session = null; state.player.combo = 0;
        updateHud();
        if (wasWheelhouse) {
          if (wasZone === 'appendix') { showScreen('appendix'); renderAppendixHub(); }
          else if (wasZone === 'suspension') { showScreen('suspension'); renderSuspensionHub(); }
          else { showScreen('wheelhouse'); renderWheelhouseHub(); }
        } else { showScreen('menu'); renderMenu(); }
      });
    } else { showScreen('menu'); renderMenu(); }
  });
  $('#btn-glossary').addEventListener('click', () => { showScreen('glossary'); renderGlossary(); });
  $('#btn-badges').addEventListener('click', () => { showScreen('badges'); renderBadges(); });
  $('#btn-howto').addEventListener('click', showIntro);
  $('#btn-reset').addEventListener('click', () => {
    confirmModal('Reset all progress?', 'All XP, levels, badges, mastery, AND Wheelhouse progress will be erased. Cannot be undone.', () => {
      state = DEFAULT_STATE();
      persistNow();
      try { localStorage.removeItem(DAILY_KEY); } catch (e) {}
      updateHud(); renderMenu();
      toast('Progress reset.', '');
    });
  });
  $('#btn-glossary-back').addEventListener('click', () => { showScreen('menu'); renderMenu(); });
  $('#btn-badges-back').addEventListener('click', () => { showScreen('menu'); renderMenu(); });
  // Wheelhouse hub buttons
  const whBack = $('#btn-wheelhouse-back');
  if (whBack) whBack.addEventListener('click', () => { showScreen('menu'); renderMenu(); });
  const whReset = $('#btn-wh-reset');
  if (whReset) whReset.addEventListener('click', () => {
    confirmModal('Reset Wheelhouse progress?', 'All Wheelhouse stage clears, WXP, and Wheelhouse badges will be erased. Main game progress is unaffected.', resetWheelhouseProgress);
  });
  // Spec Vault hub buttons
  const appxBack = $('#btn-appendix-back');
  if (appxBack) appxBack.addEventListener('click', () => { showScreen('menu'); renderMenu(); });
  const appxReset = $('#btn-appx-reset');
  if (appxReset) appxReset.addEventListener('click', () => {
    confirmModal('Reset Spec Vault progress?', 'All Spec Vault stage clears, WXP, and Spec Vault badges will be erased. Main game progress is unaffected.', resetAppendixProgress);
  });
  // Suspension hub buttons
  const suBack = $('#btn-suspension-back');
  if (suBack) suBack.addEventListener('click', () => { showScreen('menu'); renderMenu(); });
  const suReset = $('#btn-su-reset');
  if (suReset) suReset.addEventListener('click', () => {
    confirmModal('Reset Suspension progress?', 'All Suspension stage clears, WXP, and Suspension badges will be erased. Main game progress is unaffected.', resetSuspensionProgress);
  });
  $('#btn-quiz-quit').addEventListener('click', () => {
    const wasWheelhouse = session && session.isWheelhouse;
    const wasZone = session && session.zone;
    confirmModal('Quit session?', 'Your current session will be discarded.', () => {
      session = null; state.player.combo = 0;
      updateHud();
      if (wasWheelhouse) {
        if (wasZone === 'appendix') { showScreen('appendix'); renderAppendixHub(); }
        else if (wasZone === 'suspension') { showScreen('suspension'); renderSuspensionHub(); }
        else { showScreen('wheelhouse'); renderWheelhouseHub(); }
      } else { showScreen('menu'); renderMenu(); }
    });
  });
  $('#btn-quiz-skip').addEventListener('click', () => {
    if (session && session.isWheelhouse) {
      // Skipping a wheelhouse Q counts as wrong, queues for re-roll
      const q = session.questions[session.currentIndex];
      if (q && !answerLocked) {
        answerLocked = true;
        q.correct = false;
        q.userAnswer = '(skipped)';
        if (!q._isReroll) session.rerollQueue.push(q);
        if (q.id && !session.missedIds.includes(q.id)) session.missedIds.push(q.id);
        session.skippedCount++;
        showWHFeedback(q, false);
        const nextBtn = $('#btn-quiz-next');
        nextBtn.classList.remove('hidden');
        nextBtn.onclick = () => whNextQuestion();
      }
      return;
    }
    skipQuestion();
  });
  $('#btn-quiz-submit').addEventListener('click', () => {
    if (session && session.isWheelhouse) {
      const q = session.questions[session.currentIndex];
      if (q) submitWHAnswer(q);
      return;
    }
    if (!answerLocked) submitAnswer(null);
  });
  $('#btn-results-menu').addEventListener('click', () => {
    session = null; state.player.combo = 0;
    updateHud(); showScreen('menu'); renderMenu();
  });
  $('#btn-results-again').addEventListener('click', () => {
    if (!session) { showScreen('menu'); renderMenu(); return; }
    const m = session.mode;
    if (MODES[m]?.daily && !dailyAvailable()) { startSession('quick'); return; }
    startSession(m);
  });
  $('#glossary-search').addEventListener('input', (e) => renderGlossaryList(e.target.value, null));
  $('#mastery-filter').addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-chip');
    if (!btn) return;
    $$('#mastery-filter .filter-chip').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    glossaryFilter = btn.dataset.filter;
    renderGlossaryList($('#glossary-search').value, null);
  });
  $$('.fc-rate-btn').forEach(btn => { btn.addEventListener('click', () => onFlashcardButton(btn.dataset.rate)); });
}

// ============================================================
// ============== WHEELHOUSE ZONE (v4 — Wheels & Tires) ==========
// ============================================================
// Runs as its own zone — separate WXP track, separate badges,
// stage-gated progression, end-of-stage missed-question re-rolls.
// Reuses the #screen-quiz infrastructure but renders into
// #wheelhouse-block.

function whStageById(id) { return WH_STAGE_BY_ID[id] || null; }

function whIsStageUnlocked(stageId) {
  ensureWheelhouseState();
  const idx = WHEELHOUSE.stages.findIndex(s => s.id === stageId);
  if (idx <= 0) return true; // first stage always open
  const prevId = WHEELHOUSE.stages[idx - 1].id;
  return !!state.wheelhouse.stages[prevId]?.completed;
}
function whIsBossUnlocked() {
  ensureWheelhouseState();
  return WHEELHOUSE.stages.every(s => state.wheelhouse.stages[s.id]?.completed);
}

function whCountStagesComplete() {
  ensureWheelhouseState();
  let c = 0;
  for (const s of WHEELHOUSE.stages) if (state.wheelhouse.stages[s.id]?.completed) c++;
  return c;
}

function whTotalProgressPct() {
  ensureWheelhouseState();
  // 6 stages + 1 boss = 7 milestones
  const total = WHEELHOUSE.stages.length + 1;
  let done = whCountStagesComplete();
  if (state.wheelhouse.boss?.completed) done++;
  return Math.round(done / total * 100);
}

// ----- HUB -----
function renderWheelhouseHub() {
  ensureWheelhouseState();
  const grid = $('#wh-stage-grid');
  const stats = $('#wh-hero-stats');
  if (!grid || !stats) return;

  // Hero stats
  stats.innerHTML = `
    <div class="wh-stat"><span class="wh-stat-value">${state.wheelhouse.wxp}</span><span class="wh-stat-label">WXP</span></div>
    <div class="wh-stat"><span class="wh-stat-value">${whCountStagesComplete()}/${WHEELHOUSE.stages.length}</span><span class="wh-stat-label">Stages</span></div>
    <div class="wh-stat"><span class="wh-stat-value">${state.wheelhouse.boss?.completed ? '✓' : '—'}</span><span class="wh-stat-label">Boss</span></div>
  `;
  const pct = whTotalProgressPct();
  $('#wh-zone-progress').style.width = pct + '%';
  $('#wh-zone-progress-text').textContent = pct + '% complete' + (pct === 100 ? ' · Wheelhouse cleared!' : '');

  // Stage cards
  grid.innerHTML = '';
  WHEELHOUSE.stages.forEach((stage, idx) => {
    const st = state.wheelhouse.stages[stage.id];
    const unlocked = whIsStageUnlocked(stage.id);
    const complete = !!st?.completed;
    const inProgress = !!st?.started && !complete;
    const card = document.createElement('button');
    let cls = 'wh-stage-card';
    if (!unlocked) cls += ' locked';
    else if (complete) cls += ' complete';
    else if (inProgress) cls += ' in-progress';
    card.className = cls;
    card.disabled = !unlocked;

    let statusLabel = 'Locked', statusCls = 'locked';
    if (unlocked && complete) { statusLabel = `Cleared · ${st.bestScore}%`; statusCls = 'complete'; }
    else if (unlocked && inProgress) { statusLabel = `In progress · last ${st.lastScore}%`; statusCls = 'in-progress'; }
    else if (unlocked) { statusLabel = 'Ready'; statusCls = ''; }

    const stars = [];
    for (let i = 0; i < 3; i++) {
      const filled = (st?.bestScore || 0) >= [70, 85, 100][i];
      const gold = i === 2 && filled;
      stars.push(`<div class="wh-star ${filled ? (gold ? 'gold' : 'filled') : ''}"></div>`);
    }

    card.innerHTML = `
      <div style="display:flex;align-items:flex-start;gap:12px;justify-content:space-between">
        <div style="display:flex;align-items:center;gap:10px">
          <div class="wh-stage-icon">${stage.icon}</div>
          <div>
            <h3 class="wh-stage-name">Stage ${idx + 1} — ${escapeHtml(stage.name)}</h3>
            <p class="wh-stage-sub">${escapeHtml(stage.subtitle)}</p>
          </div>
        </div>
        <span class="wh-stage-status ${statusCls}">${statusLabel}</span>
      </div>
      <div class="wh-stage-blurb">${escapeHtml(stage.blurb)}</div>
      <div class="wh-stage-meta">
        <span>${stage.questions.length} Qs · pass ≥${Math.round((stage.passThreshold||0.7)*100)}%</span>
        <div class="wh-stage-stars">${stars.join('')}</div>
      </div>
    `;
    if (unlocked) card.addEventListener('click', () => startWheelhouseStage(stage.id));
    grid.appendChild(card);
  });

  // Boss card
  const bossUnlocked = whIsBossUnlocked();
  const bossSt = state.wheelhouse.boss;
  const bossCard = document.createElement('button');
  let bcls = 'wh-stage-card boss';
  if (!bossUnlocked) bcls += ' locked';
  if (bossSt?.completed) bcls += ' complete';
  bossCard.className = bcls;
  bossCard.disabled = !bossUnlocked;
  let bossStatus = 'Locked — clear all 6 stages first';
  let bossStatusCls = 'locked';
  if (bossUnlocked && bossSt?.completed) { bossStatus = `Boss cleared · best ${bossSt.bestScore}%`; bossStatusCls = 'complete'; }
  else if (bossUnlocked) { bossStatus = 'BOSS · ready'; bossStatusCls = 'boss'; }
  bossCard.innerHTML = `
    <div style="display:flex;align-items:flex-start;gap:12px;justify-content:space-between">
      <div style="display:flex;align-items:center;gap:10px">
        <div class="wh-stage-icon">${WHEELHOUSE.boss.icon}</div>
        <div>
          <h3 class="wh-stage-name">${escapeHtml(WHEELHOUSE.boss.name)}</h3>
          <p class="wh-stage-sub">${escapeHtml(WHEELHOUSE.boss.subtitle)}</p>
        </div>
      </div>
      <span class="wh-stage-status ${bossStatusCls}">${bossStatus}</span>
    </div>
    <div class="wh-stage-blurb">${escapeHtml(WHEELHOUSE.boss.blurb)}</div>
    <div class="wh-stage-meta">
      <span>${WHEELHOUSE.boss.rounds.length} rounds · pass ≥80%</span>
    </div>
  `;
  if (bossUnlocked) bossCard.addEventListener('click', () => startWheelhouseBoss());
  grid.appendChild(bossCard);
}

function renderWheelhouseBanner() {
  ensureWheelhouseState();
  const wrap = $('#wheelhouse-banner-wrap');
  if (!wrap) return;
  const pct = whTotalProgressPct();
  const recommended = nextWheelhouseRecommendation();
  if (!recommended) { wrap.innerHTML = ''; return; }
  wrap.innerHTML = `
    <div class="daily-banner" style="border-color:var(--accent-3);background:linear-gradient(135deg, rgba(167,139,250,0.10), rgba(78,211,247,0.04))">
      <div class="db-text">🛞 <strong>The Wheelhouse</strong> · ${pct}% complete · next up: <strong style="color:var(--accent-2)">${escapeHtml(recommended.label)}</strong></div>
      <button class="btn secondary" id="btn-open-wheelhouse-banner">Enter Zone →</button>
    </div>
  `;
  const btn = $('#btn-open-wheelhouse-banner');
  if (btn) btn.addEventListener('click', () => { showScreen('wheelhouse'); renderWheelhouseHub(); });
}

function nextWheelhouseRecommendation() {
  ensureWheelhouseState();
  for (const s of WHEELHOUSE.stages) {
    const st = state.wheelhouse.stages[s.id];
    if (!st?.completed) return { label: s.name };
  }
  if (!state.wheelhouse.boss?.completed) return { label: WHEELHOUSE.boss.name };
  return null;
}

// ----- STAGE SESSION -----
function startWheelhouseStage(stageId) {
  ensureWheelhouseState();
  const stage = whStageById(stageId);
  if (!stage) return;
  if (!whIsStageUnlocked(stageId)) { toast('Complete the previous stage first', 'warn'); return; }

  const stState = state.wheelhouse.stages[stageId];
  stState.started = true;
  stState.attempts = (stState.attempts || 0) + 1;
  stState.lastPlayedAt = Date.now();
  state.wheelhouse.totalAttempts = (state.wheelhouse.totalAttempts || 0) + 1;

  // V5: reset position-bias buffer for this stage so retakes start with a fresh
  // distribution (no carry-over from prior attempts).
  RAND.resetSessionEntropy('wh_' + stageId);

  // Shuffle the questions for variety on retake
  const qs = RAND.shuffle(stage.questions);
  // V5: also clear stale per-question session state from any prior attempt.
  for (const q of qs) {
    q._isReroll = false;
    q._selectedIdxs = undefined;
    q.userSelection = undefined;
    q.userAnswer = undefined;
    q.correct = false;
  }

  session = {
    mode: 'wheelhouse',
    zone: 'wheelhouse',
    isWheelhouse: true,
    isBoss: false,
    wheelhouseStageId: stageId,
    wheelhouseStage: stage,
    questions: qs,
    rerollQueue: [],
    inRerollPhase: false,
    currentIndex: -1,
    correctCount: 0,
    firstTryCorrect: 0,
    skippedCount: 0,
    longestWrongStreak: 0,
    currentWrongStreak: 0,
    startedAt: Date.now(),
    wxpEarned: 0,
    xpEarnedThisSession: 0,
    badgesEarnedThisSession: [],
    missedIds: [],
    answeredIds: [],
  };
  state.player.combo = 0;
  showScreen('quiz');
  $('#quiz-mode-label').textContent = stage.icon + ' Wheelhouse · ' + stage.name;
  sfxStart();
  updateHud();
  whNextQuestion();
}

function startWheelhouseBoss() {
  ensureWheelhouseState();
  if (!whIsBossUnlocked()) { toast('Clear all 6 stages to unlock the boss', 'warn'); return; }

  state.wheelhouse.boss.started = true;
  state.wheelhouse.boss.attempts = (state.wheelhouse.boss.attempts || 0) + 1;
  state.wheelhouse.boss.lastPlayedAt = Date.now();
  state.wheelhouse.totalAttempts = (state.wheelhouse.totalAttempts || 0) + 1;

  // V5: reset position-bias buffer for boss so retakes start fresh.
  RAND.resetSessionEntropy('wh_boss');

  // Boss intro modal first
  showModal('🏆 ' + WHEELHOUSE.boss.name, '<p>' + WHEELHOUSE.boss.intro + '</p>', () => {
    session = {
      mode: 'wheelhouse',
      zone: 'wheelhouse',
      isWheelhouse: true,
      isBoss: true,
      wheelhouseStageId: 'boss',
      wheelhouseStage: { id: 'boss', name: WHEELHOUSE.boss.name, icon: WHEELHOUSE.boss.icon, passThreshold: 0.8, questions: WHEELHOUSE.boss.rounds.slice() },
      questions: WHEELHOUSE.boss.rounds.slice(),
      rerollQueue: [],
      inRerollPhase: false,
      currentIndex: -1,
      correctCount: 0,
      firstTryCorrect: 0,
      skippedCount: 0,
      longestWrongStreak: 0,
      currentWrongStreak: 0,
      startedAt: Date.now(),
      wxpEarned: 0,
      xpEarnedThisSession: 0,
      badgesEarnedThisSession: [],
      missedIds: [],
      answeredIds: [],
    };
    state.player.combo = 0;
    showScreen('quiz');
    $('#quiz-mode-label').textContent = WHEELHOUSE.boss.icon + ' BOSS · ' + WHEELHOUSE.boss.name;
    sfxStart();
    updateHud();
    whNextQuestion();
  }, 'Let\'s do this', null);
}

function whNextQuestion() {
  if (!session || !session.isWheelhouse) return;
  answerLocked = false;
  clearTimeout(advanceTimer);
  hideFeedback();
  hideAllInputs();

  // After main set, run reroll queue (alternate format hints)
  if (!session.inRerollPhase && session.currentIndex + 1 >= session.questions.length && session.rerollQueue.length > 0) {
    session.inRerollPhase = true;
    session.questions = session.questions.concat(session.rerollQueue);
    toast('🔁 Re-roll: ' + session.rerollQueue.length + ' missed Qs returning in a different framing', '');
  }

  session.currentIndex++;
  if (session.currentIndex >= session.questions.length) {
    if (session.isBoss) finishWheelhouseBoss();
    else finishWheelhouseStage();
    return;
  }

  const q = session.questions[session.currentIndex];
  q.startedAt = Date.now();
  q._isReroll = session.inRerollPhase;
  renderWheelhouseQuestion(q, session.wheelhouseStage);
}

function renderWheelhouseQuestion(q, stage) {
  hideAllInputs();
  $('#wheelhouse-block').classList.remove('hidden');

  const total = session.questions.length;
  $('#quiz-counter').textContent = (session.currentIndex + 1) + ' / ' + total;
  $('#quiz-progress-fill').style.width = (session.currentIndex / total * 100) + '%';
  $('#quiz-timer').classList.add('hidden');

  const block = $('#wheelhouse-block');
  const tagText = q._isReroll ? 'Re-roll · ' + (stage.icon || '🛞') + ' ' + stage.name : (stage.icon || '🛞') + ' ' + stage.name;
  const diffBadge = q.difficulty ? `<span class="diff-badge ${q.difficulty}" style="margin-left:8px">${q.difficulty}</span>` : '';
  const storyHtml = q.story ? `<div class="wh-q-story">${escapeHtml(q.story)}</div>` : '';
  // chartHtml is RAW HTML (Spec Vault charts). Trusted content from appendix_v5.js — not user input.
  const chartHtml = q.chartHtml ? q.chartHtml : '';
  const isMulti = q.kind === 'multi';
  const requiredCorrect = q.requiredCorrect || (isMulti ? q.choices.filter(c => c.correct).length : 1);
  const multiHint = isMulti ? `<div class="wh-q-multi-hint">Pick exactly <strong>${requiredCorrect}</strong> answers.</div>` : '';

  // V5: pick a question-text variant if authored (rephrase on repeat exposure).
  let qText = q.question;
  if (q.variants && q.variants.length > 0 && q.id) {
    const picked = RAND.pickVariant(q.variants, 'wh_q_' + q.id, q.question);
    if (picked.text) qText = picked.text;
  }

  // V5: re-shuffle authored choices with bias guard (mode key scoped to stage).
  // Cache baseChoices so re-rolls always start from the authored order.
  if (q.kind === 'mc' || q.kind === 'multi') {
    if (!q._baseChoices) q._baseChoices = q.choices.slice();
    const biasKey = 'wh_' + (stage && stage.id ? stage.id : 'stage');
    q.choices = RAND.shuffleWithBiasGuard(q._baseChoices.slice(), (c) => !!c.correct, biasKey);
  }

  if (q.kind === 'mc' || q.kind === 'multi') {
    block.innerHTML = `
      <div class="wh-q-stage-tag">${tagText}${diffBadge}</div>
      ${storyHtml}
      ${chartHtml}
      <div class="wh-q-question">${escapeHtml(qText)}</div>
      ${multiHint}
      <div class="wh-q-choices" id="wh-choices"></div>
      <button class="btn primary wh-q-submit" id="btn-wh-submit" disabled>${isMulti ? 'Submit answer' : 'Submit'}</button>
    `;
    const choicesEl = $('#wh-choices');
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    q.choices.forEach((c, i) => {
      const row = document.createElement('button');
      row.className = 'wh-choice';
      row.dataset.idx = i;
      row.innerHTML = `<span class="wh-check"></span><span class="wh-letter">${letters[i]}</span><span class="wh-q-text">${escapeHtml(c.text)}</span>`;
      row.addEventListener('click', () => toggleWHChoice(q, i, row, isMulti, requiredCorrect));
      choicesEl.appendChild(row);
    });
    $('#btn-wh-submit').addEventListener('click', () => submitWHAnswer(q));
    q._selectedIdxs = [];
  } else if (q.kind === 'fill_blank' || q.kind === 'typing') {
    block.innerHTML = `
      <div class="wh-q-stage-tag">${tagText}${diffBadge}</div>
      ${storyHtml}
      ${chartHtml}
      <div class="wh-q-question">${escapeHtml(qText)}</div>
      <div class="wh-q-typing-wrap"><input id="wh-typing-input" type="text" autocomplete="off" spellcheck="false" placeholder="Type your answer…"></div>
      <div class="wh-typing-hint">Press Enter to submit</div>
      <button class="btn primary wh-q-submit" id="btn-wh-submit">Submit</button>
    `;
    const input = $('#wh-typing-input');
    input.value = '';
    input.disabled = false;
    input.focus();
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); submitWHAnswer(q); } });
    $('#btn-wh-submit').addEventListener('click', () => submitWHAnswer(q));
  }
}

function toggleWHChoice(q, idx, el, isMulti, requiredCorrect) {
  if (answerLocked) return;
  if (!isMulti) {
    q._selectedIdxs = [idx];
    document.querySelectorAll('#wh-choices .wh-choice').forEach(e => e.classList.remove('selected'));
    el.classList.add('selected');
  } else {
    const i = q._selectedIdxs.indexOf(idx);
    if (i >= 0) { q._selectedIdxs.splice(i, 1); el.classList.remove('selected'); }
    else {
      if (q._selectedIdxs.length >= requiredCorrect) { toast(`Only pick ${requiredCorrect}`, ''); return; }
      q._selectedIdxs.push(idx);
      el.classList.add('selected');
    }
  }
  const btn = $('#btn-wh-submit');
  if (btn) btn.disabled = q._selectedIdxs.length !== requiredCorrect;
}

function submitWHAnswer(q) {
  if (answerLocked) return;
  answerLocked = true;
  q.timeMs = Date.now() - q.startedAt;
  const stage = session.wheelhouseStage;
  let correct = false;

  if (q.kind === 'mc' || q.kind === 'multi') {
    const isMulti = q.kind === 'multi';
    const requiredCorrect = q.requiredCorrect || (isMulti ? q.choices.filter(c => c.correct).length : 1);
    if (!q._selectedIdxs || q._selectedIdxs.length !== requiredCorrect) { answerLocked = false; return; }
    const pickedSet = new Set(q._selectedIdxs);
    const correctSet = new Set();
    q.choices.forEach((c, i) => { if (c.correct) correctSet.add(i); });
    correct = pickedSet.size === correctSet.size;
    if (correct) for (const i of pickedSet) if (!correctSet.has(i)) { correct = false; break; }
    // Visual feedback on choices
    document.querySelectorAll('#wh-choices .wh-choice').forEach((el, i) => {
      el.disabled = true;
      if (correctSet.has(i)) el.classList.add('correct');
      else if (pickedSet.has(i)) el.classList.add('wrong');
      else el.classList.add('dim');
    });
    q.userAnswer = q._selectedIdxs;
  } else if (q.kind === 'fill_blank' || q.kind === 'typing') {
    const input = $('#wh-typing-input');
    const typed = input ? input.value : '';
    q.userAnswer = typed;
    // Flexible 3-tier grading: exact / close / wrong. Close still counts as correct.
    const verdict = whGradeAnswer(typed, q.correctAnswer, q.acceptedAnswers || []);
    q.grade = verdict.grade;
    q.gradeReason = verdict.reason;
    correct = verdict.grade !== 'wrong';
    if (input) input.disabled = true;
    const wrap = document.querySelector('.wh-q-typing-wrap');
    if (wrap) {
      wrap.classList.remove('correct', 'wrong', 'close');
      wrap.classList.add(verdict.grade === 'exact' ? 'correct' : verdict.grade === 'close' ? 'close' : 'wrong');
    }
    const hint = document.querySelector('.wh-typing-hint');
    if (hint) {
      if (verdict.grade === 'exact') hint.innerHTML = '✓ ' + escapeHtml(q.correctAnswer);
      else if (verdict.grade === 'close') hint.innerHTML = '≈ Close enough · ideal: <strong>' + escapeHtml(q.correctAnswer) + '</strong>';
      else hint.innerHTML = '✗ Answer: <strong>' + escapeHtml(q.correctAnswer) + '</strong>';
    }
  }

  q.correct = correct;
  $('#btn-wh-submit')?.classList.add('hidden');

  // Update session counters
  if (correct) {
    session.correctCount++;
    session.firstTryCorrect++;
    session.currentWrongStreak = 0;
    state.player.streak++;
    if (state.player.streak > state.player.bestStreak) state.player.bestStreak = state.player.streak;
    state.player.combo++;
    sfxCorrect();
    hostQuip(pick(HOST_CORRECT));
    // WXP
    let wxpGain = q.difficulty === 'hard' ? 18 : q.difficulty === 'medium' ? 12 : 8;
    if (q._isReroll) wxpGain = Math.round(wxpGain * 0.6); // partial credit on re-roll
    const comboBonus = Math.min(state.player.combo - 1, 8) * 1;
    wxpGain += comboBonus;
    session.wxpEarned += wxpGain;
    const _zs = zState();
    _zs.wxp = (_zs.wxp || 0) + wxpGain;
    // Also award main XP (lighter, since this is a separate progression)
    const mainXp = Math.round(wxpGain * 0.5);
    state.player.xp += mainXp;
    session.xpEarnedThisSession += mainXp;
    if (state.player.combo >= 3) { showCombo(state.player.combo); sfxCombo(state.player.combo); }
    state.player.stats.totalAnswered++;
    state.player.stats.totalCorrect++;
    const leveled = checkLevelUp();
    if (leveled) { persistNow(); setTimeout(() => levelUpCelebration(leveled.to), 400); }
  } else {
    sfxWrong();
    session.currentWrongStreak++;
    if (session.currentWrongStreak > session.longestWrongStreak) session.longestWrongStreak = session.currentWrongStreak;
    state.player.streak = 0;
    state.player.combo = 0;
    if (!q._isReroll) session.rerollQueue.push(q);
    if (!session.missedIds.includes(q.id)) session.missedIds.push(q.id);
    state.player.stats.totalAnswered++;
  }
  if (q.id) session.answeredIds.push(q.id);

  showWHFeedback(q, correct);
  updateHud();
  persist();

  const nextBtn = $('#btn-quiz-next');
  nextBtn.classList.remove('hidden');
  nextBtn.onclick = () => whNextQuestion();
}

function showWHFeedback(q, correct) {
  // Insert feedback inside the wheelhouse block so it appears under the question
  const block = $('#wheelhouse-block');
  if (!block) return;
  const fb = document.createElement('div');
  // Close (almost-correct) renders with its own subtle styling but still in the "correct" family
  const isClose = q.grade === 'close';
  let cls = 'wh-feedback ';
  if (correct && !isClose) cls += 'correct';
  else if (isClose) cls += 'close';
  else cls += 'wrong';
  fb.className = cls;
  const refs = q.refs && q.refs.length ? `<div class="wh-fb-refs">${q.refs.map(r => '[' + r + ']').join(' ')}</div>` : '';

  // Header text varies by grade tier
  let header;
  if (q.grade === 'close') header = '≈ Close enough — good understanding';
  else if (correct) header = '✓ ' + pick(HOST_CORRECT);
  else header = '✗ Not quite';

  // Close-match note revealing the ideal answer
  let closeNote = '';
  if (isClose && q.correctAnswer) {
    const reasonLabel = ({
      typo: 'minor typo accepted',
      plural: 'plural/singular accepted',
      partial: 'partial answer accepted',
      extra: 'extra words accepted',
      tokens: 'right concept accepted',
    })[q.gradeReason] || 'close enough accepted';
    closeNote = `<div class="wh-fb-close-note"><span class="close-tag">${reasonLabel}</span> Ideal answer: <strong>${escapeHtml(q.correctAnswer)}</strong></div>`;
  }

  fb.innerHTML = `
    <div class="wh-fb-header">${header}</div>
    ${closeNote}
    <div class="wh-fb-why">${q.why || ''}</div>
    ${q.hook ? `<div class="wh-fb-hook"><span class="hook-label">🧠 Memory hook</span>${escapeHtml(q.hook)}</div>` : ''}
    ${refs}
  `;
  block.appendChild(fb);
}

/**
 * Flexible 3-tier grader for fill-in-the-blank style answers.
 * Returns { grade, matched, reason } where:
 *   grade   = 'exact' | 'close' | 'wrong'
 *   matched = the canonical correct answer that was matched (for ideal-answer reveal)
 *   reason  = short label of why it was flagged close ('typo' | 'plural' | 'partial' | 'tokens' | 'extra')
 *
 * Apply ONLY to fill-in-the-blank questions — keeps the user's intent of
 * rewarding understanding over precise spelling.
 */
function whGradeAnswer(typed, correctAnswer, acceptedAnswers) {
  const norm = (s) => (s || '').toLowerCase().trim()
    .replace(/[“”"'’‘`]/g, '')      // strip smart/regular quotes
    .replace(/[.,;:!?()]/g, '')      // strip punctuation
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s\-]/g, '');
  if (!typed) return { grade: 'wrong', matched: null, reason: null };
  const nt = norm(typed);
  if (!nt) return { grade: 'wrong', matched: null, reason: null };

  const candidates = [correctAnswer].concat(acceptedAnswers || []).filter(Boolean);

  // ---- 1) EXACT (any normalized canonical match) ----
  for (const c of candidates) {
    if (norm(c) === nt) return { grade: 'exact', matched: c, reason: null };
  }

  // ---- 2) CLOSE — try every tolerance rule against every accepted variant ----
  let bestClose = null;
  for (const c of candidates) {
    const nc = norm(c);
    if (!nc) continue;

    // Plural ↔ singular (English -s / -es)
    if (nt === nc + 's' || nt + 's' === nc) { bestClose = bestClose || { matched: c, reason: 'plural' }; continue; }
    if (nt === nc + 'es' || nt + 'es' === nc) { bestClose = bestClose || { matched: c, reason: 'plural' }; continue; }
    if (nt.endsWith('y') && nc === nt.slice(0, -1) + 'ies') { bestClose = bestClose || { matched: c, reason: 'plural' }; continue; }
    if (nc.endsWith('y') && nt === nc.slice(0, -1) + 'ies') { bestClose = bestClose || { matched: c, reason: 'plural' }; continue; }

    // Substring containment — typed answer contained in correct (partial term)
    if (nc.length >= 4 && nt.length >= 3 && nc.indexOf(nt) >= 0) { bestClose = bestClose || { matched: c, reason: 'partial' }; continue; }
    // Or correct contained in typed answer (extra qualifier words OK)
    if (nt.length >= 4 && nc.length >= 3 && nt.indexOf(nc) >= 0) { bestClose = bestClose || { matched: c, reason: 'extra' }; continue; }

    // Levenshtein typo tolerance — generous: allow ~1 edit per 6 chars (min 2 edits)
    const allowed = Math.max(2, Math.ceil(nc.length / 6));
    const dist = levenshtein(nt, nc);
    if (dist <= allowed) { bestClose = bestClose || { matched: c, reason: 'typo' }; continue; }

    // Token overlap (multi-word answers) — accept if 60%+ of correct's significant tokens are present
    const tokenize = (s) => s.split(/\s+/).filter(t => t.length >= 3);
    const ntT = tokenize(nt);
    const ncT = tokenize(nc);
    if (ncT.length > 1 && ntT.length > 0) {
      let hits = 0;
      for (const a of ncT) {
        for (const b of ntT) {
          if (a === b) { hits++; break; }
          if (Math.abs(a.length - b.length) <= 2 && levenshtein(a, b) <= 1) { hits++; break; }
        }
      }
      if (hits >= Math.ceil(ncT.length * 0.6)) {
        bestClose = bestClose || { matched: c, reason: 'tokens' };
        continue;
      }
    }
  }

  if (bestClose) return { grade: 'close', matched: bestClose.matched, reason: bestClose.reason };
  return { grade: 'wrong', matched: null, reason: null };
}

// Back-compat shim: callers that just want a yes/no still work.
function whAnswerMatches(typed, correctAnswer, acceptedAnswers) {
  return whGradeAnswer(typed, correctAnswer, acceptedAnswers).grade !== 'wrong';
}

function finishWheelhouseStage() {
  if (!session || !session.isWheelhouse) return;
  const stage = session.wheelhouseStage;
  const zs = zState();
  const mod = zMod();
  const stState = zs.stages[stage.id];
  // Score = first-try correct ratio over original questions only (not rerolls)
  const originalCount = stage.questions.length;
  const originalCorrect = Math.max(0, originalCount - session.missedIds.length);
  const pct = Math.round(originalCorrect / originalCount * 100);
  const passed = pct >= Math.round((stage.passThreshold || 0.7) * 100);

  stState.lastScore = pct;
  if (pct > (stState.bestScore || 0)) stState.bestScore = pct;
  if (pct === 100) stState.perfect = true;
  if (passed) stState.completed = true;
  stState.missedIds = session.missedIds.slice();

  // Zone badges (Wheelhouse OR Spec Vault — driven by session.zone)
  const newBadges = [];
  const apprenticeId = zApprenticeBadgeId();
  if (!zs.badges[apprenticeId]) { zs.badges[apprenticeId] = { earnedAt: Date.now() }; newBadges.push(mod.badges.find(b => b.id === apprenticeId)); }
  const stageBadgeId = zStageBadgeId(stage.id);
  if (passed && stageBadgeId && !zs.badges[stageBadgeId]) {
    zs.badges[stageBadgeId] = { earnedAt: Date.now() };
    newBadges.push(mod.badges.find(b => b.id === stageBadgeId));
  }
  // Perfectionist: every stage perfect within this zone
  const allPerfect = mod.stages.every(s => zs.stages[s.id]?.perfect);
  const perfectId = zPerfectBadgeId();
  if (allPerfect && !zs.badges[perfectId]) {
    zs.badges[perfectId] = { earnedAt: Date.now() };
    newBadges.push(mod.badges.find(b => b.id === perfectId));
  }
  for (const b of newBadges) {
    if (!b) continue;
    session.badgesEarnedThisSession.push(b);
    toast('🏆 ' + b.name + ' unlocked!', 'badge');
    sfxBadge();
  }

  persistNow();
  renderWHResults(false);
}

function finishWheelhouseBoss() {
  if (!session) return;
  const mod = zMod();
  const zs = zState();
  const totalRounds = mod.boss.rounds.length;
  const correctRounds = totalRounds - session.missedIds.length;
  const pct = Math.round(correctRounds / totalRounds * 100);
  const passed = pct >= 80;

  const bossState = zs.boss;
  bossState.lastScore = pct;
  if (pct > (bossState.bestScore || 0)) bossState.bestScore = pct;
  if (pct === 100) bossState.perfect = true;
  if (passed) bossState.completed = true;

  // Champion badge for the active zone
  const newBadges = [];
  const champId = zChampionBadgeId();
  if (passed && !zs.badges[champId]) {
    zs.badges[champId] = { earnedAt: Date.now() };
    newBadges.push(mod.badges.find(b => b.id === champId));
  }
  for (const b of newBadges) {
    if (!b) continue;
    session.badgesEarnedThisSession.push(b);
    toast('🏆 ' + b.name + ' unlocked!', 'badge');
    sfxBadge();
  }

  persistNow();
  renderWHResults(true);
}

function renderWHResults(isBoss) {
  hideAllInputs();
  $('#wheelhouse-block').classList.add('hidden');
  showScreen('results');
  const mod = zMod();
  const zs  = zState();
  const zoneLabel = zKey() === 'appendix' ? 'Spec Vault' : 'Wheelhouse';
  const stage = session.wheelhouseStage;
  const totalOriginal = isBoss ? mod.boss.rounds.length : stage.questions.length;
  const originalCorrect = Math.max(0, totalOriginal - session.missedIds.length);
  const pct = Math.round(originalCorrect / totalOriginal * 100);
  const passed = pct >= Math.round((isBoss ? 0.8 : (stage.passThreshold || 0.7)) * 100);
  let grade = 'D';
  if (pct === 100) grade = 'S';
  else if (pct >= 90) grade = 'A';
  else if (pct >= 75) grade = 'B';
  else if (pct >= 60) grade = 'C';

  $('#results-grade').textContent = grade;
  $('#results-score').textContent = originalCorrect + ' / ' + totalOriginal;
  $('#results-pct').textContent = pct + '% · ' + (passed ? '✅ stage cleared' : '⚠️ try again to advance');

  let msg;
  if (isBoss) {
    msg = passed ? `Boss down. The whole ${zoneLabel} is yours.` : 'So close. Re-run any stage to sharpen up, then come back for the boss.';
  } else {
    msg = pct === 100 ? 'Perfect run.' :
          pct >= 90 ? 'Strong stage clear.' :
          passed ? 'Cleared. Re-run to gold-star it.' :
          'Below pass threshold — re-run this stage.';
  }
  $('#results-host-msg').textContent = '"' + msg + '"';

  $('#xp-breakdown').innerHTML = `
    <div class="xp-line"><span>${zoneLabel} XP earned</span><span>+${session.wxpEarned} WXP</span></div>
    <div class="xp-line"><span>Main XP (50% sync)</span><span>+${session.xpEarnedThisSession} XP</span></div>
    <div class="xp-line total"><span>Total ${zoneLabel} WXP balance</span><span>${zs.wxp}</span></div>
  `;

  // Badges
  const badgeSec = $('#results-badges-section');
  if (session.badgesEarnedThisSession.length > 0) {
    badgeSec.classList.remove('hidden');
    $('#results-badges').innerHTML = session.badgesEarnedThisSession.map(bg =>
      '<div class="review-item"><span style="font-size:22px">' + bg.icon + '</span> <strong>' + bg.name + '</strong> — <span class="text-dim">' + bg.desc + '</span></div>'
    ).join('');
  } else badgeSec.classList.add('hidden');

  // Review: any missed Qs with their why + hook
  const reviewSec = $('#results-review-section');
  const missed = session.questions.filter(q => q.correct === false && !q._isReroll);
  if (missed.length > 0) {
    reviewSec.classList.remove('hidden');
    $('#results-review').innerHTML = missed.slice(0, 8).map(q =>
      `<div class="review-item" data-expand>
        <div class="term">${escapeHtml(q.question.slice(0, 80))}${q.question.length > 80 ? '…' : ''}</div>
        <div class="def">${q.why}${q.hook ? '<br><br><em style="color:var(--accent-3)">🧠 ' + escapeHtml(q.hook) + '</em>' : ''}</div>
      </div>`
    ).join('');
    document.querySelectorAll('#results-review .review-item').forEach(el => el.addEventListener('click', () => el.classList.toggle('expanded')));
  } else reviewSec.classList.add('hidden');

  // Next action — zone-aware (Wheelhouse OR Spec Vault)
  const naWrap = $('#next-action-wrap');
  const zoneScreen = zHubScreen();
  const startStageFn = zStartStageFn();
  const startBossFn = zStartBossFn();
  const renderHubFn = zKey() === 'appendix' ? renderAppendixHub : renderWheelhouseHub;
  const hubLabel = zKey() === 'appendix' ? '📑 Spec Vault' : '🛞 Wheelhouse';
  let naText, naBtn, naAction;
  if (passed) {
    if (isBoss) {
      naText = `🏆 <strong>${zoneLabel} cleared!</strong> Back to the menu — or replay any stage for gold stars.`;
      naBtn = `Back to ${zoneLabel}`;
      naAction = 'zone';
    } else {
      const idx = mod.stages.findIndex(s => s.id === stage.id);
      const next = mod.stages[idx + 1];
      if (next) {
        naText = `🚀 <strong>${escapeHtml(next.name)}</strong> is unlocked. Keep the momentum.`;
        naBtn = 'Next Stage →';
        naAction = 'next-stage';
        session._nextStageId = next.id;
      } else if (zIsBossUnlocked()) {
        naText = `🏆 <strong>BOSS UNLOCKED</strong> — ${escapeHtml(mod.boss.name.replace(/^BOSS:\s*/, ''))} awaits.`;
        naBtn = 'Boss Battle →';
        naAction = 'boss';
      } else {
        naText = `Back to the ${zoneLabel} hub for the next stage.`;
        naBtn = `${zoneLabel} →`;
        naAction = 'zone';
      }
    }
  } else {
    naText = `Below ${Math.round((isBoss ? 0.8 : stage.passThreshold) * 100)}%. Re-run this ${isBoss ? 'boss' : 'stage'} to advance.`;
    naBtn = 'Replay';
    naAction = 'replay';
  }
  naWrap.innerHTML = `<div class="next-action"><div class="na-text">${naText}</div><button class="btn secondary" id="btn-wh-next">${naBtn}</button></div>`;
  $('#btn-wh-next').addEventListener('click', () => {
    if (naAction === 'zone') { session = null; showScreen(zoneScreen); renderHubFn(); }
    else if (naAction === 'next-stage' && session._nextStageId) { const nid = session._nextStageId; session = null; startStageFn(nid); }
    else if (naAction === 'boss') { session = null; startBossFn(); }
    else if (naAction === 'replay') { const sid = stage.id; const wasBoss = isBoss; session = null; if (wasBoss) startBossFn(); else startStageFn(sid); }
  });

  // Results-action buttons — route back to the active zone hub.
  const menuBtn = $('#btn-results-menu');
  const againBtn = $('#btn-results-again');
  if (menuBtn) {
    menuBtn.textContent = hubLabel;
    menuBtn.onclick = () => { session = null; showScreen(zoneScreen); renderHubFn(); };
  }
  if (againBtn) {
    againBtn.textContent = 'Replay Stage';
    againBtn.onclick = () => { const sid = stage.id; const wasBoss = isBoss; session = null; if (wasBoss) startBossFn(); else startStageFn(sid); };
  }
}

function resetWheelhouseProgress() {
  state.wheelhouse = defaultWheelhouseState();
  persistNow();
  toast('Wheelhouse progress reset.', '');
  renderWheelhouseHub();
}

// ============================================================
// ============== SPEC VAULT (APPENDIX) — chart zone ==========
// ============================================================
// Reuses the Wheelhouse engine via session.zone='appendix'.
// Owns its own state slot (state.appendix), badges, and hub.

function appxStageById(id) { return APPX_STAGE_BY_ID[id] || null; }

function appxIsStageUnlocked(stageId) {
  ensureAppendixState();
  const idx = APPENDIX.stages.findIndex(s => s.id === stageId);
  if (idx <= 0) return true;
  const prevId = APPENDIX.stages[idx - 1].id;
  return !!state.appendix.stages[prevId]?.completed;
}
function appxIsBossUnlocked() {
  ensureAppendixState();
  return APPENDIX.stages.every(s => state.appendix.stages[s.id]?.completed);
}
function appxCountStagesComplete() {
  ensureAppendixState();
  let c = 0;
  for (const s of APPENDIX.stages) if (state.appendix.stages[s.id]?.completed) c++;
  return c;
}
function appxTotalProgressPct() {
  ensureAppendixState();
  const total = APPENDIX.stages.length + 1;
  let done = appxCountStagesComplete();
  if (state.appendix.boss?.completed) done++;
  return Math.round(done / total * 100);
}
function nextAppendixRecommendation() {
  ensureAppendixState();
  for (const s of APPENDIX.stages) {
    const st = state.appendix.stages[s.id];
    if (!st?.completed) return { label: s.name };
  }
  if (!state.appendix.boss?.completed) return { label: APPENDIX.boss.name };
  return null;
}

function renderAppendixHub() {
  ensureAppendixState();
  const grid = $('#appx-stage-grid');
  const stats = $('#appx-hero-stats');
  if (!grid || !stats) return;

  stats.innerHTML = `
    <div class="wh-stat"><span class="wh-stat-value">${state.appendix.wxp}</span><span class="wh-stat-label">WXP</span></div>
    <div class="wh-stat"><span class="wh-stat-value">${appxCountStagesComplete()}/${APPENDIX.stages.length}</span><span class="wh-stat-label">Stages</span></div>
    <div class="wh-stat"><span class="wh-stat-value">${state.appendix.boss?.completed ? '✓' : '—'}</span><span class="wh-stat-label">Boss</span></div>
  `;
  const pct = appxTotalProgressPct();
  $('#appx-zone-progress').style.width = pct + '%';
  $('#appx-zone-progress-text').textContent = pct + '% complete' + (pct === 100 ? ' · Spec Vault cleared!' : '');

  grid.innerHTML = '';
  APPENDIX.stages.forEach((stage, idx) => {
    const st = state.appendix.stages[stage.id];
    const unlocked = appxIsStageUnlocked(stage.id);
    const complete = !!st?.completed;
    const inProgress = !!st?.started && !complete;
    const card = document.createElement('button');
    let cls = 'wh-stage-card';
    if (!unlocked) cls += ' locked';
    else if (complete) cls += ' complete';
    else if (inProgress) cls += ' in-progress';
    card.className = cls;
    card.disabled = !unlocked;

    let statusLabel = 'Locked', statusCls = 'locked';
    if (unlocked && complete) { statusLabel = `Cleared · ${st.bestScore}%`; statusCls = 'complete'; }
    else if (unlocked && inProgress) { statusLabel = `In progress · last ${st.lastScore}%`; statusCls = 'in-progress'; }
    else if (unlocked) { statusLabel = 'Ready'; statusCls = ''; }

    const stars = [];
    for (let i = 0; i < 3; i++) {
      const filled = (st?.bestScore || 0) >= [70, 85, 100][i];
      const gold = i === 2 && filled;
      stars.push(`<div class="wh-star ${filled ? (gold ? 'gold' : 'filled') : ''}"></div>`);
    }

    card.innerHTML = `
      <div style="display:flex;align-items:flex-start;gap:12px;justify-content:space-between">
        <div style="display:flex;align-items:center;gap:10px">
          <div class="wh-stage-icon">${stage.icon}</div>
          <div>
            <h3 class="wh-stage-name">Stage ${idx + 1} — ${escapeHtml(stage.name)}</h3>
            <p class="wh-stage-sub">${escapeHtml(stage.subtitle)}</p>
          </div>
        </div>
        <span class="wh-stage-status ${statusCls}">${statusLabel}</span>
      </div>
      <div class="wh-stage-blurb">${escapeHtml(stage.blurb)}</div>
      <div class="wh-stage-meta">
        <span>${stage.questions.length} Qs · pass ≥${Math.round((stage.passThreshold||0.7)*100)}%</span>
        <div class="wh-stage-stars">${stars.join('')}</div>
      </div>
    `;
    if (unlocked) card.addEventListener('click', () => startAppendixStage(stage.id));
    grid.appendChild(card);
  });

  // Boss card
  const bossUnlocked = appxIsBossUnlocked();
  const bossSt = state.appendix.boss;
  const bossCard = document.createElement('button');
  let bcls = 'wh-stage-card boss';
  if (!bossUnlocked) bcls += ' locked';
  if (bossSt?.completed) bcls += ' complete';
  bossCard.className = bcls;
  bossCard.disabled = !bossUnlocked;
  let bossStatus = 'Locked — clear all 4 stages first';
  let bossStatusCls = 'locked';
  if (bossUnlocked && bossSt?.completed) { bossStatus = `Boss cleared · best ${bossSt.bestScore}%`; bossStatusCls = 'complete'; }
  else if (bossUnlocked) { bossStatus = 'BOSS · ready'; bossStatusCls = 'boss'; }
  bossCard.innerHTML = `
    <div style="display:flex;align-items:flex-start;gap:12px;justify-content:space-between">
      <div style="display:flex;align-items:center;gap:10px">
        <div class="wh-stage-icon">${APPENDIX.boss.icon}</div>
        <div>
          <h3 class="wh-stage-name">${escapeHtml(APPENDIX.boss.name)}</h3>
          <p class="wh-stage-sub">${escapeHtml(APPENDIX.boss.subtitle)}</p>
        </div>
      </div>
      <span class="wh-stage-status ${bossStatusCls}">${bossStatus}</span>
    </div>
    <div class="wh-stage-blurb">${escapeHtml(APPENDIX.boss.blurb)}</div>
    <div class="wh-stage-meta">
      <span>${APPENDIX.boss.rounds.length} rounds · pass ≥80%</span>
    </div>
  `;
  if (bossUnlocked) bossCard.addEventListener('click', () => startAppendixBoss());
  grid.appendChild(bossCard);
}

function startAppendixStage(stageId) {
  ensureAppendixState();
  const stage = appxStageById(stageId);
  if (!stage) return;
  if (!appxIsStageUnlocked(stageId)) { toast('Complete the previous stage first', 'warn'); return; }

  const stState = state.appendix.stages[stageId];
  stState.started = true;
  stState.attempts = (stState.attempts || 0) + 1;
  stState.lastPlayedAt = Date.now();
  state.appendix.totalAttempts = (state.appendix.totalAttempts || 0) + 1;

  const qs = stage.questions.slice();
  for (let i = qs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [qs[i], qs[j]] = [qs[j], qs[i]];
  }

  session = {
    mode: 'wheelhouse',
    zone: 'appendix',
    isWheelhouse: true,
    isBoss: false,
    wheelhouseStageId: stageId,
    wheelhouseStage: stage,
    questions: qs,
    rerollQueue: [],
    inRerollPhase: false,
    currentIndex: -1,
    correctCount: 0,
    firstTryCorrect: 0,
    skippedCount: 0,
    longestWrongStreak: 0,
    currentWrongStreak: 0,
    startedAt: Date.now(),
    wxpEarned: 0,
    xpEarnedThisSession: 0,
    badgesEarnedThisSession: [],
    missedIds: [],
    answeredIds: [],
  };
  state.player.combo = 0;
  showScreen('quiz');
  $('#quiz-mode-label').textContent = stage.icon + ' Spec Vault · ' + stage.name;
  sfxStart();
  updateHud();
  whNextQuestion();
}

function startAppendixBoss() {
  ensureAppendixState();
  if (!appxIsBossUnlocked()) { toast('Clear all 4 stages to unlock the boss', 'warn'); return; }

  state.appendix.boss.started = true;
  state.appendix.boss.attempts = (state.appendix.boss.attempts || 0) + 1;
  state.appendix.boss.lastPlayedAt = Date.now();
  state.appendix.totalAttempts = (state.appendix.totalAttempts || 0) + 1;

  showModal('🏆 ' + APPENDIX.boss.name, '<p>' + APPENDIX.boss.intro + '</p>', () => {
    session = {
      mode: 'wheelhouse',
      zone: 'appendix',
      isWheelhouse: true,
      isBoss: true,
      wheelhouseStageId: 'boss',
      wheelhouseStage: { id: 'boss', name: APPENDIX.boss.name, icon: APPENDIX.boss.icon, passThreshold: 0.8, questions: APPENDIX.boss.rounds.slice() },
      questions: APPENDIX.boss.rounds.slice(),
      rerollQueue: [],
      inRerollPhase: false,
      currentIndex: -1,
      correctCount: 0,
      firstTryCorrect: 0,
      skippedCount: 0,
      longestWrongStreak: 0,
      currentWrongStreak: 0,
      startedAt: Date.now(),
      wxpEarned: 0,
      xpEarnedThisSession: 0,
      badgesEarnedThisSession: [],
      missedIds: [],
      answeredIds: [],
    };
    state.player.combo = 0;
    showScreen('quiz');
    $('#quiz-mode-label').textContent = APPENDIX.boss.icon + ' BOSS · ' + APPENDIX.boss.name;
    sfxStart();
    updateHud();
    whNextQuestion();
  }, 'Let\'s do this', null);
}

function resetAppendixProgress() {
  state.appendix = defaultAppendixState();
  persistNow();
  toast('Spec Vault progress reset.', '');
  renderAppendixHub();
}

// ============================================================
// ============== SUSPENSION SYSTEMS MASTERY ZONE ===============
// ============================================================
// Reuses the Wheelhouse engine via session.zone='suspension'.
// Owns its own state slot (state.suspension), badges, and hub.

function suStageById(id) { return SU_STAGE_BY_ID[id] || null; }

function suIsStageUnlocked(stageId) {
  ensureSuspensionState();
  const idx = SUSPENSION.stages.findIndex(s => s.id === stageId);
  if (idx <= 0) return true;
  const prevId = SUSPENSION.stages[idx - 1].id;
  return !!state.suspension.stages[prevId]?.completed;
}
function suIsBossUnlocked() {
  ensureSuspensionState();
  return SUSPENSION.stages.every(s => state.suspension.stages[s.id]?.completed);
}
function suCountStagesComplete() {
  ensureSuspensionState();
  let c = 0;
  for (const s of SUSPENSION.stages) if (state.suspension.stages[s.id]?.completed) c++;
  return c;
}
function suTotalProgressPct() {
  ensureSuspensionState();
  const total = SUSPENSION.stages.length + 1;
  let done = suCountStagesComplete();
  if (state.suspension.boss?.completed) done++;
  return Math.round(done / total * 100);
}
function nextSuspensionRecommendation() {
  ensureSuspensionState();
  for (const s of SUSPENSION.stages) {
    const st = state.suspension.stages[s.id];
    if (!st?.completed) return { label: s.name };
  }
  if (!state.suspension.boss?.completed) return { label: SUSPENSION.boss.name };
  return null;
}

function renderSuspensionHub() {
  ensureSuspensionState();
  const grid = $('#su-stage-grid');
  const stats = $('#su-hero-stats');
  if (!grid || !stats) return;

  stats.innerHTML = `
    <div class="wh-stat"><span class="wh-stat-value">${state.suspension.wxp}</span><span class="wh-stat-label">WXP</span></div>
    <div class="wh-stat"><span class="wh-stat-value">${suCountStagesComplete()}/${SUSPENSION.stages.length}</span><span class="wh-stat-label">Stages</span></div>
    <div class="wh-stat"><span class="wh-stat-value">${state.suspension.boss?.completed ? '✓' : '—'}</span><span class="wh-stat-label">Boss</span></div>
  `;
  const pct = suTotalProgressPct();
  $('#su-zone-progress').style.width = pct + '%';
  $('#su-zone-progress-text').textContent = pct + '% complete' + (pct === 100 ? ' · Suspension Sanctuary cleared!' : '');

  grid.innerHTML = '';
  SUSPENSION.stages.forEach((stage, idx) => {
    const st = state.suspension.stages[stage.id];
    const unlocked = suIsStageUnlocked(stage.id);
    const complete = !!st?.completed;
    const inProgress = !!st?.started && !complete;
    const card = document.createElement('button');
    let cls = 'wh-stage-card';
    if (!unlocked) cls += ' locked';
    else if (complete) cls += ' complete';
    else if (inProgress) cls += ' in-progress';
    card.className = cls;
    card.disabled = !unlocked;

    let statusLabel = 'Locked', statusCls = 'locked';
    if (unlocked && complete) { statusLabel = `Cleared · ${st.bestScore}%`; statusCls = 'complete'; }
    else if (unlocked && inProgress) { statusLabel = `In progress · last ${st.lastScore}%`; statusCls = 'in-progress'; }
    else if (unlocked) { statusLabel = 'Ready'; statusCls = ''; }

    const stars = [];
    for (let i = 0; i < 3; i++) {
      const filled = (st?.bestScore || 0) >= [70, 85, 100][i];
      const gold = i === 2 && filled;
      stars.push(`<div class="wh-star ${filled ? (gold ? 'gold' : 'filled') : ''}"></div>`);
    }

    card.innerHTML = `
      <div style="display:flex;align-items:flex-start;gap:12px;justify-content:space-between">
        <div style="display:flex;align-items:center;gap:10px">
          <div class="wh-stage-icon">${stage.icon}</div>
          <div>
            <h3 class="wh-stage-name">Stage ${idx + 1} — ${escapeHtml(stage.name)}</h3>
            <p class="wh-stage-sub">${escapeHtml(stage.subtitle)}</p>
          </div>
        </div>
        <span class="wh-stage-status ${statusCls}">${statusLabel}</span>
      </div>
      <div class="wh-stage-blurb">${escapeHtml(stage.blurb)}</div>
      <div class="wh-stage-meta">
        <span>${stage.questions.length} Qs · pass ≥${Math.round((stage.passThreshold||0.7)*100)}%</span>
        <div class="wh-stage-stars">${stars.join('')}</div>
      </div>
    `;
    if (unlocked) card.addEventListener('click', () => startSuspensionStage(stage.id));
    grid.appendChild(card);
  });

  // Boss card
  const bossUnlocked = suIsBossUnlocked();
  const bossSt = state.suspension.boss;
  const bossCard = document.createElement('button');
  let bcls = 'wh-stage-card boss';
  if (!bossUnlocked) bcls += ' locked';
  if (bossSt?.completed) bcls += ' complete';
  bossCard.className = bcls;
  bossCard.disabled = !bossUnlocked;
  let bossStatus = 'Locked — clear all 6 stages first';
  let bossStatusCls = 'locked';
  if (bossUnlocked && bossSt?.completed) { bossStatus = `Boss cleared · best ${bossSt.bestScore}%`; bossStatusCls = 'complete'; }
  else if (bossUnlocked) { bossStatus = 'BOSS · ready'; bossStatusCls = 'boss'; }
  bossCard.innerHTML = `
    <div style="display:flex;align-items:flex-start;gap:12px;justify-content:space-between">
      <div style="display:flex;align-items:center;gap:10px">
        <div class="wh-stage-icon">${SUSPENSION.boss.icon}</div>
        <div>
          <h3 class="wh-stage-name">${escapeHtml(SUSPENSION.boss.name)}</h3>
          <p class="wh-stage-sub">${escapeHtml(SUSPENSION.boss.subtitle)}</p>
        </div>
      </div>
      <span class="wh-stage-status ${bossStatusCls}">${bossStatus}</span>
    </div>
    <div class="wh-stage-blurb">${escapeHtml(SUSPENSION.boss.blurb)}</div>
    <div class="wh-stage-meta">
      <span>${SUSPENSION.boss.rounds.length} rounds · pass ≥80%</span>
    </div>
  `;
  if (bossUnlocked) bossCard.addEventListener('click', () => startSuspensionBoss());
  grid.appendChild(bossCard);
}

function startSuspensionStage(stageId) {
  ensureSuspensionState();
  const stage = suStageById(stageId);
  if (!stage) return;
  if (!suIsStageUnlocked(stageId)) { toast('Complete the previous stage first', 'warn'); return; }

  const stState = state.suspension.stages[stageId];
  stState.started = true;
  stState.attempts = (stState.attempts || 0) + 1;
  stState.lastPlayedAt = Date.now();
  state.suspension.totalAttempts = (state.suspension.totalAttempts || 0) + 1;

  // V5: reset position-bias buffer for this stage so retakes start fresh.
  RAND.resetSessionEntropy('su_' + stageId);

  const qs = RAND.shuffle(stage.questions);
  for (const q of qs) {
    q._isReroll = false;
    q._selectedIdxs = undefined;
    q.userSelection = undefined;
    q.userAnswer = undefined;
    q.correct = false;
  }

  session = {
    mode: 'wheelhouse',
    zone: 'suspension',
    isWheelhouse: true,
    isBoss: false,
    wheelhouseStageId: stageId,
    wheelhouseStage: stage,
    questions: qs,
    rerollQueue: [],
    inRerollPhase: false,
    currentIndex: -1,
    correctCount: 0,
    firstTryCorrect: 0,
    skippedCount: 0,
    longestWrongStreak: 0,
    currentWrongStreak: 0,
    startedAt: Date.now(),
    wxpEarned: 0,
    xpEarnedThisSession: 0,
    badgesEarnedThisSession: [],
    missedIds: [],
    answeredIds: [],
  };
  state.player.combo = 0;
  showScreen('quiz');
  $('#quiz-mode-label').textContent = stage.icon + ' Suspension · ' + stage.name;
  sfxStart();
  updateHud();
  whNextQuestion();
}

function startSuspensionBoss() {
  ensureSuspensionState();
  if (!suIsBossUnlocked()) { toast('Clear all 6 stages to unlock the boss', 'warn'); return; }

  state.suspension.boss.started = true;
  state.suspension.boss.attempts = (state.suspension.boss.attempts || 0) + 1;
  state.suspension.boss.lastPlayedAt = Date.now();
  state.suspension.totalAttempts = (state.suspension.totalAttempts || 0) + 1;

  RAND.resetSessionEntropy('su_boss');

  showModal('🏆 ' + SUSPENSION.boss.name, '<p>' + SUSPENSION.boss.intro + '</p>', () => {
    session = {
      mode: 'wheelhouse',
      zone: 'suspension',
      isWheelhouse: true,
      isBoss: true,
      wheelhouseStageId: 'boss',
      wheelhouseStage: { id: 'boss', name: SUSPENSION.boss.name, icon: SUSPENSION.boss.icon, passThreshold: 0.8, questions: SUSPENSION.boss.rounds.slice() },
      questions: SUSPENSION.boss.rounds.slice(),
      rerollQueue: [],
      inRerollPhase: false,
      currentIndex: -1,
      correctCount: 0,
      firstTryCorrect: 0,
      skippedCount: 0,
      longestWrongStreak: 0,
      currentWrongStreak: 0,
      startedAt: Date.now(),
      wxpEarned: 0,
      xpEarnedThisSession: 0,
      badgesEarnedThisSession: [],
      missedIds: [],
      answeredIds: [],
    };
    state.player.combo = 0;
    showScreen('quiz');
    $('#quiz-mode-label').textContent = SUSPENSION.boss.icon + ' BOSS · ' + SUSPENSION.boss.name;
    sfxStart();
    updateHud();
    whNextQuestion();
  }, 'Let\'s do this', null);
}

function resetSuspensionProgress() {
  state.suspension = defaultSuspensionState();
  persistNow();
  toast('Suspension progress reset.', '');
  renderSuspensionHub();
}

// ============= BOOT =============
function boot() {
  state = loadState();
  state.player.combo = 0;
  state.player.level = levelFromXp(state.player.xp);
  updateDailyStreak(getPlayDates());
  const d = getDailyState();
  if (d && d.date !== todayStr()) state.player.dailyCompletedToday = false;
  bindUi();
  updateHud();
  renderMenu();
  showScreen('menu');
  try {
    const seen = localStorage.getItem(INTRO_KEY);
    if (!seen) { localStorage.setItem(INTRO_KEY, '1'); setTimeout(showIntro, 400); }
  } catch (e) {}
  console.log('UBI Tune-Up v5 loaded.', TERM_COUNT, 'terms.', SCENARIO_COUNT, 'scenarios.', CONFUSABLE_PAIRS.length, 'confusable pairs.', WHEELHOUSE.stages.length, 'Wheelhouse stages,', WHEELHOUSE.boss.rounds.length, 'boss rounds. Spec Vault:', APPENDIX.stages.length, 'stages,', APPENDIX.boss.rounds.length, 'boss rounds. Suspension:', SUSPENSION.stages.length, 'stages,', SUSPENSION.boss.rounds.length, 'boss rounds.', window.WRENCH_PATH.chains.length, 'Wrench Path chains.');
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
window.addEventListener('beforeunload', persistNow);

})();
