/**
 * Salon data service — wraps Typegoose models and returns plain DTOs safe to
 * cross the SSR boundary.
 */
import {
  StylistModel,
  ServiceModel,
  ClientModel,
  AppointmentModel,
  ProductModel,
  type AppointmentStatus,
} from "./models.server";
import { ensureSeed } from "./seed.server";
import type {
  StylistDto,
  ServiceDto,
  ClientDto,
  AppointmentDto,
  ProductDto,
} from "./types";

function toStylist(doc: any): StylistDto {
  return {
    id: String(doc._id),
    name: doc.name ?? "",
    role: doc.role ?? "",
    avatarColor: doc.avatarColor ?? "#D946A6",
    specialties: Array.isArray(doc.specialties) ? doc.specialties : [],
    workingHours: doc.workingHours ?? {},
    active: !!doc.active,
    weeklyBookingsCount: doc.weeklyBookingsCount ?? 0,
  };
}

function toService(doc: any): ServiceDto {
  return {
    id: String(doc._id),
    name: doc.name ?? "",
    category: doc.category ?? "Hair",
    durationMinutes: doc.durationMinutes ?? 60,
    price: doc.price ?? 0,
    active: !!doc.active,
  };
}

function toClient(doc: any, lapsedThresholdDays: number): ClientDto {
  const last = doc.lastVisitAt ? new Date(doc.lastVisitAt) : null;
  const daysSince =
    last !== null
      ? Math.floor((Date.now() - last.getTime()) / (1000 * 60 * 60 * 24))
      : null;
  const isLapsed = daysSince !== null && daysSince >= lapsedThresholdDays;
  return {
    id: String(doc._id),
    name: doc.name ?? "",
    phone: doc.phone ?? "",
    email: doc.email ?? "",
    notes: doc.notes ?? "",
    lastVisitAt: last ? last.toISOString() : null,
    visitCount: doc.visitCount ?? 0,
    totalSpent: doc.totalSpent ?? 0,
    loyaltyPoints: doc.loyaltyPoints ?? 0,
    favoriteServices: Array.isArray(doc.favoriteServices)
      ? doc.favoriteServices
      : [],
    isLapsed,
    daysSinceLastVisit: daysSince,
  };
}

function toAppointment(doc: any): AppointmentDto {
  return {
    id: String(doc._id),
    clientName: doc.clientName ?? "",
    clientPhone: doc.clientPhone ?? "",
    clientEmail: doc.clientEmail ?? "",
    clientId: doc.clientId ?? undefined,
    stylistId: doc.stylistId ?? "",
    stylistName: doc.stylistName ?? "",
    serviceName: doc.serviceName ?? "",
    durationMinutes: doc.durationMinutes ?? 60,
    price: doc.price ?? 0,
    startAt: new Date(doc.startAt).toISOString(),
    endAt: new Date(doc.endAt).toISOString(),
    status: (doc.status as AppointmentStatus) ?? "confirmed",
    notes: doc.notes ?? "",
    reminderSent: !!doc.reminderSent,
    source: doc.source ?? "owner",
  };
}

function toProduct(doc: any, lowStockThreshold: number): ProductDto {
  const stock = doc.stockOnHand ?? 0;
  const reorder = doc.reorderThreshold ?? lowStockThreshold;
  return {
    id: String(doc._id),
    name: doc.name ?? "",
    brand: doc.brand ?? "",
    category: doc.category ?? "Hair",
    stockOnHand: stock,
    reorderThreshold: reorder,
    unit: doc.unit ?? "unit",
    costPerUnit: doc.costPerUnit ?? 0,
    usedThisMonth: doc.usedThisMonth ?? 0,
    isOutOfStock: stock <= 0,
    isLowStock: stock > 0 && stock <= reorder,
  };
}

// ─── Public API ─────────────────────────────────────────────────────────────

export async function listStylists(): Promise<StylistDto[]> {
  await ensureSeed();
  const docs = await StylistModel.find({ active: true }).sort({ name: 1 }).lean().exec();
  return docs.map(toStylist);
}

export async function getStylist(id: string): Promise<StylistDto | null> {
  await ensureSeed();
  const doc = await StylistModel.findById(id).lean().exec();
  return doc ? toStylist(doc) : null;
}

export async function listServices(): Promise<ServiceDto[]> {
  await ensureSeed();
  const docs = await ServiceModel.find({ active: true }).sort({ category: 1, name: 1 }).lean().exec();
  return docs.map(toService);
}

export async function listClients(opts?: {
  lapsedThresholdDays?: number;
}): Promise<ClientDto[]> {
  await ensureSeed();
  const docs = await ClientModel.find({}).sort({ name: 1 }).lean().exec();
  return docs.map((d) => toClient(d, opts?.lapsedThresholdDays ?? 60));
}

export async function getClient(
  id: string,
  opts?: { lapsedThresholdDays?: number },
): Promise<ClientDto | null> {
  await ensureSeed();
  const doc = await ClientModel.findById(id).lean().exec();
  return doc ? toClient(doc, opts?.lapsedThresholdDays ?? 60) : null;
}

