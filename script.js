'use strict';

const BOOT_LINES = [
  '[    0.000000] Booting Linux kernel 6.8.0-blaze',
  '[    0.001234] Command line: BOOT_IMAGE=/vmlinuz-6.8.0-blaze',
  '[    0.124511] ACPI: Core revision 20230628',
  '[    0.508200] systemd[1]: Starting blaze.portfolio os...',
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
const grubRecovery = document.getElementById('grub-recovery');

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

const interactiveTermModal = document.getElementById('interactive-term-modal');
const intertermInput       = document.getElementById('interterm-input');
const intertermHistory     = document.getElementById('interterm-history');
const intertermClose       = document.getElementById('interterm-close');
const intertermBody        = document.getElementById('interterm-body');
const dockTerminal         = document.getElementById('dock-terminal');

const sudoBar       = document.getElementById('sudo-bar');
const sudoSave      = document.getElementById('sudo-save');
const sudoReset     = document.getElementById('sudo-reset');
const sudoExit      = document.getElementById('sudo-exit');
const sudoModal     = document.getElementById('sudo-modal');
const sudoForm      = document.getElementById('sudo-form');
const sudoPassInput = document.getElementById('sudo-pass-input');
const sudoError     = document.getElementById('sudo-error');
const sudoModalClose= document.getElementById('sudo-modal-close');
const traySudo      = document.getElementById('tray-sudo');
const dockFiles     = document.getElementById('dock-files');

const toast      = document.getElementById('toast');

let bootDone     = false;
let toastTimer   = null;
let hireRunning  = false;
let isSudoMode   = false;
let recoveryBoot = false;

/* ════════════════════════════════════════════════════
   EDITABLE ELEMENT IDS FOR SUDO MODE
════════════════════════════════════════════════════ */
const EDITABLE_IDS = [
  'edit-hero-name',
  'edit-hero-title',
  'edit-hero-bio',
  'edit-about-text',
  'edit-about-role',
  'edit-about-focus',
  'edit-about-uni',
  'edit-about-loc',
  'edit-about-status',
  'edit-edu-degree',
  'edit-edu-date',
  'edit-edu-inst',
  'edit-edu-spec',
  'edit-edu-gpa',
  'edit-p1-name',
  'edit-p1-desc',
  'edit-p2-name',
  'edit-p2-desc',
  'edit-p3-name',
  'edit-p3-desc',
  'edit-skills-more',
  'edit-status-text',
  'edit-response-text',
  'edit-timezone-text',
  'edit-preferred-text',
  'edit-email-link',
  'edit-linkedin-link',
  'edit-github-link',
  'edit-resume-filename'
];

const LOCAL_STORAGE_KEY = 'moon_portfolio_sudo_data_v1';

/* ════════════════════════════════════════════════════
   BOOT SEQUENCE (blaze.portfolio os)
════════════════════════════════════════════════════ */
function startBoot (forceRecovery = false) {
  if (bootDone) return;
  bootDone = true;
  clearInterval(grubInterval);
  if (forceRecovery) recoveryBoot = true;
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

  if (recoveryBoot) {
    const splashSuffix = document.getElementById('splash-suffix');
    if (splashSuffix) splashSuffix.textContent = ' os (sudo recovery)';
  }

  let i = 0;
  /* Increased animation log interval by +20% (80ms -> 96ms) */
  const logInterval = setInterval(() => {
    if (i >= BOOT_LINES.length) {
      clearInterval(logInterval);
      setTimeout(revealDesktop, 480);
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
  }, 96);
}

function revealDesktop () {
  if (boot) {
    boot.classList.add('fade-out');
    setTimeout(() => { boot.hidden = true; }, 600);
  }

  if (panel) panel.classList.add('visible');
  if (dock) dock.classList.add('visible');
  if (term) term.classList.add('visible');

  startClock();
  initDock();
  initScrollSpy();
  initReveal();
  initSectionCardTypewriters();
  loadSavedSudoContent();
  initInteractiveTerminal();

  if (recoveryBoot) {
    enableSudoAdminMode();
    showToast("⚡ Booted in Recovery Mode: Sudo Admin Mode active!");
  }
}

document.addEventListener('keydown', (e) => {
  if (!bootDone) {
    if (e.key === 'e' || e.key === 'E') {
      startBoot(true);
    } else {
      startBoot();
    }
  }
});
if (boot) boot.addEventListener('click', () => startBoot());
if (grubRecovery) grubRecovery.addEventListener('click', (e) => {
  e.stopPropagation();
  startBoot(true);
});

/* ════════════════════════════════════════════════════
   INTERACTIVE BASH CLI COMMAND PARSER
════════════════════════════════════════════════════ */
function openInteractiveTerminal () {
  if (interactiveTermModal) {
    interactiveTermModal.hidden = false;
    setTimeout(() => { if (intertermInput) intertermInput.focus(); }, 120);
  }
}

function closeInteractiveTerminal () {
  if (interactiveTermModal) interactiveTermModal.hidden = true;
}

function initInteractiveTerminal () {
  if (panelApp) panelApp.addEventListener('click', openInteractiveTerminal);
  if (dockTerminal) dockTerminal.addEventListener('click', openInteractiveTerminal);
  if (termBar) termBar.addEventListener('click', openInteractiveTerminal);
  if (intertermClose) intertermClose.addEventListener('click', closeInteractiveTerminal);

  if (interactiveTermModal) {
    interactiveTermModal.addEventListener('click', e => {
      if (e.target === interactiveTermModal) closeInteractiveTerminal();
    });
  }

  document.addEventListener('keydown', e => {
    if (e.key === '`' || e.key === '~') {
      e.preventDefault();
      if (interactiveTermModal && !interactiveTermModal.hidden) {
        closeInteractiveTerminal();
      } else {
        openInteractiveTerminal();
      }
    }
  });

  if (intertermInput) {
    intertermInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const cmd = intertermInput.value.trim();
        intertermInput.value = '';
        if (cmd) {
          executeCLICommand(cmd);
        }
      }
    });
  }
}

