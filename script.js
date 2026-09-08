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
  { t: 'dim', s: '# hire.sh — candidate availability probe' },
  { t: '',    s: '' },
  { t: 'g',   s: '$ ./hire.sh --check-status' },
  { t: '',    s: 'Probing current status......... [DEVOPS INTERN @ MACTORES]' },
  { t: '',    s: 'Checking core competencies..... [AWS · TERRAFORM · DOCKER · CI/CD]' },
  { t: '',    s: 'Verifying AI credentials....... [CLAUDE CERTIFIED ARCHITECT]' },
  { t: '',    s: 'Loading resume payload......... [OK — Moon_Rathi_Resume.pdf]' },
  { t: '',    s: '' },
  { t: 'g',   s: 'Status   : 🟢 Active — Open to DevOps & Cloud opportunities' },
  { t: 'g',   s: 'Response : Typically within 24 hours' },
  { t: '',    s: '' },
  { t: '',    s: 'Ready to connect? Click below to send an email ↓' },
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
const runHireBtn      = document.getElementById('run-hire-btn');

const certModal       = document.getElementById('cert-modal');
const certModalClose  = document.getElementById('cert-modal-close');
const certModalDone   = document.getElementById('cert-modal-done');
const certIconDisplay = document.getElementById('cert-icon-display');
const certNameDisplay = document.getElementById('cert-name-display');
const certIssuerDisplay = document.getElementById('cert-issuer-display');
const certCardTitle   = document.getElementById('cert-card-title');
const certIdDisplay   = document.getElementById('cert-id-display');
const certOrgDisplay  = document.getElementById('cert-org-display');
const certVerifyLink  = document.getElementById('cert-verify-link');
const certDownloadBtn = document.getElementById('cert-download-btn');

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
  const logInterval = setInterval(() => {
    if (i >= BOOT_LINES.length) {
      clearInterval(logInterval);
      setTimeout(revealDesktop, 420);
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
  }, 90);
}

function revealDesktop () {
  if (boot) {
    boot.classList.add('fade-out');
    setTimeout(() => { boot.hidden = true; }, 550);
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
  initCertModalViewer();
  initHireSh();
  updateWgetTimestamp();
  initAssetManager();

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
   CERTIFICATE VIEWER MODAL
════════════════════════════════════════════════════ */
function initLegacyCertModalViewer () {
  const certItems = document.querySelectorAll('.js-cert-item');

  certItems.forEach(item => {
    item.addEventListener('click', () => {
      const name   = item.dataset.certName || 'Certificate';
      const issuer = item.dataset.certIssuer || 'Issuer';
      const date   = item.dataset.certDate || '';
      const id     = item.dataset.certId || 'VERIFIED-CREDENTIAL';
      const icon   = item.dataset.certIcon || '📜';
      const link   = item.dataset.certLink || '#';

      if (certIconDisplay) certIconDisplay.textContent = icon;
      if (certNameDisplay) certNameDisplay.textContent = name;
      if (certIssuerDisplay) certIssuerDisplay.textContent = `${issuer} · Issued ${date}`;
      if (certCardTitle) certCardTitle.textContent = name;
      if (certIdDisplay) certIdDisplay.textContent = id;
      if (certOrgDisplay) certOrgDisplay.textContent = issuer;
      if (certVerifyLink) certVerifyLink.href = link;

      const file   = item.dataset.certFile;
      if (certDownloadBtn) {
        if (file) {
          certDownloadBtn.href = file;
          certDownloadBtn.download = name.replace(/[^a-zA-Z0-9_-]/g, '_') + '.pdf';
          certDownloadBtn.hidden = false;
        } else {
          certDownloadBtn.hidden = true;
        }
      }

      if (certModal) certModal.hidden = false;
    });
  });

  if (certModalClose) certModalClose.addEventListener('click', closeCertModal);
  if (certModalDone) certModalDone.addEventListener('click', closeCertModal);
  if (certModal) {
    certModal.addEventListener('click', e => {
      if (e.target === certModal) closeCertModal();
    });
  }
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && certModal && !certModal.hidden) closeCertModal();
  });
}

function closeCertModal () {
  if (certModal) certModal.hidden = true;
}

/* ════════════════════════════════════════════════════
   HIRE.SH INTERACTIVE MODAL
════════════════════════════════════════════════════ */
function initHireSh () {
  if (runHireBtn) runHireBtn.addEventListener('click', openHireSh);
  if (minitermClose) minitermClose.addEventListener('click', closeHireSh);
  if (minitermDone) minitermDone.addEventListener('click', closeHireSh);
  if (miniterm) {
    miniterm.addEventListener('click', e => {
      if (e.target === miniterm) closeHireSh();
    });
  }
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && miniterm && !miniterm.hidden) closeHireSh();
  });
}

