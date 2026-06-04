/**
 * Today — the operator's home screen.
 *
 * One-glance answers: today's revenue, next appointment, walk-ins, reminders due,
 * lapsed clients, low stock. Everything actionable within one tap.
 */
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Link, useLoaderData } from "react-router";
import {
  AlarmClock,
  ArrowRight,
  CalendarPlus,
  Heart,
  Package,
  Sparkles,
  Users,
} from "lucide-react";
import { useConfigurables } from "~/modules/configurables";
import { AppShell } from "~/components/glowdesk/AppShell";
import {
  Avatar,
  Card,
  EmptyState,
  PageHeader,
  SectionHeader,
  StatCard,
  StatusPill,
  statusToPill,
} from "~/components/glowdesk/widgets";
import {
  getTodaySummary,
  getRetentionInsights,
  listProducts,
} from "~/lib/glowdesk/service.server";
import { formatMoney, formatTime, isToday } from "~/lib/glowdesk/format";

export const meta: MetaFunction = () => [
  { title: "Today — GlowDesk" },
  { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
];

export async function loader({ request: _request }: LoaderFunctionArgs) {
  const [summary, retention, products] = await Promise.all([
    getTodaySummary(),
    getRetentionInsights(60),
    listProducts(5),
  ]);

  const lowStock = products.filter((p) => p.isLowStock || p.isOutOfStock);

  return {
    summary,
    retention,
    lowStockCount: lowStock.length,
    lowStockSamples: lowStock.slice(0, 3),
  };
}

export default function TodayPage() {
  const { summary, retention, lowStockCount, lowStockSamples } =
    useLoaderData<typeof loader>();
  const { config } = useConfigurables();

  const greetingHour = new Date().getHours();
  const greeting =
    greetingHour < 12 ? "Good morning" : greetingHour < 18 ? "Good afternoon" : "Good evening";
  const ownerName = config?.ownerName || "";
  const welcomeBase = config?.welcomeMessage || "Your chair is ready.";
  const currency = config?.currencySymbol || "$";
  const showRetention = config?.showRetentionInsights !== false;
  const showInventory = config?.showInventoryAlerts !== false;

  const nextUp = summary.appointments.find((a) => {
    const start = new Date(a.startAt).getTime();
    return start >= Date.now() && a.status !== "cancelled" && a.status !== "no_show";
  });

  return (
    <AppShell>
      <PageHeader
        eyebrow="Today"
        title={ownerName ? `${greeting}, ${ownerName}.` : greeting + "."}
        subtitle={welcomeBase}
      />

      {/* Today metrics */}
      <section className="px-5">
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Revenue Booked"
            value={formatMoney(summary.revenue, currency)}
            hint={`${summary.totalCount} ${summary.totalCount === 1 ? "appointment" : "appointments"}`}
            tone="pink"
          />
          <StatCard
            label="Reminders Due"
            value={summary.remindersDue}
            hint={summary.remindersDue === 0 ? "All caught up" : "Tap to send"}
          />
          <StatCard
            label="Confirmed"
            value={summary.confirmed}
            hint={`${summary.pending} pending · ${summary.walkIns} walk-in${summary.walkIns === 1 ? "" : "s"}`}
          />
          <StatCard
            label="Chairs Active"
            value={summary.totalCount}
            hint="Today's schedule"
          />
        </div>
      </section>

      {/* Next up */}
      <SectionHeader title="Up next" trailing={<Link to="/schedule" className="gd-btn-tertiary">Schedule</Link>} />
      <div className="px-5">
        {nextUp ? (
          <Card className="p-5">
            <div className="flex items-start gap-4">
              <Avatar name={nextUp.clientName} color="var(--gd-pink-deep)" size={48} />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-display text-[22px] leading-7" style={{ color: "var(--gd-ink)" }}>
                    {formatTime(nextUp.startAt)}
                  </span>
                  <StatusPill {...{ variant: statusToPill(nextUp.status).variant }}>
                    {statusToPill(nextUp.status).label}
                  </StatusPill>
                </div>
                <div className="t-body mt-1" style={{ color: "var(--gd-ink)" }}>
                  {nextUp.clientName}
                </div>
                <div className="t-body-s t-stone mt-1">
                  {nextUp.serviceName} · with {nextUp.stylistName}
                </div>
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <Link to={`/schedule`} className="gd-btn-secondary flex-1">
                Open schedule
              </Link>
              <Link
                to={`/clients`}
                className="gd-btn-primary flex-1"
              >
                Client profile <ArrowRight size={16} />
              </Link>
            </div>
          </Card>
        ) : (
          <Card className="py-2">
            <EmptyState
              icon={<Sparkles size={28} />}
              title="Your afternoon is clear"
              description="No more appointments on the books today. A great moment to catch up or invite a lapsed client back."
              action={
                <Link to="/schedule/new" className="gd-btn-primary">
                  <CalendarPlus size={16} /> Book appointment
                </Link>
              }
            />
          </Card>
        )}
      </div>

      {/* Today's chairs */}
      <SectionHeader title="Today's chairs" trailing={<Link to="/schedule" className="gd-btn-tertiary">All</Link>} />
      <div className="px-5">
        <Card>
          {summary.appointments.length === 0 ? (
            <EmptyState
              icon={<CalendarPlus size={28} />}
              title="Your week is wide open"
              description="No appointments yet today. Let's fill the chairs."
              action={
                <Link to="/schedule/new" className="gd-btn-primary">
                  Book appointment
                </Link>
              }
            />
          ) : (
            <ul className="divide-y" style={{ borderColor: "var(--gd-mist)" }}>
              {summary.appointments.map((a) => {
                const pill = statusToPill(a.status);
                return (
                  <li key={a.id} className="flex items-center gap-4 px-5 py-4">
                    <div className="w-14 shrink-0 text-right">
                      <div className="font-semibold text-[15px] num-tab" style={{ color: "var(--gd-ink)" }}>
                        {formatTime(a.startAt)}
                      </div>
                      <div className="t-caption mt-1" style={{ fontSize: 10 }}>
                        {a.durationMinutes}m
                      </div>
                    </div>
                    <Avatar name={a.clientName === "Walk-in" ? "WI" : a.clientName} color="var(--gd-pink)" size={40} />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[15px] truncate" style={{ color: "var(--gd-ink)" }}>
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

      {/* Retention */}
      {showRetention && (
        <>
          <SectionHeader
            title="Retention loop"
            trailing={<Link to="/clients" className="gd-btn-tertiary">Open clients</Link>}
          />
          <div className="px-5 grid grid-cols-2 gap-3">
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-1">
                <Users size={16} color="var(--gd-pink-deep)" />
                <div className="t-caption">Lapsed clients</div>
              </div>
              <div className="num-l num-tab">{retention.lapsedCount}</div>
              <div className="t-body-s t-stone mt-1">
                Haven't visited in 60+ days. Reach out today.
              </div>
            </Card>
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-1">
                <Heart size={16} color="var(--gd-pink-deep)" />
                <div className="t-caption">Loyal regulars</div>
              </div>
              <div className="num-l num-tab">{retention.loyal.length}</div>
              <div className="t-body-s t-stone mt-1">
                Top clients by total visits — say thanks.
              </div>
            </Card>
          </div>

          {retention.lapsed.length > 0 && (
            <div className="px-5 mt-3">
              <Card>
                <div className="px-5 pt-4 pb-2 flex items-center gap-2">
                  <span className="t-caption">Reach out</span>
                </div>
                <ul className="divide-y" style={{ borderColor: "var(--gd-mist)" }}>
                  {retention.lapsed.slice(0, 3).map((c) => (
                    <li key={c.id} className="flex items-center gap-3 px-5 py-3">
                      <Avatar name={c.name} color="var(--gd-pink-deep)" size={36} />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-[14px] truncate" style={{ color: "var(--gd-ink)" }}>
                          {c.name}
                        </div>
                        <div className="t-body-s t-stone truncate">
                          Last seen {c.daysSinceLastVisit} days ago · {c.visitCount} visits
                        </div>
                      </div>
                      <Link to="/clients" className="gd-btn-tertiary">Follow up</Link>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          )}
        </>
      )}

      {/* Inventory alerts */}
      {showInventory && lowStockCount > 0 && (
        <>
          <SectionHeader
            title="Restock soon"
            trailing={<Link to="/inventory" className="gd-btn-tertiary">All stock</Link>}
          />
          <div className="px-5">
            <Card>
              <div className="px-5 pt-4 pb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package size={16} color="#7C5712" />
                  <span className="t-caption" style={{ color: "#7C5712" }}>
                    {lowStockCount} {lowStockCount === 1 ? "product" : "products"} below threshold
                  </span>
                </div>
              </div>
              <ul className="divide-y" style={{ borderColor: "var(--gd-mist)" }}>
                {lowStockSamples.map((p) => (
                  <li key={p.id} className="flex items-center gap-3 px-5 py-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        background: p.isOutOfStock ? "var(--gd-alert-soft)" : "var(--gd-warning-soft)",
                        color: p.isOutOfStock ? "#8A2D2D" : "#7C5712",
                      }}
                    >
                      <Package size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[14px] truncate" style={{ color: "var(--gd-ink)" }}>
                        {p.name}
                      </div>
                      <div className="t-body-s t-stone truncate">
                        {p.stockOnHand} {p.unit}{p.stockOnHand === 1 ? "" : "s"} left · {p.brand}
                      </div>
                    </div>
                    <StatusPill variant={p.isOutOfStock ? "cancelled" : "pending"}>
                      {p.isOutOfStock ? "Out" : "Low"}
                    </StatusPill>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </>
      )}

      {/* Quick action */}
      <div className="px-5 mt-8 flex flex-col gap-3">
        <Link to="/schedule/new" className="gd-btn-primary">
          <CalendarPlus size={18} /> New appointment
        </Link>
        <Link to="/book" className="gd-btn-secondary">
          <AlarmClock size={18} /> Share self-booking link
        </Link>
      </div>

      {/* Date footer */}
      <p className="t-caption text-center mt-8">
        {isToday(new Date().toISOString()) && new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
      </p>
    </AppShell>
  );
}
