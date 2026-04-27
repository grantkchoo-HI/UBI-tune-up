/* UBI Tune-Up v5 — Randomization & Anti-Memorization helpers
 *
 * Single source of truth for shuffle, position-bias guard, variant picking,
 * and distractor rotation. Every render path in v5 routes through this module
 * so behavior is consistent across modes.
 *
 * Exported on window.RANDOM_V5:
 *   shuffle(arr)                              Fisher-Yates copy
 *   shuffleWithBiasGuard(items, isCorrectFn, modeKey)
 *   recordCorrectPosition(modeKey, position)  Manually log a slot for the guard
 *   pickVariant(variants, questionId, fallback)
 *   filterRecentDistractors(pool, recentIds, minRemaining)
 *   resetSessionEntropy(modeKey?)
 *   getBiasReport(modeKey)                    Debugging — slot distribution
 */
window.RANDOM_V5 = (function () {
  'use strict';

  // Per-mode ring buffer: where did the correct answer end up after shuffle.
  // Capped at 16 slots; the guard inspects the last 8.
  const _biasBuffers = {};

  // Per-question variant history. Maps question id -> last 3 variant indexes used.
  const _variantHistory = {};

  function _ringPush(arr, val, max) {
    arr.push(val);
    while (arr.length > max) arr.shift();
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function _correctPosition(items, isCorrectFn) {
    for (let i = 0; i < items.length; i++) {
      if (isCorrectFn(items[i], i)) return i;
    }
    return -1;
  }

  // Shuffle, but if the correct answer would land in a slot that's been
  // dominant in this mode's last 8 questions (>=50%), reshuffle up to
  // maxRetries times. Keeps the best (lowest-recent-frequency) candidate.
  function shuffleWithBiasGuard(items, isCorrectFn, modeKey) {
    if (!modeKey || !isCorrectFn || items.length < 2) return shuffle(items);
    if (!_biasBuffers[modeKey]) _biasBuffers[modeKey] = [];
    const buf = _biasBuffers[modeKey];

    let best = shuffle(items);
    let bestPos = _correctPosition(best, isCorrectFn);
    if (bestPos < 0) return best;

    const recent = buf.slice(-8);
    if (recent.length < 4) {
      _ringPush(buf, bestPos, 16);
      return best;
    }

    const len = items.length;
    const counts = new Array(len).fill(0);
    for (const p of recent) if (p >= 0 && p < len) counts[p]++;
    const dominantThreshold = Math.ceil(recent.length / 2);

    let attempts = 0;
    let bestCount = counts[bestPos];
    while (attempts < 3 && bestCount >= dominantThreshold) {
      const candidate = shuffle(items);
      const candPos = _correctPosition(candidate, isCorrectFn);
      if (candPos >= 0 && counts[candPos] < bestCount) {
        best = candidate;
        bestPos = candPos;
        bestCount = counts[candPos];
      }
      attempts++;
    }
    _ringPush(buf, bestPos, 16);
    return best;
  }

  function recordCorrectPosition(modeKey, position) {
    if (!modeKey || position == null || position < 0) return;
    if (!_biasBuffers[modeKey]) _biasBuffers[modeKey] = [];
    _ringPush(_biasBuffers[modeKey], position, 16);
  }

  function getBiasReport(modeKey) {
    if (!modeKey || !_biasBuffers[modeKey]) return null;
    const buf = _biasBuffers[modeKey].slice();
    const counts = {};
    for (const p of buf) counts[p] = (counts[p] || 0) + 1;
    return { sample: buf.length, counts };
  }

  // Pick a variant that isn't the most-recently-used for this question id.
  // variants: string[] (rephrased prompts)
  // questionId: string key into history
  // fallback: string used when variants is empty/missing
  // Returns: { text, index }
  function pickVariant(variants, questionId, fallback) {
    if (!variants || variants.length === 0) {
      return { text: fallback || '', index: -1 };
    }
    if (variants.length === 1) {
      return { text: variants[0], index: 0 };
    }
    if (!_variantHistory[questionId]) _variantHistory[questionId] = [];
    const recent = _variantHistory[questionId];
    const recentMost = recent.length ? recent[recent.length - 1] : null;
    const candidates = [];
    for (let i = 0; i < variants.length; i++) {
      if (i !== recentMost) candidates.push(i);
    }
    const pick = candidates.length > 0
      ? candidates[Math.floor(Math.random() * candidates.length)]
      : Math.floor(Math.random() * variants.length);
    _ringPush(recent, pick, 3);
    return { text: variants[pick], index: pick };
  }

  // Exclude the term ids in `recentIds` from `pool` only when enough
  // remain. Falls through to the unfiltered pool otherwise so very-narrow
  // distractor pools (e.g. confusables) aren't starved.
  function filterRecentDistractors(pool, recentIds, minRemaining) {
    if (!recentIds || recentIds.length === 0) return pool;
    const exclude = new Set(recentIds);
    const filtered = pool.filter(p => !exclude.has(p.id != null ? p.id : p));
    return filtered.length >= (minRemaining || 0) ? filtered : pool;
  }

  function resetSessionEntropy(modeKey) {
    if (modeKey) {
      _biasBuffers[modeKey] = [];
    } else {
      for (const k in _biasBuffers) _biasBuffers[k] = [];
    }
  }

  return {
    shuffle,
    shuffleWithBiasGuard,
    recordCorrectPosition,
    pickVariant,
    filterRecentDistractors,
    resetSessionEntropy,
    getBiasReport,
  };
})();
