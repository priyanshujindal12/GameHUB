
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



  
  document.addEventListener('DOMContentLoaded', function () {
    initEntranceAnimations();

  });

})();
