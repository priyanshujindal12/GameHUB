
(function () { 'use strict';
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function initEntranceAnimations() {
    const entries = document.querySelectorAll('.anim-entry');
    const baseDelay = 300;  
    const stagger = 150;   
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
    var PARTICLE_COUNT = 65;
    var isMobile = window.innerWidth < 640;
    if (isMobile) {
      PARTICLE_COUNT = 12;
    }
    function resize() {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    }
    function createParticle() {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 2.5 + 0.8,
        dx: (Math.random() - 0.5) * 0.4,
        dy: -(Math.random() * 0.6 + 0.2),
        alpha: Math.random() * 0.3 + 0.05,
        hue: Math.random() > 0.7 ? 190 : 270  
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

        if (p.y < -10) {
          p.y = h + 10;
          p.x = Math.random() * w;
        }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);

        if (p.hue === 270) {
          ctx.fillStyle = 'rgba(139, 92, 246, ' + p.alpha + ')';
        } else {
          ctx.fillStyle = 'rgba(34, 211, 238, ' + p.alpha + ')';
        }
        ctx.fill();

        // Subtle glow halo
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
        if (p.hue === 270) {
          ctx.fillStyle = 'rgba(139, 92, 246, ' + (p.alpha * 0.15) + ')';
        } else {
          ctx.fillStyle = 'rgba(34, 211, 238, ' + (p.alpha * 0.1) + ')';
        }
        ctx.fill();
      }

      requestAnimationFrame(draw);
    }

    resize();
    initParticleArray();
    draw();

    window.addEventListener('resize', function () {
      resize();
    });
  }

  function initParallax() {
    if (prefersReducedMotion) return;
    if (window.innerWidth < 640) return;

    var gridFloor = document.getElementById('grid-floor');
    var floatShapes = document.getElementById('float-shapes');
    var ambientGlows = document.querySelectorAll('.ambient-glow');

    var targetX = 0;
    var targetY = 0;
    var currentX = 0;
    var currentY = 0;

    window.addEventListener('mousemove', function (e) {
      targetX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      targetY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    });

    function animate() {
      // Smooth lerp
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;

      var gridDX = currentX * 12;
      var gridDY = currentY * 8;

      if (gridFloor) {
        gridFloor.style.transform =
          'translateX(calc(-50% + ' + gridDX + 'px)) perspective(500px) rotateX(65deg)';
      }

      if (floatShapes) {
        floatShapes.style.transform =
          'translate(' + (currentX * 18) + 'px, ' + (currentY * 14) + 'px)';
      }

      // Subtle glow movement
      ambientGlows.forEach(function (glow, i) {
        var factor = (i + 1) * 5;
        glow.style.transform =
          'translate(' + (currentX * factor) + 'px, ' + (currentY * factor) + 'px)';
      });

      requestAnimationFrame(animate);
    }

    animate();
  }

  function initNavbar() {
    var header = document.getElementById('header');
    var hamburger = document.getElementById('hamburger');
    var mobileMenu = document.getElementById('mobile-menu');

    // Scroll — add glass effect
    var scrollThreshold = 50;
    var ticking = false;

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          if (window.scrollY > scrollThreshold) {
            header.classList.add('scrolled');
          } else {
            header.classList.remove('scrolled');
          }
          ticking = false;
        });
        ticking = true;
      }
    });

    // Mobile menu toggle
    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', function () {
        var isOpen = mobileMenu.classList.contains('open');
        mobileMenu.classList.toggle('open');
        hamburger.classList.toggle('active');
        hamburger.setAttribute('aria-expanded', !isOpen);
        document.body.style.overflow = isOpen ? '' : 'hidden';
      });

      
      var mobileLinks = mobileMenu.querySelectorAll('.mobile-link, .mobile-cta');
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

  function initHeadlineEffect() {
    if (prefersReducedMotion) return;

    var headline = document.getElementById('headline');
    if (!headline) return;

    var style = document.createElement('style');
    style.textContent = [
      '@keyframes textShimmer {',
      '  0%   { background-position: -200% center; }',
      '  100% { background-position: 200% center; }',
      '}',
      '.headline-shimmer {',
      '  background: linear-gradient(',
      '    90deg,',
      '    var(--color-text) 0%,',
      '    var(--color-text) 40%,',
      '    var(--color-primary-light) 50%,',
      '    var(--color-text) 60%,',
      '    var(--color-text) 100%',
      '  );',
      '  background-size: 200% auto;',
      '  -webkit-background-clip: text;',
      '  background-clip: text;',
      '  -webkit-text-fill-color: transparent;',
      '  animation: textShimmer 4s linear infinite;',
      '}'
    ].join('\n');
    document.head.appendChild(style);

    var lines = headline.querySelectorAll('.headline-line:not(.headline-accent)');
    lines.forEach(function (line) {
      line.classList.add('headline-shimmer');
    });
  }

  function initStatusFlicker() {
    if (prefersReducedMotion) return;

    var countEl = document.querySelector('.status-count');
    if (!countEl) return;

    var originalText = countEl.textContent;

    setInterval(function () {
      var rnd = Math.floor(Math.random() * 3) + 6;
      countEl.textContent = rnd + '+ GAMES READY';

      setTimeout(function () {
        countEl.textContent = originalText;
      }, 150);
    }, 5000);
  }

  function initButtonEffects() {
    var buttons = document.querySelectorAll('.btn-primary');

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        var rect = btn.getBoundingClientRect();
        var ripple = document.createElement('span');
        ripple.style.cssText = [
          'position: absolute;',
          'border-radius: 50%;',
          'background: rgba(255,255,255,0.25);',
          'width: 10px; height: 10px;',
          'left: ' + (e.clientX - rect.left) + 'px;',
          'top: ' + (e.clientY - rect.top) + 'px;',
          'transform: scale(0);',
          'animation: btnRipple 0.6s ease-out forwards;',
          'pointer-events: none;'
        ].join(' ');

        btn.appendChild(ripple);
        setTimeout(function () { ripple.remove(); }, 700);
      });
    });


    var style = document.createElement('style');
    style.textContent =
      '@keyframes btnRipple { to { transform: scale(30); opacity: 0; } }';
    document.head.appendChild(style);
  }

  
  document.addEventListener('DOMContentLoaded', function () {
    initEntranceAnimations();
     initParticles();
     initParallax();
  /*   initNavbar();
    initHeadlineEffect();
    initStatusFlicker();
    initButtonEffects();   */
  });

})();
