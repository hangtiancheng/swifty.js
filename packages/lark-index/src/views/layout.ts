/**
 * Root layout view.
 *
 * Renders the header strip and a three-column CSS Grid (1:1:1) where the
 * three children (personal / work / read-list bookmarks) are mounted as
 * sub-views via `v-lark`. The header carries a clock + greeting that ticks
 * every 30 seconds; the interval is owned by `capture()` so it is torn
 * down automatically on view destroy.
 */
import View from "../view";
import template from "./layout.html";

interface LayoutData {
  greeting: string;
  todayLabel: string;
  clock: string;
  weekday: string;
}

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function buildGreeting(d: Date): string {
  const h = d.getHours();
  if (h < 5) return "Late night";
  if (h < 11) return "Good morning";
  if (h < 13) return "Good noon";
  if (h < 18) return "Good afternoon";
  if (h < 22) return "Good evening";
  return "Late night";
}

function snapshot(): LayoutData {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const y = now.getFullYear();
  const mo = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return {
    greeting: buildGreeting(now),
    todayLabel: `${y}-${mo}-${day}`,
    clock: `${hh}:${mm}`,
    weekday: WEEKDAYS[now.getDay()] ?? "",
  };
}

export default View.extend({
  template,

  init() {
    this.assign?.();

    // Re-render the clock every 30 seconds. Using setInterval rather than
    // setTimeout-loop keeps drift bounded and is cheap (one digest/cycle).
    const timer = window.setInterval(() => {
      this.updater
        .set(snapshot() as unknown as Record<string, unknown>)
        .digest();
    }, 30_000);

    this.capture(
      "layoutTimer",
      {
        destroy() {
          window.clearInterval(timer);
        },
      },
      false,
    );
  },

  assign() {
    this.updater.snapshot();
    this.updater.set(snapshot() as unknown as Record<string, unknown>);
    return this.updater.altered();
  },

  render() {
    this.updater.digest();
  },
});
