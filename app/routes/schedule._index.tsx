/**
 * Schedule — day-by-day stylist calendar with conflict-safe view.
 *
 * Mobile: vertical day timeline. Picks the day from ?date=YYYY-MM-DD or today.
 */
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Link, useLoaderData, useSearchParams } from "react-router";
import { CalendarPlus, ChevronLeft, ChevronRight } from "lucide-react";
import { AppShell } from "~/components/glowdesk/AppShell";
import {
  Avatar,
  Card,
  EmptyState,
  PageHeader,
  StatusPill,
  statusToPill,
} from "~/components/glowdesk/widgets";
import {
  listAppointments,
  listStylists,
} from "~/lib/glowdesk/service.server";
import {
  addDays,
  formatDateLong,
  formatTime,
  isoDate,
  parseLocalDate,
  startOfDay,
} from "~/lib/glowdesk/format";

export const meta: MetaFunction = () => [{ title: "Schedule — GlowDesk" }];

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const dateParam = url.searchParams.get("date");
  const day = dateParam ? parseLocalDate(dateParam) : new Date();
  const dayStart = startOfDay(day);
  const dayEnd = addDays(dayStart, 1);

  const [appointments, stylists] = await Promise.all([
    listAppointments({ from: dayStart, to: dayEnd }),
    listStylists(),
  ]);

  return {
    selectedDate: isoDate(dayStart),
    selectedDateLong: formatDateLong(dayStart),
    appointments,
    stylists,
    isToday: isoDate(dayStart) === isoDate(new Date()),
  };
}

const HOUR_PX = 64;
const START_HOUR = 8;
const END_HOUR = 20;

