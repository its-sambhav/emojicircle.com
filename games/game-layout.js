/**
 * Unified Game Layout System — EmojiCircle
 *
 * Builds: .game-layout > .game-main > .game-container
 *         .game-layout > .game-main > .game-bottom-section (aligned with container)
 *         .game-layout > .game-sidebar
 *
 * emoji-header.css already handles body padding-top and main margin-left.
 */

(function () {
  'use strict';

  // ── Game catalog ──
  var GAMES = [
    { id: 'emoji-quiz',         title: 'Emoji Quiz',       href: '/games/emoji-quiz.html',                img: '/game-banners/world-quiz.webp' },
    { id: 'emoji-memory',       title: 'Memory Flip',      href: '/games/emoji-memory.html',              img: '/game-banners/memory.webp' },
    { id: 'emoji-tick-tac-toe', title: 'Tic Tac Toe',      href: '/games/emoji-tick-tac-toe.html',        img: '/game-banners/tic-tac-toe.webp' },
    { id: 'emoji-chess',        title: 'Chess',            href: '/games/emoji-chess.html',               img: '/game-banners/chess.webp' },
    { id: 'emoji-snake',        title: 'Snake',            href: '/games/emoji-snake.html',               img: '/game-banners/snake.webp' },
    { id: 'emoji-minesweeper',  title: 'Minesweeper',      href: '/games/emoji-minesweeper.html',         img: '/game-banners/minesweeper.webp' },
    { id: 'emoji-flappy',       title: 'Flappy',           href: '/games/emoji-flappy.html',              img: '/game-banners/flappy.webp' },
    { id: 'emoji-2048-extreme', title: '2048 Extreme',     href: '/games/emoji-2048-extreme.html',        img: '/game-banners/2048.webp' },
    { id: 'emoji-crush',        title: 'Emoji Crush',      href: '/games/emoji-crush.html',               img: '/game-banners/crush.webp' },
    { id: 'emoji-othello',      title: 'Othello',          href: '/games/emoji-othello.html',             img: '/game-banners/othello.webp' },
    { id: 'emoji-rock-paper-scissors', title: 'Rock Paper', href: '/games/emoji-rock-paper-scissors.html', img: '/game-banners/rock-paper.webp' },
    { id: 'emoji-racing-game',  title: 'Racing',           href: '/games/emoji-racing-game.html',         img: '/game-banners/race.webp' },
    { id: 'emoji-bollywood-game', title: 'Bollywood Quiz', href: '/games/emoji-bollywood-game.html',      img: '/game-banners/bollywood-quiz.webp' },
    { id: 'emoji-compatibility-calculator', title: 'Compatibility', href: '/games/emoji-compatibility-calculator.html', img: '/game-banners/compatibility.webp' },
    { id: 'emoji-guess-my-mood', title: 'Guess My Mood',   href: '/games/emoji-guess-my-mood.html',       img: '/game-banners/guess-mood.webp' },
    { id: 'emoji-hollywood-quiz', title: 'Hollywood Quiz', href: '/games/emoji-hollywood-quiz.html',      img: '/game-banners/hollywood-quiz.webp' },
    { id: 'emoji-personality-test', title: 'Personality Test', href: '/games/emoji-personality-test.html', img: '/game-banners/personality.webp' },
    { id: 'emoji-sequence-remember-game', title: 'Sequence Memory', href: '/games/emoji-sequence-remember-game.html', img: '/game-banners/pattern.webp' },
    { id: 'emoji-spot-the-different', title: 'Spot the Difference', href: '/games/emoji-spot-the-different.html', img: '/game-banners/spot-the-diff.webp' }
  ];

  var SIDEBAR_COUNT = 6;
  var BOTTOM_COUNT = GAMES.length; // Show all available games

  // ── Helpers ──

  function createCard(game) {
    var a = document.createElement('a');
    a.className = 'game-card';
    a.href = game.href;
    
    var imgWrapper = document.createElement('div');
    imgWrapper.className = 'game-card__image';
    var img = document.createElement('img');
    img.src = game.img;
    img.alt = game.title;
    img.width = 280;
    img.height = 160;
    img.loading = 'lazy';
    imgWrapper.appendChild(img);

    var title = document.createElement('div');
    title.className = 'game-card__title';
    title.textContent = game.title;
    
    a.appendChild(imgWrapper);
    a.appendChild(title);
    return a;
  }

  function getFilteredGames(currentGame) {
    return GAMES.filter(function (g) { return g.id !== currentGame; });
  }

  // ── Build layout ──

  function buildLayout() {
    var gamePage = document.querySelector('main.game-page');
    if (!gamePage) return;
    // Only skip building when a top-level layout already exists as a direct child
    var hasTopLevelLayout = Array.prototype.slice.call(gamePage.children).some(function (c) {
      return c && c.classList && c.classList.contains('game-layout');
    });
    if (hasTopLevelLayout) return;

    var currentGame = document.body.getAttribute('data-current-game') || '';
    var filtered = getFilteredGames(currentGame);

    // Collect existing children
    var fragment = document.createDocumentFragment();
    while (gamePage.firstChild) {
      fragment.appendChild(gamePage.firstChild);
    }

    // Build: .game-layout > .game-main > .game-container
    var layout = document.createElement('div');
    layout.className = 'game-layout';

    var gameMain = document.createElement('div');
    gameMain.className = 'game-main';

    var container = document.createElement('div');
    container.className = 'game-container';
    container.appendChild(fragment);

    gameMain.appendChild(container);

    // Decide recommended and remaining lists so they don't overlap
    var recommended = filtered.slice(0, SIDEBAR_COUNT);
    var remaining = filtered.filter(function (g) { return recommended.indexOf(g) === -1; });

    // Bottom "More Games" section (evenly distributed grid, aligned with main container)
    var bottom = document.createElement('section');
    bottom.className = 'game-bottom-section';

    var bottomTitle = document.createElement('h3');
    bottomTitle.className = 'game-section-title';
    bottomTitle.textContent = 'More Games';
    bottom.appendChild(bottomTitle);

    var grid = document.createElement('div');
    grid.className = 'game-bottom-grid';

    // Fill bottom grid with games that are NOT in Recommended
    for (var j = 0; j < BOTTOM_COUNT && j < remaining.length; j++) {
      grid.appendChild(createCard(remaining[j]));
    }
    bottom.appendChild(grid);

    layout.appendChild(gameMain);

    // Sidebar
    var sidebar = document.createElement('aside');
    sidebar.className = 'game-sidebar';

    var sideTitle = document.createElement('h3');
    sideTitle.className = 'game-section-title';
    sideTitle.textContent = 'Recommended';
    sidebar.appendChild(sideTitle);

    var sideGrid = document.createElement('div');
    sideGrid.className = 'recommended-grid';

    // Fill sidebar with recommended games (exclusive)
    for (var i = 0; i < recommended.length; i++) {
      sideGrid.appendChild(createCard(recommended[i]));
    }
    sidebar.appendChild(sideGrid);

    layout.appendChild(sidebar);
    
    // Append the bottom section AFTER the sidebar so it spans full width below both
    layout.appendChild(bottom);
    
    gamePage.appendChild(layout);
  }

  // ── Init ──

  function init() {
    buildLayout();
    initTouchScrollGuard();
  }

  // Prevent page scroll when interacting with the game container on touch devices.
  // Allows horizontal swipes to pass through for game input; blocks vertical
  // moves that would otherwise scroll the page.
  function initTouchScrollGuard() {
    if (!('ontouchstart' in window)) return;
    var containers = document.querySelectorAll('.game-container');
    Array.prototype.forEach.call(containers, function (container) {
      var touchSt = null;
      container.addEventListener('touchstart', function (e) {
        var t = e.touches && e.touches[0];
        if (t) touchSt = { x: t.clientX, y: t.clientY };
      }, { passive: false });

      container.addEventListener('touchmove', function (e) {
        if (!touchSt) return;
        var t = e.touches && e.touches[0];
        if (!t) return;
        var dx = t.clientX - touchSt.x, dy = t.clientY - touchSt.y;
        // Only prevent when vertical movement dominates — keep horizontal swipes for games
        if (Math.abs(dy) > Math.abs(dx)) e.preventDefault();
      }, { passive: false });

      container.addEventListener('touchend', function () { touchSt = null; }, { passive: true });
      container.addEventListener('touchcancel', function () { touchSt = null; }, { passive: true });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
