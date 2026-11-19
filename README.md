# Welcome Game: Tic-Tac-Toe vs. Me

A welcome game for my GitHub profile. The opponent is me: my photo is the "coin",
so every O on the board is my face, flying in from the opponent card.

- **Frontend:** vanilla HTML/CSS/JS in `public/`
- **Backend:** Node.js + Express (`server.js`), with a minimax AI (easy / medium / hard)
- **Scoreboard:** visitors vs. me, saved in `stats.json`

## Run locally
```bash
npm install
npm start        # http://localhost:3000
```

## Put it on your GitHub profile
GitHub READMEs can't run JavaScript, so host the game and link to it:
1. Push this folder to a repo and deploy it on Render, Railway or Fly.io
   (build: `npm install`, start: `npm start`).
2. In your profile README (`username/username` repo) add a clickable preview:
```md
[![Play me at Tic-Tac-Toe](preview.png)](https://YOUR-DEPLOYED-URL)
```
Take `preview.png` as a screenshot or GIF of the game.

## Ideas
Swap the game for chess with `chess.js` + Stockfish on the server, keeping the same avatar animation.
