# Setting up the CMS (Pages CMS) — Caspian Coast Coffee

Edit Events, Menu, and FAQ from a friendly dashboard that saves straight to your GitHub repo. No coding, no Webflow, no monthly platform.

## One-time setup (~5 minutes)

1. Push these files to your GitHub repo (they're in the zip):
   - `index.html`, `Menu.html`, `about.html`, the `img/` folder
   - `events.json`, `menu.json`, `faq.json`  ← your editable content
   - `.pages.yml`  ← the CMS config

2. Go to **https://app.pagescms.org** → **Sign in with GitHub**.

3. Authorize Pages CMS for the **caspiancoast** repo, pick branch **main**.

4. Pages CMS reads `.pages.yml` and shows three collections: **Events & Calendar**, **Menu**, and **FAQ**.

> If the "Configuration" screen looks empty, it means `.pages.yml` isn't in the repo yet — push it (step 1), or paste its contents into that box and click **Save**.

## What you can edit

**Events & Calendar**
- The big **Featured Event** (title, date, time, location, photo, labels).
- The **Recurring Events** row — add/remove/reorder. Set `recurDay`: `0=Sun 1=Mon 2=Tue 3=Wed 4=Thu 5=Fri 6=Sat`. Use 24-hour times (e.g. `19:00`).
- On the site, visitors can **Add to Calendar** (Google / Apple / Outlook) per event, or **Add all to calendar** at once.

**Menu**
- The Menu page shows your menu **images** (boards). Swap an image, add a third board, or reorder — drag a new photo into the Image field.

**FAQ**
- Edit questions & answers. The page accordion **and** the Google FAQ search schema both update from this one file — great for SEO/AEO.
- Fill both English and Farsi fields so the فارسی toggle stays complete.

Click **Save** in Pages CMS → it commits to GitHub → your live site updates in ~1 minute.

## Notes
- The site reads these `.json` files over the web, so everything works on **GitHub Pages**. (If you ever open `index.html` by double-clicking it locally, the JSON won't load — that's expected; view it through your GitHub Pages URL.)
- `.md` files (like this one) may try to open in Xcode on a Mac — harmless; it's just a text file. Open with TextEdit or read it on GitHub.
