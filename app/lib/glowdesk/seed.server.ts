/**
 * GlowDesk lazy seed — idempotent, runs at most once per process.
 *
 * Triggered from any salon-data loader so the demo experience is populated
 * without requiring engineering to wire a separate seed module.
 */
import {
  StylistModel,
  ServiceModel,
  ClientModel,
  AppointmentModel,
  ProductModel,
} from "./models.server";

let seedPromise: Promise<void> | null = null;

function todayAt(hour: number, minute = 0): Date {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d;
}

function daysFromNow(days: number, hour: number, minute = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d;
}

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

const STANDARD_HOURS = {
  monday: null,
  tuesday: { start: "09:00", end: "19:00" },
  wednesday: { start: "09:00", end: "19:00" },
  thursday: { start: "09:00", end: "19:00" },
  friday: { start: "09:00", end: "19:00" },
  saturday: { start: "09:00", end: "18:00" },
  sunday: null,
};

async function doSeed(): Promise<void> {
  const existing = await StylistModel.countDocuments().exec();
  if (existing > 0) return;

  // ── Stylists ──────────────────────────────────────────────────────────────
  const stylists = await StylistModel.insertMany([
    {
      name: "Ava Rivera",
      role: "Senior Stylist",
      avatarColor: "#D946A6",
      specialties: ["Balayage", "Color", "Cut & Style"],
      workingHours: STANDARD_HOURS,
      active: true,
      weeklyBookingsCount: 18,
    },
    {
      name: "Jules Park",
      role: "Color Specialist",
      avatarColor: "#B02A85",
      specialties: ["Color Refresh", "Balayage", "Toner"],
      workingHours: STANDARD_HOURS,
      active: true,
      weeklyBookingsCount: 14,
    },
    {
      name: "Sam Okafor",
      role: "Stylist",
      avatarColor: "#E8A23B",
      specialties: ["Cut & Style", "Blowout", "Brows"],
      workingHours: STANDARD_HOURS,
      active: true,
      weeklyBookingsCount: 11,
    },
    {
      name: "Nia Bloom",
      role: "Nail Artist",
      avatarColor: "#1F9D6B",
      specialties: ["Gel Manicure", "Nail Art"],
      workingHours: STANDARD_HOURS,
      active: true,
      weeklyBookingsCount: 9,
    },
  ]);

  // ── Services ──────────────────────────────────────────────────────────────
  await ServiceModel.insertMany([
    { name: "Cut & Style", category: "Hair", durationMinutes: 60, price: 75, active: true },
    { name: "Color Refresh", category: "Hair", durationMinutes: 120, price: 165, active: true },
    { name: "Balayage", category: "Hair", durationMinutes: 180, price: 240, active: true },
    { name: "Blowout", category: "Hair", durationMinutes: 45, price: 55, active: true },
    { name: "Gel Manicure", category: "Nails", durationMinutes: 60, price: 45, active: true },
    { name: "Brow Shape & Tint", category: "Brows", durationMinutes: 30, price: 35, active: true },
  ]);

  // ── Clients ───────────────────────────────────────────────────────────────
  const clients = await ClientModel.insertMany([
    {
      name: "Eloise Tran",
      phone: "555-0188",
      email: "eloise@example.com",
      notes: "Prefers Olaplex. Color formula in profile.",
      lastVisitAt: daysAgo(14),
      visitCount: 8,
      totalSpent: 1320,
      loyaltyPoints: 132,
      favoriteServices: ["Balayage", "Cut & Style"],
    },
    {
      name: "Marcus Lee",
      phone: "555-0142",
      email: "marcus@example.com",
      notes: "Likes a tight fade on the sides.",
      lastVisitAt: daysAgo(28),
      visitCount: 5,
      totalSpent: 410,
      loyaltyPoints: 41,
      favoriteServices: ["Cut & Style"],
    },
    {
      name: "Priya Shah",
      phone: "555-0107",
      email: "priya@example.com",
      notes: "Sensitive scalp — use gentle developer.",
      lastVisitAt: daysAgo(72),
      visitCount: 12,
      totalSpent: 1980,
      loyaltyPoints: 198,
      favoriteServices: ["Color Refresh"],
    },
    {
      name: "Sofia Martinez",
      phone: "555-0193",
      email: "sofia@example.com",
      notes: "Birthday in March — offer a treat.",
      lastVisitAt: daysAgo(5),
      visitCount: 3,
      totalSpent: 215,
      loyaltyPoints: 22,
      favoriteServices: ["Gel Manicure", "Brow Shape & Tint"],
    },
    {
      name: "Hana Kim",
      phone: "555-0125",
      email: "hana@example.com",
      notes: "Wants to grow out layers — talk before cutting.",
      lastVisitAt: daysAgo(95),
      visitCount: 6,
      totalSpent: 780,
      loyaltyPoints: 78,
      favoriteServices: ["Cut & Style", "Blowout"],
    },
  ]);

  // ── Appointments (today + upcoming) ───────────────────────────────────────
  await AppointmentModel.insertMany([
    {
      clientName: "Eloise Tran",
      clientPhone: "555-0188",
      clientEmail: "eloise@example.com",
      clientId: String(clients[0]._id),
      stylistId: String(stylists[0]._id),
      stylistName: stylists[0].name,
      serviceName: "Balayage",
      durationMinutes: 180,
      price: 240,
      startAt: todayAt(10, 0),
      endAt: todayAt(13, 0),
      status: "confirmed",
      reminderSent: true,
      source: "owner",
    },
    {
      clientName: "Marcus Lee",
      clientPhone: "555-0142",
      clientEmail: "marcus@example.com",
      clientId: String(clients[1]._id),
      stylistId: String(stylists[2]._id),
      stylistName: stylists[2].name,
      serviceName: "Cut & Style",
      durationMinutes: 60,
      price: 75,
      startAt: todayAt(11, 30),
      endAt: todayAt(12, 30),
      status: "confirmed",
      reminderSent: true,
      source: "owner",
    },
    {
      clientName: "Sofia Martinez",
      clientPhone: "555-0193",
      clientEmail: "sofia@example.com",
      clientId: String(clients[3]._id),
      stylistId: String(stylists[3]._id),
      stylistName: stylists[3].name,
      serviceName: "Gel Manicure",
      durationMinutes: 60,
      price: 45,
      startAt: todayAt(14, 0),
      endAt: todayAt(15, 0),
      status: "confirmed",
      reminderSent: false,
      source: "self_booking",
    },
    {
      clientName: "Walk-in",
      clientPhone: "",
      clientEmail: "",
      stylistId: String(stylists[2]._id),
      stylistName: stylists[2].name,
      serviceName: "Blowout",
      durationMinutes: 45,
      price: 55,
      startAt: todayAt(15, 30),
      endAt: todayAt(16, 15),
      status: "walk_in",
      reminderSent: false,
      source: "owner",
    },
    {
      clientName: "Priya Shah",
      clientPhone: "555-0107",
      clientEmail: "priya@example.com",
      clientId: String(clients[2]._id),
      stylistId: String(stylists[1]._id),
      stylistName: stylists[1].name,
      serviceName: "Color Refresh",
      durationMinutes: 120,
      price: 165,
      startAt: daysFromNow(1, 10, 0),
      endAt: daysFromNow(1, 12, 0),
      status: "confirmed",
      reminderSent: false,
      source: "self_booking",
    },
    {
      clientName: "Hana Kim",
      clientPhone: "555-0125",
      clientEmail: "hana@example.com",
      clientId: String(clients[4]._id),
      stylistId: String(stylists[0]._id),
      stylistName: stylists[0].name,
      serviceName: "Cut & Style",
      durationMinutes: 60,
      price: 75,
      startAt: daysFromNow(2, 14, 30),
      endAt: daysFromNow(2, 15, 30),
      status: "pending",
      reminderSent: false,
      source: "self_booking",
    },
    {
      clientName: "Eloise Tran",
      clientPhone: "555-0188",
      clientEmail: "eloise@example.com",
      clientId: String(clients[0]._id),
      stylistId: String(stylists[1]._id),
      stylistName: stylists[1].name,
      serviceName: "Brow Shape & Tint",
      durationMinutes: 30,
      price: 35,
      startAt: daysFromNow(3, 9, 30),
      endAt: daysFromNow(3, 10, 0),
      status: "confirmed",
      reminderSent: false,
      source: "owner",
    },
  ]);

  // ── Products ──────────────────────────────────────────────────────────────
  await ProductModel.insertMany([
    {
      name: "Olaplex No. 3",
      brand: "Olaplex",
      category: "Treatment",
      stockOnHand: 12,
      reorderThreshold: 5,
      unit: "bottle",
      costPerUnit: 18,
      usedThisMonth: 7,
    },
    {
      name: "Wella Koleston 6/0",
      brand: "Wella",
      category: "Color",
      stockOnHand: 3,
      reorderThreshold: 5,
      unit: "tube",
      costPerUnit: 12,
      usedThisMonth: 9,
    },
    {
      name: "Developer 20vol",
      brand: "Wella",
      category: "Color",
      stockOnHand: 24,
      reorderThreshold: 8,
      unit: "L",
      costPerUnit: 8,
      usedThisMonth: 3,
    },
    {
      name: "Kerastase Discipline Shampoo",
      brand: "Kerastase",
      category: "Hair Care",
      stockOnHand: 2,
      reorderThreshold: 4,
      unit: "bottle",
      costPerUnit: 28,
      usedThisMonth: 5,
    },
    {
      name: "OPI Gel Polish — Bubble Bath",
      brand: "OPI",
      category: "Nails",
      stockOnHand: 8,
      reorderThreshold: 3,
      unit: "bottle",
      costPerUnit: 15,
      usedThisMonth: 4,
    },
    {
      name: "Disposable Towels",
      brand: "House",
      category: "Supplies",
      stockOnHand: 145,
      reorderThreshold: 50,
      unit: "pc",
      costPerUnit: 0.3,
      usedThisMonth: 220,
    },
    {
      name: "Brow Tint — Soft Black",
      brand: "Refectocil",
      category: "Brows",
      stockOnHand: 1,
      reorderThreshold: 2,
      unit: "tube",
      costPerUnit: 14,
      usedThisMonth: 3,
    },
  ]);
}

export async function ensureSeed(): Promise<void> {
  if (!seedPromise) {
    seedPromise = doSeed().catch((err) => {
      console.error("[GlowDesk Seed] Failed:", err);
      seedPromise = null;
    });
  }
  return seedPromise;
}
