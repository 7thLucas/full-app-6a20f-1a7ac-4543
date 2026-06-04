/**
 * /book — public client self-booking page.
 *
 * Mobile-first flow: pick service → pick stylist → pick time → leave details.
 * On submit, creates an appointment with status="pending" until the owner
 * confirms from the schedule.
 */
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "react-router";
import { Form, redirect, useActionData, useLoaderData, useSearchParams } from "react-router";
import { useState } from "react";
import { Calendar, CheckCircle2, Clock, Scissors, Sparkles } from "lucide-react";
import { AppShell } from "~/components/glowdesk/AppShell";
import { Avatar, Card } from "~/components/glowdesk/widgets";
import { useConfigurables } from "~/modules/configurables";
import {
  createAppointment,
  listAppointments,
  listServices,
  listStylists,
} from "~/lib/glowdesk/service.server";
import {
  addDays,
  formatDateLong,
  isoDate,
  parseLocalDate,
  startOfDay,
} from "~/lib/glowdesk/format";

export const meta: MetaFunction = () => [
  { title: "Book a visit — GlowDesk" },
  { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
];

const OPEN_HOUR = 9;
const CLOSE_HOUR = 19;
const SLOT_MINUTES = 30;

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const dateParam = url.searchParams.get("date");
  const day = dateParam ? parseLocalDate(dateParam) : new Date();
  const dayStart = startOfDay(day);
  const dayEnd = addDays(dayStart, 1);

  const [services, stylists, todayAppointments] = await Promise.all([
    listServices(),
    listStylists(),
    listAppointments({ from: dayStart, to: dayEnd }),
  ]);

  // Compute the next 5 booking days
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(startOfDay(new Date()), i);
    return { iso: isoDate(d), label: formatDateLong(d), short: d.toLocaleDateString(undefined, { weekday: "short" }) };
  });

  // Build per-stylist taken slots map for the chosen day
  const taken: Record<string, Array<{ start: number; end: number }>> = {};
  for (const a of todayAppointments) {
    if (a.status === "cancelled" || a.status === "no_show") continue;
    const start = new Date(a.startAt).getTime();
    const end = new Date(a.endAt).getTime();
    taken[a.stylistId] = taken[a.stylistId] ?? [];
    taken[a.stylistId].push({ start, end });
  }

  return {
    services,
    stylists,
    days,
    selectedDate: isoDate(dayStart),
    taken,
  };
}

