import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * BottomSheet — native-feeling slide-up sheet. Scrim tap or the grabber closes
 * it; the sheet slides from the bottom, content scrolls inside. Motion follows
 * the DS tokens (eased, ~200ms). Used for Analyze → saved presets.
 */
export function BottomSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  // Keep the sheet mounted through the exit animation
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setMounted(true);
      // next frame → trigger the slide-in transition
      const id = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(id);
    }
    setShown(false);
    const t = setTimeout(() => setMounted(false), 220);
    return () => clearTimeout(t);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Block the sheet from rubber-banding the page (same guard as the tab bar)
  useEffect(() => {
    const el = sheetRef.current;
    if (!el || !mounted) return;
    const block = (e: TouchEvent) => {
      // allow scrolling inside the scrollable body, block elsewhere
      const body = el.querySelector("[data-sheet-scroll]");
      if (body && body.contains(e.target as Node)) return;
      e.preventDefault();
    };
    el.addEventListener("touchmove", block, { passive: false });
    return () => el.removeEventListener("touchmove", block);
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 500,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
      }}
    >
      {/* scrim */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "oklch(0 0 0 / 0.55)",
          opacity: shown ? 1 : 0,
          transition: "opacity var(--dur-slow) var(--ease-out)",
        }}
      />
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{
          position: "relative",
          maxHeight: "80dvh",
          display: "flex",
          flexDirection: "column",
          background: "var(--surface-card)",
          borderTopLeftRadius: "var(--radius-xl)",
          borderTopRightRadius: "var(--radius-xl)",
          borderTop: "1px solid var(--border-strong)",
          boxShadow: "var(--shadow-sheet)",
          transform: shown ? "translateY(0)" : "translateY(100%)",
          transition: "transform var(--dur-slow) var(--ease-out)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        {/* grabber */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "10px 0 4px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
        >
          <span style={{ width: 40, height: 5, borderRadius: 999, background: "var(--border-strong)" }} />
        </button>
        {title && (
          <div
            style={{
              padding: "4px var(--space-5) 12px",
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-h3)",
              fontWeight: "var(--weight-bold)",
              color: "var(--paper)",
            }}
          >
            {title}
          </div>
        )}
        <div
          data-sheet-scroll
          className="scroll-area"
          style={{ padding: "0 var(--space-5) var(--space-5)", overflowY: "auto" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
