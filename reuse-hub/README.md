# ReUse Hub – Give Old Items a Second Life
*Save Money, Reuse More, Waste Less.*

A static website (HTML, CSS, vanilla JavaScript, LocalStorage). No build step, no npm, no API keys.

## Deploy on GitHub Pages
1. **Extract the ZIP.** You get a `reuse-hub` folder with `index.html` inside.
2. **Create a repository** at github.com → New repository (e.g. `reuse-hub`), Public.
3. **Upload the files:** "uploading an existing file" → drag the *contents* of the folder (`index.html`, `css`, `js`, `assets`, `README.md`) → Commit.
4. Open the repository **Settings → Pages**.
5. Under *Build and deployment*, choose **Deploy from a branch**, branch **main**, folder **/ (root)** → Save.
6. Wait 1–2 minutes. Your site is at `https://YOUR-USERNAME.github.io/reuse-hub/`.

To test locally just double-click `index.html`.

## Local-only vs. needs a backend
**Works locally (this version):** browsing, search, filters, posting/editing/deleting your own listings, marking sold/reserved/collected, exchange requests and their statuses, repair requests, image upload (max 500 KB, stored in your browser), reset demo data.

**Needs a shared backend (e.g. Firebase/Supabase):** listings visible to other people, real exchange requests between users, login/accounts, secure contact sharing, real repair bookings. LocalStorage is per-browser and per-device. "Simulate" buttons in My Activity only demonstrate the other side of an exchange.

All sample listings are labelled **DEMO DATA**; sample repair services are not real or verified businesses. Impact counts come only from your recorded activity; no carbon/waste savings are claimed.

## Files
`js/storage.js` holds all data access (swap it for a database later); `js/app.js` holds the UI.
