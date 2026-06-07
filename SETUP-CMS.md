# Setting up the CMS (Pages CMS) — Caspian Coast Coffee

You can edit events (and upload photos) from a friendly dashboard that saves straight to your GitHub repo. No coding, no Webflow, no monthly platform.

## One-time setup (about 5 minutes)

1. Make sure these files are in your GitHub repo:
   - `index.html`, `events.json`, the `img/` folder
   - `.pages.yml` (the CMS config — already included)

2. Go to **https://app.pagescms.org** and click **Sign in with GitHub**.

3. Authorize Pages CMS for **your repository** only (you can limit it to just the `caspiancoast` repo).

4. Pick the repo and branch (usually `main`). Pages CMS reads `.pages.yml` and shows an **"Events & Calendar"** collection.

That's it — you're in.

## Editing events

- **Featured Event** — the big card at the top. Change the title, date, time, location, photo, and the labels shown on the card. Use 24-hour times (e.g. `10:00`, `13:00`).
- **Recurring Events** — the row of smaller cards. Add/remove/reorder them. Set `recurDay` to the weekday number:
  `0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday, 6 = Saturday`
- **Photos** — drag a new image into the Photo field; it uploads to the `img/` folder automatically.
- Click **Save** → Pages CMS commits to GitHub → your live site updates in ~1 minute.

## Tips

- The **Farsi** fields (Title (Farsi), etc.) power the فارسی toggle. If you leave one blank it just shows blank in Farsi, so fill both.
- `Add to Calendar` uses the **date + start/end time + full address** — keep those accurate so the calendar invite is correct.
- Give each event a unique **ID** (lowercase, dashes, no spaces) — e.g. `summer-market-2026`.

## Want the Menu & FAQ editable too?
Right now only Events is wired to the CMS. The Menu and FAQ can be moved to data files the same way — just ask and it can be added to `.pages.yml`.
