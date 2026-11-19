const boardEl = document.getElementById('board');
const bubble = document.getElementById('bubble');
const avatar = document.getElementById('avatar');
const levelEl = document.getElementById('level');
const statsEl = document.getElementById('stats');

// Verification elements
const verifyCard = document.getElementById('verify-card');
const statusBanner = document.getElementById('status-banner');
const statusText = document.getElementById('status-text');
const verifyForm = document.getElementById('verify-form');
const nameInput = document.getElementById('winner-name');
const emailInput = document.getElementById('winner-email');
const fileInput = document.getElementById('winner-screenshot');
const uploadZone = document.getElementById('upload-zone');
const uploadContent = document.getElementById('upload-content');
const previewContainer = document.getElementById('preview-container');
const previewImg = document.getElementById('preview-img');
const removePreviewBtn = document.getElementById('remove-preview');
const formFeedback = document.getElementById('form-feedback');
const submitBtn = document.getElementById('submit-verify');

const composeLinkWrapper = document.getElementById('compose-link-wrapper');
const composeLink = document.getElementById('compose-link');

let board, busy, over;
let currentScreenshotBase64 = null;
let lastGameWinner = null;
let hasHardVictory = false;

const say = (t) => (bubble.textContent = t);
const lines = {
  start: ['Your move.', 'Go on, make your move.', 'I will wait.'],
  think: ['Hmm...', 'Let me think.', 'Interesting move.'],
  win: ['Got you. Try again?', 'Better luck next time.'],
  lose: ['You beat me! Respect.', 'Well played! Claim your victory now.'],
  draw: ['A draw. Rematch?', 'Evenly matched.']
};
const pick = (a) => a[Math.floor(Math.random() * a.length)];

function render(winLine = []) {
  boardEl.innerHTML = '';
  board.forEach((v, i) => {
    const b = document.createElement('button');
    b.className = 'cell' + (winLine.includes(i) ? ' win' : '');
    b.setAttribute('aria-label', `Cell ${i + 1}${v ? ', ' + (v === 'X' ? 'you' : 'me') : ''}`);
    b.disabled = !!v || busy || over;
    if (v === 'X') b.textContent = 'X';
    if (v === 'O') {
      const img = new Image();
      img.src = 'avatar.jpg';
      img.alt = 'O';
      b.appendChild(img);
    }
    b.onclick = () => play(i);
    boardEl.appendChild(b);
  });
}

// Avatar flies to chosen cell
function flyTo(index) {
  return new Promise((done) => {
    const from = avatar.getBoundingClientRect();
    const to = boardEl.children[index].getBoundingClientRect();
    const size = to.width * 0.72;
    const el = new Image();
    el.src = 'avatar.jpg';
    el.className = 'fly';
    Object.assign(el.style, {
      width: from.width + 'px',
      height: from.height + 'px',
      left: from.left + 'px',
      top: from.top + 'px'
    });
    document.body.appendChild(el);
    const anim = el.animate([
      { transform: 'translate(0,0)' },
      {
        transform: `translate(${to.left + (to.width - from.width) / 2 - from.left}px, ${to.top + (to.height - from.height) / 2 - from.top}px) scale(${size / from.width})`
      }
    ], { duration: 550, easing: 'cubic-bezier(.3,.7,.3,1)', fill: 'forwards' });
    anim.onfinish = () => { el.remove(); done(); };
  });
}

async function play(i) {
  if (busy || over || board[i]) return;
  board[i] = 'X';
  busy = true;
  render();
  avatar.classList.add('thinking');
  say(pick(lines.think));

  try {
    const res = await fetch('/api/move', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ board, level: levelEl.value })
    });
    const data = await res.json();
    avatar.classList.remove('thinking');
    if (data.move !== null && data.move !== undefined) {
      await flyTo(data.move);
      board[data.move] = 'O';
    }
    finish(data);
  } catch {
    avatar.classList.remove('thinking');
    say('Server is offline. Run npm start.');
    busy = false;
    render();
  }
}

