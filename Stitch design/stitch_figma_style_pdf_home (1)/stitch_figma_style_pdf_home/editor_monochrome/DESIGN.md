---
name: Editor Monochrome
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1b1b1b'
  on-surface-variant: '#4c4546'
  inverse-surface: '#303030'
  inverse-on-surface: '#f1f1f1'
  outline: '#7e7576'
  outline-variant: '#cfc4c5'
  surface-tint: '#5e5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1b1b1b'
  on-primary-container: '#848484'
  inverse-primary: '#c6c6c6'
  secondary: '#5d5f5f'
  on-secondary: '#ffffff'
  secondary-container: '#dfe0e0'
  on-secondary-container: '#616363'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1b1b1b'
  on-tertiary-container: '#848484'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c6'
  on-primary-fixed: '#1b1b1b'
  on-primary-fixed-variant: '#474747'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c6'
  on-tertiary-fixed: '#1b1b1b'
  on-tertiary-fixed-variant: '#474747'
  background: '#f9f9f9'
  on-background: '#1b1b1b'
  surface-variant: '#e2e2e2'
  accent-magenta: '#FF00FF'
  surface-soft: '#F5F5F5'
  hairline: '#E6E6E6'
  hairline-soft: '#F0F0F0'
  block-lime: '#D3F57B'
  block-lilac: '#D6C4FF'
  block-cream: '#FFF9E5'
  block-mint: '#ADEFD1'
  block-pink: '#FFC7C2'
  block-coral: '#FFBDAE'
  block-navy: '#10162F'
typography:
  display-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 86px
    fontWeight: '340'
    lineHeight: 86px
    letterSpacing: -1.72px
  display-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '340'
    lineHeight: 52px
    letterSpacing: -1px
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 64px
    fontWeight: '340'
    lineHeight: 70px
    letterSpacing: -0.96px
  headline:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '540'
    lineHeight: 35px
    letterSpacing: -0.26px
  subhead:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '340'
    lineHeight: 35px
    letterSpacing: -0.26px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '330'
    lineHeight: 28px
    letterSpacing: -0.14px
  body:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '320'
    lineHeight: 26px
    letterSpacing: -0.26px
  button:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '480'
    lineHeight: 28px
    letterSpacing: -0.10px
  eyebrow:
    fontFamily: JetBrains Mono
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 23px
    letterSpacing: 0.54px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  margin-page: 24px
  gutter: 16px
  padding-xxl: 120px
  padding-xl: 80px
  padding-lg: 48px
---

## Overview
Figma's marketing canvas is, at the system level, an editor-clean black-and-white frame. The chrome — top nav, body type, footer, primary CTA — is monochrome. Headlines are oversized {typography.display-xl} set in figmaSans with aggressive negative tracking, body copy hovers around weight 320–340 of the same variable family, and small mono {typography.eyebrow} and {typography.caption} labels (figmaMono, all-caps, positive tracking) act as section markers. Every CTA is a pill — {rounded.pill} — and the primary action across the entire site is the same black {components.button-primary} paired with the same white {components.button-secondary}.

## Colors
### Brand & Accent
- Black ({colors.primary}): #000000
- White ({colors.on-primary}): #FFFFFF
- Magenta Promo ({colors.accent-magenta}): #FF00FF

### Surface
- Canvas ({colors.canvas}): #FFFFFF
- Inverse Canvas ({colors.inverse-canvas}): #000000
- Surface Soft ({colors.surface-soft}): #F5F5F5
- Hairline ({colors.hairline}): #E6E6E6
- Hairline Soft ({colors.hairline-soft}): #F0F0F0
- Block Lime ({colors.block-lime}): #D3F57B
- Block Lilac ({colors.block-lilac}): #D6C4FF
- Block Cream ({colors.block-cream}): #FFF9E5
- Block Mint ({colors.block-mint}): #ADEFD1
- Block Pink ({colors.block-pink}): #FFC7C2
- Block Coral ({colors.block-coral}): #FFBDAE
- Block Navy ({colors.block-navy}): #10162F

### Text
- Ink ({colors.ink}): #000000
- Inverse Ink ({colors.inverse-ink}): #FFFFFF

## Typography
### Hierarchy
- {typography.display-xl}: 86px, weight 340, line-height 1.00, tracking -1.72px
- {typography.display-lg}: 64px, weight 340, line-height 1.10, tracking -0.96px
- {typography.headline}: 26px, weight 540, line-height 1.35, tracking -0.26px
- {typography.subhead}: 26px, weight 340, line-height 1.35, tracking -0.26px
- {typography.body-lg}: 20px, weight 330, line-height 1.40, tracking -0.14px
- {typography.body}: 18px, weight 320, line-height 1.45, tracking -0.26px
- {typography.button}: 20px, weight 480, line-height 1.40, tracking -0.10px
- {typography.eyebrow}: 18px, weight 400, line-height 1.30, tracking 0.54px (Mono)

## Shapes
- {rounded.md}: 8px
- {rounded.lg}: 24px
- {rounded.pill}: 50px
- {rounded.full}: 9999px

## Components
- {components.button-primary}: Black pill, white text.
- {components.button-secondary}: White pill, black text, no border.
- {components.color-block-section}: Full-width panel, rounded-lg, xxl padding.
