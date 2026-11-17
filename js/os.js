/* Portfolio OS — core: helpers, icons, virtual filesystem, window manager, desktop shell. */
(() => {
  'use strict';

  const D = window.PORTFOLIO;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const h = html => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const isMobile = () => matchMedia('(max-width: 720px)').matches;
  const isCoarse = () => matchMedia('(pointer: coarse)').matches;
  const store = {
    get(k) { try { return localStorage.getItem('pos:' + k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem('pos:' + k, v); } catch { /* storage unavailable */ } }
  };

  /* ---------- Icons ---------- */
  const GLYPH = {
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
    folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    terminal: '<path d="M5 8l4 4-4 4M12 16h7"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18"/>',
    play: '<path d="M8 5v14l11-7z" fill="currentColor"/>',
    pause: '<path d="M8 5v14M16 5v14"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    text: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-8 9"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    fwd: '<path d="M9 5l7 7-7 7"/>',
    up: '<path d="M5 15l7-7 7 7"/>',
    home: '<path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z"/>',
    reload: '<path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v5h-5"/>',
    grid: '<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>',
    list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
    ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    prev: '<path d="M18 5v14L8 12z" fill="currentColor"/><path d="M6 5v14"/>',
    next: '<path d="M6 5v14l10-7z" fill="currentColor"/><path d="M18 5v14"/>',
    volume: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6"/>',
    mute: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9l5 6M21 9l-5 6"/>',
    full: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
    pin: '<path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>'
  };
  const svg = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${GLYPH[name] || ''}</svg>`;
  const FOLDER = '<svg viewBox="0 0 48 40" aria-hidden="true"><path d="M2 7a4 4 0 0 1 4-4h11l5 5h20a4 4 0 0 1 4 4v4H2z" fill="#4f7df0"/><rect x="2" y="11" width="44" height="26" rx="4" fill="#6ea0ff"/></svg>';

  const appIcon = id => {
    const a = OS.apps[id];
    if (!a) return '';
    return `<span class="app-icon" style="--a:${esc(a.colors[0])};--b:${esc(a.colors[1])}">${svg(a.glyph)}</span>`;
  };
  const fileIcon = node => {
    if (node.type === 'dir') return `<span class="f-icon folder">${FOLDER}</span>`;
    switch (node.kind) {
      case 'app': return appIcon(node.app);
      case 'image': return `<span class="f-icon thumb"><img src="${esc(node.src)}" alt="" loading="lazy" draggable="false"></span>`;
      case 'video': return `<span class="f-icon fdoc" style="--c:#9333ea">${svg('play')}</span>`;
      case 'link': return `<span class="f-icon fdoc" style="--c:#0d9488">${svg('link')}</span>`;
      default: return `<span class="f-icon fdoc" style="--c:#475569">${svg('text')}</span>`;
    }
  };
  const kindLabel = node => node.type === 'dir' ? 'Folder'
    : ({ app: 'Application', image: 'Image', video: 'Video', link: 'Web link', text: 'Document' }[node.kind] || 'File');

  /* ---------- Generated placeholder screenshots ---------- */
  function mockShot(pr, i) {
    const [a, b] = pr.color;
    const v = i % 3;
    let body = '';
    if (v === 0) {
      body = `<polyline points="250,400 330,340 410,365 490,280 570,310 650,230 730,255 810,190 880,210" fill="none" stroke="${a}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
        <rect x="250" y="120" width="190" height="84" rx="12" fill="#fff" opacity=".07"/><rect x="460" y="120" width="190" height="84" rx="12" fill="#fff" opacity=".07"/><rect x="670" y="120" width="210" height="84" rx="12" fill="#fff" opacity=".07"/>
        <rect x="268" y="140" width="70" height="10" rx="5" fill="#fff" opacity=".3"/><rect x="268" y="164" width="110" height="18" rx="6" fill="${a}"/>
        <rect x="478" y="140" width="70" height="10" rx="5" fill="#fff" opacity=".3"/><rect x="478" y="164" width="90" height="18" rx="6" fill="${b}"/>
        <rect x="688" y="140" width="70" height="10" rx="5" fill="#fff" opacity=".3"/><rect x="688" y="164" width="130" height="18" rx="6" fill="#fff" opacity=".6"/>
        <rect x="250" y="440" width="630" height="2" fill="#fff" opacity=".1"/>`;
    } else if (v === 1) {
      body = [0, 1, 2, 3, 4, 5].map(r => `<rect x="250" y="${120 + r * 62}" width="630" height="48" rx="10" fill="#fff" opacity=".06"/>
        <circle cx="278" cy="${144 + r * 62}" r="10" fill="${r % 2 ? b : a}"/>
        <rect x="302" y="${137 + r * 62}" width="${180 + (r * 53) % 160}" height="12" rx="6" fill="#fff" opacity=".45"/>
        <rect x="790" y="${137 + r * 62}" width="70" height="12" rx="6" fill="#fff" opacity=".18"/>`).join('');
    } else {
      body = [0, 1, 2, 3, 4, 5].map(c => {
        const x = 250 + (c % 3) * 214, y = 120 + Math.floor(c / 3) * 190;
        return `<rect x="${x}" y="${y}" width="200" height="174" rx="14" fill="#fff" opacity=".06"/>
          <rect x="${x + 14}" y="${y + 14}" width="172" height="86" rx="9" fill="${c % 2 ? b : a}" opacity=".${5 + (c % 4)}"/>
          <rect x="${x + 14}" y="${y + 116}" width="120" height="12" rx="6" fill="#fff" opacity=".45"/>
          <rect x="${x + 14}" y="${y + 138}" width="80" height="10" rx="5" fill="#fff" opacity=".2"/>`;
      }).join('');
    }
    const s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 600">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
      <rect width="960" height="600" fill="#0e1016"/><rect width="960" height="600" fill="url(#g)" opacity=".2"/>
      <rect x="40" y="40" width="880" height="520" rx="18" fill="#12141c" stroke="#fff" stroke-opacity=".1"/>
      <circle cx="68" cy="66" r="6" fill="#ff5f57"/><circle cx="88" cy="66" r="6" fill="#febc2e"/><circle cx="108" cy="66" r="6" fill="#28c840"/>
      <rect x="40" y="90" width="180" height="470" fill="#fff" opacity=".03"/>
      <rect x="60" y="116" width="28" height="28" rx="8" fill="url(#g)"/>
      <text x="98" y="136" font-family="system-ui,sans-serif" font-size="15" font-weight="600" fill="#fff">${esc(pr.name)}</text>
      ${[0, 1, 2, 3, 4].map(r => `<rect x="60" y="${176 + r * 34}" width="${90 + (r * 37) % 50}" height="10" rx="5" fill="#fff" opacity="${r === i % 5 ? .7 : .2}"/>`).join('')}
      ${body}</svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(s);
  }

  /* ---------- Virtual filesystem ---------- */
  const dir = (name, children = []) => ({ name, type: 'dir', children });
  const file = (name, kind, extra = {}) => ({ name, type: 'file', kind, ...extra });
  const slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  function docs() {
    const p = D.profile;
    const about = `# ${p.name}\n\n**${p.role}** · ${p.location}\n\n${p.tagline}\n\n${p.bio.join('\n\n')}\n`;
    const skills = `# Skills\n\n` + D.skills.map(g => `## ${g.group}\n\n${g.items.map(s => `- ${s.name || s}`).join('\n')}`).join('\n\n') + '\n';
    const resume = `# ${p.name}\n\n**${p.role}** · ${p.location} · [${p.email}](mailto:${p.email})\n\n${p.tagline}\n\n## Experience\n\n`
      + D.experience.map(e => `### ${e.role} — ${e.company}\n\n${e.period}\n\n${e.summary}`).join('\n\n')
      + `\n\n## Education\n\n` + D.education.map(e => `- **${e.title}**, ${e.place} (${e.period})`).join('\n')
      + (D.languages?.length ? `\n\n## Languages\n\n` + D.languages.map(l => `- **${l.name}:** ${l.level}`).join('\n') : '')
      + `\n\n## Skills\n\n` + D.skills.map(g => `- **${g.group}:** ${g.items.map(s => s.name || s).join(', ')}`).join('\n')
      + `\n\n## Selected projects\n\n` + D.projects.map(pr => `- **${pr.name}**${pr.badge ? ` (${pr.badge})` : ''} — ${pr.tagline}`).join('\n') + '\n';
    const now = `# What I'm doing now\n\n${(D.now || []).map(n => `- ${n}`).join('\n')}\n`;
    const contact = `Contact ${p.name}\n${'-'.repeat(8 + p.name.length)}\n\nEmail     ${p.email}\nLocation  ${p.location}\n\n` + D.socials.map(s => `${s.name.padEnd(13)} ${s.url}`).join('\n') + '\n';
    const welcome = `# Welcome to ${D.osName}\n\nThis is the portfolio of **${p.name}**, built as a small desktop operating system that runs in your browser.\n\n## Things to try\n\n- Open **Projects** and step into a project folder\n- Browse everything in **Files** — documents, screenshots and demo videos\n- Launch the **Terminal** and type \`help\`\n- Right-click the desktop to change the wallpaper\n- Say hello through **Contact**\n\nWindows can be dragged, resized, minimized and maximized, just like the real thing.\n`;
    return { about, skills, resume, now, contact, welcome };
  }
  const projectReadme = pr => `# ${pr.name}\n\n${pr.tagline}\n\n${pr.description}\n\n## Highlights\n\n${pr.highlights.map(x => `- ${x}`).join('\n')}\n\n## Built with\n\n${pr.tech.map(t => `- ${t}`).join('\n')}\n\n## Links\n\n`
    + [pr.links?.source && `- [Source code](${pr.links.source})`, pr.links?.demo && `- [Live demo](${pr.links.demo})`].filter(Boolean).join('\n') + '\n';

  let root = dir('~');
  function buildFS() {
    const d = docs();
    const shots = pr => (pr.screenshots || []).map((s, i) =>
      file(`${slug(s.title) || 'shot-' + (i + 1)}.png`, 'image', { src: s.src || mockShot(pr, i), title: `${pr.name} — ${s.title}` }));
    const projects = D.projects.map(pr => dir(pr.id, [
      file('README.md', 'text', { content: projectReadme(pr) }),
      dir('screenshots', shots(pr)),
      ...(pr.video ? [file('demo.mp4', 'video', { track: pr.id })] : []),
      ...(pr.links?.source ? [file('source-code.url', 'link', { url: pr.links.source })] : []),
      ...(pr.links?.demo ? [file('live-demo.url', 'link', { url: pr.links.demo })] : [])
    ]));
    root = dir('~', [
      dir('Projects', projects),
      dir('Documents', [
        file('about.md', 'text', { content: d.about }),
        file('resume.md', 'text', { content: d.resume }),
        file('skills.md', 'text', { content: d.skills }),
        ...(D.now?.length ? [file('now.md', 'text', { content: d.now })] : [])
      ]),
      dir('Media', [
        dir('Videos', [
          file('showreel.mp4', 'video', { track: 'showreel' }),
          ...D.projects.filter(pr => pr.video).map(pr => file(`${pr.id}-demo.mp4`, 'video', { track: pr.id }))
        ]),
        dir('Screenshots', D.projects.flatMap(pr => shots(pr).map(f => ({ ...f, name: `${pr.id}-${f.name}` }))))
      ]),
      dir('Links', D.socials.map(s => file(`${s.id}.url`, 'link', { url: s.url }))),
      dir('Applications', Object.keys(OS.apps).filter(id => !OS.apps[id].hidden).map(id => file(`${id}.app`, 'app', { app: id }))),
      file('README.md', 'text', { content: d.welcome }),
      file('contact.txt', 'text', { content: d.contact })
    ]);
  }

  const fs = {
    norm(path, cwd = '~') {
      let parts;
      if (path.startsWith('~')) parts = path.slice(1).split('/');
      else if (path.startsWith('/')) parts = path.split('/');
      else parts = cwd.slice(1).split('/').concat(path.split('/'));
      const out = [];
      for (const s of parts) { if (!s || s === '.') continue; if (s === '..') out.pop(); else out.push(s); }
      return '~' + (out.length ? '/' + out.join('/') : '');
    },
    /** Resolve a path (case-insensitive) to { node, path } or null. */
    resolve(path, cwd = '~') {
      const segs = fs.norm(path, cwd).slice(1).split('/').filter(Boolean);
      let n = root; const canon = [];
      for (const s of segs) {
        if (n.type !== 'dir') return null;
        const c = n.children.find(c => c.name === s) || n.children.find(c => c.name.toLowerCase() === s.toLowerCase());
        if (!c) return null;
        canon.push(c.name); n = c;
      }
      return { node: n, path: '~' + (canon.length ? '/' + canon.join('/') : '') };
    },
    parent: path => fs.norm(path + '/..'),
    join: (a, b) => (a === '~' ? '~/' : a + '/') + b,
    sorted: node => [...node.children].sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'dir' ? -1 : 1))
  };

  /** Open any filesystem path with the right app. */
  function openPath(path) {
    const r = fs.resolve(path);
    if (!r) { toast(`Not found: ${path}`); return false; }
    const n = r.node;
    if (n.type === 'dir') WM.open('files', { path: r.path });
    else if (n.kind === 'text') WM.open('notes', { path: r.path });
    else if (n.kind === 'image') WM.open('preview', { path: r.path });
    else if (n.kind === 'video') WM.open('media', { track: n.track });
    else if (n.kind === 'link') WM.open('browser', { url: n.url });
    else if (n.kind === 'app') WM.open(n.app);
    return true;
  }

  /* Real videos added with add-video.sh are listed in assets/videos/videos.js; a src in data.js wins. */
  const tracks = () => {
    const V = window.PORTFOLIO_VIDEOS || {};
    const real = (id, own) => (own ? { src: own } : V[id] ? { src: V[id].src, duration: V[id].duration } : {});
    const sr = real('showreel', D.showreel.src);
    return [
      { id: 'showreel', title: D.showreel.title, subtitle: D.profile.name, color: D.showreel.color, src: sr.src, duration: sr.duration || D.showreel.duration || 40, scenes: D.showreel.scenes },
      ...D.projects.filter(p => p.video).map(p => {
        const r = real(p.id, p.video.src);
        return { id: p.id, title: p.video.title || `${p.name} — Demo`, subtitle: p.name, color: p.color,
          src: r.src, duration: r.duration || p.video.duration || 30, scenes: p.highlights };
      })
    ];
  };

  /* ---------- Toasts & menus ---------- */
  function toast(msg, ms = 2600) {
    const t = h(`<div class="toast">${esc(msg)}</div>`);
    $('#toasts').append(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 320); }, ms);
  }
  let menuEl = null;
  function closeMenu() { menuEl?.remove(); menuEl = null; $('#os-menu')?.setAttribute('aria-expanded', 'false'); }
  function showMenu(x, y, items) {
    closeMenu();
    menuEl = h('<div class="menu" role="menu"></div>');
    for (const it of items) {
      if (it === '-') { menuEl.append(h('<hr>')); continue; }
      const b = h(`<button role="menuitem">${esc(it.label)}</button>`);
      b.addEventListener('click', () => { closeMenu(); it.run(); });
      menuEl.append(b);
    }
    document.body.append(menuEl);
    const r = menuEl.getBoundingClientRect();
    menuEl.style.left = Math.max(8, Math.min(x, innerWidth - r.width - 8)) + 'px';
    menuEl.style.top = Math.max(8, Math.min(y, innerHeight - r.height - 8)) + 'px';
  }
  document.addEventListener('pointerdown', e => { if (menuEl && !e.target.closest('.menu, [data-menu]')) closeMenu(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  /** Desktop-style activation: double-click with a mouse, single tap on touch, Enter on keyboard. */
  function bindOpen(el, fn) {
    el.addEventListener('click', e => {
      $$('.selected', el.parentElement).forEach(s => s.classList.remove('selected'));
      el.classList.add('selected');
      if (isCoarse() || e.detail === 0) fn();
    });
    el.addEventListener('dblclick', () => { if (!isCoarse()) fn(); });
  }

  /* ---------- Window manager ---------- */
  const WM = {
    wins: new Map(), z: 10, active: null,
    get layer() { return $('#windows'); },

    open(id, args) {
      const app = OS.apps[id];
      if (!app) { toast(`Unknown app: ${id}`); return null; }
      let w = this.wins.get(id);
      if (w) {
        if (w.minimized) this.restore(id);
        this.focus(id);
        if (args !== undefined && w.onArgs) w.onArgs(args);
        return w;
      }
      const el = h(`<section class="window opening" role="dialog" aria-label="${esc(app.title)}" data-app="${esc(id)}">
        <header class="titlebar">
          <div class="traffic">
            <button class="tl close" aria-label="Close window" title="Close"></button>
            <button class="tl min" aria-label="Minimize window" title="Minimize"></button>
            <button class="tl max" aria-label="Maximize window" title="Maximize"></button>
          </div>
          <div class="win-title">${esc(app.title)}</div><div></div>
        </header>
        <div class="win-body"></div>
        ${['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'].map(d => `<i class="rs rs-${d}" data-dir="${d}"></i>`).join('')}
      </section>`);
      const area = this.layer.getBoundingClientRect();
      const dock = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--dock-space')) || 88;
      const ww = Math.min(app.w || 760, area.width - 24), wh = Math.min(app.h || 520, area.height - dock - 16);
      const n = this.wins.size % 6;
      el.style.width = ww + 'px'; el.style.height = wh + 'px';
      el.style.left = Math.max(8, Math.min((area.width - ww) / 2 + n * 28 - 40, area.width - ww - 8)) + 'px';
      el.style.top = Math.max(8, Math.min((area.height - dock - wh) / 2 + n * 26, area.height - dock - wh)) + 'px';

      w = {
        id, el, body: $('.win-body', el), minimized: false, maximized: false, onArgs: null, onClose: null,
        setTitle(t) { $('.win-title', el).textContent = t; if (WM.active === id) $('#tb-app').textContent = app.title; }
      };
      this.wins.set(id, w);
      this.layer.append(el);
      el.addEventListener('animationend', () => el.classList.remove('opening'), { once: true });
      el.addEventListener('pointerdown', () => this.focus(id), true);
      $('.close', el).addEventListener('click', () => this.close(id));
      $('.min', el).addEventListener('click', () => this.minimize(id));
      $('.max', el).addEventListener('click', () => this.toggleMax(id));
      this._drag(w); this._resize(w);
      try { app.mount(w, args); }
      catch (err) { console.error(err); w.body.innerHTML = `<div class="empty">This app failed to start.</div>`; }
      this.focus(id);
      return w;
    },

    focus(id) {
      const w = this.wins.get(id);
      if (!w || w.minimized) return;
      if (this.active !== id || +w.el.style.zIndex !== this.z) w.el.style.zIndex = ++this.z;
      this.active = id;
      this._sync();
    },
    _focusTop() {
      const top = [...this.wins.values()].filter(w => !w.minimized).sort((a, b) => b.el.style.zIndex - a.el.style.zIndex)[0];
      this.active = top ? top.id : null;
      this._sync();
    },
    close(id) {
      const w = this.wins.get(id);
      if (!w) return;
      try { w.onClose?.(); } catch (err) { console.error(err); }
      this.wins.delete(id);
      w.el.classList.add('closing');
      setTimeout(() => w.el.remove(), 180);
      this._focusTop();
    },
    minimize(id) {
      const w = this.wins.get(id);
      if (!w) return;
      const target = $(`.dock-item[data-app="${id}"]`)?.getBoundingClientRect();
      const r = w.el.getBoundingClientRect();
      if (target) {
        w.el.style.setProperty('--mx', (target.left + target.width / 2 - (r.left + r.width / 2)) + 'px');
        w.el.style.setProperty('--my', (target.top + target.height / 2 - (r.top + r.height / 2)) + 'px');
      }
      w.minimized = true;
      w.el.classList.add('minimized');
      w.onHide?.();
      this._focusTop();
    },
    restore(id) {
      const w = this.wins.get(id);
      if (!w) return;
      w.minimized = false;
      w.el.classList.remove('minimized');
    },
    toggleMax(id) {
      const w = this.wins.get(id);
      if (!w || isMobile()) return;
      w.el.classList.add('geo-anim');
      w.maximized = !w.maximized;
      w.el.classList.toggle('maximized', w.maximized);
      setTimeout(() => w.el.classList.remove('geo-anim'), 300);
    },
    closeAll() { [...this.wins.keys()].forEach(id => this.close(id)); },

    _sync() {
      for (const w of this.wins.values()) w.el.classList.toggle('focused', w.id === this.active);
      $('#tb-app').textContent = this.active ? OS.apps[this.active].title : 'Desktop';
      renderDock();
    },

    _drag(w) {
      const bar = $('.titlebar', w.el), el = w.el;
      bar.addEventListener('dblclick', e => { if (!e.target.closest('button')) this.toggleMax(w.id); });
      bar.addEventListener('pointerdown', e => {
        if (e.button !== 0 || e.target.closest('button') || w.maximized || isMobile()) return;
        const sx = e.clientX, sy = e.clientY, ox = el.offsetLeft, oy = el.offsetTop;
        const area = this.layer.getBoundingClientRect();
        bar.setPointerCapture(e.pointerId);
        el.classList.add('dragging');
        const move = ev => {
          const x = Math.min(Math.max(ox + ev.clientX - sx, 90 - el.offsetWidth), area.width - 90);
          const y = Math.min(Math.max(oy + ev.clientY - sy, 0), area.height - 44);
          el.style.left = x + 'px'; el.style.top = y + 'px';
        };
        const up = () => {
          bar.removeEventListener('pointermove', move); bar.removeEventListener('pointerup', up); bar.removeEventListener('pointercancel', up);
          el.classList.remove('dragging');
        };
        bar.addEventListener('pointermove', move); bar.addEventListener('pointerup', up); bar.addEventListener('pointercancel', up);
      });
    },

    _resize(w) {
      const el = w.el, MINW = 320, MINH = 220;
      $$('.rs', el).forEach(hd => hd.addEventListener('pointerdown', e => {
        if (e.button !== 0 || w.maximized || isMobile()) return;
        e.preventDefault();
        const d = hd.dataset.dir, sx = e.clientX, sy = e.clientY;
        const o = { l: el.offsetLeft, t: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight };
        const area = this.layer.getBoundingClientRect();
        hd.setPointerCapture(e.pointerId);
        el.classList.add('dragging', 'resizing');
        const move = ev => {
          const dx = ev.clientX - sx, dy = ev.clientY - sy;
          let { l, t, w: nw, h: nh } = o;
          if (d.includes('e')) nw = Math.max(MINW, Math.min(o.w + dx, area.width - o.l));
          if (d.includes('s')) nh = Math.max(MINH, Math.min(o.h + dy, area.height - o.t));
          if (d.includes('w')) { nw = Math.max(MINW, Math.min(o.w - dx, o.l + o.w)); l = o.l + o.w - nw; }
          if (d.includes('n')) { nh = Math.max(MINH, Math.min(o.h - dy, o.t + o.h)); t = o.t + o.h - nh; }
          Object.assign(el.style, { left: l + 'px', top: t + 'px', width: nw + 'px', height: nh + 'px' });
        };
        const up = () => {
          hd.removeEventListener('pointermove', move); hd.removeEventListener('pointerup', up); hd.removeEventListener('pointercancel', up);
          el.classList.remove('dragging', 'resizing');
        };
        hd.addEventListener('pointermove', move); hd.addEventListener('pointerup', up); hd.addEventListener('pointercancel', up);
      }));
    }
  };

  // Keep windows reachable when the browser window shrinks.
  addEventListener('resize', () => {
    const area = WM.layer.getBoundingClientRect();
    for (const w of WM.wins.values()) {
      const el = w.el;
      el.style.left = Math.max(90 - el.offsetWidth, Math.min(el.offsetLeft, area.width - 90)) + 'px';
      el.style.top = Math.max(0, Math.min(el.offsetTop, area.height - 44)) + 'px';
    }
  });

  /* ---------- Dock ---------- */
  const PINNED = ['about', 'projects', 'files', 'terminal', 'browser', 'media', 'contact'];
  function renderDock() {
    const dock = $('#dock');
    const extra = [...WM.wins.keys()].filter(id => !PINNED.includes(id));
    const item = id => {
      const w = WM.wins.get(id);
      return `<button class="dock-item${w ? ' running' : ''}${WM.active === id ? ' active' : ''}" data-app="${id}" aria-label="${esc(OS.apps[id].title)}">
        ${appIcon(id)}<span class="tip">${esc(OS.apps[id].title)}</span><i class="dot"></i></button>`;
    };
    // Rebuild only when the set of icons changes, so hover and keyboard focus survive state updates.
    const key = extra.join();
    if (dock.dataset.key !== key || !dock.children.length) {
      dock.dataset.key = key;
      dock.innerHTML = PINNED.filter(id => OS.apps[id]).map(item).join('') + (extra.length ? '<span class="dock-sep"></span>' + extra.map(item).join('') : '');
      return;
    }
    $$('.dock-item', dock).forEach(b => {
      b.classList.toggle('running', WM.wins.has(b.dataset.app));
      b.classList.toggle('active', WM.active === b.dataset.app);
    });
  }
  function dockClick(id) {
    const w = WM.wins.get(id);
    if (!w) WM.open(id);
    else if (w.minimized) { WM.restore(id); WM.focus(id); }
    else if (WM.active === id) WM.minimize(id);
    else WM.focus(id);
  }

  /* ---------- Desktop shell ---------- */
  const WALLPAPERS = ['aurora', 'dusk', 'ocean', 'graphite'];
  function setWallpaper(name) {
    if (!WALLPAPERS.includes(name)) return false;
    const d = $('#desktop');
    WALLPAPERS.forEach(w => d.classList.remove('wp-' + w));
    d.classList.add('wp-' + name);
    store.set('wallpaper', name);
    return true;
  }
  function nextWallpaper() {
    const cur = WALLPAPERS.find(w => $('#desktop').classList.contains('wp-' + w)) || WALLPAPERS[0];
    const next = WALLPAPERS[(WALLPAPERS.indexOf(cur) + 1) % WALLPAPERS.length];
    setWallpaper(next);
    toast(`Wallpaper: ${next}`);
  }

  function renderIcons() {
    const box = $('#icons');
    const items = [
      ...PINNED.filter(id => OS.apps[id]).map(id => ({ label: OS.apps[id].title, icon: appIcon(id), run: () => WM.open(id) })),
      { label: 'resume.md', icon: fileIcon({ type: 'file', kind: 'text' }), run: () => openPath('~/Documents/resume.md') },
      { label: 'README.md', icon: fileIcon({ type: 'file', kind: 'text' }), run: () => openPath('~/README.md') }
    ];
    box.innerHTML = '';
    for (const it of items) {
      const b = h(`<button class="d-icon">${it.icon}<span class="label">${esc(it.label)}</span></button>`);
      bindOpen(b, it.run);
      box.append(b);
    }
  }

  function systemMenuItems() {
    return [
      { label: `About ${D.osName}`, run: () => openPath('~/README.md') },
      { label: 'Change wallpaper', run: nextWallpaper },
      '-',
      { label: 'Open Terminal', run: () => WM.open('terminal') },
      { label: 'Open Files', run: () => WM.open('files', { path: '~' }) },
      '-',
      { label: 'Close all windows', run: () => WM.closeAll() },
      { label: 'Restart…', run: reboot }
    ];
  }

  function tick() {
    const now = new Date();
    const date = new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).format(now);
    const time = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(now);
    $('#tb-clock').innerHTML = `<span class="clock-date">${esc(date)}&nbsp;&nbsp;</span>${esc(time)}`;
  }

  function boot(first) {
    const b = $('#boot');
    $('#boot-name').textContent = D.osName;
    b.classList.remove('done', 'run');
    void b.offsetWidth;
    b.classList.add('run');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let finished = false;
    const finish = () => {
      if (finished) return; finished = true;
      b.classList.add('done');
      if (first || !WM.wins.size) setTimeout(() => WM.open('about'), 250);
    };
    setTimeout(finish, reduced ? 200 : 1500);
    b.addEventListener('click', finish, { once: true });
  }
  function reboot() { WM.closeAll(); boot(false); }

  function init() {
    document.title = `${D.profile.name} — ${D.osName}`;
    buildFS();
    setWallpaper(store.get('wallpaper') || 'aurora');
    renderIcons();
    renderDock();
    tick(); setInterval(tick, 15000);

    $('#dock').addEventListener('click', e => { const b = e.target.closest('.dock-item'); if (b) dockClick(b.dataset.app); });
    $('#os-menu').addEventListener('click', e => {
      if (menuEl) return closeMenu();
      const r = e.currentTarget.getBoundingClientRect();
      showMenu(r.left, r.bottom + 6, systemMenuItems());
      e.currentTarget.setAttribute('aria-expanded', 'true');
    });
    $('#desktop').addEventListener('contextmenu', e => {
      if (e.target.closest('.window, #dock, #topbar')) return;
      e.preventDefault();
      showMenu(e.clientX, e.clientY, systemMenuItems());
    });
    $('#desktop').addEventListener('pointerdown', e => {
      if (e.target === e.currentTarget || e.target.id === 'icons') $$('#icons .selected').forEach(s => s.classList.remove('selected'));
    });
    boot(true);
  }

  const OS = window.OS = {
    D, $, $$, esc, h, svg, isMobile, isCoarse, apps: {}, fs, WM,
    appIcon, fileIcon, kindLabel, openPath, tracks, toast, bindOpen,
    setWallpaper, nextWallpaper, wallpapers: WALLPAPERS, reboot,
    get root() { return root; }
  };

  document.addEventListener('DOMContentLoaded', init);
})();
