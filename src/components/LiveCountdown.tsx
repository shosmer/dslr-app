import { Countdown } from "@/components/ds";
import { formatCountdown, useNow } from "@/lib/time";

/** Self-ticking countdown leaf — isolates the 1s re-render to this component
 *  instead of the whole screen (vercel-react-best-practices: rerender-memo /
 *  rerender-defer-reads). */
export function LiveCountdown({
  target,
  label,
  tone = "amber",
  size = "lg",
}: {
  target: Date;
  label?: string | null;
  tone?: "amber" | "teal" | "danger" | "paper";
  size?: "lg" | "md" | "sm";
}) {
  const now = useNow(1000);
  return <Countdown label={label} value={formatCountdown(target.getTime() - now)} tone={tone} size={size} />;
}
