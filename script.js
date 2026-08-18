'use strict';

const BOOT_LINES = [
  '[    0.000000] Booting Linux kernel 6.8.0-portfolio',
  '[    0.001234] Command line: BOOT_IMAGE=/vmlinuz-6.8.0',
  '[    0.124511] ACPI: Core revision 20230628',
  '[    0.508200] systemd[1]: Starting Portfolio OS...',
  '[  OK  ] Started udev Kernel Device Manager',
  '[  OK  ] Started Journal Service',
  '[  OK  ] Reached target Local File Systems',
  '[  OK  ] Started NetworkManager',
  '[  OK  ] Started User Manager for UID 1000',
  '[  OK  ] Reached target Graphical Interface',
];

const HIRE_LINES = [
  { t: 'dim', s: '#!/usr/bin/env bash' },
  { t: 'dim', s: '# hire.sh — contact script' },
  { t: '', s: '' },
  { t: 'g',   s: '$ ./hire.sh' },
  { t: '',    s: 'Checking availability.......... [OK]' },
  { t: '',    s: 'Loading resume................. [DONE]' },
  { t: '',    s: 'Verifying skills match......... [OK]' },
  { t: '',    s: '' },
  { t: 'g',   s: 'Status   : ✅ Open to opportunities' },
  { t: 'g',   s: 'Response : typically within 24 hours' },
  { t: '',    s: '' },
  { t: '',    s: 'Ready to connect? Hit the button below ↓' },
];

/* DOM refs */
const boot       = document.getElementById('boot');
const bootGrub   = document.getElementById('boot-grub');
const bootSplash = document.getElementById('boot-splash');
const grubCount  = document.getElementById('grub-count');
const bootLog    = document.getElementById('boot-log');

const panel      = document.getElementById('panel');
const clock      = document.getElementById('clock');
const dock       = document.getElementById('dock');
const term       = document.getElementById('top');
const termBar    = document.getElementById('term-bar');
const panelApp   = document.getElementById('panel-app');

const miniterm        = document.getElementById('miniterm');
const minitermOut     = document.getElementById('miniterm-out');
const minitermActions = document.getElementById('miniterm-actions');
const minitermClose   = document.getElementById('miniterm-close');
const minitermDone    = document.getElementById('miniterm-done');

const toast      = document.getElementById('toast');

let bootDone     = false;
let toastTimer   = null;
let hireRunning  = false;

/* ════════════════════════════════════════════════════
   BOOT SEQUENCE
════════════════════════════════════════════════════ */
function startBoot () {
  if (bootDone) return;
  bootDone = true;
  clearInterval(grubInterval);
  runSplash();
}

let grubSecs = 3;
const grubInterval = setInterval(() => {
  grubSecs--;
  if (grubCount) grubCount.textContent = grubSecs;
  if (grubSecs <= 0) {
    clearInterval(grubInterval);
    runSplash();
  }
}, 1000);

function runSplash () {
  bootDone = true;
  if (bootGrub) bootGrub.hidden = true;
  if (bootSplash) bootSplash.hidden = false;

  let i = 0;
  const logInterval = setInterval(() => {
    if (i >= BOOT_LINES.length) {
      clearInterval(logInterval);
      setTimeout(revealDesktop, 400);
      return;
    }
    const line = document.createElement('div');
    const txt = BOOT_LINES[i];
    line.textContent = txt;
    if (txt.includes('[  OK  ]')) line.classList.add('ok');
    if (bootLog) {
      bootLog.appendChild(line);
      bootLog.scrollTop = bootLog.scrollHeight;
    }
    i++;
  }, 80);
}

function revealDesktop () {
  if (boot) {
    boot.classList.add('fade-out');
    setTimeout(() => { boot.hidden = true; }, 500);
  }

  if (panel) panel.classList.add('visible');
  if (dock) dock.classList.add('visible');
  if (term) term.classList.add('visible');

  startClock();
  initDock();
  initScrollSpy();
  initReveal();
  initSectionCardTypewriters();
}

document.addEventListener('keydown', () => startBoot(), { once: true });
if (boot) boot.addEventListener('click', () => startBoot(), { once: true });

/* ════════════════════════════════════════════════════
   CLOCK & DOCK & TOAST
════════════════════════════════════════════════════ */
function startClock () {
  function tick () {
    const now = new Date();
    const h   = String(now.getHours()).padStart(2, '0');
    const m   = String(now.getMinutes()).padStart(2, '0');
    if (clock) clock.textContent = `${h}:${m}`;
  }
  tick();
  setInterval(tick, 30000);
}

function initDock () {
  const icons = dock ? dock.querySelectorAll('.dock__ico') : [];

  icons.forEach(btn => {
    btn.addEventListener('click', () => {
      const app   = btn.dataset.app;
      const msg   = btn.dataset.toast;
      const link  = btn.dataset.link;

      if (app === 'Terminal') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (link) {
        window.open(link, '_blank', 'noopener');
      }
      if (msg) showToast(msg);
    });
  });
}

function showToast (msg) {
  if (!toast) return;
  if (toastTimer) { clearTimeout(toastTimer); }
  toast.textContent = msg;
  toast.hidden = false;
  toast.getBoundingClientRect();
  toast.classList.add('show');
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => { toast.hidden = true; }, 250);
  }, 2800);
}