function executeCLICommand (cmdRaw) {
  const cmd = cmdRaw.trim();
  const lower = cmd.toLowerCase();

  const entry = document.createElement('div');
  entry.className = 'interterm-history-entry';

  const cmdLine = document.createElement('div');
  cmdLine.className = 'interterm-cmd-line';
  cmdLine.innerHTML = `<span class="prompt"><span class="u">moon</span><span class="at">@</span><span class="h">blaze.portfolio</span><span class="c">:</span><span class="p">~</span><span class="d">$</span></span> <span>${escapeHtml(cmd)}</span>`;
  entry.appendChild(cmdLine);

  const outLine = document.createElement('div');
  outLine.className = 'interterm-out-line';

  if (lower === 'help') {
    outLine.innerHTML = `Available CLI Commands:
  <span class="ok">cd &lt;section&gt;</span>  : Navigate to page section (e.g. cd projects, cd skills, cd top)
  <span class="ok">cat &lt;file&gt;</span>     : Scroll to section (e.g. cat about, cat education)
  <span class="ok">sudo / su</span>       : Open Sudo Admin password prompt / enable admin mode
  <span class="ok">ls</span>              : List all page directories/sections
  <span class="ok">whoami</span>          : Display user identity
  <span class="ok">neofetch</span>        : Display tech stack info
  <span class="ok">clear</span>           : Clear terminal screen output
  <span class="ok">exit</span>            : Close interactive terminal console`;
  }
  else if (lower === 'ls') {
    outLine.innerHTML = `<span class="ok">about/</span>  <span class="ok">education/</span>  <span class="ok">projects/</span>  <span class="ok">skills/</span>  <span class="ok">certs/</span>  <span class="ok">contact/</span>  <span class="ok">resume.pdf</span>`;
  }
  else if (lower.startsWith('cd ') || lower.startsWith('goto ')) {
    const target = lower.split(' ')[1] || '';
    if (['about','education','projects','skills','certs','contact','resume','top'].includes(target)) {
      outLine.innerHTML = `Navigating to section <span class="ok">#${target}</span>...`;
      scrollToSection(target);
      setTimeout(closeInteractiveTerminal, 600);
    } else {
      outLine.innerHTML = `<span style="color:#ef4444">cd: no such file or directory: ${escapeHtml(target)}</span>. Type 'ls' to see sections.`;
    }
  }
  else if (lower.startsWith('cat ')) {
    const target = lower.split(' ')[1] || '';
    const clean = target.replace('.md','').replace('.txt','');
    if (['about','education','projects','skills','certs','contact','resume'].includes(clean)) {
      outLine.innerHTML = `Displaying <span class="ok">#${clean}</span>...`;
      scrollToSection(clean);
      setTimeout(closeInteractiveTerminal, 600);
    } else {
      outLine.innerHTML = `<span style="color:#ef4444">cat: ${escapeHtml(target)}: No such file or directory</span>`;
    }
  }
  else if (lower === 'sudo' || lower === 'sudo su' || lower === 'sudo edit' || lower === 'su') {
    outLine.innerHTML = `Launching <span class="ok">Sudo Admin Authentication</span>...`;
    closeInteractiveTerminal();
    openSudoModal();
  }
  else if (lower === 'whoami') {
    outLine.innerHTML = `Moon Rathi — Cloud Computing Student & DevOps Enthusiast @ IILM University`;
  }
  else if (lower === 'neofetch') {
    outLine.innerHTML = `OS      : blaze.portfolio os (Linux 6.8.0-blaze)
Host    : Moon Rathi Cloud Workstation
Stack   : AWS, Terraform, Docker, Python, GitHub Actions, Linux
Status  : 🟢 Active — Open to DevOps & Cloud Opportunities`;
  }
  else if (lower === 'clear') {
    if (intertermHistory) intertermHistory.innerHTML = '';
    return;
  }
  else if (lower === 'exit' || lower === 'quit') {
    closeInteractiveTerminal();
    return;
  }
  else {
    outLine.innerHTML = `<span style="color:#ef4444">bash: command not found: ${escapeHtml(cmd)}</span>. Type '<span class="ok">help</span>' for commands or '<span class="ok">cd projects</span>' to navigate.`;
  }

  entry.appendChild(outLine);
  if (intertermHistory) intertermHistory.appendChild(entry);
  if (intertermBody) intertermBody.scrollTop = intertermBody.scrollHeight;
}

