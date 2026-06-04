/**
 * Inventory — products with stock-on-hand, low-stock alerts, and quick restock.
 */
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "react-router";
import { Form, redirect, useLoaderData, useSearchParams } from "react-router";
import { Minus, Package, Plus } from "lucide-react";
import { AppShell } from "~/components/glowdesk/AppShell";
import { Card, EmptyState, PageHeader, StatusPill } from "~/components/glowdesk/widgets";
import { adjustProductStock, listProducts } from "~/lib/glowdesk/service.server";
import { useConfigurables } from "~/modules/configurables";
import { formatMoney } from "~/lib/glowdesk/format";

export const meta: MetaFunction = () => [{ title: "Inventory — GlowDesk" }];

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const threshold = Number(url.searchParams.get("threshold") || 5);
  const products = await listProducts(threshold);
  return { products, threshold };
}

export async function action({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  const id = String(form.get("id") ?? "");
  const delta = Number(form.get("delta") ?? 0);
  if (id && delta !== 0) {
    await adjustProductStock(id, delta);
  }
  return redirect("/inventory");
}

export default function InventoryPage() {
  const { products } = useLoaderData<typeof loader>();
  const { config } = useConfigurables();
  const currency = config?.currencySymbol || "$";
  const [params, setParams] = useSearchParams();

  const categories = Array.from(new Set(products.map((p) => p.category)));
  const cat = params.get("cat") ?? "all";
  const filterLow = params.get("low") === "1";

  let filtered = cat === "all" ? products : products.filter((p) => p.category === cat);
  if (filterLow) filtered = filtered.filter((p) => p.isLowStock || p.isOutOfStock);

  const lowCount = products.filter((p) => p.isLowStock || p.isOutOfStock).length;
  const totalValue = products.reduce((s, p) => s + p.stockOnHand * p.costPerUnit, 0);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Inventory"
        title="Stock on hand"
        subtitle={`${products.length} products · ${formatMoney(totalValue, currency)} on shelf.`}
      />

      <div className="px-5 grid grid-cols-2 gap-3 mb-3">
        <Card className="p-5">
          <div className="t-caption mb-1">Low or out</div>
          <div className="num-l num-tab" style={{ color: lowCount > 0 ? "#8A2D2D" : "var(--gd-ink)" }}>
            {lowCount}
          </div>
          <div className="t-body-s t-stone mt-1">Restock before they're needed.</div>
        </Card>
        <Card className="p-5">
          <div className="t-caption mb-1">Used this month</div>
          <div className="num-l num-tab">
            {products.reduce((s, p) => s + p.usedThisMonth, 0)}
          </div>
          <div className="t-body-s t-stone mt-1">Total units pulled.</div>
        </Card>
      </div>

      <div className="px-5 mb-4 flex gap-2 overflow-x-auto">
        {[{ k: "all", label: "All" }, ...categories.map((c) => ({ k: c, label: c }))].map((b) => (
          <button
            key={b.k}
            onClick={() => {
              const next = new URLSearchParams(params);
              if (b.k === "all") next.delete("cat");
              else next.set("cat", b.k);
              setParams(next, { replace: true });
            }}
            className="rounded-full px-4 py-2 text-[13px] font-semibold whitespace-nowrap transition-colors"
            style={{
              background: cat === b.k ? "var(--gd-pink)" : "var(--gd-white)",
              color: cat === b.k ? "var(--gd-white)" : "var(--gd-charcoal)",
              border: cat === b.k ? "1px solid var(--gd-pink)" : "1px solid var(--gd-mist)",
            }}
          >
            {b.label}
          </button>
        ))}
        <button
          onClick={() => {
            const next = new URLSearchParams(params);
            if (filterLow) next.delete("low");
            else next.set("low", "1");
            setParams(next, { replace: true });
          }}
          className="rounded-full px-4 py-2 text-[13px] font-semibold whitespace-nowrap transition-colors"
          style={{
            background: filterLow ? "var(--gd-warning)" : "var(--gd-white)",
            color: filterLow ? "var(--gd-white)" : "var(--gd-charcoal)",
            border: "1px solid " + (filterLow ? "var(--gd-warning)" : "var(--gd-mist)"),
          }}
        >
          Low stock only
        </button>
      </div>

      <div className="px-5 pb-6">
        <Card>
          {filtered.length === 0 ? (
            <EmptyState
              icon={<Package size={28} />}
              title="Nothing in this category"
              description="Switch the filter, or add a new product when stock arrives."
            />
          ) : (
            <ul className="divide-y" style={{ borderColor: "var(--gd-mist)" }}>
              {filtered.map((p) => (
                <li key={p.id} className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background: p.isOutOfStock
                          ? "var(--gd-alert-soft)"
                          : p.isLowStock
                          ? "var(--gd-warning-soft)"
                          : "var(--gd-pink-soft)",
                        color: p.isOutOfStock
                          ? "#8A2D2D"
                          : p.isLowStock
                          ? "#7C5712"
                          : "var(--gd-pink-deep)",
                      }}
                    >
                      <Package size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[15px] truncate" style={{ color: "var(--gd-ink)" }}>
                          {p.name}
                        </span>
                        {p.isOutOfStock && <StatusPill variant="cancelled">Out</StatusPill>}
                        {p.isLowStock && !p.isOutOfStock && <StatusPill variant="pending">Low</StatusPill>}
                      </div>
                      <div className="t-body-s t-stone truncate">
                        {p.brand} · {p.category}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="num-m num-tab" style={{ color: "var(--gd-ink)" }}>
                        {p.stockOnHand}
                      </div>
                      <div className="t-caption" style={{ fontSize: 10 }}>{p.unit}{p.stockOnHand === 1 ? "" : "s"}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 justify-between">
                    <div className="t-body-s t-stone">
                      Used this month: <span className="num-tab font-semibold" style={{ color: "var(--gd-ink)" }}>{p.usedThisMonth}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Form method="post" className="inline">
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="delta" value={-1} />
                        <button
                          type="submit"
                          aria-label="Decrease stock"
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ border: "1px solid var(--gd-mist)", background: "var(--gd-white)" }}
                        >
                          <Minus size={16} color="var(--gd-charcoal)" />
                        </button>
                      </Form>
                      <Form method="post" className="inline">
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="delta" value={1} />
                        <button
                          type="submit"
                          aria-label="Increase stock"
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ background: "var(--gd-pink)", color: "white" }}
                        >
                          <Plus size={16} />
                        </button>
                      </Form>
                      <Form method="post" className="inline">
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="delta" value={10} />
                        <button
                          type="submit"
                          className="gd-btn-tertiary px-2 text-[12px]"
                        >
                          +10
                        </button>
                      </Form>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
