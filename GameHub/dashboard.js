
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initEntranceAnimations() {
    var entries = document.querySelectorAll('.anim-entry');
    var baseDelay = 200;
    var stagger = 100;

    entries.forEach(function (el, i) {
      setTimeout(function () {
        el.classList.add('visible');
      }, baseDelay + i * stagger);
    });
  }
  function initParticles() {
    if (prefersReducedMotion) return;

    var canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');

    var w, h;
    var particles = [];
    var PARTICLE_COUNT = window.innerWidth < 640 ? 8 : 20;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }

    function createParticle() {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 2 + 0.5,
        dx: (Math.random() - 0.5) * 0.3,
        dy: -(Math.random() * 0.4 + 0.1),
        alpha: Math.random() * 0.2 + 0.03,
        hue: Math.random() > 0.75 ? 190 : 270
      };
    }

    function initParticleArray() {
      particles = [];
      for (var i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(createParticle());
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.dx;
        p.y += p.dy;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.hue === 270
          ? 'rgba(139, 92, 246, ' + p.alpha + ')'
          : 'rgba(34, 211, 238, ' + p.alpha + ')';
        ctx.fill();

     
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
        ctx.fillStyle = p.hue === 270
          ? 'rgba(139, 92, 246, ' + (p.alpha * 0.12) + ')'
          : 'rgba(34, 211, 238, ' + (p.alpha * 0.08) + ')';
        ctx.fill();
      }
      requestAnimationFrame(draw);
    }

    resize();
    initParticleArray();
    draw();
    window.addEventListener('resize', resize);
  }


  function initNavbar() {
    var hamburger = document.getElementById('hamburger');
    var mobileMenu = document.getElementById('mobile-menu');

    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', function () {
        var isOpen = mobileMenu.classList.contains('open');
        mobileMenu.classList.toggle('open');
        hamburger.classList.toggle('active');
        hamburger.setAttribute('aria-expanded', String(!isOpen));
        document.body.style.overflow = isOpen ? '' : 'hidden';
      });

      var mobileLinks = mobileMenu.querySelectorAll('.mobile-link');
      mobileLinks.forEach(function (link) {
        link.addEventListener('click', function () {
          mobileMenu.classList.remove('open');
          hamburger.classList.remove('active');
          hamburger.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        });
      });
    }
  }

  function initCategoryFilter() {
    var sidebarBtns = document.querySelectorAll('.sidebar-btn[data-category]');
    var filterChips = document.querySelectorAll('.filter-chip[data-category]');
    var cards = document.querySelectorAll('.game-card[data-category]');
    var emptyState = document.getElementById('empty-state');
    var searchCount = document.getElementById('search-count');
    var searchInput = document.getElementById('search-input');

    var currentCategory = 'all';

    function filterCards() {
      var searchTerm = (searchInput ? searchInput.value : '').toLowerCase().trim();
      var visibleCount = 0;

      cards.forEach(function (card) {
        var cat = card.getAttribute('data-category');
        var title = card.querySelector('.card-title').textContent.toLowerCase();
        var matchCategory = currentCategory === 'all' || cat === currentCategory;
        var matchSearch = !searchTerm || title.indexOf(searchTerm) !== -1;

        if (matchCategory && matchSearch) {
          card.classList.remove('hidden');
          visibleCount++;
        } else {
          card.classList.add('hidden');
        }
      });

      // Update count
      if (searchCount) {
        searchCount.textContent = visibleCount + ' game' + (visibleCount !== 1 ? 's' : '');
      }

      // Empty state
      if (emptyState) {
        if (visibleCount === 0) {
          emptyState.classList.remove('hidden');
        } else {
          emptyState.classList.add('hidden');
        }
      }
    }

    function setActiveCategory(category) {
      currentCategory = category;

      // Update sidebar
      sidebarBtns.forEach(function (btn) {
        btn.classList.toggle('active', btn.getAttribute('data-category') === category);
      });

      // Update chips
      filterChips.forEach(function (chip) {
        chip.classList.toggle('active', chip.getAttribute('data-category') === category);
      });

      filterCards();
    }

    // Sidebar click
    sidebarBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        setActiveCategory(btn.getAttribute('data-category'));
      });
    });

    // Mobile chip click
    filterChips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        setActiveCategory(chip.getAttribute('data-category'));
      });
    });

    // Search input
    if (searchInput) {
      searchInput.addEventListener('input', filterCards);
    }

    // Initial count
    filterCards();
  }

  /* ═══════════════════════════════════════════════════
     5. LOCAL STORAGE — XP & Rating System
     Reads from the shared gamehub_data key (written by gamehub-core.js)
     ═══════════════════════════════════════════════════ */
  function initPlayerStats() {
    var STORAGE_KEY = 'gamehub_data';

    function loadData() {
      try {
        var raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          var parsed = JSON.parse(raw);
          if (parsed && parsed.player && parsed.games) return parsed;
        }
      } catch (e) { /* corrupted — use defaults */ }
      return { player: { totalXP: 0, gamesPlayed: 0 }, games: {} };
    }

    var data = loadData();
    var totalXP = data.player.totalXP || 0;
    var gamesPlayed = data.player.gamesPlayed || 0;

    // Count best scores
    var bestScoresCount = 0;
    Object.keys(data.games).forEach(function (id) {
      if (data.games[id].bestScore > 0) bestScoresCount++;
    });

    // Calculate star rating from XP (0-5 stars)
    function getStarRating(xp) {
      if (xp >= 3000) return 5;
      if (xp >= 2000) return 4;
      if (xp >= 1200) return 3;
      if (xp >= 500) return 2;
      if (xp >= 100) return 1;
      return 0;
    }

    // Render XP value with count-up animation
    function renderXP() {
      var desktopXP = document.getElementById('hud-xp-value');
      var mobileXP = document.querySelector('.mobile-xp-value');

      [desktopXP, mobileXP].forEach(function (el) {
        if (!el) return;
        animateNumber(el, 0, totalXP, 1200);
      });
    }

    function animateNumber(el, from, to, duration) {
      if (prefersReducedMotion || from === to) {
        el.textContent = to.toLocaleString();
        return;
      }

      var start = performance.now();
      function step(now) {
        var progress = Math.min((now - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var current = Math.round(from + (to - from) * eased);
        el.textContent = current.toLocaleString();
        if (progress < 1) {
          requestAnimationFrame(step);
        }
      }
      requestAnimationFrame(step);
    }

    // Render stars
    function renderStars() {
      var rating = getStarRating(totalXP);
      var starContainers = document.querySelectorAll('.hud-stars, .mobile-stars');

      starContainers.forEach(function (container) {
        var stars = container.querySelectorAll('.star');
        stars.forEach(function (star, i) {
          star.classList.toggle('filled', i < rating);
        });
      });
    }

    // Render sidebar stats
    function renderStats() {
      var gp = document.getElementById('stat-games-played');
      var bs = document.getElementById('stat-best-streak');
      var tt = document.getElementById('stat-total-time');

      if (gp) gp.textContent = gamesPlayed;
      if (bs) bs.textContent = bestScoresCount;
      if (tt) {
        // Estimate time from games played (rough: 3 min per game)
        var mins = gamesPlayed * 3;
        if (tt) tt.textContent = mins + 'm';
      }
    }

    // Render best scores on game cards
    function renderCardBestScores() {
      var cardMap = {
        'doodle-jump': 'best-doodle-jump',
        'rps': 'best-rps',
        'flappy-bird': 'best-flappy-bird',
        '2048': 'best-2048',
        'typing': 'best-typing',
        'snake': 'best-snake',
        
      };

      Object.keys(cardMap).forEach(function (gameId) {
        var el = document.getElementById(cardMap[gameId]);
        if (!el) return;
        var gameData = data.games[gameId];
        if (gameData && gameData.bestScore > 0) {
          el.textContent = 'Best: ' + gameData.bestScore.toLocaleString();
          el.style.color = '#C084FC';
        }
      });
    }

    renderXP();
    renderStars();
    renderStats();
    renderCardBestScores();
  }

  /* ═══════════════════════════════════════════════════
     6. CARD HOVER GLOW EFFECT — track mouse position
     ═══════════════════════════════════════════════════ */
  function initCardGlow() {
    if (prefersReducedMotion) return;

    var cards = document.querySelectorAll('.game-card');

    cards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        card.style.setProperty('--glow-x', x + 'px');
        card.style.setProperty('--glow-y', y + 'px');
      });
    });

    // Inject glow style
    var style = document.createElement('style');
    style.textContent = [
      '.game-card::before {',
      '  content: "";',
      '  position: absolute;',
      '  top: 0; left: 0; right: 0; bottom: 0;',
      '  border-radius: inherit;',
      '  background: radial-gradient(',
      '    400px circle at var(--glow-x, 50%) var(--glow-y, 50%),',
      '    rgba(139, 92, 246, 0.08),',
      '    transparent 60%',
      '  );',
      '  opacity: 0;',
      '  transition: opacity 0.3s ease;',
      '  pointer-events: none;',
      '  z-index: 10;',
      '}',
      '.game-card:hover::before {',
      '  opacity: 1;',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  /* ═══════════════════════════════════════════════════
     INIT
     ═══════════════════════════════════════════════════ */
  document.addEventListener('DOMContentLoaded', function () {
    initEntranceAnimations();
    initParticles();
    initNavbar();
    initCategoryFilter();
    initPlayerStats();
    initCardGlow();
  });

})();