function scrollToSection (sectionId) {
  const el = document.getElementById(sectionId);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* ════════════════════════════════════════════════════
   SUDO ADMIN MODE LOGIC
════════════════════════════════════════════════════ */
function openSudoModal () {
  if (isSudoMode) {
    showToast("⚡ Sudo Admin Mode is already active!");
    return;
  }
  if (sudoModal) {
    if (sudoError) sudoError.hidden = true;
    if (sudoPassInput) sudoPassInput.value = '';
    sudoModal.hidden = false;
    setTimeout(() => { if (sudoPassInput) sudoPassInput.focus(); }, 120);
  }
}

function closeSudoModal () {
  if (sudoModal) sudoModal.hidden = true;
}

function authenticateSudo () {
  const pass = sudoPassInput ? sudoPassInput.value.trim().toLowerCase() : '';
  if (pass === 'admin' || pass === 'moon' || pass === 'sudo' || pass === 'root' || pass === '') {
    closeSudoModal();
    enableSudoAdminMode();
    showToast("⚡ Authenticated! Sudo Admin Mode active. Click text to edit.");
  } else {
    if (sudoError) sudoError.hidden = false;
  }
}

function enableSudoAdminMode () {
  isSudoMode = true;
  document.body.classList.add('sudo-active');
  if (sudoBar) sudoBar.hidden = false;

  EDITABLE_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.contentEditable = 'true';
    }
  });
}

function disableSudoAdminMode () {
  isSudoMode = false;
  document.body.classList.remove('sudo-active');
  if (sudoBar) sudoBar.hidden = true;

  EDITABLE_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.contentEditable = 'false';
    }
  });
  showToast("Exit Sudo Admin Mode.");
}

