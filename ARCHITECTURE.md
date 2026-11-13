# Architecture

## Overview

Tracker is a **zero-backend, single-file web application**. All logic, UI, and data handling live in one HTML file (`praktikum-tracker.html`). There is no build step, no bundler, no server.

```
┌─────────────────────────────────────────────────────┐
│                 Browser (user device)               │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │          praktikum-tracker.html             │   │
│  │                                             │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  │   │
│  │  │   i18n   │  │  State   │  │    UI    │  │   │
│  │  │ DE/RU/EN │  │companies │  │ render() │  │   │
│  │  └──────────┘  │blueprint │  └──────────┘  │   │
│  │                │ settings │                │   │
│  │  ┌──────────┐  └──────────┘  ┌──────────┐  │   │
│  │  │   Data   │                │ Security │  │   │
│  │  │  layer   │                │  esc()   │  │   │
│  │  └──────────┘                │   CSP    │  │   │
│  └─────────────────────────────────────────────┘   │
│                      │                             │
│              localStorage / IndexedDB               │
└─────────────────────────────────────────────────────┘
           │                          │
    ┌──────┴──────┐           ┌───────┴──────┐
    │ Gemini API  │           │  GitHub API  │
    │ (AI search) │           │ (Gist sync)  │
    └─────────────┘           └──────────────┘
```

---

## File Structure

```
praktikum-tracker.html   ← entire app (HTML + CSS + JS)
download.html            ← landing page with QR code
index.html               ← redirect → download.html
README.md
ARCHITECTURE.md          ← this file
LICENSE
.github/
  workflows/
    ci.yml               ← automated syntax + security checks
tests/
  core.test.js           ← unit tests for key logic
```

---

## Core Modules (all inside one `<script>` tag)

### i18n
```
I18N = { de: {...}, ru: {...}, en: {...} }
t(key, vars)   → translated string with {{placeholder}} substitution
ob(key)        → same but for onboarding strings
```

### State
```
companies[]    → array of company objects (source of truth)
blueprint[]    → task checklist template
lang           → current language ("de" | "ru" | "en")
geminiKey      → Gemini API key (localStorage)
ghPat          → GitHub PAT (localStorage)
gistId         → ID of sync Gist (localStorage)
activeFilter   → status filter ("all" | "not_sent" | ...)
activePrios    → Set of priority filters ("A" | "B" | "C" | "none" | "nopos")
sortMode       → sort order ("prio" | "sent" | "name")
viewArchive    → boolean, show archive mode
expandedId     → ID of currently open card
_syncLock      → mutex preventing concurrent Gist pushes
```

### Data Layer
```
loadC()        → read companies from localStorage + migrate old fields
saveC()        → write to localStorage + writeToFile() + pushGist()
loadBlueprint()→ read blueprint from localStorage, seed defaults on first run
saveBlueprint()→ write blueprint + push to Gist
mergeCompanies(local, remote) → per-record merge by updatedAt timestamp
```

### Sync (GitHub Gist)
```
buildGistPayload()         → {updatedAt, companies, blueprint, blueprintTs}; never includes geminiKey
pushGist()                 → PATCH gist with current payload (mutex-protected)
pullGist()                 → GET gist, merge, push back if changed
connectGist(pat)           → find or create gist and merge company data
mergeCompanies(local, rem) → union by id, newer updatedAt wins per record
```

### AI (Gemini API)
```
bPrompt(name, prof, loc)   → builds system + user prompt for contact lookup
callGemini(name, prof, loc) → POST to Gemini with Google Search grounding, 30s timeout
aiFill(name, prof, loc)    → calls Gemini 3.5 Flash-Lite for grounded JSON
runAi(...)                 → drives UI state around aiFill()
findDatesAi(name, prof)    → finds application open/deadline dates (unused in current UI)
buildDiscPrompt(...)        → prompt for company discovery (location-strict)
callGeminiDisc(prof, loc, p) → POST to Gemini with Google Search grounding, 45s timeout
```

