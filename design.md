# SpacePoint — Design System

## Reference Sites

### venturi.space → Auth page / Landing hero
- Cinematic dark hero with live countdown timer
- Technical data overlays (coordinates, km distances, mission stats)
- "Ready for launch" / "Take-off" language and framing
- Scrolling horizontal ticker of upcoming missions
- Large Syne 800 display type, uppercase labels in Space Mono
- Subtle grid lines, orbital SVG paths, star field canvas
- Motion: slow reveals, parallax scroll, pulsing data elements

### alpha-wave.ai → Onboarding flow
- Full-screen step transitions (slide or fade between steps)
- Animated word cycling within a sentence ("Augment / Supercharge / Automate")
- Numbered steps: 01 / 02 / 03 with monospace labels
- Progress bar or step indicator at top
- Minimal UI — one focal point per screen
- Clean typography-first layout, no clutter

### aurigaspace.com → Tables, menus, dashboards
- Pure brutalist data tables: all-caps, monospace, thin horizontal dividers only
- Columns: left-heavy label + right utility cols
- Cyan (#00E5FF) highlight row for active/selected state
- No card borders, no shadows — just lines and type
- Black (#0A0A0A) background, #888 default text, #E8E8F0 active text
- [ACTION] links in brackets, right-aligned

---

## Color Tokens

```css
--color-bg:          #04040A;   /* Deep space black */
--color-surface:     #0A0A12;   /* Slightly lifted surface */
--color-border:      rgba(255,255,255,0.07);
--color-border-hover:rgba(255,255,255,0.18);

--color-text-primary:#E8E8F0;
--color-text-muted:  #666680;
--color-text-dim:    #3A3A50;

--color-cyan:        #00E5FF;   /* Primary accent — mission critical */
--color-cyan-glow:   rgba(0,229,255,0.12);
--color-amber:       #FFB800;   /* Secondary accent — warning/highlight */
--color-red:         #FF4D6A;   /* Tertiary — alerts */

--color-table-active:#00E5FF;   /* Brutalist table row highlight */
--color-table-active-text: #04040A;
```

---

## Typography

```css
/* Display — hero titles, section headers */
font-family: 'Syne', sans-serif;
font-weight: 800;
letter-spacing: -0.03em;

/* Labels, tags, mono data, table headers, buttons */
font-family: 'Space Mono', monospace;
font-size: 10–11px;
letter-spacing: 0.14–0.20em;
text-transform: uppercase;

/* Body, descriptions, form fields */
font-family: 'Inter', sans-serif;
font-weight: 300–400;
line-height: 1.7;
```

Google Fonts import:
```
https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Space+Mono:wght@400;700&family=Inter:wght@300;400;500&display=swap
```

---

## Component Patterns

### Brutalist Table (aurigaspace-style)
```
background: #04040A
border: none — only 1px horizontal dividers (rgba(255,255,255,0.07))
header row: Space Mono, 10px, letter-spacing 0.15em, color #444
data rows: Space Mono, 12px, color #888 default
active row: background #00E5FF, color #04040A, all text black
action col: "[READ MORE]" right-aligned, color: inherit
hover row: background rgba(255,255,255,0.03)
```

### Auth Form
```
No card UI — form floats over space background
Inputs: bottom-border only (1px solid rgba(255,255,255,0.12))
  Focus: border-color #00E5FF, subtle glow
Labels: Space Mono 10px uppercase
Submit: full-width, background #00E5FF, color #04040A, Space Mono
Error: red (#FF4D6A) Space Mono below field
```

### Step Indicator (alpha-wave-style)
```
Row of numbered dots: 01 · 02 · 03 · 04
Active: color #00E5FF, scale 1.1
Complete: color #00E5FF, opacity 0.4
Inactive: color #333
Progress line between steps: fills left-to-right with cyan
```

### Buttons
```
Primary:   bg #00E5FF, color #04040A, Space Mono, hover → bg #fff
Ghost:     transparent, border 1px solid rgba(255,255,255,0.12), color #888
           hover → border rgba(255,255,255,0.35), color #E8E8F0
Danger:    bg transparent, border #FF4D6A, color #FF4D6A
All buttons: padding 12–14px 28–32px, no border-radius (0px) or 2px max
```

### Nav
```
Fixed top, height 64px
Logo: SVG orbital mark + "SpacePoint" Syne 700
Links: Space Mono 11px uppercase
Scroll-triggered: backdrop-filter blur(16px) + bg rgba(4,4,10,0.9)
```

---

## Motion Rules

| Element | Animation |
|---|---|
| Hero title | Fade+translateY(20px) on load, 0.6s ease-out |
| Word cycle | Opacity+translateY, 350ms ease in/out |
| Ticker | CSS `translateX` infinite, 30s linear |
| Step transitions | `translateX(40px)` slide + fade, 400ms |
| Countdown | Number flip / odometer feel |
| Star field | Canvas RAF, slow twinkle (opacity sin wave) |
| Table hover | Instant background change, no transition |
| Input focus | 200ms border-color + box-shadow |
| Page entrance | Staggered children with `animation-delay` increments |

---

## Layout Rules

- Max content width: 1200px, centered
- Section padding: 120px vertical, 40px horizontal
- No border-radius on structural elements (0 or 2px max)
- Grid gaps: 2px for brutalist tables, 24px for cards
- Form max-width: 420px

---

## File Conventions

- All new pages: `src/pages/PageName.jsx`
- All components: `src/components/ComponentName.jsx`
- Fonts loaded via index.html `<link>` (not CSS import)
- CSS vars defined in `src/index.css` under `:root`
- Tailwind used for layout utilities only; custom styles inline or via className strings
- No Tailwind for colors/typography — use CSS vars directly
