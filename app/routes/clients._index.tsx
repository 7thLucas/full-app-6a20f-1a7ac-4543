/**
 * Clients — list view with retention signals (lapsed flag, last visit, loyalty).
 */
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Link, useLoaderData, useSearchParams } from "react-router";
import { Heart, Search, Users } from "lucide-react";
import { AppShell } from "~/components/glowdesk/AppShell";
import {
  Avatar,
  Card,
  EmptyState,
  PageHeader,
  StatusPill,
} from "~/components/glowdesk/widgets";
import { listClients } from "~/lib/glowdesk/service.server";
import { formatMoney, formatRelative } from "~/lib/glowdesk/format";
import { useConfigurables } from "~/modules/configurables";

export const meta: MetaFunction = () => [{ title: "Clients — GlowDesk" }];

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const lapsedDays = Number(url.searchParams.get("lapsed_days") || 60);
  const clients = await listClients({ lapsedThresholdDays: lapsedDays });
  return { clients, lapsedDays };
}

export default function ClientsPage() {
  const { clients, lapsedDays } = useLoaderData<typeof loader>();
  const [params, setParams] = useSearchParams();
  const { config } = useConfigurables();
  const currency = config?.currencySymbol || "$";

  const filter = params.get("filter") ?? "all";
  const q = (params.get("q") ?? "").trim().toLowerCase();

  let filtered = clients;
  if (filter === "lapsed") filtered = filtered.filter((c) => c.isLapsed);
  if (filter === "loyal") filtered = [...filtered].sort((a, b) => b.visitCount - a.visitCount).slice(0, 20);
  if (filter === "recent")
    filtered = [...filtered]
      .filter((c) => c.lastVisitAt)
      .sort((a, b) => (new Date(b.lastVisitAt!).getTime() - new Date(a.lastVisitAt!).getTime()));
  if (q)
    filtered = filtered.filter(
      (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q),
    );

  const lapsedCount = clients.filter((c) => c.isLapsed).length;

  return (
    <AppShell>
      <PageHeader
        eyebrow="Clients"
        title="Your people"
        subtitle={`${clients.length} on file · ${lapsedCount} haven't visited in ${lapsedDays}+ days.`}
      />

      <div className="px-5 mb-4 flex items-center gap-2">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            color="var(--gd-stone)"
          />
          <input
            type="search"
            placeholder="Search by name, phone, email"
            className="gd-input"
            style={{ paddingLeft: 36 }}
            value={q}
            onChange={(e) => {
              const next = new URLSearchParams(params);
              if (e.target.value) next.set("q", e.target.value);
              else next.delete("q");
              setParams(next, { replace: true });
            }}
          />
        </div>
      </div>

      <div className="px-5 mb-4 flex gap-2 overflow-x-auto">
        {[
          { k: "all", label: `All (${clients.length})` },
          { k: "lapsed", label: `Lapsed (${lapsedCount})` },
          { k: "loyal", label: "Loyal" },
          { k: "recent", label: "Recent" },
        ].map((b) => (
          <button
            key={b.k}
            onClick={() => {
              const next = new URLSearchParams(params);
              if (b.k === "all") next.delete("filter");
              else next.set("filter", b.k);
              setParams(next, { replace: true });
            }}
            className="rounded-full px-4 py-2 text-[13px] font-semibold whitespace-nowrap transition-colors"
            style={{
              background: filter === b.k ? "var(--gd-pink)" : "var(--gd-white)",
              color: filter === b.k ? "var(--gd-white)" : "var(--gd-charcoal)",
              border: filter === b.k ? "1px solid var(--gd-pink)" : "1px solid var(--gd-mist)",
            }}
          >
            {b.label}
          </button>
        ))}
      </div>

      <div className="px-5">
        <Card>
          {filtered.length === 0 ? (
            <EmptyState
              icon={<Users size={28} />}
              title="No clients here yet"
              description="As you book, your client book grows automatically."
            />
          ) : (
            <ul className="divide-y" style={{ borderColor: "var(--gd-mist)" }}>
              {filtered.map((c) => (
                <li key={c.id}>
                  <Link
                    to={`/clients/${c.id}`}
                    className="block hover:bg-[var(--gd-pink-soft)]/40 transition-colors px-5 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={c.name} color="var(--gd-pink-deep)" size={44} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[15px] truncate" style={{ color: "var(--gd-ink)" }}>
                            {c.name}
                          </span>
                          {c.isLapsed && <StatusPill variant="pending">Lapsed</StatusPill>}
                          {!c.isLapsed && c.visitCount >= 8 && (
                            <StatusPill variant="walkin">
                              <Heart size={10} /> Regular
                            </StatusPill>
                          )}
                        </div>
                        <div className="t-body-s t-stone truncate mt-0.5">
                          {c.visitCount} visit{c.visitCount === 1 ? "" : "s"} · {formatMoney(c.totalSpent, currency)} total
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="t-body-s t-stone num-tab">{formatRelative(c.lastVisitAt)}</div>
                        <div className="t-caption mt-0.5" style={{ fontSize: 10 }}>{c.loyaltyPoints} pts</div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
