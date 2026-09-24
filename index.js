
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

  
  document.addEventListener('DOMContentLoaded', function () {
    initEntranceAnimations();
     initParticles();
  
  });

})();
