export const TRIP_ID = "lolla-2026";

export const SPOTIFY_PLAYLIST_URL =
  "https://open.spotify.com/playlist/714n1Cvf08Jvy42Uh9419s?si=39992c0862c9447b";

export const DAY_CONFIG = [
  { key: "2026-07-30", label: "Thursday, July 30", vibe: "✨ Festival Day 1" },
  { key: "2026-07-31", label: "Friday, July 31", vibe: "💃 Main Character Day" },
  { key: "2026-08-01", label: "Saturday, August 1", vibe: "🌈 Peak Lolla Energy" },
  { key: "2026-08-02", label: "Sunday, August 2", vibe: "🥲 Last Day Energy" },
  { key: "2026-08-03", label: "Monday, August 3", vibe: "☕ Reset + Reality" }
] as const;

export const LINEUP_HIGHLIGHTS = [
  "Charli XCX",
  "Tate McRae",
  "Lorde",
  "Olivia Dean",
  "John Summit",
  "Jennie",
  "The Smashing Pumpkins",
  "The xx"
];

export type TripEvent = {
  id: string;
  trip_id: string;
  day_key: string;
  title: string;
  notes: string | null;
  added_by: string | null;
  created_at: string;
};

export const STARTER_ITINERARY: Record<string, Array<Omit<TripEvent, "id" | "created_at">>> = {
  "2026-07-30": [
    { trip_id: TRIP_ID, day_key: "2026-07-30", title: "Arrive in Chicago", notes: null, added_by: "Starter" },
    { trip_id: TRIP_ID, day_key: "2026-07-30", title: "Check in", notes: null, added_by: "Starter" },
    { trip_id: TRIP_ID, day_key: "2026-07-30", title: "Walk to a local coffee shop", notes: null, added_by: "Starter" },
    { trip_id: TRIP_ID, day_key: "2026-07-30", title: "Festival day", notes: null, added_by: "Starter" },
    { trip_id: TRIP_ID, day_key: "2026-07-30", title: "Dinner / post-festival plans", notes: null, added_by: "Starter" }
  ],
  "2026-07-31": [
    { trip_id: TRIP_ID, day_key: "2026-07-31", title: "Morning Solidcore class", notes: null, added_by: "Starter" },
    { trip_id: TRIP_ID, day_key: "2026-07-31", title: "Get ready / outfits / glam", notes: null, added_by: "Starter" },
    { trip_id: TRIP_ID, day_key: "2026-07-31", title: "Festival day", notes: null, added_by: "Starter" },
    { trip_id: TRIP_ID, day_key: "2026-07-31", title: "Late-night food stop", notes: null, added_by: "Starter" }
  ],
  "2026-08-01": [
    { trip_id: TRIP_ID, day_key: "2026-08-01", title: "Coffee walk", notes: null, added_by: "Starter" },
    { trip_id: TRIP_ID, day_key: "2026-08-01", title: "Festival day", notes: null, added_by: "Starter" },
    { trip_id: TRIP_ID, day_key: "2026-08-01", title: "Group photos", notes: null, added_by: "Starter" },
    { trip_id: TRIP_ID, day_key: "2026-08-01", title: "Night plans", notes: null, added_by: "Starter" }
  ],
  "2026-08-02": [
    { trip_id: TRIP_ID, day_key: "2026-08-02", title: "Slow morning", notes: null, added_by: "Starter" },
    { trip_id: TRIP_ID, day_key: "2026-08-02", title: "Brunch or coffee", notes: null, added_by: "Starter" },
    { trip_id: TRIP_ID, day_key: "2026-08-02", title: "Final festival day", notes: null, added_by: "Starter" },
    { trip_id: TRIP_ID, day_key: "2026-08-02", title: "Pack up / reset", notes: null, added_by: "Starter" }
  ],
  "2026-08-03": [
    { trip_id: TRIP_ID, day_key: "2026-08-03", title: "Slow morning", notes: null, added_by: "Starter" },
    { trip_id: TRIP_ID, day_key: "2026-08-03", title: "Coffee run", notes: null, added_by: "Starter" },
    { trip_id: TRIP_ID, day_key: "2026-08-03", title: "Pack and checkout", notes: null, added_by: "Starter" },
    { trip_id: TRIP_ID, day_key: "2026-08-03", title: "Airport / travel home", notes: null, added_by: "Starter" },
    { trip_id: TRIP_ID, day_key: "2026-08-03", title: "Trip recap / photo dump moment", notes: null, added_by: "Starter" }
  ]
};

export function daysUntilFestival() {
  const now = new Date();
  const target = new Date("2026-07-30T00:00:00");
  const diff = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