export async function action({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  const clientName = String(form.get("clientName") ?? "").trim();
  const clientPhone = String(form.get("clientPhone") ?? "").trim();
  const clientEmail = String(form.get("clientEmail") ?? "").trim();
  const stylistId = String(form.get("stylistId") ?? "").trim();
  const serviceName = String(form.get("serviceName") ?? "").trim();
  const durationMinutes = Number(form.get("durationMinutes") ?? 60);
  const price = Number(form.get("price") ?? 0);
  const date = String(form.get("date") ?? "").trim();
  const time = String(form.get("time") ?? "").trim();

  if (!clientName) return { error: "Please share your name." };
  if (!clientPhone && !clientEmail) return { error: "Add a phone or email so we can confirm." };
  if (!stylistId || !serviceName) return { error: "Pick a stylist and a service." };
  if (!date || !time) return { error: "Pick a date and time." };

  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const startAt = new Date(y, (m ?? 1) - 1, d ?? 1, hh ?? 0, mm ?? 0, 0, 0);

  const result = await createAppointment({
    clientName,
    clientPhone,
    clientEmail,
    stylistId,
    serviceName,
    durationMinutes,
    price,
    startAt,
    source: "self_booking",
  });

  if (!result.ok) return { error: result.error };

  return redirect(`/book/confirmed?id=${result.appointment.id}`);
}

function buildSlots(): string[] {
  const out: string[] = [];
  for (let h = OPEN_HOUR; h < CLOSE_HOUR; h++) {
    for (let m = 0; m < 60; m += SLOT_MINUTES) {
      out.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
    }
  }
  return out;
}

export default function BookPage() {
  const { services, stylists, days, selectedDate, taken } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { config } = useConfigurables();
  const [params, setParams] = useSearchParams();

  const tagline = config?.tagline ?? "Every chair, every client, every glow.";
  const salonName = config?.appName ?? "Our salon";

  const [serviceName, setServiceName] = useState(services[0]?.name ?? "");
  const service = services.find((s) => s.name === serviceName) ?? services[0];
  const [stylistId, setStylistId] = useState(stylists[0]?.id ?? "");
  const stylist = stylists.find((s) => s.id === stylistId) ?? stylists[0];
  const [time, setTime] = useState("10:00");

  const slots = buildSlots();
  const dayTakenForStylist = taken[stylistId] ?? [];

  function slotIsTaken(t: string): boolean {
    const [hh, mm] = t.split(":").map(Number);
    const [y, m, d] = selectedDate.split("-").map(Number);
    const slotStart = new Date(y, (m ?? 1) - 1, d ?? 1, hh ?? 0, mm ?? 0, 0, 0).getTime();
    const slotEnd = slotStart + (service?.durationMinutes ?? 60) * 60_000;
    return dayTakenForStylist.some((t) => slotStart < t.end && slotEnd > t.start);
  }

  return (
    <AppShell hideTabBar>
      {/* Hero */}
      <div
        className="px-5 pt-10 pb-8 text-center"
        style={{
          background:
            "linear-gradient(180deg, var(--gd-pink-soft) 0%, var(--gd-cream) 100%)",
        }}
      >
        <div className="t-caption mb-2" style={{ color: "var(--gd-pink-deep)" }}>
          <Sparkles size={12} className="inline -mt-1 mr-1" /> Book a visit
        </div>
        <h1 className="font-display text-[32px] leading-9" style={{ color: "var(--gd-ink)" }}>
          {salonName}
        </h1>
        <p className="t-body mt-2 t-stone">{tagline}</p>
      </div>

      <div className="px-5 pb-10 -mt-6">
        <Card className="p-5">
          <Form method="post" className="flex flex-col gap-6">
            {actionData?.error && (
              <div
                className="rounded-xl px-4 py-3 t-body-s"
                style={{ background: "var(--gd-alert-soft)", color: "#8A2D2D" }}
              >
                {actionData.error}
              </div>
            )}

            {/* Step 1: service */}
            <section>
              <div className="t-caption mb-3 flex items-center gap-2">
                <Sparkles size={14} color="var(--gd-pink)" /> Choose a service
              </div>
              <div className="grid grid-cols-2 gap-2">
                {services.map((s) => {
                  const active = s.name === serviceName;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setServiceName(s.name)}
                      className="text-left rounded-xl p-3 transition-colors"
                      style={{
                        background: active ? "var(--gd-pink-soft)" : "var(--gd-cream)",
                        border: active
                          ? "1.5px solid var(--gd-pink)"
                          : "1px solid var(--gd-mist)",
                      }}
                    >
                      <div className="font-semibold text-[14px]" style={{ color: "var(--gd-ink)" }}>
                        {s.name}
                      </div>
                      <div className="t-body-s t-stone flex items-center gap-2 mt-1">
                        <Clock size={12} /> {s.durationMinutes}m
                        <span className="num-tab">· ${s.price}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <input type="hidden" name="serviceName" value={serviceName} />
              <input type="hidden" name="durationMinutes" value={service?.durationMinutes ?? 60} />
              <input type="hidden" name="price" value={service?.price ?? 0} />
            </section>

            {/* Step 2: stylist */}
            <section>
              <div className="t-caption mb-3 flex items-center gap-2">
                <Scissors size={14} color="var(--gd-pink)" /> Choose your stylist
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {stylists.map((s) => {
                  const active = s.id === stylistId;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStylistId(s.id)}
                      className="flex flex-col items-center gap-2 rounded-2xl p-3 min-w-[100px] transition-colors"
                      style={{
                        background: active ? "var(--gd-pink-soft)" : "var(--gd-white)",
                        border: active
                          ? "1.5px solid var(--gd-pink)"
                          : "1px solid var(--gd-mist)",
                      }}
                    >
                      <Avatar name={s.name} color={s.avatarColor} size={48} />
                      <div className="text-center">
                        <div className="font-semibold text-[13px]" style={{ color: "var(--gd-ink)" }}>
                          {s.name.split(" ")[0]}
                        </div>
                        <div className="t-body-s t-stone" style={{ fontSize: 11 }}>
                          {s.role.replace("Senior ", "Sr. ")}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <input type="hidden" name="stylistId" value={stylistId} />
            </section>

            {/* Step 3: day */}
            <section>
              <div className="t-caption mb-3 flex items-center gap-2">
                <Calendar size={14} color="var(--gd-pink)" /> Pick a day
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {days.map((d) => {
                  const active = d.iso === selectedDate;
                  return (
                    <button
                      key={d.iso}
                      type="button"
                      onClick={() => {
                        const next = new URLSearchParams(params);
                        next.set("date", d.iso);
                        setParams(next, { replace: true });
                      }}
                      className="flex flex-col items-center rounded-xl p-3 min-w-[64px] transition-colors"
                      style={{
                        background: active ? "var(--gd-pink)" : "var(--gd-white)",
                        color: active ? "white" : "var(--gd-ink)",
                        border: "1px solid " + (active ? "var(--gd-pink)" : "var(--gd-mist)"),
                      }}
                    >
                      <div className="text-[11px] font-semibold uppercase">{d.short}</div>
                      <div className="text-[20px] font-bold leading-6 num-tab">{Number(d.iso.split("-")[2])}</div>
                    </button>
                  );
                })}
              </div>
              <input type="hidden" name="date" value={selectedDate} />
            </section>

            {/* Step 4: time */}
            <section>
              <div className="t-caption mb-3 flex items-center gap-2">
                <Clock size={14} color="var(--gd-pink)" /> Pick a time
              </div>
              <div className="grid grid-cols-4 gap-2">
                {slots.map((t) => {
                  const taken = slotIsTaken(t);
                  const active = t === time;
                  return (
                    <button
                      key={t}
                      type="button"
                      disabled={taken}
                      onClick={() => setTime(t)}
                      className="rounded-xl py-3 text-[13px] font-semibold num-tab transition-colors"
                      style={{
                        background: taken
                          ? "var(--gd-cream)"
                          : active
                          ? "var(--gd-pink)"
                          : "var(--gd-white)",
                        color: taken ? "var(--gd-stone)" : active ? "white" : "var(--gd-ink)",
                        border:
                          "1px solid " +
                          (taken
                            ? "var(--gd-mist)"
                            : active
                            ? "var(--gd-pink)"
                            : "var(--gd-mist)"),
                        cursor: taken ? "not-allowed" : "pointer",
                        textDecoration: taken ? "line-through" : "none",
                      }}
                    >
                      {(() => {
                        const [hh, mm] = t.split(":").map(Number);
                        const h12 = hh % 12 === 0 ? 12 : hh % 12;
                        return `${h12}:${mm.toString().padStart(2, "0")}`;
                      })()}
                    </button>
                  );
                })}
              </div>
              <input type="hidden" name="time" value={time} />
            </section>

            {/* Step 5: details */}
            <section>
              <div className="t-caption mb-3">Your details</div>
              <div className="flex flex-col gap-3">
                <input
                  name="clientName"
                  required
                  placeholder="Your full name"
                  className="gd-input"
                />
                <div className="grid grid-cols-1 gap-3">
                  <input
                    name="clientPhone"
                    placeholder="Phone (for reminders)"
                    className="gd-input"
                  />
                  <input
                    name="clientEmail"
                    type="email"
                    placeholder="Email (optional)"
                    className="gd-input"
                  />
                </div>
              </div>
            </section>

            <button type="submit" className="gd-btn-primary">
              <CheckCircle2 size={18} /> Confirm booking with {stylist?.name?.split(" ")[0]}
            </button>
            <p className="t-body-s t-stone text-center">
              You'll get a reminder before your visit.
            </p>
          </Form>
        </Card>
      </div>
    </AppShell>
  );
}
