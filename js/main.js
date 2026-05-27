/* ============================================================
   main.js — Fabricio Ribeiro Portfolio
   Core functionality & visual effects
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ── 1. PRELOADER ─────────────────────────────────────── */
  const preloader = document.getElementById('preloader');
  const preBarFill = document.getElementById('pre-bar-fill');

  if (preBarFill) {
    preBarFill.style.transition = 'width 1s ease-out';
    requestAnimationFrame(() => { preBarFill.style.width = '100%'; });
  }

  window.addEventListener('load', () => {
    if (preloader) {
      preloader.style.transition = 'opacity 0.5s ease';
      preloader.style.opacity = '0';
      setTimeout(() => {
        preloader.style.display = 'none';
        // 12. Glitch effect after preloader
        triggerGlitch();
      }, 500);
    }
  });

  /* ── 2. CUSTOM CURSOR ─────────────────────────────────── */
  const dot = document.getElementById('dot');
  const ring = document.getElementById('ring');
  const isHoverDevice = window.matchMedia('(hover: hover)').matches;

  if (isHoverDevice && dot && ring) {
    let mx = 0, my = 0, rx = 0, ry = 0;

    document.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px)`;
    });

    (function ringLoop() {
      rx += (mx - rx) * 0.15;
      ry += (my - ry) * 0.15;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(ringLoop);
    })();

    const hoverSelectors = 'a, button, .btn, .pillar, .exp-item, .edu-item, .clink, .stack-item, .case-card, .pg-send, .pg-clear-btn, .pg-select, .pg-range, .pg-export-btn, .pg-tutorial-btn, .csv-zone, .pg-example-btn, .term-input';

    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverSelectors)) {
        dot.classList.add('on');
        ring.classList.add('on');
      }
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverSelectors)) {
        dot.classList.remove('on');
        ring.classList.remove('on');
      }
    });
  }

  /* ── 3. CANVAS PARTICLES ──────────────────────────────── */
  const cv = document.getElementById('cv');
  if (cv) {
    const ctx = cv.getContext('2d');
    let W, H;
    let particles = [];
    let mouseX = -9999, mouseY = -9999;
    const PARTICLE_COUNT = 100;
    const CONNECT_DIST = 120;
    const REPEL_DIST = 100;

    function resizeCanvas() {
      W = cv.width = window.innerWidth;
      H = cv.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function Particle() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.r = Math.random() * 1.5 + 0.5;
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

    function drawParticles() {
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Repel from mouse
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < REPEL_DIST && dist > 0) {
          const force = (REPEL_DIST - dist) / REPEL_DIST;
          p.vx += (dx / dist) * force * 0.8;
          p.vy += (dy / dist) * force * 0.8;
        }

        // Damping
        p.vx *= 0.98;
        p.vy *= 0.98;

        p.x += p.vx;
        p.y += p.vy;

        // Wrap edges
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;

        // Draw dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fill();

        // Connections
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const ddx = p.x - q.x;
          const ddy = p.y - q.y;
          const d = Math.sqrt(ddx * ddx + ddy * ddy);
          if (d < CONNECT_DIST) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(255,255,255,${0.15 * (1 - d / CONNECT_DIST)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(drawParticles);
    }
    drawParticles();
  }

  /* ── 4. NAV SCROLL ────────────────────────────────────── */
  const nav = document.getElementById('nav');

  /* ── 5. SCROLL PROGRESS BAR ───────────────────────────── */
  const scrollProgress = document.getElementById('scroll-progress');

  function onScroll() {
    const scrollY = window.scrollY;

    // Nav scrolled class
    if (nav) {
      nav.classList.toggle('scrolled', scrollY > 60);
    }

    // Scroll progress
    if (scrollProgress) {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
      scrollProgress.style.width = pct + '%';
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── 6. INTERSECTION OBSERVER — reveal ────────────────── */
  const revealTargets = document.querySelectorAll('.exp-item, .skill-col, .edu-item, .rep-card, .case-card');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = el.dataset.d || 0;
        setTimeout(() => {
          el.classList.add('visible');
          // Animate bar-fill inside
          el.querySelectorAll('.bar-fill').forEach((bar) => {
            bar.style.width = (bar.dataset.w || 0) + '%';
          });
        }, Number(delay));
        revealObserver.unobserve(el);
      }
    });
  }, { threshold: 0.15 });

  revealTargets.forEach((el, i) => {
    if (!el.dataset.d) el.dataset.d = i * 80;
    revealObserver.observe(el);
  });

  /* ── 7. COUNT-UP ANIMATION ────────────────────────────── */
  const heroSection = document.getElementById('hero');
  const countEls = document.querySelectorAll('.hbi-num[data-count]');
  let countDone = false;

  if (heroSection && countEls.length) {
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !countDone) {
          countDone = true;
          countEls.forEach((el) => {
            const target = parseInt(el.dataset.count, 10);
            const suffix = el.dataset.suffix || '';
            const duration = 1500;
            const start = performance.now();
            const em = el.querySelector('em');

            function step(now) {
              const t = Math.min((now - start) / duration, 1);
              const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
              const current = Math.round(eased * target);
              if (em) em.textContent = current + suffix;
              if (t < 1) requestAnimationFrame(step);
            }
            requestAnimationFrame(step);
          });
          countObserver.unobserve(heroSection);
        }
      });
    }, { threshold: 0.3 });
    countObserver.observe(heroSection);
  }

  /* ── 8. MAGNETIC BUTTONS ──────────────────────────────── */
  document.querySelectorAll('.btn-magnetic').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      btn.style.transition = 'transform 0.2s ease';
      btn.style.transform = `translate(${dx * 8}px, ${dy * 8}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transition = 'transform 0.4s ease';
      btn.style.transform = 'translate(0, 0)';
    });
  });

  /* ── 9. GRADIENT GLOW ON CARDS ────────────────────────── */
  document.querySelectorAll('.glow-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--gx', (e.clientX - rect.left) + 'px');
      card.style.setProperty('--gy', (e.clientY - rect.top) + 'px');
    });

    card.addEventListener('mouseleave', () => {
      card.style.removeProperty('--gx');
      card.style.removeProperty('--gy');
    });
  });

  /* ── 10. TILT 3D ON CARDS ─────────────────────────────── */
  document.querySelectorAll('.tilt-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rotY = (x - 0.5) * 16;  // ±8 degrees
      const rotX = (0.5 - y) * 16;  // ±8 degrees
      card.style.transition = 'transform 0.1s ease';
      card.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.5s ease';
      card.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg)';
    });
  });

  /* ── 11. HERO SPOTLIGHT ───────────────────────────────── */
  const heroSpotlight = document.getElementById('hero-spotlight');

  if (heroSection && heroSpotlight) {
    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      heroSpotlight.style.background = `radial-gradient(600px circle at ${x}px ${y}px, rgba(255,255,255,0.03), transparent 60%)`;
    });
  }

  /* ── 12. GLITCH EFFECT ON NAME ────────────────────────── */
  function triggerGlitch() {
    const glitchTarget = document.querySelector('.glitch-target');
    if (glitchTarget) {
      glitchTarget.classList.add('glitch-active');
      setTimeout(() => glitchTarget.classList.remove('glitch-active'), 600);
    }
  }

  /* ── 13. MASK REVEAL ON SCROLL ────────────────────────── */
  const maskEls = document.querySelectorAll('.mask-reveal');

  if (maskEls.length) {
    const maskObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          maskObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    maskEls.forEach((el) => maskObserver.observe(el));
  }

  /* ── 14. SMOOTH SCROLL ────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* ── 15. FORMSPREE AJAX ───────────────────────────────── */
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = 'Enviando...';
      btn.disabled = true;

      fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { 'Accept': 'application/json' }
      }).then(function(response) {
        if (response.ok) {
          contactForm.reset();
          btn.textContent = originalText;
          btn.disabled = false;
          let msg = contactForm.querySelector('.form-success');
          if (!msg) {
            msg = document.createElement('div');
            msg.className = 'form-success';
            msg.style.cssText = 'margin-top:1rem;padding:.8rem 1rem;border-radius:6px;background:rgba(74,222,128,0.1);border:1px solid rgba(74,222,128,0.3);color:#4ade80;font-family:var(--f-mono,monospace);font-size:.78rem;text-align:center;';
            contactForm.appendChild(msg);
          }
          msg.textContent = 'Formulário submetido, logo logo entro em contato!';
          msg.style.display = 'block';
          setTimeout(function() { msg.style.display = 'none'; }, 8000);
        } else {
          btn.textContent = originalText;
          btn.disabled = false;
          alert('Erro ao enviar. Tente novamente.');
        }
      }).catch(function() {
        btn.textContent = originalText;
        btn.disabled = false;
        alert('Erro de conexão. Tente novamente.');
      });
    });
  }

});
