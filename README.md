# 🎓 Praktikum Tracker

A lightweight, offline-first Ferialpraktikum tracker built by an HTL Donaustadt student — for HTL students.  
No server. No account. No install. Just one HTML file.

---

## ✨ Features

- **Company list** — website, phone, email, contact person, address
- **AI autofill** — Groq AI searches contact details automatically based on company name + your profession
- **Application status** — Not sent → Sent → Response → Interview → Accepted / Rejected
- **Priority system** — A / B / C + mark companies with no open positions
- **Profession field** — specify your field (e.g. Electrical Engineering, IT) so the AI searches the right contacts
- **3 languages** — Deutsch 🇦🇹 · Русский 🇷🇺 · English 🇬🇧
- **Auto-save to disk** — File System Access API (Chrome / Edge)
- **Export / Import** — JSON backup anytime
- **Rate limit display** — see remaining AI requests directly in the UI
- **100% local** — no server, no cloud, everything stays in your browser

---

## 🚀 Quick Start

1. Open the link (or download `praktikum-tracker.html` and double-click it)
2. Choose your language
3. Get a free Groq API key at [console.groq.com/keys](https://console.groq.com/keys) — no credit card needed
4. Paste the key and click Start
5. Add your first company

> Each person uses their **own** API key. Keys never leave your device.

---

## 🤖 AI / Groq

- Model: `compound-beta-mini` (with live web search) → fallback to `llama-3.3-70b`
- The AI uses your **profession** to find the right internship contact at each company
- Daily request limit shown live in the app
- Free tier is enough for normal use

---

## 💾 Data & Storage

| What | How |
|------|-----|
| Company list | `localStorage` (browser) |
| Auto-save to disk | File System Access API + IndexedDB (Chrome/Edge only) |
| API key | `localStorage` — stays on your device only |
| Sync | Export/Import JSON manually |

---

## 🛠 Tech

Vanilla HTML + CSS + JS. Single file. No framework, no build step, no dependencies.

---

## 📄 License

Private school project · HTL Donaustadt Wien · Ferialpraktikum
