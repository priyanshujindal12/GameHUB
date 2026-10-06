

(function (root) {
  'use strict';

  /* ─── Constants ─── */
  var STORAGE_KEY = 'gamehub_data';
  var DASHBOARD_PATH = '../dashboard.html';

  /* ─── XP Normalization Config ─── */
  var XP_CONFIG = {
    'doodle-jump':    { max: 5000,  xpCap: 500 },
    'rps':            { max: 10,    xpCap: 300 },
    'flappy-bird':    { max: 50,    xpCap: 500 },
    '2048':           { max: 20000, xpCap: 500 },
    'snake':          { max: 50,    xpCap: 500 },
    'typing':         { max: 30,    xpCap: 400 },
  };

  function getDefaultData() {
    return {
      player: { totalXP: 0, gamesPlayed: 0 },
      games: {}
    };
  }

  function loadData() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && parsed.player && parsed.games) return parsed;
      }
    } catch (e) { /* corrupted — reset */ }
    return getDefaultData();
  }

  function saveData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) { /* localStorage full or blocked */ }
  }

  function getGameEntry(data, gameId) {
    if (!data.games[gameId]) {
      data.games[gameId] = {
        bestScore: 0,
        lastScore: 0,
        gamesPlayed: 0,
        xpEarned: 0
      };
    }
    return data.games[gameId];
  }

  /* ═══════════════════════════════════════════════════
     2. SCORE API — GameHubScore
     ═══════════════════════════════════════════════════ */
  var _scoreSavedThisSession = {};

  var GameHubScore = {
    /**
     * Save a score for a game. Call once at game-over.
     * Returns { xpEarned, isNewBest, bestScore }
     */
    saveScore: function (gameId, score) {
      // Prevent duplicate saves in same session
      if (_scoreSavedThisSession[gameId]) return _scoreSavedThisSession[gameId];

      var data = loadData();
      var entry = getGameEntry(data, gameId);
      var isNewBest = score > entry.bestScore;

      entry.lastScore = score;
      if (isNewBest) entry.bestScore = score;
      entry.gamesPlayed++;

      // Calculate XP
      var config = XP_CONFIG[gameId] || { max: 1000, xpCap: 400 };
      var xpEarned = Math.min(config.xpCap, Math.round((score / config.max) * config.xpCap));
      if (xpEarned < 10 && score > 0) xpEarned = 10; // minimum XP for playing
      entry.xpEarned = Math.max(entry.xpEarned, xpEarned); // keep highest XP

      // Recalculate total XP
      var totalXP = 0;
      var totalGames = 0;
      Object.keys(data.games).forEach(function (id) {
        totalXP += data.games[id].xpEarned || 0;
        totalGames += data.games[id].gamesPlayed || 0;
      });
      data.player.totalXP = totalXP;
      data.player.gamesPlayed = totalGames;

      saveData(data);

      var result = {
        xpEarned: xpEarned,
        isNewBest: isNewBest,
        bestScore: entry.bestScore,
        totalXP: totalXP
      };

      _scoreSavedThisSession[gameId] = result;
      return result;
    },

    /** Reset session lock (call on game restart) */
    resetSession: function (gameId) {
      delete _scoreSavedThisSession[gameId];
    },

    /** Get score data for a specific game */
    getScore: function (gameId) {
      var data = loadData();
      return getGameEntry(data, gameId);
    },

    /** Get all scores */
    getAllScores: function () {
      return loadData().games;
    },

    /** Get total XP */
    getTotalXP: function () {
      return loadData().player.totalXP || 0;
    },

    /** Get total games played */
    getGamesPlayed: function () {
      return loadData().player.gamesPlayed || 0;
    },

    /** Get star rating (0-5) */
    getStarRating: function () {
      var xp = this.getTotalXP();
      if (xp >= 3000) return 5;
      if (xp >= 2000) return 4;
      if (xp >= 1200) return 3;
      if (xp >= 500) return 2;
      if (xp >= 100) return 1;
      return 0;
    }
  };

  /* ═══════════════════════════════════════════════════
     3. HEADER INJECTION — GameHub.injectHeader()
     ═══════════════════════════════════════════════════ */
  function injectHeader(gameTitle) {
    var totalXP = GameHubScore.getTotalXP();
    var stars = GameHubScore.getStarRating();
    var starsHTML = '';
    for (var i = 0; i < 5; i++) {
      starsHTML += '<span class="gh-star' + (i < stars ? ' filled' : '') + '">★</span>';
    }

    var headerHTML = ''
      + '<header class="gh-header" id="gh-header">'
      + '  <nav class="gh-nav">'
      + '    <a href="' + DASHBOARD_PATH + '" class="gh-logo">'
      + '      <span class="gh-logo-icon">◆</span>'
      + '      <span class="gh-logo-text">GAMEHUB</span>'
      + '    </a>'
      + '    <a href="' + DASHBOARD_PATH + '" class="gh-back" id="gh-back">'
      + '      <span class="gh-back-arrow">←</span>'
      + '      <span class="gh-back-label">BACK TO GAMES</span>'
      + '    </a>'
      + '    <div class="gh-game-title">' + (gameTitle || '') + '</div>'
      + '    <div class="gh-hud">'
      + '      <span class="gh-xp-value" id="gh-xp-value">' + totalXP.toLocaleString() + '</span>'
      + '      <span class="gh-xp-label">XP</span>'
      + '      <div class="gh-stars">' + starsHTML + '</div>'
      + '    </div>'
      + '  </nav>'
      + '</header>';

    document.body.insertAdjacentHTML('afterbegin', headerHTML);
    document.body.classList.add('gh-game-page');
  }

  /* ═══════════════════════════════════════════════════
     4. GAME-OVER OVERLAY — GameHub.showGameOver()
     ═══════════════════════════════════════════════════ */
  function showGameOver(options) {
    /*
      options: {
        gameId: string,
        score: number,
        title: string (optional, e.g. "GAME OVER", "YOU WIN", "TIME'S UP"),
        onRestart: function
      }
    */
    var result = GameHubScore.saveScore(options.gameId, options.score);
    var title = options.title || 'GAME OVER';

    var overlayHTML = ''
      + '<div class="gh-overlay" id="gh-overlay">'
      + '  <div class="gh-overlay-panel">'
      + '    <h2 class="gh-overlay-title">' + title + '</h2>'
      + '    <div class="gh-overlay-score">'
      + '      <span class="gh-overlay-label">SCORE</span>'
      + '      <span class="gh-overlay-value" id="gh-overlay-score">' + options.score + '</span>'
      + '    </div>'
      + (result.isNewBest
          ? '<div class="gh-overlay-newbest">★ NEW HIGH SCORE</div>'
          : '<div class="gh-overlay-best">BEST: ' + result.bestScore + '</div>')
      + '    <div class="gh-overlay-xp">+' + result.xpEarned + ' GAMEHUB XP</div>'
      + '    <div class="gh-overlay-buttons">'
      + '      <button class="gh-btn gh-btn-primary" id="gh-play-again">PLAY AGAIN</button>'
      + '      <a href="' + DASHBOARD_PATH + '" class="gh-btn gh-btn-secondary">← BACK TO GAMES</a>'
      + '    </div>'
      + '  </div>'
      + '</div>';

    document.body.insertAdjacentHTML('beforeend', overlayHTML);

    // Trigger fade-in
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        var overlay = document.getElementById('gh-overlay');
        if (overlay) overlay.classList.add('visible');
      });
    });

    // Update header XP
    var xpEl = document.getElementById('gh-xp-value');
    if (xpEl) xpEl.textContent = result.totalXP.toLocaleString();

    // Play Again handler
    var playAgainBtn = document.getElementById('gh-play-again');
    if (playAgainBtn) {
      playAgainBtn.addEventListener('click', function () {
        var overlay = document.getElementById('gh-overlay');
        if (overlay) overlay.remove();
        GameHubScore.resetSession(options.gameId);
        if (typeof options.onRestart === 'function') {
          options.onRestart();
        } else {
          location.reload();
        }
      });
    }
  }

  /** Remove the overlay if it exists (useful for restart) */
  function hideGameOver() {
    var overlay = document.getElementById('gh-overlay');
    if (overlay) overlay.remove();
  }

  /* ═══════════════════════════════════════════════════
     5. EXPORT — window.GameHub
     ═══════════════════════════════════════════════════ */
  root.GameHub = {
    Score: GameHubScore,
    injectHeader: injectHeader,
    showGameOver: showGameOver,
    hideGameOver: hideGameOver,
    DASHBOARD_PATH: DASHBOARD_PATH
  };

})(window);