### Render Pipeline
```
render()         → renderProgress() + renderFilters() + renderList() + applyI18n()
renderProgress() → update progress bar (active companies only)
renderFilters()  → status chips + priority chips + sort chips
renderList()     → getFiltered() → cardHtml() for each result
getFiltered()    → filter by archive/status/search/prio + sort
cardHtml(c)      → returns HTML string for one company card (all user data via esc())
applyI18n()      → set all UI text labels + renderSettings() + renderBlueprintSettings()
```

### File System Autosave
```
initAutosave()   → check if File System Access API available + restore handle from IndexedDB
connectFile()    → showSaveFilePicker → store handle in IndexedDB
writeToFile()    → createWritable → write JSON → close
```

---

## Security Model

| Concern | Mitigation |
|---------|------------|
| XSS | All user data passes through `esc()` before innerHTML. `textContent` used where possible. |
| Token exposure | `ghPat` and `geminiKey` are stored in localStorage only. The Gemini key is never written to a Gist or logged. Both are masked as `type="password"` in UI. |
| CDN tampering | SRI `integrity` hash on QRCode script. jsPDF loaded on demand with SRI support. |
| Clickjacking | CSP `frame-ancestors 'self'` |
| Prototype pollution | JSON.parse results go into known typed variables, never `Object.assign({}, parsed)` spread |
| Race conditions | `_syncLock` mutex prevents concurrent Gist push/pull |
| Import injection | Imported JSON validated and sanitized field-by-field, max 500 entries, max 5MB |
| CSRF | API calls use Authorization header (not cookies) — inherently CSRF-safe |
| External links | All `target="_blank"` have `rel="noopener noreferrer"` |
| Network timeouts | 15s on GitHub API, 30s on Gemini AI, 45s on discovery |

**Known limitations (acceptable for a local personal app):**
- `unsafe-inline` in CSP is required because JS lives inside the HTML file
- localStorage is readable by browser extensions — acceptable for personal use
- PAT has `gist` scope only — minimal permissions

---

## Data Model

```js
Company {
  id: string          // uid() — "c" + base36 timestamp + random
  name: string
  status: "not_sent" | "sent" | "response" | "interview" | "accepted" | "rejected"
  sentDate: string    // ISO date "YYYY-MM-DD"
  profession: string
  priority: "A" | "B" | "C" | ""
  noPosition: boolean
  archived: boolean
  updatedAt: number   // Unix ms — used for Gist merge conflict resolution
  checklist: [{id, label, done}]
  openDate: string    // ISO date
  deadline: string    // ISO date
  datesFromAi: boolean
  datesConfirmed: boolean
  website: string
  phone: string
  contactName: string
  contactRole: string
  email: string
  address: string
  notes: string
}

GistPayload {
  updatedAt: number
  // geminiKey is intentionally not part of the synced payload
  companies: Company[]
  blueprint: string[] // checklist template labels
  blueprintTs: number // timestamp of last blueprint change
}
```

---

## Dependencies

All loaded on-demand from cdnjs.cloudflare.com — **never at startup**:

| Library | Version | Used for | Loaded when |
|---------|---------|----------|-------------|
| jsPDF | 2.5.1 | PDF generation | User clicks PDF button |
| jsPDF-AutoTable | 3.8.2 | Table rendering in PDF | User clicks PDF button |
| QRCode.js | 1.0.0 | QR code generation | Token modal opened / download.html |

No npm, no bundler, no build step.

---

## Onboarding Flow

```
Step 0: Language selection (DE / RU / EN)
    ↓
Step 1: GitHub PAT (optional)
    ├── PAT entered → connectGist() → company data is merged
    └── Skipped → go to Step 2
    ↓
Step 2: Gemini API key
    └── Manual entry → save to localStorage on this device only
    ↓
Step 3: Done → initApp()
```
