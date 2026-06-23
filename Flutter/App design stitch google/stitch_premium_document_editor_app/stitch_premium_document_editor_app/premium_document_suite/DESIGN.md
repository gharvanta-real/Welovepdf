---
name: Premium Document Suite
colors:
  surface: '#f4faff'
  surface-dim: '#c0dfee'
  surface-bright: '#f4faff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#e6f6ff'
  surface-container: '#d9f2ff'
  surface-container-high: '#ceedfd'
  surface-container-highest: '#c9e7f7'
  on-surface: '#001f2a'
  on-surface-variant: '#414849'
  inverse-surface: '#163440'
  inverse-on-surface: '#e0f4ff'
  outline: '#72787a'
  outline-variant: '#c1c8c9'
  surface-tint: '#466369'
  primary: '#001519'
  on-primary: '#ffffff'
  primary-container: '#0b2b30'
  on-primary-container: '#759399'
  inverse-primary: '#adccd2'
  secondary: '#4d6265'
  on-secondary: '#ffffff'
  secondary-container: '#d0e7ea'
  on-secondary-container: '#53686b'
  tertiary: '#300001'
  on-tertiary: '#ffffff'
  tertiary-container: '#570004'
  on-tertiary-container: '#ff4e46'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c8e8ee'
  primary-fixed-dim: '#adccd2'
  on-primary-fixed: '#001f24'
  on-primary-fixed-variant: '#2e4b51'
  secondary-fixed: '#d0e7ea'
  secondary-fixed-dim: '#b4cbce'
  on-secondary-fixed: '#091f21'
  on-secondary-fixed-variant: '#364a4d'
  tertiary-fixed: '#ffdad6'
  tertiary-fixed-dim: '#ffb4ac'
  on-tertiary-fixed: '#410002'
  on-tertiary-fixed-variant: '#93000d'
  background: '#f4faff'
  on-background: '#001f2a'
  surface-variant: '#c9e7f7'
typography:
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-padding: 20px
  gutter: 16px
  stack-sm: 4px
  stack-md: 12px
  stack-lg: 24px
---

## Brand & Style

This design system is built for a premium, high-utility PDF editing experience. It balances the urgency and recognizability of "PDF Red" with a sophisticated, calm workspace characterized by Light Cyan and Dark Slate Teal. 

The aesthetic follows a **Modern Corporate** approach with a **Tactile** edge. It utilizes generous whitespace, soft depth through subtle shadows, and high-contrast typography to ensure documents remain the focus. The interface should feel reliable and high-performance, evoking a sense of precision and professional ease. Visual hierarchy is established through clear layering: vibrant headers for navigation and brand identity, transitioning into soft, clean work surfaces for content management.

## Colors

The palette is divided into functional layers to ensure clarity during complex document tasks.

- **Primary (Dark Slate Teal):** Used for primary text, active iconography, and high-emphasis interactive elements. It provides the grounding professional tone.
- **Secondary (Light Cyan):** Applied to large background areas, soft gradients, and secondary containers to reduce eye strain during long editing sessions.
- **Brand Accent (Vibrant Red):** Reserved for PDF-specific branding, critical call-to-actions (like the Floating Action Button), and destructive "Danger" states.
- **Neutrals:** A range of slate-greys used for secondary metadata, borders, and disabled states.

Transitions between the vibrant red header and the light cyan body should use soft, linear gradients to maintain a premium, fluid feel.

## Typography

**Hanken Grotesk** is the sole typeface for the design system. Its geometric yet legible structure bridges the gap between technical precision and modern approachability.

- **Headlines:** Use Bold and Semi-Bold weights for clear section titling. Negative letter spacing is applied to larger sizes to maintain a tight, editorial look.
- **Body:** Standard weights are optimized for document filenames and metadata.
- **Labels:** Medium weights are used for buttons, navigation items, and micro-copy to ensure legibility against colorful backgrounds.

All text appearing on the Vibrant Red header should be white (#FFFFFF) to maintain maximum contrast and accessibility.

## Layout & Spacing

The system utilizes a **Fluid Grid** model centered on an 8px base unit. 

- **Margins:** Mobile screens utilize a 20px side margin. Desktop layouts transition to a max-width container (1200px) with centered alignment.
- **Grid:** A 12-column grid is used for desktop document galleries, while mobile defaults to a single-column list or 2-column "card" view.
- **Rhythm:** Vertical spacing between cards is fixed at 12px (stack-md) to allow for high density without visual clutter. 
- **Safe Areas:** The design accounts for significant top-padding in headers to accommodate system status bars and the "Premium" branding area.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** and **Ambient Shadows**.

1.  **Level 0 (Base):** The main background uses the Light Cyan primitive or pure White.
2.  **Level 1 (Cards):** Document cards and list items use a white surface with a very soft, diffused shadow (0px 4px 20px rgba(0,0,0,0.04)) and a subtle 1px border in a pale teal tone.
3.  **Level 2 (Navigation/Search):** Floating elements like the search bar and bottom navigation use a higher elevation (0px 8px 30px rgba(0,0,0,0.08)) to appear physically above the document list.
4.  **Level 3 (Action):** The Floating Action Button (FAB) uses a saturated red shadow (0px 6px 15px rgba(229, 57, 53, 0.3)) to emphasize its primary role.

## Shapes

The design system uses a pronounced **Rounded** shape language to soften the "industrial" feel of document management.

- **Component Radius:** Standard buttons and input fields use a 0.5rem (8px) radius.
- **Card Radius:** Document cards and containers use `rounded-lg` (16px) or `rounded-xl` (24px) for a modern, friendly appearance.
- **Search Bar:** Uses a fully pill-shaped (32px+) radius to distinguish it as a high-frequency global utility.
- **Icons:** Set within soft-square containers with consistent 8px-12px corner rounding.

## Components

- **Document Cards:** Available in two modes: "List" (horizontal, for dense data) and "Grid" (vertical, with large thumbnails). Both feature a 3-dot menu for actions and a heart icon for favorites.
- **Search Bar:** Inset within the header, featuring a leading search icon and a trailing "filter" or "settings" adjustment icon.
- **Primary Buttons:** High-contrast Teal or Red with white text. For the FAB, use a large circle with a central "+" icon.
- **Secondary Buttons:** Ghost-style with a 1px teal border or subtle cyan background.
- **Inputs:** Clean, white surfaces with soft-teal borders that thicken and darken on focus.
- **Bottom Navigation:** A persistent bar using active states indicated by primary teal coloring and a subtle top-border or highlight indicator.
- **PDF Badges:** Small, high-contrast red rectangles with white "PDF" text, used globally to identify file types instantly.