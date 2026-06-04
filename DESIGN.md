# GlowDesk — Design Guidelines

## Aesthetic Direction
Airy, editorial, premium-salon. Think a high-end beauty magazine that happens to be operational software — clean typography, intentional whitespace, warm accent photography, confident pink as the signature. Calm, not clinical. Polished, not corporate.

## Color System

### Primary
- **GlowDesk Pink** `#D946A6` — primary CTAs, active states, brand moments, key data accents
- **GlowDesk Pink Deep** `#B02A85` — hover/pressed states, headings on light surfaces
- **GlowDesk Pink Soft** `#FCE7F3` — soft pink backgrounds, selected chips, gentle highlights

### Neutrals (warm, never cold-gray)
- **Ink** `#1A1216` — primary text, strong headings (warm near-black, slight rose undertone)
- **Charcoal** `#3F2E37` — secondary text
- **Stone** `#7A6B73` — tertiary text, labels, captions
- **Mist** `#E8E2E5` — borders, dividers, subtle separators
- **Cream** `#FAF6F4` — primary background (warm, never #FFFFFF)
- **Pure White** `#FFFFFF` — cards and elevated surfaces only

### Functional
- **Success Green** `#1F9D6B` — confirmed bookings, in-stock, completed
- **Warning Amber** `#E8A23B` — low stock, pending reminders, attention-needed
- **Alert Red** `#D14A4A` — no-shows, out-of-stock, conflicts, cancellations
- **Info Blue** `#3B82C4` — informational, neutral status (used sparingly)

### Usage Rules
- Pink is for action and brand — never decorative
- Cream `#FAF6F4` is the canvas, not pure white
- Functional colors only on status, never as decoration
- Max 1 primary action per screen surface

## Typography

### Font Families
- **Display / Headings:** "Fraunces" (serif, editorial, warm) — falls back to Georgia
- **UI / Body:** "Inter" (geometric sans, neutral, legible) — falls back to system-ui
- **Numerals (data):** Inter tabular-nums for prices, times, counts

### Scale (mobile-first)
- Display XL: 40/44, Fraunces, weight 500 — landing hero only
- Display L: 32/36, Fraunces, weight 500 — page titles
- Display M: 24/30, Fraunces, weight 500 — section titles
- Heading: 18/24, Inter, weight 600 — card titles, list headers
- Body: 16/22, Inter, weight 400 — primary text
- Body S: 14/20, Inter, weight 400 — secondary text
- Caption: 12/16, Inter, weight 500, letter-spacing 0.02em uppercase — labels, meta
- Numeric L: 28/32, Inter, tabular-nums, weight 600 — key metrics

## Spacing & Layout

### Spacing scale (4px base)
4, 8, 12, 16, 20, 24, 32, 40, 56, 72

### Layout
- Mobile container: 16px side padding default, 20px for premium surfaces
- Card internal padding: 20px
- Vertical rhythm between sections: 32px
- Touch target minimum: 44x44px
- Max content width on desktop: 1120px, centered with generous margins

## Elevation & Surfaces

- **Flat** — borders only (`1px solid #E8E2E5`), for inline rows and dense lists
- **Card** — `background: #FFFFFF`, `border-radius: 16px`, `box-shadow: 0 1px 2px rgba(26,18,22,0.04), 0 4px 12px rgba(26,18,22,0.04)`
- **Floating** — `box-shadow: 0 8px 24px rgba(26,18,22,0.08), 0 2px 6px rgba(26,18,22,0.04)` — sheets, popovers
- **Modal scrim** — `rgba(26,18,22,0.40)`

Radii: 8 (chips, small inputs), 12 (buttons, inputs), 16 (cards), 24 (sheets, large surfaces), 999 (avatars, pills)

## Components

### Buttons
- **Primary:** pink `#D946A6` fill, white text, 12px radius, 14px vertical / 20px horizontal padding, weight 600. Hover: deep pink `#B02A85`.
- **Secondary:** transparent fill, 1px Ink border, Ink text. For non-primary actions.
- **Tertiary / Text:** pink text, no fill, no border — inline links and low-weight actions
- **Destructive:** Alert Red `#D14A4A` text on transparent, or red fill for confirm-destroy moments
- Min height 44px on mobile

### Inputs
- 12px radius, 1px `#E8E2E5` border, cream-tinted fill `#FAF6F4` or white inside cards
- Focus: 2px GlowDesk Pink ring, no border color change
- Label above field, Caption style, Stone color
- Helper text 12px Stone; error text 12px Alert Red

### Cards
- White fill, 16px radius, Card elevation
- Card header: Heading + optional Caption meta on the right
- Internal sections separated by 16px space, not dividers, unless dense list

### Status Pills
- 999 radius, 6px vertical / 12px horizontal, Caption style
- Variants: Confirmed (Green soft fill), Pending (Amber soft fill), Cancelled (Red soft fill), Walk-in (Pink soft fill)

### Calendar / Schedule View
- Vertical day timeline on mobile, horizontal stylist columns on tablet+
- Time slots in 15-min increments, visible grid every hour
- Appointment blocks: rounded 12px, colored by stylist or status, client name + service summary
- Conflict states: 2px Alert Red border + subtle red tint
- Now-line: 2px GlowDesk Pink horizontal line with small dot

### Lists
- 56px minimum row height on mobile
- Avatar/icon 40px left, primary text + caption, right-side meta (time, count, status pill)
- Tap area is the full row; chevron right indicates navigation

## Iconography
- Line icons, 1.5px stroke, rounded caps and joins
- 20px in body context, 24px in nav, 16px inline with text
- Pink fill only on active/selected state

## Imagery & Photography
- Warm, natural-light salon scenes; soft focus on hands, hair, products
- Editorial composition — generous negative space, never stock-photo busy
- Avoid: harsh studio lighting, clinical environments, model-only beauty shots
- Use sparingly: hero areas, empty states, marketing surfaces only

## Motion
- Default: 200ms, ease-out
- Sheet/modal enter: 280ms, ease-out from bottom
- Subtle, never showy. Motion confirms action, never decorates.

## Empty States
- Centered, generous whitespace
- Soft pink illustrative icon (48–64px) or warm editorial image
- Display M heading, Body S supporting line, primary action button below
- Tone: encouraging, never apologetic ("Your week is wide open — let's fill it" not "No appointments found")

## Accessibility
- Body text contrast 7:1 against backgrounds (Ink on Cream)
- Interactive elements 4.5:1 minimum
- Focus rings always visible (2px GlowDesk Pink, 2px offset)
- No color-only status — always pair with icon or label
- All touch targets ≥ 44x44px

## Anti-patterns
- No pure white backgrounds for full pages — always Cream
- No cold gray neutrals — warmth bias in every neutral
- No heavy dividers between cards — let whitespace do the work
- No more than one Display-size heading per screen
- No emojis as UI icons
- No drop shadows on text
