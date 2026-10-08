/* Portfolio Ecosystem JS — chrome, theme, loader, particles, terminal, typing */
(function () {
  'use strict';
  const body = document.body;
  const depth = parseInt(body.dataset.depth || '0', 10);
  const activePage = body.dataset.page || 'home';
  const root = depth === 0 ? '' : '../'.repeat(depth);
  const HOME = root + 'index.html';

  const NAV = [
    { id: 'home',       label: 'Home',       href: HOME },
    { id: 'about',      label: 'About',      href: root + 'about.html' },
    { id: 'experience', label: 'Experience', href: root + 'experience.html' },
    { id: 'projects',   label: 'Projects',   href: root + 'projects.html' },
    { id: 'services',   label: 'Services',   href: root + 'services.html' },
    { id: 'process',    label: 'Process',    href: root + 'process.html' },
    { id: 'blog',       label: 'Writing',    href: root + 'blog/index.html' },
    { id: 'contact',    label: 'Contact',    href: root + 'contact.html' }
  ];
  const navHTML = NAV.map(l => `<a href="${l.href}" class="${activePage === l.id ? 'active' : ''}">${l.label}</a>`).join('');

  const chromeTop = `
    <div id="loader" role="status" aria-live="polite">
      <div id="loader-content">
        <div id="loader-brand">agene@asobuilds.dev</div>
        <div id="loader-percent">0%</div>
        <div id="loader-bar-track"><div id="loader-bar-fill"></div></div>
        <div id="loader-status">Initializing boot sequence...</div>
        <div id="loader-log"></div>
      </div>
    </div>
    <div id="status-bar"><span id="status-left">🖥️ agene@asobuilds.dev</span><span id="status-right"><span id="status-time"></span><span id="status-date"></span></span></div>
    <canvas id="bg-canvas"></canvas>
    <div class="shape shape-1"></div><div class="shape shape-2"></div><div class="shape shape-3"></div><div class="shape shape-4"></div>
    <a class="skip-link" href="#main">Skip to Content</a>`;

  const headerHTML = `
    <header id="site-header"><div class="header-inner">
      <a href="${HOME}" class="logo"><span class="logo-dot"></span>agene@asobuilds.dev</a>
      <nav class="nav-links" id="nav-links">${navHTML}</nav>
      <div class="header-actions">
        <button id="theme-toggle" class="theme-toggle" aria-label="Toggle theme">
          <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
          <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        </button>
        <button class="menu-toggle" id="menu-toggle" aria-label="Menu"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg></button>
      </div>
    </div></header>`;

  const footerHTML = `
    <footer id="site-footer"><div class="footer-inner">
      <p>&copy; ${new Date().getFullYear()} Agene S. Okoh. Built with ❤️</p>
      <div class="footer-links">
        <a href="${root}about.html">About</a>
        <a href="${root}projects.html">Projects</a>
        <a href="${root}services.html">Services</a><a href="${root}blog/index.html">Writing</a>
        <a href="${root}contact.html">Contact</a>
        <a href="https://www.linkedin.com/in/agene-sunday-4b35702aa" target="_blank" rel="noopener">LinkedIn</a>
        <a href="https://wa.me/2348167135998" target="_blank" rel="noopener">WhatsApp</a>
      </div>
    </div></footer>`;

  const terminalHTML = `
    <div id="terminal-overlay" role="dialog" aria-label="Terminal">
      <div id="terminal-header"><span>📟 Terminal — asobuilds.dev</span><button id="terminal-close" aria-label="Close terminal">✕</button></div>
      <div id="terminal-output"><div class="terminal-line">&gt; Welcome to agene@asobuilds.dev</div><div class="terminal-line">&gt; Type 'help' for available commands</div><div class="terminal-line">&gt;</div></div>
      <div id="terminal-input-wrap"><span class="terminal-prompt">$</span><input type="text" id="terminal-input" autocomplete="off" spellcheck="false" placeholder="Enter command..." /></div>
    </div>`;

  body.insertAdjacentHTML('afterbegin', chromeTop);
  const mainEl = body.querySelector('main.page') || body.querySelector('main');
  if (mainEl) mainEl.insertAdjacentHTML('beforebegin', headerHTML); else body.insertAdjacentHTML('beforeend', headerHTML);
  body.insertAdjacentHTML('beforeend', footerHTML + terminalHTML);

  const storedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', storedTheme);
  document.getElementById('theme-toggle').addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme');
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });

  const navLinks = document.getElementById('nav-links');
  document.getElementById('menu-toggle').addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

  /* ============ LOADER ============ */
  const loader = document.getElementById('loader');
  const percentDisplay = document.getElementById('loader-percent');
  const barFill = document.getElementById('loader-bar-fill');
  const statusText = document.getElementById('loader-status');
  const logEl = document.getElementById('loader-log');

  const steps = [
    { at: 0,  status: 'Initializing boot sequence...', log: '▶ cold start' },
    { at: 12, status: 'Loading UI shell...',          log: '▶ css tokens loaded' },
    { at: 28, status: 'Mounting components...',       log: '▶ header · nav · footer' },
    { at: 45, status: 'Starting particle engine...',  log: '▶ canvas 2d ready' },
    { at: 62, status: 'Connecting to kernel...',      log: '▶ terminal online [ctrl + `]' },
    { at: 78, status: 'Fetching profile data...',     log: '▶ projects · experience' },
    { at: 92, status: 'Warming up the bits...',       log: '▶ almost there' },
    { at: 100, status: 'Ready.',                      log: '✅ system ready' }
  ];

  function finishLoader() {
    loader.classList.add('hidden');
    setTimeout(() => { loader.style.display = 'none'; }, 600);
  }

  function simulateLoading() {
    let progress = 0;
    let stepIdx = 0;
    const start = performance.now();

    (function tick() {
      // ease-out curve, ~1.6s total
      const elapsed = performance.now() - start;
      const t = Math.min(elapsed / 1600, 1);
      const eased = 1 - Math.pow(1 - t, 2.2);
      progress = Math.min(eased * 100, 100);

      percentDisplay.textContent = Math.floor(progress) + '%';
      barFill.style.width = progress + '%';

      while (stepIdx < steps.length && progress >= steps[stepIdx].at) {
        statusText.textContent = steps[stepIdx].status;
        const logLine = document.createElement('div');
        logLine.className = 'loader-log-line';
        logLine.textContent = steps[stepIdx].log;
        logEl.appendChild(logLine);
        stepIdx++;
      }

      if (progress < 100) {
        requestAnimationFrame(tick);
      } else {
        setTimeout(finishLoader, 420);
      }
    })();
  }

  if (sessionStorage.getItem('visited')) {
    finishLoader();
  } else {
    sessionStorage.setItem('visited', '1');
    simulateLoading();
  }

  /* ============ CLOCK ============ */
  function updateClock() {
    const now = new Date();
    document.getElementById('status-time').textContent = now.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
    document.getElementById('status-date').textContent = now.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric', year:'numeric' });
  }
  updateClock(); setInterval(updateClock, 1000);

  /* ============ PARTICLES (respects reduced motion + mobile) ============ */
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth < 700;
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let width, height, particles, mouse = null;

  function resize() { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; }
  resize();
  let resizeTimer;
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 150); });

  if (!prefersReduced) {
    class Particle {
      constructor() { this.x = Math.random()*width; this.y = Math.random()*height; this.size = Math.random()*1.6+0.4; this.speedX = (Math.random()-0.5)*0.35; this.speedY = (Math.random()-0.5)*0.35; this.opacity = Math.random()*0.5+0.15; }
      update() {
        this.x += this.speedX; this.y += this.speedY;
        if (this.x > width) this.x = 0; if (this.x < 0) this.x = width;
        if (this.y > height) this.y = 0; if (this.y < 0) this.y = height;
        if (mouse) { const dx = this.x-mouse.x, dy = this.y-mouse.y, dist = Math.hypot(dx,dy); if (dist < 140) { const a = Math.atan2(dy,dx), f = ((140-dist)/140)*0.4; this.x += Math.cos(a)*f; this.y += Math.sin(a)*f; } }
      }
      draw() { ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI*2); ctx.fillStyle = `rgba(59,130,246,${this.opacity})`; ctx.fill(); }
    }
    const count = isMobile ? 40 : Math.min(120, Math.floor((width*height)/12000));
    particles = Array.from({ length: count }, () => new Particle());
    document.addEventListener('mousemove', e => { mouse = { x: e.clientX, y: e.clientY }; });
    document.addEventListener('mouseleave', () => { mouse = null; });
    function animate() {
      ctx.clearRect(0,0,width,height);
      for (let i=0;i<particles.length;i++) for (let j=i+1;j<particles.length;j++) {
        const dx = particles[i].x-particles[j].x, dy = particles[i].y-particles[j].y, d = Math.hypot(dx,dy);
        if (d < 110) { ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y); ctx.strokeStyle = `rgba(59,130,246,${(1-d/110)*0.25})`; ctx.lineWidth = 0.5; ctx.stroke(); }
      }
      particles.forEach(p => { p.update(); p.draw(); });
      requestAnimationFrame(animate);
    }
    animate();
  }

  /* ============ SCROLL ANIMATIONS ============ */
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => { entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }); }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
  } else {
    document.querySelectorAll('.fade-in').forEach(el => el.classList.add('visible'));
  }

  /* ============ TERMINAL ============ */
  const terminal = document.getElementById('terminal-overlay');
  const tInput = document.getElementById('terminal-input');
  const tOutput = document.getElementById('terminal-output');
  document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.key === '`') { e.preventDefault(); terminal.classList.toggle('active'); if (terminal.classList.contains('active')) setTimeout(() => tInput.focus(), 100); }
    if (e.key === 'Escape' && terminal.classList.contains('active')) terminal.classList.remove('active');
  });
  document.getElementById('terminal-close').addEventListener('click', () => terminal.classList.remove('active'));
  const commands = {
    help: () => ['Available commands:','  help      - Show this help message','  about     - About Agene S. Okoh','  skills    - List technical skills','  projects  - Show current projects','  services  - Show available services','  contact   - Contact information','  whoami    - Display current user','  date      - Show current date and time','  echo      - Repeat what you type','  clear     - Clear the terminal'].join('\n'),
    about: () => 'Agene S. Okoh — AI Native | Full Stack Developer | Software Engineer\nBuilding digital solutions with Python, Go, and React.',
    skills: () => 'Python • Go • JavaScript • React • CSS • Git • Docker • PostgreSQL',
    projects: () => '🌱 Plant Assistant · 💼 DevCraft Career · 🛡️ NativityGuard\n🎨 My Creative Partner · 📘 LeadClear Journal\n🔗 Visit /projects.html for case studies.',
    services: () => '• AI-Powered Web Apps\n• Full-Stack Development\n• API Design & Integration\n• Landing Pages & Funnels\n• Technical Consulting\n🔗 Visit /services.html for details.',
    contact: () => 'Email: agenesunday143@gmail.com\nWhatsApp: +234 816 713 5998\nLinkedIn: linkedin.com/in/agene-sunday-4b35702aa\nGitHub: github.com/asobuilds\nX: x.com/Asobuilds',
    whoami: () => 'agene@asobuilds.dev',
    date: () => new Date().toString(),
    echo: args => args.join(' ') || '...',
    clear: () => { tOutput.innerHTML = ''; return null; }
  };
  tInput.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const input = tInput.value.trim(); tInput.value = '';
    const line = document.createElement('div'); line.className = 'terminal-line';
    line.innerHTML = `<span style="color:#22c55e;">$</span> ${input.replace(/</g, '&lt;')}`;
    tOutput.appendChild(line);
    const [cmd, ...args] = input.split(' '); const c = (cmd||'').toLowerCase();
    let output = '';
    if (c === 'clear') commands.clear();
    else if (commands[c]) output = commands[c](args);
    else if (c) output = `Command not found: ${c}. Type 'help' for available commands.`;
    if (output !== null && output !== undefined && output !== '') { const o = document.createElement('div'); o.className = 'terminal-line'; o.textContent = output; tOutput.appendChild(o); }
    tOutput.scrollTop = tOutput.scrollHeight;
  });

  /* ============ TYPING EFFECT ============ */
  const typingEl = document.querySelector('.typing-text');
  if (typingEl && !prefersReduced) {
    const phrases = ['AI Native | Full Stack Developer | Software Engineer','Building digital solutions with AI','Python • Go • React','Turning ideas into impact'];
    let pi = 0, ci = 0, deleting = false;
    (function type() {
      const phrase = phrases[pi];
      typingEl.textContent = deleting ? phrase.substring(0, ci-1) : phrase.substring(0, ci+1);
      deleting ? ci-- : ci++;
      let delay = deleting ? 40 : 80;
      if (!deleting && ci === phrase.length) { delay = 2200; deleting = true; }
      else if (deleting && ci === 0) { deleting = false; pi = (pi+1) % phrases.length; delay = 400; }
      setTimeout(type, delay);
    })();
  } else if (typingEl) {
    typingEl.textContent = 'AI Native | Full Stack Developer | Software Engineer';
  }

})();
/* ============ READING TIME + PROGRESS BAR ============ */
(function() {
  const article = document.querySelector('article.section');
  if (!article) return;

  // Reading time
  const text = article.innerText || '';
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));

  const sectionHeader = article.querySelector('.section-header');
  if (sectionHeader) {
    const meta = document.createElement('div');
    meta.className = 'reading-meta';
    meta.innerHTML = '<span>⏱️ ' + minutes + ' min read</span><span>📝 ' + words.toLocaleString() + ' words</span>';
    sectionHeader.appendChild(meta);
  }

  // Progress bar
  const bar = document.createElement('div');
  bar.id = 'reading-progress';
  document.body.appendChild(bar);

  function updateProgress() {
    const rect = article.getBoundingClientRect();
    const total = article.offsetHeight - window.innerHeight;
    const scrolled = Math.max(0, -rect.top);
    const pct = Math.min(100, Math.max(0, (scrolled / total) * 100));
    bar.style.width = pct + '%';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();
})();

