# VRUDHSEVA (वृद्धसेवा) 🌿
### Digital Identification, Assistive Care Support & Family Tracing Platform for Old-Age Homes

> *"No elderly person should be left unidentified, unheard, or uncared for."*

---

## 📌 Overview
**VRUDHSEVA** is a community-oriented digital care-support and identification system conceived through field research at **Madhurangan Old Age Home (Shankarpur, Khapri, Nagpur)**. The project addresses the critical realities of elderly care, specifically focusing on dementia residents, police rescue of unidentified wandering seniors, non-verbal emergency communication, medication tracking, and family tracing.

---

## 🚀 Key Modules & Dynamic Features
1. **SevaBot — AI Dementia & Elder Care Assistant**: Intelligent 24/7 conversational advisor powered by the **Groq API** (`qwen/qwen3.8-27b`). Provides empathetic, evidence-informed guidance on memory decline, handling repetitive questioning, sundowning agitation, safe wandering management, communication barriers, and caregiver burnout in **English, Hindi, and Marathi**. Available both as an in-page interactive portal and as a floating drawer anywhere on the site.
2. **Unidentified Person Registry & Search**: Live photo records, physical descriptors, discovery locations, police station diary references, and status tracking (*Searching*, *Under Verification*, *Reunified*).
3. **Low-Interaction Emergency Access Mode**: Large-button visual switchboards, single-switch auto-scanning, and Web Audio synthesized alert chimes logged directly to the caregiver alert queue.
4. **Shift-Wise Medication Tracker**: Live schedule tracking (*Given*, *Delayed*, *Missed*), dynamic adherence calculation, and caregiver note recording.
5. **Staff Handover Log**: Structured shift-to-shift documentation of nutritional intake, resident mood/behavior, sleep continuity, and pending clinical tasks.
6. **Verified Material Donations**: Dynamic fulfillment trackers for essential supplies with real-time pledging.
7. **Volunteer & Family Coordination**: Slot-based community volunteer registration and verified communication channels.
8. **QR Quick ID Wristbands**: Emergency contact tags without exposing sensitive medical history.
9. **Trilingual Localization**: Native dynamic localization for **English**, **Hindi (हिंदी)**, and **Marathi (मराठी)**.

---

## 🤖 SevaBot AI Query Assistant (Groq Cloud)
- **Model**: `qwen/qwen3.8-27b` (ultra-fast low-latency inference on Groq LPUs, with fallback support)
- **Endpoints**:
  - `POST /api/chat`: Accepts `{ message, history }` and returns structured caregiving guidance.
  - `GET /api/chat/status`: Returns provider and active model status.
- **Multilingual Context**: Responds fluently in English, Hindi (हिंदी), and Marathi (मराठी).
- **Configuration**: Uses `GROQ_API_KEY` from `.env` or system environment.

---

## 🛠️ Full-Stack Architecture
- **Backend**: Node.js v25 + Express REST API server (`server/server.js`)
- **Database**: Built-in `node:sqlite` database (`server/db.js`) with WAL mode, schema auto-initialization, and realistic initial seed data from Madhurangan Old Age Home.
- **Frontend**: Accessible semantic UI (`index.html` + `app.js`) with real-time API sync and automatic offline fallback mode.
- **Live Status Indicator**: Visual API connection pill in the navbar (`🟢 API Connected` / `🟡 Local Mode`).

---

## 💻 Running the Application

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Test Suite
Runs all 17 backend API unit tests and frontend asset E2E integration checks:
```bash
npm test
```

### 3. Start the Server
```bash
npm start
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser to access the complete live application.

---

## 📖 Complete Documentation
For full system analysis, field visit synthesis, and production roadmap:
📄 **[VRUDHSEVA Project Analysis & System Architecture Report](VRUDHSEVA_PROJECT_REPORT.md)**
