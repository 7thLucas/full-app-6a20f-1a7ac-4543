/**
 * New appointment — owner-side booking form.
 *
 * Conflict detection is enforced server-side in createAppointment.
 */
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "react-router";
import { Form, redirect, useActionData, useLoaderData, useNavigation } from "react-router";
import { useState } from "react";
import { ArrowLeft, CalendarPlus } from "lucide-react";
import { AppShell } from "~/components/glowdesk/AppShell";
import { Card, PageHeader } from "~/components/glowdesk/widgets";
import {
  createAppointment,
  listServices,
  listStylists,
} from "~/lib/glowdesk/service.server";
import { Link } from "react-router";
import { isoDate } from "~/lib/glowdesk/format";

export const meta: MetaFunction = () => [{ title: "New appointment — GlowDesk" }];

export async function loader({ request: _request }: LoaderFunctionArgs) {
  const [stylists, services] = await Promise.all([listStylists(), listServices()]);
  return {
    stylists,
    services,
    todayIso: isoDate(new Date()),
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
  const notes = String(form.get("notes") ?? "").trim();

  if (!clientName) return { error: "Please add a client name." };
  if (!stylistId) return { error: "Pick a stylist." };
  if (!serviceName) return { error: "Pick a service." };
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
    notes,
    source: "owner",
  });

  if (!result.ok) {
    return { error: result.error };
  }

  return redirect(`/schedule?date=${date}`);
}

export default function NewAppointmentPage() {
  const { stylists, services, todayIso } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [selectedService, setSelectedService] = useState(services[0]?.name ?? "");
  const current = services.find((s) => s.name === selectedService) ?? services[0];

  return (
    <AppShell>
      <div className="px-5 pt-6">
        <Link to="/schedule" className="gd-btn-tertiary inline-flex items-center gap-1 px-0">
          <ArrowLeft size={16} /> Schedule
        </Link>
      </div>
      <PageHeader
        title="New appointment"
        subtitle="Book a chair. We'll check for conflicts before saving."
      />

      <div className="px-5 pb-10">
        <Card className="p-5">
          <Form method="post" className="flex flex-col gap-5">
            {actionData?.error && (
              <div
                className="rounded-xl px-4 py-3 t-body-s"
                style={{
                  background: "var(--gd-alert-soft)",
                  color: "#8A2D2D",
                  border: "1px solid #F0BFBF",
                }}
              >
                {actionData.error}
              </div>
            )}

            <div>
              <label htmlFor="clientName" className="gd-label">Client name</label>
              <input
                id="clientName"
                name="clientName"
                className="gd-input"
                required
                placeholder="e.g. Eloise Tran"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="clientPhone" className="gd-label">Phone</label>
                <input id="clientPhone" name="clientPhone" className="gd-input" placeholder="555-0100" />
              </div>
              <div>
                <label htmlFor="clientEmail" className="gd-label">Email</label>
                <input id="clientEmail" name="clientEmail" type="email" className="gd-input" placeholder="optional" />
              </div>
            </div>

            <div>
              <label htmlFor="stylistId" className="gd-label">Stylist</label>
              <select id="stylistId" name="stylistId" className="gd-input" required defaultValue={stylists[0]?.id}>
                {stylists.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {s.role}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="serviceName" className="gd-label">Service</label>
              <select
                id="serviceName"
                name="serviceName"
                className="gd-input"
                required
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
              >
                {services.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name} · {s.durationMinutes}m · ${s.price}
                  </option>
                ))}
              </select>
              <input type="hidden" name="durationMinutes" value={current?.durationMinutes ?? 60} />
              <input type="hidden" name="price" value={current?.price ?? 0} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="date" className="gd-label">Date</label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  className="gd-input"
                  required
                  defaultValue={todayIso}
                />
              </div>
              <div>
                <label htmlFor="time" className="gd-label">Time</label>
                <input
                  id="time"
                  name="time"
                  type="time"
                  className="gd-input"
                  required
                  defaultValue="10:00"
                  step={900}
                />
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="gd-label">Notes</label>
              <textarea
                id="notes"
                name="notes"
                className="gd-input"
                rows={3}
                placeholder="Color formula, preferences, allergies…"
              />
            </div>

            <button type="submit" className="gd-btn-primary" disabled={isSubmitting}>
              <CalendarPlus size={18} /> {isSubmitting ? "Booking…" : "Book appointment"}
            </button>
          </Form>
        </Card>
      </div>
    </AppShell>
  );
}
