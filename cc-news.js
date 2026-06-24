/* ============================================================
   cc-news.js — Caspian Coast Coffee "News" loader
   Shared by /news/, /news/fa/, /news/article.html and /news/fa/article.html.

   Data contract:
     content/articles.index.json        -> ["slug-a","slug-b", ...] newest-first (may be [])
     content/articles/<slug>.json       -> {
        date, category, cover, featured,
        en:{title,excerpt,body}, fa:{title,excerpt,body}
     }
   Paths in cover (e.g. "img/foo.jpg") are relative to the SITE ROOT.
   These pages are not at the site root, so we resolve everything
   relative to root regardless of page depth.
   ============================================================ */
(function () {
  'use strict';

  /* ---------- language ---------- */
  // Prefer an explicit data-lang on <html>/<body>; fall back to the /fa/ path.
  function detectLang() {
    var el = document.documentElement.getAttribute('data-lang') ||
             (document.body && document.body.getAttribute('data-lang'));
    if (el === 'fa' || el === 'en') return el;
    return /\/fa(\/|$)/.test(location.pathname) ? 'fa' : 'en';
  }
  var LANG = detectLang();
  var IS_FA = LANG === 'fa';

  /* ---------- path resolution (relative to site ROOT) ---------- */
  // Work out how many directory levels deep we are from the site root so we
  // can build a correct "../" prefix to reach content/ and img/ at the root.
  // /news/index.html            -> path "/news/"            -> depth 1 -> "../"
  // /news/fa/index.html         -> path "/news/fa/"         -> depth 2 -> "../../"
  // /news/article.html          -> path "/news/article.html"-> depth 1 -> "../"
  function rootPrefix() {
    var p = location.pathname;
    // strip a trailing file name (anything with a dot after the last slash)
    var dir = p.replace(/[^/]*$/, '');           // keep up to last "/"
    var segs = dir.split('/').filter(Boolean);   // non-empty path segments
    var depth = segs.length;                     // number of dirs below root
    if (depth <= 0) return './';
    return new Array(depth + 1).join('../');
  }
  var ROOT = rootPrefix();

  // Resolve a site-root-relative asset path (cover image etc.).
  function rootAsset(path) {
    if (!path) return '';
    if (/^(https?:)?\/\//.test(path) || path.charAt(0) === '/') return path; // absolute
    return ROOT + path.replace(/^\.?\//, '');
  }
  function contentUrl(path) { return ROOT + path.replace(/^\.?\//, ''); }

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  var MONTHS_EN = ['January','February','March','April','May','June','July',
                   'August','September','October','November','December'];

  // Format "YYYY-MM-DD" nicely. EN -> "June 24, 2026". FA -> a safe localized
  // numeric-ish form ("24 June 2026") to avoid risky calendar conversions.
  function formatDate(iso) {
    if (!iso) return '';
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso).trim());
    if (!m) return esc(iso);
    var y = +m[1], mo = +m[2] - 1, d = +m[3];
    if (mo < 0 || mo > 11) return esc(iso);
    if (IS_FA) {
      // Keep it simple & safe: day, English month name, year.
      return d + ' ' + MONTHS_EN[mo] + ' ' + y;
    }
    return MONTHS_EN[mo] + ' ' + d + ', ' + y;
  }

  // Pick a language block with EN fallback for missing fields.
  function pickField(post, key) {
    var fa = post.fa || {}, en = post.en || {};
    if (IS_FA) {
      if (fa[key] != null && fa[key] !== '') return fa[key];
      return en[key] != null ? en[key] : '';
    }
    return en[key] != null && en[key] !== '' ? en[key] : (fa[key] != null ? fa[key] : '');
  }

  // Localized category label.
  function categoryLabel(cat) {
    if (!IS_FA) return cat || '';
    var map = { 'Article': 'مقاله', 'Blog': 'وبلاگ', 'News': 'اخبار' };
    return map[cat] || cat || '';
  }

  // Language-aware article reader URL (relative to current page directory).
  function readerUrl(slug) {
    return 'article.html?slug=' + encodeURIComponent(slug);
  }
  // Language-aware "back to index" URL (relative to current page directory).
  function indexUrl() { return './'; }

  var STR = {
    empty:    IS_FA ? 'هنوز مطلبی منتشر نشده — به‌زودی برگردید.' : 'No posts yet — check back soon.',
    back:     IS_FA ? '→ بازگشت به اخبار' : '← Back to News',
    notFound: IS_FA ? 'این مطلب پیدا نشد.' : 'We couldn’t find that article.',
    loadErr:  IS_FA ? 'بارگذاری مطالب ممکن نشد — لطفاً بعداً دوباره امتحان کنید.'
                    : 'We couldn’t load the news right now — please try again later.'
  };

  function setDir(el) { if (el && IS_FA) el.setAttribute('dir', 'rtl'); }

  /* ---------- fetch ---------- */
  function fetchJson(url) {
    return fetch(url, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status + ' for ' + url);
      return r.json();
    });
  }

  /* ===================== INDEX PAGE ===================== */
  function renderIndex(mount) {
    fetchJson(contentUrl('content/articles.index.json'))
      .then(function (slugs) {
        if (!Array.isArray(slugs) || slugs.length === 0) {
          showEmpty(mount);
          return;
        }
        // Fetch each post; keep order; tolerate individual failures.
        var jobs = slugs.map(function (slug) {
          return fetchJson(contentUrl('content/articles/' + slug + '.json'))
            .then(function (p) { p.slug = slug; return p; })
            .catch(function () { return null; });
        });
        return Promise.all(jobs).then(function (posts) {
          posts = posts.filter(Boolean);
          if (!posts.length) { showEmpty(mount); return; }
          buildGrid(mount, posts);
        });
      })
      .catch(function () { showEmpty(mount, STR.loadErr); });
  }

  function showEmpty(mount, msg) {
    mount.innerHTML = '';
    var box = document.createElement('div');
    box.className = 'news-empty';
    setDir(box);
    box.innerHTML =
      '<svg class="ne-mark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">' +
        '<path d="M4 5h16v14H4z"/><path d="M8 9h8M8 13h8M8 17h5"/></svg>' +
      '<p class="ne-text">' + esc(msg || STR.empty) + '</p>';
    mount.appendChild(box);
  }

  function buildGrid(mount, posts) {
    mount.innerHTML = '';
    var grid = document.createElement('div');
    grid.className = 'news-grid';
    posts.forEach(function (p) {
      var title = pickField(p, 'title');
      var excerpt = pickField(p, 'excerpt');
      var card = document.createElement('a');
      card.className = 'news-card' + (p.featured ? ' featured' : '');
      card.href = readerUrl(p.slug);
      setDir(card);
      var cover = rootAsset(p.cover);
      var media = cover
        ? '<div class="nc-media"><img src="' + esc(cover) + '" alt="' + esc(title) + '" loading="lazy" /></div>'
        : '<div class="nc-media nc-media--blank"></div>';
      card.innerHTML =
        media +
        '<div class="nc-body">' +
          '<div class="nc-meta">' +
            (p.category ? '<span class="nc-chip">' + esc(categoryLabel(p.category)) + '</span>' : '') +
            (p.date ? '<span class="nc-date">' + esc(formatDate(p.date)) + '</span>' : '') +
          '</div>' +
          '<h3 class="nc-title">' + esc(title) + '</h3>' +
          (excerpt ? '<p class="nc-excerpt">' + esc(excerpt) + '</p>' : '') +
        '</div>';
      grid.appendChild(card);
    });
    mount.appendChild(grid);
  }

  /* ===================== ARTICLE PAGE ===================== */
  function getSlug() {
    var m = /[?&]slug=([^&]+)/.exec(location.search);
    return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : '';
  }

  function renderArticle(mount) {
    var slug = getSlug();
    if (!slug) { showNotFound(mount); return; }
    fetchJson(contentUrl('content/articles/' + slug + '.json'))
      .then(function (p) { buildArticle(mount, p); })
      .catch(function () { showNotFound(mount); });
  }

  function showNotFound(mount) {
    mount.innerHTML = '';
    var box = document.createElement('div');
    box.className = 'news-empty article-missing';
    setDir(box);
    box.innerHTML =
      '<p class="ne-text">' + esc(STR.notFound) + '</p>' +
      '<a class="news-back" href="' + indexUrl() + '">' + esc(STR.back) + '</a>';
    mount.appendChild(box);
  }

  function buildArticle(mount, p) {
    mount.innerHTML = '';
    var title = pickField(p, 'title');
    var body = pickField(p, 'body'); // rich HTML — injected as innerHTML
    document.title = (title ? title + ' — ' : '') + 'Caspian Coast Coffee';

    var art = document.createElement('article');
    art.className = 'news-article';
    setDir(art);

    var cover = rootAsset(p.cover);
    var head =
      '<a class="news-back" href="' + indexUrl() + '">' + esc(STR.back) + '</a>' +
      '<div class="na-meta">' +
        (p.category ? '<span class="nc-chip">' + esc(categoryLabel(p.category)) + '</span>' : '') +
        (p.date ? '<span class="nc-date">' + esc(formatDate(p.date)) + '</span>' : '') +
      '</div>' +
      '<h1 class="na-title">' + esc(title) + '</h1>';

    var coverHtml = cover
      ? '<figure class="na-cover"><img src="' + esc(cover) + '" alt="' + esc(title) + '" /></figure>'
      : '';

    art.innerHTML = head + coverHtml + '<div class="na-body"></div>';
    var bodyEl = art.querySelector('.na-body');
    bodyEl.innerHTML = body || '';   // rich text by contract
    if (IS_FA) bodyEl.setAttribute('dir', 'rtl');

    mount.appendChild(art);
  }

  /* ===================== BOOTSTRAP ===================== */
  function init() {
    var idx = document.getElementById('newsIndex');
    if (idx) { renderIndex(idx); return; }
    var art = document.getElementById('newsArticle');
    if (art) { renderArticle(art); }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
