# Entomo Solutions Page — Replication Guide

> A comprehensive guide for replicating the Performance Intelligence solution page template across all other Entomo solution pages (Skill & Talent Intelligence, Engagement Intelligence, Workforce Insights, Wellness Intelligence, Strategic Planning).

---

## 1. Page Architecture — Section Order

Every solution page follows this exact section sequence:

| # | Section | Purpose |
|---|---------|---------|
| 1 | **Navigation** | Sticky top bar, shared across all pages |
| 2 | **Hero** | Centered headline + subheadline + CTA |
| 3 | **Persona Section 1 — Leaders** | DIA demo + text (left text, right demo) |
| 4 | **Persona Section 2 — HR Coworker** | WorkWise demo + text (right text, left demo — reversed) |
| 5 | **Agent Marquee** | Scrolling agent cards specific to this solution |
| 6 | **Persona Section 3 — Employees** | Coach demo + text (left text, right demo) |
| 7 | **Features Grid** | Tabbed feature cards |
| 8 | **Bottom CTA** | Dark background, proof points, demo button |
| 9 | **Footer** | Shared across all pages |

---

## 2. Hero Section

### Layout
- **Centered** — all content is center-aligned (`text-align: center; margin: 0 auto`)
- Breadcrumb sits above the headline, also centered
- Max-width container: `860px`

### Headline
- **Font size:** `clamp(36px, 5vw, 68px)` — matches homepage hero exactly
- **All lowercase** (brand signature)
- One or two key words highlighted with the yellow `<mark>` element
- The headline should be **adapted from the current entomo.co website** for that solution, not written from scratch — evolved to fit the new agentic positioning
- Under 10 words

### Subheadline
- **Two parts, on two lines for readability:**
  1. **First sentence:** Why this domain matters to the business (short, punchy, outcome-focused)
  2. **Second sentence:** How entomo achieves it through agentic AI — mention specific capabilities relevant to this solution
- Font size: `18px`, color: `rgba(26,31,38,0.65)`, max-width: `640px`, centered
- Use `<span class="keep-case">AI</span>` to prevent "AI" from becoming lowercase
- **Do NOT use bullet points** — they make it look like a finite list and limit perception

### CTA Button
- Text: "get started →" (lowercase, with arrow)
- Uses gradient CTA style (`linear-gradient(90deg, #f4b223, #e43d30)`)

### Background
- Subtle gradient: `linear-gradient(135deg, rgba(228,61,48,0.04) 0%, rgba(244,178,35,0.06) 40%, rgba(254,251,244,0.6) 100%)`
- Decorative radial gradient orb in top-right

### Key Feedback Applied
- "One short sentence should say why [this domain] matters to the business, and then it should go on to talk about how this is achieved"
- "The subheadline should talk about what is in it for talent architects and HR teams, business leaders, and employees"
- "Keep it short, strong and punchy, while driving the point home"

---

## 3. Persona Sections — The Three-Section Pattern

Each solution page has three persona sections. They follow an alternating layout and each contains an interactive chat demo.

### Section 1: Leaders (DIA Demo)
- **Layout:** Text LEFT, Demo RIGHT (default grid order)
- **Section class:** `.sec-leaders`
- **Eyebrow:** Solution-specific, in section accent color (e.g., "agentic intelligence for leaders")
- **Color theme:** CG Red (`#e43d30`) — applied to DIA avatar, user bubble, agent pills, outcome card gradient, cursor, send button
- **Background:** White (default)
- **Demo type:** Ask DIA

### Section 2: HR Coworker (WorkWise Demo)
- **Layout:** Text RIGHT, Demo LEFT (reversed using `direction: rtl` on `.persona-sec-inner`, with `direction: ltr` on children)
- **Section class:** `.sec-coworker`
- **Eyebrow:** "HR's digital coworker" in Dark Gold (`#b8860b`)
- **Color theme:** Dark Gold for eyebrow, headline span color
- **Background:** White (default)
- **Demo type:** WorkWise

### Section 3: Employees (Coach Demo)
- **Layout:** Text LEFT, Demo RIGHT (default grid order)
- **Section class:** `.sec-employees`
- **Eyebrow:** Solution-specific, in Spanish Blue
- **Color theme:** Spanish Blue (`#0064bf`) — applied to coach elements
- **Background:** Polar White (`#f2f7fc`)
- **Demo type:** Performance Coach