function finish(data) {
  busy = false;
  if (data.winner) {
    over = true;
    lastGameWinner = data.winner;
    render(data.line || []);
    loadStats();

    if (data.winner === 'X') {
      const isHard = levelEl.value === 'hard';
      if (isHard) {
        hasHardVictory = true;
        say('You beat me on Hard! Respect. Verification is unlocked!');
        statusBanner.className = 'status-banner won';
        statusText.textContent = '🏆 HARD MODE VICTORY! Verification unlocked — submit your proof to me.';
        verifyCard.classList.add('won-highlight');
        showFeedback('🏆 Congratulations! You defeated me on Hard mode. Attach your screenshot and click Send below.', 'success');
      } else {
        hasHardVictory = false;
        say(`Good game! But verification is ONLY applicable for Hard mode wins. Switch to Hard mode!`);
        statusBanner.className = 'status-banner warning';
        statusText.textContent = `⚠️ You won on ${levelEl.value.toUpperCase()}! Verification is strictly applicable ONLY for Hard mode matches.`;
        verifyCard.classList.remove('won-highlight');
        showFeedback(`⚠️ Nice win, but verification is ONLY applicable for Hard mode victories. Switch difficulty to Hard and defeat me!`, 'error');
      }
    } else {
      hasHardVictory = false;
      say(pick(data.winner === 'O' ? lines.win : lines.draw));
      statusBanner.className = 'status-banner locked';
      statusText.textContent = '🔒 Locked — Defeat me on Hard mode to unlock verification!';
      verifyCard.classList.remove('won-highlight');
    }
  } else {
    say(pick(lines.start));
    render();
  }
}

async function loadStats() {
  try {
    const s = await (await fetch('/api/stats')).json();
    statsEl.textContent = `Visitors ${s.visitors} | Me ${s.me} | Draws ${s.draws}`;
  } catch {
    statsEl.textContent = '';
  }
}

function newGame() {
  board = Array(9).fill(null);
  busy = false;
  over = false;
  lastGameWinner = null;
  hasHardVictory = false;
  say(pick(lines.start));
  render();
  loadStats();

  // Reset status banner based on current difficulty
  if (levelEl.value === 'hard') {
    statusBanner.className = 'status-banner locked';
    statusText.textContent = '🔒 Locked — Defeat me on Hard mode to unlock verification!';
  } else {
    statusBanner.className = 'status-banner locked';
    statusText.textContent = `🔒 Locked (${levelEl.value.toUpperCase()} mode) — Switch to Hard mode to qualify!`;
  }
  verifyCard.classList.remove('won-highlight');
  clearFeedback();
}

levelEl.addEventListener('change', () => {
  if (levelEl.value !== 'hard') {
    statusBanner.className = 'status-banner locked';
    statusText.textContent = `🔒 Locked (${levelEl.value.toUpperCase()} mode) — Switch to Hard mode to qualify!`;
    verifyCard.classList.remove('won-highlight');
  } else {
    statusBanner.className = 'status-banner locked';
    statusText.textContent = '🔒 Locked — Defeat me on Hard mode to unlock verification!';
    verifyCard.classList.remove('won-highlight');
  }
  hasHardVictory = false;
});

document.getElementById('restart').onclick = newGame;

// ---- Screenshot Handling (Upload & Drag-and-Drop) ----
function handleFile(file) {
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    showFeedback('Please select a valid image file (PNG, JPG, WebP).', 'error');
    return;
  }
  if (file.size > 15 * 1024 * 1024) {
    showFeedback('Image file is too large (Maximum size: 15MB).', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    currentScreenshotBase64 = e.target.result;
    previewImg.src = currentScreenshotBase64;
    uploadContent.classList.add('hidden');
    previewContainer.classList.remove('hidden');
    clearFeedback();
  };
  reader.onerror = () => {
    showFeedback('Could not read image file. Please try again.', 'error');
  };
  reader.readAsDataURL(file);
}

fileInput.addEventListener('change', (e) => {
  if (e.target.files && e.target.files[0]) {
    handleFile(e.target.files[0]);
  }
});

removePreviewBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  currentScreenshotBase64 = null;
  fileInput.value = '';
  previewImg.src = '';
  previewContainer.classList.add('hidden');
  uploadContent.classList.remove('hidden');
});

// Drag and drop events
['dragenter', 'dragover'].forEach((eventName) => {
  uploadZone.addEventListener(eventName, (e) => {
    e.preventDefault();
    e.stopPropagation();
    uploadZone.classList.add('dragover');
  });
});

['dragleave', 'drop'].forEach((eventName) => {
  uploadZone.addEventListener(eventName, (e) => {
    e.preventDefault();
    e.stopPropagation();
    uploadZone.classList.remove('dragover');
  });
});

