/* Dikone Realty — opportunity cards + project details viewer
   ---------------------------------------------------------------
   1. Loads content/listings.json (the file edited through /admin).
      If it cannot be fetched (for example when index.html is opened by
      double-click), it falls back to the copy embedded in index.html
      (<script id="listings-fallback">), and finally to the static cards.
   2. Draws one card per listing inside #opportunityGrid.
   3. "View details" opens a pop-up with the videos, photos and full
      project information. A project can be shared as index.html#project-<id>.
   4. Starts script.js once the cards exist (filters, compare, reveal).   */
(function () {
  'use strict';

  var PROJECT_HASH = '#project-';
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var LISTINGS = {};
  var currentId = null;
  var lastTrigger = null;

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function safeLink(u) {
    u = String(u || '').trim();
    return /^(#|\/|assets\/|https?:\/\/|mailto:|tel:)/i.test(u) ? u : '#contact';
  }
  function safeMedia(u) {
    u = String(u || '').trim();
    return /^(\/|assets\/|https?:\/\/)/i.test(u) ? u : '';
  }
  function cssUrl(u) {
    return "url('" + encodeURI(u).replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29') + "')";
  }
  function tokens(v) { return Array.isArray(v) ? v.join(' ') : String(v || ''); }
  function slug(s) {
    return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
  function list(v) { return Array.isArray(v) ? v.filter(Boolean) : []; }
  function hasDetails(l) {
    return list(l.sections).length > 0 || list(l.videos).length > 0 || list(l.gallery).length > 0;
  }

  /* ---------- cards ---------- */
  function card(l) {
    var id = l._id;
    var specs = list(l.specs).map(function (s) { return '<span>' + esc(s) + '</span>'; }).join('');
    var img = safeMedia(l.image);
    var mediaClass = 'opportunity-media';
    var mediaStyle = '';
    if (l.image_light) {
      mediaClass += ' opportunity-media-light';
    } else if (l.image_fit === 'contain' && img) {
      mediaClass += ' opportunity-media-poster';
      mediaStyle = ' style="--poster-bg:' + esc(cssUrl(img)) + '"';
    }
    var hasVideo = list(l.videos).length > 0;
    var detailsLink = hasDetails(l)
      ? '<a href="' + PROJECT_HASH + esc(id) + '" data-project="' + esc(id) + '">View details <span>↗</span></a>'
      : '<a href="' + esc(safeLink(l.link)) + '">View details <span>↗</span></a>';

    return '<article class="opportunity-card reveal" data-opportunity-card' +
      ' data-id="' + esc(id) + '"' +
      ' data-title="' + esc(l.compare_title || l.title) + '"' +
      ' data-location="' + esc(l.location || 'dubai') + '"' +
      ' data-type="' + esc(tokens(l.property_types)) + '"' +
      ' data-bedrooms="' + esc(tokens(l.bedrooms)) + '"' +
      ' data-budget="' + esc(tokens(l.budget)) + '"' +
      ' data-category="' + esc(tokens(l.category)) + '"' +
      ' data-price="' + esc(l.price) + '"' +
      ' data-completion="' + esc(l.completion || 'Confirm current schedule') + '"' +
      ' data-developer="' + esc(l.developer) + '">' +
      '<div class="' + mediaClass + '"' + mediaStyle + '>' +
        (img ? '<img src="' + esc(img) + '" alt="' + esc(l.image_alt || l.title) + '" loading="lazy" decoding="async" />' : '') +
        (l.badge ? '<span class="opportunity-badge">' + esc(l.badge) + '</span>' : '') +
        (l.type_label ? '<span class="opportunity-type">' + esc(l.type_label) + '</span>' : '') +
        (hasVideo ? '<span class="opportunity-video" aria-label="Video available">▶ Video</span>' : '') +
      '</div>' +
      '<div class="opportunity-body">' +
        '<div class="opportunity-title-row"><div><small>' + esc(l.area) + '</small><h3>' + esc(l.title) + '</h3></div><strong>' + esc(l.price) + '</strong></div>' +
        '<p>' + esc(l.description) + '</p>' +
        '<div class="opportunity-specs">' + specs + '</div>' +
        '<div class="opportunity-actions">' + detailsLink +
        '<button type="button" data-compare-card aria-pressed="false">＋ Compare</button></div>' +
      '</div></article>';
  }

  /* ---------- project details pop-up ---------- */
  var modal, panel, body, titleEl, kickerEl, priceEl, badgeEl, enquireBtn, closeBtn;

  function buildModal() {
    if (modal) return;
    modal = document.createElement('div');
    modal.className = 'project-modal';
    modal.id = 'projectModal';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML =
      '<div class="project-modal-backdrop" data-project-close></div>' +
      '<div class="project-modal-panel" role="dialog" aria-modal="true" aria-labelledby="projectModalTitle" tabindex="-1">' +
        '<div class="project-modal-head">' +
          '<div class="project-modal-titles">' +
            '<span class="project-modal-kicker" id="projectModalKicker"></span>' +
            '<h2 id="projectModalTitle"></h2>' +
            '<div class="project-modal-price"><strong id="projectModalPrice"></strong><em id="projectModalBadge"></em></div>' +
          '</div>' +
          '<button type="button" class="project-modal-close" data-project-close aria-label="Close project details">×</button>' +
        '</div>' +
        '<div class="project-modal-body" id="projectModalBody"></div>' +
        '<div class="project-modal-foot">' +
          '<button type="button" class="project-modal-cta" id="projectModalEnquire">Enquire about this project</button>' +
          '<small>Prices, availability and payment plans are indicative and subject to confirmation by the developer.</small>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modal);
    panel = modal.querySelector('.project-modal-panel');
    body = modal.querySelector('#projectModalBody');
    titleEl = modal.querySelector('#projectModalTitle');
    kickerEl = modal.querySelector('#projectModalKicker');
    priceEl = modal.querySelector('#projectModalPrice');
    badgeEl = modal.querySelector('#projectModalBadge');
    enquireBtn = modal.querySelector('#projectModalEnquire');
    closeBtn = modal.querySelector('.project-modal-close');

    modal.addEventListener('click', function (e) {
      if (e.target.closest('[data-project-close]')) closeProject(true);
    });
    enquireBtn.addEventListener('click', enquire);
    document.addEventListener('keydown', function (e) {
      if (!modal.classList.contains('open')) return;
      if (e.key === 'Escape') { e.preventDefault(); closeProject(true); return; }
      if (e.key !== 'Tab') return;
      var f = panel.querySelectorAll('button, [href], video[controls], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      f = Array.prototype.filter.call(f, function (n) { return !n.disabled && n.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  function sectionHtml(sec) {
    var items = list(sec.items).map(function (it) {
      it = String(it);
      var i = it.indexOf(' — ');
      if (i > 0) return '<li class="kv"><span>' + esc(it.slice(0, i)) + '</span><b>' + esc(it.slice(i + 3)) + '</b></li>';
      return '<li>' + esc(it) + '</li>';
    }).join('');
    return '<section class="project-section"><h3>' + esc(sec.title) + '</h3><ul>' + items + '</ul></section>';
  }

  function mediaHtml(l) {
    var out = '';
    var posters = {};
    list(l.videos).forEach(function (v) {
      var file = safeMedia(v && v.file);
      if (!file) return;
      var poster = safeMedia(v.poster);
      if (poster) posters[poster] = true;
      out += '<figure class="project-video">' +
        '<video controls playsinline preload="metadata"' + (poster ? ' poster="' + esc(poster) + '"' : '') + ' src="' + esc(file) + '"></video>' +
        (v.title ? '<figcaption>' + esc(v.title) + '</figcaption>' : '') +
        '</figure>';
    });
    var seen = {};
    [l.image].concat(list(l.gallery)).forEach(function (p) {
      p = safeMedia(p);
      if (!p || posters[p] || seen[p]) return;
      seen[p] = true;
      out += '<figure class="project-photo"><img src="' + esc(p) + '" alt="' + esc((l.image_alt && p === safeMedia(l.image)) ? l.image_alt : l.title) + '" loading="lazy" decoding="async" /></figure>';
    });
    return out;
  }

  function openProject(id, trigger) {
    var l = LISTINGS[id];
    if (!l) return false;
    buildModal();
    currentId = id;
    lastTrigger = trigger || null;
    kickerEl.textContent = [l.area, l.developer].filter(Boolean).join(' · ');
    titleEl.textContent = l.title;
    priceEl.textContent = l.price || '';
    badgeEl.textContent = l.badge || '';
    badgeEl.hidden = !l.badge;

    var media = mediaHtml(l);
    var specs = list(l.specs).map(function (s) { return '<span>' + esc(s) + '</span>'; }).join('');
    body.innerHTML =
      '<div class="project-modal-grid' + (media ? '' : ' no-media') + '">' +
        (media ? '<div class="project-modal-media">' + media + '</div>' : '') +
        '<div class="project-modal-info">' +
          (l.description ? '<p class="project-lead">' + esc(l.description) + '</p>' : '') +
          (specs ? '<div class="project-specs">' + specs + '</div>' : '') +
          list(l.sections).map(sectionHtml).join('') +
        '</div>' +
      '</div>';
    body.scrollTop = 0;
    panel.scrollTop = 0;

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('project-modal-open');
    try { history.replaceState(null, '', PROJECT_HASH + id); } catch (err) { /* ignore */ }
    window.setTimeout(function () { closeBtn.focus({ preventScroll: true }); }, 30);
    return true;
  }

  function closeProject(restoreFocus) {
    if (!modal || !modal.classList.contains('open')) return;
    Array.prototype.forEach.call(body.querySelectorAll('video'), function (v) { try { v.pause(); } catch (e) { /* ignore */ } });
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('project-modal-open');
    window.setTimeout(function () { if (!modal.classList.contains('open')) body.innerHTML = ''; }, 300);
    if (location.hash.indexOf(PROJECT_HASH) === 0) {
      try { history.replaceState(null, '', location.pathname + location.search); } catch (err) { /* ignore */ }
    }
    if (restoreFocus && lastTrigger && document.contains(lastTrigger)) lastTrigger.focus({ preventScroll: true });
    currentId = null;
  }

  function enquire() {
    var l = LISTINGS[currentId];
    if (!l) return;
    var message = "I'd like details on " + l.title + (l.area ? ' (' + l.area + ')' : '') +
      (l.price ? ' — ' + l.price : '') + '. Please share current availability, payment plan and floor plans.';
    closeProject(false);
    if (window.dikoneContact) window.dikoneContact({ interest: 'Specific project enquiry', developer: l.developer, message: message });
    else location.href = 'contact.html';
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-project]');
    if (!a) return;
    e.preventDefault();
    openProject(a.getAttribute('data-project'), a);
  });

  /* ---------- data ---------- */
  function startSite() {
    var s = document.createElement('script');
    s.src = 'script.js';
    document.body.appendChild(s);
  }

  // Loads a JSON file; falls back to the copy embedded in index.html when it cannot be fetched.
  function loadJson(url, fallbackId) {
    function inline() {
      var el = document.getElementById(fallbackId);
      if (!el) throw new Error('no fallback');
      return JSON.parse(el.textContent);
    }
    if (!window.fetch) return Promise.resolve().then(inline);
    return fetch(url, { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('missing ' + url); return r.json(); })
      .catch(inline);
  }

  function render(grid, data) {
    if (!data || !Array.isArray(data.listings)) return;
    var used = {};
    var items = data.listings.filter(function (l) { return l && l.title && l.published !== false; });
    items.forEach(function (l, i) {
      var id = slug(l.id || l.title) || ('listing-' + (i + 1));
      while (used[id]) id += '-' + (i + 1);
      used[id] = true;
      l._id = id;
      LISTINGS[id] = l;
    });
    grid.innerHTML = items.map(card).join('\n');
  }

  /* ---------- homepage headline (content/headline.json) ---------- */
  function renderHeadline(data) {
    var slot = document.getElementById('headline');
    var pill = document.getElementById('headlinePill');
    if (!data || data.enabled === false || !data.title) return;
    var pid = slug(data.project_id);

    if (pill && data.pill_text) {
      pill.innerHTML = '<span class="headline-dot" aria-hidden="true"></span><span>' + esc(data.pill_text) + '</span><b aria-hidden="true">↓</b>';
      pill.hidden = false;
    }
    if (!slot) return;

    var img = safeMedia(data.image);
    var points = list(data.points).map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('');
    var primary = '';
    if (data.primary_label) {
      primary = pid
        ? '<a class="button button-primary" href="' + PROJECT_HASH + esc(pid) + '" data-project="' + esc(pid) + '">' + esc(data.primary_label) + '</a>'
        : '<a class="button button-primary" href="' + esc(safeLink(data.primary_link)) + '">' + esc(data.primary_label) + '</a>';
    }
    var secondary = data.secondary_label
      ? '<a class="button button-ghost" href="' + esc(safeLink(data.secondary_link)) + '">' + esc(data.secondary_label) + '</a>'
      : '';

    slot.innerHTML =
      '<div class="headline-inner reveal">' +
        (img ? '<figure class="headline-media"><img src="' + esc(img) + '" alt="' + esc(data.image_alt || data.title) + '" decoding="async" /></figure>' : '') +
        '<div class="headline-copy">' +
          '<p class="headline-flag"><span class="headline-dot" aria-hidden="true"></span>' + esc(data.flag || 'NEW UPDATE') +
            (data.date_label ? '<i>·</i>' + esc(data.date_label) : '') + '</p>' +
          '<h2 id="headlineTitle">' + esc(data.title) + '</h2>' +
          (data.text ? '<p class="headline-text">' + esc(data.text) + '</p>' : '') +
          (points ? '<ul class="headline-points">' + points + '</ul>' : '') +
          '<div class="headline-actions">' + primary + secondary + '</div>' +
          (data.note ? '<small class="headline-note">' + esc(data.note) + '</small>' : '') +
        '</div>' +
      '</div>';
    slot.setAttribute('aria-labelledby', 'headlineTitle');
    slot.hidden = false;
  }

  var grid = document.getElementById('opportunityGrid');
  var noop = function () { /* keep whatever is already in index.html */ };

  Promise.all([
    grid ? loadJson('content/listings.json', 'listings-fallback').then(function (d) { render(grid, d); }).catch(noop) : Promise.resolve(),
    loadJson('content/headline.json', 'headline-fallback').then(renderHeadline).catch(noop)
  ]).then(function () {
    startSite();
    if (location.hash.indexOf(PROJECT_HASH) === 0) openProject(location.hash.slice(PROJECT_HASH.length));
  });
})();
