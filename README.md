# 🎮 Play-with-me: Tic-Tac-Toe vs. Me

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-20+-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![CSS3](https://img.shields.io/badge/CSS3-Glassmorphism-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

<p align="center">
  <strong>An interactive, sleek Tic-Tac-Toe welcome game built for GitHub profiles.</strong><br>
  Play against my avatar AI powered by a Minimax algorithm. Can you beat me on Hard mode?
</p>

</div>

---

## 🌟 Highlights

- 🤖 **Minimax AI Opponent:** Plays dynamically across **Easy**, **Medium**, and **Hard** (mathematically unbeatable unless mistakes are allowed).
- 🪙 **Animated Avatar Coin:** My photo is the opponent's piece (`O`). Whenever the AI makes a move, the coin animates and flies from the opponent card directly onto the chosen board cell.
- 💎 **Atmospheric Glassmorphic UI:** Deep space obsidian theme with layered radiant glows, dot-matrix grid overlay, and translucent frosted glass cards.
- 🕹️ **Interactive 3D Tilt:** Smooth 3D perspective mouse-tracking tilt effect on desktop.
- 🏆 **Hard-Mode Victory Verification Portal:**
  - **Strictly applicable only for Hard level victories.**
  - When a visitor beats the AI on Hard, the verification portal unlocks.
  - Visitors can submit their **Name**, **Gmail account**, and **winning match screenshot**.
  - Automatically prepares a direct verification message to the host with instant clipboard screenshot paste support (`Ctrl+V`).
- 📊 **Persistent Scoreboard:** Tracks visitor wins, avatar wins, and draws in `stats.json`.

---

## 🖥️ Preview & Gameplay

| Player (`X`) | Opponent (`O`) | Challenge |
| :---: | :---: | :---: |
| Visitor | Host Avatar | Beat the AI on **Hard** to unlock verification |

```
 ┌───┬───┬───┐
 │ X │ O │ X │
 ├───┼───┼───┤   ← Fly-in avatar coin animations
 │ O │ X │ O │
 ├───┼───┼───┤   ← Minimax AI decision tree
 │ O │   │ X │
 └───┴───┴───┘
```

---

## 📁 Project Structure

```text
welcome-game/
├── public/
│   ├── index.html       # Responsive 2-column layout (Game + Verification Portal)
│   ├── style.css        # Glassmorphism styling, ambient aura, 3D tilt effects
│   ├── app.js           # Client game logic, animations, file upload & verification
│   └── avatar.jpg       # Opponent avatar coin asset
├── server.js            # Express API, Minimax AI engine & verification handler
├── package.json         # Project metadata and dependencies
├── stats.json           # Scoreboard persistence (visitors, me, draws)
├── verifications.json   # Recorded Hard-mode victory submissions
└── README.md            # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- `npm` (bundled with Node.js)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Aswinsk-2103/Play-with-me.git
   cd Play-with-me
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local server:**
   ```bash
   npm start
   ```

4. **Play the game:**
   Open your browser and navigate to:
   ```text
   http://localhost:3000
   ```

---

## ⚙️ Configuration & Environment (Optional)

To enable direct automated SMTP email dispatch for victory verifications, you can configure environment variables:

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Port the Express server listens on | `3000` |
| `GMAIL_USER` | Host Gmail account for sending verification emails | `skaswin763@gmail.com` |
| `GMAIL_APP_PASS` | Google Account App Password (16-character) | *Optional* |

*Note: Even without SMTP credentials, verification submissions are logged to `verifications.json`, forwarded via FormSubmit, and opened directly in the visitor's Gmail draft.*

---

## 🌐 Deploy to Production

You can deploy this game for free to embed it on your GitHub profile:

### Option 1: Render
1. Push this repository to GitHub.
2. Sign in to [Render](https://render.com/) and create a new **Web Service**.
3. Select your repository:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Deploy!

### Option 2: Railway
1. Sign in to [Railway](https://railway.app/).
2. Select **Deploy from GitHub repo**.
3. Railway automatically detects Node.js and starts `server.js`.

---

## 📌 Embed on Your GitHub Profile

GitHub README markdown files cannot execute JavaScript directly, but you can add a banner linking directly to your live game:

```markdown
### 🎮 Think you can beat me?
Play Tic-Tac-Toe against my avatar:

[![Play with Me](https://raw.githubusercontent.com/Aswinsk-2103/Play-with-me/main/public/avatar.jpg)](https://YOUR-DEPLOYED-URL)

👉 **[Click here to play](https://YOUR-DEPLOYED-URL)** — Win on Hard mode to claim victory verification!
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/move` | Evaluates visitor move, runs Minimax AI, and returns best reply. |
| `GET` | `/api/stats` | Returns current match stats (visitor wins, host wins, draws). |
| `POST` | `/api/verify` | Accepts winner name, email, and screenshot (strictly enforces Hard mode). |
| `GET` | `/api/verifications` | Returns sanitized list of verified submissions. |

---

## 🧠 AI Algorithm Details

The AI opponent uses the **Minimax** algorithm:
- Evaluates all possible future board states recursively.
- Assigns scores: `+10 - depth` for AI win, `depth - 10` for Player win, `0` for draw.
- **Difficulty tuning:**
  - **Hard:** 0% error rate (optimal Minimax, mathematically unbeatable).
  - **Medium:** 25% chance of making a random move.
  - **Easy:** 60% chance of making a random move.

---

## 👤 Author

- **GitHub:** [@Aswinsk-2103](https://github.com/Aswinsk-2103)
- **Email:** [skaswin763@gmail.com](mailto:skaswin763@gmail.com)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE). Feel free to fork, customize, and feature it on your own profile!
