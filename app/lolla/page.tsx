"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type TripEventRow = {
  id: string;
  trip_id: string;
  day_key: string;
  title: string;
  notes: string | null;
  added_by: string | null;
  created_at: string;
};

type DayMeta = {
  dayKey: string;
  date: string;
  vibe: string;
};

const TRIP_ID = "lolla-2026";

const daysMeta: DayMeta[] = [
  {
    dayKey: "2026-07-30",
    date: "Thursday, July 30",
    vibe: "✨ Festival Day 1",
  },
  {
    dayKey: "2026-07-31",
    date: "Friday, July 31",
    vibe: "💃 Main Character Day",
  },
  {
    dayKey: "2026-08-01",
    date: "Saturday, August 1",
    vibe: "🌈 Peak Lolla Energy",
  },
  {
    dayKey: "2026-08-02",
    date: "Sunday, August 2",
    vibe: "🥲 Last Day Energy",
  },
  {
    dayKey: "2026-08-03",
    date: "Monday, August 3",
    vibe: "☕ Reset + Reality",
  },
];

const starterEvents: Record<string, { title: string; added_by?: string }[]> = {
  "2026-07-30": [
    { title: "Get ready / outfits" },
    { title: "Festival day" },
    { title: "Dinner / post-festival plans" },
  ],
  "2026-07-31": [
    { title: "Morning Solidcore class" },
    { title: "Get ready / glam" },
    { title: "Festival day" },
    { title: "Late-night food stop" },
  ],
  "2026-08-01": [
    { title: "Coffee walk" },
    { title: "Festival day" },
    { title: "Group photos" },
    { title: "Night plans" },
  ],
  "2026-08-02": [
    { title: "Slow morning" },
    { title: "Brunch or coffee" },
    { title: "Final festival day" },
    { title: "One last night out maybe" },
  ],
  "2026-08-03": [
    { title: "Slow morning" },
    { title: "Coffee run" },
    { title: "Pack and checkout" },
    { title: "Airport / travel home" },
    { title: "Trip recap / photo dump moment" },
  ],
};

const lineupArtists = [
  "Charli XCX",
  "Tate McRae",
  "Lorde",
  "Olivia Dean",
  "John Summit",
  "Jennie"
];

const spotifyUrl =
  "https://open.spotify.com/playlist/714n1Cvf08Jvy42Uh9419s?si=39992c0862c9447b";

const spotifyEmbedUrl =
  "https://open.spotify.com/embed/playlist/714n1Cvf08Jvy42Uh9419s?utm_source=generator";