function openHireSh () {
  if (hireRunning) return;
  hireRunning = true;
  if (miniterm) miniterm.hidden = false;
  if (minitermOut) minitermOut.innerHTML = '';
  if (minitermActions) minitermActions.hidden = true;

  let i = 0;
  const interval = setInterval(() => {
    if (i >= HIRE_LINES.length) {
      clearInterval(interval);
      hireRunning = false;
      if (minitermActions) minitermActions.hidden = false;
      return;
    }
    const item = HIRE_LINES[i];
    const span = document.createElement('span');
    if (item.t) span.className = item.t;
    span.textContent = item.s + '\n';
    if (minitermOut) {
      minitermOut.appendChild(span);
      minitermOut.scrollTop = minitermOut.scrollHeight;
    }
    i++;
  }, 75);
}

function closeHireSh () {
  if (miniterm) miniterm.hidden = true;
  hireRunning = false;
}

/* ════════════════════════════════════════════════════
   DYNAMIC WGET TIMESTAMP
════════════════════════════════════════════════════ */
function updateWgetTimestamp () {
  const ts = document.getElementById('wget-timestamp');
  const dt = document.getElementById('wget-done-time');
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toTimeString().slice(0, 8);
  if (ts) ts.textContent = `--${dateStr} ${timeStr}--  https://moon.rathi/Moon_Rathi_Resume.pdf`;
  if (dt) dt.textContent = timeStr;
}

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

  const validSections = ['about','experience','education','projects','skills','certs','contact','resume','top'];

  if (lower === 'help') {
    outLine.innerHTML = `Available CLI Commands:
  <span class="ok">cd &lt;section&gt;</span>  : Navigate to section (e.g. cd experience, cd projects, cd skills)
  <span class="ok">cat &lt;file&gt;</span>     : Scroll to section (e.g. cat experience, cat about)
  <span class="ok">./hire.sh</span>       : Run interactive candidate availability script
  <span class="ok">sudo / su</span>       : Open Sudo Admin password prompt
  <span class="ok">ls</span>              : List all page directories/sections
  <span class="ok">whoami</span>          : Display candidate summary
  <span class="ok">neofetch</span>        : Display environment and tech stack info
  <span class="ok">clear</span>           : Clear terminal output
  <span class="ok">exit</span>            : Close interactive terminal console`;
  }
  else if (lower === 'ls') {
    outLine.innerHTML = `<span class="ok">about/</span>  <span class="ok">experience/</span>  <span class="ok">education/</span>  <span class="ok">projects/</span>  <span class="ok">skills/</span>  <span class="ok">certs/</span>  <span class="ok">contact/</span>  <span class="ok">Moon_Rathi_Resume.pdf</span>`;
  }
  else if (lower.startsWith('cd ') || lower.startsWith('goto ')) {
    const target = lower.split(' ')[1] || '';
    if (validSections.includes(target)) {
      outLine.innerHTML = `Navigating to section <span class="ok">#${target}</span>...`;
      scrollToSection(target);
      setTimeout(closeInteractiveTerminal, 500);
    } else {
      outLine.innerHTML = `<span style="color:#ef4444">cd: no such file or directory: ${escapeHtml(target)}</span>. Type 'ls' to list sections.`;
    }
  }
  else if (lower.startsWith('cat ')) {
    const target = lower.split(' ')[1] || '';
    const clean = target.replace('.md','').replace('.txt','');
    if (validSections.includes(clean)) {
      outLine.innerHTML = `Displaying <span class="ok">#${clean}</span>...`;
      scrollToSection(clean);
      setTimeout(closeInteractiveTerminal, 500);
    } else {
      outLine.innerHTML = `<span style="color:#ef4444">cat: ${escapeHtml(target)}: No such file or directory</span>`;
    }
  }
  else if (lower === './hire.sh' || lower === 'hire.sh' || lower === 'hire') {
    outLine.innerHTML = `Executing <span class="ok">./hire.sh</span>...`;
    closeInteractiveTerminal();
    setTimeout(openHireSh, 200);
  }
  else if (lower === 'sudo' || lower === 'sudo su' || lower === 'sudo edit' || lower === 'su') {
    outLine.innerHTML = `Launching <span class="ok">Sudo Admin Authentication</span>...`;
    closeInteractiveTerminal();
    openSudoModal();
  }
  else if (lower === 'whoami') {
    outLine.innerHTML = `Moon Rathi — DevOps Engineering Intern @ Mactores &amp; B.Tech CS (Claude Certified Architect · AWS · Terraform)`;
  }
  else if (lower === 'neofetch') {
    outLine.innerHTML = `OS      : blaze.portfolio os (Linux 6.8.0-blaze)
Host    : Moon Rathi DevOps Workstation
Current : DevOps Engineering Intern @ Mactores
Stack   : AWS, Terraform, Docker, Python, GitHub Actions, Linux
Cert    : Claude Certified Architect – Foundations (Anthropic)
Status  : 🟢 Active — Open to DevOps &amp; Cloud Opportunities`;
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
    outLine.innerHTML = `<span style="color:#ef4444">bash: command not found: ${escapeHtml(cmd)}</span>. Type '<span class="ok">help</span>' or '<span class="ok">cd projects</span>'.`;
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
  }, 3000);
}

