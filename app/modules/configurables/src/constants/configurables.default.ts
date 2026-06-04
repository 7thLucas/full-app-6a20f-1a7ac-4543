/*
 * Default Configurable Data — seeded into Mongo on first boot.
 *
 * BEFORE EDITING: read ./RULES.md (especially R5: schema and defaults must
 * stay in sync) and ./configurables.schema.ts. For per-type schema and
 * default-value samples, see RULES.md §5 "Field Type Reference".
 */

export type TBrandColor = {
  primary: string;
  secondary: string;
  accent: string;
};

export type TSalonInfo = {
  address: string;
  phone: string;
  email: string;
  openingHours: string;
};

export type TServiceItem = {
  name: string;
  durationMinutes: number;
  price: number;
  category: string;
};

export type TNavLabels = {
  today: string;
  schedule: string;
  clients: string;
  stylists: string;
  inventory: string;
};

export type TDefaultConfigurableData = {
  appName: string;
  tagline: string;
  logoUrl: string;
  heroImage: string;
  brandColor: TBrandColor;
  salonInfo: TSalonInfo;
  ownerName: string;
  welcomeMessage: string;
  bookingThankYouMessage: string;
  reminderHoursBefore: number;
  lapsedClientDays: number;
  lowStockThreshold: number;
  showRetentionInsights: boolean;
  showInventoryAlerts: boolean;
  currencySymbol: string;
  services: TServiceItem[];
  nav: TNavLabels;
};

export const defaultConfigurablesData: TDefaultConfigurableData = {
  appName: "GlowDesk",
  tagline: "Every chair, every client, every glow.",
  logoUrl: "FILL_LOGO_URL_HERE",
  heroImage: "",
  brandColor: {
    primary: "#D946A6",
    secondary: "#B02A85",
    accent: "#FCE7F3",
  },
  salonInfo: {
    address: "123 Rose Avenue, Suite 4",
    phone: "(555) 123-4567",
    email: "hello@glowdesk.salon",
    openingHours: "Tue – Sat, 9am – 7pm",
  },
  ownerName: "Mia",
  welcomeMessage: "Good morning. Your chair is ready.",
  bookingThankYouMessage:
    "You're booked. We'll send a reminder before your visit — can't wait to see you.",
  reminderHoursBefore: 24,
  lapsedClientDays: 60,
  lowStockThreshold: 5,
  showRetentionInsights: true,
  showInventoryAlerts: true,
  currencySymbol: "$",
  services: [
    { name: "Cut & Style", durationMinutes: 60, price: 75, category: "Hair" },
    { name: "Color Refresh", durationMinutes: 120, price: 165, category: "Hair" },
    { name: "Balayage", durationMinutes: 180, price: 240, category: "Hair" },
    { name: "Blowout", durationMinutes: 45, price: 55, category: "Hair" },
    { name: "Gel Manicure", durationMinutes: 60, price: 45, category: "Nails" },
    { name: "Brow Shape & Tint", durationMinutes: 30, price: 35, category: "Brows" },
  ],
  nav: {
    today: "Today",
    schedule: "Schedule",
    clients: "Clients",
    stylists: "Stylists",
    inventory: "Inventory",
  },
};
