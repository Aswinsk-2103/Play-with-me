const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json({ limit: '20mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const dataDir = process.env.VERCEL ? '/tmp' : __dirname;
const STATS_FILE = path.join(dataDir, 'stats.json');
const VERIFY_FILE = path.join(dataDir, 'verifications.json');

const readStats = () => {
  try { return JSON.parse(fs.readFileSync(STATS_FILE, 'utf8')); }
  catch { return { visitors: 0, me: 0, draws: 0 }; }
};
const writeStats = (s) => {
  try { fs.writeFileSync(STATS_FILE, JSON.stringify(s)); }
  catch (e) { console.warn('Stats write warning:', e.message); }
};

const readVerifications = () => {
  try { return JSON.parse(fs.readFileSync(VERIFY_FILE, 'utf8')); }
  catch { return []; }
};
const writeVerifications = (v) => {
  try { fs.writeFileSync(VERIFY_FILE, JSON.stringify(v, null, 2)); }
  catch (e) { console.warn('Verifications write warning:', e.message); }
};

// ---- Game logic: visitor = 'X', avatar (me) = 'O' ----
const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

function result(b) {
  for (const line of LINES) {
    const [a, c, d] = line;
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return { winner: b[a], line };
  }
  return b.every(Boolean) ? { winner: 'draw', line: null } : null;
}

function minimax(b, turn, depth) {
  const r = result(b);
  if (r) return r.winner === 'O' ? 10 - depth : r.winner === 'X' ? depth - 10 : 0;
  let best = turn === 'O' ? -Infinity : Infinity;
  for (let i = 0; i < 9; i++) {
    if (b[i]) continue;
    b[i] = turn;
    const s = minimax(b, turn === 'O' ? 'X' : 'O', depth + 1);
    b[i] = null;
    best = turn === 'O' ? Math.max(best, s) : Math.min(best, s);
  }
  return best;
}

function pickMove(b, level) {
  const free = b.map((v, i) => (v ? null : i)).filter((i) => i !== null);
  const mistakeChance = { easy: 0.6, medium: 0.25, hard: 0 }[level] ?? 0;
  if (Math.random() < mistakeChance) return free[Math.floor(Math.random() * free.length)];
  let bestMove = free[0], bestScore = -Infinity;
  for (const i of free) {
    b[i] = 'O';
    const s = minimax(b, 'X', 1);
    b[i] = null;
    if (s > bestScore) { bestScore = s; bestMove = i; }
  }
  return bestMove;
}

const validBoard = (b) =>
  Array.isArray(b) && b.length === 9 && b.every((v) => v === null || v === 'X' || v === 'O');

function record(winner) {
  const s = readStats();
  if (winner === 'X') s.visitors++;
  else if (winner === 'O') s.me++;
  else s.draws++;
  writeStats(s);
}

// ---- API ----
// Visitor has just played. Server checks the board, then the avatar replies.
app.post('/api/move', (req, res) => {
  const { board, level } = req.body || {};
  if (!validBoard(board)) return res.status(400).json({ error: 'Invalid board' });

  let r = result(board);
  if (r) { record(r.winner); return res.json({ move: null, ...r }); }

  const move = pickMove([...board], level);
  const next = [...board];
  next[move] = 'O';
  r = result(next);
  if (r) record(r.winner);
  res.json({ move, winner: r ? r.winner : null, line: r ? r.line : null });
});

const nodemailer = require('nodemailer');

app.get('/api/stats', (_req, res) => res.json(readStats()));

// Verification submission for winners: dispatches to skaswin763@gmail.com
app.post('/api/verify', async (req, res) => {
  const { name, email, screenshot, difficulty } = req.body || {};
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and Gmail address are required.' });
  }

  // Strictly enforce Hard level match requirement
  if (difficulty !== 'hard') {
    return res.status(400).json({
      error: 'Verification is strictly applicable only for victories on Hard level matches!'
    });
  }

  const list = readVerifications();
  const entry = {
    id: Date.now().toString(),
    name: String(name).trim(),
    email: String(email).trim(),
    difficulty: difficulty || 'hard',
    hasScreenshot: Boolean(screenshot),
    screenshot: screenshot || null,
    submittedAt: new Date().toISOString(),
    recipient: 'skaswin763@gmail.com'
  };
  list.unshift(entry);
  writeVerifications(list);

  console.log(`[Verification] New victory submission from ${entry.name} (${entry.email}) to skaswin763@gmail.com`);

  // 1. If Gmail App Password configured, send directly via SMTP
  if (process.env.GMAIL_APP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER || 'skaswin763@gmail.com',
          pass: process.env.GMAIL_APP_PASS
        }
      });
      const mailOptions = {
        from: `"${entry.name}" <${process.env.GMAIL_USER || 'skaswin763@gmail.com'}>`,
        replyTo: entry.email,
        to: 'skaswin763@gmail.com',
        subject: `🏆 Tic-Tac-Toe Victory Proof from ${entry.name}`,
        text: `Victory Verification Message:\n\nWinner: ${entry.name}\nGmail: ${entry.email}\nDifficulty: ${entry.difficulty}\nTime: ${entry.submittedAt}\n\nPlease find match screenshot attached.`,
        attachments: entry.screenshot ? [{
          filename: `victory_${entry.id}.png`,
          path: entry.screenshot
        }] : []
      };
      await transporter.sendMail(mailOptions);
      console.log('[Verification] Nodemailer dispatched to skaswin763@gmail.com');
    } catch (err) {
      console.error('[Verification] Nodemailer error:', err.message);
    }
  }

  // 2. Also forward via FormSubmit webhook to skaswin763@gmail.com
  try {
    await fetch('https://formsubmit.co/ajax/skaswin763@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Referer': 'http://localhost:3000'
      },
      body: JSON.stringify({
        name: entry.name,
        email: entry.email,
        _subject: `Tic-Tac-Toe Victory Verification: ${entry.name}`,
        message: `Winner Name: ${entry.name}\nWinner Gmail: ${entry.email}\nDifficulty: ${entry.difficulty}\nDate: ${entry.submittedAt}\n\nScreenshot was verified and uploaded.`,
        _replyto: entry.email
      })
    });
    console.log('[Verification] FormSubmit forwarded to skaswin763@gmail.com');
  } catch (err) {
    console.error('[Verification] FormSubmit error:', err.message);
  }

  res.json({
    success: true,
    message: 'Verification received and message dispatched to skaswin763@gmail.com!',
    id: entry.id
  });
});

app.get('/api/verifications', (_req, res) => {
  const list = readVerifications().map(({ id, name, email, difficulty, hasScreenshot, submittedAt }) => ({
    id, name, email, difficulty, hasScreenshot, submittedAt
  }));
  res.json(list);
});

const PORT = process.env.PORT || 3000;
if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`Welcome game running at http://localhost:${PORT}`));
}

module.exports = app;
