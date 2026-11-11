/* ==========================================================================
   Salman Ansari — portfolio behaviour
   No dependencies. Everything degrades gracefully without JS.
   ========================================================================== */

(function () {
  'use strict';

  var GITHUB_USER = 'salmanwnl44';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- footer year ---------- */
  var yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- marquee: duplicate the track so the loop is seamless ---------- */
  document.querySelectorAll('[data-marquee] [data-track]').forEach(function (track) {
    var clone = track.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    Array.prototype.slice.call(clone.children).forEach(function (child) {
      track.appendChild(child);
    });
  });

  /* ---------- scroll reveal ---------- */
  var revealTargets = document.querySelectorAll(
    '.hero-top, .hero-meta, .hero-bio, .hero-actions, .section-title, .section-sub, .skill-card, .exp, .project, .gh-stat, .gh-chart, .contact-row'
  );

  if (reduceMotion || !('IntersectionObserver' in window)) {
    // leave everything visible
  } else {
    revealTargets.forEach(function (el, i) {
      el.classList.add('reveal');
      el.style.transitionDelay = (Math.min(i % 6, 5) * 60) + 'ms';
    });

    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );

    revealTargets.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- nav: highlight the section in view ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('[data-nav]'));
  var sections = navLinks
    .map(function (link) { return document.querySelector(link.getAttribute('href')); })
    .filter(Boolean);

  function setActive(id) {
    navLinks.forEach(function (link) {
      link.classList.toggle('is-active', link.getAttribute('href') === '#' + id);
    });
  }

  if (sections.length && 'IntersectionObserver' in window) {
    var navObserver = new IntersectionObserver(
      function (entries) {
        var visible = entries
          .filter(function (e) { return e.isIntersecting; })
          .sort(function (a, b) { return b.intersectionRatio - a.intersectionRatio; })[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.2, 0.6, 1] }
    );
    sections.forEach(function (section) { navObserver.observe(section); });
  }

  /* ---------- copy email ---------- */
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    var label = btn.querySelector('[data-copy-label]');
    var original = label ? label.textContent : '';

    btn.addEventListener('click', function () {
      var value = btn.getAttribute('data-copy');

      var done = function (ok) {
        if (!label) return;
        label.textContent = ok ? 'copied to clipboard' : value;
        btn.classList.toggle('is-copied', ok);
        window.setTimeout(function () {
          label.textContent = original;
          btn.classList.remove('is-copied');
        }, 2000);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(function () { done(true); }, function () { done(false); });
      } else {
        done(false);
      }
    });
  });

  /* ---------- live GitHub stats (public API, no auth, fails quietly) ---------- */
  function setStat(key, value) {
    var el = document.querySelector('[data-gh="' + key + '"]');
    if (el && value) el.textContent = value;
  }

  function loadGitHub() {
    fetch('https://api.github.com/users/' + GITHUB_USER)
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (user) {
        if (!user) return;
        setStat('repos', String(user.public_repos));
        if (user.created_at) setStat('since', user.created_at.slice(0, 4));
      })
      .catch(function () { /* keep the static fallback */ });

    fetch('https://api.github.com/users/' + GITHUB_USER + '/repos?per_page=100&sort=pushed')
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (repos) {
        if (!Array.isArray(repos)) return;
        var counts = {};
        repos.forEach(function (repo) {
          if (repo.fork || !repo.language) return;
          counts[repo.language] = (counts[repo.language] || 0) + 1;
        });
        var top = Object.keys(counts)
          .sort(function (a, b) { return counts[b] - counts[a]; })
          .slice(0, 3);
        if (top.length) setStat('langs', top.join(' · '));
      })
      .catch(function () { /* keep the static fallback */ });
  }

  if ('IntersectionObserver' in window) {
    var ghSection = document.getElementById('github');
    if (ghSection) {
      var ghObserver = new IntersectionObserver(
        function (entries) {
          if (!entries[0].isIntersecting) return;
          ghObserver.disconnect();
          loadGitHub();
        },
        { rootMargin: '200px' }
      );
      ghObserver.observe(ghSection);
    }
  } else {
    loadGitHub();
  }
})();
