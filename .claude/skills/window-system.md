---
name: window-system
description: Guide for creating windows in this portfolio site. Use when adding new windows, creating window types, working with explorer/blog windows, or modifying window config.
---

# Creating New Windows

## Window Types Overview

| Type | Module | Use For |
|------|--------|---------|
| `explorer` | FileExplorer | Browsable items with categories (projects, artwork) |
| `blog` | Blog | Post list with article views |
| *(none)* | N/A | Simple static content |

---

## Adding a Static Window (No Type)

**2 files to edit:**

### 1. `index.html` - Add template
```html
<template id="mywindow-content">
  <div class="window-content">
    <h1>My Content</h1>
    <p>Any HTML you want</p>
  </div>
</template>
```

### 2. `js/config.js` - Add window config
```javascript
mywindow: {
  id: 'mywindow',
  title: 'My Window Title',
  label: 'My Window',              // Desktop/taskbar label
  icon: 'images/icons/myicon.png',
  width: 500,
  height: 400,
  x: 150, y: 100,                  // Or 'center'
  contentId: 'mywindow-content',   // Must match template ID
  openOnLoad: false,
  showInUI: true                   // false = hidden easter egg
}
```

**That's it.** Order in config = order on screen.

---

## Adding an Explorer Window

**4 files to edit:**

### 1. Create data JSON (`data/mydata.json`)
```json
{
  "items": [
    {
      "id": "item-1",
      "title": "Item Name",
      "summary": "Short description",
      "tags": ["Category1", "Category2"],
      "icon": null,
      "contentFile": "data/mydata/item-1.html",
      "status": "published"
    }
  ]
}
```

### 2. Create detail HTML files (`data/mydata/item-1.html`)
```html
<div class="project-detail">
  <img src="images/item-hero.png" class="project-hero">
  <p>Full content here...</p>
  <div class="project-links">
    <a href="...">Link 1</a>
  </div>
</div>
```

### 3. `index.html` - Add template
```html
<template id="myexplorer-content">
  <div class="window-content explorer-container">
    <aside class="explorer-sidebar"></aside>
    <main class="explorer-main">
      <div class="explorer-grid"></div>
    </main>
    <div class="explorer-detail-view">
      <button class="explorer-back-btn">
        <i class="fa-solid fa-arrow-left"></i> Back
      </button>
      <div class="explorer-detail-content"></div>
    </div>
  </div>
</template>
```

### 4. `js/config.js` - Add window config
```javascript
myexplorer: {
  id: 'myexplorer',
  title: 'My Explorer',
  label: 'Explorer',
  icon: 'images/icons/folder.png',
  width: 600,
  height: 450,
  x: 'center', y: 'center',
  contentId: 'myexplorer-content',
  openOnLoad: false,
  showInUI: true,
  type: 'explorer',                    // Triggers FileExplorer
  dataUrl: 'data/mydata.json'          // Data source
}
```

**Categories auto-populate from tags** - no hardcoded list needed.

---

## Adding a New Window Type

**4 files to edit:**

### 1. Create module (`js/my-type.js`)
```javascript
const MyType = {
  async init(container, config) {
    // container = cloned template DOM
    // config = window config object from config.js

    const data = await fetch(config.dataUrl).then(r => r.json());
    this.render(container, data);
    this.attachListeners(container);
  },

  render(container, data) { /* ... */ },
  attachListeners(container) { /* ... */ }
};
```

### 2. Register in `js/window-manager.js` (~line 194)
```javascript
const modules = {
  blog: typeof Blog !== 'undefined' ? Blog : null,
  explorer: typeof FileExplorer !== 'undefined' ? FileExplorer : null,
  myType: typeof MyType !== 'undefined' ? MyType : null  // Add here
};
```

### 3. `index.html` - Add script + template
```html
<script src="js/my-type.js"></script>

<template id="mytype-content">
  <div class="window-content my-type-container">
    <!-- Your structure -->
  </div>
</template>
```

### 4. `js/config.js` - Add window config with type
```javascript
mywindow: {
  // ... standard fields ...
  type: 'myType',           // Must match module name in modules object
  dataUrl: 'data/mine.json' // Custom fields for your module
}
```

---

## Config Field Reference

| Field | Required | Notes |
|-------|----------|-------|
| `id` | Yes | Unique identifier |
| `title` | Yes | Window title bar |
| `label` | Yes | Desktop/taskbar text |
| `icon` | Yes | Icon path |
| `width`, `height` | Yes | Desktop size (px) |
| `x`, `y` | Yes | Position (number or 'center') |
| `contentId` | Yes | Template ID to clone |
| `openOnLoad` | No | Auto-open on page load (default: false) |
| `showInUI` | No | Show in UI (default: true, false = hidden) |
| `type` | No | Type module to initialize |
| *custom* | No | Any module-specific fields |

---

## Key Principles

1. **Config is truth** - All window metadata in `js/config.js`
2. **Order matters** - Config order = screen order
3. **Types are optional** - Omit `type` for simple static windows
4. **Categories are dynamic** - Explorer derives them from `tags[]`
5. **Content is flexible** - Detail views are pure HTML
