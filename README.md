# 🧠 Focus Session Board

> A deep-work dashboard with immersive focus lock — if you leave, it knows.

![Neural Noir UI](https://img.shields.io/badge/UI-Neural%20Noir-00f5d4?style=for-the-badge)
![Built With](https://img.shields.io/badge/Built%20With-React%20%2B%20Vite-7b2fff?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-ffb800?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Active%20Development-ff2d6b?style=for-the-badge)

---

## 📖 Overview

**Focus Session Board** is a web-based deep-work productivity app built for students and developers who want to build real focus habits — not just run a countdown timer.

It combines a **focus timer**, **task management**, **distraction logging**, **session history**, and a unique **Focus Lock Mode** — all in one dark, futuristic command center interface.

The core idea is simple: start a session attached to one task, enter immersive fullscreen, and if you leave fullscreen, the session is automatically marked as interrupted and the reason is logged. This turns attention-breaking into a *measurable behavioral event*.

---

## ✨ Features

### ⏱ Focus Timer
- Countdown timer with presets: **25 min**, **50 min**, or **custom**
- Start, pause, resume, and end session controls
- Animated SVG ring with color that shifts based on time remaining
  - `>50%` remaining → Cyan
  - `25–50%` remaining → Violet
  - `<25%` remaining → Rose (with pulse animation)
- Web Audio API chime on session completion (no external audio files)

### 📋 Task Nexus (Task Management)
- Add tasks with title, optional description, and estimated sessions
- Status tracking: **QUEUE → ACTIVE → DONE**
- One active task per session — intentional single-task focus
- Drag-to-reorder with Framer Motion gesture support
- Filter tasks by status

### ⚡ Focus Lock Mode *(Standout Feature)*
- Enters **fullscreen** via the browser Fullscreen API
- Hides all panels — only timer, active task, and minimal HUD remain
- Detects fullscreen exit via `fullscreenchange` event:
  - User presses `Esc`, switches tabs, or leaves the app
  - Session is **automatically paused**
  - A **"Focus Breach Detected"** modal slides up asking *why* you left
- Falls back to **Page Visibility API** when fullscreen is unavailable (tab switch detection)

### 🚨 Distraction Signal Log
- One-click distraction logging during sessions:
  - 📱 Phone · 💬 Chat · 🌐 New Tab · 🔊 Noise · 💭 Thoughts · ⚡ Other
- **Auto-logged** fullscreen exit events (highlighted in rose)
- Timeline-style feed with timestamps in the right panel
- Live distraction count shown in the session stats bar

### 🛡 Anti-Rage-Quit
- Clicking **END SESSION** before timer completes triggers a warning
- **Hold-to-confirm** button: must hold for 2 seconds to actually end
- Timer ring shakes if you try to quit early
- Encourages commitment to completing the session

### 🎯 Focus Score
- Per-session score from **0 to 100** calculated as:
  - Base score from session completion percentage
  - `-8 pts` per logged distraction
  - `-12 pts` per fullscreen exit
  - `+10 pts` bonus for zero distractions
  - `+10 pts` bonus for full session completion
- Color-coded ring: Cyan (80–100) · Amber (50–79) · Rose (0–49)
- **"Personal Best"** badge on session summary if score beats your record

### 📅 Daily Focus Quota
- Set a daily focus goal: **1h / 2h / 4h / custom**
- Progress bar in the top header fills as sessions complete
- Pulses and shows **"DAILY QUOTA MET ✓"** on completion
- Resets at midnight, goal persists in `localStorage`

### 🔥 Streak System
- Tracks consecutive days with at least one completed session
- **Streak protection alert**: toast notification if your streak is at risk and you haven't focused today
- Auto-dismisses after 6 seconds

### 📊 Focus Heatmap
- GitHub-style contribution calendar showing the last **90 days**
- Cell intensity based on total focus minutes per day:
  - `0 min` → empty
  - `1–30 min` → 25% cyan
  - `31–60 min` → 55% cyan
  - `61–120 min` → 80% cyan
  - `120+ min` → full cyan glow
- Hover tooltip: date + total minutes + session count

### 🗃 Session Archive
- Full history of all sessions stored in `localStorage`
- Each session card shows: date, duration, task, distraction count, notes
- Color-coded distraction count: Green (0) · Amber (1–3) · Red (4+)
- Weekly summary: total focus time, streak, best session badge
- Filter by: **This Week / This Month / By Task**

### 📝 Session Summary
- Post-session modal with: total focus time, distractions, Focus Score, task status
- Optional note: *"What went well?"*
- **Confetti burst** on 0-distraction sessions (canvas-confetti)
- Save to history with one click

---

## 🎨 Design System — Neural Noir

A dark, futuristic **biopunk command center** aesthetic. Think holographic HUD panels, liquid glassmorphism, neon bioluminescence against near-black backgrounds.

### Color Palette

| Variable | Value | Usage |
|----------|-------|-------|
| `--bg-void` | `#04050a` | Base background |
| `--bg-surface` | `#090c14` | Card backgrounds |
| `--bg-elevated` | `#0f1420` | Elevated panels |
| `--neon-cyan` | `#00f5d4` | Primary accent |
| `--neon-violet` | `#7b2fff` | Secondary accent |
| `--neon-amber` | `#ffb800` | Warnings / distractions |
| `--neon-rose` | `#ff2d6b` | Danger / exit events |

### Typography

| Font | Usage |
|------|-------|
| **Orbitron** | Timer digits, headings, labels |
| **DM Mono** | Body text, stats, timestamps |
| **Space Mono** | Metadata, tags |

### Visual Effects
- **Liquid Glassmorphism** — `backdrop-filter: blur(24px)` with gradient borders
- **Animated mesh gradient** — slow-moving radial blobs in background
- **Scanline overlay** — CRT feel at very low opacity
- **Neon glow** — `box-shadow` and `text-shadow` on accent elements
- **Particle field** — floating dots with randomized animations
- **Neon flicker** — keyframe animation on cyan elements

---

## 🛠 Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | React (hooks) + Vite |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Icons | Lucide React |
| Audio | Web Audio API (no external files) |
| Charts | Chart.js / Recharts |
| Confetti | canvas-confetti |
| Music | Spotify Web Playback SDK |
| Storage | localStorage (MVP) |
| Fonts | Google Fonts (Orbitron, DM Mono, Space Mono) |

---

## 🎵 Spotify Integration

Focus Session Board supports **Spotify** so you can control your music without leaving the app.

### Requirements
- A **Spotify Premium** account (required by the Web Playback SDK)
- A Spotify Developer App with your redirect URI configured

### Setup

**1. Create a Spotify App**
- Go to [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
- Click **Create App**
- Set Redirect URI to: `http://localhost:5173/callback`
- Enable: **Web API** + **Web Playback SDK**
- Copy your **Client ID**

**2. Add to `.env`**
```env
VITE_SPOTIFY_CLIENT_ID=your_client_id_here
```

**3. Restart the dev server**
```bash
npm run dev
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm or yarn
- Spotify Premium (for music feature)

### Installation

```bash
# Clone the repository
git clone https://github.com/AtharvaK-XD/focus-session-board.git

# Navigate to the project
cd focus-session-board

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Add your VITE_SPOTIFY_CLIENT_ID to .env

# Start development server
npm run dev
```

Open `http://localhost:5173` in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
focus-session-board/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── TaskNexus/          # Left panel — task management
│   │   ├── FocusCore/          # Center panel — timer + focus lock
│   │   ├── SignalLog/          # Right panel — distraction logging
│   │   ├── SessionArchive/     # Bottom panel — history + heatmap
│   │   ├── Modals/             # Focus Breach, Session Summary
│   │   └── Spotify/            # Spotify player integration
│   ├── hooks/
│   │   ├── useTimer.js         # Timer logic (countdown, intervals)
│   │   ├── useFocusLock.js     # Fullscreen API + breach detection
│   │   ├── useSession.js       # Session state management
│   │   └── useSoundscape.js    # Web Audio API soundscapes
│   ├── utils/
│   │   ├── focusScore.js       # Score calculation logic
│   │   ├── streak.js           # Streak + heatmap calculations
│   │   └── storage.js          # localStorage helpers
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── vite.config.js
├── tailwind.config.js
└── README.md
```

---

## 🤝 Contributing

Contributions are welcome! Here's how:

```bash
# Fork the repo and create your branch
git checkout -b feature/your-feature-name

# Make your changes, then commit
git commit -m "feat: add your feature description"

# Push and open a pull request
git push origin feature/your-feature-name
```

Please follow the existing Neural Noir aesthetic and keep components modular.

---

## 📄 License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) for details.

---

## 👤 Author

**Atharva K**
- GitHub: [@AtharvaK-XD](https://github.com/AtharvaK-XD)
- LinkedIn: [Connect here](https://linkedin.com/in/atharvak-xd)

---

<div align="center">

**Built with 🧠 focus and ⚡ obsession**

*"A deep-work board that shows where your attention goes — immersive focus mode tracks when you leave and why."*

</div>
