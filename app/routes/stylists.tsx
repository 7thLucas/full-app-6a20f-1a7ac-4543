/**
 * Stylists — team list with specialties, working hours, and weekly booking count.
 */
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Link, useLoaderData } from "react-router";
import { Scissors, Star } from "lucide-react";
import { AppShell } from "~/components/glowdesk/AppShell";
import { Avatar, Card, EmptyState, PageHeader } from "~/components/glowdesk/widgets";
import { listStylists, listAppointments } from "~/lib/glowdesk/service.server";

export const meta: MetaFunction = () => [{ title: "Stylists — GlowDesk" }];

export async function loader({ request: _request }: LoaderFunctionArgs) {
  const stylists = await listStylists();
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 7);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const appointments = await listAppointments({ from: start, to: end });
  const counts = new Map<string, number>();
  const revenue = new Map<string, number>();
  for (const a of appointments) {
    if (a.status === "cancelled" || a.status === "no_show") continue;
    counts.set(a.stylistId, (counts.get(a.stylistId) ?? 0) + 1);
    revenue.set(a.stylistId, (revenue.get(a.stylistId) ?? 0) + a.price);
  }

  return {
    stylists: stylists.map((s) => ({
      ...s,
      weekBookings: counts.get(s.id) ?? 0,
      weekRevenue: revenue.get(s.id) ?? 0,
    })),
  };
}

const DAY_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DAY_FULL: Record<string, string> = {
  mon: "monday",
  tue: "tuesday",
  wed: "wednesday",
  thu: "thursday",
  fri: "friday",
  sat: "saturday",
  sun: "sunday",
};

export default function StylistsPage() {
  const { stylists } = useLoaderData<typeof loader>();

  return (
    <AppShell>
      <PageHeader
        eyebrow="Stylists"
        title="Your chair team"
        subtitle="Who's working, what they're great at, and how the week is loading."
      />

      <div className="px-5 pb-6">
        {stylists.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Scissors size={28} />}
              title="No stylists yet"
              description="Add your first stylist to start scheduling chairs."
            />
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {stylists.map((s) => (
              <Card key={s.id} className="p-5">
                <div className="flex items-start gap-4">
                  <Avatar name={s.name} color={s.avatarColor} size={56} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-display text-[20px]" style={{ color: "var(--gd-ink)" }}>
                        {s.name}
                      </span>
                      <span
                        className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                        style={{ background: "var(--gd-pink-soft)", color: "var(--gd-pink-deep)" }}
                      >
                        {s.role}
                      </span>
                    </div>
                    <div className="t-body-s t-stone mt-1">
                      {s.specialties.slice(0, 3).join(" · ")}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-5">
                  <div>
                    <div className="t-caption">This week</div>
                    <div className="num-m num-tab">{s.weekBookings}</div>
                    <div className="t-body-s t-stone">bookings</div>
                  </div>
                  <div>
                    <div className="t-caption">Revenue</div>
                    <div className="num-m num-tab">${Math.round(s.weekRevenue)}</div>
                    <div className="t-body-s t-stone">last 7 days</div>
                  </div>
                  <div>
                    <div className="t-caption">Rating</div>
                    <div className="num-m num-tab flex items-center gap-1">
                      <Star size={16} color="var(--gd-pink)" fill="var(--gd-pink)" /> 4.9
                    </div>
                    <div className="t-body-s t-stone">avg</div>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="t-caption mb-2">Working hours</div>
                  <div className="grid grid-cols-7 gap-1">
                    {DAY_ORDER.map((short) => {
                      const full = DAY_FULL[short];
                      const hrs = s.workingHours?.[full];
                      const open = !!hrs;
                      return (
                        <div
                          key={short}
                          className="rounded-lg py-2 text-center"
                          style={{
                            background: open ? "var(--gd-pink-soft)" : "var(--gd-cream)",
                            border: open ? "1px solid transparent" : "1px solid var(--gd-mist)",
                          }}
                        >
                          <div
                            className="text-[10px] font-semibold uppercase tracking-wider"
                            style={{ color: open ? "var(--gd-pink-deep)" : "var(--gd-stone)" }}
                          >
                            {short}
                          </div>
                          <div className="text-[10px] num-tab mt-0.5" style={{ color: open ? "var(--gd-pink-deep)" : "var(--gd-stone)" }}>
                            {open ? hrs!.start : "—"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-5 flex gap-3">
                  <Link to={`/schedule`} className="gd-btn-secondary flex-1">View schedule</Link>
                  <Link to={`/schedule/new`} className="gd-btn-primary flex-1">Book on chair</Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