uploadZone.addEventListener('drop', (e) => {
  const dt = e.dataTransfer;
  if (dt && dt.files && dt.files[0]) {
    handleFile(dt.files[0]);
  }
});

// Feedback banner helper
function showFeedback(msg, type = 'success') {
  formFeedback.textContent = msg;
  formFeedback.className = `form-feedback ${type}`;
}

function clearFeedback() {
  formFeedback.textContent = '';
  formFeedback.className = 'form-feedback hidden';
}

// ---- Form Submission (Sends verification to skaswin763@gmail.com) ----
verifyForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (levelEl.value !== 'hard') {
    showFeedback('❌ Verification is strictly applicable ONLY for Hard level match victories! Please select Hard difficulty and defeat me first.', 'error');
    return;
  }

  if (!hasHardVictory) {
    showFeedback('🔒 Verification is locked! You must first defeat me in a Hard level match before submitting your verification proof.', 'error');
    return;
  }

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();

  if (!name || !email) {
    showFeedback('Please provide both your name and Gmail address.', 'error');
    return;
  }

  if (!email.toLowerCase().includes('@')) {
    showFeedback('Please enter a valid Gmail / email address.', 'error');
    return;
  }

  if (!currentScreenshotBase64) {
    showFeedback('Please attach a screenshot of your match win as verification proof.', 'error');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerHTML = `
    <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
    <span>Sending verification to me...</span>
  `;

  // 1. Try copying screenshot to clipboard so the user can easily paste (Ctrl+V) in Gmail
  let copiedClipboard = false;
  if (navigator.clipboard && window.ClipboardItem && currentScreenshotBase64) {
    try {
      const res = await fetch(currentScreenshotBase64);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      copiedClipboard = true;
    } catch (_) {}
  }

  // 2. Prepare Gmail Web Compose link & mailto link
  const subject = encodeURIComponent(`🏆 Tic-Tac-Toe Victory Verification - ${name}`);
  const bodyText = 
    `Hi Ashwin,\n\n` +
    `I won the Tic-Tac-Toe match against your avatar!\n\n` +
    `Winner Details:\n` +
    `• Name: ${name}\n` +
    `• Sender Gmail: ${email}\n` +
    `• Difficulty: ${levelEl.value.toUpperCase()}\n` +
    `• Timestamp: ${new Date().toLocaleString()}\n\n` +
    `Screenshot proof is attached.\n\n` +
    `Best regards,\n${name}`;
  
  const bodyEncoded = encodeURIComponent(bodyText);
  const gmailWebUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=skaswin763@gmail.com&su=${subject}&body=${bodyEncoded}`;
  const mailtoFallback = `mailto:skaswin763@gmail.com?subject=${subject}&body=${bodyEncoded}`;

  // Update fallback link in DOM
  composeLink.href = gmailWebUrl;
  composeLinkWrapper.classList.remove('hidden');

  // 3. Dispatch to server endpoint (which notifies skaswin763@gmail.com via FormSubmit/Nodemailer and logs permanently)
  try {
    const res = await fetch('/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        screenshot: currentScreenshotBase64,
        difficulty: levelEl.value
      })
    });
    await res.json();
  } catch (err) {
    console.warn('Server verification background sync:', err);
  }

  // 4. Open Gmail compose so the message is sent directly from the user's Gmail to skaswin763@gmail.com as a sent message
  const win = window.open(gmailWebUrl, '_blank');
  if (!win) {
    window.location.href = mailtoFallback;
  }

  showFeedback(
    `✅ Verification message prepared! ` +
    (copiedClipboard 
      ? `Gmail has been opened with your details. Screenshot is copied to your clipboard — press Ctrl+V to paste it into Gmail and hit Send!` 
      : `Gmail has been opened. Please attach your screenshot and hit Send!`),
    `success`
  );

  submitBtn.disabled = false;
  submitBtn.innerHTML = `
    <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
    </svg>
    <span>Send Verification to me</span>
  `;
});

// ---- Interactive 3D Card Tilt ----
function initTilt() {
  const cards = document.querySelectorAll('.tilt-card');
  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      // Disable tilt on smaller screens to avoid layout jitter
      if (window.innerWidth < 860) return;

      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      const rotX = (-y / (rect.height / 2)) * 4.5;
      const rotY = (x / (rect.width / 2)) * 4.5;

      card.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateY(-2px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });
}

initTilt();
newGame();