export default function SchedulePage() {
  const { selectedDate, selectedDateLong, appointments, stylists, isToday } =
    useLoaderData<typeof loader>();
  const [params] = useSearchParams();

  const baseDate = parseLocalDate(selectedDate);
  const prev = new Date(baseDate);
  prev.setDate(prev.getDate() - 1);
  const next = new Date(baseDate);
  next.setDate(next.getDate() + 1);

  const stylistMap = new Map(stylists.map((s) => [s.id, s]));

  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

  function posFor(iso: string): number {
    const d = new Date(iso);
    const minutes = (d.getHours() - START_HOUR) * 60 + d.getMinutes();
    return Math.max(0, (minutes / 60) * HOUR_PX);
  }

  function heightFor(durationMinutes: number): number {
    return Math.max(36, (durationMinutes / 60) * HOUR_PX);
  }

  const nowMinutes = (() => {
    const n = new Date();
    return (n.getHours() - START_HOUR) * 60 + n.getMinutes();
  })();
  const nowPx = (nowMinutes / 60) * HOUR_PX;
  const showNowLine =
    isToday && nowMinutes >= 0 && nowMinutes <= (END_HOUR - START_HOUR) * 60;

  return (
    <AppShell>
      <PageHeader
        eyebrow="Schedule"
        title={isToday ? "Today's chairs" : selectedDateLong}
        subtitle={
          isToday
            ? "Live view of every chair, every stylist, every conflict prevented."
            : selectedDateLong
        }
        action={
          <Link to="/schedule/new" className="gd-btn-primary" style={{ padding: "10px 14px" }}>
            <CalendarPlus size={16} /> New
          </Link>
        }
      />

      {/* Day strip */}
      <div className="px-5 mb-3">
        <Card className="flex items-center justify-between px-3 py-2">
          <Link
            to={`/schedule?date=${isoDate(prev)}`}
            className="gd-btn-tertiary flex items-center gap-1"
            aria-label="Previous day"
          >
            <ChevronLeft size={18} /> Prev
          </Link>
          <Link
            to={`/schedule`}
            className="font-display text-[18px]"
            style={{ color: "var(--gd-ink)" }}
          >
            {selectedDateLong}
          </Link>
          <Link
            to={`/schedule?date=${isoDate(next)}`}
            className="gd-btn-tertiary flex items-center gap-1"
            aria-label="Next day"
          >
            Next <ChevronRight size={18} />
          </Link>
        </Card>
      </div>

      {/* Stylist chips legend */}
      <div className="px-5 mb-4 flex gap-2 flex-wrap">
        {stylists.map((s) => (
          <span
            key={s.id}
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[12px] font-medium"
            style={{
              background: "var(--gd-white)",
              border: "1px solid var(--gd-mist)",
              color: "var(--gd-charcoal)",
            }}
          >
            <span
              aria-hidden
              className="inline-block rounded-full"
              style={{ width: 10, height: 10, background: s.avatarColor }}
            />
            {s.name.split(" ")[0]}
          </span>
        ))}
      </div>

      {/* Timeline */}
      <div className="px-5 pb-6">
        <Card>
          {appointments.length === 0 ? (
            <EmptyState
              icon={<CalendarPlus size={28} />}
              title="Your day is wide open"
              description="No appointments on this day. A great time to fill chairs or take a breath."
              action={
                <Link to="/schedule/new" className="gd-btn-primary">
                  Book appointment
                </Link>
              }
            />
          ) : (
            <div className="relative px-3 py-4">
              <div className="relative" style={{ height: hours.length * HOUR_PX }}>
                {/* hour grid */}
                {hours.map((h, i) => (
                  <div
                    key={h}
                    className="absolute left-0 right-0"
                    style={{
                      top: i * HOUR_PX,
                      borderTop: "1px solid var(--gd-mist)",
                    }}
                  >
                    <span
                      className="absolute -top-2 left-0 t-caption num-tab"
                      style={{ background: "var(--gd-white)", padding: "0 4px" }}
                    >
                      {h === 12 ? "12 PM" : h > 12 ? `${h - 12} PM` : `${h} AM`}
                    </span>
                  </div>
                ))}

                {/* now-line */}
                {showNowLine && (
                  <div
                    className="absolute left-12 right-2 gd-nowline"
                    style={{ top: nowPx }}
                  >
                    <span
                      className="absolute -top-5 right-0 t-caption"
                      style={{ color: "var(--gd-pink)", fontWeight: 700 }}
                    >
                      Now
                    </span>
                  </div>
                )}

                {/* appointments */}
                {appointments.map((a, idx) => {
                  const stylist = stylistMap.get(a.stylistId);
                  const top = posFor(a.startAt);
                  const height = heightFor(a.durationMinutes);
                  const color = stylist?.avatarColor || "var(--gd-pink)";
                  // simple column splitting (max 2 lanes for mobile)
                  const lane = idx % 2;
                  return (
                    <div
                      key={a.id}
                      className="absolute rounded-xl px-3 py-2 overflow-hidden"
                      style={{
                        top,
                        left: `calc(48px + ${lane * 50}%)`,
                        width: `calc(50% - 24px)`,
                        height,
                        background: "var(--gd-white)",
                        borderLeft: `4px solid ${color}`,
                        boxShadow:
                          "0 1px 2px rgba(26,18,22,0.06), 0 4px 12px rgba(26,18,22,0.06)",
                      }}
                    >
                      <div className="text-[11px] font-semibold num-tab" style={{ color: "var(--gd-ink)" }}>
                        {formatTime(a.startAt)}
                      </div>
                      <div className="text-[13px] font-semibold truncate mt-0.5" style={{ color: "var(--gd-ink)" }}>
                        {a.clientName}
                      </div>
                      <div className="text-[11px] truncate t-stone">
                        {a.serviceName}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* List view (canonical, accessible) */}
      <div className="px-5 pb-6">
        <h2 className="h-heading px-1 mb-3">All bookings ({appointments.length})</h2>
        <Card>
          {appointments.length === 0 ? (
            <div className="px-5 py-6">
              <p className="t-body-s t-stone">No bookings.</p>
            </div>
          ) : (
            <ul className="divide-y" style={{ borderColor: "var(--gd-mist)" }}>
              {appointments.map((a) => {
                const pill = statusToPill(a.status);
                const stylist = stylistMap.get(a.stylistId);
                return (
                  <li key={a.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="w-14 shrink-0 text-right">
                      <div className="font-semibold text-[14px] num-tab" style={{ color: "var(--gd-ink)" }}>
                        {formatTime(a.startAt)}
                      </div>
                      <div className="t-caption mt-0.5" style={{ fontSize: 10 }}>
                        {a.durationMinutes}m
                      </div>
                    </div>
                    <Avatar
                      name={a.clientName === "Walk-in" ? "WI" : a.clientName}
                      color={stylist?.avatarColor || "var(--gd-pink)"}
                      size={36}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[14px] truncate" style={{ color: "var(--gd-ink)" }}>
                        {a.clientName}
                      </div>
                      <div className="t-body-s t-stone truncate">
                        {a.serviceName} · {a.stylistName}
                      </div>
                    </div>
                    <StatusPill variant={pill.variant}>{pill.label}</StatusPill>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      {/* Pass-through param for "new" link to preserve date */}
      <input type="hidden" name="date" value={params.get("date") ?? ""} />
    </AppShell>
  );
}
