document.addEventListener("DOMContentLoaded", () => {
  /* ─── GameHub Header ─── */
  if (window.GameHub) {
    GameHub.injectHeader("2048");
  }

  const gridDisplay = document.querySelector(".grid");
  const scoreDisplay = document.getElementById("score");
  const bestScoreDisplay = document.getElementById("best-score");
  const resultDisplay = document.getElementById("result");
  const restartBtn = document.getElementById("restart-btn");

  let squares = [];
  const width = 4;
  let score = 0;
  let gameEnded = false;
  let myTimer;

  /* ─── Load best score from GameHub ─── */
  let bestScore = 0;

  if (window.GameHub) {
    const saved = GameHub.Score.getScore("2048");
    bestScore = saved.bestScore || 0;
  }

  if (bestScoreDisplay) {
    bestScoreDisplay.textContent = bestScore;
  }

  /* ─── Create the playing board ─── */
  function createBoard() {
    gridDisplay.innerHTML = "";
    squares = [];

    for (let i = 0; i < width * width; i++) {
      const square = document.createElement("div");

      // Keep 0 internally for game logic.
      // It will be visually hidden by addColours().
      square.innerHTML = 0;

      gridDisplay.appendChild(square);
      squares.push(square);
    }

    generate();
    generate();

    // Immediately apply visual styling
    addColours();
  }

  createBoard();

  /* ─── Generate a new number ─── */
  function generate() {
    let emptySquares = [];

    for (let i = 0; i < squares.length; i++) {
      if (squares[i].innerHTML == 0) {
        emptySquares.push(i);
      }
    }

    if (emptySquares.length === 0) return;

    const randomIndex =
      emptySquares[Math.floor(Math.random() * emptySquares.length)];

    squares[randomIndex].innerHTML = 2;

    checkForGameOver();
  }

  /* ─── Movement functions ─── */

  function moveRight() {
    for (let i = 0; i < 16; i++) {
      if (i % 4 === 0) {
        let row = [
          parseInt(squares[i].innerHTML),
          parseInt(squares[i + 1].innerHTML),
          parseInt(squares[i + 2].innerHTML),
          parseInt(squares[i + 3].innerHTML),
        ];

        let filteredRow = row.filter((num) => num);
        let missing = 4 - filteredRow.length;
        let zeros = Array(missing).fill(0);
        let newRow = zeros.concat(filteredRow);

        squares[i].innerHTML = newRow[0];
        squares[i + 1].innerHTML = newRow[1];
        squares[i + 2].innerHTML = newRow[2];
        squares[i + 3].innerHTML = newRow[3];
      }
    }
  }

  function moveLeft() {
    for (let i = 0; i < 16; i++) {
      if (i % 4 === 0) {
        let row = [
          parseInt(squares[i].innerHTML),
          parseInt(squares[i + 1].innerHTML),
          parseInt(squares[i + 2].innerHTML),
          parseInt(squares[i + 3].innerHTML),
        ];

        let filteredRow = row.filter((num) => num);
        let missing = 4 - filteredRow.length;
        let zeros = Array(missing).fill(0);
        let newRow = filteredRow.concat(zeros);

        squares[i].innerHTML = newRow[0];
        squares[i + 1].innerHTML = newRow[1];
        squares[i + 2].innerHTML = newRow[2];
        squares[i + 3].innerHTML = newRow[3];
      }
    }
  }

  function moveUp() {
    for (let i = 0; i < 4; i++) {
      let column = [
        parseInt(squares[i].innerHTML),
        parseInt(squares[i + width].innerHTML),
        parseInt(squares[i + width * 2].innerHTML),
        parseInt(squares[i + width * 3].innerHTML),
      ];

      let filteredColumn = column.filter((num) => num);
      let missing = 4 - filteredColumn.length;
      let zeros = Array(missing).fill(0);
      let newColumn = filteredColumn.concat(zeros);

      squares[i].innerHTML = newColumn[0];
      squares[i + width].innerHTML = newColumn[1];
      squares[i + width * 2].innerHTML = newColumn[2];
      squares[i + width * 3].innerHTML = newColumn[3];
    }
  }

  function moveDown() {
    for (let i = 0; i < 4; i++) {
      let column = [
        parseInt(squares[i].innerHTML),
        parseInt(squares[i + width].innerHTML),
        parseInt(squares[i + width * 2].innerHTML),
        parseInt(squares[i + width * 3].innerHTML),
      ];

      let filteredColumn = column.filter((num) => num);
      let missing = 4 - filteredColumn.length;
      let zeros = Array(missing).fill(0);
      let newColumn = zeros.concat(filteredColumn);

      squares[i].innerHTML = newColumn[0];
      squares[i + width].innerHTML = newColumn[1];
      squares[i + width * 2].innerHTML = newColumn[2];
      squares[i + width * 3].innerHTML = newColumn[3];
    }
  }

  /* ─── Combine row ─── */
  function combineRow() {
    for (let i = 0; i < 15; i++) {
      if (
        i % 4 !== 3 &&
        squares[i].innerHTML === squares[i + 1].innerHTML
      ) {
        let combinedTotal =
          parseInt(squares[i].innerHTML) +
          parseInt(squares[i + 1].innerHTML);

        squares[i].innerHTML = combinedTotal;
        squares[i + 1].innerHTML = 0;

        score += combinedTotal;

        if (scoreDisplay) {
          scoreDisplay.innerHTML = score;
        }
      }
    }

    checkForWin();
  }

  /* ─── Combine column ─── */
  function combineColumn() {
    for (let i = 0; i < 12; i++) {
      if (
        squares[i].innerHTML ===
        squares[i + width].innerHTML
      ) {
        let combinedTotal =
          parseInt(squares[i].innerHTML) +
          parseInt(squares[i + width].innerHTML);

        squares[i].innerHTML = combinedTotal;
        squares[i + width].innerHTML = 0;

        score += combinedTotal;

        if (scoreDisplay) {
          scoreDisplay.innerHTML = score;
        }
      }
    }

    checkForWin();
  }

  /* ─── Keyboard controls ─── */
  function control(e) {
    if (gameEnded) return;

    if (e.keyCode === 37) {
      keyLeft();
    } else if (e.keyCode === 38) {
      keyUp();
    } else if (e.keyCode === 39) {
      keyRight();
    } else if (e.keyCode === 40) {
      keyDown();
    }
  }

  document.addEventListener("keyup", control);

  /* ─── Move functions ─── */

  function keyRight() {
    moveRight();
    combineRow();
    moveRight();
    generate();

    // Update visual state immediately
    addColours();
  }

  function keyLeft() {
    moveLeft();
    combineRow();
    moveLeft();
    generate();

    // Update visual state immediately
    addColours();
  }

  function keyUp() {
    moveUp();
    combineColumn();
    moveUp();
    generate();

    // Update visual state immediately
    addColours();
  }

  function keyDown() {
    moveDown();
    combineColumn();
    moveDown();
    generate();

    // Update visual state immediately
    addColours();
  }

  /* ─── Touch / Swipe Controls ─── */

  let touchStartX = 0;
  let touchStartY = 0;

  gridDisplay.addEventListener(
    "touchstart",
    function (e) {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    },
    { passive: true }
  );

  gridDisplay.addEventListener(
    "touchend",
    function (e) {
      if (gameEnded) return;

      let dx =
        e.changedTouches[0].screenX - touchStartX;

      let dy =
        e.changedTouches[0].screenY - touchStartY;

      if (Math.abs(dx) < 30 && Math.abs(dy) < 30) {
        return;
      }

      if (Math.abs(dx) > Math.abs(dy)) {
        dx > 0 ? keyRight() : keyLeft();
      } else {
        dy > 0 ? keyDown() : keyUp();
      }
    },
    { passive: true }
  );

  /* ─── Win check ─── */
  function checkForWin() {
    for (let i = 0; i < squares.length; i++) {
      if (squares[i].innerHTML == 2048) {
        endGame("YOU WIN!");
        return;
      }
    }
  }

  /* ─── Game Over check ─── */
  function checkForGameOver() {
    let zeros = 0;

    for (let i = 0; i < squares.length; i++) {
      if (squares[i].innerHTML == 0) {
        zeros++;
      }
    }

    if (zeros === 0) {
      let canMove = false;

      for (let i = 0; i < 16; i++) {
        let val = parseInt(squares[i].innerHTML);

        // Check right
        if (
          i % 4 !== 3 &&
          val === parseInt(squares[i + 1].innerHTML)
        ) {
          canMove = true;
        }

        // Check down
        if (
          i < 12 &&
          val === parseInt(squares[i + width].innerHTML)
        ) {
          canMove = true;
        }
      }

      if (!canMove) {
        endGame("GAME OVER");
      }
    }
  }

  /* ─── End Game ─── */
  function endGame(message) {
    if (gameEnded) return;

    gameEnded = true;

    document.removeEventListener("keyup", control);

    clearInterval(myTimer);

    if (resultDisplay) {
      resultDisplay.innerHTML = message;
    }

    if (window.GameHub) {
      GameHub.showGameOver({
        gameId: "2048",
        score: score,
        title: message,
        onRestart: restartGame,
      });
    }
  }

  /* ─── Restart ─── */
  function restartGame() {
    gameEnded = false;
    score = 0;

    if (scoreDisplay) {
      scoreDisplay.innerHTML = 0;
    }

    if (resultDisplay) {
      resultDisplay.innerHTML =
        'Join the numbers and get to the <b>2048</b> tile!';
    }

    document.addEventListener("keyup", control);

    if (window.GameHub) {
      GameHub.Score.resetSession("2048");
      GameHub.hideGameOver();

      const saved = GameHub.Score.getScore("2048");

      bestScore = saved.bestScore || 0;

      if (bestScoreDisplay) {
        bestScoreDisplay.textContent = bestScore;
      }
    }

    createBoard();

    clearInterval(myTimer);
    myTimer = setInterval(addColours, 50);
  }

  /* ─── Restart Button ─── */
  if (restartBtn) {
    restartBtn.addEventListener("click", restartGame);
  }

  /* ─── Tile Colors ─── */
  function addColours() {
    for (let i = 0; i < squares.length; i++) {
      const val = parseInt(squares[i].innerHTML);

      /* ─────────────────────────────
         EMPTY TILE
         ─────────────────────────────

         IMPORTANT:
         Do NOT change textContent here.

         The internal value MUST remain 0.
         We only make the text invisible.
      */

      if (val === 0) {
        squares[i].style.color = "transparent";

        squares[i].style.backgroundColor =
          "rgba(139, 92, 246, 0.06)";

        squares[i].style.boxShadow = "none";

        continue;
      }

      /* ─────────────────────────────
         NON-EMPTY TILE
         ─────────────────────────────
      */

      squares[i].style.color =
        val <= 4 ? "#A9A3B8" : "#F8F7FF";

      if (val === 2) {
        squares[i].style.backgroundColor = "#1E1635";

        squares[i].style.boxShadow =
          "0 0 8px rgba(139, 92, 246, 0.1)";
      }

      else if (val === 4) {
        squares[i].style.backgroundColor = "#261C42";

        squares[i].style.boxShadow =
          "0 0 10px rgba(139, 92, 246, 0.15)";
      }

      else if (val === 8) {
        squares[i].style.backgroundColor = "#4C1D95";

        squares[i].style.boxShadow =
          "0 0 12px rgba(139, 92, 246, 0.2)";
      }

      else if (val === 16) {
        squares[i].style.backgroundColor = "#5B21B6";

        squares[i].style.boxShadow =
          "0 0 15px rgba(139, 92, 246, 0.25)";
      }

      else if (val === 32) {
        squares[i].style.backgroundColor = "#6D28D9";

        squares[i].style.boxShadow =
          "0 0 18px rgba(139, 92, 246, 0.3)";
      }

      else if (val === 64) {
        squares[i].style.backgroundColor = "#7C3AED";

        squares[i].style.boxShadow =
          "0 0 20px rgba(139, 92, 246, 0.35)";
      }

      else if (val === 128) {
        squares[i].style.backgroundColor = "#8B5CF6";

        squares[i].style.boxShadow =
          "0 0 24px rgba(139, 92, 246, 0.4)";
      }

      else if (val === 256) {
        squares[i].style.backgroundColor = "#A855F7";

        squares[i].style.boxShadow =
          "0 0 28px rgba(168, 85, 247, 0.45)";
      }

      else if (val === 512) {
        squares[i].style.backgroundColor = "#22D3EE";

        squares[i].style.boxShadow =
          "0 0 30px rgba(34, 211, 238, 0.4)";
      }

      else if (val === 1024) {
        squares[i].style.backgroundColor = "#34D399";

        squares[i].style.boxShadow =
          "0 0 35px rgba(52, 211, 153, 0.4)";
      }

      else if (val === 2048) {
        squares[i].style.backgroundColor = "#F59E0B";

        squares[i].style.boxShadow =
          "0 0 40px rgba(245, 158, 11, 0.5)";

        squares[i].style.color = "#050507";
      }

      /* ─── Update live best score ─── */

      if (score > bestScore) {
        bestScore = score;

        if (bestScoreDisplay) {
          bestScoreDisplay.textContent = bestScore;
        }
      }
    }
  }

  /* ─── Initial Styling ─── */
  addColours();

  /* ─── Background Tile Sync ─── */
  myTimer = setInterval(addColours, 50);
});