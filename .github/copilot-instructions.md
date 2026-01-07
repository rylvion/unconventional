# Copilot Instructions
- **Purpose**: Interactive Chart.js radar visualizer for Roblox Unconventional abilities with search, filtering, favorites, and comparison features. Core files: `index.html`, `radar.js`, `styles.css`; data in `abilities.json` with assets in `abilities-assets/`.

## Data Structure
- `abilities.json` organized by **tiers** (Low-Tier, Mid-Tier, High-Tier, Elite-Tier, God-Tier with nested sub-tiers)
- Each tier has optional `_meta` (faq, description, level-range) and ability entries
- Ability shape: `assets` (icon, f/r/t/g/passive gif arrays), optional `_meta` (faq, tags, ability-state, target-rating with score/explanation/Weaknesses), `levels` (string level -> `{Pow, Spd, Trick, Recv, Def}`), optional `abilities` map
- Level keys are strings with one decimal place (e.g., "1.0", "1.5"); keep ordering numeric-ascending
- **Special case**: `Phase Shift` uses nested forms: `levels` -> `form` -> `level`. UI expects `form::level` format in selects/params (e.g., "Teleportation Form::1.0")

## Core Features
- **Search**: Text input with real-time dropdown; Alt+S focuses search
- **Recent Abilities**: Tracks up to 5 recent views (tier::ability format); persisted to localStorage; Alt+R toggles recent dropdown
- **Favorites**: Star-toggle on ability cards; persisted to localStorage; Alt+F opens favorites modal
- **Advanced Filters**: 
  - Stat filters (Power, Speed, Trick, Recovery, Defense min thresholds)
  - Tier checkboxes (auto-populated from data)
  - Ability State filters (Copyable, Obtainable, Uncopyable)
  - Tags filters (auto-populated from `tags.json`)
  - Filter mode: AND (strict, all match) or OR (flexible, any match)
  - Applied via "Apply Filters" button
- **Compare Mode**: Button toggles second ability + comparison table showing stat diffs
- **Multi-Compare Mode**: Compare up to N abilities simultaneously with side-by-side stat table and totals
- **Amp Modes**: De-Amped (÷2), Normal (×1), Amped (×1.5) with stringified decimals
- **Export**: PNG or PDF (radar only, progression only, or both); uses html2canvas and jspdf libraries
- **Share**: Copies shareable URL with selected ability/level/amp mode to clipboard
- **Metadata Display**: Renders expandable details sections (About, Tags, Target Rating, FAQ) with preserved open/closed state when switching levels within same ability
- **Dark Mode**: Toggled by hidden `#darkModeToggle` button; CSS uses CSS variables; `updateChartColors()` syncs Chart.js palette and tick colors; class `body.dark-mode`
- **Progression Chart**: Second Chart.js instance showing ability stats across all levels (stacked line/bar behind radar)
- **Stats Distribution Chart**: Histogram showing stat value distributions across all filtered abilities with drill-down controls:
  - **Tier Focus**: Filter distribution to single tier
  - **Ability Focus**: Drill further to single ability's level distribution
  - **Stacking Toggle**: Switch between grouped and stacked bars
  - **Stat Visibility**: Show/hide individual stats (Power, Speed, Trick, Recovery, Defense)
  - **Export**: PNG or PDF export for distribution chart
- **GIF Modal**: Click ability preview GIFs to enlarge in modal overlay
- **Keyboard Shortcuts**: Alt+S (search), Alt+R (recent), Alt+F (favorites), Alt+E (export)