/* ============ STICKY TABLE OF CONTENTS ============ */
(function() {
  const article = document.querySelector('article.section');
  if (!article) return;

  const headings = Array.from(article.querySelectorAll('h2, h3'));
  if (headings.length < 3) return;

  // Add IDs if missing
  headings.forEach(function(h) {
    if (!h.id) {
      h.id = (h.textContent || '').trim().toLowerCase()
        .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }
  });

  // Build sidebar
  const aside = document.createElement('aside');
  aside.className = 'toc-sidebar';
  aside.setAttribute('aria-label', 'Table of contents');
  aside.innerHTML = '<p class="toc-title">On this page</p><nav class="toc"></nav>';
  const nav = aside.querySelector('.toc');

  headings.forEach(function(h) {
    const a = document.createElement('a');
    a.href = '#' + h.id;
    a.textContent = h.textContent;
    a.className = 'toc-link' + (h.tagName === 'H3' ? ' toc-h3' : '');
    nav.appendChild(a);
  });

  // Wrap article + sidebar in flex container
  const container = article.parentElement;
  const wrapper = document.createElement('div');
  wrapper.className = 'post-with-toc container';
  container.insertBefore(wrapper, article);
  wrapper.appendChild(article);
  wrapper.appendChild(aside);

  // Scroll spy
  const links = Array.from(nav.querySelectorAll('.toc-link'));
  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        links.forEach(function(l) { l.classList.remove('toc-active'); });
        const active = links.find(function(l) { return l.getAttribute('href') === '#' + entry.target.id; });
        if (active) active.classList.add('toc-active');
      }
    });
  }, { rootMargin: '-100px 0px -70% 0px', threshold: 0 });
  headings.forEach(function(h) { observer.observe(h); });
})();
