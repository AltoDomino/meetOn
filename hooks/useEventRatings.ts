import { useCallback, useEffect, useMemo, useState } from "react";

type RatingsMap = Record<number, { avg: number; count: number }>;

function isNumber(v: any) {
  const n = Number(v);
  return !Number.isNaN(n);
}

function toNum(v: any) {
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

/**
 * Normalizuje odpowiedź z API do mapy:
 *  userId -> {avg, count}
 *
 * Obsługuje 2 typy:
 * A) Agregaty: [{ userId, avgRating, count }] lub podobne pola
 * B) Surowe oceny: [{ fromUserId, toUserId/ratedUserId, rating }]
 *    -> wtedy liczymy średnią sami per "toUserId/ratedUserId"
 */
function buildRatingsMap(data: any): RatingsMap {
  const list: any[] = Array.isArray(data)
    ? data
    : Array.isArray(data?.ratings)
    ? data.ratings
    : Array.isArray(data?.data)
    ? data.data
    : [];

  const map: RatingsMap = {};

  if (!list.length) return map;

  // 🔎 wykrywanie: czy to surowe oceny?
  // jeśli większość elementów ma "rating" i ma target usera (toUserId/ratedUserId), to agregujemy.
  const sample = list.slice(0, Math.min(list.length, 10));
  const looksLikeRaw = sample.some(
    (r) =>
      isNumber(r?.rating) &&
      (isNumber(r?.toUserId) || isNumber(r?.ratedUserId) || isNumber(r?.ratedId))
  );

  if (looksLikeRaw) {
    // Agregacja surowych ocen -> avg/count per oceniany user
    const sum: Record<number, number> = {};
    const cnt: Record<number, number> = {};

    for (const r of list) {
      const targetId =
        toNum(r?.toUserId) ??
        toNum(r?.ratedUserId) ??
        toNum(r?.ratedId) ??
        toNum(r?.userId); // awaryjnie

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

  // ✅ agregaty (avg/count już policzone przez backend)
  for (const r of list) {
    const idCandidate =
      r?.userId ?? r?.ratedUserId ?? r?.ratedId ?? r?.toUserId ?? r?.participantId;

    const userIdNum = Number(idCandidate);
    if (!userIdNum || Number.isNaN(userIdNum)) continue;

    const avgCandidate =
      r?.avgRating ?? r?.averageRating ?? r?.avg ?? r?.average ?? r?.mean ?? r?.ratingAvg;

    const avgNum = Number(avgCandidate);
    if (Number.isNaN(avgNum)) continue;

    const countCandidate =
      r?.count ?? r?.ratingsCount ?? r?.total ?? r?.totalRatings ?? r?.votes ?? 0;

    const countNum = Number(countCandidate);

    map[userIdNum] = {
      avg: avgNum,
      count: Number.isNaN(countNum) ? 0 : countNum,
    };
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRatings = useCallback(async () => {
    if (!eventId) return;

    setLoading(true);
    setError(null);

    // ✅ próbujemy kilka możliwych ścieżek (bo nie widzę mounta w backendzie)
    const urls = [
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
          // console.log("[ratings] OK:", url, data); // odkomentuj na chwilę jak chcesz
          break;
        } catch (e) {
          lastErr = e;
          // console.log("[ratings] FAIL:", url, e); // odkomentuj na chwilę jak chcesz
        }
      }

      if (!data) throw lastErr ?? new Error("Nie udało się pobrać ocen");

      const map = buildRatingsMap(data);
      setRatingsMap(map);
    } catch (e: any) {
      setError(e?.message ?? "Nie udało się pobrać ocen");
      setRatingsMap({});
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

  const hasAnyRatings = useMemo(() => Object.keys(ratingsMap).length > 0, [ratingsMap]);

  return {
    ratingsMap,
    getUserRating,
    hasAnyRatings,
    loading,
    error,
    refetch: fetchRatings,
  };
}
