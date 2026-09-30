import { useSyncExternalStore, type ReactNode } from "react";
import { BorderBeam } from "border-beam";

const MOTION_KEY = "portfolio-motion";
const MOTION_EVENT = "portfolio-motion-change";
let pausedInMemory = false;

function subscribe(onChange: () => void) {
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  preference.addEventListener("change", onChange);
  window.addEventListener(MOTION_EVENT, onChange);
  window.addEventListener("storage", onChange);
  document.addEventListener("visibilitychange", onChange);
  return () => {
    preference.removeEventListener("change", onChange);
    window.removeEventListener(MOTION_EVENT, onChange);
    window.removeEventListener("storage", onChange);
    document.removeEventListener("visibilitychange", onChange);
  };
}

function getPreference() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "reduced";
  try {
    return localStorage.getItem(MOTION_KEY) === "paused" ? "paused" : "playing";
  } catch {
    return pausedInMemory ? "paused" : "playing";
  }
}

function getPlayback() {
  return getPreference() === "playing" && document.visibilityState === "visible";
}

function toggleMotion() {
  pausedInMemory = getPreference() === "playing";
  try {
    localStorage.setItem(MOTION_KEY, pausedInMemory ? "paused" : "playing");
  } catch {
    // The in-memory preference still works when browser storage is unavailable.
  }
  window.dispatchEvent(new Event(MOTION_EVENT));
}

/** The actual Libraries.dev component; content and controls remain ordinary DOM. */
export function MotionFrame({
  children,
  variant = "panel",
}: {
  children: ReactNode;
  variant?: "action" | "panel";
}) {
  const playing = useSyncExternalStore(subscribe, getPlayback, () => false);
  return (
    <BorderBeam
      className={`motion-frame motion-frame--${variant}`}
      data-motion={playing ? "playing" : "paused"}
      size={variant === "action" ? "sm" : "md"}
      colorVariant="forest"
      theme="light"
      staticColors
      duration={variant === "action" ? 6 : 10}
      borderRadius={variant === "action" ? 3 : 1}
      brightness={1}
      saturation={1}
      glowSize={0.55}
      strength={1}
      active
      css={`
        [data-beam="{id}"] {
          overflow: visible;
          --beam-stroke-opacity: 7;
          --beam-inner-opacity: 0.2;
          --beam-bloom-opacity: 0.6;
        }
        [data-beam="{id}"]::after {
          padding: 2px;
          background: conic-gradient(
            from var(--beam-angle-{id}),
            transparent 0% 38%,
            #315c42 56%,
            #d5ed67 70%,
            transparent 84%
          );
        }
        [data-beam="{id}"][data-motion="paused"],
        [data-beam="{id}"][data-motion="paused"]::before,
        [data-beam="{id}"][data-motion="paused"]::after,
        [data-beam="{id}"][data-motion="paused"] [data-beam-bloom] {
          animation-play-state: paused !important;
        }
        [data-beam="{id}"][data-motion="paused"]::before,
        [data-beam="{id}"][data-motion="paused"]::after,
        [data-beam="{id}"][data-motion="paused"] [data-beam-bloom] {
          visibility: hidden;
        }
        @media (prefers-reduced-motion: reduce) {
          [data-beam="{id}"],
          [data-beam="{id}"]::before,
          [data-beam="{id}"]::after,
          [data-beam="{id}"] [data-beam-bloom] {
            animation: none !important;
          }
        }
      `}
    >
      {children}
    </BorderBeam>
  );
}

export function MotionControl() {
  const preference = useSyncExternalStore(subscribe, getPreference, () => "paused");
  return (
    <button
      type="button"
      className="motion-control"
      onClick={toggleMotion}
      disabled={preference === "reduced"}
      aria-label={
        preference === "playing"
          ? "Pause decorative motion"
          : preference === "reduced"
            ? "Reduced motion enabled by your device"
            : "Enable decorative motion"
      }
    >
      <span aria-hidden="true">{preference === "playing" ? "Ⅱ" : "▷"}</span>
      {preference === "playing"
        ? "Pause motion"
        : preference === "reduced"
          ? "Reduced motion"
          : "Enable motion"}
    </button>
  );
}