## JavaScript Architecture (radar.js)
- **Global State**: `favorites[]`, `recent[]`, `compareMode`, `AbilitiesData` (loaded JSON)
- **Selection Elements**: `abilitySelect`, `levelSelect`, `ampModeSelect`, `abilitySelect2`, `levelSelect2`, `ampModeSelect2` (for compare)
- **Display Elements**: `statsDisplay`, `radarChart`, `progressionChart`, `comparisonSummary`
- **Key Functions**:
  - `populateAbilities(selectEl)`: Builds optgroups from tiers; called on page load and filter apply
  - `populateLevels(selectEl)`: Populates level options for selected ability; handles Phase Shift nested `form::level`
  - `getStats(tier, ability, level, mode)`: Returns {Pow, Spd, Trick, Recv, Def} with amp mode multipliers applied
  - `updateChart()`: Main rendering function; calls `renderStatsCompare()`, `renderComparison()`, `updateProgressionChart()`
  - `renderStatsCompare()`: Builds stats cards (icons, values, totals, GIF galleries) and metadata sections; preserves details open state via `saveDetailsStates()`/`restoreDetailsStates()`
  - `renderComparison()`: Builds diff table showing side-by-side stat deltas
  - `renderMultiComparison()`: Builds comparison table for multiple abilities showing all stats side-by-side with totals
  - `updateProgressionChart()`: Re-renders Chart.js progression chart with multi-level data
  - `renderMetadata(meta, abilityName)`: Builds details sections for description, tags, target-rating, FAQ
  - `saveDetailsStates(container)` / `restoreDetailsStates()`: Preserve `<details>` element open/closed state across re-renders
  - `exportChart(format, chartType)`: Exports radar/progression/both to PNG or PDF (html2canvas, jspdf)
  - `exportDistributionChart(format)`: Exports distribution histogram to PNG or PDF with tier/ability focus in filename
  - `updateDistributionTierSelect()`: Populates tier dropdown from filtered abilities
  - `updateDistributionAbilitySelect()`: Populates ability dropdown from selected tier
  - `updateStatDistributionChart(tierFilter, abilityFilter)`: Main distribution chart renderer with filtering, stacking, and stat visibility support
  - `setupAdvancedFilters()`: Populates tier/tags checkboxes; binds filter apply/clear
  - Favorites: `toggleFavorite()`, `isFavorite()`, `loadFavorites()`, `updateFavoriteUI()`
  - Recent: `addToRecent()`, `loadRecent()`, `updateRecentUI()`
  - Search: `setupSearch()` (custom dropdown with arrow key nav, click to select)
  - URL State: `updateURL()`, `loadStateFromURL()` for shareable links with ability/level/amp/compare params
  - LocalStorage: `loadPreferences()`, `savePreferences()` for dark mode, last selected ability/level/amp
  - `getTagDefinition()`, `getWeaknessDefinition()`: Tooltips from tag/weakness definitions in data

## UI/HTML Structure (index.html)
- Single `.wrap` container with `.card` main content area
- Hidden dark mode toggle button `#darkModeToggle`
- Search section: `#abilitySearch` input + `#searchDropdown` custom dropdown
- Recent section: `#recentToggle` button + `#recentDropdown` menu
- Advanced filters: `#filterToggle` button + `#advancedFilters` collapsible div with sliders, checkboxes, radio buttons
- Primary controls: `#abilitySelect`, `#levelSelect`, `#ampModeSelect` (standard HTML selects)
- Action buttons: `#compareToggle`, `#favoritesBtn`, `#exportBtn` (with export menu), `#shareBtn`
- Compare section: `#compareControls` (hidden by default) with `#abilitySelect2`, `#levelSelect2`, `#ampModeSelect2`
- Chart containers: `<canvas id="radarChart">` (600×400, responsive), `<canvas id="progressionChart">`, `<canvas id="distributionChart">`
- Distribution controls: `#distTierSelect`, `#distAbilitySelect`, `#distStackToggle`, `.dist-stat-filter` checkboxes
- Distribution export: `.distribution-export-buttons` with PNG/PDF export options
- Stats/metadata display: `#statsDisplay` (dynamically filled)
- Comparison table: `#comparisonSummary` (hidden unless compareMode + valid statsB)
- GIF modal: `#gifModal` with image + close button

## Styling (styles.css)
- **Colors/Variables**: `--primary` (blue), `--danger` (red), `--success` (green), `--text-light`/`--text-dark`, `--bg-card`, `--bg-light`, `--border-light`, shadows and transitions
- **Dark Mode**: CSS `body.dark-mode` selector toggles background, text, border colors; chart colors handled separately in JS
- **Layout**: Flexbox wraps for mobile; media query at 700px for responsive design
- **Card Styling**: `.stats-card` blue/red borders, `.stats-cards-container` grid (2 cols normal, 1 col single-card mode via `.single-card` class)
- **Details Sections**: `.metadata-section` with `.metadata-wrapper` for compare layout (2 cols) or `.single-mode` (1 col)
- **Filters**: `.filter-slider`, `.filter-checkbox-label`, `.filter-mode-toggle` radio groups
- **Tooltips**: `.tag`, `.weakness-tag` with data-tooltip and ::before/::after pseudo-elements
- **Dropdowns**: `.search-dropdown`, `.recent-dropdown`, `.export-menu` with `.hidden` and `.show` classes for visibility