### Text Content Rules (ALL Persona Sections)

**Eyebrow:**
- Positioned INSIDE `.persona-sec-text` div, directly above the headline
- Font: 13px, 700 weight, uppercase, 1.5px letter spacing
- Color varies by section

**Headline:**
- **32px**, bold, lowercase
- One key phrase wrapped in `<span>` with section accent color
- Should describe what the user gets, not what the product does
- Use `<span class="keep-case">AI</span>` wherever "AI" appears

**Description:**
- **Two short sentences maximum** — no bullet points
- First sentence: what this persona gets (the capability/benefit)
- Second sentence: reinforces breadth — "Whatever the [domain] question/workflow, [agent] handles it"
- Font: 16px, line-height 1.65, color: `rgba(26,31,38,0.6)`

**Why no bullet points:**
- "Bullet points are now making it look like the insights that we provide are limited to the ones that are mentioned, which is not true"
- "Is it possible to summarize it in a short sentence?"
- Two flowing sentences convey open-ended capability better than a finite list

---

## 4. Interactive Chat Demos — Three Types

All three demos share these properties:
- Container height: **480px** (all three must match)
- Container: white background, `border-radius: 25px`, subtle shadow
- Structure: topbar → stage/chat area → bottom (chips + input)
- Each runs an **auto-looping animation** with typing effect → send → animated response → pause → reset
- Output should display for **at least 3 seconds** before resetting
- Previous animation phases **must fully disappear** before the output displays (no ghost content in background)
- Each output starts with a **personalized greeting**: "Hi [Name], [context]."

### Demo Type 1: Ask DIA (Leaders Section)

**What it shows:** A leader asking a natural language question and getting an intelligence card with data.

**Structure:**
- Topbar: AI avatar (gradient circle) + "Ask DIA — [Solution Name]" + "workspace" subtitle
- Chat area: Messages stack vertically, `justify-content: flex-end` (content anchored to bottom)
- Messages appear in sequence, accumulate, then all clear before outcome appears clean
- Bottom: 3 prompt chips + input row with cursor + send button

**Animation sequence:**
1. Greeting panel visible (400ms pause)
2. Question types into input field (character by character, 22ms/char)
3. Send button highlights, question appears as right-aligned bubble (red/accent color)
4. "Querying data" phase appears with dark pills (data sources)
5. "Agents analysing" phase appears with accent-colored pills (agent names)
6. All previous messages fade out and collapse
7. Greeting text + outcome card appears on clean canvas
8. Pause 3+ seconds on outcome
9. Fade out, reset, loop

**Outcome card:**
- Gradient background (section accent colors)
- Contains: label, large score number, badge, divider, detail text
- White text on gradient

**Content to customize per solution:**
- Question (what would a leader ask about this domain?)
- Data source pills (what data is being queried?)
- Agent pills (which agents are relevant to this solution?)
- Outcome card (what insight would be returned?)
- Prompt chips at bottom (3 alternative questions)
- Greeting name

### Demo Type 2: WorkWise (HR Coworker Section)

**What it shows:** HR asking the AI coworker to execute a workflow, and getting a structured output.

**Structure:**
- Topbar: WorkWise avatar image + "WorkWise — your digital co-worker"
- Stage with two panels (greeting panel ↔ chat panel), absolutely positioned
- Chat panel class **must include both** `ww-panel` AND `ww-chat-panel` (critical — missing this causes layout bugs)
- Chat panel has: user question bubble (right-aligned, yellow) + response area with sub-stages
- Bottom: 3 workflow chips + input row

**Animation sequence:**
1. Greeting panel: WorkWise avatar, "Hi, I'm WorkWise", description
2. Question types into input (18ms/char)
3. Greeting fades, chat panel appears
4. User question bubble appears (right-aligned, yellow background `#ffda00`, black text)
5. Sub-stage 1: "Assembling your agent team" with dots animation
6. Sub-stage 2: Agent cards with flow arrows (showing 2 agents collaborating)
7. Sub-stage 3: Greeting text + structured output (form card / output card)
8. Pause 3+ seconds
9. Reset to greeting, loop

**Output card (form card style):**
- Greeting: "Hi [Name], your [output] is ready."
- Card with gradient blue header
- Grid layout (2 columns) with label/value pairs
- Represents the completed workflow output

