// Umami Custom Event Tracking
//
// Loaded via <Script> in layout.tsx when NEXT_PUBLIC_UMAMI_WEBSITE_ID is set.
// All track calls silently no-op if Umami is not configured.
// Vercel Analytics (pageviews) is separate — handled by @vercel/analytics.

interface UmamiTracker {
  track: (eventName: string, data?: Record<string, string | number>) => void;
}

declare global {
  interface Window {
    umami?: UmamiTracker;
  }
}

type AnalyticsEvent =
  | { name: "quiz_started" }
  | { name: "quiz_answer"; data: { question: string; answer: string; step: number } }
  | { name: "quiz_completed"; data: { answers: string } }
  | { name: "result_viewed"; data: { top_deck: string; top_score: number; total: number } }
  | { name: "deck_expanded"; data: { deck: string; rank: number } }
  | { name: "share_clicked"; data: { method: string } }
  | { name: "retry_clicked" }
  | { name: "show_all_clicked" };

export function trackEvent(event: AnalyticsEvent): void {
  if (typeof window === "undefined") return;

  const umami = window.umami;
  if (!umami) return;

  if ("data" in event) {
    umami.track(event.name, event.data);
  } else {
    umami.track(event.name);
  }
}