export async function listAppointments(opts?: {
  from?: Date;
  to?: Date;
  stylistId?: string;
  status?: AppointmentStatus;
}): Promise<AppointmentDto[]> {
  await ensureSeed();
  const filter: Record<string, unknown> = {};
  if (opts?.from || opts?.to) {
    const range: Record<string, Date> = {};
    if (opts?.from) range.$gte = opts.from;
    if (opts?.to) range.$lt = opts.to;
    filter.startAt = range;
  }
  if (opts?.stylistId) filter.stylistId = opts.stylistId;
  if (opts?.status) filter.status = opts.status;
  const docs = await AppointmentModel.find(filter).sort({ startAt: 1 }).lean().exec();
  return docs.map(toAppointment);
}

export async function listProducts(
  lowStockThreshold = 5,
): Promise<ProductDto[]> {
  await ensureSeed();
  const docs = await ProductModel.find({}).sort({ category: 1, name: 1 }).lean().exec();
  return docs.map((d) => toProduct(d, lowStockThreshold));
}

// ─── Mutations ──────────────────────────────────────────────────────────────

export interface CreateAppointmentInput {
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  stylistId: string;
  serviceName: string;
  durationMinutes: number;
  price: number;
  startAt: Date;
  notes?: string;
  source?: "owner" | "self_booking";
}

export async function createAppointment(
  input: CreateAppointmentInput,
): Promise<{ ok: true; appointment: AppointmentDto } | { ok: false; error: string }> {
  await ensureSeed();

  const stylist = await StylistModel.findById(input.stylistId).lean().exec();
  if (!stylist) return { ok: false, error: "Stylist not found." };

  const endAt = new Date(input.startAt.getTime() + input.durationMinutes * 60_000);

  // Conflict detection — overlapping appointments for same stylist
  const conflict = await AppointmentModel.findOne({
    stylistId: input.stylistId,
    status: { $nin: ["cancelled", "no_show"] },
    startAt: { $lt: endAt },
    endAt: { $gt: input.startAt },
  })
    .lean()
    .exec();

  if (conflict) {
    return {
      ok: false,
      error: `${stylist.name} is already booked at that time. Pick another slot.`,
    };
  }

  const doc = await AppointmentModel.create({
    clientName: input.clientName,
    clientPhone: input.clientPhone ?? "",
    clientEmail: input.clientEmail ?? "",
    stylistId: input.stylistId,
    stylistName: stylist.name,
    serviceName: input.serviceName,
    durationMinutes: input.durationMinutes,
    price: input.price,
    startAt: input.startAt,
    endAt,
    status: input.source === "self_booking" ? "pending" : "confirmed",
    notes: input.notes ?? "",
    reminderSent: false,
    source: input.source ?? "owner",
  });

  return { ok: true, appointment: toAppointment(doc.toObject()) };
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus,
): Promise<AppointmentDto | null> {
  await ensureSeed();
  const doc = await AppointmentModel.findByIdAndUpdate(
    id,
    { $set: { status } },
    { new: true },
  )
    .lean()
    .exec();
  return doc ? toAppointment(doc) : null;
}

export async function adjustProductStock(
  id: string,
  delta: number,
): Promise<ProductDto | null> {
  await ensureSeed();
  const doc = await ProductModel.findById(id).exec();
  if (!doc) return null;
  doc.stockOnHand = Math.max(0, (doc.stockOnHand ?? 0) + delta);
  await doc.save();
  return toProduct(doc.toObject(), 5);
}

export async function markReminderSent(id: string): Promise<void> {
  await AppointmentModel.findByIdAndUpdate(id, { $set: { reminderSent: true } }).exec();
}

// ─── Aggregated insights ────────────────────────────────────────────────────

export async function getTodaySummary() {
  await ensureSeed();
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const all = await AppointmentModel.find({
    startAt: { $gte: start, $lt: end },
  })
    .lean()
    .exec();

  const todays = all.map(toAppointment);
  const revenue = todays
    .filter((a) => a.status !== "cancelled" && a.status !== "no_show")
    .reduce((sum, a) => sum + a.price, 0);
  const confirmed = todays.filter((a) => a.status === "confirmed").length;
  const pending = todays.filter((a) => a.status === "pending").length;
  const walkIns = todays.filter((a) => a.status === "walk_in").length;
  const remindersDue = todays.filter(
    (a) => !a.reminderSent && a.status === "confirmed",
  ).length;

  return {
    appointments: todays,
    totalCount: todays.length,
    revenue,
    confirmed,
    pending,
    walkIns,
    remindersDue,
  };
}

export async function getRetentionInsights(lapsedThresholdDays = 60) {
  await ensureSeed();
  const clients = await listClients({ lapsedThresholdDays });
  const lapsed = clients.filter((c) => c.isLapsed);
  const recent = clients
    .filter((c) => c.lastVisitAt)
    .sort((a, b) => {
      const ad = a.lastVisitAt ? new Date(a.lastVisitAt).getTime() : 0;
      const bd = b.lastVisitAt ? new Date(b.lastVisitAt).getTime() : 0;
      return bd - ad;
    })
    .slice(0, 5);
  const loyal = [...clients]
    .sort((a, b) => b.visitCount - a.visitCount)
    .slice(0, 5);

  return {
    totalClients: clients.length,
    lapsedCount: lapsed.length,
    lapsed,
    recent,
    loyal,
  };
}
