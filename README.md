# 📋 Tracker

A lightweight, offline-first application tracker — for internships, jobs, or any opportunity, anywhere in the world.
No server. No account required. One HTML file.

---

## ✨ Features

**Core**
- Track companies / employers with full contact details
- Application status — Not sent → Sent → Response → Interview → Accepted / Rejected
- Priority system — A / B / C + mark positions with no openings
- Task checklist per company — customizable blueprint applied automatically to new entries
- Archive — hide rejected/irrelevant companies without deleting them
- Sent-ago counter — see how long since you applied

**AI (powered by Groq)**
- Auto-fill contact details by company name + location + profession
- Discover new companies in any city or region worldwide
- Each user brings their own free Groq API key — nothing is shared

**Sync & Storage**
- All data stored locally in the browser (localStorage)
- Optional GitHub Gist sync — same data on PC and phone, smart per-record merge
- Auto-save to disk — File System Access API (Chrome / Edge)
- Export / Import JSON backup anytime

**Other**
- PDF export — styled table ready to print or show to a teacher
- 3 languages — Deutsch 🇦🇹 · Русский 🇷🇺 · English 🇬🇧 (switch anytime)
- PWA — add to home screen on mobile, works offline
- Task blueprint — set up your checklist template once in Settings, applied to every new company automatically

---

## 🚀 Quick Start

1. Open the link (or download `praktikum-tracker.html` and double-click it)
2. Choose your language
3. *(Optional)* Connect GitHub for sync across devices
4. Get a free Groq API key at [console.groq.com/keys](https://console.groq.com/keys) — no credit card needed
5. Add your first company and click **✨ Find data with AI**

> Each person uses their **own** API key. Keys never leave your device.

---

## 🔄 Sync (PC ↔ Phone)

1. Go to [github.com/settings/tokens/new?scopes=gist](https://github.com/settings/tokens/new?scopes=gist&description=Tracker)
2. Create a token with only the **gist** scope
3. Paste it in the app on both devices
4. Data merges automatically — per-record, no overwrites

---

## 📋 Task Blueprint

In **Settings → Task Blueprint** you can define your own checklist template.
Every new company gets these tasks automatically. For existing companies, open the task section and click **↻ Apply blueprint**.

---

## 📄 PDF Export

Click **📄 PDF** in the top bar to download a styled table with all companies, statuses, priorities, contacts, task progress and notes. Landscape A4, ready to print.

---

## 🛠 Tech

| What | How |
|------|-----|
| Storage | `localStorage` |
| Sync | GitHub Gist API |
| Disk auto-save | File System Access API + IndexedDB |
| AI | Groq REST API (`compound-beta-mini` with web search) |
| PDF | jsPDF + AutoTable (loaded on demand from cdnjs) |
| Languages | Built-in i18n (DE / RU / EN) |
| Framework | None — vanilla HTML + CSS + JS, single file |

---

## 🔒 Security

- API keys stored in `localStorage` only — never sent anywhere except the intended API endpoints
- Token input fields are masked (password type) with show/hide toggle
- Content-Security-Policy header restricts script and network sources
- All external links use `rel="noopener noreferrer"`
- All user data rendered through an HTML-escaping function

---

## 📄 License

Personal project · Made by an HTL Donaustadt student
