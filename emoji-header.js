/**
 * emoji-header.js — Shared Header + Sidebar
 * Injects the header, sidebar overlay, and sidebar into any page.
 * Include with: <script src="/emoji-header.js" defer></script>
 */
(function () {
  'use strict';

  // ── HTML Templates ──
  var headerHTML = [
    '<header class="header">',
    '  <div class="header-inner">',
    '    <button class="sidebar-toggle" id="sidebarToggle" aria-label="Toggle menu">',
    '      <span></span><span></span><span></span>',
    '    </button>',
    '    <a class="header-logo" href="/">',
    '      <span class="header-logo__text">EMOJI<span>CIRCLE</span></span>',
    '    </a>',
    '    <div class="header-right">',
    '      <div class="header-social">',
    '        <a href="https://www.instagram.com/emojicircle" target="_blank" rel="noopener" aria-label="Instagram">',
    '          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>',
    '        </a>',
    '        <a href="https://pinterest.com" target="_blank" rel="noopener" aria-label="Pinterest">',
    '          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/></svg>',
    '        </a>',
    '        <a href="https://x.com/emojicircle4u" target="_blank" rel="noopener" aria-label="X">',
    '          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l18 18M21 3L3 21"/></svg>',
    '        </a>',
    '      </div>',
    '    </div>',
    '  </div>',
    '</header>'
  ].join('\n');

  var overlayHTML = '<div class="sidebar-overlay" id="sidebarOverlay"></div>';

  var sidebarHTML = [
    '<aside class="sidebar" id="sidebar">',
    '  <nav class="sidebar-nav">',
    '    <div class="sidebar-section">',
    '      <span class="sidebar-section__label">Main</span>',
    '      <a href="/" class="sidebar-link">',
    '        <span class="sidebar-icon">\uD83C\uDFE0</span><span class="sidebar-text">Home</span>',
    '      </a>',
    '      <a href="/games/games.html" class="sidebar-link">',
    '        <span class="sidebar-icon">\uD83C\uDFAE</span><span class="sidebar-text">Games</span>',
    '      </a>',
    '      <a href="/blogs/blog.html" class="sidebar-link">',
    '        <span class="sidebar-icon">\uD83D\uDCDD</span><span class="sidebar-text">Blogs</span>',
    '      </a>',
    '      <a href="/emoji-search.html" class="sidebar-link">',
    '        <span class="sidebar-icon">\uD83D\uDD0D</span><span class="sidebar-text">Search Emoji</span>',
    '      </a>',
    '      <div class="sidebar-dropdown">',
    '        <button class="sidebar-link sidebar-dropdown__toggle" type="button" aria-expanded="false">',
    '          <span class="sidebar-icon">\uD83D\uDCDA</span>',
    '          <span class="sidebar-text">Emoji Library</span>',
    '          <span class="sidebar-dropdown__arrow">\u203A</span>',
    '        </button>',
    '        <div class="sidebar-dropdown__menu">',
    '          <a href="/categories/smileys.html" class="sidebar-link sidebar-link--sub"><span class="sidebar-icon">\uD83D\uDE0A</span><span class="sidebar-text">Smileys</span></a>',
    '          <a href="/categories/people.html" class="sidebar-link sidebar-link--sub"><span class="sidebar-icon">\uD83D\uDC64</span><span class="sidebar-text">People</span></a>',
    '          <a href="/categories/animals.html" class="sidebar-link sidebar-link--sub"><span class="sidebar-icon">\uD83D\uDC3E</span><span class="sidebar-text">Animals</span></a>',
    '          <a href="/categories/food.html" class="sidebar-link sidebar-link--sub"><span class="sidebar-icon">\uD83C\uDF54</span><span class="sidebar-text">Food</span></a>',
    '          <a href="/categories/activity.html" class="sidebar-link sidebar-link--sub"><span class="sidebar-icon">\u26BD</span><span class="sidebar-text">Activity</span></a>',
    '          <a href="/categories/travel.html" class="sidebar-link sidebar-link--sub"><span class="sidebar-icon">\uD83D\uDE80</span><span class="sidebar-text">Travel</span></a>',
    '          <a href="/categories/objects.html" class="sidebar-link sidebar-link--sub"><span class="sidebar-icon">\uD83D\uDCA1</span><span class="sidebar-text">Objects</span></a>',
    '          <a href="/categories/symbols.html" class="sidebar-link sidebar-link--sub"><span class="sidebar-icon">\uD83D\uDC96</span><span class="sidebar-text">Symbols</span></a>',
    '          <a href="/categories/flags.html" class="sidebar-link sidebar-link--sub"><span class="sidebar-icon">\uD83C\uDFF3\uFE0F</span><span class="sidebar-text">Flags</span></a>',
    '        </div>',
    '      </div>',
    '    </div>',
    '    <div class="sidebar-section sidebar-section--footer">',
    '      <span class="sidebar-section__label">More</span>',
    '      <a href="/pages/rules/privacy.html" class="sidebar-link">',
    '        <span class="sidebar-icon">\uD83D\uDCDC</span><span class="sidebar-text">Policies</span>',
    '      </a>',
    '      <a href="/pages/rules/about.html" class="sidebar-link">',
    '        <span class="sidebar-icon">\u2139\uFE0F</span><span class="sidebar-text">About</span>',
    '      </a>',
    '      <a href="/pages/rules/contact.html" class="sidebar-link">',
    '        <span class="sidebar-icon">\u2709\uFE0F</span><span class="sidebar-text">Contact</span>',
    '      </a>',
    '    </div>',
    '  </nav>',
    '</aside>'
  ].join('\n');

  // ── Inject into DOM ──
  // Remove any existing old-style header
  var existingHeader = document.querySelector('header.header');
  if (existingHeader) existingHeader.remove();

  // Remove any existing old-style nav that was part of the old layout
  var existingNav = document.querySelector('.header-nav[aria-label="Primary"]');
  if (existingNav) {
    var oldHeader = existingNav.closest('header');
    if (oldHeader) oldHeader.remove();
  }

  // Mark body for layout padding
  document.body.classList.add('has-shared-layout');

  // Insert header + overlay + sidebar at the very top of <body>
  var wrapper = document.createElement('div');
  wrapper.innerHTML = headerHTML + overlayHTML + sidebarHTML;
  while (wrapper.firstChild) {
    document.body.insertBefore(wrapper.firstChild, document.body.firstChild);
  }

  // ── Dynamic active link highlighting ──
  (function highlightActiveSidebarLink() {
    var path = window.location.pathname;
    // Check if we're on a category page
    var isCategory = path.indexOf('/categories/') === 0;
    if (isCategory) {
      // Highlight the Emoji Library parent toggle, not sub-links
      var dropdownToggle = document.querySelector('.sidebar-dropdown__toggle');
      if (dropdownToggle) dropdownToggle.classList.add('active');
    } else {
      // Highlight matching top-level sidebar link
      var sidebarLinks = document.querySelectorAll('.sidebar-link[href]');
      sidebarLinks.forEach(function (link) {
        // Skip sub-links inside dropdown
        if (link.classList.contains('sidebar-link--sub')) return;
        var href = link.getAttribute('href');
        if (!href || href === '#') return;
        var isActive = (path === href) ||
          (href === '/' && (path === '/' || path === '/index.html')) ||
          (href !== '/' && path.indexOf(href) === 0);
        if (isActive) {
          link.classList.add('active');
        }
      });
    }
  })();

  // ── Sidebar Logic ──
  var toggle = document.getElementById('sidebarToggle');
  var sidebar = document.getElementById('sidebar');
  var overlay = document.getElementById('sidebarOverlay');

  function openSidebar() {
    sidebar.classList.add('active');
    overlay.classList.add('active');
    toggle.classList.add('active');
    document.body.classList.add('sidebar-open');
  }

  function closeSidebar() {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    toggle.classList.remove('active');
    document.body.classList.remove('sidebar-open');
    // Close all open dropdowns when sidebar closes
    var openDropdowns = sidebar.querySelectorAll('.sidebar-dropdown.open');
    openDropdowns.forEach(function (dd) {
      dd.classList.remove('open');
      var t = dd.querySelector('.sidebar-dropdown__toggle');
      if (t) t.setAttribute('aria-expanded', 'false');
    });
  }

  toggle.addEventListener('click', function () {
    sidebar.classList.contains('active') ? closeSidebar() : openSidebar();
  });

  overlay.addEventListener('click', closeSidebar);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeSidebar();
  });

  // Dropdown toggle
  var dropdownToggles = document.querySelectorAll('.sidebar-dropdown__toggle');
  dropdownToggles.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var dropdown = btn.closest('.sidebar-dropdown');
      var isOpen = dropdown.classList.contains('open');
      dropdown.classList.toggle('open');
      btn.setAttribute('aria-expanded', !isOpen);
    });
  });

  // Close dropdowns when sidebar loses hover
  sidebar.addEventListener('mouseleave', function () {
    var openDropdowns = sidebar.querySelectorAll('.sidebar-dropdown.open');
    openDropdowns.forEach(function (dd) {
      dd.classList.remove('open');
      var t = dd.querySelector('.sidebar-dropdown__toggle');
      if (t) t.setAttribute('aria-expanded', 'false');
    });
  });
})();
