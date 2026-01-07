# Unconventional Abilities Analyzer

**Unconventional Abilities Analyzer** is a comprehensive web-based interactive tool for visualizing and analyzing abilities from the **Roblox game *Unconventional***, inspired by *UnOrdinary*. This powerful analyzer features interactive Chart.js radar charts, multi-ability comparisons, progression tracking, advanced filtering systems, statistical distribution analysis, and extensive metadata displays.

🔗 **Live Demo**: [https://rylvion.github.io/unconventional/](https://rylvion.github.io/unconventional/)

---

## ✨ Features

### 📊 Core Visualization
- **Interactive Radar Charts** - Chart.js-powered pentagram charts displaying Power, Speed, Trick, Recovery, and Defense stats
- **Progression Charts** - Multi-level line/bar charts showing ability stat growth across all levels
- **Stats Distribution Charts** - Histogram visualization of stat value distributions with drill-down capabilities
- **Responsive Design** - Fully responsive layout optimized for desktop, tablet, and mobile devices
- **Ability Selection** - Browse 32+ abilities across 5 main tiers (Low-Tier, Mid-Tier, Elite-Tier, High-Tier, God-Tier) with nested sub-tiers
- **Level Selection** - View stats for each ability level with real-time stat calculations
- **Special Abilities Support** - Phase Shift with nested forms (Teleportation Form, Intangibility Form, etc.)

### 🔍 Search & Discovery
- **Smart Search** - Real-time dropdown search with fuzzy matching and keyboard navigation (Alt+S)
- **Recent Abilities** - Track and quick-access your last 5 viewed abilities with Alt+R
- **Favorites System** - Star/bookmark abilities with persistent storage and dedicated modal (Alt+F)
- **Tier Organization** - Abilities grouped by tier in dropdown optgroups for easy navigation
- **Advanced Filtering** - Multi-criteria filtering with:
  - Individual stat minimum thresholds (Power, Speed, Trick, Recovery, Defense)
  - Tier checkboxes (auto-populated from data)
  - Ability State filters (Copyable, Obtainable, Uncopyable)
  - Tag-based filtering (auto-populated from tags.json)
  - Filter modes: AND (strict) or OR (flexible)

### 🆚 Comparison Features
- **Dual Comparison Mode** - Compare two abilities side-by-side with visual stat difference table
- **Multi-Compare Mode** - Compare up to N abilities simultaneously with comprehensive stat matrix
- **Comparison Table** - Color-coded stat deltas showing increases/decreases between abilities
- **Side-by-Side Metadata** - View descriptions, tags, and FAQs for compared abilities in parallel

### ⚡ Stat Adjustments
- **Amping System** - Toggle between De-Amped (÷2), Normal (×1), and Amped (×1.5) multipliers
- **Real-time Calculations** - Instant stat recalculation with one decimal precision
- **Total/Average Stats** - Automatic sum and average calculations for quick comparisons
- **Per-Ability Amp Modes** - Independent amp settings for each ability in compare mode

### 📖 Metadata & Details
- **Ability Metadata** - Expandable sections with descriptions, FAQs, and target ratings
- **Tag System** - Color-coded ability tags with hover tooltips displaying full definitions
- **Weakness Indicators** - Visual weakness tags showing ability counters and vulnerabilities
- **Target Rating System** - Numerical scores with detailed explanations and weakness breakdowns
- **Ability States** - Track Copyable/Obtainable/Uncopyable status
- **GIF Galleries** - Organized ability animation galleries by move type:
  - F moves (Forward abilities)
  - R moves (Reverse abilities)
  - T moves (Transformation abilities)
  - G moves (General abilities)
  - Passive forms
- **GIF Modal Viewer** - Click any GIF to view enlarged in fullscreen modal
- **State Preservation** - Details sections remember open/closed state when switching levels

### 📈 Statistical Analysis
- **Distribution Histogram** - Visualize stat value frequency across filtered abilities
- **Tier Focus** - Filter distribution to analyze single tier performance
- **Ability Drill-Down** - Examine individual ability stat distributions
- **Stacking Toggle** - Switch between grouped and stacked bar views
- **Stat Visibility Controls** - Show/hide individual stats (Power, Speed, Trick, Recovery, Defense)
- **Distribution Export** - Export distribution charts to PNG or PDF

### 💾 Data Persistence & Sharing
- **URL State Management** - Shareable URLs with ability/level/amp/compare parameters
- **LocalStorage** - Persistent storage for:
  - Dark mode preference
  - Recent abilities list
  - Favorites collection
  - Last selected ability/level/amp mode
- **Auto-load State** - Automatically restores shared configurations from URL

### 📤 Export Options
- **PNG Export** - Download radar chart, progression chart, or both as PNG images
- **PDF Export** - Export charts to PDF format (radar only, progression only, or combined)
- **Chart Selection** - Choose which charts to include in export
- **Distribution Chart Export** - Separate PNG/PDF export for distribution histograms
- **High-Quality Output** - Uses html2canvas and jspdf for professional exports

### 🌙 Dark Mode
- **Toggle Dark Mode** - Seamless dark theme with automatic color scheme adjustments
- **Chart Color Sync** - `updateChartColors()` synchronizes Chart.js palette and tick colors
- **CSS Variables** - Theme colors managed via CSS custom properties
- **Persistent Preference** - Dark mode state saved to LocalStorage across sessions

### ⌨️ Accessibility & Shortcuts
- **Keyboard Shortcuts**:
  - `Alt+S` - Focus search input
  - `Alt+R` - Toggle recent abilities dropdown
  - `Alt+F` - Open favorites modal
  - `Alt+E` - Open export menu
  - `Esc` - Close modals, menus, and clear search
  - Arrow keys - Navigate search results
  - Enter - Select highlighted search result
- **Keyboard Navigation** - Full keyboard support for all interactive controls
- **ARIA Labels** - Proper accessibility attributes for screen readers
- **Semantic HTML** - Proper heading structure and landmark roles

### 🎨 Visual Enhancements
- **Smooth Animations** - Chart transitions with easeInOutQuart easing
- **Gradient Cards** - Beautiful blue/red gradient backgrounds for ability cards
- **Tooltip System** - Hover tooltips for tags and weaknesses with definitions
- **Responsive Breakpoints** - Optimized layouts for screens under 700px
- **Loading States** - Visual feedback during data operations
- **Color-Coded Stats** - Consistent color scheme across all visualizations

---

## 🗂️ Data Structure

### Abilities JSON Format (`abilities.json`)

Abilities are organized hierarchically by tier, with optional `_meta` tier information and individual ability entries:

```json
{
  "Low-Tier": {
    "_meta": {
      "description": "Tier description",
      "faq": "Tier-specific FAQ",
      "level-range": "1.0 - 2.0"
    },
    "Ability Name": {
      "assets": {
        "icon": "/abilities-assets/low-tier/Ability-Name/icon/ability.png",
        "f": ["/abilities-assets/.../f/move1.gif", "/abilities-assets/.../f/move2.gif"],
        "r": ["/abilities-assets/.../r/move1.gif"],
        "t": ["/abilities-assets/.../t/transform.gif"],
        "g": ["/abilities-assets/.../g/general.gif"],
        "passive": ["/abilities-assets/.../passive/passive.gif"]
      },
      "_meta": {
        "description": "Detailed ability description",
        "faq": "Frequently asked questions about this ability",
        "tags": ["Tag1", "Tag2", "Tag3"],
        "ability-state": ["Copyable", "Obtainable"],
        "target-rating": {
          "score": 7.5,
          "explanation": "Why this ability received this rating",
          "Weaknesses": ["Weakness1", "Weakness2"]
        }
      },
      "levels": {
        "1.0": { "Pow": 1.0, "Spd": 2.0, "Trick": 3.0, "Recv": 4.0, "Def": 5.0 },
        "1.5": { "Pow": 1.5, "Spd": 2.5, "Trick": 3.5, "Recv": 4.5, "Def": 5.5 },
        "2.0": { "Pow": 2.0, "Spd": 3.0, "Trick": 4.0, "Recv": 5.0, "Def": 6.0 }
      }
    }
  }
}
```

**Special Case - Phase Shift** uses nested forms:

```json
"Phase-Shift": {
  "assets": { /* ... */ },
  "_meta": { /* ... */ },
  "levels": {
    "Teleportation Form": {
      "1.0": { "Pow": 3.0, "Spd": 5.0, "Trick": 7.0, "Recv": 4.0, "Def": 2.0 },
      "1.5": { "Pow": 3.5, "Spd": 5.5, "Trick": 7.5, "Recv": 4.5, "Def": 2.5 }
    },
    "Intangibility Form": {
      "1.0": { "Pow": 1.0, "Spd": 3.0, "Trick": 8.0, "Recv": 5.0, "Def": 8.0 }
    }
  }
}
```

UI displays Phase Shift levels as `form::level` (e.g., "Teleportation Form::1.0")

### Tags JSON Format (`tags.json`)

Tag definitions for tooltips and filtering:

```json
{
  "Tag-Name": {
    "emoji": "🏷️",
    "Description": "Brief explanation of the tag",
    "Gameplay": "How this tag affects in-game mechanics",
    "Strengths": "What this tag excels against",
    "Weaknesses": "What counters this tag",
    "Synergy": "Good ability combinations"
  }
}
```

### Stat Fields

All abilities use five core stats:
- **Pow** (Power) - Damage output and offensive capability
- **Spd** (Speed) - Movement and attack speed
- **Trick** (Trick) - Complexity, versatility, and deception
- **Recv** (Recovery) - Energy regeneration and stamina
- **Def** (Defense) - Damage mitigation and durability

Level keys use string format with one decimal place (e.g., "1.0", "1.5", "2.0") and maintain numeric-ascending order.

---

## 🔧 How to Update Data

### Adding/Updating Ability Stats

**Method 1: Python Data Converter** (Recommended)

1. Use `data/export_data.py` with tab-separated spreadsheet data:

```python
ability_name = "Ability Name"  # Set your ability name

data_text = """
1.0	1.0	2.0	3.0	4.0	5.0
1.5	1.5	2.5	3.5	4.5	5.5
2.0	2.0	3.0	4.0	5.0	6.0
"""
# Format: level  Pow  Spd  Trick  Recv  Def
```

2. Run the script to generate `pydump.json`:
```bash
python data/export_data.py
```

3. Copy the JSON output from `pydump.json` into the appropriate tier section in `abilities.json`

4. Add asset paths and metadata:
```json
"assets": {
  "icon": "/abilities-assets/tier-name/Ability-Name/icon/ability.png",
  "f": ["/abilities-assets/.../f/move.gif"],
  /* ... other move types ... */
},
"_meta": {
  "description": "Ability description",
  "tags": ["Tag1", "Tag2"],
  /* ... other metadata ... */
}
```

**Method 2: Manual JSON Editing**

Directly edit `abilities.json` following the structure outlined in the Data Structure section above. Ensure:
- Level keys are strings with one decimal place
- Stats use proper field names (Pow, Spd, Trick, Recv, Def)
- Maintain numeric-ascending order for levels

### Adding Ability Assets

1. **Create folder structure**:
```
abilities-assets/
  └── tier-name/
      └── Ability-Name/
          ├── icon/
          ├── f/       # Forward moves
          ├── r/       # Reverse moves
          ├── t/       # Transformation moves
          ├── g/       # General moves
          └── passive/ # Passive form
```

2. **Add icon file**: Place PNG icon in the `icon/` folder (e.g., `ability-name.png`)

3. **Add move GIFs** (optional): Place GIF files in respective move type folders

4. **Update abilities.json**: Add asset paths under the ability's `assets` field:
```json
"assets": {
  "icon": "/abilities-assets/tier-name/Ability-Name/icon/ability-name.png",
  "f": [
    "/abilities-assets/tier-name/Ability-Name/f/move1.gif",
    "/abilities-assets/tier-name/Ability-Name/f/move2.gif"
  ],
  "r": ["/abilities-assets/tier-name/Ability-Name/r/move1.gif"],
  /* ... */
}
```

### Bulk Downloading Icons

Use `data/download_images.py` to download tier list icons in bulk:

```bash
python data/download_images.py
```

Configure the script with tier name and ability names to automatically download and organize icons.

### Adding/Editing Tags

1. Edit `tags.json` to add or modify tag definitions:
```json
"New-Tag": {
  "emoji": "🏷️",
  "Description": "Tag description",
  "Gameplay": "In-game mechanics",
  "Strengths": "Advantages",
  "Weaknesses": "Disadvantages",
  "Synergy": "Combinations"
}
```

2. Use the tag name in ability `_meta.tags` arrays in `abilities.json`

3. Tooltips will automatically display when hovering over tags in the UI

### Data Validation

Run `data/test.py` to validate data integrity:

```bash
python data/test.py
```

This checks for:
- Valid JSON syntax
- Missing required fields
- Broken asset paths
- Invalid stat values

---

## 📁 File Structure

```
uncon-radar/
├── index.html              # Main HTML file with SEO-optimized head section
├── radar.js                # Core application logic (2100+ lines)
│                            # - Chart rendering & state management
│                            # - Search, filters, favorites, recent abilities
│                            # - Export functionality (PNG/PDF)
│                            # - URL state management & localStorage
├── styles.css              # Complete styling (2300+ lines)
│                            # - Light & dark mode themes
│                            # - Responsive design & animations
│                            # - Component styles & tooltips
├── abilities.json          # Complete ability database with stats & metadata
├── tags.json               # Tag definitions with descriptions and tooltips
├── README.md               # This documentation file
├── LICENSE                 # MIT License
├── abilities-assets/       # Icons and GIF assets organized by tier
│   ├── low-tier/
│   │   ├── Illumination/
│   │   └── Needles/
│   ├── mid-tier/
│   │   ├── Regeneration/
│   │   ├── Speed/
│   │   ├── StoneSkin/
│   │   ├── Strong-Kick/
│   │   └── Strong-Punch/
│   ├── elite-tier/
│   │   ├── Energy-Discharge/
│   │   ├── Explosion/
│   │   ├── Healing/
│   │   ├── Hunter/
│   │   ├── nightmare/
│   │   ├── Phase-Shift/       # Special: nested forms
│   │   └── Teleportation/
│   ├── high-tier/
│   │   ├── low-high-tier/
│   │   │   ├── arachnid/
│   │   │   ├── ConjureVines/
│   │   │   ├── EnergyBlades/
│   │   │   ├── Festive/
│   │   │   └── lightning/
│   │   └── high-high-tier/
│   │       ├── Duplication/
│   │       ├── Fireclaws/
│   │       └── Spectral-Claw/
│   └── god-tier/
│       ├── low-god-tier/
│       │   ├── barrier/
│       │   ├── botanist/
│       │   ├── hydro/
│       │   ├── hypnosis/
│       │   ├── particles/
│       │   └── pumpkins/
│       ├── mid-god-tier/
│       │   ├── candycleave/
│       │   ├── landscaping/
│       │   ├── minefield/
│       │   ├── telekenisis/
│       │   └── time/
│       └── high-god-tier/
│           ├── aura/
│           ├── command/
│           ├── sensory/
│           └── varrier/
├── data/
│   ├── export_data.py      # Convert spreadsheet data to JSON
│   ├── download_images.py  # Bulk download ability icons
│   ├── export_mediawiki.py # MediaWiki table export utility
│   ├── pydump.json         # Temporary converted data output
│   └── test.py             # Data validation and testing
└── public/                 # Static assets for PWA
    ├── favicon.ico
    ├── favicon-16x16.png
    ├── favicon-32x32.png
    ├── apple-touch-icon.png
    ├── android-chrome-192x192.png
    ├── android-chrome-512x512.png
    ├── og-image.png        # Open Graph image for social sharing
    ├── site.webmanifest    # PWA manifest
    └── about.txt           # Site information
```

Each ability folder contains:
- `icon/` - Ability icon PNG
- `f/` - Forward move GIFs
- `r/` - Reverse move GIFs
- `t/` - Transformation move GIFs
- `g/` - General move GIFs
- `passive/` - Passive form GIFs

---

## 🚀 Getting Started

### Prerequisites

- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- No server required - runs entirely client-side
- Optional: Python 3.6+ for data conversion scripts

### Installation & Usage

1. **Clone the repository:**
```bash
git clone https://github.com/rylvion/uncon-radar.git
cd uncon-radar
```

2. **Open in browser:**
   - Simply open `index.html` in your web browser
   - Or use a local development server:
```bash
# Python 3
python -m http.server 8000

# Node.js (with http-server)
npx http-server
```

3. **Start exploring:**
   - Select an ability from the dropdown
   - Choose a level to view stats
   - Use search (Alt+S) to quickly find abilities
   - Enable compare mode for side-by-side analysis
   - Apply filters to narrow down results
   - Export charts for documentation

### Quick Start Guide

1. **View an Ability**:
   - Select ability from dropdown or use search (Alt+S)
   - Choose level to see stats on radar chart
   - Toggle amp mode to see stat adjustments

2. **Compare Abilities**:
   - Click "Compare Mode" button
   - Select second ability and level
   - View side-by-side radar and difference table

3. **Use Advanced Filters**:
   - Click "Advanced Filters" button
   - Set stat thresholds or select tiers/tags
   - Choose AND/OR filter mode
   - Click "Apply Filters"

4. **Track Favorites**:
   - Click star icon on ability cards to favorite
   - Open favorites modal (Alt+F) to view all favorites
   - Quick-access frequently used abilities

5. **Export Charts**:
   - Click export button (Alt+E)
   - Choose PNG or PDF format
   - Select which charts to include (radar, progression, or both)

6. **Share Configurations**:
   - Click share button to copy URL
   - URL includes current ability/level/amp/compare state
   - Share link with others to show exact configuration

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action | Description |
|----------|--------|-------------|
| `Alt+S` | Focus Search | Immediately focus the search input field |
| `Alt+R` | Recent Abilities | Toggle recent abilities dropdown menu |
| `Alt+F` | Favorites | Open favorites modal with all starred abilities |
| `Alt+E` | Export Menu | Open export options (PNG/PDF) |
| `Esc` | Close/Clear | Close modals, dropdowns, and clear search |
| `↑` / `↓` | Navigate Search | Arrow keys to navigate search results |
| `Enter` | Select Result | Select highlighted search result |

---

## 🛠️ Technical Implementation

### Architecture

**Frontend Stack:**
- Pure JavaScript (ES6+) - No framework dependencies
- Chart.js 4.4.0 - Interactive radar and progression charts
- html2canvas - Chart export to PNG
- jspdf - PDF export functionality
- CSS3 with CSS Variables - Theme management

**Key JavaScript Modules** (`radar.js`):

```javascript
// Global State Management
let AbilitiesData = {};           // Loaded ability data
let favorites = [];                // Favorited abilities
let recent = [];                   // Recently viewed abilities
let compareMode = false;           // Comparison toggle
let radarChart = null;             // Chart.js instance
let progressionChart = null;       // Progression chart instance
let distributionChart = null;      // Distribution chart instance

// Core Functions
populateAbilities(selectEl)        // Populate ability dropdowns
populateLevels(selectEl)           // Populate level options
getStats(tier, ability, level, mode) // Get stats with amp mode
updateChart()                      // Main render function
renderStatsCompare()               // Build stats cards
renderComparison()                 // Build comparison table
renderMultiComparison()            // Multi-ability comparison
updateProgressionChart()           // Render progression chart
updateStatDistributionChart()      // Render distribution chart

// Feature Modules
setupSearch()                      // Smart search with dropdown
setupAdvancedFilters()             // Filter UI and logic
toggleFavorite()                   // Favorite management
addToRecent()                      // Recent tracking
updateURL()                        // URL state management
exportChart(format, chartType)     // Export functionality
```

**CSS Architecture** (`styles.css`):

```css
/* CSS Variables for Theming */
:root {
  --primary: #2196F3;
  --danger: #f44336;
  --success: #4CAF50;
  --text-light: #f5f5f5;
  --text-dark: #333;
  --bg-card: #fff;
  /* ... more variables ... */
}

/* Dark Mode Overrides */
body.dark-mode {
  --bg-card: #1e1e1e;
  --text-dark: #e0e0e0;
  /* ... theme adjustments ... */
}
```

### Data Flow

1. **Page Load**:
   - Load `abilities.json` and `tags.json`
   - Parse URL parameters for shared state
   - Restore localStorage preferences (dark mode, favorites, recent)
   - Populate ability dropdowns

2. **User Selection**:
   - Update level dropdown based on selected ability
   - Call `getStats()` to retrieve and calculate stats
   - Call `updateChart()` to render visualizations
   - Update URL parameters for sharing

3. **Filter Application**:
   - Collect filter criteria (stats, tiers, tags, states)
   - Filter abilities based on mode (AND/OR)
   - Rebuild ability dropdown with filtered results
   - Preserve current selection if it matches filters

4. **Export Operation**:
   - Capture canvas elements with html2canvas
   - Convert to PNG or generate PDF with jspdf
   - Trigger download with dynamically generated filename

### State Persistence

**localStorage Keys:**
```javascript
'darkMode'          // Boolean - dark mode preference
'ability1'          // String - last selected primary ability
'level1'            // String - last selected primary level
'amp1'              // String - last amp mode (de-amped/normal/amped)
'favorites'         // JSON Array - favorited abilities (tier::ability)
'recent'            // JSON Array - recent abilities (tier::ability, max 5)
```

**URL Parameters:**
```
?ability=God-Tier::time
&level=10.0
&amp=amped
&compare=true
&ability2=Elite-Tier::Phase-Shift
&level2=Teleportation Form::5.0
&amp2=normal
```

### Performance Optimizations

- **Debounced Search**: 150ms delay on search input to reduce filtering calls
- **Lazy GIF Loading**: GIFs load on-demand when cards are rendered
- **Chart Animation**: Smooth transitions without blocking UI
- **LocalStorage Caching**: Minimize data parsing on subsequent visits
- **Event Delegation**: Efficient event handling for dynamic content

---

## 🌐 Browser Support

| Browser | Minimum Version | Notes |
|---------|----------------|-------|
| Chrome/Chromium | 90+ | Recommended for best performance |
| Firefox | 88+ | Full feature support |
| Safari | 14+ | Full feature support |
| Edge | 90+ | Full feature support |
| Opera | 76+ | Full feature support |

**Required Browser Features:**
- ES6 JavaScript support
- CSS Grid and Flexbox
- LocalStorage API
- Canvas API (for Chart.js)
- CSS Custom Properties (variables)

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### Ways to Contribute

1. **Add/Update Ability Data**:
   - Submit new abilities or correct existing stats
   - Add missing metadata (descriptions, FAQs, tags)
   - Contribute ability GIFs and icons

2. **Improve Code**:
   - Fix bugs or performance issues
   - Add new features or enhancements
   - Improve accessibility or responsiveness
   - Optimize chart rendering

3. **Enhance Documentation**:
   - Fix typos or clarify instructions
   - Add examples or tutorials
   - Translate documentation

4. **Report Issues**:
   - Bug reports with reproduction steps
   - Feature requests with use cases
   - UI/UX improvement suggestions

### Contribution Workflow

1. **Fork the repository**
2. **Create a feature branch**:
```bash
git checkout -b feature/your-feature-name
```

3. **Make your changes**:
   - Follow existing code style
   - Test thoroughly in multiple browsers
   - Update documentation if needed

4. **Commit with clear messages**:
```bash
git commit -m "Add: new ability comparison feature"
```

5. **Push to your fork**:
```bash
git push origin feature/your-feature-name
```

6. **Submit a Pull Request**:
   - Describe changes and motivation
   - Reference related issues
   - Include screenshots for UI changes

### Code Style Guidelines

- **JavaScript**: Use ES6+ syntax, camelCase for variables/functions
- **CSS**: Use kebab-case for class names, organize by component
- **JSON**: Maintain consistent formatting, use string keys with one decimal for levels
- **Comments**: Explain complex logic, document functions with JSDoc-style comments

---

## 📊 SEO & Social Sharing

The site is optimized for search engines and social media:

### SEO Features
- Semantic HTML5 structure with proper heading hierarchy
- Meta descriptions optimized for search engines
- Canonical URL for duplicate content prevention
- Robots meta tags for indexing control
- Structured data with Open Graph protocol
- Google Analytics integration for usage tracking

### Social Media Cards
- **Facebook/LinkedIn**: Open Graph tags with 1200×630 preview image
- **Twitter/X**: Large summary card with optimized descriptions
- **Discord/Slack**: Rich embeds with title, description, and image

### Performance
- Preconnect to Google Analytics for faster loading
- Optimized asset delivery with proper caching headers
- Responsive images for different screen sizes
- Lazy loading for GIF galleries

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for full details.

```
MIT License

Copyright (c) 2025 rylvion

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software...
```

---

## 🙏 Credits & Acknowledgments

- **Game**: Roblox *Unconventional* by [big_thonk](https://www.roblox.com/games/8540168650/Unconventional)
- **Inspired by**: Webcomic *UnOrdinary* by uru-chan
- **Chart Library**: [Chart.js](https://www.chartjs.org/) - Simple yet flexible JavaScript charting
- **Export Libraries**: 
  - [html2canvas](https://html2canvas.hertzen.com/) - Canvas screenshot library
  - [jsPDF](https://github.com/parallax/jsPDF) - PDF generation library
- **Developer**: [rylvion](https://github.com/rylvion)
- **Contributors**: Thanks to all who have contributed data, code, and feedback!

---

## 📞 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/rylvion/uncon-radar/issues)
- **Discussions**: [GitHub Discussions](https://github.com/rylvion/uncon-radar/discussions)
- **Website**: [https://rylvion.github.io/uncon-radar/](https://rylvion.github.io/uncon-radar/)

---

## 🗺️ Roadmap

Future enhancements under consideration:

- [ ] Multi-language support (i18n)
- [ ] Ability calculator for custom stat combinations
- [ ] Team composition builder with synergy analysis
- [ ] Historical stat tracking across game updates
- [ ] User accounts for cloud-saved favorites
- [ ] Mobile app version (PWA enhancement)
- [ ] Community ability ratings and comments
- [ ] Ability matchup matrix with win rates
- [ ] Advanced statistical analysis (correlations, trends)
- [ ] API endpoint for third-party integrations

---

<div align="center">

**Built with ❤️ by the Unconventional community**

⭐ Star this repo if you find it helpful!

[Report Bug](https://github.com/rylvion/uncon-radar/issues) · [Request Feature](https://github.com/rylvion/uncon-radar/issues) · [View Demo](https://rylvion.github.io/uncon-radar/)

</div>