**Sub-stage mechanics (CRITICAL):**
- `.ww-sub` elements use `position: absolute; inset: 0` inside `.ww-response-area` (`position: relative; flex: 1`)
- Only one `.ww-sub.active` is visible at a time
- Output sub needs `align-items: stretch; justify-content: flex-start; text-align: left`
- Inactive subs need `pointer-events: none`

**Content to customize per solution:**
- Question (what workflow would HR want automated?)
- Agent cards (which 2 agents collaborate?)
- Output card fields (what does the completed workflow look like?)
- Workflow chips at bottom (3 alternative workflows)
- Greeting name

### Demo Type 3: Performance Coach (Employees Section)

**What it shows:** An employee asking their personal AI coach a question and getting guidance.

**Structure:**
- Topbar: "AI" avatar circle (blue) + "Your [Solution] Coach"
- Stage with greeting panel ↔ chat panel (same pattern as WorkWise)
- Chat panel class **must include both** `coach-panel` AND `coach-chat-panel`
- Sub-stages: thinking → response
- Bottom: 3 question chips + input row

**Animation sequence:**
1. Greeting panel: "Hi, I'm your [Solution] Coach" + description
2. Question types into input (18ms/char)
3. Chat panel appears with user question (right-aligned, blue bubble `#0064bf`, white text)
4. "Analysing your goals and progress..." thinking phase with dots
5. Greeting + bullet-point response with action buttons
6. Pause 3+ seconds
7. Reset, loop

**Response format:**
- Greeting: "Hi [Name], here's your [context]."
- **Bullet points** with bold labels (e.g., "Progress:", "Focus:", "Watch:")
- Custom dot bullets (6px blue circles, `::before` pseudo-element)
- Font: 12.5px, line-height 1.55
- Action buttons row at bottom: primary filled button + outlined button
- Background: `rgba(0,100,191,0.05)`, rounded 14px

**Content to customize per solution:**
- Question (what would an employee ask?)
- Thinking text (what is being analyzed?)
- Bullet points (what guidance/insights?)
- Action buttons (what can the employee do next?)
- Question chips at bottom
- Greeting name

---

## 5. Agent Marquee Section

Placed **between the HR Coworker section and the Employees section**.

### Layout
- Background: Floral White (`#fefbf4`)
- Centered eyebrow + headline
- Eyebrow: "Your AI workforce for [solution domain]"
- Headline: "meet the [solution] <mark>agents</mark> that work for you" — "agents" highlighted in yellow mark
- Infinite horizontal scroll, 22s duration, pauses on hover
- Fade gradients on left and right edges (matching floral-white background)

