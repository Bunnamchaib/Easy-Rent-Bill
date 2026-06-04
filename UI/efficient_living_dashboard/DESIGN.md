---
name: Efficient Living Dashboard
colors:
  surface: '#faf8ff'
  surface-dim: '#d9d9e5'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3fe'
  surface-container: '#ededf9'
  surface-container-high: '#e7e7f3'
  surface-container-highest: '#e1e2ed'
  on-surface: '#191b23'
  on-surface-variant: '#434655'
  inverse-surface: '#2e3039'
  inverse-on-surface: '#f0f0fb'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#006e2d'
  on-secondary: '#ffffff'
  secondary-container: '#7cf994'
  on-secondary-container: '#007230'
  tertiary: '#784b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#996100'
  on-tertiary-container: '#ffeedd'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#7ffc97'
  secondary-fixed-dim: '#62df7d'
  on-secondary-fixed: '#002109'
  on-secondary-fixed-variant: '#005320'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#faf8ff'
  on-background: '#191b23'
  surface-variant: '#e1e2ed'
typography:
  display:
    fontFamily: Be Vietnam Pro
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Be Vietnam Pro
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-margin: 16px
  gutter: 16px
---

## Brand & Style

The brand personality is helpful, organized, and transparent, specifically tailored for dormitory owners and residents. The goal is to reduce the friction of monthly billing through a UI that feels reliable yet approachable. 

The design follows a **Modern Corporate** style with a focus on high legibility and soft structural elements. It prioritizes clarity over decoration, using ample white space and a "soft-contained" layout to group information logically. The interface should evoke a sense of calm and order, ensuring that financial data is easily digestible for non-technical users.

## Colors

The palette uses a classic functional logic. **Primary Blue** is used for core actions and navigation. **Success Green** highlights paid status and positive balances, while **Warning Orange** and **Danger Red** are reserved for overdue payments and urgent system alerts.

The background strategy utilizes a "Layered White" approach: the main canvas is pure white (#FFFFFF), while secondary sections, sidebars, and inactive utility areas use the **Neutral Background** (#F9FAFB) to provide subtle depth without heavy borders.

## Typography

The typography system utilizes **Be Vietnam Pro** for its excellent Thai character legibility and modern, open counters. The scale is slightly larger than standard SaaS applications to ensure accessibility for a wide range of age groups and to facilitate ease of use on mobile devices.

- **Headlines:** Bold and clear to anchor the page hierarchy.
- **Body Text:** Uses a generous 1.5x line height to improve readability of billing details.
- **Numeric Data:** Use medium or semi-bold weights for currency and room numbers to ensure they stand out in tabular layouts.

## Layout & Spacing

The design system employs a **Fluid Grid** model optimized for mobile-first interactions. 

- **Mobile:** A single-column layout with 16px side margins. Large vertical spacing (24px) between cards to prevent accidental taps.
- **Desktop/Tablet:** A 12-column grid with a maximum content width of 1280px. Sidebars are fixed at 280px, with the main content area expanding fluidly.
- **Touch Targets:** All interactive elements (buttons, inputs, list items) must maintain a minimum height of 48px to accommodate comfortable mobile usage.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** and soft shadows. 

1.  **Level 0 (Base):** The #F9FAFB background used for the page environment.
2.  **Level 1 (Cards):** Pure white surfaces with a very soft, diffused shadow (0px 4px 12px rgba(0,0,0,0.05)) and a 1px border (#E5E7EB).
3.  **Level 2 (Modals/Popovers):** Higher elevation shadows (0px 12px 24px rgba(0,0,0,0.1)) to indicate focus and temporary interaction.

Avoid heavy black shadows; use the primary blue or a cool gray tinted shadow to maintain the "clean" aesthetic.

## Shapes

The shape language is friendly and modern. A consistent **0.5rem (8px)** radius is used for small elements like checkboxes and tags, while **1rem (16px)** is the standard for cards and main containers. This generous rounding creates a approachable feel that softens the "coldness" of financial management. 

Buttons should utilize the `rounded-lg` (16px) or full pill-shape for high-emphasis actions to distinguish them from data containers.

## Components

### Buttons
Primary buttons use the Blue #2563EB with white text. Secondary buttons use a light gray background with primary colored text. All buttons must have a height of 48px on mobile.

### Cards
Billing cards should feature a header with the room number in `headline-md` and the payment status as a prominent colored chip in the top right.

### Chips/Status Indicators
Used for "Paid," "Pending," and "Overdue." These should have a low-opacity background of the status color (e.g., Green at 10% opacity) with high-contrast text of the same hue.

### Input Fields
Inputs require a 1px #E5E7EB border that shifts to #2563EB on focus. Labels must always be visible above the field in `label-md` to maintain context for users.

### Lists & Tables
On mobile, tables should reflow into "List Cards." On desktop, tables use subtle horizontal dividers without vertical lines. Every row should have a minimum height of 56px to ensure readability.

### Quick Actions
A Floating Action Button (FAB) or a fixed bottom bar is recommended for mobile views to allow "Quick Bill Creation" or "Receipt Upload."