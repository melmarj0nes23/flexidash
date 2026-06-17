---
name: FlexiDash
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#424754'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#727785'
  outline-variant: '#c2c6d6'
  surface-tint: '#005ac2'
  primary: '#0058be'
  on-primary: '#ffffff'
  primary-container: '#2170e4'
  on-primary-container: '#fefcff'
  inverse-primary: '#adc6ff'
  secondary: '#515f74'
  on-secondary: '#ffffff'
  secondary-container: '#d5e3fd'
  on-secondary-container: '#57657b'
  tertiary: '#924700'
  on-tertiary: '#ffffff'
  tertiary-container: '#b75b00'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#d5e3fd'
  secondary-fixed-dim: '#b9c7e0'
  on-secondary-fixed: '#0d1c2f'
  on-secondary-fixed-variant: '#3a485c'
  tertiary-fixed: '#ffdcc6'
  tertiary-fixed-dim: '#ffb786'
  on-tertiary-fixed: '#311400'
  on-tertiary-fixed-variant: '#723600'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: '0'
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: '0'
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-mono:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: '0'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 24px
  margin-page: 40px
---

## Brand & Style
The design system is engineered for high-density financial data environments where clarity and efficiency are paramount. The brand personality is professional, precise, and unobtrusive, ensuring that the user's data remains the focal point. 

The aesthetic follows a **Modern Minimalist** approach with a focus on functional clarity. It utilizes a restrained color palette and a systematic layout to reduce cognitive load. Visual hierarchy is established through intentional whitespace and crisp typography rather than heavy decorative elements. The result is a calm, executive-grade interface that feels both powerful and easy to navigate.

## Colors
This design system employs a functional, low-fatigue palette. 

- **Primary Action**: Soft Blue (#3B82F6) is reserved exclusively for interactive elements, primary call-to-actions, and active navigation states.
- **Surface & Hierarchy**: The interface relies on white (#FFFFFF) for primary canvases and Slate Gray (#F8FAFC, #F1F5F9) for sidebar backgrounds, section headers, and subtle grouping containers.
- **Typography & Icons**: Slate Gray (#334155) provides high-contrast legibility for body text and primary iconography without the harshness of pure black.
- **Accents**: Functional colors (Red for alerts, Green for positive trends) should be used sparingly and at a lower saturation to maintain the minimal aesthetic.

## Typography
The typography system is built on **Inter**, chosen for its exceptional legibility in data-heavy contexts. 

- **Data Presentation**: For financial figures, utilize tabular num properties (`tnum`) to ensure numbers align vertically in tables.
- **Hierarchy**: Use `label-caps` for section titles and table headers to provide clear distinction from interactive data.
- **Tracking**: Generous letter spacing is applied to labels and small body text to prevent visual "clumping" in dense dashboards.
- **Mobile Scaling**: Large display styles scale down to a maximum of 24px on mobile devices to maintain layout integrity.

## Layout & Spacing
The design system utilizes a **Fluid Grid** model with a 12-column structure for desktop and a single-column stack for mobile. 

- **Rhythm**: A 4px baseline grid governs all spacing. Vertical margins between logical sections should consistently use the `xl` (32px) or `lg` (24px) units.
- **Containerization**: Use wide gutters (24px) to provide "breathing room" between complex data widgets.
- **Alignment**: All elements must align to the grid. Inset padding within cards and containers should be a consistent 24px to ensure internal visual balance.

## Elevation & Depth
In alignment with the minimalist SaaS aesthetic, this design system avoids heavy shadows. 

- **Tonal Layering**: Depth is achieved through background color shifts. The main canvas is white, while navigation panels and "well" containers use the `surface_subtle` gray.
- **Low-Contrast Outlines**: Components are defined by 1px solid borders using the `border_color` (#E2E8F0). This creates a "flat-plus" look that feels architectural and organized.
- **Active State Elevation**: Only the most critical interactive elements (like a focused modal or an active primary button) may use a very soft, high-diffusion shadow (0px 4px 12px rgba(0,0,0,0.05)).

## Shapes
The shape language is disciplined and professional. 

- **Corner Radius**: A "Soft" radius (4px) is the standard for almost all UI elements, including buttons, input fields, and cards. This provides a modern feel without the playfulness of fully rounded shapes.
- **Tables**: Table containers should remain sharp or use the standard 4px radius only on the outer container. Internal cells and rows remain perfectly rectangular to maximize data density.

## Components
Consistent application of the design system across core components:

- **Buttons**:
    - **Primary**: Solid #3B82F6 background, white text, 4px radius.
    - **Secondary**: Ghost style with #E2E8F0 border and #334155 text.
- **Tables**: Use a minimal approach. No vertical grid lines. Horizontal lines should be 1px solid #F1F5F9. Header rows use `label-caps` typography with a subtle #F8FAFC background.
- **Form Inputs**: Streamlined 1px borders. On focus, the border transitions to #3B82F6 with a subtle 2px outer glow in the same color (20% opacity). Labels sit above the field in `body-md` bold.
- **Cards**: Background white, 1px #E2E8F0 border, 4px radius. No shadow.
- **Chips/Tags**: Small, 2px radius, utilizing `surface_subtle` backgrounds with Slate Gray text for a neutral look.
- **Data Visualizations**: Charts should use a refined palette of blues and grays, maintaining the 1px stroke weight for all axes and grid lines.