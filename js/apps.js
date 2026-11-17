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
          <button class="icon-btn" data-nav="new" aria-label="New folder or file" title="New folder or file" data-menu>${svg('plus')}</button>
          <button class="icon-btn" data-nav="view" aria-label="Toggle list view">${svg('list')}</button>
        </div>
        <aside class="files-side"><div class="lbl">Places</div>${places.map(([n, p, g]) => `<button data-path="${p}">${svg(g)}${n}</button>`).join('')}</aside>
        <div class="files-main"><div class="files-grid"></div></div>
        <div class="files-status"></div></div>`;
      const main = $('.files-main', w.body), gridEl = $('.files-grid', w.body);
      const cur = () => st.hist[st.idx];
      const pathOf = n => fs.join(cur(), n.name);
      const open = n => (n.type === 'dir' ? go(pathOf(n)) : openPath(pathOf(n)));
      const fsTry = fn => { try { fn(); } catch (e) { if (!(e instanceof OS.FsError)) throw e; toast(e.message.replace(/^[^:]*: /, '')); } };
      const render = () => {
        const r = fs.resolve(cur()) || fs.resolve('~');
        const path = r.path, items = fs.sorted(r.node);
        st.hist[st.idx] = path;
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
        if (!items.length) gridEl.innerHTML = '<div class="empty">This folder is empty. Right-click or use + to create something.</div>';
        for (const n of items) {
          const b = h(`<button class="f-item${n.user ? ' mine' : ''}" title="${esc(n.name)}">${fileIcon(n)}<span class="name">${esc(n.name)}</span><span class="kind">${esc(n.user ? 'Your ' + kindLabel(n).toLowerCase() : kindLabel(n))}</span></button>`);
          b._node = n;
          bindOpen(b, () => open(n));
          b.addEventListener('keydown', e => {
            if (!n.user) return;
            if (e.key === 'Delete' || (e.key === 'Backspace' && e.metaKey)) { e.preventDefault(); del(n); }
            else if (e.key === 'F2') { e.preventDefault(); rename(n); }
          });
          gridEl.append(b);
        }
        const mine = items.filter(n => n.user).length;
        $('.files-status', w.body).textContent = `${items.length} item${items.length === 1 ? '' : 's'}${mine ? ` (${mine} yours)` : ''}  ·  ${path}`;
      };
      const go = path => {
        const r = fs.resolve(path);
        if (!r || r.node.type !== 'dir') return toast('Folder not found');
        if (cur() === r.path) return render();
        st.hist = st.hist.slice(0, st.idx + 1); st.hist.push(r.path); st.idx++;
        render();
        main.scrollTop = 0;
      };

      const validName = name => {
        if (!name) return false;
        if (name.includes('/') || name === '.' || name === '..') { toast('That name isn’t allowed'); return false; }
        if (fs.resolve(fs.join(cur(), name))) { toast(`“${name}” already exists here`); return false; }
        return true;
      };
      const newItem = async type => {
        const isDir = type === 'dir';
        const name = await OS.ask(w, { title: isDir ? 'New folder' : 'New text file', value: fs.freeName(cur(), isDir ? 'new-folder' : 'untitled', isDir ? '' : '.txt'), ok: 'Create' });
        if (!validName(name)) return;
        const p = fs.join(cur(), name);
        fsTry(() => { if (isDir) fs.mkdir(p); else { fs.write(p, ''); WM.open('notes', { path: p, edit: true }); } });
      };
      const rename = async n => {
        const name = await OS.ask(w, { title: `Rename “${n.name}”`, value: n.name, ok: 'Rename' });
        if (name && name !== n.name && validName(name)) fsTry(() => fs.move(pathOf(n), fs.join(cur(), name)));
      };
      const del = async n => {
        const ok = await OS.ask(w, { title: `Delete “${n.name}”${n.type === 'dir' && n.children.length ? ' and everything in it' : ''}?`, ok: 'Delete', input: false });
        if (ok) fsTry(() => fs.remove(pathOf(n), '~', { recursive: true }));
      };
      const duplicate = n => {
        const dot = n.type === 'dir' ? -1 : n.name.lastIndexOf('.');
        const [base, ext] = dot > 0 ? [n.name.slice(0, dot), n.name.slice(dot)] : [n.name, ''];
        fsTry(() => fs.copy(pathOf(n), fs.join(cur(), fs.freeName(cur(), base + '-copy', ext)), '~', true));
      };
      const createMenu = [{ label: 'New folder…', run: () => newItem('dir') }, { label: 'New text file…', run: () => newItem('file') }];

      main.addEventListener('contextmenu', e => {
        e.preventDefault();
        const item = e.target.closest('.f-item'), n = item?._node;
        if (item) { $$('.selected', gridEl).forEach(s => s.classList.remove('selected')); item.classList.add('selected'); }
        OS.showMenu(e.clientX, e.clientY, n ? [
          { label: 'Open', run: () => open(n) },
          ...(n.user && n.kind === 'text' ? [{ label: 'Edit', run: () => WM.open('notes', { path: pathOf(n), edit: true }) }] : []),
          ...(n.kind !== 'app' ? [{ label: 'Duplicate', run: () => duplicate(n) }] : []),
          ...(n.user ? ['-', { label: 'Rename…', run: () => rename(n) }, { label: 'Delete', run: () => del(n) }] : [])
        ] : createMenu);
      });
      w.body.addEventListener('click', e => {
        const nav = e.target.closest('[data-nav]')?.dataset.nav;
        if (nav === 'back' && st.idx > 0) { st.idx--; render(); }
        else if (nav === 'fwd' && st.idx < st.hist.length - 1) { st.idx++; render(); }
        else if (nav === 'up') go(fs.parent(cur()));
        else if (nav === 'view') { st.list = !st.list; render(); }
        else if (nav === 'new') { const r = e.target.closest('[data-nav]').getBoundingClientRect(); OS.showMenu(r.left, r.bottom + 6, createMenu); }
        const p = e.target.closest('.crumbs [data-path], .files-side [data-path]');
        if (p) go(p.dataset.path);
      });
      const onChange = () => { if (!w.el.isConnected) document.removeEventListener('fs:change', onChange); else render(); };
      document.addEventListener('fs:change', onChange);
      w.onArgs = a => go(a?.path || '~');
      w.onArgs(args);
    }
  };

  /* ================= Terminal ================= */
  const FsError = OS.FsError;
  const globRe = (p, i) => new RegExp('^' + p.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$', i ? 'i' : '');
  const bytes = t => new TextEncoder().encode(t).length;
  const lineCount = t => (t ? t.split('\n').length - (t.endsWith('\n') ? 1 : 0) : 0);

  /** Split a command line into words and operators (| ; && > >>), honouring quotes and backslashes. */
  function lex(line) {
    const toks = []; let cur = '', has = false, glob = false, q = null;
    const push = () => { if (has) toks.push({ w: cur, g: glob }); cur = ''; has = glob = false; };
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (q) {
        if (c === q) q = null;
        else if (c === '\\' && q === '"' && /["\\]/.test(line[i + 1] || '')) cur += line[++i];
        else cur += c;
      } else if (c === '"' || c === "'") { q = c; has = true; }
      else if (c === '\\' && i + 1 < line.length) { cur += line[++i]; has = true; }
      else if (/\s/.test(c)) push();
      else if (c === '|' || c === ';' || c === '>' || c === '<' || (c === '&' && line[i + 1] === '&')) {
        push();
        if ((c === '>' || c === '&') && line[i + 1] === c) { toks.push({ op: c + c }); i++; } else toks.push({ op: c });
      } else { cur += c; has = true; if (c === '*' || c === '?') glob = true; }
    }
    if (q) throw new Error(`unexpected end of input (missing ${q})`);
    push();
    return toks;
  }
  /** Turn tokens into a list of { stages: [[tok…]…], redir, from, cond } — pipelines joined by ; or &&. */
  function parse(toks) {
    const list = []; let cmd = { stages: [[]], redir: null, cond: ';' };
    const bad = t => { throw new Error(`syntax error near unexpected token '${t}'`); };
    const flush = next => {
      if (cmd.stages[cmd.stages.length - 1].length) list.push(cmd);
      else if (cmd.stages.length > 1 || cmd.redir || (cmd.cond === '&&' && list.length) || next === '&&') bad(next || 'newline');
    };
    for (let i = 0; i < toks.length; i++) {
      const t = toks[i], stage = cmd.stages[cmd.stages.length - 1];
      if ('w' in t) stage.push(t);
      else if (t.op === '>' || t.op === '>>') {
        const f = toks[++i];
        if (!f || !('w' in f)) bad(f?.op || 'newline');
        cmd.redir = { file: f.w, append: t.op === '>>' };
      } else if (t.op === '<') {
        const f = toks[++i];
        if (!f || !('w' in f)) bad(f?.op || 'newline');
        cmd.from = f.w;
      } else if (t.op === '|') { if (!stage.length) bad('|'); cmd.stages.push([]); }
      else { flush(t.op); cmd = { stages: [[]], redir: null, cond: t.op }; }
    }
    flush();
    return list;
  }

  /** nano and vim, drawn over the terminal window. Throws FsError if the file can't be edited. */
  function openEditor(w, { kind, path, cwd, onExit }) {
    let file = null, content = '', readonly = false, isNew = true;
    if (path) {
      const r = fs.resolve(path, cwd);
      if (r) {
        if (r.node.type === 'dir') throw new FsError(`${path}: Is a directory`);
        const t = fs.read(r.node);
        if (t == null) throw new FsError(`${path}: is ${/^[aeiou]/i.test(kindLabel(r.node)) ? 'an' : 'a'} ${kindLabel(r.node).toLowerCase()}, not text — try: open ${path}`);
        content = t; readonly = !fs.writable(r.node); file = r.path; isNew = false;
      } else file = fs.norm(path, cwd);
    }
    const vim = kind === 'vim';
    const base = () => (file ? file.split('/').pop() : '');
    const KEYS = [['s', '^S', 'Save'], ['o', '^O', 'Write Out'], ['x', '^X', 'Exit'], ['k', '^K', 'Cut Line'], ['u', '^U', 'Paste'], ['f', '^F', 'Where Is']];
    const el = h(`<div class="ed ${vim ? 'ed-vim' : 'ed-nano'}">
      ${vim ? '' : '<div class="ed-head"><span>GNU nano 7.2</span><b class="ed-name"></b><span class="ed-flag"></span></div>'}
      <textarea class="ed-text" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" aria-label="${vim ? 'vim' : 'nano'} editor"></textarea>
      <div class="ed-msg" aria-live="polite"></div>
      ${vim ? '' : `<div class="ed-keys">${KEYS.map(([k, c, l]) => `<button type="button" data-k="${k}"><kbd>${c}</kbd> ${l}</button>`).join('')}</div>`}
    </div>`);
    const ta = $('.ed-text', el), msg = $('.ed-msg', el);
    let dirty = false;
    ta.value = content;
    w.body.append(el);
    ta.focus(); ta.setSelectionRange(0, 0);

    const save = target => {
      try {
        const v = ta.value;
        fs.write(target, v && !v.endsWith('\n') ? v + '\n' : v, '~');
        file = fs.resolve(target).path; readonly = false; dirty = false; isNew = false;
        return true;
      } catch (e) { if (!(e instanceof FsError)) throw e; return e.message.replace(/^[^:]*: /, ''); }
    };
    const close = () => { el.remove(); onExit(); };
    const lineBounds = (v, p) => { const ls = v.lastIndexOf('\n', p - 1) + 1; let le = v.indexOf('\n', p); if (le < 0) le = v.length; return [ls, le]; };
    const insertTab = () => { ta.setRangeText('\t', ta.selectionStart, ta.selectionEnd, 'end'); changed(); };
    let changed;

    if (!vim) {
      /* ---- nano ---- */
      let cut = '', lastFind = '';
      const head = () => {
        $('.ed-name', el).textContent = file ? base() : 'New Buffer';
        $('.ed-flag', el).textContent = readonly ? '[ Read-only ]' : dirty ? 'Modified' : '';
      };
      const note = s => { msg.innerHTML = s ? `<span class="ed-note">[ ${esc(s)} ]</span>` : ''; };
      changed = () => { if (!dirty) { dirty = true; head(); } };
      const ask = (label, value, cb) => {
        msg.innerHTML = `<form class="ed-ask"><label>${esc(label)}</label><input value="${esc(value)}" spellcheck="false" autocomplete="off" autocapitalize="off"></form>`;
        const f = $('form', msg), inp = $('input', msg);
        const end = () => { msg.innerHTML = ''; ta.focus(); };
        f.addEventListener('submit', e => { e.preventDefault(); const v = inp.value.trim(); end(); cb(v); });
        inp.addEventListener('keydown', e => {
          if (e.key === 'Escape' || (e.ctrlKey && e.key.toLowerCase() === 'c')) { e.preventDefault(); e.stopPropagation(); end(); note('Cancelled'); }
        });
        inp.focus(); inp.select();
      };
      const yesNo = (label, cb) => {
        msg.innerHTML = `<div class="ed-ask"><label>${esc(label)}</label><button type="button" data-a="y"><kbd>Y</kbd> Yes</button><button type="button" data-a="n"><kbd>N</kbd> No</button><button type="button" data-a="c"><kbd>^C</kbd> Cancel</button></div>`;
        const finish = a => { document.removeEventListener('keydown', key, true); msg.innerHTML = ''; ta.focus(); if (a === 'c') note('Cancelled'); else cb(a === 'y'); };
        const key = e => {
          if (!el.isConnected) return document.removeEventListener('keydown', key, true);
          if (document.activeElement !== document.body && !el.contains(document.activeElement)) return;
          const k = e.key.toLowerCase();
          e.preventDefault(); e.stopPropagation();
          if (k === 'y' || k === 'n') finish(k); else if (k === 'escape' || (e.ctrlKey && k === 'c')) finish('c');
        };
        document.addEventListener('keydown', key, true);
        $$('[data-a]', msg).forEach(b => b.addEventListener('click', () => finish(b.dataset.a)));
        ta.blur();
      };
      const wrote = () => { head(); const n = lineCount(ta.value); note(`Wrote ${n} line${n === 1 ? '' : 's'}`); };
      const writeOut = then => ask('File Name to Write: ', !file ? '' : readonly ? base().replace(/(\.[^.]*)?$/, '-copy$1') : base(), v => {
        if (!v) return note('Cancelled');
        const res = save(fs.norm(v, file ? fs.parent(file) : cwd));
        if (res !== true) return note(`Error writing ${v}: ${res}`);
        wrote(); then?.();
      });
      const saveNow = then => {
        if (!file || readonly) return writeOut(then);
        const res = save(file);
        if (res !== true) return note(`Error writing ${base()}: ${res}`);
        wrote(); then?.();
      };
      const exit = () => (dirty ? yesNo('Save modified buffer?', y => (y ? saveNow(close) : close())) : close());
      const cutLine = () => {
        const v = ta.value, [ls, le] = lineBounds(v, ta.selectionStart), end = Math.min(v.length, le + 1);
        if (ls === end) return;
        cut = v.slice(ls, end);
        ta.setRangeText('', ls, end, 'start'); changed();
      };
      const paste = () => {
        if (!cut) return note('Cutbuffer is empty');
        const [ls] = lineBounds(ta.value, ta.selectionStart);
        ta.setRangeText(cut.endsWith('\n') ? cut : cut + '\n', ls, ls, 'end'); changed();
      };
      const find = () => ask('Search: ', lastFind, v => {
        if (!v) return;
        lastFind = v;
        let i = ta.value.indexOf(v, ta.selectionEnd);
        if (i < 0) { i = ta.value.indexOf(v); if (i >= 0) note('Search Wrapped'); }
        if (i < 0) return note(`"${v}" not found`);
        ta.blur(); ta.setSelectionRange(i, i + v.length); ta.focus();
      });
      const actions = { s: () => saveNow(), o: () => writeOut(), x: exit, k: cutLine, u: paste, f: find };
      ta.addEventListener('keydown', e => {
        if (e.key === 'Tab') { e.preventDefault(); return insertTab(); }
        if (!e.ctrlKey || e.altKey || e.metaKey) return;
        const fn = actions[e.key.toLowerCase()];
        if (fn) { e.preventDefault(); fn(); }
      });
      ta.addEventListener('input', changed);
      $('.ed-keys', el).addEventListener('click', e => { const k = e.target.closest('[data-k]')?.dataset.k; if (k) actions[k](); });
      head();
      note(readonly ? `${base()} is read-only — ^O saves a copy` : isNew ? 'New File' : `Read ${lineCount(content)} lines`);
      return;
    }

    /* ---- vim ---- */
    let mode = 'normal', pending = '', reg = '', flash = '', lastFind = '';
    const undo = [];
    msg.innerHTML = '<span class="ed-left"></span><span class="ed-pos"></span>';
    const left = $('.ed-left', msg), posEl = $('.ed-pos', msg);
    const status = () => {
      el.classList.toggle('insert', mode === 'insert');
      const v = ta.value, p = ta.selectionStart;
      posEl.textContent = `${v.slice(0, p).split('\n').length},${p - v.lastIndexOf('\n', p - 1)}`;
      if (!left.querySelector('form')) left.innerHTML = flash || (mode === 'insert' ? '<b>-- INSERT --</b>' : pending ? esc(pending) : '');
    };
    const say = html => { flash = html; status(); };
    const fail = s => say(`<span class="ed-err">${esc(s)}</span>`);
    changed = () => { dirty = true; };
    const snap = () => { undo.push([ta.value, ta.selectionStart]); if (undo.length > 200) undo.shift(); };
    const set = i => ta.setSelectionRange(i, i);
    const insert = () => { mode = 'insert'; flash = ''; status(); };
    const edit = (text, from, to, sel = 'start') => { ta.setRangeText(text, from, to, sel); changed(); };
    const find = (needle, from) => {
      if (!needle) return fail('E35: No previous regular expression');
      let i = ta.value.indexOf(needle, from);
      if (i < 0) { i = ta.value.indexOf(needle); if (i >= 0) say('search hit BOTTOM, continuing at TOP'); }
      if (i < 0) return fail(`E486: Pattern not found: ${needle}`);
      ta.blur(); set(i); ta.focus();
    };
    const write = arg => {
      const target = arg ? fs.norm(arg, file ? fs.parent(file) : cwd) : file;
      if (!target) { fail('E32: No file name'); return false; }
      if (readonly && target === file) { fail(`E45: 'readonly' option is set — built-in file. Save a copy with :w newname`); return false; }
      const res = save(target);
      if (res !== true) { fail(`E212: Can't open file for writing: ${res}`); return false; }
      say(esc(`"${base()}" ${lineCount(ta.value)}L, ${bytes(ta.value)}B written`));
      return true;
    };
    const ex = c => {
      c = c.trim();
      if (!c) return status();
      if (/^\d+$/.test(c)) { const ls = ta.value.split('\n'); set(ls.slice(0, Math.max(0, Math.min(+c, ls.length) - 1)).join('\n').length + (+c > 1 ? 1 : 0)); ta.blur(); ta.focus(); return status(); }
      const m = c.match(/^([a-z]+)(!?)\s*(.*)$/i);
      const [, cmd, bang, arg] = m || [];
      if (cmd === 'w') write(arg);
      else if (cmd === 'q' || cmd === 'quit') dirty && !bang ? fail('E37: No write since last change (add ! to override)') : close();
      else if (cmd === 'wq' || cmd === 'x') { if ((cmd === 'x' && !dirty) || write(arg)) close(); }
      else if (cmd === 'h' || cmd === 'help') say(esc('i insert · Esc normal · :w save · :q quit · :wq save+quit · :q! discard · dd/yy/p lines · u undo · /text search'));
      else fail(`E492: Not an editor command: ${c}`);
    };
    const prompt = prefix => {
      flash = '';
      left.innerHTML = `<form class="ed-cmd"><span>${prefix}</span><input spellcheck="false" autocomplete="off" autocapitalize="off" aria-label="Command"></form>`;
      const f = $('form', left), inp = $('input', left);
      const end = () => { left.innerHTML = ''; ta.focus(); status(); };
      f.addEventListener('submit', e => {
        e.preventDefault(); const v = inp.value; end();
        if (prefix === ':') ex(v); else { lastFind = v || lastFind; find(lastFind, ta.selectionStart + 1); }
      });
      inp.addEventListener('keydown', e => { if (e.key === 'Escape' || (e.key === 'Backspace' && !inp.value)) { e.preventDefault(); e.stopPropagation(); end(); } });
      inp.focus();
    };
    const moveLine = d => {
      const v = ta.value, p = ta.selectionStart, [ls, le] = lineBounds(v, p), col = p - ls;
      if (d > 0 && le < v.length) { const [nls, nle] = lineBounds(v, le + 1); set(Math.min(nls + col, nle)); }
      if (d < 0 && ls > 0) { const [pls, ple] = lineBounds(v, ls - 1); set(Math.min(pls + col, ple)); }
    };
    const normal = k => {
      const v = ta.value, p = ta.selectionStart, [ls, le] = lineBounds(v, p);
      if (pending) {
        const c = pending + k; pending = '';
        if (c === 'dd') {
          reg = v.slice(ls, le) + '\n'; snap();
          if (le < v.length) edit('', ls, le + 1);
          else if (ls > 0) { edit('', ls - 1, le); set(lineBounds(ta.value, ls - 1)[0]); }
          else edit('', 0, le);
        } else if (c === 'yy') { reg = v.slice(ls, le) + '\n'; say('1 line yanked'); return; }
        else if (c === 'gg') set(0);
        return status();
      }
      switch (k) {
        case 'i': insert(); break;
        case 'a': set(Math.min(p + 1, le)); insert(); break;
        case 'A': set(le); insert(); break;
        case 'I': set(ls + (v.slice(ls, le).match(/^\s*/)[0].length)); insert(); break;
        case 'o': snap(); edit('\n', le, le, 'end'); insert(); return status();
        case 'O': snap(); edit('\n', ls, ls, 'start'); insert(); return status();
        case 'h': case 'Backspace': set(Math.max(ls, p - 1)); break;
        case 'l': case ' ': set(Math.min(le, p + 1)); break;
        case 'j': case 'Enter': moveLine(1); break;
        case 'k': moveLine(-1); break;
        case '0': case '^': set(ls); break;
        case '$': set(le); break;
        case 'w': { const m = v.slice(p).match(/^\S*\s+/); set(p + (m ? m[0].length : v.length - p)); break; }
        case 'b': { const m = v.slice(0, p).match(/\S+\s*$/); set(m ? p - m[0].length : 0); break; }
        case 'G': set(v.lastIndexOf('\n', v.length - 2) + 1); break;
        case 'x': case 'Delete': if (p < le) { snap(); edit('', p, p + 1); } break;
        case 'p':
          if (!reg) break;
          snap();
          if (le < v.length) { edit(reg, le + 1, le + 1); set(le + 1); } else { edit('\n' + reg.replace(/\n$/, ''), le, le); set(le + 1); }
          break;
        case 'P': if (reg) { snap(); edit(reg, ls, ls); set(ls); } break;
        case 'u': {
          const s = undo.pop();
          if (!s) { say('Already at oldest change'); return; }
          ta.value = s[0]; set(s[1]); changed(); say('1 change; before #' + (undo.length + 1)); return;
        }
        case 'n': find(lastFind, p + 1); return;
        case 'd': case 'y': case 'g': pending = k; break;
        case ':': case '/': prompt(k); return;
        case 'Escape': pending = ''; break;
      }
      status();
    };
    ta.addEventListener('keydown', e => {
      if (left.querySelector('form')) return;
      if (mode === 'insert') {
        if (e.key === 'Escape' || (e.ctrlKey && e.key === '[')) {
          e.preventDefault(); e.stopPropagation(); mode = 'normal';
          const p = ta.selectionStart;
          if (p > 0 && ta.value[p - 1] !== '\n') set(p - 1);
          status();
        } else if (e.key === 'Tab') { e.preventDefault(); insertTab(); }
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key.length === 1 || ['Escape', 'Backspace', 'Enter', 'Delete'].includes(e.key)) {
        e.preventDefault(); e.stopPropagation(); flash = ''; normal(e.key);
      }
    });
    // Touch keyboards often skip keydown: treat typed text as normal-mode commands too.
    ta.addEventListener('beforeinput', e => { if (mode === 'normal') { e.preventDefault(); if (e.data) [...e.data].forEach(normal); } });
    ta.addEventListener('input', () => { if (mode === 'insert') changed(); status(); });
    ['keyup', 'click', 'select'].forEach(ev => ta.addEventListener(ev, status));
    say(esc(isNew ? `"${base() || '[No Name]'}" [New]` : `"${base()}"${readonly ? ' [readonly]' : ''} ${lineCount(content)}L, ${bytes(content)}B`) + '  <span class="ed-dim">— press i to type, Esc then :wq to save and quit</span>');
  }

  apps.terminal = {
    title: 'Terminal', glyph: 'terminal', colors: ['#3a4152', '#151821'], w: 760, h: 480,
    mount(w) {
      w.body.innerHTML = `<div class="term"><div class="term-out" aria-live="polite"></div>
        <form class="term-line"><span class="term-prompt"></span><input class="term-in" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Terminal input"></form></div>`;
      const term = $('.term', w.body), out = $('.term-out', w.body), input = $('.term-in', w.body), promptEl = $('.term-prompt', w.body);
      const user = P.handle || 'guest';
      let cwd = '~', oldCwd = '~', hi = 0, sink = null, failed = false;
      const history = [];
      const promptHtml = () => `<span class="t-user">visitor@${esc(user)}</span>:<span class="t-path">${esc(cwd)}</span>$`;
      const screen = html => { const d = document.createElement('div'); d.innerHTML = html; out.append(d); };
      const print = html => (sink ? sink.push(html) : screen(html));        // stdout (captured inside pipes)
      const text = s => print(esc(s));
      const err = s => { failed = true; screen(`<span class="t-err">${esc(s)}</span>`); }; // stderr: always on screen
      const a = s => `<span class="t-accent">${esc(s)}</span>`;
      const link = u => (safeUrl(u) ? `<a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(u)}</a>` : esc(u));
      const refresh = () => { promptEl.innerHTML = promptHtml(); };
      const toBottom = () => { term.scrollTop = term.scrollHeight; };

      /* ---- helpers for commands ---- */
      const toText = parts => {
        const d = document.createElement('div'); d.innerHTML = parts.join('\n');
        $$('.t-cols', d).forEach(c => { c.textContent = [...c.children].map(x => x.textContent).join('\n'); });
        return d.textContent;
      };
      const lines = t => (t ? t.replace(/\n$/, '').split('\n') : []);
      const outLines = arr => { if (arr.length) text(arr.join('\n')); };
      const flags = args => {
        const f = new Set(), rest = []; let end = false;
        for (const x of args) {
          if (!end && x === '--') end = true;
          else if (!end && /^-[a-zA-Z]+$/.test(x)) [...x.slice(1)].forEach(c => f.add(c));
          else rest.push(x);
        }
        return [f, rest];
      };
      const count = args => {
        let n = 10; const rest = [];
        for (let i = 0; i < args.length; i++) {
          if (args[i] === '-n') n = parseInt(args[++i], 10);
          else if (/^-n?\d+$/.test(args[i])) n = parseInt(args[i].replace(/^-n?/, ''), 10);
          else rest.push(args[i]);
        }
        if (!(n >= 0)) throw new FsError('invalid number of lines');
        return [n, rest];
      };
      const readFile = p => {
        const r = fs.resolve(p, cwd);
        if (!r) throw new FsError(`${p}: No such file or directory`);
        if (r.node.type === 'dir') throw new FsError(`${p}: Is a directory`);
        const t = fs.read(r.node);
        if (t == null) throw new FsError(`${p}: binary file — try: open ${p}`);
        return t;
      };
      const source = (files, stdin) => {
        if (files.length) return files.map(readFile).join('');
        if (stdin != null) return stdin;
        throw new FsError('missing file operand (give a file, or pipe something in)');
      };
      const each = (items, cmd, fn) => {
        if (!items.length) return err(`${cmd}: missing operand`);
        for (const x of items) { try { fn(x); } catch (e) { if (e instanceof FsError) err(`${cmd}: ${e.message}`); else throw e; } }
      };
      const expand = t => {
        if (!t.g) return [t.w];
        const cut = t.w.lastIndexOf('/');
        const dirPart = cut >= 0 ? t.w.slice(0, cut + 1) : '', pat = t.w.slice(cut + 1);
        const r = !/[*?]/.test(dirPart) && fs.resolve(dirPart || '.', cwd);
        if (!r || r.node.type !== 'dir') return [t.w];
        const re = globRe(pat);
        const hits = fs.sorted(r.node).map(c => c.name).filter(n => re.test(n));
        return hits.length ? hits.map(n => dirPart + n) : [t.w];
      };
      const hl = (s, re) => {
        let html = '', last = 0, m;
        re.lastIndex = 0;
        while ((m = re.exec(s))) {
          if (!m[0].length) { re.lastIndex++; continue; }
          html += esc(s.slice(last, m.index)) + `<mark class="t-hit">${esc(m[0])}</mark>`;
          last = m.index + m[0].length;
        }
        return html + esc(s.slice(last));
      };
      const fmtSize = b => (b == null ? '-' : b < 1024 ? String(b) : b < 1048576 ? (b / 1024).toFixed(1) + 'K' : (b / 1048576).toFixed(1) + 'M');
      const fmtDate = t => { const d = new Date(t); return `${d.toLocaleString('en-US', { month: 'short' })} ${String(d.getDate()).padStart(2)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
      const perms = n => (n.type === 'dir' ? 'd' : n.kind === 'link' ? 'l' : '-') + (n.user ? 'rw-r--r--' : n.kind === 'app' ? 'r-xr-xr-x' : 'r--r--r--');
      const ownerW = Math.max(user.length, 7);
      const nameHtml = n => (n.type === 'dir' ? a(n.name + '/') : n.kind === 'app' ? `<span class="t-green">${esc(n.name)}</span>` : n.user ? `<span class="t-mine">${esc(n.name)}</span>` : esc(n.name));
      const long = n => `<span class="t-dim">${perms(n)}</span>  ${esc((n.user ? 'visitor' : user).padEnd(ownerW))}  ${fmtSize(fs.size(n)).padStart(6)}  <span class="t-dim">${fmtDate(fs.mtime(n))}</span>  ${nameHtml(n)}${n.kind === 'link' ? ` <span class="t-dim">-> ${esc(n.url)}</span>` : ''}`;
      const appIds = Object.keys(apps);
      const pid = id => 100 + appIds.indexOf(id);
      const fmtUp = () => { const s = Math.round(performance.now() / 1000); return s < 60 ? `${s} sec` : s < 3600 ? `${Math.floor(s / 60)} min` : `${Math.floor(s / 3600)}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}`; };

      const HELP = [
        ['Portfolio', [['about', 'Who I am'], ['skills', 'What I work with'], ['experience', 'Where I have worked'], ['projects', 'List my projects'],
          ['project <id>', 'Details for one project'], ['resume', 'Open my résumé'], ['contact', 'How to reach me'], ['social', 'My profiles']]],
        ['Files', [['ls [-la] [path]', 'List files (-l: details, -a: all)'], ['cd <dir>', 'Change folder (cd - goes back)'], ['pwd', 'Print current folder'],
          ['tree [path]', 'Show the folder tree'], ['cat <file…>', 'Print files'], ['touch <file>', 'Create an empty file'], ['mkdir [-p] <dir>', 'Create a folder'],
          ['rm [-rf] <path…>', 'Delete files you created'], ['rmdir <dir>', 'Delete an empty folder'], ['cp [-r] <src…> <dest>', 'Copy'], ['mv <src…> <dest>', 'Move or rename'],
          ['find [path] [-name pat] [-type f|d]', 'Search for files'], ['open <app|path>', 'Open an app, file or folder']]],
        ['Editors', [['nano <file>', 'Simple editor — ^S save, ^X exit'], ['vim <file>', 'Modal editor — i to type, Esc, :wq']]],
        ['Text', [['echo <text>', 'Print text'], ['grep [-invc] <pattern> [file…]', 'Find matching lines'], ['head / tail [-n N] [file]', 'First / last lines'],
          ['wc [-lwc] [file]', 'Count lines, words, bytes'], ['sort [-rnu] [file]', 'Sort lines'], ['uniq [-c] [file]', 'Drop repeated lines'], ['cowsay / fortune', 'The classics']]],
        ['System', [['apps', 'List applications'], ['ps', 'Running programs'], ['kill <pid|app>', 'Close a window'], ['uname [-a]', 'System name'], ['uptime', 'Time since boot'],
          ['neofetch', 'System summary'], ['wallpaper [name]', 'Change the wallpaper'], ['which <cmd>', 'Locate a command'], ['man <cmd>', 'Help for one command'],
          ['history', 'Command history'], ['date, whoami', 'The usual'], ['clear', 'Clear the screen'], ['factory-reset', 'Delete every file you created'], ['exit', 'Close the terminal']]]
      ];
      const tree = (node, prefix, depth) => node.children ? fs.sorted(node).map((c, i, arr) => {
        const last = i === arr.length - 1;
        const sub = c.type === 'dir' && depth > 1 ? tree(c, prefix + (last ? '    ' : '│   '), depth - 1) : '';
        return `${prefix}${last ? '└── ' : '├── '}${nameHtml(c)}\n${sub}`;
      }).join('') : '';
      const FORTUNES = [
        'There are only two hard things in computer science: cache invalidation, naming things, and off-by-one errors.',
        'It works on my machine. — Every developer, at least once',
        'Measure twice, cut once. (A CNC machinist\'s rule that also works for SQL migrations.)',
        'A pipeline is only as good as its worst data.',
        'Weeks of coding can save you hours of planning.',
        'Real programmers count from 0.',
        ...D.projects.map(p => `${p.name}: ${p.tagline}`)
      ];

      const cmds = {
        help: () => print(HELP.map(([g, items]) => `${a(g)}\n${items.map(([c, d]) => `  ${esc(c.padEnd(36))}<span class="t-dim">${esc(d)}</span>`).join('\n')}`).join('\n\n')
          + `\n\n<span class="t-dim">Pipes, redirects, && and wildcards work:</span>  ${a('ls | grep md')}   ${a('echo hi > note.txt')}   ${a('sort < note.txt')}   ${a('cat *.md | wc -l')}`
          + `\n<span class="t-dim">Files you create are saved in this browser. Tab completes, ↑/↓ recalls history.</span>`),
        man: ([c]) => {
          if (!c) return err('What manual page do you want? Try: man nano');
          const hit = HELP.flatMap(g => g[1]).find(([u]) => u.split(/\s*(?:,|\s\/)\s*/).some(x => x.trim().split(' ')[0] === c));
          if (!hit) return err(`No manual entry for ${c}`);
          print(`${a(c)} — ${esc(hit[1])}\n\n<span class="t-dim">Usage:</span> ${esc(hit[0])}`);
        },
        about: () => print(`${a(P.name)} — ${esc(P.role)}, ${esc(P.location)}\n\n${esc(P.tagline)}\n\n${P.bio.map(esc).join('\n\n')}`),
        whoami: () => print(`visitor <span class="t-dim">(viewing the portfolio of ${esc(P.name)})</span>`),
        skills: () => print(D.skills.map(g => `${a(g.group)}\n${g.items.map(s => (s.level ? `  ${esc(s.name.padEnd(24))}<span class="t-green">${'█'.repeat(Math.round(s.level / 10))}</span><span class="t-dim">${'░'.repeat(10 - Math.round(s.level / 10))}</span> ${+s.level}%` : `  • ${esc(s.name || s)}`)).join('\n')}`).join('\n\n')),
        experience: () => print(D.experience.map(e => `${a(e.role)} · ${esc(e.company)} <span class="t-dim">(${esc(e.period)})</span>\n  ${esc(e.summary)}`).join('\n\n')),
        projects: () => print(D.projects.map(p => `  ${a(p.id.padEnd(24))}${esc(p.tagline)}`).join('\n') + (sink ? '' : `\n\n<span class="t-dim">Try: project ${esc(D.projects[0]?.id || '')}  ·  open projects</span>`)),
        project: ([id]) => {
          const p = D.projects.find(x => x.id === id || x.name.toLowerCase() === String(id).toLowerCase());
          if (!p) return err(id ? `project: no such project: ${id}` : 'usage: project <id>');
          print(`${a(p.name)}${p.badge ? ` <span class="t-dim">(${esc(p.badge)})</span>` : ''}\n${esc(p.tagline)}\n\n${esc(p.description)}\n\n${p.highlights.map(x => `  • ${esc(x)}`).join('\n')}\n\nStack   ${esc(p.tech.join(', '))}${p.links?.source ? `\nSource  ${link(p.links.source)}` : ''}${p.links?.demo ? `\nDemo    ${link(p.links.demo)}` : ''}`);
        },
        contact: () => print(`Email     <a href="mailto:${esc(P.email)}">${esc(P.email)}</a>\nLocation  ${esc(P.location)}\n\n<span class="t-dim">Run</span> ${a('open contact')} <span class="t-dim">to send a message.</span>`),
        social: () => print(D.socials.map(s => `  ${a(s.name.padEnd(14))}${link(s.url)}`).join('\n')),
        resume: () => { openPath('~/Documents/resume.md'); text('Opening résumé…'); },

        /* ---- files ---- */
        pwd: () => text(cwd),
        ls: args => {
          const [f, rest] = flags(args);
          const targets = rest.length ? rest : ['.'];
          targets.forEach((t, i) => {
            const r = fs.resolve(t, cwd);
            if (!r) return err(`ls: cannot access '${t}': No such file or directory`);
            const isDir = r.node.type === 'dir', list = isDir ? fs.sorted(r.node) : [r.node];
            if (targets.length > 1 && isDir) print(`${i ? '\n' : ''}${a(t)}:`);
            if (f.has('l')) {
              const rows = list.map(long);
              if (f.has('a') && isDir) rows.unshift(long({ ...r.node, name: '.' }), long({ ...fs.resolve(fs.parent(r.path)).node, name: '..' }));
              print(`<span class="t-dim">total ${list.length}</span>` + (rows.length ? '\n' + rows.join('\n') : ''));
            } else {
              const names = list.map(nameHtml);
              if (f.has('a') && isDir) names.unshift(a('./'), a('../'));
              if (names.length) print(`<div class="t-cols">${names.map(n => `<span>${n}</span>`).join('')}</div>`);
            }
          });
        },
        cd: ([t = '~']) => {
          if (t === '-') { t = oldCwd; text(t); }
          const r = fs.resolve(t, cwd);
          if (!r) return err(`cd: ${t}: No such file or directory`);
          if (r.node.type !== 'dir') return err(`cd: ${t}: Not a directory`);
          oldCwd = cwd; cwd = r.path;
        },
        cat: (args, stdin) => {
          const [, files] = flags(args);
          if (!files.length) { if (stdin == null) return err('usage: cat <file…>'); if (stdin) text(stdin); return; }
          for (const f of files) {
            const r = fs.resolve(f, cwd);
            if (!r) { err(`cat: ${f}: No such file or directory`); continue; }
            if (r.node.type === 'dir') { err(`cat: ${f}: Is a directory`); continue; }
            const t = fs.read(r.node);
            if (t == null) print(`<span class="t-warn">${esc(r.node.name)} is ${/^[aeiou]/i.test(kindLabel(r.node)) ? 'an' : 'a'} ${esc(kindLabel(r.node).toLowerCase())} — try:</span> ${a('open ' + f)}`);
            else if (t) text(t.replace(/\n$/, ''));
          }
        },
        tree: ([t = '.']) => {
          const r = fs.resolve(t, cwd);
          if (!r) return err(`tree: ${t}: No such file or directory`);
          if (r.node.type !== 'dir') return err(`tree: ${t}: Not a directory`);
          print(`${a(r.path)}\n${tree(r.node, '', 3)}`.replace(/\n$/, ''));
        },
        touch: args => each(args, 'touch', f => fs.touch(f, cwd)),
        mkdir: args => { const [f, rest] = flags(args); each(rest, 'mkdir', d => fs.mkdir(d, cwd, f.has('p'))); },
        rm: args => {
          const [f, rest] = flags(args);
          if (!rest.length && f.has('f')) return;
          each(rest, 'rm', p => {
            try { fs.remove(p, cwd, { recursive: f.has('r') || f.has('R') }); }
            catch (e) { if (!(f.has('f') && /No such file/.test(e.message))) throw e; }
          });
        },
        rmdir: args => each(args, 'rmdir', d => fs.remove(d, cwd, { dirOnly: true })),
        mv: args => {
          const [, rest] = flags(args);
          if (rest.length < 2) return err(`mv: missing ${rest.length ? 'destination' : 'file'} operand`);
          const dest = rest.pop();
          each(rest, 'mv', s => fs.move(s, dest, cwd));
        },
        cp: args => {
          const [f, rest] = flags(args);
          if (rest.length < 2) return err(`cp: missing ${rest.length ? 'destination' : 'file'} operand`);
          const dest = rest.pop();
          each(rest, 'cp', s => fs.copy(s, dest, cwd, f.has('r') || f.has('R')));
        },
        find: args => {
          let start = '.', re = null, type = null;
          for (let i = 0; i < args.length; i++) {
            if (args[i] === '-name' || args[i] === '-iname') { if (args[i + 1] == null) return err(`find: missing argument to '${args[i]}'`); re = globRe(args[i + 1], args[i] === '-iname'); i++; }
            else if (args[i] === '-type') type = args[++i];
            else start = args[i];
          }
          const r = fs.resolve(start, cwd);
          if (!r) return err(`find: '${start}': No such file or directory`);
          const res = [];
          const walk = (n, p) => {
            if ((!re || re.test(n.name)) && (!type || (type === 'd') === (n.type === 'dir'))) res.push(p);
            if (n.type === 'dir') fs.sorted(n).forEach(c => walk(c, `${p}/${c.name}`));
          };
          walk(r.node, start.replace(/(.)\/$/, '$1'));
          outLines(res);
        },
        open: ([target]) => {
          if (!target) return err('usage: open <app|path>');
          const id = target.toLowerCase().replace(/\.app$/, '');
          if (Object.hasOwn(apps, id)) { WM.open(id); return text(`Opening ${apps[id].title}…`); }
          const r = fs.resolve(target, cwd);
          if (!r) return err(`open: ${target}: No such app, file or directory`);
          openPath(r.path); text(`Opening ${r.node.name}…`);
        },

        /* ---- editors ---- */
        nano: ([f]) => edit('nano', f),
        vim: ([f]) => edit('vim', f),

        /* ---- text ---- */
        echo: args => text(args.join(' ')),
        grep: (args, stdin) => {
          const [f, rest] = flags(args);
          const [pat, ...files] = rest;
          if (pat == null) return err('usage: grep [-invc] <pattern> [file…]');
          const fl = f.has('i') ? 'gi' : 'g';
          let re; try { re = new RegExp(pat, fl); } catch { re = new RegExp(pat.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), fl); }
          const srcs = files.length ? files.map(x => [x, readFile(x)]) : [[null, source([], stdin)]];
          let hits = 0; const res = [];
          for (const [name, t] of srcs) lines(t).forEach((ln, i) => {
            re.lastIndex = 0;
            if (re.test(ln) === f.has('v')) return;
            hits++;
            if (!f.has('c')) res.push(`${name && files.length > 1 ? `<span class="t-pink">${esc(name)}</span>:` : ''}${f.has('n') ? `<span class="t-green">${i + 1}</span>:` : ''}${f.has('v') ? esc(ln) : hl(ln, re)}`);
          });
          if (f.has('c')) text(String(hits)); else if (res.length) print(res.join('\n'));
          if (!hits) failed = true;
        },
        head: (args, stdin) => { const [n, files] = count(args); outLines(lines(source(files, stdin)).slice(0, n)); },
        tail: (args, stdin) => { const [n, files] = count(args); const ls = lines(source(files, stdin)); outLines(n ? ls.slice(-n) : []); },
        wc: (args, stdin) => {
          const [f, files] = flags(args);
          const t = source(files, stdin);
          const all = { l: (t.match(/\n/g) || []).length + (t && !t.endsWith('\n') ? 1 : 0), w: (t.match(/\S+/g) || []).length, c: bytes(t) };
          const keys = ['l', 'w', 'c'].filter(k => !f.size || f.has(k));
          text(keys.map(k => String(all[k]).padStart(keys.length > 1 ? 4 : 0)).join(' ') + (files.length === 1 ? ` ${files[0]}` : ''));
        },
        sort: (args, stdin) => {
          const [f, files] = flags(args);
          let ls = lines(source(files, stdin));
          ls.sort(f.has('n') ? (x, y) => (parseFloat(x) || 0) - (parseFloat(y) || 0) || x.localeCompare(y) : (x, y) => x.localeCompare(y));
          if (f.has('r')) ls.reverse();
          if (f.has('u')) ls = ls.filter((x, i) => ls.indexOf(x) === i);
          outLines(ls);
        },
        uniq: (args, stdin) => {
          const [f, files] = flags(args);
          const res = [];
          for (const l of lines(source(files, stdin))) { const top = res[res.length - 1]; if (top && top[0] === l) top[1]++; else res.push([l, 1]); }
          outLines(res.map(([l, c]) => (f.has('c') ? `${String(c).padStart(7)} ${l}` : l)));
        },
        cowsay: (args, stdin) => {
          const msg = (args.length ? args.join(' ') : stdin || 'Hire me!').replace(/\s+/g, ' ').trim();
          const rows = [];
          for (const word of msg.split(' ')) { const last = rows[rows.length - 1]; if (last != null && (last + ' ' + word).length <= 38) rows[rows.length - 1] += ' ' + word; else rows.push(word); }
          const wdt = Math.max(...rows.map(r => r.length));
          const body = rows.length === 1 ? [`< ${rows[0]} >`] : rows.map((r, i) => `${i === 0 ? '/' : i === rows.length - 1 ? '\\' : '|'} ${r.padEnd(wdt)} ${i === 0 ? '\\' : i === rows.length - 1 ? '/' : '|'}`);
          text([' ' + '_'.repeat(wdt + 2), ...body, ' ' + '-'.repeat(wdt + 2), '        \\   ^__^', '         \\  (oo)\\_______', '            (__)\\       )\\/\\', '                ||----w |', '                ||     ||'].join('\n'));
        },
        fortune: () => text(FORTUNES[Math.floor(Math.random() * FORTUNES.length)]),

        /* ---- system ---- */
        apps: () => print(appIds.map(id => `  ${a(id.padEnd(12))}${esc(apps[id].title)}`).join('\n')),
        ps: () => {
          const rows = [['1', 'init'], ['42', 'portfolio-sh'], ...[...WM.wins.keys()].map(id => [String(pid(id)), `${id}${WM.wins.get(id).minimized ? ' (minimized)' : ''}`])];
          print(`<span class="t-dim">  PID  CMD</span>\n${rows.map(([p, c]) => `${p.padStart(5)}  ${esc(c)}`).join('\n')}`);
        },
        kill: args => {
          const [, rest] = flags(args.filter(x => !/^-\d+$/.test(x)));
          each(rest, 'kill', t => {
            if (t === '1') throw new FsError('(1) - Operation not permitted');
            const id = t === '42' ? 'terminal' : /^\d+$/.test(t) ? appIds[+t - 100] : t.toLowerCase();
            if (!id || !WM.wins.has(id)) throw new FsError(`(${t}) - No such process`);
            WM.close(id);
            if (id !== 'terminal') text(`[1]+  Terminated              ${id}`);
          });
        },
        uname: ([o]) => text(o === '-a' ? `PortfolioOS portfolio 1.0.0 #1 SMP ${new Date(OS.BOOT_TIME).toDateString()} browser JavaScript` : 'PortfolioOS'),
        uptime: () => text(` ${new Date().toTimeString().slice(0, 8)} up ${fmtUp()},  1 user,  ${WM.wins.size} window${WM.wins.size === 1 ? '' : 's'} open`),
        which: args => each(args, 'which', c => { if (!Object.hasOwn(cmds, c)) throw new FsError(`no ${c} in (/bin)`); text('/bin/' + c); }),
        wallpaper: ([name]) => {
          if (!name) { OS.nextWallpaper(); return print(`<span class="t-dim">Options: ${esc(OS.wallpapers.join(', '))}</span>`); }
          OS.setWallpaper(name) ? print(`Wallpaper set to ${a(name)}.`) : err(`wallpaper: unknown "${name}". Options: ${OS.wallpapers.join(', ')}`);
        },
        neofetch: () => {
          const art = ['  ┌──────────┐', '  │ ❯ _      │', '  │          │', '  └──────────┘', '    ▔▔▔▔▔▔▔▔  '];
          const info = [`${a(user)}@${a('portfolio')}`, '─────────────────', `${a('OS')}        ${esc(D.osName)}`, `${a('Owner')}     ${esc(P.name)}`, `${a('Role')}      ${esc(P.role)}`,
            `${a('Location')}  ${esc(P.location)}`, `${a('Projects')}  ${D.projects.length}`, `${a('Shell')}     portfolio-sh (${Object.keys(cmds).length} commands)`, `${a('Uptime')}    ${fmtUp()}`];
          print(info.map((l, i) => `<span class="t-pink">${art[i] || ' '.repeat(14)}</span>  ${l}`).join('\n'));
        },
        history: () => print(history.map((c, i) => `<span class="t-dim">${String(i + 1).padStart(4)}</span>  ${esc(c)}`).join('\n')),
        date: () => text(new Date().toString()),
        clear: () => { out.innerHTML = ''; },
        'factory-reset': () => { fs.reset(); cwd = oldCwd = '~'; text('All files you created have been deleted.'); },
        exit: () => WM.close('terminal'),
        sudo: args => (args.join(' ') === 'hire-me'
          ? (WM.open('contact'), print('<span class="t-green">Permission granted.</span> Opening Contact…'))
          : print(`<span class="t-warn">visitor is not in the sudoers file. This incident will be reported.</span> <span class="t-dim">(but</span> ${a('sudo hire-me')} <span class="t-dim">works)</span>`))
      };
      Object.assign(cmds, { ll: a2 => cmds.ls(['-l', ...a2]), vi: cmds.vim, less: cmds.cat, more: cmds.cat, '?': cmds.help });

      const edit = (kind, f) => {
        if (sink) return err(`${kind}: output is not a terminal`);
        openEditor(w, { kind, path: f, cwd, onExit: () => { refresh(); toBottom(); input.focus({ preventScroll: true }); } });
      };

      /* ---- running command lines ---- */
      const runOne = (toks, stdin) => {
        const [name, ...args] = toks.flatMap(expand);
        const key = name.toLowerCase();
        if (!Object.hasOwn(cmds, key)) return err(`${name}: command not found — type "help" for a list`);
        try { cmds[key](args, stdin); }
        catch (e) {
          if (e instanceof FsError) err(`${name}: ${e.message}`);
          else { console.error(e); err(`${name}: something went wrong`); }
        }
      };
      const exec = line => {
        let list;
        try { list = parse(lex(line)); } catch (e) { return err(`sh: ${e.message}`); }
        let ok = true;
        for (const c of list) {
          if (c.cond === '&&' && !ok) continue;
          failed = false;
          let stdin = null;
          if (c.from) {
            try { stdin = readFile(c.from); } catch (e) { if (!(e instanceof FsError)) throw e; err(`sh: ${e.message}`); ok = false; continue; }
          }
          c.stages.forEach((stage, i) => {
            const capture = i < c.stages.length - 1 || !!c.redir;
            sink = capture ? [] : null;
            try { runOne(stage, stdin); } finally { stdin = capture ? toText(sink) : null; sink = null; }
          });
          if (c.redir) {
            try { fs.write(c.redir.file, stdin && !stdin.endsWith('\n') ? stdin + '\n' : stdin, cwd, c.redir.append); }
            catch (e) { if (!(e instanceof FsError)) throw e; err(`sh: ${e.message}`); }
          }
          ok = !failed;
        }
      };
      const run = line => {
        screen(`${promptHtml()} ${esc(line)}`);
        if (!line.trim()) return;
        history.push(line.trim()); hi = history.length;
        exec(line);
      };
      const complete = () => {
        const val = input.value;
        const m = val.match(/^(.*(?:\||;|&&|>)\s*)?([^]*)$/);
        const head = m[1] || '', parts = m[2].split(/\s+/), lastTok = parts[parts.length - 1];
        const isCmd = parts.length === 1 && !/>\s*$/.test(head);
        let pool, base = '';
        if (isCmd) pool = Object.keys(cmds).filter(c => c.length > 1);
        else {
          const cut = lastTok.lastIndexOf('/');
          base = cut >= 0 ? lastTok.slice(0, cut + 1) : '';
          const r = fs.resolve(base || '.', cwd);
          pool = r?.node.type === 'dir' ? r.node.children.map(c => c.name + (c.type === 'dir' ? '/' : '')) : [];
          if (parts[0] === 'open' && parts.length === 2 && !base) pool = pool.concat(appIds);
          if (parts[0] === 'project') pool = D.projects.map(p => p.id);
          if (parts[0] === 'wallpaper') pool = OS.wallpapers;
          if (['man', 'which'].includes(parts[0])) pool = Object.keys(cmds);
        }
        const frag = lastTok.slice(base.length).toLowerCase();
        const hits = pool.filter(c => c.toLowerCase().startsWith(frag));
        if (!hits.length) return;
        if (hits.length === 1) parts[parts.length - 1] = base + hits[0] + (isCmd || !hits[0].endsWith('/') ? ' ' : '');
        else {
          let pre = hits[0];
          for (const x of hits) while (!x.toLowerCase().startsWith(pre.toLowerCase())) pre = pre.slice(0, -1);
          if (pre.length > frag.length) parts[parts.length - 1] = base + pre;
          else { screen(`${promptHtml()} ${esc(val)}`); screen(`<div class="t-cols">${hits.map(x => `<span>${esc(x)}</span>`).join('')}</div>`); }
        }
        input.value = head + parts.join(' ');
      };

      $('.term-line', w.body).addEventListener('submit', e => {
        e.preventDefault();
        const v = input.value; input.value = '';
        run(v); refresh(); toBottom();
      });
      input.addEventListener('keydown', e => {
        if (e.key === 'ArrowUp') { e.preventDefault(); if (hi > 0) input.value = history[--hi]; }
        else if (e.key === 'ArrowDown') { e.preventDefault(); input.value = hi < history.length - 1 ? history[++hi] : (hi = history.length, ''); }
        else if (e.key === 'Tab') { e.preventDefault(); complete(); toBottom(); }
        else if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); cmds.clear(); }
        else if (e.key === 'c' && e.ctrlKey && !String(getSelection())) { e.preventDefault(); screen(`${promptHtml()} ${esc(input.value)}^C`); input.value = ''; toBottom(); }
      });
      term.addEventListener('click', () => { if (!String(getSelection())) input.focus({ preventScroll: true }); });

      print(`<span class="t-accent">${esc(D.osName)}</span> — welcome to ${esc(P.name)}'s portfolio.\nType ${a('help')} to see what you can do, or try ${a('projects')}, ${a('ls -l')} and ${a('neofetch')}.\nYou can make your own files too: ${a('touch hello.txt')}, ${a('nano hello.txt')}, ${a('vim hello.txt')}.\n`);
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

  /* ================= Notes (document viewer + editor for your own files) ================= */
  apps.notes = {
    title: 'Notes', glyph: 'text', colors: ['#64748b', '#334155'], w: 680, h: 560,
    mount(w, args) {
      let path = '~/README.md', editing = false;
      const show = () => {
        const r = fs.resolve(path);
        if (!r || r.node.kind !== 'text') { w.setTitle('Notes'); w.body.innerHTML = '<div class="empty">This document could not be opened. It may have been moved or deleted.</div>'; return; }
        path = r.path;
        const n = r.node, mine = fs.writable(n);
        w.setTitle(`Notes — ${n.name}`);
        if (editing && mine) {
          w.body.innerHTML = `<div class="note-edit"><div class="note-bar"><span class="muted">Editing ${esc(n.name)}</span><span class="grow"></span>
            <button class="btn" data-a="cancel">Cancel</button><button class="btn primary" data-a="save">Save</button></div>
            <textarea class="note-text" spellcheck="false" aria-label="File contents"></textarea></div>`;
          const ta = $('.note-text', w.body);
          ta.value = n.content;
          ta.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); save(); } });
          ta.focus();
          return;
        }
        editing = false;
        w.body.innerHTML = `${mine ? `<div class="note-bar"><span class="muted">Your file · saved in this browser</span><span class="grow"></span><button class="btn" data-a="edit">Edit</button></div>` : ''}
          <article class="doc">${n.content.trim() ? (/\.md$/i.test(n.name) ? md(n.content) : `<pre>${esc(n.content)}</pre>`) : '<p class="muted">This file is empty.</p>'}</article>`;
      };
      const save = () => {
        try { fs.write(path, $('.note-text', w.body).value); editing = false; show(); toast('Saved'); }
        catch (e) { toast(e.message); }
      };
      w.body.addEventListener('click', e => {
        const act = e.target.closest('[data-a]')?.dataset.a;
        if (act === 'edit') { editing = true; show(); }
        else if (act === 'cancel') { editing = false; show(); }
        else if (act === 'save') save();
      });
      const onChange = () => { if (!w.el.isConnected) document.removeEventListener('fs:change', onChange); else if (!editing) show(); };
      document.addEventListener('fs:change', onChange);
      w.onArgs = a => { path = a?.path || '~/README.md'; editing = !!a?.edit; show(); w.body.scrollTop = 0; };
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
