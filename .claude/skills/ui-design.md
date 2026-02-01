---
  triggers: [ui, css, styling, layout, design, windows, mobile, responsive]
  ---

  # UI Design

  Guidelines for Windows 95 aesthetic portfolio site.

  ## Philosophy

  - **Simplest solution wins** - No over-engineering, no spaghetti
  - **Config-driven** - Single source of truth in config.js
  - **No magic** - Everything explicit, no hidden behavior
  - **Scalable patterns** - Will this cause problems down the line?
  - **Respect the cascade** - Remove overrides, let elements inherit established styles, only add what makes them distinct

  ## Windows 95 Authenticity

  - **Foundation**: 98.css CDN library
  - **Pixel-perfect**: `image-rendering: crisp-edges` on all icons
  - **3D beveling**: Inset box-shadows only (no drop shadows on UI elements)
  - **Color palette**:
    - Desktop: `#008080` (teal)
    - UI surfaces: `#c0c0c0` (gray)
    - Active title: `#000080` (navy)
    - Links: `#0000ff` → `#ff0000` (hover) → `#800080` (visited)

  ## Typography

  - **UI text**: Pixelated MS Sans Serif
  - **Readable content** (blog): Georgia serif
  - **Labels on dark backgrounds**: White text + 1px black text-shadow

  ## Sizing & Spacing

  - Prefer **larger sizes** for readability
  - Standard padding: **12px**
  - Touch targets: **44px minimum** on mobile
  - Mobile breakpoint: **480px**

  ## Mobile

  - **Tabs mode**: One window at a time, centered
  - **Scroll mode**: Stacked cards, vertical scroll
  - Header grows: 40px → 56px
  - Disable drag/resize on mobile

  ## Animations

  - **Very subtle or none** - Don't distract from the retro aesthetic

  ## Content Architecture

  - **JSON** for metadata (fast, structured)
  - **HTML** for content (flexible, human-editable)
  - Templates in `index.html`, config in `config.js`