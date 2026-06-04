/**
 * /book/confirmed — thank-you screen after self-booking.
 *
 * Triggers an email reminder send (via EmailService) if SMTP is configured.
 */
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Link, useLoaderData } from "react-router";
import { CheckCircle2, Clock, MessageSquare, Scissors, Sparkles } from "lucide-react";
import { AppShell } from "~/components/glowdesk/AppShell";
import { Card } from "~/components/glowdesk/widgets";
import { useConfigurables } from "~/modules/configurables";
import { listAppointments } from "~/lib/glowdesk/service.server";
import { formatDateLong, formatTime } from "~/lib/glowdesk/format";

export const meta: MetaFunction = () => [{ title: "Booked — GlowDesk" }];

async function tryEmailReminder(opts: {
  to: string;
  clientName: string;
  appointmentTime: string;
  serviceName: string;
  stylistName: string;
  salonName: string;
}) {
  if (!opts.to) return;
  try {
    const { EmailService } = await import("~/modules/email/email.service");
    await EmailService.sendEmail({
      to: opts.to,
      subject: `You're booked at ${opts.salonName}`,
      content:
        `Hi ${opts.clientName},\n\n` +
        `You're booked for ${opts.serviceName} with ${opts.stylistName} on ${opts.appointmentTime}.\n\n` +
        `We'll send you a reminder before your visit. Can't wait to see you.\n\n— ${opts.salonName}`,
    });
  } catch (err) {
    // SMTP may not be configured in dev. Don't fail the user flow.
    console.warn("[book.confirmed] Email reminder skipped:", err);
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return { appointment: null };

  const appointments = await listAppointments({});
  const found = appointments.find((a) => a.id === id);
  if (!found) return { appointment: null };

  // Fire-and-forget reminder email
  void tryEmailReminder({
    to: found.clientEmail,
    clientName: found.clientName,
    appointmentTime: `${formatDateLong(found.startAt)} at ${formatTime(found.startAt)}`,
    serviceName: found.serviceName,
    stylistName: found.stylistName,
    salonName: "Your salon",
  });

  return { appointment: found };
}

export default function ConfirmedPage() {
  const { appointment } = useLoaderData<typeof loader>();
  const { config } = useConfigurables();
  const salonName = config?.appName ?? "Our salon";
  const thanks =
    config?.bookingThankYouMessage ||
    "You're booked. We'll send a reminder before your visit — can't wait to see you.";

  if (!appointment) {
    return (
      <AppShell hideTabBar>
        <div className="px-5 py-16 text-center">
          <h1 className="font-display text-[28px]">Hmm, we couldn't find that booking.</h1>
          <p className="t-body-s t-stone mt-2">It may have been removed. Try booking again.</p>
          <Link to="/book" className="gd-btn-primary mt-6 inline-flex">Book a visit</Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell hideTabBar>
      <div
        className="px-5 pt-16 pb-12 text-center"
        style={{
          background:
            "linear-gradient(180deg, var(--gd-pink-soft) 0%, var(--gd-cream) 100%)",
        }}
      >
        <div
          className="mx-auto mb-5 flex items-center justify-center"
          style={{
            width: 72,
            height: 72,
            borderRadius: 999,
            background: "var(--gd-pink)",
            color: "white",
          }}
        >
          <CheckCircle2 size={36} />
        </div>
        <h1 className="font-display text-[32px] leading-9" style={{ color: "var(--gd-ink)" }}>
          You're booked.
        </h1>
        <p className="t-body mt-3 t-stone max-w-sm mx-auto">{thanks}</p>
      </div>

      <div className="px-5 -mt-8">
        <Card className="p-5">
          <div className="t-caption mb-3" style={{ color: "var(--gd-pink-deep)" }}>
            <Sparkles size={12} className="inline -mt-1 mr-1" /> Your visit
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <Clock size={18} color="var(--gd-pink)" className="mt-0.5" />
              <div>
                <div className="font-semibold" style={{ color: "var(--gd-ink)" }}>
                  {formatDateLong(appointment.startAt)}
                </div>
                <div className="t-body-s t-stone num-tab">{formatTime(appointment.startAt)} · {appointment.durationMinutes}m</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Scissors size={18} color="var(--gd-pink)" className="mt-0.5" />
              <div>
                <div className="font-semibold" style={{ color: "var(--gd-ink)" }}>
                  {appointment.serviceName}
                </div>
                <div className="t-body-s t-stone">with {appointment.stylistName}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MessageSquare size={18} color="var(--gd-pink)" className="mt-0.5" />
              <div>
                <div className="font-semibold" style={{ color: "var(--gd-ink)" }}>
                  Reminder on the way
                </div>
                <div className="t-body-s t-stone">
                  We'll text or email you {config?.reminderHoursBefore ?? 24}h before.
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="px-5 mt-6 text-center">
        <p className="t-body-s t-stone">
          {salonName} · {config?.salonInfo?.address || ""}
        </p>
        <p className="t-body-s t-stone">{config?.salonInfo?.phone || ""}</p>
      </div>
    </AppShell>
  );
}
