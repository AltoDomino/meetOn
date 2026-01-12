// services/userRatings.api.ts
// Jedno źródło prawdy dla ocen userów w meetOn

export type StarsDistribution = {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
};

export type UserRatingStats = {
  userId: number;
  stars: {
    average: number;      // np. 3.8
    count: number;        // liczba wszystkich ocen
    distribution: StarsDistribution;
  };
  tags: Array<{
    tag: string;          // np. "przyjacielski"
    count: number;        // np. 2
  }>;
};

/* -------------------------------------------------------------
   PROFIL UŻYTKOWNIKA
   GET /api/users/:userId/ratings-stats
-------------------------------------------------------------- */

export async function fetchMyRatingStats(params: {
  baseUrl: string;
  userId: number;
  token?: string;
  signal?: AbortSignal;
}): Promise<UserRatingStats> {
  const { baseUrl, userId, token, signal } = params;

  const res = await fetch(`${baseUrl}/api/users/${userId}/ratings-stats`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    signal,
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || res.statusText);
  }

  return res.json();
}

/* -------------------------------------------------------------
   EVENT ROOM / LOCAL EVENT ROOM
   GET /api/events/:eventId/ratings
-------------------------------------------------------------- */

export async function fetchEventUsersRatings(params: {
  baseUrl: string;
  eventId: number;
  token?: string;
  onlyThisEvent?: boolean; // jeśli chcesz statystyki tylko z tego eventu
  signal?: AbortSignal;
}): Promise<UserRatingStats[]> {
  const { baseUrl, eventId, token, onlyThisEvent, signal } = params;

  const qs = onlyThisEvent ? "?onlyThisEvent=true" : "";

  const res = await fetch(`${baseUrl}/api/events/${eventId}/ratings${qs}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    signal,
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || res.statusText);
  }

  const data = await res.json();

  return data.users as UserRatingStats[];
}
