/* START: THIS SECTION CODE IS CANNOT BE CHANGED, YOU ONLY READ IT */
export interface FieldSchemaType {
  fieldName?: string;
  type:
    | "string"
    | "number"
    | "boolean"
    | "object"
    | "array"
    | "color"
    | "url"
    | "enum"
    | "datetime"
    | "file"
    | "files";
  required?: boolean;
  label?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  options?: string[];
  fields?: FieldSchemaType[];
  item?: FieldSchemaType;
}
/* END: THIS SECTION CODE IS CANNOT BE CHANGED, YOU ONLY READ IT */

export type ConfigurableSchemas = {
  formSchema: FieldSchemaType[];
};

export const configurableSchemas: ConfigurableSchemas = {
  formSchema: [
    {
      fieldName: "appName",
      type: "string",
      required: true,
      label: "Salon Name",
      maxLength: 60,
    },
    {
      fieldName: "tagline",
      type: "string",
      required: false,
      label: "Tagline",
      maxLength: 120,
    },
    {
      fieldName: "logoUrl",
      type: "url",
      required: true,
      label: "Logo URL",
    },
    {
      fieldName: "heroImage",
      type: "file",
      required: false,
      label: "Booking Hero Image",
    },
    {
      fieldName: "brandColor",
      type: "object",
      required: true,
      label: "Brand Color",
      fields: [
        {
          fieldName: "primary",
          type: "color",
          required: true,
          label: "Primary (Pink)",
        },
        {
          fieldName: "secondary",
          type: "color",
          required: true,
          label: "Secondary (Deep Pink)",
        },
        {
          fieldName: "accent",
          type: "color",
          required: true,
          label: "Accent (Soft Pink)",
        },
      ],
    },
    {
      fieldName: "salonInfo",
      type: "object",
      required: true,
      label: "Salon Information",
      fields: [
        {
          fieldName: "address",
          type: "string",
          required: false,
          label: "Address",
        },
        {
          fieldName: "phone",
          type: "string",
          required: false,
          label: "Phone",
        },
        {
          fieldName: "email",
          type: "string",
          required: false,
          label: "Email",
        },
        {
          fieldName: "openingHours",
          type: "string",
          required: false,
          label: "Opening Hours",
        },
      ],
    },
    {
      fieldName: "ownerName",
      type: "string",
      required: false,
      label: "Owner Name",
    },
    {
      fieldName: "welcomeMessage",
      type: "string",
      required: false,
      label: "Today Greeting",
      maxLength: 200,
    },
    {
      fieldName: "bookingThankYouMessage",
      type: "string",
      required: false,
      label: "Booking Confirmation Message",
      maxLength: 300,
    },
    {
      fieldName: "reminderHoursBefore",
      type: "number",
      required: false,
      label: "Reminder Hours Before Appointment",
      min: 1,
      max: 72,
    },
    {
      fieldName: "lapsedClientDays",
      type: "number",
      required: false,
      label: "Lapsed Client Threshold (days)",
      min: 14,
      max: 180,
    },
    {
      fieldName: "lowStockThreshold",
      type: "number",
      required: false,
      label: "Low Stock Threshold",
      min: 1,
      max: 50,
    },
    {
      fieldName: "showRetentionInsights",
      type: "boolean",
      required: false,
      label: "Show Retention Insights",
    },
    {
      fieldName: "showInventoryAlerts",
      type: "boolean",
      required: false,
      label: "Show Inventory Alerts",
    },
    {
      fieldName: "currencySymbol",
      type: "string",
      required: false,
      label: "Currency Symbol",
      maxLength: 4,
    },
    {
      fieldName: "services",
      type: "array",
      required: false,
      label: "Service Menu",
      item: {
        type: "object",
        required: true,
        fields: [
          { fieldName: "name", type: "string", required: true, label: "Service Name" },
          { fieldName: "durationMinutes", type: "number", required: true, label: "Duration (min)" },
          { fieldName: "price", type: "number", required: true, label: "Price" },
          { fieldName: "category", type: "string", required: false, label: "Category" },
        ],
      },
    },
    {
      fieldName: "nav",
      type: "object",
      required: false,
      label: "Navigation Labels",
      fields: [
        { fieldName: "today", type: "string", required: false, label: "Today Label" },
        { fieldName: "schedule", type: "string", required: false, label: "Schedule Label" },
        { fieldName: "clients", type: "string", required: false, label: "Clients Label" },
        { fieldName: "stylists", type: "string", required: false, label: "Stylists Label" },
        { fieldName: "inventory", type: "string", required: false, label: "Inventory Label" },
      ],
    },
  ],
};