/* ════════════════════════════════════════════════════
   SCROLLSPY
════════════════════════════════════════════════════ */
function initScrollSpy () {
  const tabLinks = document.querySelectorAll('.tab-link');
  const sections = ['about','experience','education','projects','skills','certs','contact','resume'];
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

        card.classList.add('visible');

        const cmdText   = card.dataset.cmd || '';
        const typewriter= card.querySelector('.js-typewriter');
        const output     = card.querySelector('.sec-card__output');
        const caret      = card.querySelector('.js-caret');

        let charIdx = 0;
        const typeSpeed = Math.max(30, Math.floor(640 / (cmdText.length || 1)));

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
            }, 180);
          }
        }

        setTimeout(typeChar, 250);
      }
    });
  }, {
    threshold: 0.12
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

/* ════════════════════════════════════════════════════
   INTERACTIVE ASSET & CERTIFICATE MANAGER (SUDO)
   - IndexedDB for instant client storage
   - GitHub API sync for automatic live Vercel deployments
════════════════════════════════════════════════════ */

function openAssetDB () {
  return new Promise((resolve, reject) => {
    const req = globalThis.__legacyStorageDisabled.open('MoonPortfolioAssets', 1);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('assets')) {
        db.createObjectStore('assets', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('custom_certs')) {
        db.createObjectStore('custom_certs', { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbSaveAsset (id, blob, filename) {
  try {
    const db = await openAssetDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('assets', 'readwrite');
      tx.objectStore('assets').put({ id, blob, filename, time: Date.now() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('IndexedDB save error:', err);
  }
}

async function idbGetAsset (id) {
  try {
    const db = await openAssetDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('assets', 'readonly');
      const req = tx.objectStore('assets').get(id);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('IndexedDB get error:', err);
    return null;
  }
}

async function idbSaveCert (cert) {
  try {
    const db = await openAssetDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('custom_certs', 'readwrite');
      tx.objectStore('custom_certs').put(cert);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('IndexedDB cert save error:', err);
  }
}

async function idbGetAllCerts () {
  try {
    const db = await openAssetDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('custom_certs', 'readonly');
      const req = tx.objectStore('custom_certs').getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    return [];
  }
}

function getGitHubToken () {
  return '';
}

function setGitHubToken (token) {
  void token;
}

async function commitFileToGitHub (path, fileBlob, commitMsg) {
  const token = getGitHubToken();
  if (!token) throw new Error("No GitHub token configured. Click 'GitHub Sync' in Sudo Mode to configure.");

  const base64Content = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result;
      resolve(res.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(fileBlob);
  });

  let existingSha = null;
  try {
    const checkRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json'
      }
    });
    if (checkRes.ok) {
      const fileData = await checkRes.json();
      existingSha = fileData.sha;
    }
  } catch (err) {
    // File may not exist yet
  }

  const bodyData = {
    message: commitMsg,
    content: base64Content
  };
  if (existingSha) bodyData.sha = existingSha;

  const putRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(bodyData)
  });

  if (!putRes.ok) {
    const errData = await putRes.json().catch(() => ({}));
    throw new Error(errData.message || `GitHub commit failed (${putRes.status})`);
  }

  return await putRes.json();
}

async function loadStoredResume () {
  const item = await idbGetAsset('resume');
  if (item && item.blob) {
    const blobUrl = URL.createObjectURL(item.blob);
    const navCv = document.querySelector('.term__tabs-cv');
    const dlBtn = document.getElementById('resume-dl-btn');
    const filenameDisplay = document.getElementById('edit-resume-filename');

    if (navCv) {
      navCv.href = blobUrl;
      navCv.download = item.filename || 'Moon_Rathi_Resume.pdf';
    }
    if (dlBtn) {
      dlBtn.href = blobUrl;
      dlBtn.download = item.filename || 'Moon_Rathi_Resume.pdf';
    }
    if (filenameDisplay) {
      filenameDisplay.textContent = item.filename || 'Moon_Rathi_Resume.pdf';
    }
  }
}

async function loadStoredCerts () {
  const certs = await idbGetAllCerts();
  const list = document.querySelector('.certs--list');
  if (!list || !certs.length) return;

  certs.forEach(cert => {
    if (document.getElementById(`cert-item-${cert.id}`)) return;

    const div = document.createElement('div');
    div.className = 'cert js-cert-item';
    div.id = `cert-item-${cert.id}`;
    div.dataset.certName = cert.name;
    div.dataset.certIssuer = cert.issuer;
    div.dataset.certDate = cert.date || '';
    div.dataset.certId = cert.id;
    div.dataset.certIcon = cert.icon || '📜';
    div.dataset.certLink = cert.link || '#';
    if (cert.fileBlob) {
      div.dataset.certFile = URL.createObjectURL(cert.fileBlob);
    }

    div.innerHTML = `
      <div class="cert__icon">${escapeHtml(cert.icon || '📜')}</div>
      <div class="cert__info">
        <span class="cert__name">${escapeHtml(cert.name)}</span>
        <span class="cert__issuer">${escapeHtml(cert.issuer)} · ${escapeHtml(cert.date || '')}</span>
      </div>
      <span class="cert__view-hint">view certificate ↗</span>
      <span class="cert__badge cert__badge--ok">verified ✓</span>
    `;

    list.appendChild(div);
  });

  initCertModalViewer();
}

function initLegacyAssetManager () {
  const uploadResumeBtn   = document.getElementById('sudo-upload-resume-btn');
  const addCertBtn         = document.getElementById('sudo-add-cert-btn');
  const githubSyncBtn      = document.getElementById('sudo-github-sync-btn');

  const resumeModal        = document.getElementById('resume-upload-modal');
  const resumeModalClose   = document.getElementById('resume-modal-close');
  const resumeModalCancel  = document.getElementById('resume-modal-cancel');
  const resumeFileInput    = document.getElementById('resume-file-input');
  const resumeDropzone     = document.getElementById('resume-dropzone');
  const resumeFileInfo     = document.getElementById('resume-file-info');
  const saveResumeBtn      = document.getElementById('save-resume-btn');
  const syncResumeGithub   = document.getElementById('sync-resume-github');
  const resumeStatus       = document.getElementById('resume-upload-status');

  const certModalEl        = document.getElementById('cert-edit-modal');
  const certModalClose     = document.getElementById('cert-edit-modal-close');
  const certModalCancel    = document.getElementById('cert-edit-cancel');
  const certForm           = document.getElementById('cert-edit-form');
  const certStatus         = document.getElementById('cert-upload-status');

  const gitModal           = document.getElementById('github-token-modal');
  const gitModalClose      = document.getElementById('github-modal-close');
  const gitModalDone       = document.getElementById('github-modal-done');
  const gitTokenInput      = document.getElementById('github-pat-input');
  const saveGitTokenBtn    = document.getElementById('save-github-token-btn');
  const gitStatus          = document.getElementById('github-token-status');

  let selectedResumeFile = null;

  // 1. Resume Upload Handlers
  if (uploadResumeBtn && resumeModal) {
    uploadResumeBtn.addEventListener('click', () => {
      resumeModal.hidden = false;
      if (resumeStatus) resumeStatus.hidden = true;
    });
  }

  const closeResumeModal = () => { if (resumeModal) resumeModal.hidden = true; };
  if (resumeModalClose) resumeModalClose.addEventListener('click', closeResumeModal);
  if (resumeModalCancel) resumeModalCancel.addEventListener('click', closeResumeModal);

  if (resumeFileInput) {
    resumeFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file && file.type === 'application/pdf') {
        selectedResumeFile = file;
        const kb = (file.size / 1024).toFixed(1);
        if (resumeFileInfo) {
          resumeFileInfo.hidden = false;
          resumeFileInfo.innerHTML = `✓ Selected: <b>${escapeHtml(file.name)}</b> (${kb} KB)`;
        }
        if (saveResumeBtn) saveResumeBtn.disabled = false;
      }
    });
  }

  if (saveResumeBtn) {
    saveResumeBtn.addEventListener('click', async () => {
      if (!selectedResumeFile) return;
      saveResumeBtn.disabled = true;
      saveResumeBtn.textContent = 'Saving...';

      try {
        await idbSaveAsset('resume', selectedResumeFile, selectedResumeFile.name);
        await loadStoredResume();

        let ghMsg = '';
        if (syncResumeGithub && syncResumeGithub.checked && getGitHubToken()) {
          try {
            saveResumeBtn.textContent = 'Committing to GitHub...';
            await commitFileToGitHub('Moon_Rathi_Resume.pdf', selectedResumeFile, 'Update resume via Sudo Admin Web Interface');
            ghMsg = '<br>🚀 <b>Committed to GitHub!</b> Vercel will auto-redeploy your new resume in ~20 seconds.';
          } catch (ghErr) {
            ghMsg = `<br><span style="color:#ef4444">⚠️ GitHub Sync failed: ${escapeHtml(ghErr.message)}</span>`;
          }
        }

        if (resumeStatus) {
          resumeStatus.className = 'sudo-status-msg ok';
          resumeStatus.hidden = false;
          resumeStatus.innerHTML = `✓ Resume updated successfully! All website download buttons now serve this file.${ghMsg}`;
        }
        showToast('📄 Resume updated successfully!');
        setTimeout(closeResumeModal, 2800);
      } catch (err) {
        if (resumeStatus) {
          resumeStatus.className = 'sudo-status-msg err';
          resumeStatus.hidden = false;
          resumeStatus.textContent = 'Error: ' + err.message;
        }
      } finally {
        saveResumeBtn.disabled = false;
        saveResumeBtn.textContent = 'Apply & Save Resume';
      }
    });
  }

  // 2. Certificate Add/Edit Handlers
  if (addCertBtn && certModalEl) {
    addCertBtn.addEventListener('click', () => {
      certModalEl.hidden = false;
      if (certStatus) certStatus.hidden = true;
    });
  }

  const closeCertModalEl = () => { if (certModalEl) certModalEl.hidden = true; };
  if (certModalClose) certModalClose.addEventListener('click', closeCertModalEl);
  if (certModalCancel) certModalCancel.addEventListener('click', closeCertModalEl);

  if (certForm) {
    certForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const saveCertBtn = document.getElementById('save-cert-btn');
      if (saveCertBtn) saveCertBtn.disabled = true;

      const title  = document.getElementById('cert-input-title').value.trim();
      const issuer = document.getElementById('cert-input-issuer').value.trim();
      const date   = document.getElementById('cert-input-date').value.trim();
      const id     = document.getElementById('cert-input-id').value.trim() || 'CERT-' + Date.now();
      const icon   = document.getElementById('cert-input-icon').value.trim() || '📜';
      const url    = document.getElementById('cert-input-url').value.trim() || '#';
      const fileIn = document.getElementById('cert-file-input');
      const sync   = document.getElementById('sync-cert-github');

      const certDoc = (fileIn && fileIn.files.length) ? fileIn.files[0] : null;

      try {
        const certObj = { id, name: title, issuer, date, icon, link: url, fileBlob: certDoc };
        await idbSaveCert(certObj);
        await loadStoredCerts();

        let ghMsg = '';
        if (certDoc && sync && sync.checked && getGitHubToken()) {
          try {
            const ext = certDoc.name.split('.').pop() || 'pdf';
            const cleanPath = `certs/${id.toLowerCase()}.${ext}`;
            await commitFileToGitHub(cleanPath, certDoc, `Add certificate: ${title}`);
            ghMsg = '<br>🚀 <b>Certificate committed to GitHub!</b> Auto-deploying to Vercel.';
          } catch (ghErr) {
            ghMsg = `<br><span style="color:#ef4444">⚠️ GitHub Sync failed: ${escapeHtml(ghErr.message)}</span>`;
          }
        }

        if (certStatus) {
          certStatus.className = 'sudo-status-msg ok';
          certStatus.hidden = false;
          certStatus.innerHTML = `✓ Certificate "${escapeHtml(title)}" added to certifications list!${ghMsg}`;
        }
        showToast('📜 Certificate added to list!');
        setTimeout(closeCertModalEl, 2400);
      } catch (err) {
        if (certStatus) {
          certStatus.className = 'sudo-status-msg err';
          certStatus.hidden = false;
          certStatus.textContent = 'Error: ' + err.message;
        }
      } finally {
        if (saveCertBtn) saveCertBtn.disabled = false;
      }
    });
  }

  // 3. GitHub Token Config Handlers
  if (githubSyncBtn && gitModal) {
    githubSyncBtn.addEventListener('click', () => {
      gitModal.hidden = false;
      if (gitTokenInput) gitTokenInput.value = getGitHubToken();
      if (gitStatus) gitStatus.hidden = true;
    });
  }

  const closeGitModal = () => { if (gitModal) gitModal.hidden = true; };
  if (gitModalClose) gitModalClose.addEventListener('click', closeGitModal);
  if (gitModalDone) gitModalDone.addEventListener('click', closeGitModal);

  if (saveGitTokenBtn && gitTokenInput) {
    saveGitTokenBtn.addEventListener('click', async () => {
      const token = gitTokenInput.value.trim();
      if (!token) {
        setGitHubToken('');
        if (gitStatus) {
          gitStatus.className = 'sudo-status-msg ok';
          gitStatus.hidden = false;
          gitStatus.textContent = 'GitHub token cleared. Files will be saved in browser storage only.';
        }
        return;
      }

      saveGitTokenBtn.disabled = true;
      saveGitTokenBtn.textContent = 'Testing Token...';

      try {
        const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github+json'
          }
        });
        if (!res.ok) throw new Error('Repository write permission required or invalid token');

        setGitHubToken(token);
        if (gitStatus) {
          gitStatus.className = 'sudo-status-msg ok';
          gitStatus.hidden = false;
          gitStatus.innerHTML = `✓ <b>Connected successfully to ${GITHUB_REPO}!</b><br>You can now upload resumes and certificates directly from the webpage.`;
        }
        showToast('🐙 GitHub connection verified!');
      } catch (err) {
        if (gitStatus) {
          gitStatus.className = 'sudo-status-msg err';
          gitStatus.hidden = false;
          gitStatus.textContent = 'Failed: ' + err.message;
        }
      } finally {
        saveGitTokenBtn.disabled = false;
        saveGitTokenBtn.textContent = 'Save & Test Connection';
      }
    });
  }
}

