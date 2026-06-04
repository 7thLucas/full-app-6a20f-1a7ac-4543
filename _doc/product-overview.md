# GlowDesk — Product Overview

## Product Name

**GlowDesk**

---

## Build Status — v1 Shipped

The initial GlowDesk build is live. The product is a working, end-to-end salon operations app — not a prototype — covering the full MVP scope plus the first wave of post-MVP capabilities.

**Live now:**

- **Operator dashboard** at `/` — revenue booked, reminders due, walk-ins, lapsed clients, restock alerts, next-up at a glance
- **Smart appointment booking**
  - `/schedule` — day-timeline view of all stylists and appointments
  - `/schedule/new` — owner booking flow with conflict prevention
  - `/book` — public client self-booking flow (shareable link)
  - `/book/confirmed` — thank-you confirmation + automated email confirmation
- **Stylist management** at `/stylists` — team list, specialties, weekly bookings/revenue, working hours
- **Inventory** at `/inventory` — products with low/out-of-stock badges, category filters, +/- stock controls
- **Clients** at `/clients` and `/clients/:id` — search, filters (All / Lapsed / Loyal / Recent), retention follow-up action, full visit history
- **Auth** — login, register, logout, forgot-password
- **Email confirmations** powered by EmailService
- **Brand system applied** — GlowDesk Pink (`#D946A6`), Fraunces serif headings, Inter UI, warm cream canvas, mobile-first layouts throughout

**Post-MVP roadmap pre-staged on the Goal DAG:** Stylist management, Inventory tracking, and the Client retention loop are now scaffolded as container goals on the roadmap, ready for the next iteration cycle.

---

## Elevator Pitch

GlowDesk is the smart salon management app for small-to-medium beauty salon owners. It replaces WhatsApp threads, paper appointment books, and scattered spreadsheets with a single, mobile-friendly platform: real-time stylist scheduling, client self-booking with automated reminders, product inventory tracking, and built-in client retention tools. GlowDesk turns every chair into a revenue opportunity and every visit into a reason to come back.

---

## Problem Statement

Beauty salon owners running 1–10 stylist operations lose meaningful revenue every week to entirely preventable operational failures:

- **Double-bookings and scheduling gaps** caused by manual coordination across WhatsApp and paper. A single miscommunication blocks a stylist for an hour and turns a client away permanently.
- **No-shows with no safety net.** Without automated reminders, a booked slot disappears without warning. No deposit, no nudge, no recovery.
- **Inventory running dry mid-appointment.** Products are tracked on paper or in memory. Stylists discover a product is out of stock when a client is already in the chair.
- **Client retention left to chance.** There is no system to follow up after a visit, reward loyal clients, or surface who hasn't returned in 60 days. Repeat business is earned through memory and luck.
- **Stylist scheduling is a daily puzzle.** Owners often work as stylists themselves and have no clean view of who is available, for what, and for how long.

The cumulative effect: lost bookings, wasted product spend, stylist downtime, and a client base that drifts to competitors offering a smoother experience — all while the owner is buried in admin tasks that add no value.

---

## Target Users

**Primary persona: The Hands-On Salon Owner / Manager**

- Owns or manages a beauty salon with 1–10 stylists
- Often works as a stylist themselves — phone and tablet are the primary work surfaces
- Operations currently run on WhatsApp groups, paper appointment books, or basic spreadsheets
- Motivated by revenue growth and client loyalty, not technology for its own sake
- Needs tools that work between clients: fast to open, obvious to use, actionable at a glance
- Typically not technical; has no patience for complex onboarding or dense dashboards

**Secondary persona: The Stylist**

- Executes appointments and handles day-to-day client interactions
- Needs clear visibility into their own schedule and assigned services
- Benefits from client history notes and product availability information

---

## MVP Scope

The MVP is centered on the single highest-leverage problem: **missed and mismanaged bookings**.

### MVP: Smart Appointment Booking

- **Real-time stylist availability calendar** — visual, conflict-free scheduling across all stylists; no double-bookings
- **Client self-booking** — clients book their own appointments via a shareable link, choosing stylist, service, and time slot
- **Automated reminders** — SMS/push reminders sent to clients before appointments to reduce no-shows
- **Appointment management** — owner can view, create, reschedule, and cancel appointments from mobile

### Post-MVP: Broader Platform Scope

These areas are confirmed in scope for GlowDesk beyond MVP, in priority order:

1. **Stylist management** — schedule management, specialties, performance tracking
2. **Product inventory tracking** — real-time stock levels, low-stock alerts, usage tracking per service
3. **Client retention** — post-visit follow-up messages, loyalty rewards, visit history, re-engagement nudges for lapsed clients

---

## Strategic Principles

- **Mobile-first, always.** The primary user is between clients, on their feet, on a phone. Every interaction must be fast and touch-native.
- **Replace chaos, not habits.** GlowDesk replaces paper and WhatsApp — it does not ask owners to adopt a new philosophy. The language, flows, and outputs mirror how salons already think.
- **Revenue over features.** Every feature is justified by its direct impact on bookings, retention, or cost savings. Complexity that does not serve that goal stays out.
- **Calm, not clinical.** The product aesthetic reflects the salon world: warm, polished, premium — not a sterile enterprise tool.

---

## Branding

- **Name:** GlowDesk
- **Primary color:** Rose / fuchsia (`#D946A6` — GlowDesk pink)
- **Tone:** Confident, warm, practical. Direct without being cold. Premium without being inaccessible.
- **Visual style:** Airy and editorial. Clean typography, intentional whitespace, warm accent photography.

---

## Key Success Metrics

| Metric | Description | Target |
|---|---|---|
| Booking fill rate | % of available stylist slots that are booked | +25% within 60 days |
| No-show rate | % of bookings where client does not arrive | Reduction to <10% |
| Time saved on admin | Hours per week recovered from manual scheduling / inventory / follow-up | 6+ hours/week per owner |
| Client return rate | % of clients who book a second appointment within 90 days | +20 percentage points vs. baseline |
| Monthly active salons | Active salon accounts using GlowDesk at least once per week | Growth KPI for product viability |
| Inventory stockout incidents | Times a product is unavailable during an appointment | Target: zero tracked incidents |

---

## Out of Scope (MVP)

- Multi-location enterprise chains (11+ stylists or franchises)
- Point-of-sale / payment processing
- Payroll and HR management
- Social media integration or marketing campaign tools
- B2C marketplace (GlowDesk is a B2B tool for salon operators, not a consumer booking app)