/* ════════════════════════════════════════════════════
   MINITERM / HIRE.SH
════════════════════════════════════════════════════ */
function openHire () {
  if (hireRunning || !miniterm) return;
  hireRunning = true;
  minitermOut.textContent = '';
  minitermActions.hidden = true;
  miniterm.hidden = false;

  let i = 0;
  function type () {
    if (i >= HIRE_LINES.length) {
      setTimeout(() => { minitermActions.hidden = false; }, 300);
      hireRunning = false;
      return;
    }
    const { t, s } = HIRE_LINES[i++];
    const span = document.createElement('span');
    if (t) span.className = t;
    span.textContent = s + '\n';
    minitermOut.appendChild(span);
    minitermOut.scrollTop = minitermOut.scrollHeight;
    setTimeout(type, s === '' ? 50 : 100);
  }
  type();
}

function closeHire () {
  if (!miniterm) return;
  miniterm.hidden = true;
  hireRunning = false;
  minitermOut.textContent = '';
  minitermActions.hidden = true;
}

if (termBar) {
  termBar.addEventListener('click', openHire);
  termBar.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openHire(); });
}
if (panelApp) {
  panelApp.addEventListener('click', openHire);
  panelApp.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openHire(); });
}
if (minitermClose) minitermClose.addEventListener('click', closeHire);
if (minitermDone) minitermDone.addEventListener('click', closeHire);
if (miniterm) {
  miniterm.addEventListener('click', e => { if (e.target === miniterm) closeHire(); });
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && miniterm && !miniterm.hidden) closeHire();
});

/* ════════════════════════════════════════════════════
   SCROLLSPY
════════════════════════════════════════════════════ */
function initScrollSpy () {
  const tabLinks = document.querySelectorAll('.tab-link');
  const sections = ['about','education','projects','skills','certs','contact','resume'];
  const anchors = sections.map(id => document.getElementById(id)).filter(Boolean);

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        tabLinks.forEach(a => {
          a.classList.toggle('active', a.dataset.section === id);
        });
      }
    });
  }, {
    rootMargin: '-25% 0px -60% 0px',
    threshold: 0
  });

  anchors.forEach(a => obs.observe(a));
}

/* ════════════════════════════════════════════════════
   REVEAL BLOCKS (Hero items)
════════════════════════════════════════════════════ */
function initReveal () {
  const blocks = document.querySelectorAll('.term .reveal-block, .end-cursor-wrap.reveal-block');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  blocks.forEach((el, i) => {
    el.style.transitionDelay = i < 4 ? `${i * 70}ms` : '0ms';
    obs.observe(el);
  });
}

/* ════════════════════════════════════════════════════
   SECTION TERMINAL CARDS — TYPEWRITER & ANIMATION
════════════════════════════════════════════════════ */
function initSectionCardTypewriters () {
  const cards = document.querySelectorAll('.js-card');

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const card = entry.target;
        obs.unobserve(card);

        /* 1. Make window visible */
        card.classList.add('visible');

        /* 2. Type out command */
        const cmdText   = card.dataset.cmd || '';
        const typewriter= card.querySelector('.js-typewriter');
        const output     = card.querySelector('.sec-card__output');
        const caret      = card.querySelector('.js-caret');

        let charIdx = 0;
        const typeSpeed = Math.max(30, Math.floor(600 / (cmdText.length || 1)));

        function typeChar () {
          if (charIdx < cmdText.length) {
            typewriter.textContent += cmdText.charAt(charIdx);
            charIdx++;
            setTimeout(typeChar, typeSpeed);
          } else {
            /* Finished typing command -> reveal output */
            setTimeout(() => {
              if (caret) caret.style.display = 'none';
              if (output) output.hidden = false;

              /* If this is the wget/resume card, run progress bar */
              if (card.querySelector('#resume-progress')) {
                runResumeWget();
              }
            }, 180);
          }
        }

        setTimeout(typeChar, 250);
      }
    });
  }, {
    threshold: 0.15
  });

  cards.forEach(c => obs.observe(c));
}

/* ════════════════════════════════════════════════════
   WGET RESUME PROGRESS BAR ANIMATION
════════════════════════════════════════════════════ */
function runResumeWget () {
  const progressBar  = document.getElementById('resume-progress');
  const progressText = document.getElementById('progress-text');
  const wgetDone     = document.getElementById('wget-done');
  const dlBtn        = document.getElementById('resume-dl-btn');

  if (!progressBar || !progressText) return;

  let pct = 0;
  const interval = setInterval(() => {
    pct += Math.floor(Math.random() * 18) + 12;
    if (pct >= 100) {
      pct = 100;
      clearInterval(interval);
      progressBar.style.width = '100%';
      progressText.textContent = '100%';

      setTimeout(() => {
        if (wgetDone) wgetDone.hidden = false;
        if (dlBtn) dlBtn.style.display = 'inline-flex';
      }, 300);
    } else {
      progressBar.style.width = pct + '%';
      progressText.textContent = pct + '%';
    }
  }, 100);
}
