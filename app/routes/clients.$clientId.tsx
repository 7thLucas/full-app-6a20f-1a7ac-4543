/**
 * Client detail — history, notes, and retention follow-up action.
 */
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "react-router";
import { Form, Link, redirect, useActionData, useLoaderData } from "react-router";
import { ArrowLeft, Mail, MessageCircle, Phone } from "lucide-react";
import { AppShell } from "~/components/glowdesk/AppShell";
import { Avatar, Card, PageHeader, StatusPill } from "~/components/glowdesk/widgets";
import {
  getClient,
  listAppointments,
} from "~/lib/glowdesk/service.server";
import { formatMoney, formatRelative, formatTime, formatDateLong } from "~/lib/glowdesk/format";
import { useConfigurables } from "~/modules/configurables";

export const meta: MetaFunction = ({ data }) => {
  const d = data as { client?: { name?: string } } | undefined;
  const name = d?.client?.name || "Client";
  return [{ title: `${name} — GlowDesk` }];
};

export async function loader({ params }: LoaderFunctionArgs) {
  const id = String(params.clientId ?? "");
  const client = await getClient(id);
  if (!client) throw new Response("Not found", { status: 404 });

  const history = await listAppointments({});
  const clientHistory = history
    .filter((a) => a.clientId === id || a.clientName === client.name)
    .sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime());

  return { client, history: clientHistory };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");
  if (intent === "followup") {
    // In a real deployment we would queue an SMS/email here.
    return redirect(`/clients/${params.clientId}?followup_sent=1`);
  }
  return { ok: false };
}

export default function ClientDetailPage() {
  const { client, history } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { config } = useConfigurables();
  const currency = config?.currencySymbol || "$";
  const url =
    typeof window !== "undefined" ? new URL(window.location.href) : null;
  const followupSent = url?.searchParams.get("followup_sent") === "1";

  return (
    <AppShell>
      <div className="px-5 pt-6">
        <Link to="/clients" className="gd-btn-tertiary inline-flex items-center gap-1 px-0">
          <ArrowLeft size={16} /> Clients
        </Link>
      </div>

      <PageHeader
        title={client.name}
        subtitle={
          client.isLapsed
            ? `Hasn't visited in ${client.daysSinceLastVisit ?? "—"} days. Worth a nudge.`
            : `${client.visitCount} visits · ${formatMoney(client.totalSpent, currency)} total`
        }
      />

      {/* Hero card */}
      <div className="px-5">
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <Avatar name={client.name} color="var(--gd-pink-deep)" size={64} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {client.isLapsed ? (
                  <StatusPill variant="pending">Lapsed</StatusPill>
                ) : client.visitCount >= 8 ? (
                  <StatusPill variant="walkin">Regular</StatusPill>
                ) : (
                  <StatusPill variant="confirmed">Active</StatusPill>
                )}
                <span className="t-body-s t-stone">{formatRelative(client.lastVisitAt)}</span>
              </div>
              {client.email && <div className="t-body-s flex items-center gap-2 truncate"><Mail size={14} color="var(--gd-stone)"/> {client.email}</div>}
              {client.phone && <div className="t-body-s flex items-center gap-2"><Phone size={14} color="var(--gd-stone)"/> {client.phone}</div>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-5">
            <div>
              <div className="t-caption">Visits</div>
              <div className="num-m num-tab">{client.visitCount}</div>
            </div>
            <div>
              <div className="t-caption">Spent</div>
              <div className="num-m num-tab">{formatMoney(client.totalSpent, currency)}</div>
            </div>
            <div>
              <div className="t-caption">Loyalty</div>
              <div className="num-m num-tab">{client.loyaltyPoints}</div>
            </div>
          </div>

          {followupSent && (
            <div
              className="mt-4 rounded-xl px-3 py-2 t-body-s"
              style={{ background: "var(--gd-success-soft)", color: "#14633F" }}
            >
              Follow-up queued. We'll send it on the next reminder pass.
            </div>
          )}
          {actionData && (actionData as { ok?: boolean })?.ok === false && (
            <div className="mt-4 rounded-xl px-3 py-2 t-body-s" style={{ background: "var(--gd-alert-soft)", color: "#8A2D2D" }}>
              Couldn't send follow-up. Try again.
            </div>
          )}

          <div className="mt-5 flex gap-3">
            <Form method="post" className="flex-1">
              <input type="hidden" name="intent" value="followup" />
              <button type="submit" className="gd-btn-primary w-full">
                <MessageCircle size={16} /> Send follow-up
              </button>
            </Form>
            <Link to={`/schedule/new`} className="gd-btn-secondary flex-1">Book again</Link>
          </div>
        </Card>
      </div>

      {/* Notes */}
      {client.notes && (
        <div className="px-5 mt-4">
          <Card className="p-5">
            <div className="t-caption mb-2">Stylist notes</div>
            <p className="t-body">{client.notes}</p>
          </Card>
        </div>
      )}

      {/* Favorite services */}
      {client.favoriteServices.length > 0 && (
        <div className="px-5 mt-4">
          <Card className="p-5">
            <div className="t-caption mb-2">Favorites</div>
            <div className="flex gap-2 flex-wrap">
              {client.favoriteServices.map((f) => (
                <span
                  key={f}
                  className="rounded-full px-3 py-1 text-[12px] font-semibold"
                  style={{ background: "var(--gd-pink-soft)", color: "var(--gd-pink-deep)" }}
                >
                  {f}
                </span>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Visit history */}
      <div className="px-5 mt-4 pb-6">
        <h2 className="h-heading mb-3 px-1">Visit history</h2>
        <Card>
          {history.length === 0 ? (
            <div className="px-5 py-6 t-body-s t-stone">No bookings yet.</div>
          ) : (
            <ul className="divide-y" style={{ borderColor: "var(--gd-mist)" }}>
              {history.map((h) => (
                <li key={h.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[14px]" style={{ color: "var(--gd-ink)" }}>
                      {h.serviceName}
                    </div>
                    <div className="t-body-s t-stone">
                      {formatDateLong(h.startAt)} · {formatTime(h.startAt)} · {h.stylistName}
                    </div>
                  </div>
                  <div className="num-tab font-semibold text-[14px]">{formatMoney(h.price, currency)}</div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
