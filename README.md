# 🎓 Praktikum Tracker

Ein lokaler Ferialpraktikum-Tracker für HTL-Schüler – entwickelt von einem HTL-Donaustadt-Schüler.  
Локальный трекер заявок на практику для учеников HTL – сделан учеником HTL Donaustadt.

---

## ✨ Features

- **Firmen verwalten** · Компании с контактными Daten (Sайт, Telefon, E-Mail, Ansprechperson)
- **KI-Autofill** · ИИ сам ищет контактные данные через Groq API (бесплатно)
- **Bewerbungsstatus** · Статус заявки: Nicht gesendet → Gesendet → Antwort → Interview → Angenommen / Abgelehnt
- **Prioritäten** · Приоритет A / B / C, отметка «нет открытой позиции»
- **Beruf / Fachrichtung** · Профессия указывается при добавлении — ИИ ищет именно под эту специальность
- **3 Sprachen** · Deutsch 🇦🇹 · Русский 🇷🇺 · English 🇬🇧
- **Автосохранение на диск** · File System Access API (Chrome / Edge)
- **Export / Import** · JSON-Backup jederzeit möglich
- **100% lokal** · Keine Server, keine Cloud — alles im Browser

---

## 🚀 Setup (1 Minute)

1. **Datei herunterladen** – `praktikum-tracker.html` runterladen
2. **Doppelklick** – direkt im Browser öffnen (Chrome oder Edge empfohlen)
3. **Sprache wählen** – DE / RU / EN
4. **Groq API-Key eingeben** – kostenlos unter [console.groq.com/keys](https://console.groq.com/keys) (kein Kreditkarte nötig)
5. **Loslegen!**

> ⚠️ Репозиторий должен быть **Private** — в приложении хранится логика ввода API-ключа.

---

## 🤖 KI / ИИ (Groq API)

Das App nutzt **Groq** (kostenloser Tier) für die KI-Datensuche.

- Modell: `compound-beta-mini` (mit Websuche) → Fallback auf `llama-3.3-70b`
- Jeder Nutzer gibt seinen **eigenen** API-Key ein → bleibt nur auf seinem Gerät
- Tageslimit sichtbar direkt im Interface

---

## 📁 Struktur

```
praktikum-tracker.html   ← die ganze App (eine einzige Datei)
README.md
```

Alles in einer HTML-Datei – kein Build-System, kein npm, kein Server.

---

## 🛠 Technik

| Was | Wie |
|-----|-----|
| Speicherung | `localStorage` (Browser) |
| Autosave auf Disk | File System Access API + IndexedDB |
| KI | Groq REST API (fetch) |
| Sprachen | Eingebautes i18n-Objekt (DE/RU/EN) |
| Styling | Vanilla CSS, Custom Properties |
| Framework | Kein Framework – Vanilla JS |

---

## 📸 Screenshot

> *(Hier Screenshot einfügen nach dem ersten Start)*

---

## 📄 Lizenz

Privates Schulprojekt – HTL Donaustadt Wien · Ferialpraktikum 2025