export default function LollaPage() {
  const [activeDay, setActiveDay] = useState(0);
  const [events, setEvents] = useState<TripEventRow[]>([]);
  const [newItem, setNewItem] = useState("");
  const [addedBy, setAddedBy] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const currentDay = daysMeta[activeDay];

  const currentDayEvents = useMemo(() => {
    return events
      .filter((event) => event.day_key === currentDay.dayKey)
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
  }, [events, currentDay.dayKey]);

  useEffect(() => {
    async function loadEvents() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("trip_events")
        .select("*")
        .eq("trip_id", TRIP_ID)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error loading trip events:", error);
        setStatusMessage("Could not load itinerary right now.");
        setLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        const seedRows = daysMeta.flatMap((day) =>
          (starterEvents[day.dayKey] || []).map((item) => ({
            trip_id: TRIP_ID,
            day_key: day.dayKey,
            title: item.title,
            notes: null,
            added_by: item.added_by ?? null,
          }))
        );

        const { data: seededData, error: seedError } = await supabase
          .from("trip_events")
          .insert(seedRows)
          .select("*");

        if (seedError) {
          console.error("Error seeding itinerary:", seedError);
          setStatusMessage("Could not create starter itinerary.");
          setLoading(false);
          return;
        }

        setEvents((seededData as TripEventRow[]) || []);
      } else {
        setEvents((data as TripEventRow[]) || []);
      }

      setLoading(false);
    }

    loadEvents();
  }, []);

  async function handleAddItem() {
    const trimmedItem = newItem.trim();
    const trimmedAddedBy = addedBy.trim();

    if (!trimmedItem || !supabase) return;

    setSaving(true);
    setStatusMessage("");

    const { data, error } = await supabase
      .from("trip_events")
      .insert({
        trip_id: TRIP_ID,
        day_key: currentDay.dayKey,
        title: trimmedItem,
        notes: null,
        added_by: trimmedAddedBy || null,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error adding itinerary item:", error);
      setStatusMessage("Could not add item.");
      setSaving(false);
      return;
    }

    setEvents((prev) => [...prev, data as TripEventRow]);
    setNewItem("");
    setAddedBy("");
    setSaving(false);
  }

  async function handleDeleteItem(id: string) {
    if (!supabase) return;

    const previous = events;
    setEvents((prev) => prev.filter((event) => event.id !== id));

    const { error } = await supabase.from("trip_events").delete().eq("id", id);

    if (error) {
      console.error("Error deleting itinerary item:", error);
      setEvents(previous);
      setStatusMessage("Could not delete item.");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      handleAddItem();
    }
  }

  function goPrev() {
    setActiveDay((prev) => (prev === 0 ? daysMeta.length - 1 : prev - 1));
  }

  function goNext() {
    setActiveDay((prev) => (prev === daysMeta.length - 1 ? 0 : prev + 1));
  }

  const pillStyles = [styles.pillPink, styles.pillPeach, styles.pillLavender, styles.pillMint];

  return (
    <main style={styles.page}>
      <div style={styles.confettiWrap} aria-hidden="true">
        <span style={{ ...styles.confettiDot, ...styles.c1 }} />
        <span style={{ ...styles.confettiDot, ...styles.c2 }} />
        <span style={{ ...styles.confettiBar, ...styles.c3 }} />
        <span style={{ ...styles.confettiBar, ...styles.c4 }} />
        <span style={{ ...styles.confettiDot, ...styles.c5 }} />
        <span style={{ ...styles.confettiBar, ...styles.c6 }} />
      </div>

      <section
        style={{
          ...styles.hero,
          padding: isMobile ? "72px 18px 34px" : styles.hero.padding,
        }}
      >
        <div style={styles.heroGlow} />
        <div style={styles.heroInner}>
          <p style={styles.eyebrow}>Chicago, IL</p>
          <h1
            style={{
              ...styles.title,
              fontSize: isMobile ? "52px" : "clamp(56px, 8vw, 92px)",
              lineHeight: isMobile ? 0.98 : styles.title.lineHeight,
            }}
          >
            Lollapalooza 2026
          </h1>
          <p
            style={{
              ...styles.date,
              fontSize: isMobile ? "18px" : "20px",
            }}
          >
            July 30 – August 3, 2026
          </p>

          <div
            style={{
              ...styles.heroMetaRow,
              gap: isMobile ? "10px" : "14px",
            }}
          >
            <span style={styles.heroPill}>Girls trip energy only 💖</span>
          </div>

          <div
            style={{
              ...styles.heroTagRow,
              maxWidth: isMobile ? "320px" : "none",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            <span style={styles.heroTag}>#lolla2026</span>
            <span style={styles.heroTag}>#festivalvibes</span>
            <span style={styles.heroTag}>#girlsjustwannahavefun</span>
          </div>
        </div>
      </section>

      <section
        style={{
          ...styles.section,
          padding: isMobile ? "20px 16px" : "28px 20px",
        }}
      >
        <h2 style={styles.sectionTitle}>Itinerary</h2>

        <div
          style={{
            ...styles.carouselWrap,
            gridTemplateColumns: isMobile ? "1fr" : "52px minmax(0, 720px) 52px",
            gap: isMobile ? "14px" : "18px",
          }}
        >
          {isMobile ? (
            <div style={styles.mobileArrowRow}>
              <button type="button" onClick={goPrev} style={styles.arrowButton}>
                ←
              </button>
              <button type="button" onClick={goNext} style={styles.arrowButton}>
                →
              </button>
            </div>
          ) : (
            <button type="button" onClick={goPrev} style={styles.arrowButton}>
              ←
            </button>
          )}

          <article
            style={{
              ...styles.card,
              padding: isMobile ? "24px 18px" : "32px",
              borderRadius: isMobile ? "24px" : "30px",
            }}
          >
            <div style={styles.cardHeader}>
              <h3
                style={{
                  ...styles.cardTitle,
                  fontSize: isMobile ? "24px" : "32px",
                }}
              >
                {currentDay.date}
              </h3>
              <p style={styles.vibe}>{currentDay.vibe}</p>
            </div>

            {loading ? (
              <p style={styles.helperText}>Loading itinerary…</p>
            ) : (
              <>
                <div style={styles.itemsWrap}>
                  {currentDayEvents.length === 0 ? (
                    <p style={styles.emptyState}>
                      Nothing here yet — add the first plan ✨
                    </p>
                  ) : (
                    currentDayEvents.map((item, index) => (
                      <div
                        key={item.id}
                        style={{
                          ...styles.itemRow,
                          flexDirection: isMobile ? "column" : "row",
                          alignItems: isMobile ? "stretch" : "flex-start",
                          borderBottom:
                            index === currentDayEvents.length - 1
                              ? "none"
                              : "1px solid #f1ece8",
                        }}
                      >
                        <div style={styles.itemTextWrap}>
                          <p style={styles.itemTitle}>{item.title}</p>
                          {item.added_by ? (
                            <p style={styles.addedBy}>added by {item.added_by}</p>
                          ) : null}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item.id)}
                          style={{
                            ...styles.deleteButton,
                            alignSelf: isMobile ? "flex-start" : "auto",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div style={styles.formWrap}>
                  <input
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Add a plan..."
                    style={styles.input}
                  />
                  <input
                    value={addedBy}
                    onChange={(e) => setAddedBy(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Your name (so we know who to blame 💅)"
                    style={styles.input}
                  />
                  <button
                    type="button"
                    onClick={handleAddItem}
                    style={styles.addButton}
                    disabled={saving}
                  >
                    {saving ? "Adding..." : "Add item"}
                  </button>
                </div>
              </>
            )}

            {statusMessage ? <p style={styles.statusText}>{statusMessage}</p> : null}
          </article>

          {!isMobile ? (
            <button type="button" onClick={goNext} style={styles.arrowButton}>
              →
            </button>
          ) : null}
        </div>

        <div style={styles.dotsWrap}>
          {daysMeta.map((day, index) => (
            <button
              key={day.dayKey}
              type="button"
              onClick={() => setActiveDay(index)}
              aria-label={`Go to ${day.date}`}
              style={{
                ...styles.dot,
                backgroundColor: index === activeDay ? "#ff5ea8" : "#d7d0cc",
              }}
            />
          ))}
        </div>
      </section>

      <section
  style={{
    ...styles.section,
    padding: isMobile ? "24px 16px" : "28px 20px",
  }}
>
  <div style={styles.lineupCard}>
    <div style={styles.lineupHeaderWrap}>
      <p style={styles.lineupEyebrow}>ON REPEAT</p>
      <h2 style={styles.sectionTitle}>Lineup crushes</h2>
      <p style={styles.lineupSubtext}>Artists we’re most excited for ✨</p>
    </div>

    <div style={styles.featuredLineupWrap}>
      {["Charli XCX", "Tate McRae", "John Summit"].map((artist, index) => {
        const featuredStyles = [
          styles.featuredPink,
          styles.featuredPeach,
          styles.featuredLavender,
        ];

        return (
          <span
            key={artist}
            style={{
              ...styles.featuredPill,
              ...featuredStyles[index % featuredStyles.length],
            }}
          >
            {artist}
          </span>
        );
      })}
    </div>

    <div
      style={{
        ...styles.lineupWrap,
        gap: isMobile ? "10px" : "12px",
      }}
    >
      {["Olivia Dean", "Lorde", "Jennie", "Major Lazer", "The Chainsmokers"].map(
        (artist, index) => {
          const pillStyles = [
            styles.pillPink,
            styles.pillPeach,
            styles.pillLavender,
            styles.pillMint,
          ];

          return (
            <span
              key={artist}
              style={{
                ...styles.pill,
                ...pillStyles[index % pillStyles.length],
                fontSize: isMobile ? "13px" : "14px",
                padding: isMobile ? "9px 14px" : "10px 16px",
              }}
            >
              {artist}
            </span>
          );
        }
      )}
    </div>
  </div>
</section>

      <section
        style={{
          ...styles.section,
          padding: isMobile ? "24px 16px" : "28px 20px",
        }}
      >
        <div style={styles.playlistHeaderWrap}>
          <h2 style={styles.sectionTitle}>Playlist</h2>
          <p style={styles.playlistSubtext}>A little preview for the trip mood</p>
        </div>

        <div
          style={{
            ...styles.playlistCard,
            padding: isMobile ? "18px" : "24px",
          }}
        >
          <div style={styles.spotifyEmbedWrap}>
            <iframe
              style={styles.spotifyIframe}
              src={spotifyEmbedUrl}
              width="100%"
              height={isMobile ? "152" : "232"}
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            />
          </div>

          <a
            href={spotifyUrl}
            target="_blank"
            rel="noreferrer"
            style={styles.playlistButton}
          >
            Open playlist
          </a>
        </div>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #fbf8f6 0%, #faf6f4 55%, #f9f5f3 100%)",
    color: "#1e1b1a",
    paddingBottom: "88px",
    position: "relative",
    overflow: "hidden",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  confettiWrap: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    zIndex: 0,
  },
  confettiDot: {
    position: "absolute",
    width: "10px",
    height: "10px",
    borderRadius: "999px",
    opacity: 0.9,
  },
  confettiBar: {
    position: "absolute",
    width: "16px",
    height: "4px",
    borderRadius: "999px",
    opacity: 0.8,
  },
  c1: { top: "100px", left: "7%", backgroundColor: "#ff5ea8" },
  c2: { top: "250px", right: "10%", backgroundColor: "#9d7cff" },
  c3: {
    top: "610px",
    left: "4%",
    backgroundColor: "#ff9b59",
    transform: "rotate(24deg)",
  },
  c4: {
    bottom: "220px",
    right: "4%",
    backgroundColor: "#37d7c3",
    transform: "rotate(-20deg)",
  },
  c5: { bottom: "100px", left: "14%", backgroundColor: "#d5ff53" },
  c6: {
    top: "980px",
    right: "13%",
    backgroundColor: "#ff5ea8",
    transform: "rotate(18deg)",
  },
  hero: {
    padding: "92px 20px 46px",
    position: "relative",
    zIndex: 1,
  },
  heroGlow: {
    position: "absolute",
    top: "34px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "560px",
    height: "240px",
    borderRadius: "999px",
    background:
      "radial-gradient(circle, rgba(255,181,215,0.28) 0%, rgba(255,181,215,0.12) 40%, rgba(255,255,255,0) 72%)",
    filter: "blur(12px)",
    pointerEvents: "none",
    zIndex: 0,
  },
  heroInner: {
    maxWidth: "1040px",
    margin: "0 auto",
    textAlign: "center",
    position: "relative",
    zIndex: 1,
  },
  eyebrow: {
    margin: 0,
    fontSize: "13px",
    textTransform: "uppercase",
    letterSpacing: "0.2em",
    color: "#a08f88",
  },
  title: {
    margin: "16px 0 14px",
    fontSize: "clamp(56px, 8vw, 92px)",
    lineHeight: 0.97,
    letterSpacing: "-0.065em",
    fontWeight: 800,
    color: "#1f1a19",
  },
  date: {
    margin: 0,
    fontSize: "20px",
    color: "#5b514d",
  },
  heroMetaRow: {
    marginTop: "18px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "14px",
    flexWrap: "wrap",
  },
  heroPill: {
    display: "inline-flex",
    alignItems: "center",
    padding: "11px 18px",
    borderRadius: "999px",
    background: "linear-gradient(180deg, #fff7fb 0%, #fff1f7 100%)",
    border: "1px solid #f3d6e5",
    color: "#9d4f77",
    fontSize: "14px",
    fontWeight: 600,
    boxShadow: "0 10px 24px rgba(199, 118, 157, 0.10)",
  },
  heroTagRow: {
    marginTop: "16px",
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "10px",
  },
  heroTag: {
    padding: "7px 12px",
    borderRadius: "999px",
    fontSize: "12px",
    color: "#7f7671",
    backgroundColor: "rgba(255,255,255,0.72)",
    border: "1px solid #eee3dd",
  },
  section: {
    maxWidth: "1040px",
    margin: "0 auto",
    padding: "24px 20px",
    position: "relative",
    zIndex: 1,
  },
  sectionTitle: {
    margin: 0,
    fontSize: "26px",
    fontWeight: 700,
    letterSpacing: "-0.03em",
    textAlign: "center",
    color: "#231d1b",
  },
  carouselWrap: {
    display: "grid",
    gridTemplateColumns: "52px minmax(0, 720px) 52px",
    gap: "18px",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "18px",
  },
  mobileArrowRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2px",
  },
  arrowButton: {
    width: "46px",
    height: "46px",
    borderRadius: "999px",
    border: "1px solid #e7dfdb",
    backgroundColor: "rgba(255,255,255,0.88)",
    color: "#1e1b1a",
    fontSize: "20px",
    cursor: "pointer",
    boxShadow: "0 10px 24px rgba(35, 22, 19, 0.06)",
  },
  card: {
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.84) 100%)",
    backdropFilter: "blur(10px)",
    border: "1px solid #ece5e1",
    borderRadius: "30px",
    padding: "32px",
    boxShadow: "0 18px 48px rgba(35, 22, 19, 0.07)",
  },
  cardHeader: {
    marginBottom: "18px",
  },
  cardTitle: {
    margin: 0,
    fontSize: "32px",
    lineHeight: 1.05,
    letterSpacing: "-0.04em",
  },
  vibe: {
    margin: "10px 0 0",
    fontSize: "15px",
    color: "#857c77",
  },
  itemsWrap: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "22px",
  },
  itemRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "16px",
    padding: "15px 0",
  },
  itemTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  itemTitle: {
    margin: 0,
    fontSize: "16px",
    lineHeight: 1.45,
  },
  addedBy: {
    margin: "6px 0 0",
    fontSize: "13px",
    color: "#8f8681",
  },
  deleteButton: {
    border: "none",
    background: "transparent",
    color: "#b16a8b",
    cursor: "pointer",
    fontSize: "13px",
    padding: 0,
    whiteSpace: "nowrap",
  },
  formWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  input: {
    width: "100%",
    padding: "13px 14px",
    borderRadius: "14px",
    border: "1px solid #e7dfdb",
    backgroundColor: "#fffdfc",
    fontSize: "14px",
    outline: "none",
  },
  addButton: {
    alignSelf: "flex-start",
    padding: "11px 16px",
    borderRadius: "14px",
    border: "1px solid #ffb7d3",
    background: "linear-gradient(180deg, #ffeaf4 0%, #ffd9ec 100%)",
    color: "#a10f63",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },
  dotsWrap: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginTop: "18px",
  },
  dot: {
    width: "10px",
    height: "10px",
    borderRadius: "999px",
    border: "none",
    cursor: "pointer",
  },
  helperText: {
    margin: 0,
    color: "#857c77",
  },
  emptyState: {
    margin: 0,
    color: "#857c77",
    fontSize: "15px",
  },
  statusText: {
    margin: "14px 0 0",
    color: "#b11468",
    fontSize: "14px",
  },
  lineupHeaderWrap: {
    textAlign: "center",
    marginBottom: "22px",
  },
  lineupEyebrow: {
    margin: "0 0 8px",
    fontSize: "12px",
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    color: "#b08597",
    fontWeight: 700,
  },
  lineupSubtext: {
    margin: "8px 0 0",
    color: "#8f8681",
    fontSize: "14px",
  },
  lineupWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    justifyContent: "center",
    maxWidth: "880px",
    margin: "0 auto",
  },
  pill: {
    padding: "10px 16px",
    borderRadius: "999px",
    fontSize: "14px",
    fontWeight: 600,
    border: "1px solid transparent",
    transition: "transform 0.15s ease",
    boxShadow: "0 8px 18px rgba(35, 22, 19, 0.04)",
  },
  pillPink: {
    background: "linear-gradient(180deg, #fff5fa 0%, #ffeef6 100%)",
    borderColor: "#f5d7e6",
    color: "#8f4f71",
  },
  pillPeach: {
    background: "linear-gradient(180deg, #fff7f1 0%, #fff1e8 100%)",
    borderColor: "#f3ddd0",
    color: "#9c6447",
  },
  pillLavender: {
    background: "linear-gradient(180deg, #f7f3ff 0%, #f1ebff 100%)",
    borderColor: "#e4daf8",
    color: "#6f5a9b",
  },
  pillMint: {
    background: "linear-gradient(180deg, #f2fffb 0%, #ebfbf6 100%)",
    borderColor: "#d7efe7",
    color: "#4d7e72",
  },
  playlistHeaderWrap: {
    textAlign: "center",
    marginBottom: "18px",
  },
  playlistSubtext: {
    margin: "8px 0 0",
    color: "#8f8681",
    fontSize: "14px",
  },
  playlistCard: {
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(255,248,251,0.9) 100%)",
  border: "1px solid #ece5e1",
  borderRadius: "28px",
  padding: "18px",
  boxShadow: "0 16px 40px rgba(35, 22, 19, 0.06)",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  alignItems: "center",

  // 👇 THIS IS THE IMPORTANT PART
  maxWidth: "760px",
  margin: "0 auto",
},
  spotifyEmbedWrap: {
  width: "100%",
  borderRadius: "18px",
  overflow: "hidden",
},
  spotifyIframe: {
    border: "none",
    display: "block",
    borderRadius: "20px",
  },
  playlistButton: {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px 16px",
  borderRadius: "999px",
  border: "1px solid #e7dfdb",
  backgroundColor: "#fffdfc",
  color: "#1e1b1a",
  textDecoration: "none",
  fontWeight: 600,
  fontSize: "14px",
},
  lineupCard: {
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(255,247,250,0.88) 100%)",
  border: "1px solid #ece3df",
  borderRadius: "30px",
  padding: "28px 22px",
  boxShadow: "0 18px 42px rgba(35, 22, 19, 0.05)",
  maxWidth: "920px",
  margin: "0 auto",
},

featuredLineupWrap: {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  gap: "12px",
  marginBottom: "18px",
},

featuredPill: {
  padding: "12px 18px",
  borderRadius: "999px",
  fontSize: "15px",
  fontWeight: 700,
  border: "1px solid transparent",
  boxShadow: "0 10px 22px rgba(35, 22, 19, 0.05)",
},

featuredPink: {
  background: "linear-gradient(180deg, #fff1f8 0%, #ffe7f2 100%)",
  borderColor: "#f3d0e2",
  color: "#934d72",
},

featuredPeach: {
  background: "linear-gradient(180deg, #fff5ee 0%, #ffede3 100%)",
  borderColor: "#f1d9ca",
  color: "#9f6648",
},

featuredLavender: {
  background: "linear-gradient(180deg, #f7f1ff 0%, #eee7ff 100%)",
  borderColor: "#dfd4f5",
  color: "#6f5d97",
},
};