# PowerNap — band site

Static site, no build step. Open `index.html` or serve the folder.

- `index.html` — home (logo) + upcoming shows, full-viewport snap sections
- `games.html` — placeholder for browser games
- `js/config.js` — **put your Google Calendar ID + API key here** (instructions inside)
- `js/calendar.js` — fetches Google Calendar events and renders them in our own markup
- `js/retro.js` — hit counter, camcorder date stamp, footer year
- `js/snap.js` — glides to the nearest panel if a scroll settles in between; animates nav-link scrolling
- `js/nav.js` — highlights the active nav tab while scrolling
- `css/style.css` — all styling; colors/spacing are CSS variables at the top

Local dev: `python3 -m http.server 8080` in this folder, then http://localhost:8080
