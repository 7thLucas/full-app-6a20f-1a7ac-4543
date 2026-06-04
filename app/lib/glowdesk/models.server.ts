/**
 * GlowDesk server-side Typegoose models for salon data.
 *
 * Entities: Stylist, Service, Client, Appointment, Product.
 *
 * IMPORTANT: This file is .server.ts so Vite/Remix excludes it from the
 * client bundle. Mongoose connection is established by db.server.ts and
 * picked up here automatically.
 */
import {
  prop,
  getModelForClass,
  modelOptions,
  Severity,
} from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

// ─── Stylist ────────────────────────────────────────────────────────────────
@modelOptions({
  schemaOptions: {
    collection: "tbl_stylists",
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
  options: { allowMixed: Severity.ALLOW },
})
export class StylistEntity extends CommonTypegooseEntity {
  @prop({ type: String, required: true })
  name!: string;

  @prop({ type: String, default: "" })
  role!: string;

  @prop({ type: String, default: "" })
  avatarColor!: string;

  @prop({ type: [String], default: [] })
  specialties!: string[];

  @prop({ type: Object, default: {} })
  workingHours!: Record<string, { start: string; end: string } | null>;

  @prop({ type: Boolean, default: true })
  active!: boolean;

  @prop({ type: Number, default: 0 })
  weeklyBookingsCount!: number;
}

export const StylistModel = getModelForClass(StylistEntity);

// ─── Service ────────────────────────────────────────────────────────────────
@modelOptions({
  schemaOptions: {
    collection: "tbl_services",
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
  options: { allowMixed: Severity.ALLOW },
})
export class ServiceEntity extends CommonTypegooseEntity {
  @prop({ type: String, required: true })
  name!: string;

  @prop({ type: String, default: "Hair" })
  category!: string;

  @prop({ type: Number, default: 60 })
  durationMinutes!: number;

  @prop({ type: Number, default: 0 })
  price!: number;

  @prop({ type: Boolean, default: true })
  active!: boolean;
}

export const ServiceModel = getModelForClass(ServiceEntity);

// ─── Client ─────────────────────────────────────────────────────────────────
@modelOptions({
  schemaOptions: {
    collection: "tbl_clients",
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
  options: { allowMixed: Severity.ALLOW },
})
export class ClientEntity extends CommonTypegooseEntity {
  @prop({ type: String, required: true })
  name!: string;

  @prop({ type: String, default: "" })
  phone!: string;

  @prop({ type: String, default: "" })
  email!: string;

  @prop({ type: String, default: "" })
  notes!: string;

  @prop({ type: Date })
  lastVisitAt?: Date;

  @prop({ type: Number, default: 0 })
  visitCount!: number;

  @prop({ type: Number, default: 0 })
  totalSpent!: number;

  @prop({ type: Number, default: 0 })
  loyaltyPoints!: number;

  @prop({ type: [String], default: [] })
  favoriteServices!: string[];
}

export const ClientModel = getModelForClass(ClientEntity);

// ─── Appointment ────────────────────────────────────────────────────────────
export type AppointmentStatus =
  | "confirmed"
  | "pending"
  | "completed"
  | "cancelled"
  | "no_show"
  | "walk_in";

@modelOptions({
  schemaOptions: {
    collection: "tbl_appointments",
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
  options: { allowMixed: Severity.ALLOW },
})
export class AppointmentEntity extends CommonTypegooseEntity {
  @prop({ type: String, required: true })
  clientName!: string;

  @prop({ type: String, default: "" })
  clientPhone!: string;

  @prop({ type: String, default: "" })
  clientEmail!: string;

  @prop({ type: String })
  clientId?: string;

  @prop({ type: String, required: true })
  stylistId!: string;

  @prop({ type: String, required: true })
  stylistName!: string;

  @prop({ type: String, required: true })
  serviceName!: string;

  @prop({ type: Number, default: 60 })
  durationMinutes!: number;

  @prop({ type: Number, default: 0 })
  price!: number;

  @prop({ type: Date, required: true })
  startAt!: Date;

  @prop({ type: Date, required: true })
  endAt!: Date;

  @prop({ type: String, default: "confirmed" })
  status!: AppointmentStatus;

  @prop({ type: String, default: "" })
  notes!: string;

  @prop({ type: Boolean, default: false })
  reminderSent!: boolean;

  @prop({ type: String, default: "owner" })
  source!: "owner" | "self_booking";
}

export const AppointmentModel = getModelForClass(AppointmentEntity);

// ─── Product ────────────────────────────────────────────────────────────────
@modelOptions({
  schemaOptions: {
    collection: "tbl_products",
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
  options: { allowMixed: Severity.ALLOW },
})
export class ProductEntity extends CommonTypegooseEntity {
  @prop({ type: String, required: true })
  name!: string;

  @prop({ type: String, default: "" })
  brand!: string;

  @prop({ type: String, default: "Hair" })
  category!: string;

  @prop({ type: Number, default: 0 })
  stockOnHand!: number;

  @prop({ type: Number, default: 5 })
  reorderThreshold!: number;

  @prop({ type: String, default: "unit" })
  unit!: string;

  @prop({ type: Number, default: 0 })
  costPerUnit!: number;

  @prop({ type: Number, default: 0 })
  usedThisMonth!: number;
}

export const ProductModel = getModelForClass(ProductEntity);
