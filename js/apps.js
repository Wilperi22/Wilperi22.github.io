/* Portfolio OS — applications. Each app: { title, glyph, colors, w, h, mount(win, args) }. */
(() => {
  'use strict';
  const { D, $, $$, esc, h, svg, fs, WM, apps, appIcon, fileIcon, kindLabel, openPath, toast, bindOpen } = window.OS;
  const OS = window.OS;
  const P = D.profile;
  const ext = (url, label, cls = 'btn') => `<a class="${cls}" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${label}</a>`;
  const initials = name => name.split(/\s+/).map(s => s[0]).slice(0, 2).join('').toUpperCase();
  const safeUrl = u => { try { const x = new URL(u); return ['http:', 'https:', 'mailto:'].includes(x.protocol) ? x.href : null; } catch { return null; } };

  /* Minimal, safe markdown renderer (headings, lists, bold, code, links). */
  function md(src) {
    const inline = s => esc(s)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\[([^\]]+)\]\(((?:https?:|mailto:)[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    const out = []; let list = false, para = [];
    const flush = () => { if (para.length) { out.push(`<p>${inline(para.join(' '))}</p>`); para = []; } if (list) { out.push('</ul>'); list = false; } };
    for (const line of src.split('\n')) {
      const m = line.match(/^(#{1,3})\s+(.*)$/);
      if (m) { flush(); out.push(`<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`); }
      else if (/^[-*]\s+/.test(line)) { if (para.length) flush(); if (!list) { out.push('<ul>'); list = true; } out.push(`<li>${inline(line.replace(/^[-*]\s+/, ''))}</li>`); }
      else if (!line.trim()) flush();
      else { if (list) flush(); para.push(line.trim()); }
    }
    flush();
    return out.join('');
  }

  /* ================= About ================= */
  apps.about = {
    title: 'About Me', glyph: 'user', colors: ['#5b8cff', '#8f6bff'], w: 860, h: 620,
    mount(w) {
      const avatar = P.avatar
        ? `<img class="avatar" src="${esc(P.avatar)}" alt="${esc(P.name)}">`
        : `<div class="avatar" aria-hidden="true">${esc(initials(P.name))}</div>`;
      w.body.innerHTML = `<div class="about">
        <aside class="about-side">
          ${avatar}
          <h1>${esc(P.name)}</h1>
          <div class="role">${esc(P.role)}</div>
          <div class="loc">${esc(P.location)}</div>
          ${P.available ? `<div class="avail">${esc(P.availabilityText || 'Available for work')}</div>` : ''}
          <div class="about-actions">
            <button class="btn primary" data-go="projects">View projects</button>
            <button class="btn" data-go="contact">Get in touch</button>
            <button class="btn" data-go="resume">Open résumé</button>
            <button class="btn" data-go="terminal">Open terminal</button>
          </div>
        </aside>
        <div class="about-main">
          <h2>Hi, I'm ${esc(P.name.split(' ')[0])}.</h2>
          <p class="lead">${esc(P.tagline)}</p>
          <div class="bio">${P.bio.map(b => `<p>${esc(b)}</p>`).join('')}</div>
          <div class="sec-title">Skills</div>
          <div class="skill-groups">${D.skills.map(g => `<div class="skill-group"><h4>${esc(g.group)}</h4>${g.items.some(s => s.level) ? g.items.map(s => `
            <div class="skill"><div class="skill-top"><span>${esc(s.name)}</span><span>${+s.level}%</span></div>
            <div class="bar" role="progressbar" aria-label="${esc(s.name)}" aria-valuenow="${+s.level}" aria-valuemin="0" aria-valuemax="100"><i data-w="${+s.level}"></i></div></div>`).join('')
            : `<div class="chips">${g.items.map(s => `<span class="chip">${esc(s.name || s)}</span>`).join('')}</div>`}</div>`).join('')}</div>
          <div class="sec-title">Experience</div>
          <div class="timeline">${D.experience.map(e => `<div class="tl-item"><h4>${esc(e.role)} · ${esc(e.company)}</h4><div class="meta">${esc(e.period)}</div><p>${esc(e.summary)}</p></div>`).join('')}</div>
          <div class="sec-title">Education</div>
          <div class="timeline">${D.education.map(e => `<div class="tl-item"><h4>${esc(e.title)}</h4><div class="meta">${esc(e.place)} · ${esc(e.period)}</div></div>`).join('')}</div>
          ${D.languages?.length ? `<div class="sec-title">Languages</div><div class="chips">${D.languages.map(l => `<span class="chip">${esc(l.name)} — ${esc(l.level)}</span>`).join('')}</div>` : ''}
        </div></div>`;
      w.body.addEventListener('click', e => {
        const go = e.target.closest('[data-go]')?.dataset.go;
        if (go === 'resume') openPath('~/Documents/resume.md'); else if (go) WM.open(go);
      });
      requestAnimationFrame(() => setTimeout(() => $$('.bar i', w.body).forEach(i => { i.style.width = i.dataset.w + '%'; }), 120));
    }
  };

  /* ================= Projects ================= */
  apps.projects = {
    title: 'Projects', glyph: 'layers', colors: ['#ff9d4d', '#ff5e7a'], w: 880, h: 600,
    mount(w, args) {
      const grid = () => {
        w.setTitle('Projects');
        w.body.innerHTML = `<div class="proj-head"><h2>Projects</h2><p class="muted">Open a folder to see the details, screenshots, demo and source.</p></div>
          <div class="proj-grid">${D.projects.map(p => `<button class="proj-card" data-id="${esc(p.id)}">
            <div class="proj-cover" style="--a:${esc(p.color[0])};--b:${esc(p.color[1])}">${fileIcon({ type: 'dir' })}${p.badge ? `<span class="yr">${esc(p.badge)}</span>` : ''}</div>
            <div class="info"><h3>${esc(p.name)}</h3><p>${esc(p.tagline)}</p></div></button>`).join('')}</div>`;
        w.body.scrollTop = 0;
      };
      const detail = id => {
        const p = D.projects.find(x => x.id === id);
        if (!p) return grid();
        const base = `~/Projects/${p.id}`;
        const shots = fs.resolve(base + '/screenshots')?.node.children || [];
        w.setTitle(`Projects — ${p.name}`);
        w.body.innerHTML = `<div class="proj-detail">
          <div class="proj-hero" style="--a:${esc(p.color[0])};--b:${esc(p.color[1])}">
            <button class="btn back" data-act="back">${svg('back')} All projects</button>
            <h2>${esc(p.name)}</h2><p class="tag">${esc(p.tagline)}</p>
            <div class="actions">
              ${p.video ? `<button class="btn primary" data-act="video">${svg('play')} Watch demo</button>` : ''}
              ${p.links?.source && safeUrl(p.links.source) ? ext(p.links.source, `${svg('ext')} Source code`) : ''}
              ${p.links?.demo && safeUrl(p.links.demo) ? ext(p.links.demo, `${svg('ext')} Live demo`) : ''}
              <button class="btn" data-act="files">${svg('folder')} Show in Files</button>
            </div>
          </div>
          <div class="proj-body">
            <div class="sec-title">Overview</div><p>${esc(p.description)}</p>
            <div class="sec-title">Highlights</div><ul>${p.highlights.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
            <div class="sec-title">Built with</div><div class="chips">${p.tech.map(t => `<span class="chip">${esc(t)}</span>`).join('')}</div>
            ${shots.length ? `<div class="sec-title">Screenshots</div><div class="shots">${shots.map(s => `<button class="shot" data-shot="${esc(s.name)}"><img src="${esc(s.src)}" alt="${esc(s.title)}" loading="lazy"><span>${esc(s.title)}</span></button>`).join('')}</div>` : ''}
          </div></div>`;
        w.body.scrollTop = 0;
        w.body.querySelector('.proj-detail').dataset.id = p.id;
      };
      w.body.addEventListener('click', e => {
        const card = e.target.closest('.proj-card'); if (card) return detail(card.dataset.id);
        const id = $('.proj-detail', w.body)?.dataset.id;
        const act = e.target.closest('[data-act]')?.dataset.act;
        if (act === 'back') grid();
        else if (act === 'video') WM.open('media', { track: id });
        else if (act === 'files') WM.open('files', { path: `~/Projects/${id}` });
        const shot = e.target.closest('[data-shot]');
        if (shot) openPath(`~/Projects/${id}/screenshots/${shot.dataset.shot}`);
      });
      w.onArgs = a => (a?.project ? detail(a.project) : grid());
      w.onArgs(args);
    }
  };

  /* ================= Files ================= */
  apps.files = {
    title: 'Files', glyph: 'folder', colors: ['#3ec6ff', '#3a7bff'], w: 820, h: 540,
    mount(w, args) {
      const st = { hist: [], idx: -1, list: false };
      const places = [['Home', '~', 'home'], ['Projects', '~/Projects', 'layers'], ['Documents', '~/Documents', 'text'], ['Media', '~/Media', 'image'], ['Links', '~/Links', 'link'], ['Applications', '~/Applications', 'grid']];
      w.body.innerHTML = `<div class="files">
        <div class="files-bar">
          <button class="icon-btn" data-nav="back" aria-label="Back">${svg('back')}</button>
          <button class="icon-btn" data-nav="fwd" aria-label="Forward">${svg('fwd')}</button>
          <button class="icon-btn" data-nav="up" aria-label="Up one folder">${svg('up')}</button>
          <div class="crumbs" aria-label="Path"></div>
          <button class="icon-btn" data-nav="view" aria-label="Toggle list view">${svg('list')}</button>
        </div>
        <aside class="files-side"><div class="lbl">Places</div>${places.map(([n, p, g]) => `<button data-path="${p}">${svg(g)}${n}</button>`).join('')}</aside>
        <div class="files-main"><div class="files-grid"></div></div>
        <div class="files-status"></div></div>`;
      const main = $('.files-main', w.body), gridEl = $('.files-grid', w.body);
      const cur = () => st.hist[st.idx];
      const render = () => {
        const r = fs.resolve(cur());
        const path = r.path, items = fs.sorted(r.node);
        w.setTitle(path === '~' ? 'Files — Home' : `Files — ${r.node.name}`);
        const segs = path.split('/');
        $('.crumbs', w.body).innerHTML = segs.map((s, i) => `<button data-path="${esc(segs.slice(0, i + 1).join('/'))}">${i ? esc(s) : 'Home'}</button>`).join('<i>›</i>');
        $$('.files-side button', w.body).forEach(b => b.classList.toggle('on', b.dataset.path === path));
        $('[data-nav=back]', w.body).disabled = st.idx <= 0;
        $('[data-nav=fwd]', w.body).disabled = st.idx >= st.hist.length - 1;
        $('[data-nav=up]', w.body).disabled = path === '~';
        $('[data-nav=view]', w.body).innerHTML = svg(st.list ? 'grid' : 'list');
        main.classList.toggle('list', st.list);
        gridEl.innerHTML = '';
        if (!items.length) gridEl.innerHTML = '<div class="empty">This folder is empty.</div>';
        for (const n of items) {
          const b = h(`<button class="f-item" title="${esc(n.name)}">${fileIcon(n)}<span class="name">${esc(n.name)}</span><span class="kind">${esc(kindLabel(n))}</span></button>`);
          bindOpen(b, () => (n.type === 'dir' ? go(fs.join(path, n.name)) : openPath(fs.join(path, n.name))));
          gridEl.append(b);
        }
        $('.files-status', w.body).textContent = `${items.length} item${items.length === 1 ? '' : 's'}  ·  ${path}`;
        main.scrollTop = 0;
      };
      const go = path => {
        const r = fs.resolve(path);
        if (!r || r.node.type !== 'dir') return toast('Folder not found');
        if (cur() === r.path) return render();
        st.hist = st.hist.slice(0, st.idx + 1); st.hist.push(r.path); st.idx++;
        render();
      };
      w.body.addEventListener('click', e => {
        const nav = e.target.closest('[data-nav]')?.dataset.nav;
        if (nav === 'back' && st.idx > 0) { st.idx--; render(); }
        else if (nav === 'fwd' && st.idx < st.hist.length - 1) { st.idx++; render(); }
        else if (nav === 'up') go(fs.parent(cur()));
        else if (nav === 'view') { st.list = !st.list; render(); }
        const p = e.target.closest('.crumbs [data-path], .files-side [data-path]');
        if (p) go(p.dataset.path);
      });
      w.onArgs = a => go(a?.path || '~');
      w.onArgs(args);
    }
  };

  /* ================= Terminal ================= */
  apps.terminal = {
    title: 'Terminal', glyph: 'terminal', colors: ['#3a4152', '#151821'], w: 720, h: 460,
    mount(w) {
      w.body.innerHTML = `<div class="term"><div class="term-out" aria-live="polite"></div>
        <form class="term-line"><span class="term-prompt"></span><input class="term-in" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Terminal input"></form></div>`;
      const term = $('.term', w.body), out = $('.term-out', w.body), input = $('.term-in', w.body), promptEl = $('.term-prompt', w.body);
      const user = P.handle || 'guest';
      let cwd = '~'; const history = []; let hi = 0;
      const promptHtml = () => `<span class="t-user">visitor@${esc(user)}</span>:<span class="t-path">${esc(cwd)}</span>$`;
      const print = html => { const d = document.createElement('div'); d.innerHTML = html; out.append(d); };
      const err = s => print(`<span class="t-err">${esc(s)}</span>`);
      const a = s => `<span class="t-accent">${esc(s)}</span>`;
      const link = u => (safeUrl(u) ? `<a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(u)}</a>` : esc(u));
      const refresh = () => { promptEl.innerHTML = promptHtml(); };

      const HELP = [
        ['help', 'Show this list'], ['about', 'Who I am'], ['skills', 'What I work with'], ['experience', 'Where I have worked'],
        ['projects', 'List my projects'], ['project <id>', 'Details for one project'], ['contact', 'How to reach me'], ['social', 'My profiles'],
        ['resume', 'Open my résumé'], ['ls [path]', 'List files'], ['cd <dir>', 'Change folder'], ['pwd', 'Print current folder'],
        ['cat <file>', 'Print a document'], ['tree [path]', 'Show the folder tree'], ['open <app|path>', 'Open an app, file or folder'],
        ['apps', 'List applications'], ['wallpaper [name]', 'Change the wallpaper'], ['neofetch', 'System summary'],
        ['history', 'Command history'], ['echo, date, whoami', 'The usual'], ['clear', 'Clear the screen'], ['exit', 'Close the terminal']
      ];
      const tree = (node, prefix, depth) => node.children ? fs.sorted(node).map((c, i, arr) => {
        const last = i === arr.length - 1;
        const name = c.type === 'dir' ? a(c.name + '/') : esc(c.name);
        const sub = c.type === 'dir' && depth > 1 ? tree(c, prefix + (last ? '    ' : '│   '), depth - 1) : '';
        return `${prefix}${last ? '└── ' : '├── '}${name}\n${sub}`;
      }).join('') : '';

      const cmds = {
        help: () => print(`Available commands:\n\n${HELP.map(([c, d]) => `  ${a(c.padEnd(20))}${esc(d)}`).join('\n')}\n\n<span class="t-dim">Tip: Tab completes commands and paths, ↑/↓ recalls history.</span>`),
        about: () => print(`${a(P.name)} — ${esc(P.role)}, ${esc(P.location)}\n\n${esc(P.tagline)}\n\n${P.bio.map(esc).join('\n\n')}`),
        whoami: () => print(`visitor <span class="t-dim">(viewing the portfolio of ${esc(P.name)})</span>`),
        skills: () => print(D.skills.map(g => `${a(g.group)}\n${g.items.map(s => (s.level ? `  ${esc(s.name.padEnd(24))}<span class="t-green">${'█'.repeat(Math.round(s.level / 10))}</span><span class="t-dim">${'░'.repeat(10 - Math.round(s.level / 10))}</span> ${+s.level}%` : `  • ${esc(s.name || s)}`)).join('\n')}`).join('\n\n')),
        experience: () => print(D.experience.map(e => `${a(e.role)} · ${esc(e.company)} <span class="t-dim">(${esc(e.period)})</span>\n  ${esc(e.summary)}`).join('\n\n')),
        projects: () => print(D.projects.map(p => `  ${a(p.id.padEnd(16))}${esc(p.tagline)}`).join('\n') + `\n\n<span class="t-dim">Try: project ${esc(D.projects[0]?.id || '')}  ·  open projects</span>`),
        project: ([id]) => {
          const p = D.projects.find(x => x.id === id || x.name.toLowerCase() === String(id).toLowerCase());
          if (!p) return err(id ? `project: no such project: ${id}` : 'usage: project <id>');
          print(`${a(p.name)}${p.badge ? ` <span class="t-dim">(${esc(p.badge)})</span>` : ''}\n${esc(p.tagline)}\n\n${esc(p.description)}\n\n${p.highlights.map(x => `  • ${esc(x)}`).join('\n')}\n\nStack   ${esc(p.tech.join(', '))}${p.links?.source ? `\nSource  ${link(p.links.source)}` : ''}${p.links?.demo ? `\nDemo    ${link(p.links.demo)}` : ''}`);
        },
        contact: () => print(`Email     <a href="mailto:${esc(P.email)}">${esc(P.email)}</a>\nLocation  ${esc(P.location)}\n\n<span class="t-dim">Run</span> ${a('open contact')} <span class="t-dim">to send a message.</span>`),
        social: () => print(D.socials.map(s => `  ${a(s.name.padEnd(14))}${link(s.url)}`).join('\n')),
        resume: () => { openPath('~/Documents/resume.md'); print('Opening résumé…'); },
        pwd: () => print(esc(cwd)),
        ls: args => {
          const all = args.includes('-a') || args.includes('-la') || args.includes('-al');
          const target = args.find(x => !x.startsWith('-')) || '.';
          const r = fs.resolve(target, cwd);
          if (!r) return err(`ls: ${target}: No such file or directory`);
          if (r.node.type !== 'dir') return print(esc(r.node.name));
          const names = fs.sorted(r.node).map(c => (c.type === 'dir' ? a(c.name + '/') : c.kind === 'app' ? `<span class="t-green">${esc(c.name)}</span>` : esc(c.name)));
          if (all) names.unshift(a('./'), a('../'));
          print(`<div class="t-cols">${names.map(n => `<span>${n}</span>`).join('')}</div>`);
        },
        cd: ([target = '~']) => {
          const r = fs.resolve(target, cwd);
          if (!r) return err(`cd: ${target}: No such file or directory`);
          if (r.node.type !== 'dir') return err(`cd: ${target}: Not a directory`);
          cwd = r.path;
        },
        cat: ([target]) => {
          if (!target) return err('usage: cat <file>');
          const r = fs.resolve(target, cwd);
          if (!r) return err(`cat: ${target}: No such file or directory`);
          const n = r.node;
          if (n.type === 'dir') return err(`cat: ${target}: Is a directory`);
          if (n.kind === 'text') return print(esc(n.content));
          if (n.kind === 'link') return print(`[InternetShortcut]\nURL=${link(n.url)}`);
          print(`<span class="t-warn">${esc(n.name)} is a ${esc(kindLabel(n).toLowerCase())} — try:</span> ${a('open ' + target)}`);
        },
        tree: ([target = '.']) => {
          const r = fs.resolve(target, cwd);
          if (!r || r.node.type !== 'dir') return err(`tree: ${target}: Not a directory`);
          print(`${a(r.path)}\n${tree(r.node, '', 3)}`);
        },
        open: ([target]) => {
          if (!target) return err('usage: open <app|path>');
          const id = target.toLowerCase().replace(/\.app$/, '');
          if (apps[id]) { WM.open(id); return print(`Opening ${esc(apps[id].title)}…`); }
          const r = fs.resolve(target, cwd);
          if (!r) return err(`open: ${target}: No such app, file or directory`);
          openPath(r.path); print(`Opening ${esc(r.node.name)}…`);
        },
        apps: () => print(Object.entries(apps).map(([id, app]) => `  ${a(id.padEnd(12))}${esc(app.title)}`).join('\n')),
        wallpaper: ([name]) => {
          if (!name) { OS.nextWallpaper(); return print(`<span class="t-dim">Options: ${esc(OS.wallpapers.join(', '))}</span>`); }
          OS.setWallpaper(name) ? print(`Wallpaper set to ${a(name)}.`) : err(`wallpaper: unknown "${name}". Options: ${OS.wallpapers.join(', ')}`);
        },
        neofetch: () => {
          const art = ['  ┌──────────┐', '  │ ❯ _      │', '  │          │', '  └──────────┘', '    ▔▔▔▔▔▔▔▔  '];
          const info = [`${a(user)}@${a('portfolio')}`, '─────────────────', `${a('OS')}        ${esc(D.osName)}`, `${a('Owner')}     ${esc(P.name)}`, `${a('Role')}      ${esc(P.role)}`,
            `${a('Location')}  ${esc(P.location)}`, `${a('Projects')}  ${D.projects.length}`, `${a('Shell')}     portfolio-sh`, `${a('Uptime')}    ${Math.round(performance.now() / 1000)}s`];
          print(info.map((l, i) => `<span class="t-pink">${art[i] || ' '.repeat(14)}</span>  ${l}`).join('\n'));
        },
        history: () => print(history.map((c, i) => `<span class="t-dim">${String(i + 1).padStart(4)}</span>  ${esc(c)}`).join('\n')),
        echo: args => print(esc(args.join(' '))),
        date: () => print(esc(new Date().toString())),
        clear: () => { out.innerHTML = ''; },
        exit: () => WM.close('terminal'),
        sudo: args => (args.join(' ') === 'hire-me'
          ? (WM.open('contact'), print('<span class="t-green">Permission granted.</span> Opening Contact…'))
          : print(`<span class="t-warn">Nice try.</span> <span class="t-dim">(but</span> ${a('sudo hire-me')} <span class="t-dim">works)</span>`))
      };
      cmds.ll = cmds.ls; cmds.man = cmds.help; cmds['?'] = cmds.help;

      const run = line => {
        print(`${promptHtml()} ${esc(line)}`);
        const [name, ...args] = line.trim().split(/\s+/);
        if (!name) return;
        history.push(line.trim()); hi = history.length;
        const fn = cmds[name.toLowerCase()];
        if (fn) { try { fn(args); } catch (e) { console.error(e); err(`${name}: something went wrong`); } }
        else err(`${name}: command not found — type "help" for a list`);
      };
      const complete = () => {
        const val = input.value, parts = val.split(/\s+/), lastTok = parts[parts.length - 1];
        let pool, base = '';
        if (parts.length === 1) pool = Object.keys(cmds).filter(c => c.length > 1);
        else {
          const cut = lastTok.lastIndexOf('/');
          base = cut >= 0 ? lastTok.slice(0, cut + 1) : '';
          const r = fs.resolve(base || '.', cwd);
          pool = r?.node.type === 'dir' ? r.node.children.map(c => c.name + (c.type === 'dir' ? '/' : '')) : [];
          if (parts[0] === 'open' && parts.length === 2 && !base) pool = pool.concat(Object.keys(apps));
          if (parts[0] === 'project') pool = D.projects.map(p => p.id);
          if (parts[0] === 'wallpaper') pool = OS.wallpapers;
        }
        const frag = lastTok.slice(base.length).toLowerCase();
        const hits = pool.filter(c => c.toLowerCase().startsWith(frag));
        if (!hits.length) return;
        if (hits.length === 1) parts[parts.length - 1] = base + hits[0] + (parts.length === 1 ? ' ' : '');
        else {
          let pre = hits[0];
          for (const x of hits) while (!x.toLowerCase().startsWith(pre.toLowerCase())) pre = pre.slice(0, -1);
          if (pre.length > frag.length) parts[parts.length - 1] = base + pre;
          else { print(`${promptHtml()} ${esc(val)}`); print(`<div class="t-cols">${hits.map(x => `<span>${esc(x)}</span>`).join('')}</div>`); }
        }
        input.value = parts.join(' ');
      };

      $('.term-line', w.body).addEventListener('submit', e => {
        e.preventDefault();
        const v = input.value; input.value = '';
        run(v); refresh();
        term.scrollTop = term.scrollHeight;
      });
      input.addEventListener('keydown', e => {
        if (e.key === 'ArrowUp') { e.preventDefault(); if (hi > 0) input.value = history[--hi]; }
        else if (e.key === 'ArrowDown') { e.preventDefault(); input.value = hi < history.length - 1 ? history[++hi] : (hi = history.length, ''); }
        else if (e.key === 'Tab') { e.preventDefault(); complete(); term.scrollTop = term.scrollHeight; }
        else if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); cmds.clear(); }
      });
      term.addEventListener('click', () => { if (!String(getSelection())) input.focus({ preventScroll: true }); });

      print(`<span class="t-accent">${esc(D.osName)}</span> — welcome to ${esc(P.name)}'s portfolio.\nType ${a('help')} to see what you can do, or try ${a('projects')}, ${a('ls')} and ${a('neofetch')}.\n`);
      refresh();
      if (!OS.isCoarse()) setTimeout(() => input.focus({ preventScroll: true }), 60);
    }
  };

  /* ================= Browser ================= */
  apps.browser = {
    title: 'Browser', glyph: 'globe', colors: ['#34d399', '#0ea5a4'], w: 880, h: 600,
    mount(w, args) {
      const HOME = 'portfolio://home';
      const st = { hist: [], idx: -1 };
      w.body.innerHTML = `<div class="browser">
        <div class="br-bar">
          <button class="icon-btn" data-nav="back" aria-label="Back">${svg('back')}</button>
          <button class="icon-btn" data-nav="fwd" aria-label="Forward">${svg('fwd')}</button>
          <button class="icon-btn" data-nav="reload" aria-label="Reload">${svg('reload')}</button>
          <button class="icon-btn" data-nav="home" aria-label="Home">${svg('home')}</button>
          <form class="br-url"><input type="text" aria-label="Address" spellcheck="false" autocapitalize="off" autocomplete="off"></form>
          <button class="icon-btn" data-nav="ext" aria-label="Open in a new browser tab" title="Open in a new tab">${svg('ext')}</button>
        </div>
        <div class="br-marks">${D.socials.map(s => `<button data-url="${esc(s.url)}"><i style="--c:${esc(s.color)}"></i>${esc(s.name)}</button>`).join('')}</div>
        <div class="br-view"></div></div>`;
      const view = $('.br-view', w.body), addr = $('.br-url input', w.body);
      const cur = () => st.hist[st.idx];
      const same = (x, y) => x.replace(/\/$/, '') === y.replace(/\/$/, '');

      const pages = {
        home: () => `<div class="br-page br-home"><h2>${esc(P.name)}</h2><p>Find me around the web</p>
          <div class="br-tiles">${D.socials.map(s => `<button class="br-tile" data-url="${esc(s.url)}"><span class="ini" style="--c:${esc(s.color)}">${esc(s.name[0])}</span><b>${esc(s.name)}</b><small>${esc(s.handle)}</small></button>`).join('')}</div>
          <div class="sec-title">Project links</div>
          <div class="br-list">${D.projects.flatMap(p => [p.links?.demo && [p.name + ' — live demo', p.links.demo], p.links?.source && [p.name + ' — source', p.links.source]].filter(Boolean))
            .map(([t, u]) => `<a href="${esc(u)}" data-url="${esc(u)}"><b>${esc(t)}</b><span>${esc(u.replace(/^https?:\/\//, ''))}</span></a>`).join('')}</div></div>`,
        social: s => `<div class="br-page"><div class="br-prof"><span class="ini" style="--c:${esc(s.color)}">${esc(s.name[0])}</span>
          <h2>${esc(P.name)} on ${esc(s.name)}</h2><div class="muted">${esc(s.handle)}</div><p>${esc(s.description)}</p>
          ${ext(s.url, `${svg('ext')} Open ${esc(s.name)}`, 'btn primary')}
          <div class="note">${esc(s.name)} doesn't allow itself to be embedded in other pages, so the profile opens in a new tab.</div></div>
          ${s.id === 'github' ? `<div class="sec-title">Repositories</div><div class="br-list">${D.projects.filter(p => p.links?.source).map(p => `<a href="${esc(p.links.source)}" target="_blank" rel="noopener noreferrer"><b>${esc(p.name)}</b><span>${esc(p.tech.slice(0, 3).join(' · '))}</span></a>`).join('')}</div>` : ''}</div>`,
        external: u => `<div class="br-page"><div class="br-prof"><span class="ini" style="--c:#7c9cff">${svg('globe')}</span>
          <h2>${esc(new URL(u).hostname)}</h2><p>Most sites block being shown inside another page, so this one opens in a real browser tab.</p>
          ${ext(u, `${svg('ext')} Open in a new tab`, 'btn primary')}</div></div>`,
        bad: u => `<div class="br-page"><div class="br-prof"><h2>Can't open this address</h2><p>"${esc(u)}" isn't a valid web address.</p><button class="btn" data-url="${HOME}">Go home</button></div></div>`
      };
      const render = () => {
        const u = cur();
        addr.value = u === HOME ? '' : u;
        addr.placeholder = 'Search or enter address';
        $('[data-nav=back]', w.body).disabled = st.idx <= 0;
        $('[data-nav=fwd]', w.body).disabled = st.idx >= st.hist.length - 1;
        $('[data-nav=ext]', w.body).disabled = !safeUrl(u);
        const s = D.socials.find(x => same(x.url, u));
        view.innerHTML = u === HOME ? pages.home() : s ? pages.social(s) : safeUrl(u) ? pages.external(u) : pages.bad(u);
        w.setTitle(u === HOME ? 'Browser' : `Browser — ${s ? s.name : safeUrl(u) ? new URL(u).hostname : 'Error'}`);
        view.scrollTop = 0;
      };
      const go = raw => {
        let u = String(raw || '').trim();
        if (!u) u = HOME;
        else if (u !== HOME && !/^[a-z][a-z0-9+.-]*:/i.test(u)) u = /^[^\s/]+\.[^\s/]+/.test(u) ? 'https://' + u : 'https://duckduckgo.com/?q=' + encodeURIComponent(u);
        if (u !== HOME && safeUrl(u) && !u.startsWith('mailto:')) u = safeUrl(u);
        if (cur() !== u) { st.hist = st.hist.slice(0, st.idx + 1); st.hist.push(u); st.idx++; }
        render();
      };
      w.body.addEventListener('click', e => {
        const nav = e.target.closest('[data-nav]')?.dataset.nav;
        if (nav === 'back' && st.idx > 0) { st.idx--; render(); }
        else if (nav === 'fwd' && st.idx < st.hist.length - 1) { st.idx++; render(); }
        else if (nav === 'reload') render();
        else if (nav === 'home') go(HOME);
        else if (nav === 'ext' && safeUrl(cur())) window.open(safeUrl(cur()), '_blank', 'noopener,noreferrer');
        const t = e.target.closest('[data-url]');
        if (t) { e.preventDefault(); go(t.dataset.url); }
      });
      $('.br-url', w.body).addEventListener('submit', e => { e.preventDefault(); go(addr.value); addr.blur(); });
      addr.addEventListener('focus', () => addr.select());
      w.onArgs = a => go(a?.url || HOME);
      w.onArgs(args);
    }
  };

  /* ================= Media Player ================= */
  const fmt = s => { s = Math.max(0, Math.floor(s || 0)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

  /** Animated canvas placeholder used when a track has no video file. */
  function synthPlayer(canvas, track, cb) {
    const ctx = canvas.getContext('2d'), W = canvas.width = 1280, H = canvas.height = 720;
    const dur = track.duration || 30, [ca, cb2] = track.color;
    const scenes = track.scenes?.length ? track.scenes : ['Overview'];
    let t = 0, playing = false, raf = 0, last = 0;
    const ease = x => 1 - Math.pow(1 - Math.max(0, Math.min(1, x)), 3);
    const rr = (x, y, w, hh, r) => { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + hh, r); ctx.arcTo(x + w, y + hh, x, y + hh, r); ctx.arcTo(x, y + hh, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); };
    const blob = (x, y, r, c) => { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, c + '88'); g.addColorStop(1, c + '00'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); };
    function draw() {
      ctx.globalAlpha = 1; ctx.fillStyle = '#0b0d14'; ctx.fillRect(0, 0, W, H);
      blob(W * .22 + Math.sin(t * .5) * 130, H * .3 + Math.cos(t * .4) * 70, 460, ca);
      blob(W * .8 + Math.cos(t * .35) * 110, H * .72 + Math.sin(t * .6) * 80, 500, cb2);
      const sl = dur / scenes.length, si = Math.min(scenes.length - 1, Math.floor(t / sl)), sp = (t - si * sl) / sl;
      const fade = Math.max(0, Math.min(1, sp * 7, (1 - sp) * 7 + (si === scenes.length - 1 ? 1 : 0)));
      const x = 250, y = 90, w = 780, hh = 400;
      rr(x, y, w, hh, 18); ctx.fillStyle = 'rgba(16,18,26,.82)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.lineWidth = 1.5; ctx.stroke();
      ['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => { ctx.beginPath(); ctx.arc(x + 26 + i * 20, y + 24, 6, 0, 7); ctx.fillStyle = c; ctx.fill(); });
      ctx.fillStyle = 'rgba(255,255,255,.1)'; ctx.fillRect(x, y + 46, w, 1);
      ctx.globalAlpha = fade;
      const kind = si % 3, ix = x + 40, iy = y + 80, iw = w - 80, ih = hh - 120;
      if (kind === 0) {
        const n = 10, bw = iw / n;
        for (let i = 0; i < n; i++) {
          const v = (.3 + .6 * Math.abs(Math.sin(i * 1.7 + si * 2))) * ease(sp * 4 - i * .08) * (1 + .05 * Math.sin(t * 2 + i));
          const g = ctx.createLinearGradient(0, iy + ih, 0, iy); g.addColorStop(0, ca); g.addColorStop(1, cb2);
          ctx.fillStyle = g; rr(ix + i * bw + 8, iy + ih - v * ih, bw - 16, Math.max(1, v * ih), 8); ctx.fill();
        }
      } else if (kind === 1) {
        for (let i = 0; i < 5; i++) {
          const e = ease(sp * 5 - i * .25), ry = iy + i * (ih / 5);
          ctx.globalAlpha = fade * e;
          ctx.fillStyle = 'rgba(255,255,255,.07)'; rr(ix + (1 - e) * 50, ry, iw, ih / 5 - 12, 10); ctx.fill();
          ctx.fillStyle = i % 2 ? cb2 : ca; ctx.beginPath(); ctx.arc(ix + 28 + (1 - e) * 50, ry + (ih / 5 - 12) / 2, 10, 0, 7); ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,.5)'; rr(ix + 54 + (1 - e) * 50, ry + (ih / 5 - 12) / 2 - 6, 200 + (i * 67) % 220, 12, 6); ctx.fill();
        }
      } else {
        for (let i = 0; i < 6; i++) {
          const cw = iw / 3, ch = ih / 2, cx = ix + (i % 3) * cw, cy = iy + Math.floor(i / 3) * ch, e = ease(sp * 5 - i * .15);
          ctx.globalAlpha = fade * e;
          ctx.fillStyle = 'rgba(255,255,255,.07)'; rr(cx + 6, cy + 6, cw - 12, ch - 12, 12); ctx.fill();
          ctx.globalAlpha = fade * e * (.55 + .3 * Math.sin(t * 1.5 + i));
          ctx.fillStyle = i % 2 ? cb2 : ca; rr(cx + 18, cy + 18, cw - 36, ch - 64, 8); ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#fff'; ctx.font = '600 40px system-ui, sans-serif'; ctx.textBaseline = 'alphabetic';
      ctx.fillText(track.title, 250, 570, 780);
      ctx.globalAlpha = fade; ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.font = '400 24px system-ui, sans-serif';
      ctx.fillText(`${String(si + 1).padStart(2, '0')}  —  ${scenes[si]}`, 250, 612, 780);
      ctx.globalAlpha = 1; ctx.font = '600 14px system-ui, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,.45)';
      ctx.fillText('SAMPLE DEMO  ·  REPLACE WITH YOUR VIDEO IN data.js', 250, 660);
    }
    function frame(now) {
      if (!playing) return;
      t += Math.min(.1, (now - last) / 1000); last = now;
      if (t >= dur) { t = dur; playing = false; draw(); cb.update(); cb.ended(); return; }
      draw(); cb.update(); raf = requestAnimationFrame(frame);
    }
    draw();
    return {
      get time() { return t; }, get duration() { return dur; }, get playing() { return playing; }, hasAudio: false,
      play() { if (playing) return; if (t >= dur) t = 0; playing = true; last = performance.now(); raf = requestAnimationFrame(frame); cb.update(); },
      pause() { playing = false; cancelAnimationFrame(raf); cb.update(); },
      seek(v) { t = Math.max(0, Math.min(dur, v)); draw(); cb.update(); },
      destroy() { playing = false; cancelAnimationFrame(raf); }
    };
  }
  function videoPlayer(video, cb) {
    ['timeupdate', 'play', 'pause', 'loadedmetadata', 'durationchange'].forEach(ev => video.addEventListener(ev, cb.update));
    video.addEventListener('ended', cb.ended);
    return {
      get time() { return video.currentTime; }, get duration() { return video.duration || 0; }, get playing() { return !video.paused && !video.ended; }, hasAudio: true,
      play() { video.play().catch(() => {}); }, pause() { video.pause(); }, seek(v) { video.currentTime = v; },
      destroy() { video.pause(); video.removeAttribute('src'); video.load(); }
    };
  }

  apps.media = {
    title: 'Media Player', glyph: 'play', colors: ['#f472b6', '#a855f7'], w: 880, h: 540,
    mount(w, args) {
      const list = OS.tracks();
      let idx = 0, player = null, scrubbing = false;
      w.body.innerHTML = `<div class="media">
        <div class="media-main">
          <div class="stage"><button class="big-play" aria-label="Play">${svg('play')}</button></div>
          <div class="controls">
            <button class="icon-btn" data-c="prev" aria-label="Previous">${svg('prev')}</button>
            <button class="icon-btn" data-c="toggle" aria-label="Play or pause">${svg('play')}</button>
            <button class="icon-btn" data-c="next" aria-label="Next">${svg('next')}</button>
            <span class="time cur">0:00</span>
            <input type="range" class="seek" min="0" max="1000" value="0" aria-label="Seek">
            <span class="time dur">0:00</span>
            <button class="icon-btn" data-c="mute" aria-label="Mute">${svg('volume')}</button>
            <input type="range" class="vol" min="0" max="100" value="100" aria-label="Volume">
            <button class="icon-btn" data-c="full" aria-label="Fullscreen">${svg('full')}</button>
          </div>
        </div>
        <aside class="playlist"><div class="lbl">Playlist</div>${list.map((t, i) => `<button data-i="${i}" style="--a:${esc(t.color[0])};--b:${esc(t.color[1])}">
          <span class="sw">${svg('play')}</span><span><b>${esc(t.title)}</b><small>${esc(t.subtitle)} · ${fmt(t.duration)}</small></span></button>`).join('')}</aside></div>`;
      const stage = $('.stage', w.body), seek = $('.seek', w.body), vol = $('.vol', w.body);
      const toggleBtn = $('[data-c=toggle]', w.body), muteBtn = $('[data-c=mute]', w.body);
      let wasPlaying = null;
      const update = () => {
        if (!player) return;
        if (wasPlaying !== player.playing) {
          wasPlaying = player.playing;
          toggleBtn.innerHTML = svg(player.playing ? 'pause' : 'play');
          stage.classList.toggle('playing', player.playing);
        }
        $('.cur', w.body).textContent = fmt(player.time);
        $('.dur', w.body).textContent = fmt(player.duration);
        if (!scrubbing && player.duration) seek.value = Math.round(player.time / player.duration * 1000);
      };
      const cb = { update, ended: () => { if (idx < list.length - 1) load(idx + 1, true); } };
      const useSynth = (t, autoplay) => {
        stage.querySelector('video, canvas')?.remove();
        const c = document.createElement('canvas'); stage.prepend(c);
        player = synthPlayer(c, t, cb);
        vol.disabled = muteBtn.disabled = true;
        if (autoplay) player.play();
        update();
      };
      const load = (i, autoplay) => {
        player?.destroy(); player = null; wasPlaying = null;
        idx = (i + list.length) % list.length;
        const t = list[idx];
        stage.querySelector('video, canvas')?.remove();
        $$('.playlist button', w.body).forEach((b, n) => b.classList.toggle('on', n === idx));
        w.setTitle(`Media Player — ${t.title}`);
        if (t.src) {
          const v = document.createElement('video');
          v.src = t.src; v.playsInline = true; v.preload = 'metadata'; v.volume = vol.value / 100;
          v.addEventListener('error', () => { toast(`Couldn't load ${t.src} — showing placeholder`); player?.destroy(); useSynth(t, false); }, { once: true });
          stage.prepend(v);
          player = videoPlayer(v, cb);
          vol.disabled = muteBtn.disabled = false;
          if (autoplay) player.play();
          update();
        } else useSynth(t, autoplay);
      };
      const toggle = () => player && (player.playing ? player.pause() : player.play());
      w.body.addEventListener('click', e => {
        const c = e.target.closest('[data-c]')?.dataset.c;
        if (c === 'toggle') toggle();
        else if (c === 'prev') load(idx - 1, true);
        else if (c === 'next') load(idx + 1, true);
        else if (c === 'full') (document.fullscreenElement ? document.exitFullscreen() : stage.requestFullscreen?.())?.catch?.(() => {});
        else if (c === 'mute') { const v = $('video', stage); if (v) { v.muted = !v.muted; muteBtn.innerHTML = svg(v.muted ? 'mute' : 'volume'); } }
        const pl = e.target.closest('.playlist [data-i]');
        if (pl) load(+pl.dataset.i, true);
        if (e.target.closest('.stage')) toggle();
      });
      seek.addEventListener('input', () => { scrubbing = true; player?.seek(seek.value / 1000 * player.duration); });
      seek.addEventListener('change', () => { scrubbing = false; });
      vol.addEventListener('input', () => { const v = $('video', stage); if (v) v.volume = vol.value / 100; });
      w.body.addEventListener('keydown', e => { if (e.key === ' ' && !e.target.closest('button, input')) { e.preventDefault(); toggle(); } });
      w.onClose = () => player?.destroy();
      w.onHide = () => player?.pause();
      w.onArgs = a => { const i = list.findIndex(t => t.id === a?.track); load(i >= 0 ? i : 0, !!a?.track); };
      w.onArgs(args);
    }
  };

  /* ================= Contact ================= */
  apps.contact = {
    title: 'Contact', glyph: 'mail', colors: ['#fbbf24', '#f97316'], w: 820, h: 560,
    mount(w) {
      w.body.innerHTML = `<div class="contact">
        <div>
          <h2>Let's talk</h2>
          <p class="sub">Have a project in mind, a role to fill, or just want to say hi?</p>
          <div class="c-list">
            <button class="c-row" data-copy="${esc(P.email)}"><span class="ini">${svg('mail')}</span><span><b>Email</b><small>${esc(P.email)}</small></span><span class="go">Copy</span></button>
            <div class="c-row"><span class="ini" style="--c:#34d399">${svg('pin')}</span><span><b>Location</b><small>${esc(P.location)}</small></span></div>
            ${D.socials.map(s => `<a class="c-row" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer"><span class="ini" style="--c:${esc(s.color)}">${esc(s.name[0])}</span><span><b>${esc(s.name)}</b><small>${esc(s.handle)}</small></span><span class="go">Open ↗</span></a>`).join('')}
          </div>
        </div>
        <form class="c-form">
          <label>Your name<input name="name" required autocomplete="name"></label>
          <label>Your email<input name="email" type="email" required autocomplete="email"></label>
          <label>Message<textarea name="message" rows="6" required></textarea></label>
          <button class="btn primary" type="submit">${svg('mail')} Send message</button>
          <div class="hint">This opens your email app with the message filled in — nothing is sent from this page.</div>
        </form></div>`;
      $('[data-copy]', w.body).addEventListener('click', async e => {
        const v = e.currentTarget.dataset.copy;
        try { await navigator.clipboard.writeText(v); toast('Email address copied'); }
        catch { toast(`Email: ${v}`); }
      });
      $('.c-form', w.body).addEventListener('submit', e => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const subject = `Hello from ${f.get('name')}`;
        const body = `${f.get('message')}\n\n— ${f.get('name')} (${f.get('email')})`;
        location.href = `mailto:${encodeURIComponent(P.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        toast('Opening your email app…');
      });
    }
  };

  /* ================= Notes (document viewer) ================= */
  apps.notes = {
    title: 'Notes', glyph: 'text', colors: ['#64748b', '#334155'], w: 680, h: 560,
    mount(w, args) {
      w.onArgs = a => {
        const r = fs.resolve(a?.path || '~/README.md');
        if (!r || r.node.kind !== 'text') { w.body.innerHTML = '<div class="empty">This document could not be opened.</div>'; return; }
        w.setTitle(`Notes — ${r.node.name}`);
        w.body.innerHTML = `<article class="doc">${/\.md$/i.test(r.node.name) ? md(r.node.content) : `<pre>${esc(r.node.content)}</pre>`}</article>`;
        w.body.scrollTop = 0;
      };
      w.onArgs(args);
    }
  };

  /* ================= Preview (image viewer) ================= */
  apps.preview = {
    title: 'Preview', glyph: 'image', colors: ['#22d3ee', '#6366f1'], w: 760, h: 540,
    mount(w, args) {
      let dirPath = '~', images = [], i = 0;
      const render = () => {
        const n = images[i];
        if (!n) { w.body.innerHTML = '<div class="empty">No image to show. Open one from Files or a project.</div>'; return; }
        w.setTitle(`Preview — ${n.name}`);
        w.body.innerHTML = `<div class="preview"><div class="pv-stage"><img src="${esc(n.src)}" alt="${esc(n.title || n.name)}"></div>
          <div class="pv-bar"><button class="icon-btn" data-d="-1" aria-label="Previous image" ${images.length < 2 ? 'disabled' : ''}>${svg('back')}</button>
          <span>${esc(n.title || n.name)} · ${i + 1} / ${images.length}</span>
          <button class="icon-btn" data-d="1" aria-label="Next image" ${images.length < 2 ? 'disabled' : ''}>${svg('fwd')}</button></div></div>`;
      };
      w.body.addEventListener('click', e => {
        const d = e.target.closest('[data-d]');
        if (d && images.length) { i = (i + +d.dataset.d + images.length) % images.length; render(); }
      });
      w.onArgs = a => {
        const r = a?.path && fs.resolve(a.path);
        if (r && r.node.kind === 'image') {
          dirPath = fs.parent(r.path);
          images = fs.sorted(fs.resolve(dirPath).node).filter(c => c.kind === 'image');
          i = Math.max(0, images.indexOf(r.node));
        }
        render();
      };
      w.onArgs(args);
    }
  };
})();
