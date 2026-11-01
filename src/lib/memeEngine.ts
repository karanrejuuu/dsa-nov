import { MemeCaption, MemeEventName, MemeIntensity, MemeTemplate, MemeTone, AppState } from '@/types';
import defaultCaptions from '@/data/dsa-meme-captions.json';
import defaultTemplates from '@/data/imgflip-cache.json';

const DENY_LIST = ['nsfw', 'nude', 'hitler', 'nazi', 'suicide', 'slur', 'hate'];

export function normalizeString(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function isTemplateSafe(name: string): boolean {
  const lower = name.toLowerCase();
  return !DENY_LIST.some((word) => lower.includes(word));
}

// In-memory cache of resolved templates
const templateCache = new Map<string, MemeTemplate>();

export function getCachedTemplates(): MemeTemplate[] {
  if (templateCache.size === 0) {
    (defaultTemplates as any[]).forEach((t) => {
      if (isTemplateSafe(t.name)) {
        templateCache.set(normalizeString(t.name), {
          imgflip_id: String(t.id),
          name: t.name,
          url: t.url,
          box_count: t.box_count || 2,
          whitelisted: true,
        });
      }
    });
  }
  return Array.from(templateCache.values());
}

export function resolveMemeTemplate(templateName: string): MemeTemplate | null {
  const templates = getCachedTemplates();
  const targetNorm = normalizeString(templateName);

  // 1. Exact normalized match
  for (const t of templates) {
    if (normalizeString(t.name) === targetNorm) {
      return t;
    }
  }

  // 2. Substring match
  for (const t of templates) {
    const tNorm = normalizeString(t.name);
    if (tNorm.includes(targetNorm) || targetNorm.includes(tNorm)) {
      return t;
    }
  }

  return null;
}

export function getDefaultMemeCaptions(): MemeCaption[] {
  return (defaultCaptions as any[]).map((c) => ({
    id: c.id,
    event: c.event as MemeEventName,
    template_name: c.template,
    lines: c.lines,
    tone: c.tone as MemeTone,
    enabled: true,
    created_by: 'system',
    times_shown: 0,
  }));
}

export interface MemeSelectionResult {
  caption: MemeCaption;
  template: MemeTemplate | null;
}

export function getMeme(
  event: MemeEventName,
  state: AppState,
  options?: {
    forceTone?: MemeTone;
    ignoreFrequency?: boolean;
  }
): MemeSelectionResult | null {
  // Check frequency setting unless ignored (e.g. for landing, reality top, streak milestones)
  if (!options?.ignoreFrequency) {
    const freq = state.settings.meme_frequency ?? 0.85;
    if (Math.random() > freq) {
      return null;
    }
  }

  const captions = state.memeCaptions && state.memeCaptions.length > 0
    ? state.memeCaptions
    : getDefaultMemeCaptions();

  // 1. Filter by event and enabled
  let pool = captions.filter((c) => {
    if (!c.enabled) return false;
    if (c.event === event) return true;
    if ((event === 'early_start' || event === 'ahead') && (c.event === 'early_start' || c.event === 'ahead')) return true;
    if (event.startsWith('streak_') && (c.event === 'streak_milestone' || c.event.startsWith('streak_'))) return true;
    return false;
  });

  if (pool.length === 0) {
    // If specific streak or behind event has no exact match, fallback to general
    if (event.startsWith('streak_')) {
      pool = captions.filter((c) => (c.event === 'streak_milestone' || c.event === 'day_complete') && c.enabled);
    } else if (event.startsWith('behind_')) {
      pool = captions.filter((c) => (c.event === 'behind_5plus' || c.event === 'behind_3' || c.event === 'behind_1') && c.enabled);
    }
    if (pool.length === 0) return null;
  }

  // 2. Filter by Tone & Intensity
  const intensity = state.settings.meme_intensity || 'normal';

  // Rule: For skipped, only use roast tone regardless of intensity unless intensity is Chill
  if (event === 'skipped') {
    if (intensity === 'chill') {
      // Allow self or hype if in chill mode
    } else {
      const roasts = pool.filter((c) => c.tone === 'roast');
      if (roasts.length > 0) pool = roasts;
    }
  } else if (options?.forceTone) {
    const toneFiltered = pool.filter((c) => c.tone === options.forceTone);
    if (toneFiltered.length > 0) pool = toneFiltered;
  } else if (intensity === 'chill') {
    // Chill: hype only, or self if no hype
    const hypeOnly = pool.filter((c) => c.tone === 'hype');
    pool = hypeOnly.length > 0 ? hypeOnly : pool.filter((c) => c.tone !== 'roast');
  }

  // 3. Remove hidden captions
  const hiddenCaptionIds = new Set(
    state.memeEvents.filter((e) => e.hidden).map((e) => e.caption_id)
  );
  pool = pool.filter((c) => !hiddenCaptionIds.has(c.id));

  if (pool.length === 0) {
    // If all hidden, relax hidden filter
    pool = captions.filter((c) => c.event === event && c.enabled);
  }

  // 4. 7-Day No-Repeat Rule
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentShownIds = new Set(
    state.memeEvents
      .filter((e) => new Date(e.shown_at).getTime() >= sevenDaysAgo)
      .map((e) => e.caption_id)
  );

  const freshPool = pool.filter((c) => !recentShownIds.has(c.id));
  const finalPool = freshPool.length > 0 ? freshPool : pool; // Relax 7-day rule if exhausted

  // 5. Weighting: liked captions get ×3 weight
  const likedCaptionIds = new Set(
    state.memeEvents.filter((e) => e.liked).map((e) => e.caption_id)
  );

  const weightedCandidates: MemeCaption[] = [];
  finalPool.forEach((c) => {
    const weight = likedCaptionIds.has(c.id) ? 3 : 1;
    for (let i = 0; i < weight; i++) {
      weightedCandidates.push(c);
    }
  });

  const selectedCaption =
    weightedCandidates[Math.floor(Math.random() * weightedCandidates.length)] ||
    finalPool[0];

  if (!selectedCaption) return null;

  const template = resolveMemeTemplate(selectedCaption.template_name);

  return {
    caption: selectedCaption,
    template,
  };
}

export function preloadMemeImages(urls: string[]): void {
  if (typeof window === 'undefined') return;
  urls.forEach((url) => {
    if (url) {
      const img = new Image();
      img.src = url;
    }
  });
}
