import type { ReactNode } from "react";
import { Link } from "react-router";
import { ChevronRight } from "lucide-react";
import { initialsOf } from "~/lib/glowdesk/format";

// ─── Page header ────────────────────────────────────────────────────────────
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className="flex items-start justify-between gap-4 px-5 pt-8 pb-5">
      <div className="flex-1 min-w-0">
        {eyebrow && <div className="t-caption mb-2">{eyebrow}</div>}
        <h1 className="h-display-l font-display">{title}</h1>
        {subtitle && <p className="t-body-s mt-2 t-stone">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0 pt-1">{action}</div>}
    </header>
  );
}

// ─── Section header ─────────────────────────────────────────────────────────
export function SectionHeader({
  title,
  trailing,
}: {
  title: string;
  trailing?: ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between px-5 pt-2 pb-3">
      <h2 className="h-heading">{title}</h2>
      {trailing}
    </div>
  );
}

// ─── Avatar ─────────────────────────────────────────────────────────────────
export function Avatar({
  name,
  color = "#D946A6",
  size = 40,
}: {
  name: string;
  color?: string;
  size?: number;
}) {
  return (
    <div
      aria-hidden
      className="flex items-center justify-center rounded-full font-semibold text-white shrink-0"
      style={{
        background: color,
        width: size,
        height: size,
        fontSize: Math.max(11, Math.floor(size * 0.38)),
        letterSpacing: 0.5,
      }}
    >
      {initialsOf(name) || "?"}
    </div>
  );
}

// ─── Status pill ────────────────────────────────────────────────────────────
type Variant = "confirmed" | "pending" | "cancelled" | "walkin" | "info" | "stone";
const PILL_CLASS: Record<Variant, string> = {
  confirmed: "gd-pill-confirmed",
  pending: "gd-pill-pending",
  cancelled: "gd-pill-cancelled",
  walkin: "gd-pill-walkin",
  info: "gd-pill-info",
  stone: "gd-pill-stone",
};

export function StatusPill({
  variant,
  children,
}: {
  variant: Variant;
  children: ReactNode;
}) {
  return <span className={`gd-pill ${PILL_CLASS[variant]}`}>{children}</span>;
}

export function statusToPill(
  status: string,
): { variant: Variant; label: string } {
  switch (status) {
    case "confirmed":
      return { variant: "confirmed", label: "Confirmed" };
    case "pending":
      return { variant: "pending", label: "Pending" };
    case "completed":
      return { variant: "confirmed", label: "Completed" };
    case "cancelled":
      return { variant: "cancelled", label: "Cancelled" };
    case "no_show":
      return { variant: "cancelled", label: "No-show" };
    case "walk_in":
      return { variant: "walkin", label: "Walk-in" };
    default:
      return { variant: "stone", label: status };
  }
}

// ─── Stat card ──────────────────────────────────────────────────────────────
export function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: "default" | "pink" | "warning" | "success";
}) {
  const toneBg: Record<string, string> = {
    default: "var(--gd-white)",
    pink: "var(--gd-pink-soft)",
    warning: "var(--gd-warning-soft)",
    success: "var(--gd-success-soft)",
  };
  return (
    <div
      className="gd-card p-5 flex flex-col gap-2 min-w-0"
      style={{ background: toneBg[tone] }}
    >
      <div className="t-caption">{label}</div>
      <div className="num-l num-tab">{value}</div>
      {hint && <div className="t-body-s t-stone">{hint}</div>}
    </div>
  );
}

// ─── Empty state ────────────────────────────────────────────────────────────
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-8 py-14">
      {icon && (
        <div
          className="mb-5 flex items-center justify-center"
          style={{
            width: 64,
            height: 64,
            borderRadius: 999,
            background: "var(--gd-pink-soft)",
            color: "var(--gd-pink-deep)",
          }}
        >
          {icon}
        </div>
      )}
      <h3 className="h-display-m font-display mb-2">{title}</h3>
      {description && <p className="t-body-s t-stone mb-6 max-w-xs">{description}</p>}
      {action}
    </div>
  );
}

// ─── List row link ──────────────────────────────────────────────────────────
export function ListRow({
  leading,
  primary,
  secondary,
  meta,
  to,
  onClick,
}: {
  leading?: ReactNode;
  primary: ReactNode;
  secondary?: ReactNode;
  meta?: ReactNode;
  to?: string;
  onClick?: () => void;
}) {
  const inner = (
    <div className="flex items-center gap-4 px-5 py-4 min-h-[64px]">
      {leading && <div className="shrink-0">{leading}</div>}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[15px] leading-5 truncate" style={{ color: "var(--gd-ink)" }}>{primary}</div>
        {secondary && <div className="t-body-s t-stone truncate mt-0.5">{secondary}</div>}
      </div>
      {meta && <div className="shrink-0 flex flex-col items-end gap-1">{meta}</div>}
      {to && <ChevronRight size={18} color="var(--gd-stone)" />}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="block hover:bg-[var(--gd-pink-soft)]/40 transition-colors">
        {inner}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="w-full text-left hover:bg-[var(--gd-pink-soft)]/40 transition-colors"
      >
        {inner}
      </button>
    );
  }
  return <div>{inner}</div>;
}

// ─── Card container ─────────────────────────────────────────────────────────
export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`gd-card ${className}`}>{children}</div>;
}

// ─── Divider ────────────────────────────────────────────────────────────────
export function Divider() {
  return <div className="h-px mx-5" style={{ background: "var(--gd-mist)" }} />;
}