### Agent Cards
- Width: **300px** (larger than homepage's 220px because fewer cards per solution)
- Content: Agent image (60px, rounded 14px) + name (20px bold) + role label (11px uppercase) + description (14px, 2 lines)
- White background, subtle border, rounded 15px
- Hover: lift up 4px with shadow

### Seamless Loop
- Duplicate all cards in HTML (two copies of the set)
- CSS `translateX(-50%)` animation creates infinite seamless scroll
- Track uses `display: flex; gap: 1.5rem; width: max-content`

### Content to customize per solution:
- Which agents are relevant (typically 4-6 from the full agent roster)
- Agent descriptions specific to this solution context

---

## 6. Features Grid Section

### Layout
- Background: Floral White (`#fefbf4`)
- Centered eyebrow ("capabilities") + headline
- Headline pattern: "everything [solution domain] needs. nothing it doesn't."
- Tabbed interface with pill-shaped tabs

### Tabs
- Rounded pill buttons (30px radius)
- Active tab: CG Red background, white text
- Hover: red border and text
- Each tab reveals a different feature grid panel

### Feature Cards
- 3-column grid (2 on tablet, 1 on mobile)
- White background, 25px radius, subtle border
- Each card: icon (40px, red-tinted background, line-art SVG) + title (15px bold lowercase) + description (13.5px)
- Hover: lift 2px with shadow

### Content to customize per solution:
- Tab categories (2-3 tabs relevant to this solution)
- Feature cards per tab (6-9 cards each)
- Feature descriptions connecting to human outcomes, not just listing capabilities

---

## 7. Bottom CTA Section

- Background: Ebony Clay (dark, `#1a1f26`) with radial gradient orb (red, subtle)
- Centered headline: "ready to [solution-specific action]?" with `<mark>` highlight on key word
- Proof line: "Join the enterprises powering 30M+ users... Forrester-validated: $26.8M in value, 103% ROI over 3 years."
- CTA button: "request a demo →" (larger variant: 18px, more padding)

---

## 8. Writing Rules — Quick Reference

### What to do:
- All text lowercase (headings, buttons, nav, eyebrows) — brand signature
- Headlines are conclusions, not descriptions — under 10 words
- Lead with outcome, not mechanism
- Two sentences per persona description — no more
- Use active verbs: coaches, surfaces, nudges, adapts, anticipates, guides
- Mention specific capabilities naturally within sentences
- "So what?" test every sentence

### What NOT to do:
- **No bullet points in persona sections** — they limit perception of capability breadth
- **No agent tags/labels** in persona text — removes clutter
- Don't use: helps, enables, allows, facilitates, provides, empowers
- Don't use: solution, module, dashboard, best-in-class, cutting-edge
- Don't hedge: "can coach" → "coaches"
- Don't front-load company perspective: "Your employees receive..." not "entomo provides..."
- Don't save proof for the bottom — weave throughout

### The "AI" capitalization fix:
CSS `text-transform: lowercase` forces "AI" to render as "ai". Fix with:
```html
<span class="keep-case">AI</span>
```
```css
.keep-case { text-transform: none !important; }
```
Apply this **everywhere** "AI" appears in lowercased headings, eyebrows, and buttons.

---

## 9. CSS Color Theming Per Section

Each persona section has color overrides. Here's the pattern:

### Leaders section (CG Red theme):
```css
.sec-leaders .persona-sec-text h2 span { color: var(--cg-red); }
.sec-leaders .dia-avatar { background: linear-gradient(135deg, #e43d30, #f4b223); }
.sec-leaders .dia-user-q span { background: #e43d30; }
.sec-leaders .dia-phase-dot.agents { background: rgba(228,61,48,0.1); }
.sec-leaders .dia-phase-pill.blue { background: rgba(228,61,48,0.07); color: rgba(228,61,48,0.6); }
.sec-leaders .dia-outcome { background: linear-gradient(135deg, #e43d30, #f4b223); }
.sec-leaders .dia-dots span { background: #e43d30; }
.sec-leaders .dia-send-btn { background: #e43d30; }
.sec-leaders .dia-cursor { background: #e43d30; }
```

### Coworker section (Dark Gold theme):
```css
.sec-coworker .persona-sec-text h2 span { color: #b8860b; }
/* WorkWise uses default blue styling — no overrides needed */
```

### Employees section (Spanish Blue theme):
```css
.sec-employees { background: var(--polar-white); }
.sec-employees .persona-sec-text h2 span { color: var(--spanish-blue); }
/* Coach uses default blue styling */
```

---

## 10. Technical Implementation Notes

### Single-file HTML
Each solution page is a **single self-contained HTML file** with embedded CSS (in `<style>`) and JS (in `<script>` blocks at the bottom). No external CSS or JS files.

### Three independent animation loops
Each demo has its own IIFE `<script>` block. They run independently and don't interfere with each other. Use unique ID prefixes per page to avoid conflicts:
- DIA: `pdia` prefix (e.g., `pdiaQ`, `pdiaFoundation`, `pdiaAgents`, `pdiaOutcome`)
- WorkWise: `pww` prefix (e.g., `pwwPanelGreet`, `pwwPanelChat`, `pwwSubAssemble`)
- Coach: `pcoach` prefix (e.g., `pcoachPanelGreet`, `pcoachPanelChat`, `pcoachSubThink`)

For other solution pages, you can reuse these same prefixes since each page is a separate file.

### DIA message collapse/expand pattern
Hidden messages use `max-height: 0; overflow: hidden; margin-bottom: 0; opacity: 0`. Shown messages transition to `max-height: 350px; margin-bottom: 12px; opacity: 1`. This allows messages to accumulate naturally and push earlier content upward and out of view.

### Panel/sub-stage pattern (WorkWise & Coach)
- `.ww-stage` / `.coach-stage`: `position: relative; flex: 1; overflow: hidden`
- `.ww-panel` / `.coach-panel`: `position: absolute; inset: 0` — greeting and chat panels overlay each other
- `.ww-sub` / `.coach-sub`: `position: absolute; inset: 0` inside response area — sub-stages overlay each other
- Toggle with `.active` class (adds `opacity: 1; transform: translateY(0)`)

### Grid layout for persona sections
```css
.persona-sec-inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3.5rem;
  align-items: center;
}
```
For the reversed (coworker) section, use `direction: rtl` on the grid container and `direction: ltr` on children.

### Responsive breakpoints
- `900px`: Persona grid collapses to single column; features grid to 2 columns
- `768px`: Section padding reduces; hero headline uses `clamp()` for fluid sizing
- `600px`: Features grid to single column

---

## 11. Content Template — What to Prepare for Each Solution Page

Before building a new solution page, prepare these content pieces:

### Hero
- [ ] Headline (adapted from current entomo.co, evolved for agentic positioning)
- [ ] Keyword to highlight in yellow `<mark>`
- [ ] Subheadline sentence 1: Why this domain matters
- [ ] Subheadline sentence 2: How agentic AI delivers it

### Leaders Section (DIA Demo)
- [ ] Eyebrow text
- [ ] Headline (what leaders get — action-oriented)
- [ ] Headline keyword to color in accent
- [ ] Description: 2 sentences (capability + breadth)
- [ ] DIA question (what would a leader ask?)
- [ ] Data source pills (4 items)
- [ ] Agent pills (3 items)
- [ ] Outcome card: label, score/metric, badge text, detail paragraph
- [ ] Greeting: "Hi [Name], [context]."
- [ ] 3 prompt chips

### HR Coworker Section (WorkWise Demo)
- [ ] Eyebrow: "HR's digital coworker"
- [ ] Headline (what HR gets — "Get your AI Coworker to..." pattern)
- [ ] Headline keyword to color in accent
- [ ] Description: 2 sentences (capability + breadth)
- [ ] WorkWise question (what workflow would HR want?)
- [ ] 2 collaborating agents (names, images, role descriptions)
- [ ] Output card: header title, 6 field label/value pairs
- [ ] Greeting: "Hi [Name], your [output] is ready."
- [ ] 3 workflow chips

### Agent Marquee
- [ ] Eyebrow: "Your AI workforce for [domain]"
- [ ] 4-6 agents relevant to this solution (name, role label, description)

### Employees Section (Coach Demo)
- [ ] Eyebrow text
- [ ] Headline (what employees get — in the flow of work)
- [ ] Headline keyword to color in blue
- [ ] Description: 2 sentences
- [ ] Coach question (what would an employee ask?)
- [ ] Thinking phase text
- [ ] 4 bullet points with bold labels
- [ ] 2 action buttons (primary + outline)
- [ ] Greeting: "Hi [Name], here's your [context]."
- [ ] 3 question chips

### Features Grid
- [ ] Headline: "everything [domain] needs. nothing it doesn't."
- [ ] 2-3 tab categories
- [ ] 6-9 feature cards per tab (icon, title, description connecting to outcome)

### Bottom CTA
- [ ] Headline with `<mark>` highlight
- [ ] Proof line (can reuse standard Forrester stats)

---

## 12. Common Mistakes to Avoid

1. **Missing `ww-chat-panel` or `coach-chat-panel` class** on chat panel divs — causes output not to display and chat bubble misalignment (base panel has `align-items: center` which must be overridden)
2. **"AI" rendering as lowercase** — always wrap in `<span class="keep-case">AI</span>`
3. **Ghost content behind output** — previous animation phases must fully fade out and collapse before output appears
4. **Bullet points in persona descriptions** — creates perception of limited capability; use 2 flowing sentences instead
5. **Demo heights not matching** — all three demos must be exactly 480px
6. **Output disappearing too quickly** — ensure at least 3 seconds of display time before reset
7. **Chat bubble on wrong side** — user messages RIGHT-aligned (yellow for WorkWise, blue for Coach, red for DIA), bot responses LEFT-aligned
8. **Eyebrow outside persona-sec-text** — must be INSIDE the text column div, directly above the headline
9. **Features without outcome connection** — every feature description must link to a human outcome
10. **Using "helps", "enables", "provides"** — use active verbs that show the platform acting autonomously