## Data Refresh Workflow
- Use `data/export_data.py`: Input tab-separated rows (level, Pow, Spd, Trick, Recv, Def); set `ability_name`; outputs `pydump.json`
- Merge `pydump.json` into `abilities.json` under correct tier with `assets` (icon path, gif paths) and `_meta` (if applicable)
- Icons/gifs organized as `abilities-assets/{tier}/{ability-name}/{f|r|t|g|passive|icon}/` (f=forward, r=reverse, t=transformation, g=general, passive=passive form)

## Manual Verification Checklist
- Load page; verify data loaded and ability select populated with tiers as optgroups
- Search: Type in search box; verify dropdown appears with matching results; use arrow keys to nav; Enter to select
- Select ability/level; verify stats render, radar updates, progression chart updates
- Toggle amp modes; verify stat values adjust (×1.5 or ÷2)
- Enable compare mode; select second ability/level; verify both radars render, diff table shows deltas
- Test filters: Set power ≥5, apply; verify only qualifying abilities listed
- Click metadata summaries (About, Tags, etc.); verify expand/collapse; switch levels; verify state persists
- Click GIF; verify modal overlay appears with enlarged image
- Dark mode: Click hidden toggle; verify colors invert; reload page; verify dark mode persists
- Export PNG: Verify canvas captured correctly; download triggers
- Share: Verify URL copied; open in new tab; verify state restored
- Phase Shift: Select it; verify dropdown shows form::level values; select different form/level combos; verify correct stats
- Recent: View ability; check recent list updates; click clear to reset
- Favorites: Star abilities; check favorites modal; verify persist across page reload

## Key Implementation Notes
- **Metadata Preservation**: `saveDetailsStates()` and `restoreDetailsStates()` must be called before/after `statsDisplay.innerHTML` update to keep `<details>` open state
- **Phase Shift Parsing**: Split `form::level` values; use first part as form key to access nested `levels[form][level]` structure
- **Compare Grid**: Use `.stats-cards-container.single-card` for single ability (grid-template-columns: 1fr) vs normal 2-column layout
- **Stats Calculation**: Amp mode multipliers applied in `getStats()`; multiply/divide stats before rendering; keep one decimal place
- **URL Params**: ability, level, amp, compare params; shareable links update on every selection via `updateURL()`; parse on load via `loadStateFromURL()`
- **localStorage Keys**: darkMode, ability1, level1, amp1, favorites, recent (prefixed or as arrays); load on init, save on changes
- **Keyboard Navigation**: Search dropdown uses Up/Down/Enter/Escape; other dropdowns use click+outside-click to toggle
- **Accessibility**: Canvas has `aria-label` and `role=img`; form elements have labels with proper `for` attributes; dropdowns have `role=listbox` or `role=menu`

## Conventions & Style
- Keep JSON field names camelCase (Pow, Spd, Trick, Recv, Def); don't rename without updating radar.js logic
- Tier names: use kebab-case in data (Low-Tier, Mid-Tier) but displayed normalized to users
- CSS variables for colors; sync dark mode CSS changes with chart color updates in JS
- Use localStorage for non-critical state (preferences, favorites); URL for shareable state
- Log to console for debugging; keep logs visible during dev, removable in production

## Files & Directories
- `index.html`: UI markup
- `radar.js`: All logic (2100+ lines); event handlers, data fetching, rendering, filtering, export, search
- `styles.css`: All styling (2300+ lines); light & dark mode, responsive layout, component styles
- `abilities.json`: Main data file
- `tags.json`: Tag definitions with emoji and descriptions
- `abilities-assets/{tier}/{ability-name}/`: Icon and GIF assets
- `data/export_data.py`: Spreadsheet-to-JSON converter
- `data/download_images.py`: Tier list icon downloader
- `public/`: Favicons, site manifest, about text
- `LICENSE`: MIT
