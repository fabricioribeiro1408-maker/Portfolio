/* ──────────────────────────────────────────────────────────
   terminal.js — Interactive terminal for portfolio
   ────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ── DOM refs ────────────────────────────────────────── */
  const termSection  = document.getElementById('terminal-section');
  const termWindow   = document.getElementById('term-window');
  const termBody     = document.getElementById('term-body');
  const termOutput   = document.getElementById('term-output');
  const termInput    = document.getElementById('term-input');
  const termInputLine = document.getElementById('term-input-line');
  const termCanvas   = document.getElementById('term-game-canvas');
  const termOverlay  = document.getElementById('term-game-overlay');
  const termQuitBtn  = document.getElementById('term-quit-btn');
  const shutdownOvl  = document.getElementById('shutdown-overlay');
  const ctx          = termCanvas.getContext('2d');

  /* ── State ──────────────────────────────────────────── */
  let activeGame     = null;   // 'memory' | 'matrix' | 'neural' | null
  let animFrame      = null;
  let gameCleanup    = null;   // fn to remove game listeners
  let termClosed     = false;

  /* ── Colors ─────────────────────────────────────────── */
  const C = {
    green:  '#4ade80',
    red:    '#f87171',
    white:  '#f9f8f6',
    accent: '#d4d0c8',
    bg:     '#0d0d0d',
    mid:    '#888',
  };

  /* ── Mobile & Score helpers ───────────────────────────── */

  /** Inject mobile-specific styles once */
  (function injectMobileCSS() {
    const style = document.createElement('style');
    style.textContent = `
      @media (pointer: coarse) {
        #term-input { font-size: 16px !important; }
      }
      .term-game-back {
        position: absolute; top: 8px; right: 8px; z-index: 130;
        background: rgba(13,13,13,0.75); border: 1.5px solid rgba(255,255,255,0.25);
        border-radius: 6px; color: #f9f8f6; font-family: var(--f-mono, monospace);
        font-size: .72rem; padding: 4px 10px; cursor: pointer;
        user-select: none; touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
        min-height: 32px; display: flex; align-items: center;
      }
      .term-game-back:active { background: rgba(248,113,113,0.3); }
      #term-game-canvas {
        max-width: 100%; max-height: 100%; object-fit: contain;
      }
    `;
    document.head.appendChild(style);
  })();

  /** Create "Voltar" back button inside termOverlay */
  function createBackButton() {
    const btn = document.createElement('div');
    btn.className = 'term-game-back';
    btn.textContent = '✕ Voltar';
    btn.addEventListener('click', () => hideGameLayer());
    btn.addEventListener('touchstart', (e) => { e.preventDefault(); hideGameLayer(); }, { passive: false });
    termOverlay.appendChild(btn);
    return btn;
  }

  /** localStorage score helpers (try/catch for safety) */
  function loadScores(key) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore */ }
    return [];
  }

  function saveScore(key, value) {
    try {
      const arr = loadScores(key);
      arr.unshift(value);
      if (arr.length > 3) arr.length = 3;
      localStorage.setItem(key, JSON.stringify(arr));
      return arr;
    } catch (e) { return []; }
  }

  function formatScoreHistory(scores) {
    if (!scores.length) return '';
    return `Últimas 3: ${scores.join(', ')}`;
  }

  function formatTimeHistory(times) {
    if (!times.length) return '';
    return `Últimos 3: ${times.map(t => t + 's').join(', ')}`;
  }

  /* ── Helpers ────────────────────────────────────────── */
  function print(html, color) {
    const div = document.createElement('div');
    div.style.fontFamily = 'var(--f-mono, monospace)';
    div.style.fontSize = '.78rem';
    div.style.lineHeight = '1.6';
    div.style.whiteSpace = 'pre-wrap';
    if (color) div.style.color = color;
    div.innerHTML = html;
    termOutput.appendChild(div);
    scrollBottom();
  }

  function scrollBottom() {
    termBody.scrollTop = termBody.scrollHeight;
  }

  function printPrompt(cmd) {
    print(`<span style="color:${C.green}">\u2192 fabricio ~</span> ${escHtml(cmd)}`, C.white);
  }

  function escHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  /* ── Canvas / overlay show/hide ─────────────────────── */
  function showGameLayer() {
    const rect = termBody.getBoundingClientRect();
    termCanvas.width  = termBody.clientWidth;
    termCanvas.height = termBody.clientHeight;
    termCanvas.style.display = 'block';
    termOverlay.style.display = 'flex';
    termBody.style.overflow = 'hidden';
    termInputLine.style.display = 'none';
    // Back button is added by each game after setting up overlay content
  }

  function hideGameLayer() {
    if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
    if (gameCleanup) { gameCleanup(); gameCleanup = null; }
    activeGame = null;
    termCanvas.style.display = 'none';
    termOverlay.style.display = 'none';
    termOverlay.innerHTML = '';
    termBody.style.overflow = 'auto';
    termInputLine.style.display = '';
    termInput.focus();
  }

  /* ── Command map ────────────────────────────────────── */
  const NAV = {
    about:      '#about',
    exp:        '#experience',
    skills:     '#skills',
    education:  '#education',
    reputation: '#reputation',
    cases:      '#cases',
    playground: '#playground',
    contact:    '#contact',
  };

  const HELP_TEXT =