/* ════════════════════════════════════════════════════
   SERVER-BACKED SUDO EDITOR
════════════════════════════════════════════════════ */
let remoteSite = null;
let editingCertificateId = '';

async function portfolioApi(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'same-origin',
    headers: { 'content-type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const raw = await response.text();
  let data = {};
  try { data = raw ? JSON.parse(raw) : {}; } catch {
    data = { error: raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() };
  }
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
}

function normalizeLink(value, fallback = '#') {
  const text = String(value || '').trim();
  return text || fallback;
}

function renderRemoteProjects(projects = []) {
  const items = document.querySelectorAll('.proj');
  items.forEach(item => { item.hidden = true; });
  projects.filter(project => project.isActive !== false).forEach((project, index) => {
    const item = items[index];
    if (!item) return;
    item.hidden = false;
    item.href = normalizeLink(project.url);
    const name = item.querySelector('.proj__name');
    const description = item.querySelector('.proj__desc');
    if (name) name.textContent = project.name;
    if (description) description.textContent = project.description;
    item.dataset.projectId = project.id;
    let actions = item.querySelector('.proj__sudo-actions');
    if (!actions) {
      actions = document.createElement('div');
      actions.className = 'proj__sudo-actions sudo-only';
      actions.innerHTML = '<button type="button" class="sudo-item-btn" data-project-edit>Edit</button><button type="button" class="sudo-item-btn sudo-item-btn--delete" data-project-delete>Delete</button>';
      item.querySelector('.proj__head')?.appendChild(actions);
    }
  });
  document.querySelectorAll('[data-project-edit]').forEach(button => {
    button.onclick = event => { event.preventDefault(); event.stopPropagation(); openProjectEdit(button.closest('.proj')); };
  });
  document.querySelectorAll('[data-project-delete]').forEach(button => {
    button.onclick = event => { event.preventDefault(); event.stopPropagation(); deleteProject(button.closest('.proj')); };
  });
}

function renderRemoteCertificates(certificates = []) {
  const list = document.getElementById('certs-list') || document.querySelector('.certs--list');
  if (!list) return;
  list.innerHTML = '';
  certificates.filter(cert => cert.isActive !== false).forEach(cert => {
    const item = document.createElement('div');
    item.className = 'cert js-cert-item';
    item.dataset.certName = cert.name;
    item.dataset.certIssuer = cert.issuer;
    item.dataset.certDate = cert.date || '';
    item.dataset.certId = cert.credentialId || cert.id;
    item.dataset.certIcon = cert.icon || '📜';
    item.dataset.certLink = cert.credentialUrl || '#';
    item.dataset.certFile = cert.fileUrl || '';
    item.dataset.certDbId = cert.id;
    item.innerHTML = `<div class="cert__icon">${escapeHtml(cert.icon || '📜')}</div>
      <div class="cert__info"><span class="cert__name">${escapeHtml(cert.name)}</span>
      <span class="cert__issuer">${escapeHtml(cert.issuer)} · ${escapeHtml(cert.date || '')}</span></div>
      <span class="cert__view-hint">view certificate ↗</span>
      <span class="cert__badge cert__badge--ok">verified ✓</span>
      <div class="cert__sudo-actions sudo-only">
        <button type="button" class="cert__action-btn cert__action-btn--edit" data-cert-edit="${escapeHtml(cert.id)}">Edit</button>
        <button type="button" class="cert__action-btn cert__action-btn--del" data-cert-delete="${escapeHtml(cert.id)}">Delete</button>
      </div>`;
    list.appendChild(item);
  });
  initCertModalViewer();
  if (isSudoMode) document.body.classList.add('sudo-active');
}

function syncRemoteLinks(site) {
  const links = site.links || {};
  const email = document.getElementById('edit-email-link');
  const linkedin = document.getElementById('edit-linkedin-link');
  const github = document.getElementById('edit-github-link');
  if (email && links.email) { email.textContent = links.email; email.href = `mailto:${links.email}`; }
  if (linkedin && links.linkedin) { linkedin.textContent = links.linkedin.replace(/^https?:\/\//, ''); linkedin.href = links.linkedin; }
  if (github && links.github) { github.textContent = links.github.replace(/^https?:\/\//, ''); github.href = links.github; }
}

async function loadSavedSudoContent () {
  try {
    const data = await portfolioApi('/api/site');
    remoteSite = data;
    Object.entries(data.content || {}).forEach(([id, html]) => {
      const element = document.getElementById(id);
      if (element && html) element.innerHTML = html;
    });
    renderRemoteProjects(data.projects);
    renderRemoteCertificates(data.certificates);
    syncRemoteLinks(data);
    loadRemoteResume(data.profile);
  } catch (error) {
    console.error('Unable to load remote portfolio data', error);
  }
}

function loadRemoteResume(profile = {}) {
  const url = profile.resumeUrl || './Moon_Rathi_Resume.pdf';
  const filename = profile.resumeFilename || 'Moon_Rathi_Resume.pdf';
  document.querySelectorAll('.term__tabs-cv, #resume-dl-btn').forEach(link => {
    link.href = url;
    link.download = filename;
  });
  const filenameDisplay = document.getElementById('edit-resume-filename');
  if (filenameDisplay) filenameDisplay.textContent = filename;
}

async function authenticateSudo () {
  try {
    await portfolioApi('/api/auth', { method: 'POST', body: JSON.stringify({ password: sudoPassInput?.value || '' }) });
    closeSudoModal();
    enableSudoAdminMode();
    showToast('Authenticated. Sudo Admin Mode active.');
  } catch (error) {
    if (sudoError) { sudoError.hidden = false; sudoError.textContent = error.message; }
  }
}

async function saveSudoContent () {
  const content = {};
  EDITABLE_IDS.forEach(id => {
    const element = document.getElementById(id);
    if (element) content[id] = element.innerHTML;
  });
  try {
    const result = await portfolioApi('/api/admin', { method: 'POST', body: JSON.stringify({ action: 'save-content', content }) });
    remoteSite = result.site;
    syncRemoteLinks(remoteSite);
    showToast('Saved locally to data/site.json.');
  } catch (error) { showToast(`Could not save: ${error.message}`); }
}

async function resetSudoContent () {
  showToast('Reset is disabled in the web editor. Edit and save the fields you need.');
}

function fileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function uploadPortfolioFile(file, folder, id) {
  const extension = (file.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
  const path = `${folder}/${id}.${extension}`;
  const result = await portfolioApi('/api/admin', {
    method: 'POST',
    body: JSON.stringify({ action: 'upload', path, contentType: file.type, base64: await fileAsBase64(file) })
  });
  return result.url;
}

function openCertEdit(item) {
  const cert = remoteSite?.certificates?.find(entry => entry.id === item.dataset.certDbId);
  if (!cert) return;
  editingCertificateId = cert.id;
  document.getElementById('cert-input-title').value = cert.name;
  document.getElementById('cert-input-issuer').value = cert.issuer;
  document.getElementById('cert-input-date').value = cert.date || '';
  document.getElementById('cert-input-id').value = cert.credentialId || '';
  document.getElementById('cert-input-icon').value = cert.icon || '📜';
  document.getElementById('cert-input-url').value = cert.credentialUrl === '#' ? '' : cert.credentialUrl || '';
  document.getElementById('cert-edit-modal').hidden = false;
}

async function deleteCert(item) {
  if (!confirm(`Delete ${item.dataset.certName}?`)) return;
  try {
    const result = await portfolioApi('/api/admin', { method: 'POST', body: JSON.stringify({ action: 'delete-certificate', id: item.dataset.certDbId }) });
    remoteSite = result.site;
    renderRemoteCertificates(remoteSite.certificates);
    showToast('Certificate deleted.');
  } catch (error) { showToast(`Could not delete: ${error.message}`); }
}

function openProjectEdit(item) {
  const project = remoteSite?.projects?.find(entry => entry.id === item.dataset.projectId);
  if (!project) return;
  document.getElementById('project-input-id').value = project.id;
  document.getElementById('project-input-name').value = project.name;
  document.getElementById('project-input-description').value = project.description;
  document.getElementById('project-input-url').value = project.url;
  document.getElementById('project-edit-modal').hidden = false;
}

async function deleteProject(item) {
  if (!confirm(`Delete ${item.querySelector('.proj__name')?.textContent || 'this project'}?`)) return;
  try {
    const result = await portfolioApi('/api/admin', { method: 'POST', body: JSON.stringify({ action: 'delete-project', id: item.dataset.projectId }) });
    remoteSite = result.site;
    renderRemoteProjects(remoteSite.projects);
    showToast('Project deleted.');
  } catch (error) { showToast(`Could not delete: ${error.message}`); }
}

function initCertModalViewer () {
  document.querySelectorAll('.js-cert-item').forEach(item => {
    item.onclick = event => {
      if (event.target.closest('.cert__sudo-actions')) return;
      const name = item.dataset.certName || 'Certificate';
      if (certIconDisplay) certIconDisplay.textContent = item.dataset.certIcon || '📜';
      if (certNameDisplay) certNameDisplay.textContent = name;
      if (certIssuerDisplay) certIssuerDisplay.textContent = `${item.dataset.certIssuer || 'Issuer'} · Issued ${item.dataset.certDate || ''}`;
      if (certCardTitle) certCardTitle.textContent = name;
      if (certIdDisplay) certIdDisplay.textContent = item.dataset.certId || 'VERIFIED-CREDENTIAL';
      if (certOrgDisplay) certOrgDisplay.textContent = item.dataset.certIssuer || 'Issuer';
      if (certVerifyLink) { certVerifyLink.href = item.dataset.certLink || '#'; certVerifyLink.hidden = !item.dataset.certLink || item.dataset.certLink === '#'; }
      if (certDownloadBtn) {
        certDownloadBtn.href = item.dataset.certFile || '#';
        certDownloadBtn.download = `${name.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
        certDownloadBtn.hidden = !item.dataset.certFile;
      }
      const preview = document.querySelector('.cert-preview-card');
      if (preview) {
        const existing = preview.querySelector('.cert-live-file');
        if (existing) existing.remove();
        const file = item.dataset.certFile;
        if (file) {
          const element = file.toLowerCase().endsWith('.pdf') ? document.createElement('iframe') : document.createElement('img');
          element.className = 'cert-live-file';
          element.src = file;
          element.alt = name;
          preview.appendChild(element);
        }
      }
      if (certModal) certModal.hidden = false;
    };
  });
  document.querySelectorAll('[data-cert-edit]').forEach(button => {
    button.onclick = event => { event.stopPropagation(); openCertEdit(button.closest('.js-cert-item')); };
  });
  document.querySelectorAll('[data-cert-delete]').forEach(button => {
    button.onclick = event => { event.stopPropagation(); deleteCert(button.closest('.js-cert-item')); };
  });
}

function initAssetManager () {
  const resumeModal = document.getElementById('resume-upload-modal');
  const certModalEl = document.getElementById('cert-edit-modal');
  let selectedResumeFile = null;
  document.getElementById('sudo-upload-resume-btn')?.addEventListener('click', () => { resumeModal.hidden = false; });
  document.getElementById('resume-modal-close')?.addEventListener('click', () => { resumeModal.hidden = true; });
  document.getElementById('resume-modal-cancel')?.addEventListener('click', () => { resumeModal.hidden = true; });
  document.getElementById('resume-file-input')?.addEventListener('change', event => {
    selectedResumeFile = event.target.files[0] || null;
    const info = document.getElementById('resume-file-info');
    if (info && selectedResumeFile) { info.hidden = false; info.textContent = `Selected: ${selectedResumeFile.name}`; }
    const save = document.getElementById('save-resume-btn');
    if (save) save.disabled = !selectedResumeFile;
  });
  document.getElementById('save-resume-btn')?.addEventListener('click', async () => {
    if (!selectedResumeFile) return;
    try {
      const url = await uploadPortfolioFile(selectedResumeFile, 'assets', 'resume');
      const result = await portfolioApi('/api/admin', { method: 'POST', body: JSON.stringify({ action: 'save-profile', profile: { resumeUrl: url, resumeFilename: selectedResumeFile.name } }) });
      remoteSite = result.site;
      loadRemoteResume(remoteSite.profile);
      resumeModal.hidden = true;
      showToast('Resume uploaded and saved.');
    } catch (error) { showToast(`Resume upload failed: ${error.message}`); }
  });
  document.getElementById('sudo-add-cert-btn')?.addEventListener('click', () => {
    editingCertificateId = '';
    document.getElementById('cert-edit-form')?.reset();
    certModalEl.hidden = false;
  });
  const projectModal = document.getElementById('project-edit-modal');
  document.getElementById('project-edit-modal-close')?.addEventListener('click', () => { projectModal.hidden = true; });
  document.getElementById('project-edit-cancel')?.addEventListener('click', () => { projectModal.hidden = true; });
  document.getElementById('project-edit-form')?.addEventListener('submit', async event => {
    event.preventDefault();
    try {
      const result = await portfolioApi('/api/admin', { method: 'POST', body: JSON.stringify({ action: 'save-project', project: {
        id: document.getElementById('project-input-id').value,
        name: document.getElementById('project-input-name').value,
        description: document.getElementById('project-input-description').value,
        url: document.getElementById('project-input-url').value,
        sortOrder: remoteSite?.projects?.find(project => project.id === document.getElementById('project-input-id').value)?.sortOrder || 0
      } }) });
      remoteSite = result.site;
      renderRemoteProjects(remoteSite.projects);
      projectModal.hidden = true;
      showToast('Project saved locally.');
    } catch (error) { showToast(`Project save failed: ${error.message}`); }
  });
  document.getElementById('cert-edit-modal-close')?.addEventListener('click', () => { certModalEl.hidden = true; });
  document.getElementById('cert-edit-cancel')?.addEventListener('click', () => { certModalEl.hidden = true; });
  document.getElementById('cert-edit-form')?.addEventListener('submit', async event => {
    event.preventDefault();
    const file = document.getElementById('cert-file-input')?.files[0];
    const id = editingCertificateId || document.getElementById('cert-input-id').value.trim() || `cert-${Date.now()}`;
    const current = remoteSite?.certificates?.find(cert => cert.id === id);
    try {
      const fileUrl = file ? await uploadPortfolioFile(file, 'certs', id) : current?.fileUrl || '';
      const result = await portfolioApi('/api/admin', { method: 'POST', body: JSON.stringify({ action: 'save-certificate', certificate: {
        id, name: document.getElementById('cert-input-title').value, issuer: document.getElementById('cert-input-issuer').value,
        date: document.getElementById('cert-input-date').value, credentialId: document.getElementById('cert-input-id').value || id,
        credentialUrl: document.getElementById('cert-input-url').value || '#', icon: document.getElementById('cert-input-icon').value || '📜', fileUrl,
        sortOrder: current?.sortOrder || (remoteSite?.certificates?.length || 0) + 1
      } }) });
      remoteSite = result.site;
      renderRemoteCertificates(remoteSite.certificates);
      certModalEl.hidden = true;
      showToast('Certificate saved.');
    } catch (error) { showToast(`Certificate save failed: ${error.message}`); }
  });
  document.getElementById('sudo-github-sync-btn')?.remove();
}
