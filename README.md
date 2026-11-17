# Portfolio OS

A personal portfolio that behaves like a desktop operating system. Plain HTML, CSS and JavaScript — no build step, no dependencies.

## Run it

Open `index.html` in a browser, or serve the folder:

```sh
python -m http.server 8000   # then visit http://localhost:8000
```

## Make it yours

All content lives in **`js/data.js`** — name, bio, skills, experience, projects, social links. The apps, the file system and the terminal output are all generated from it.

- **Avatar:** set `profile.avatar` to an image path (otherwise initials are shown).
- **Screenshots:** add `src: "assets/shot.png"` to a screenshot entry (otherwise a mock-up is generated).
- **Videos:** run `./add-video.sh <project-id> <video-file>` (see below). Until a project has a video, an animated placeholder plays.
- **Contact:** the form opens the visitor's email app via `mailto:`. To send from the page instead, point the submit handler in `js/apps.js` (`apps.contact`) at a form backend.

## Structure

```
index.html      shell markup
css/style.css   all styling (design tokens at the top)
js/data.js      your content
js/os.js        window manager, dock, desktop, virtual file system
js/apps.js      the apps (About, Projects, Files, Terminal, Browser, Media Player, Contact, Notes, Preview)
```

## Terminal & files

Visitors get a small but real shell: `ls -l`, `cd`, `cat`, `touch`, `mkdir`, `rm`, `cp`, `mv`, `find`, `grep`, `head`, `tail`, `wc`, `sort`, `uniq`, `ps`, `kill`, `cowsay` and more (`help` lists them). Pipes (`|`), redirects (`>`, `>>`, `<`), `&&`, `;` and `*` wildcards work, and `nano` and `vim` open a full-window editor.

The built-in files (generated from `data.js`) are read-only. Files that visitors create are stored in *their own* browser (localStorage). Nobody else sees them, and they never reach you. Visitors can also create, rename, duplicate and delete files in the Files app (right-click or `+`) and edit their own text files in Notes. `factory-reset` (or the system menu's *Delete my files…*) clears them.

## Demo videos

```sh
./add-video.sh                                         # list project ids and which have a video
./add-video.sh shift-pay-calculator ~/Videos/demo.mkv  # add or replace a project's demo
./add-video.sh showreel ~/Videos/overview.mp4          # the "Project overview" video
./add-video.sh --remove shift-pay-calculator           # back to the placeholder
```

The script converts any recording (mp4, mkv, webm, mov…) to a web-friendly MP4, saves it as `assets/videos/<id>.mp4`, then commits and pushes it, so the live site updates in a minute or two. Keep each demo under ~95 MB after conversion (a few minutes of screen recording is fine).

## Deploy

The site is hosted on GitHub Pages from the `main` branch. After editing anything (e.g. `js/data.js`):

```sh
git add -A && git commit -m "Update portfolio" && git push
```
