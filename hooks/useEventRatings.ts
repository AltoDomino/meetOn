import { useCallback, useEffect, useMemo, useState } from "react";

type RatingsMap = Record<number, { avg: number; count: number }>;
type TagsMap = Record<number, string[]>;

function isNumber(v: any) {
  const n = Number(v);
  return !Number.isNaN(n);
}

function toNum(v: any) {
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

/**
 * Jeśli backend zwraca rozkład gwiazdek w stylu:
 * stars: { "1": 0, "2": 1, "3": 2, "4": 0, "5": 3 }
 * to liczymy avg + count.
 */
function computeFromStarsDistribution(stars: any): { avg: number; count: number } | null {
  if (!stars || typeof stars !== "object") return null;

  const keys = ["1", "2", "3", "4", "5"];
  const hasAny = keys.some((k) => isNumber(stars?.[k]));
  if (!hasAny) return null;

  let sum = 0;
  let cnt = 0;

  for (const k of keys) {
    const c = Number(stars?.[k] ?? 0);
    if (Number.isNaN(c)) continue;
    const starValue = Number(k);
    sum += starValue * c;
    cnt += c;
  }

  if (cnt <= 0) return { avg: 0, count: 0 };
  return { avg: sum / cnt, count: cnt };
}

/**
 * Normalizuje odpowiedź z API do mapy ocen:
 * userId -> {avg, count}
 */
function buildRatingsMap(data: any): RatingsMap {
  const list: any[] = Array.isArray(data)
    ? data
    : Array.isArray(data?.users)
    ? data.users
    : Array.isArray(data?.ratings)
    ? data.ratings
    : Array.isArray(data?.data)
    ? data.data
    : [];

  const map: RatingsMap = {};
  if (!list.length) return map;

  // wykrywanie raw ocen (większość próbek wygląda jak raw)
  const sample = list.slice(0, Math.min(list.length, 10));
  const rawHits = sample.filter(
    (r) =>
      isNumber(r?.rating) &&
      (isNumber(r?.toUserId) || isNumber(r?.ratedUserId) || isNumber(r?.ratedId))
  ).length;

  const looksLikeRaw = rawHits >= Math.ceil(sample.length / 2);

  if (looksLikeRaw) {
    const sum: Record<number, number> = {};
    const cnt: Record<number, number> = {};

    for (const r of list) {
      const targetId =
        toNum(r?.toUserId) ??
        toNum(r?.ratedUserId) ??
        toNum(r?.ratedId) ??
        toNum(r?.userId);

      const rating = toNum(r?.rating);
      if (!targetId || rating == null) continue;

      sum[targetId] = (sum[targetId] ?? 0) + rating;
      cnt[targetId] = (cnt[targetId] ?? 0) + 1;
    }

    for (const idStr of Object.keys(cnt)) {
      const id = Number(idStr);
      map[id] = { avg: sum[id] / cnt[id], count: cnt[id] };
    }

    return map;
  }

  // agregaty / users[]
  for (const r of list) {
    const idCandidate =
      r?.userId ?? r?.id ?? r?.ratedUserId ?? r?.ratedId ?? r?.toUserId ?? r?.participantId;

    const userIdNum = Number(idCandidate);
    if (!userIdNum || Number.isNaN(userIdNum)) continue;

    // 1) z rozkładu stars
    const starsComputed = computeFromStarsDistribution(r?.stars);
    if (starsComputed) {
      map[userIdNum] = starsComputed;
      continue;
    }

    // 2) jeśli backend daje avg/count w stars
    const avgFromStars =
      r?.stars?.avg ??
      r?.stars?.avgRating ??
      r?.stars?.average ??
      r?.stars?.mean ??
      r?.stars?.ratingAvg;

    const countFromStars =
      r?.stars?.count ?? r?.stars?.ratingsCount ?? r?.stars?.total ?? r?.stars?.votes;

    // 3) fallback na top-level
    const avgCandidate =
      avgFromStars ??
      r?.avgRating ??
      r?.averageRating ??
      r?.avg ??
      r?.average ??
      r?.mean ??
      r?.ratingAvg;

    const avgNum = Number(avgCandidate);
    if (Number.isNaN(avgNum)) continue;

    const countCandidate =
      countFromStars ??
      r?.count ??
      r?.ratingsCount ??
      r?.total ??
      r?.totalRatings ??
      r?.votes ??
      0;

    const countNum = Number(countCandidate);

    map[userIdNum] = {
      avg: avgNum,
      count: Number.isNaN(countNum) ? 0 : countNum,
    };
  }

  return map;
}

/**
 * Buduje mapę tagów:
 * userId -> string[]
 * Oczekuje data.users[].tags
 */
function buildTagsMap(data: any): TagsMap {
  const list: any[] = Array.isArray(data?.users)
    ? data.users
    : Array.isArray(data)
    ? data
    : [];

  const map: TagsMap = {};

  for (const u of list) {
    const id = Number(u?.userId ?? u?.id);
    if (!id || Number.isNaN(id)) continue;

    if (!Array.isArray(u?.tags)) {
      map[id] = [];
      continue;
    }

    // ✅ tags mogą być: string[] albo {tag,count}[]
    const normalized = u.tags
      .map((t: any) => {
        if (typeof t === "string") return { tag: t, count: 1 };

        const tag = t?.tag ?? t?.name ?? t?.label ?? t?.value ?? null;
        const count = Number(t?.count ?? t?.votes ?? t?.total ?? 1);

        if (typeof tag !== "string" || tag.trim().length === 0) return null;
        return { tag: tag.trim(), count: Number.isNaN(count) ? 1 : count };
      })
      .filter(Boolean) as Array<{ tag: string; count: number }>;

    // ✅ opcjonalnie: sortuj po count malejąco
    normalized.sort((a, b) => (b.count ?? 0) - (a.count ?? 0));

    // ✅ do UI zwracamy same tagi (stringi)
    map[id] = normalized.map((x) => x.tag);
  }

  return map;
}


async function fetchJson(url: string) {
  const res = await fetch(url);
  const text = await res.text().catch(() => "");
  let json: any = null;

  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // ignore
  }

  if (!res.ok) {
    const msg = (json?.error as string) || text || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return json;
}

export function useEventRatings(eventId?: string) {
  const [ratingsMap, setRatingsMap] = useState<RatingsMap>({});
  const [tagsMap, setTagsMap] = useState<TagsMap>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRatings = useCallback(async () => {
    if (!eventId) return;

    setLoading(true);
    setError(null);

    const urls = [
      `https://meeton-backend-ffmo.onrender.com/api/event/${eventId}/ratings`,
      `https://meeton-backend-ffmo.onrender.com/api/events/${eventId}/ratings`,
      `https://meeton-backend-ffmo.onrender.com/api/ratings/events/${eventId}/ratings`,
      `https://meeton-backend-ffmo.onrender.com/api/rating/events/${eventId}/ratings`,
    ];

    try {
      let data: any = null;
      let lastErr: any = null;

      for (const url of urls) {
        try {
          data = await fetchJson(url);
          console.log("[ratings] OK:", url, data);
           console.log("tags sample:", data?.users?.[0]?.tags);
          break;
        } catch (e) {
          lastErr = e;
          console.log("[ratings] FAIL:", url, e);
        }
      }

      if (!data) throw lastErr ?? new Error("Nie udało się pobrać ocen");

      setRatingsMap(buildRatingsMap(data));
      setTagsMap(buildTagsMap(data));
    } catch (e: any) {
      setError(e?.message ?? "Nie udało się pobrać ocen");
      setRatingsMap({});
      setTagsMap({});
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);

  const getUserRating = useCallback(
    (userId?: number | string) => {
      const id = Number(userId);
      if (!id || Number.isNaN(id)) return null;
      return ratingsMap[id] ?? null;
    },
    [ratingsMap]
  );

  const getUserTags = useCallback(
    (userId?: number | string) => {
      const id = Number(userId);
      if (!id || Number.isNaN(id)) return [];
      return tagsMap[id] ?? [];
    },
    [tagsMap]
  );

  const hasAnyRatings = useMemo(() => Object.keys(ratingsMap).length > 0, [ratingsMap]);

  return {
    ratingsMap,
    tagsMap,
    getUserRating,
    getUserTags,
    hasAnyRatings,
    loading,
    error,
    refetch: fetchRatings,
  };
}
