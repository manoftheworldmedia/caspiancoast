# SYNC — keeping GitHub and Pages CMS in step

There is **no separate CMS database.** The MOW portal commits straight to this GitHub repo, so **GitHub is the single source of truth.** As of the `cms-single-source` change, the portal schemas edit the **live root data files the site actually serves** — so a portal save goes straight live. **There is no cross-lane manual sync anymore.**

## What the portal edits (live files — edited ONLY in the portal)

| Portal section | Live file it writes | Pages it drives |
|---|---|---|
| **Homepage & About** | `content.json` | `/`, `/fa/`, `/about/`, `/about/fa/` (via `cc-content.js`) |
| **Menu** | `menu.json` | `/menu/`, `/menu/fa/` |
| **Shop** | `shop.json` | `/shop/`, `/shop/fa/` |
| **Events** | `events.json` | homepage events grid (`/`, `/fa/`) |
| **Homepage FAQ** | `content/home.json` (`faqs` list) | homepage FAQ (`/`, `/fa/`); `faq.json` is only a static fallback |
| **News & Articles** | `content/articles/*.json` + `content/articles.index.json` | `/news/` |

Bilingual fields are stored as adjacent `_fa`-suffixed keys (e.g. `title` + `title_fa`); image objects keep their `{src, alt, alt_fa}` shape. Do **not** hand-upload any of these files.

## Two lanes — never cross them

| Lane | Files | Who edits | How |
|---|---|---|---|
| **CONTENT** (changes often) | `content.json`, `menu.json`, `shop.json`, `events.json`, `content/home.json`, `content/articles/*` | You | **Portal only** — do NOT hand-upload these |
| **CODE** (changes rarely) | `*.html`, `*.js` (`cc-content.js`), `img/*`, `.mowcms/*` | Claude | Claude sends files; you upload them |

As long as data is edited only in the portal and Claude only ships code, edits never collide. Because the portal now writes the live files directly, there is **no "pull live data first" step** — the repo already is the live data.

## Rule of thumb
- **Text / events / menu / FAQ / shop / photos swap** → do it in the **portal** (it edits the live file directly).
- **Layout / new feature / design change** → ask **Claude**, upload the files Claude gives you.

## If something ever looks reverted
1. Open the file in GitHub (e.g. `content.json`, `menu.json`, `shop.json`, `events.json`) — that's what's live.
2. Check the repo's **commit history** to see the last edit and who made it.
3. You can **revert** any commit from GitHub's history — nothing is ever lost.
