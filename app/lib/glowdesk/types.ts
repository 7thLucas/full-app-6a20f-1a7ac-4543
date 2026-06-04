/**
 * Client-safe DTO types. Mirror the Mongoose entities but use only primitives
 * so they can pass through Remix loaders into React components.
 */

export type AppointmentStatus =
  | "confirmed"
  | "pending"
  | "completed"
  | "cancelled"
  | "no_show"
  | "walk_in";

export interface StylistDto {
  id: string;
  name: string;
  role: string;
  avatarColor: string;
  specialties: string[];
  workingHours: Record<string, { start: string; end: string } | null>;
  active: boolean;
  weeklyBookingsCount: number;
}

export interface ServiceDto {
  id: string;
  name: string;
  category: string;
  durationMinutes: number;
  price: number;
  active: boolean;
}

export interface ClientDto {
  id: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
  lastVisitAt: string | null;
  visitCount: number;
  totalSpent: number;
  loyaltyPoints: number;
  favoriteServices: string[];
  isLapsed?: boolean;
  daysSinceLastVisit?: number | null;
}

export interface AppointmentDto {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  clientId?: string;
  stylistId: string;
  stylistName: string;
  serviceName: string;
  durationMinutes: number;
  price: number;
  startAt: string;
  endAt: string;
  status: AppointmentStatus;
  notes: string;
  reminderSent: boolean;
  source: "owner" | "self_booking";
}

export interface ProductDto {
  id: string;
  name: string;
  brand: string;
  category: string;
  stockOnHand: number;
  reorderThreshold: number;
  unit: string;
  costPerUnit: number;
  usedThisMonth: number;
  isLowStock?: boolean;
  isOutOfStock?: boolean;
}
