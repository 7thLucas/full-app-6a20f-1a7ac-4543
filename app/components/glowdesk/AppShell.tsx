import type { ReactNode } from "react";
import { Link, useLocation } from "react-router";
import { useConfigurables } from "~/modules/configurables";
import { useAuth } from "~/modules/authentication";
import {
  CalendarDays,
  Home,
  LogIn,
  LogOut,
  Package,
  Scissors,
  Users,
} from "lucide-react";

interface AppShellProps {
  children: ReactNode;
  /** When true, the bottom tab bar AND top brand bar are hidden (e.g. on the self-booking page). */
  hideTabBar?: boolean;
  /** Optional max-width wrapper. Defaults to mobile-first (max-w-md). */
  maxWidth?: "md" | "lg" | "xl";
}

const TABS = [
  { to: "/", icon: Home, key: "today" as const, defaultLabel: "Today", match: (p: string) => p === "/" },
  { to: "/schedule", icon: CalendarDays, key: "schedule" as const, defaultLabel: "Schedule", match: (p: string) => p.startsWith("/schedule") },
  { to: "/clients", icon: Users, key: "clients" as const, defaultLabel: "Clients", match: (p: string) => p.startsWith("/clients") },
  { to: "/stylists", icon: Scissors, key: "stylists" as const, defaultLabel: "Stylists", match: (p: string) => p.startsWith("/stylists") },
  { to: "/inventory", icon: Package, key: "inventory" as const, defaultLabel: "Inventory", match: (p: string) => p.startsWith("/inventory") },
];

function BrandBar() {
  const { config } = useConfigurables();
  const { user, isAuthenticated } = useAuth();
  const salonName = config?.appName ?? "GlowDesk";

  return (
    <div
      className="sticky top-0 z-30 flex items-center justify-between px-5 py-3"
      style={{
        background: "rgba(250,246,244,0.9)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--gd-mist)",
      }}
    >
      <div className="flex items-center gap-2">
        <div
          className="rounded-lg flex items-center justify-center"
          style={{
            width: 28,
            height: 28,
            background: "var(--gd-pink)",
            color: "white",
            fontFamily: "Fraunces, Georgia, serif",
            fontWeight: 600,
            fontSize: 16,
          }}
        >
          G
        </div>
        <span className="font-display text-[16px]" style={{ color: "var(--gd-ink)" }}>
          {salonName}
        </span>
      </div>
      <div>
        {isAuthenticated ? (
          <form action="/auth/logout" method="post">
            <button
              type="submit"
              className="t-caption inline-flex items-center gap-1 px-2 py-1 rounded-full"
              style={{ color: "var(--gd-stone)" }}
              title={user?.email || user?.username || "Sign out"}
            >
              <LogOut size={12} /> {user?.username?.split(" ")[0] || "Sign out"}
            </button>
          </form>
        ) : (
          <Link
            to="/auth/login"
            className="t-caption inline-flex items-center gap-1 px-2 py-1 rounded-full"
            style={{ color: "var(--gd-pink-deep)" }}
          >
            <LogIn size={12} /> Sign in
          </Link>
        )}
      </div>
    </div>
  );
}

export function AppShell({ children, hideTabBar = false, maxWidth = "md" }: AppShellProps) {
  const location = useLocation();
  const { config } = useConfigurables();
  const nav = config?.nav ?? {};
  const maxClass =
    maxWidth === "xl" ? "max-w-3xl" : maxWidth === "lg" ? "max-w-xl" : "max-w-md";

  return (
    <div className="min-h-screen" style={{ background: "var(--gd-cream)" }}>
      <div className={`mx-auto ${maxClass} w-full ${hideTabBar ? "pb-12" : "pb-28"}`}>
        {!hideTabBar && <BrandBar />}
        {children}
      </div>

      {!hideTabBar && (
        <nav
          aria-label="Primary navigation"
          className="fixed bottom-0 left-1/2 z-40 w-full -translate-x-1/2 gd-tabbar"
        >
          <div className={`mx-auto flex ${maxClass} w-full items-stretch px-1 pb-[max(env(safe-area-inset-bottom),8px)] pt-1`}>
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = tab.match(location.pathname);
              const label = (nav as Record<string, string | undefined>)[tab.key] || tab.defaultLabel;
              return (
                <Link
                  key={tab.to}
                  to={tab.to}
                  data-active={active}
                  className="gd-tab"
                >
                  <Icon
                    size={22}
                    strokeWidth={active ? 2 : 1.6}
                    color={active ? "var(--gd-pink)" : "var(--gd-stone)"}
                  />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