function saveSudoContent () {
  const data = {};
  EDITABLE_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      data[id] = el.innerHTML;
    }
  });

  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    showToast("💾 Saved! Webpage changes persisted to LocalStorage.");
  } catch (err) {
    showToast("⚠️ Could not save to localStorage: " + err.message);
  }
}

function loadSavedSudoContent () {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      Object.keys(data).forEach(id => {
        const el = document.getElementById(id);
        if (el && data[id]) {
          el.innerHTML = data[id];
        }
      });
    }
  } catch (err) {
    console.error("Error loading saved sudo data", err);
  }
}

function resetSudoContent () {
  if (confirm("Reset all website content back to default code values?")) {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    location.reload();
  }
}

if (sudoForm) {
  sudoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    authenticateSudo();
  });
}
if (sudoModalClose) sudoModalClose.addEventListener('click', closeSudoModal);
if (sudoSave) sudoSave.addEventListener('click', saveSudoContent);
if (sudoReset) sudoReset.addEventListener('click', resetSudoContent);
if (sudoExit) sudoExit.addEventListener('click', disableSudoAdminMode);

if (traySudo) traySudo.addEventListener('click', openSudoModal);
if (dockFiles) dockFiles.addEventListener('click', openSudoModal);

document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.altKey && (e.key === 's' || e.key === 'S')) {
    e.preventDefault();
    if (isSudoMode) {
      disableSudoAdminMode();
    } else {
      openSudoModal();
    }
  }
});

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
        openInteractiveTerminal();
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
    setTimeout(() => { toast.hidden = true; }, 300);
  }, 3200);
}

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
   REVEAL BLOCKS
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
    el.style.transitionDelay = i < 4 ? `${i * 84}ms` : '0ms'; /* +20% */
    obs.observe(el);
  });
}

/* ════════════════════════════════════════════════════
   SECTION TERMINAL CARDS — TYPEWRITER & ANIMATION (+20% duration)
════════════════════════════════════════════════════ */
function initSectionCardTypewriters () {
  const cards = document.querySelectorAll('.js-card');

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const card = entry.target;
        obs.unobserve(card);

        card.classList.add('visible');

        const cmdText   = card.dataset.cmd || '';
        const typewriter= card.querySelector('.js-typewriter');
        const output     = card.querySelector('.sec-card__output');
        const caret      = card.querySelector('.js-caret');

        let charIdx = 0;
        /* Increased typewriter speed duration by +20% */
        const typeSpeed = Math.max(36, Math.floor(720 / (cmdText.length || 1)));

        function typeChar () {
          if (charIdx < cmdText.length) {
            if (typewriter) typewriter.textContent += cmdText.charAt(charIdx);
            charIdx++;
            setTimeout(typeChar, typeSpeed);
          } else {
            setTimeout(() => {
              if (caret) caret.style.display = 'none';
              if (output) output.hidden = false;

              if (card.querySelector('#resume-progress')) {
                runResumeWget();
              }
            }, 220);
          }
        }

        setTimeout(typeChar, 300);
      }
    });
  }, {
    threshold: 0.15
  });

  cards.forEach(c => obs.observe(c));
}

function runResumeWget () {
  const progressBar  = document.getElementById('resume-progress');
  const progressText = document.getElementById('progress-text');
  const wgetDone     = document.getElementById('wget-done');
  const dlBtn        = document.getElementById('resume-dl-btn');

  if (!progressBar || !progressText) return;

  let pct = 0;
  /* +20% slower progress bar steps */
  const interval = setInterval(() => {
    pct += Math.floor(Math.random() * 15) + 10;
    if (pct >= 100) {
      pct = 100;
      clearInterval(interval);
      progressBar.style.width = '100%';
      progressText.textContent = '100%';

      setTimeout(() => {
        if (wgetDone) wgetDone.hidden = false;
        if (dlBtn) dlBtn.style.display = 'inline-flex';
      }, 360);
    } else {
      progressBar.style.width = pct + '%';
      progressText.textContent = pct + '%';
    }
  }, 120);
}
