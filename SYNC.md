# SYNC — keeping GitHub and Pages CMS in step

There is **no separate CMS database.** Pages CMS commits straight to this GitHub repo, so **GitHub is the single source of truth.** "Syncing" just means never overwriting a file with a stale copy. Follow the two lanes below and they can never clobber each other.

## Two lanes — never cross them

| Lane | Files | Who edits | How |
|---|---|---|---|
| **CONTENT** (changes often) | `content.json`, `events.json`, `menu.json`, `faq.json`, `shop.json` | You | **CMS only** — do NOT hand-upload these |
| **CODE** (changes rarely) | `*.html`, `cc-content.js`, `.pages.yml`, `img/*` | Claude | Claude sends a small zip; you upload those files |

As long as the data (`.json`) is edited only in the CMS and Claude only ships code, edits never collide.

## Rule of thumb
- **Text / events / menu / FAQ / shop / photos swap** → do it in the **CMS**.
- **Layout / new feature / design change** → ask **Claude**, upload the files Claude gives you.

## When Claude must touch a data file (e.g. add a new field)
Claude will FIRST pull your live file from the published site so your latest CMS edits are baked in, then hand it back. The live files are public here:
- https://manoftheworldmedia.github.io/caspiancoast/content.json
- https://manoftheworldmedia.github.io/caspiancoast/events.json
- https://manoftheworldmedia.github.io/caspiancoast/menu.json
- https://manoftheworldmedia.github.io/caspiancoast/faq.json
- https://manoftheworldmedia.github.io/caspiancoast/shop.json

So before asking Claude for a change that involves content, just say: **"pull my live data first."**

## If something ever looks reverted
1. Open the file's URL above — that's what's actually live.
2. In GitHub, check the repo's **commit history** to see the last edit and who made it.
3. You can **revert** any commit from GitHub's history — nothing is ever lost.

## One-time note
`content.json` was just reconciled to match your live site (your CMS hours edit was preserved). From here, edit hours/text/images in the CMS and you're always in sync.