`Comandos disponíveis:
  <span style="color:${C.accent}">help</span>        \u2014 Lista de comandos
  <span style="color:${C.accent}">about</span>       \u2014 Sobre mim
  <span style="color:${C.accent}">exp</span>         \u2014 Experiência profissional
  <span style="color:${C.accent}">skills</span>      \u2014 Compet\u00eancias
  <span style="color:${C.accent}">education</span>   \u2014 Formação acadêmica
  <span style="color:${C.accent}">reputation</span>  \u2014 Reputação & Impacto
  <span style="color:${C.accent}">cases</span>       \u2014 Cases & Projetos
  <span style="color:${C.accent}">playground</span>  \u2014 AI Playground
  <span style="color:${C.accent}">contact</span>     \u2014 Contato
  <span style="color:${C.accent}">memory</span>      \u2014 Jogo da Mem\u00f3ria
  <span style="color:${C.accent}">matrix</span>      \u2014 Efeito Matrix
  <span style="color:${C.accent}">neural</span>     \u2014 Rede neural interativa
  <span style="color:${C.accent}">shutdown</span>    \u2014 ???
  <span style="color:${C.accent}">quit</span>        \u2014 Fechar terminal
  <span style="color:${C.accent}">clear</span>       \u2014 Limpar terminal`;

  function execCommand(raw) {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;
    printPrompt(raw);

    if (cmd === 'help')                     return print(HELP_TEXT);
    if (cmd === 'clear')                    return clearTerminal();
    if (cmd === 'quit')                     return quitTerminal();
    if (cmd === 'shutdown')                 return doShutdown();
    if (cmd === 'memory')                   return startMemory();
    if (cmd === 'matrix')                   return startMatrix();
    if (cmd === 'neural')                   return startNeural();
    if (NAV[cmd]) {
      const label = { about:'Sobre', exp:'Experiência', skills:'Competências',
        education:'Formação', reputation:'Reputação', cases:'Cases',
        playground:'Playground', contact:'Contato', neural:'Neural' }[cmd] || cmd;
      print(`Navegando para ${label}...`, C.green);
      const el = document.querySelector(NAV[cmd]);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    print("Comando não reconhecido. Digite 'help' para ver os comandos.", C.red);
  }

  function clearTerminal() {
    termOutput.innerHTML = '';
  }

  /* ── Quit / reopen ──────────────────────────────────── */
  function quitTerminal() {
    hideGameLayer();
    clearTerminal();
    termClosed = true;
    termBody.style.display = 'none';
    // insert reopen message
    let reopenMsg = termWindow.querySelector('.term-reopen');
    if (!reopenMsg) {
      reopenMsg = document.createElement('div');
      reopenMsg.className = 'term-reopen';
      reopenMsg.style.cssText =
        'padding:1rem 1.2rem;font-family:var(--f-mono,monospace);font-size:.78rem;' +
        'color:' + C.mid + ';cursor:pointer;text-align:center;';
      reopenMsg.textContent = 'Terminal fechado \u2014 clique para reabrir';
      reopenMsg.addEventListener('click', reopenTerminal);
      termWindow.appendChild(reopenMsg);
    }
    reopenMsg.style.display = 'block';
  }

  function reopenTerminal() {
    termClosed = false;
    termBody.style.display = '';
    const reopenMsg = termWindow.querySelector('.term-reopen');
    if (reopenMsg) reopenMsg.style.display = 'none';
    termInput.focus();
  }

  /* ── Shutdown ───────────────────────────────────────── */
  function doShutdown() {
    // hide every direct child of body except the shutdown overlay
    Array.from(document.body.children).forEach(el => {
      if (el.id !== 'shutdown-overlay') el.style.display = 'none';
    });
    shutdownOvl.style.display = 'flex';
    sessionStorage.setItem('portfolio-shutdown', '1');
  }

  /* ── Input handling ─────────────────────────────────── */
  termInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (activeGame) return;
      const val = termInput.value;
      termInput.value = '';
      execCommand(val);
    }
  });

  termQuitBtn.addEventListener('click', () => {
    if (activeGame) hideGameLayer();
    quitTerminal();
  });


  /* ═══════════════════════════════════════════════════════
     MEMORY
     ═══════════════════════════════════════════════════════ */
  function startMemory() {
    if (activeGame) hideGameLayer();
    activeGame = 'memory';
    showGameLayer();
    termCanvas.style.display = 'none'; // HTML-based, not canvas

    // Ensure overlay is above terminal text and fully visible
    termOverlay.style.zIndex = '110';
    termOverlay.style.background = C.bg;

    const WORDS = ['Churn','NPS','SLA','CSAT','Health','LTV'];
    let cards = [...WORDS, ...WORDS];
    // shuffle
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }

    let flipped = [];
    let matched = new Set();
    let locked = false;
    let startTime = Date.now();

    function render() {
      termOverlay.innerHTML =
        `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:1rem;position:relative;z-index:111;">
          <div style="font-family:var(--f-mono,monospace);font-size:.7rem;color:${C.mid};margin-bottom:.8rem;">
            MEMORY \u2014 Encontre os pares
          </div>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;max-width:360px;width:100%;" id="mem-grid"></div>
        </div>`;
      createBackButton();

      const grid = termOverlay.querySelector('#mem-grid');
      cards.forEach((word, i) => {
        const card = document.createElement('div');
        const isFlipped = flipped.includes(i) || matched.has(i);
        card.style.cssText =
          'aspect-ratio:1;display:flex;align-items:center;justify-content:center;' +
          'font-family:var(--f-mono,monospace);font-size:.72rem;font-weight:600;' +
          'border:1.5px solid ' + (matched.has(i) ? C.green : 'rgba(255,255,255,0.12)') + ';' +
          'border-radius:6px;cursor:pointer;user-select:none;transition:background .15s;' +
          'background:' + (isFlipped ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)') + ';' +
          'color:' + (isFlipped ? C.white : C.mid) + ';' +
          'position:relative;z-index:112;';
        card.textContent = isFlipped ? word : '?';
        if (!matched.has(i) && !flipped.includes(i) && !locked) {
          card.addEventListener('click', () => flipCard(i));
        }
        grid.appendChild(card);
      });
    }

    function flipCard(i) {
      if (locked || flipped.includes(i) || matched.has(i)) return;
      flipped.push(i);
      render();

      if (flipped.length === 2) {
        locked = true;
        const [a, b] = flipped;
        if (cards[a] === cards[b]) {
          matched.add(a);
          matched.add(b);
          flipped = [];
          locked = false;
          render();
          if (matched.size === cards.length) {
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            const elapsedNum = parseFloat(elapsed);
            // Save time to localStorage
            const history = saveScore('portfolio-memory-times', elapsedNum);
            const historyText = formatTimeHistory(history);

            setTimeout(() => {
              termOverlay.innerHTML =
                `<div style="text-align:center;font-family:var(--f-mono,monospace);position:relative;z-index:111;">
                  <div style="font-size:1.4rem;font-weight:700;color:${C.green};margin-bottom:.5rem;">Parabéns!</div>
                  <div style="font-size:.82rem;color:${C.accent};">Todas as combinações encontradas.</div>
                  <div style="font-size:.85rem;color:${C.accent};margin-top:.3rem;">Tempo: ${elapsed}s</div>
                  ${historyText ? `<div style="font-size:.72rem;color:${C.mid};margin-top:.2rem;">${historyText}</div>` : ''}
                  <div class="term-again" style="margin-top:.6rem;font-size:.78rem;color:${C.green};cursor:pointer;text-decoration:underline;">Jogar de novo</div>
                  <div style="font-size:.72rem;color:${C.mid};margin-top:.4rem;">ou pressione ESC para voltar</div>
                </div>`;
              createBackButton();
              termOverlay.querySelector('.term-again').addEventListener('click', () => {
                startMemory();
              });
            }, 400);
          }
        } else {
          setTimeout(() => {
            flipped = [];
            locked = false;
            render();
          }, 800);
        }
      }
    }

    function onKey(e) {
      if (e.key === 'Escape') { hideGameLayer(); termCanvas.style.display = 'none'; }
    }
    document.addEventListener('keydown', onKey);
    gameCleanup = () => {
      document.removeEventListener('keydown', onKey);
      // Reset overlay styles
      termOverlay.style.zIndex = '';
      termOverlay.style.background = '';
    };

    render();
  }

  /* ═══════════════════════════════════════════════════════
     MATRIX
     ═══════════════════════════════════════════════════════ */
  function startMatrix() {
    if (activeGame) hideGameLayer();
    activeGame = 'matrix';
    showGameLayer();
    termOverlay.innerHTML = '';
    createBackButton();

    const W = termCanvas.width, H = termCanvas.height;
    const FONT_SIZE = 14;
    const COLS = Math.floor(W / FONT_SIZE);
    const drops = new Array(COLS).fill(1);
    const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()_+-=[]{}|;:<>?/~\u30A2\u30A4\u30A6\u30A8\u30AA\u30AB\u30AD\u30AF\u30B1\u30B3\u30B5\u30B7\u30B9\u30BB\u30BD\u30BF\u30C1\u30C4\u30C6\u30C8';
    const startTs = Date.now();

    function drawFrame() {
      // semi-transparent bg for trails
      ctx.fillStyle = 'rgba(13,13,13,0.06)';
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = '#4ade80';
      ctx.font = FONT_SIZE + 'px monospace';

      for (let i = 0; i < COLS; i++) {
        const ch = CHARS[Math.floor(Math.random() * CHARS.length)];
        const x = i * FONT_SIZE;
        const y = drops[i] * FONT_SIZE;
        ctx.fillText(ch, x, y);

        if (y > H && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }

      if (Date.now() - startTs > 4000) {
        hideGameLayer();
        return;
      }
      animFrame = requestAnimationFrame(drawFrame);
    }

    // clear canvas to black first
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);

    function onKey(e) {
      if (e.key === 'Escape') hideGameLayer();
    }
    document.addEventListener('keydown', onKey);
    gameCleanup = () => document.removeEventListener('keydown', onKey);

    animFrame = requestAnimationFrame(drawFrame);
  }

  /* ═══════════════════════════════════════════════════════
     NEURAL
     ═══════════════════════════════════════════════════════ */
  function startNeural() {
    if (activeGame) hideGameLayer();
    activeGame = 'neural';
    showGameLayer();
    termOverlay.innerHTML = '';
    createBackButton();

    const W = termCanvas.width, H = termCanvas.height;
    const startTs = Date.now();
    const DURATION = 9000; // ~9 seconds

    // ── Build network topology ──
    const layerSizes = [4, 6, 8, 6, 4];
    const layerCount = layerSizes.length;
    const marginX = W * 0.12;
    const marginY = H * 0.14;
    const usableW = W - marginX * 2;
    const usableH = H - marginY * 2;

    // nodes[layerIndex] = [{x, y}, ...]
    const nodes = layerSizes.map((size, li) => {
      const x = marginX + (usableW / (layerCount - 1)) * li;
      const arr = [];
      for (let ni = 0; ni < size; ni++) {
        const y = marginY + (usableH / (size + 1)) * (ni + 1);
        arr.push({ x, y });
      }
      return arr;
    });

    // connections between adjacent layers
    const connections = [];
    for (let li = 0; li < layerCount - 1; li++) {
      nodes[li].forEach((from, fi) => {
        nodes[li + 1].forEach((to, ti) => {
          connections.push({
            x1: from.x, y1: from.y,
            x2: to.x,   y2: to.y,
            opacity: 0.15 + Math.random() * 0.12,
          });
        });
      });
    }

    // pulses: particles traveling along connections
    const pulses = [];
    const MAX_PULSES = 18;

    function spawnPulse() {
      const conn = connections[Math.floor(Math.random() * connections.length)];
      pulses.push({
        x1: conn.x1, y1: conn.y1,
        x2: conn.x2, y2: conn.y2,
        t: 0,
        speed: 0.008 + Math.random() * 0.012,
        radius: 2 + Math.random() * 1.5,
        hue: 180 + Math.random() * 30,     // cyan-blue range
      });
    }

    // seed initial pulses
    for (let i = 0; i < MAX_PULSES; i++) spawnPulse();

    // mouse tracking for glow effect
    let mouseX = -999, mouseY = -999;
    function onMouseMove(e) {
      const rect = termCanvas.getBoundingClientRect();
      mouseX = (e.clientX - rect.left) * (W / rect.width);
      mouseY = (e.clientY - rect.top) * (H / rect.height);
    }
    function onMouseLeave() { mouseX = -999; mouseY = -999; }
    termCanvas.addEventListener('mousemove', onMouseMove);
    termCanvas.addEventListener('mouseleave', onMouseLeave);

    function distToSegment(px, py, x1, y1, x2, y2) {
      const dx = x2 - x1, dy = y2 - y1;
      const len2 = dx * dx + dy * dy;
      if (len2 === 0) return Math.hypot(px - x1, py - y1);
      let t = ((px - x1) * dx + (py - y1) * dy) / len2;
      t = Math.max(0, Math.min(1, t));
      return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
    }

    function drawFrame() {
      const elapsed = Date.now() - startTs;

      // ── background ──
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, W, H);

      // ── connections ──
      const GLOW_RADIUS = 80;
      connections.forEach(c => {
        let dist = distToSegment(mouseX, mouseY, c.x1, c.y1, c.x2, c.y2);
        let glow = dist < GLOW_RADIUS ? 1 - dist / GLOW_RADIUS : 0;
        let alpha = c.opacity + glow * 0.7;
        let bright = Math.round(100 + glow * 155);
        ctx.strokeStyle = `rgba(${bright}, ${Math.min(255, 200 + glow * 55)}, 255, ${alpha})`;
        ctx.lineWidth = 0.6 + glow * 1.4;
        ctx.beginPath();
        ctx.moveTo(c.x1, c.y1);
        ctx.lineTo(c.x2, c.y2);
        ctx.stroke();
      });

      // ── pulses ──
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.t += p.speed;
        if (p.t >= 1) {
          pulses.splice(i, 1);
          spawnPulse();
          continue;
        }
        const px = p.x1 + (p.x2 - p.x1) * p.t;
        const py = p.y1 + (p.y2 - p.y1) * p.t;
        const alpha = Math.sin(p.t * Math.PI);  // fade in/out

        // glow
        const grad = ctx.createRadialGradient(px, py, 0, px, py, p.radius * 4);
        grad.addColorStop(0, `hsla(${p.hue}, 90%, 70%, ${alpha * 0.5})`);
        grad.addColorStop(1, `hsla(${p.hue}, 90%, 70%, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py, p.radius * 4, 0, Math.PI * 2);
        ctx.fill();

        // core dot
        ctx.fillStyle = `hsla(${p.hue}, 90%, 80%, ${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── nodes ──
      const time = elapsed * 0.001;
      nodes.forEach((layer, li) => {
        layer.forEach((node, ni) => {
          const pulse = 0.5 + 0.5 * Math.sin(time * 2 + li * 1.2 + ni * 0.8);
          const r = 4 + pulse * 2;

          // outer glow
          const glow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, r * 3);
          glow.addColorStop(0, `rgba(80, 200, 255, ${0.15 + pulse * 0.15})`);
          glow.addColorStop(1, 'rgba(80, 200, 255, 0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(node.x, node.y, r * 3, 0, Math.PI * 2);
          ctx.fill();

          // node circle
          ctx.fillStyle = `rgba(100, 220, 255, ${0.6 + pulse * 0.4})`;
          ctx.beginPath();
          ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
          ctx.fill();

          // bright center
          ctx.fillStyle = `rgba(200, 240, 255, ${0.4 + pulse * 0.4})`;
          ctx.beginPath();
          ctx.arc(node.x, node.y, r * 0.4, 0, Math.PI * 2);
          ctx.fill();
        });
      });

      // ── layer labels ──
      const labels = ['INPUT', 'HIDDEN', 'DEEP', 'HIDDEN', 'OUTPUT'];
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      nodes.forEach((layer, li) => {
        const x = layer[0].x;
        ctx.fillStyle = 'rgba(100, 200, 255, 0.3)';
        ctx.fillText(labels[li] || '', x, H - marginY * 0.6);
      });

      // auto-stop
      if (elapsed > DURATION) {
        hideGameLayer();
        return;
      }

      animFrame = requestAnimationFrame(drawFrame);
    }

    // clear canvas
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, W, H);

    function onKey(e) {
      if (e.key === 'Escape' || (e.key.length === 1 && !e.ctrlKey && !e.metaKey)) {
        hideGameLayer();
      }
    }
    document.addEventListener('keydown', onKey);
    gameCleanup = () => {
      document.removeEventListener('keydown', onKey);
      termCanvas.removeEventListener('mousemove', onMouseMove);
      termCanvas.removeEventListener('mouseleave', onMouseLeave);
    };

    animFrame = requestAnimationFrame(drawFrame);
  }

  /* ── Shutdown check on load ─────────────────────────── */
  // If page reloads after shutdown, the overlay is hidden by CSS default.
  // Clear the flag so next shutdown works.
  if (sessionStorage.getItem('portfolio-shutdown')) {
    sessionStorage.removeItem('portfolio-shutdown');
  }
});
