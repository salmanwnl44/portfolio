/* ==========================================================================
   Salman Ansari — portfolio behaviour. No dependencies.
   ========================================================================== */

(function () {
  'use strict';

  var GITHUB_USER = 'salmanwnl44';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- live clock (IST) ---------------- */
  var clock12 = document.querySelectorAll('[data-clock-12]');
  var clock24 = document.querySelectorAll('[data-clock-24]');
  var yearEl = document.querySelectorAll('[data-year]');

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function istParts() {
    // Asia/Kolkata is UTC+5:30, no DST.
    var now = new Date();
    var ist = new Date(now.getTime() + (now.getTimezoneOffset() + 330) * 60000);
    return { h: ist.getHours(), m: ist.getMinutes(), s: ist.getSeconds(), y: ist.getFullYear() };
  }

  function tick() {
    var t = istParts();
    var h12 = t.h % 12 === 0 ? 12 : t.h % 12;
    var suffix = t.h < 12 ? 'AM' : 'PM';
    var twelve = pad(h12) + ':' + pad(t.m) + ':' + pad(t.s) + ' ' + suffix;
    var twenty = pad(t.h) + ':' + pad(t.m) + ':' + pad(t.s) + ' IST';

    clock12.forEach(function (el) { el.textContent = twelve; });
    clock24.forEach(function (el) { el.textContent = twenty; });
    yearEl.forEach(function (el) { el.textContent = String(t.y); });
  }

  if (clock12.length || clock24.length || yearEl.length) {
    tick();
    window.setInterval(tick, 1000);
  }

  /* ---------------- marquee: clone track for a seamless loop ---------------- */
  document.querySelectorAll('[data-marquee] [data-track]').forEach(function (track) {
    var clone = track.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    Array.prototype.slice.call(clone.children).forEach(function (child) { track.appendChild(child); });
  });

  /* ---------------- QR flip on the avatar ---------------- */
  document.querySelectorAll('[data-qr-toggle]').forEach(function (btn) {
    var wrap = btn.closest('[data-avatar]');
    if (!wrap) return;
    btn.addEventListener('click', function () {
      var shown = wrap.classList.toggle('show-qr');
      btn.setAttribute('aria-label', shown ? 'Hide QR code' : 'Show QR code');
    });
  });

  /* ---------------- experience expand / collapse ---------------- */
  document.querySelectorAll('[data-exp-toggle]').forEach(function (btn) {
    var item = btn.closest('[data-exp]');
    if (!item) return;
    btn.addEventListener('click', function () {
      var open = item.getAttribute('data-open') === 'true';
      item.setAttribute('data-open', open ? 'false' : 'true');
      btn.setAttribute('aria-expanded', open ? 'false' : 'true');
    });
  });

  /* ---------------- copy to clipboard ---------------- */
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    var label = btn.querySelector('[data-copy-label]');
    var original = label ? label.textContent : '';

    btn.addEventListener('click', function () {
      var value = btn.getAttribute('data-copy');
      var done = function (ok) {
        if (label) {
          label.textContent = ok ? 'copied to clipboard' : value;
          window.setTimeout(function () { label.textContent = original; }, 2000);
        } else {
          btn.classList.add('is-copied');
          window.setTimeout(function () { btn.classList.remove('is-copied'); }, 1400);
        }
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(function () { done(true); }, function () { done(false); });
      } else {
        done(false);
      }
    });
  });

  /* ---------------- contribution calendar ---------------- */
  var calGrid = document.querySelector('[data-cal-grid]');
  var calMonths = document.querySelector('[data-cal-months]');
  var calTotal = document.querySelector('[data-cal-total]');

  var CELL = 11;
  var GAP = 3;
  var MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function renderCalendar(days, total) {
    if (!calGrid) return;
    calGrid.textContent = '';
    if (calMonths) calMonths.textContent = '';

    // pad the first week so rows line up with weekdays (Sun .. Sat)
    var firstDay = new Date(days[0].date + 'T00:00:00');
    var lead = firstDay.getDay();
    var cells = [];
    var i;
    for (i = 0; i < lead; i++) cells.push(null);
    cells = cells.concat(days);

    var weeks = Math.ceil(cells.length / 7);
    var monthSpans = [];

    for (i = 0; i < cells.length; i++) {
      var day = cells[i];
      var cell = document.createElement('span');
      cell.className = 'cal-day';
      if (!day) {
        cell.setAttribute('data-empty', '');
      } else {
        cell.setAttribute('data-level', String(day.level || 0));
        cell.title = day.count + (day.count === 1 ? ' contribution' : ' contributions') + ' on ' + day.date;
      }
      calGrid.appendChild(cell);

      // record which month each week column starts in
      if (day && i % 7 === 0) {
        var m = new Date(day.date + 'T00:00:00').getMonth();
        var last = monthSpans[monthSpans.length - 1];
        if (!last || last.month !== m) monthSpans.push({ month: m, weeks: 1 });
        else last.weeks += 1;
      } else if (day && monthSpans.length === 0) {
        monthSpans.push({ month: new Date(day.date + 'T00:00:00').getMonth(), weeks: 1 });
      }
    }

    calGrid.style.gridTemplateRows = 'repeat(7, ' + CELL + 'px)';
    calGrid.style.width = (weeks * (CELL + GAP)) + 'px';

    if (calMonths) {
      calMonths.style.width = (weeks * (CELL + GAP)) + 'px';
      monthSpans.forEach(function (span) {
        var el = document.createElement('span');
        el.className = 'cal-month';
        el.style.width = (span.weeks * (CELL + GAP)) + 'px';
        el.textContent = MONTH_NAMES[span.month];
        calMonths.appendChild(el);
      });
    }

    if (calTotal) {
      calTotal.textContent = 'This year, I achieved ' + total.toLocaleString() + ' contributions';
    }
  }

  // When GitHub reports no attributed contributions, an empty grid reading
  // "0 contributions" looks worse than no grid at all.
  function noContributions() {
    var section = calGrid ? calGrid.closest('section') : null;
    if (!section) return;
    if (section.hasAttribute('data-cal-optional')) {
      section.style.display = 'none';
      return;
    }
    var box = section.querySelector('.boxed');
    if (box) {
      box.textContent = '';
      var note = document.createElement('p');
      note.style.cssText = 'font-size:.85rem;color:var(--text-dim);text-align:center;padding:14px 0';
      note.textContent = 'No contribution data is being reported for this account right now.';
      box.appendChild(note);
    }
  }

  function loadCalendar() {
    if (!calGrid) return;
    fetch('https://github-contributions-api.jogruber.de/v4/' + GITHUB_USER + '?y=last')
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (data) {
        if (!data || !Array.isArray(data.contributions) || !data.contributions.length) throw new Error('no data');
        var days = data.contributions.slice(-371);
        var total = days.reduce(function (sum, d) { return sum + (d.count || 0); }, 0);
        if (total === 0) { noContributions(); return; }
        renderCalendar(days, total);
      })
      .catch(function () {
        // fall back to a static contribution image
        calGrid.textContent = '';
        if (calMonths) calMonths.textContent = '';
        var img = document.createElement('img');
        img.src = 'https://ghchart.rshah.org/8c8c8c/' + GITHUB_USER;
        img.alt = 'GitHub contribution graph for ' + GITHUB_USER;
        img.loading = 'lazy';
        img.style.width = '100%';
        calGrid.style.width = '100%';
        calGrid.style.display = 'block';
        calGrid.appendChild(img);
        if (calTotal) calTotal.textContent = 'Contributions on GitHub';
      });
  }

  /* ---------------- live GitHub stats (public API) ---------------- */
  function setStat(key, value) {
    document.querySelectorAll('[data-gh="' + key + '"]').forEach(function (el) {
      if (value !== null && value !== undefined) el.textContent = value;
    });
  }

  function renderBars(rows, mount) {
    if (!mount) return;
    mount.textContent = '';
    var max = rows.reduce(function (m, r) { return Math.max(m, r.value); }, 0) || 1;
    rows.forEach(function (row) {
      var wrap = document.createElement('div');
      wrap.className = 'bar-row';
      wrap.innerHTML =
        '<span class="bar-name"></span>' +
        '<span class="bar-track"><span class="bar-fill"></span></span>' +
        '<span class="bar-val"></span>';
      wrap.querySelector('.bar-name').textContent = row.label;
      wrap.querySelector('.bar-val').textContent = row.value;
      wrap.querySelector('.bar-fill').style.width = Math.max(4, (row.value / max) * 100) + '%';
      mount.appendChild(wrap);
    });
  }

  function loadGitHub() {
    var needsStats = document.querySelector('[data-gh]');
    if (!needsStats) return;

    fetch('https://api.github.com/users/' + GITHUB_USER)
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (user) {
        if (!user) return;
        setStat('repos', String(user.public_repos));
        setStat('followers', String(user.followers));
        if (user.created_at) setStat('since', user.created_at.slice(0, 4));
      })
      .catch(function () {});

    fetch('https://api.github.com/users/' + GITHUB_USER + '/repos?per_page=100&sort=pushed')
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (repos) {
        if (!Array.isArray(repos)) return;

        var own = repos.filter(function (r) { return !r.fork; });
        var counts = {};
        var stars = 0;

        own.forEach(function (repo) {
          stars += repo.stargazers_count || 0;
          if (repo.language) counts[repo.language] = (counts[repo.language] || 0) + 1;
        });

        setStat('stars', String(stars));
        setStat('own', String(own.length));

        var sorted = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; });
        setStat('langs', sorted.slice(0, 3).join(' · '));

        renderBars(
          sorted.slice(0, 6).map(function (k) { return { label: k, value: counts[k] }; }),
          document.querySelector('[data-lang-bars]')
        );

        var recent = own
          .slice(0, 6)
          .map(function (r) { return { name: r.name, pushed: r.pushed_at, url: r.html_url, lang: r.language }; });
        var mount = document.querySelector('[data-recent-repos]');
        if (mount && recent.length) {
          mount.textContent = '';
          recent.forEach(function (r) {
            var a = document.createElement('a');
            a.className = 'card';
            a.href = r.url;
            a.target = '_blank';
            a.rel = 'noopener';
            a.style.display = 'block';
            a.innerHTML = '<h3></h3><p></p>';
            a.querySelector('h3').textContent = r.name;
            a.querySelector('p').textContent =
              (r.lang ? r.lang + ' · ' : '') + 'updated ' + (r.pushed || '').slice(0, 10);
            mount.appendChild(a);
          });
        }
      })
      .catch(function () {});
  }

  /* ---------------- lazy-trigger network work ---------------- */
  function whenVisible(el, fn) {
    if (!el) return;
    if (!('IntersectionObserver' in window)) { fn(); return; }
    var obs = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      obs.disconnect();
      fn();
    }, { rootMargin: '250px' });
    obs.observe(el);
  }

  whenVisible(document.getElementById('contributions'), loadCalendar);
  whenVisible(document.querySelector('[data-gh]') || document.body, loadGitHub);

  /* ---------------- scroll reveal ---------------- */
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var targets = document.querySelectorAll(
      '.hero-top, .hero-bio, .hero-cards, .social-row, .section-title, .marquee, .boxed, .project, .card, .page-head'
    );
    targets.forEach(function (el, i) {
      el.classList.add('reveal');
      el.style.transitionDelay = (Math.min(i % 5, 4) * 60) + 'ms';
    });
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObs.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    targets.forEach(function (el) { revealObs.observe(el); });
  }
})();
