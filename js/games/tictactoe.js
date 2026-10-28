/**
 * Interview Arcade — Game 1: Tic Tac Toe + OOP Quiz
 * Human vs Human or Human vs AI (Easy/Medium/Hard Minimax) with integrated OOP questions.
 */

import { OOP_QUESTIONS } from '../data/oop-questions.js';
import { progress } from '../services/progress.js';
import { audio } from '../services/audio.js';

export function createTicTacToeView(params, container) {
  let board = Array(9).fill(null);
  let currentPlayer = 'X'; // X is Human 1
  let gameMode = 'ai'; // 'ai' or 'pvp'
  let difficulty = 'medium'; // 'easy', 'medium', 'hard'
  let isGameOver = false;
  let moveCount = 0;
  let oopScore = 0;
  let oopAttempts = 0;
  let startTime = Date.now();
  let currentQuestion = null;
  let pendingCellIndex = null;

  function init() {
    render();
    bindEvents();
  }

  function render() {
    container.innerHTML = `
      <div class="content-container">
        <div class="game-frame">
          <!-- Game Header -->
          <div class="game-header-bar">
            <div class="game-title-group">
              <span class="badge badge-accent">Object-Oriented Design</span>
              <h2>Tic Tac Toe + OOP Quiz</h2>
            </div>
            <div class="game-controls-bar">
              <div class="difficulty-selector" role="group" aria-label="Game Difficulty">
                <button type="button" class="diff-btn ${difficulty === 'easy' ? 'active' : ''}" data-diff="easy">Easy AI</button>
                <button type="button" class="diff-btn ${difficulty === 'medium' ? 'active' : ''}" data-diff="medium">Medium AI</button>
                <button type="button" class="diff-btn ${difficulty === 'hard' ? 'active' : ''}" data-diff="hard">Minimax</button>
              </div>
              <button type="button" id="toggle-mode-btn" class="btn btn-sm btn-subtle">
                ${gameMode === 'ai' ? 'Switch to 2-Player (PvP)' : 'Switch to vs AI'}
              </button>
              <button type="button" id="reset-game-btn" class="btn btn-sm btn-subtle">Reset Round</button>
            </div>
          </div>

          <!-- Score & Turn Banner -->
          <div class="ttt-status-card">
            <div>
              <span class="stat-label">Turn</span>
              <div id="status-turn-text" style="font-weight: bold; font-size: var(--font-size-md);">
                Player X's Move
              </div>
            </div>
            <div style="margin-left: auto; display: flex; gap: var(--space-md); text-align: right;">
              <div>
                <span class="stat-label">OOP Quiz Score</span>
                <div style="font-family: var(--font-mono); font-weight: bold; color: var(--color-accent);">
                  <span id="quiz-score-val">${oopScore}</span> pts (${oopAttempts} answered)
                </div>
              </div>
            </div>
          </div>

          <!-- Board Area & Active Quiz Container -->
          <div class="grid-cards" style="grid-template-columns: 1fr; align-items: start;">
            <div class="ttt-grid-container">
              <div class="ttt-board" role="grid" aria-label="Tic Tac Toe 3 by 3 board">
                ${board.map((val, idx) => `
                  <button type="button" 
                          class="ttt-cell ${val === 'X' ? 'cell-x' : val === 'O' ? 'cell-o' : ''}" 
                          data-index="${idx}" 
                          aria-label="Row ${Math.floor(idx/3)+1}, Column ${(idx%3)+1}: ${val || 'Empty'}"
                          ${val || isGameOver ? 'disabled' : ''}>
                    ${val || ''}
                  </button>
                `).join('')}
              </div>
              <p style="font-size: var(--font-size-xs); color: var(--color-ink-faint); margin-top: var(--space-xs);">
                Tip: Answer an OOP challenge when placing strategic moves to earn bonus arcade points!
              </p>
            </div>

            <!-- Quiz Drawer (Appears on cell click) -->
            <div id="quiz-drawer" style="display: none;"></div>
          </div>

          <!-- End of Game Summary Banner (Hidden until round finish) -->
          <div id="round-summary-banner" style="display: none; margin-top: var(--space-md);" class="notice-box notice-info"></div>
        </div>
      </div>
    `;
  }

  function bindEvents() {
    container.querySelectorAll('.diff-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        difficulty = e.target.getAttribute('data-diff');
        audio.click();
        resetGame();
      });
    });

    const toggleModeBtn = container.querySelector('#toggle-mode-btn');
    if (toggleModeBtn) {
      toggleModeBtn.addEventListener('click', () => {
        gameMode = gameMode === 'ai' ? 'pvp' : 'ai';
        audio.click();
        resetGame();
      });
    }

    const resetBtn = container.querySelector('#reset-game-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        audio.click();
        resetGame();
      });
    }

    bindBoardClicks();
  }

  function bindBoardClicks() {
    container.querySelectorAll('.ttt-cell').forEach(cell => {
      cell.addEventListener('click', (e) => {
        if (isGameOver) return;
        const index = parseInt(e.currentTarget.getAttribute('data-index'), 10);
        if (board[index] !== null) return;

        // Prompt an OOP quiz challenge on move
        triggerOOPChallenge(index);
      });
    });
  }

  function triggerOOPChallenge(cellIndex) {
    pendingCellIndex = cellIndex;
    const questionsForDiff = OOP_QUESTIONS.filter(q => q.difficulty === difficulty);
    const pool = questionsForDiff.length > 0 ? questionsForDiff : OOP_QUESTIONS;
    currentQuestion = pool[Math.floor(Math.random() * pool.length)];

    const quizDrawer = container.querySelector('#quiz-drawer');
    quizDrawer.style.display = 'block';
    quizDrawer.innerHTML = `
      <div class="ttt-quiz-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-xs);">
          <span class="badge badge-accent">${currentQuestion.topic}</span>
          <span class="badge ${difficulty === 'hard' ? 'badge-hard' : difficulty === 'medium' ? 'badge-medium' : 'badge-easy'}">
            ${currentQuestion.difficulty.toUpperCase()}
          </span>
        </div>
        <h4 style="margin-bottom: var(--space-sm);">${currentQuestion.question}</h4>
        <div>
          ${currentQuestion.options.map((opt, i) => `
            <button type="button" class="quiz-option-btn" data-opt-idx="${i}">
              <strong>${String.fromCharCode(65 + i)}.</strong> ${opt}
            </button>
          `).join('')}
        </div>
      </div>
    `;

    quizDrawer.querySelectorAll('.quiz-option-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const selectedIdx = parseInt(e.currentTarget.getAttribute('data-opt-idx'), 10);
        handleQuizAnswer(selectedIdx);
      });
    });

    quizDrawer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function handleQuizAnswer(selectedIdx) {
    oopAttempts += 1;
    const isCorrect = selectedIdx === currentQuestion.correctIndex;
    const quizDrawer = container.querySelector('#quiz-drawer');

    if (isCorrect) {
      oopScore += (difficulty === 'hard' ? 30 : difficulty === 'medium' ? 20 : 10);
      audio.correct();
    } else {
      audio.wrong();
    }

    quizDrawer.innerHTML = `
      <div class="ttt-quiz-card" style="border-color: ${isCorrect ? 'var(--color-success)' : 'var(--color-error)'};">
        <h4 style="color: ${isCorrect ? 'var(--color-success)' : 'var(--color-error)'}; margin-bottom: var(--space-xs);">
          ${isCorrect ? '✓ Correct! Bonus Points Awarded!' : '✗ Incorrect Concept'}
        </h4>
        <p style="font-size: var(--font-size-sm); margin-bottom: var(--space-md);">${currentQuestion.explanation}</p>
        <button type="button" id="confirm-move-btn" class="btn btn-primary btn-sm">Confirm Board Move</button>
      </div>
    `;

    container.querySelector('#quiz-score-val').textContent = oopScore;

    const confirmBtn = quizDrawer.querySelector('#confirm-move-btn');
    confirmBtn.addEventListener('click', () => {
      quizDrawer.style.display = 'none';
      executePlayerMove(pendingCellIndex);
    });
  }

  function executePlayerMove(index) {
    board[index] = currentPlayer;
    moveCount += 1;
    audio.move();

    updateBoardUI();

    const winLine = checkWinner(board);
    if (winLine) {
      endGame(currentPlayer, winLine);
      return;
    }

    if (board.every(cell => cell !== null)) {
      endGame('draw', null);
      return;
    }

    // Switch turns
    if (gameMode === 'ai') {
      currentPlayer = 'O';
      updateStatusTurn();
      setTimeout(executeAIMove, 400);
    } else {
      currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
      updateStatusTurn();
    }
  }

  function executeAIMove() {
    if (isGameOver) return;
    let aiIndex = null;

    if (difficulty === 'easy') {
      aiIndex = getEasyAIMove();
    } else if (difficulty === 'medium') {
      aiIndex = getMediumAIMove();
    } else {
      aiIndex = getMinimaxMove();
    }

    if (aiIndex !== null && board[aiIndex] === null) {
      board[aiIndex] = 'O';
      moveCount += 1;
      audio.move();
      updateBoardUI();

      const winLine = checkWinner(board);
      if (winLine) {
        endGame('O', winLine);
        return;
      }
      if (board.every(cell => cell !== null)) {
        endGame('draw', null);
        return;
      }

      currentPlayer = 'X';
      updateStatusTurn();
    }
  }

  function getEasyAIMove() {
    const emptyIndices = board.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
    if (emptyIndices.length === 0) return null;
    return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  }

  function getMediumAIMove() {
    // 1. Can AI win right now?
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = 'O';
        if (checkWinner(board)) {
          board[i] = null;
          return i;
        }
        board[i] = null;
      }
    }
    // 2. Can Player X win next? Block them!
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = 'X';
        if (checkWinner(board)) {
          board[i] = null;
          return i;
        }
        board[i] = null;
      }
    }
    // 3. Take center if open
    if (board[4] === null) return 4;
    // 4. Otherwise random
    return getEasyAIMove();
  }

  function getMinimaxMove() {
    let bestScore = -Infinity;
    let bestMove = null;

    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = 'O';
        const score = minimax(board, 0, false);
        board[i] = null;
        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }
    return bestMove !== null ? bestMove : getEasyAIMove();
  }

  function minimax(currentBoard, depth, isMaximizing) {
    const win = checkWinner(currentBoard);
    if (win) {
      const winner = currentBoard[win[0]];
      return winner === 'O' ? 10 - depth : depth - 10;
    }
    if (currentBoard.every(c => c !== null)) {
      return 0;
    }

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (currentBoard[i] === null) {
          currentBoard[i] = 'O';
          const evalScore = minimax(currentBoard, depth + 1, false);
          currentBoard[i] = null;
          maxEval = Math.max(maxEval, evalScore);
        }
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (let i = 0; i < 9; i++) {
        if (currentBoard[i] === null) {
          currentBoard[i] = 'X';
          const evalScore = minimax(currentBoard, depth + 1, true);
          currentBoard[i] = null;
          minEval = Math.min(minEval, evalScore);
        }
      }
      return minEval;
    }
  }

  function checkWinner(b) {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6]             // Diagonals
    ];
    for (const [x, y, z] of lines) {
      if (b[x] && b[x] === b[y] && b[x] === b[z]) {
        return [x, y, z];
      }
    }
    return null;
  }

  function updateBoardUI() {
    container.querySelectorAll('.ttt-cell').forEach(cell => {
      const idx = parseInt(cell.getAttribute('data-index'), 10);
      cell.textContent = board[idx] || '';
      cell.classList.remove('cell-x', 'cell-o');
      if (board[idx] === 'X') cell.classList.add('cell-x');
      if (board[idx] === 'O') cell.classList.add('cell-o');
      if (board[idx] !== null || isGameOver) {
        cell.disabled = true;
      } else {
        cell.disabled = false;
      }
    });
  }

  function updateStatusTurn() {
    const textEl = container.querySelector('#status-turn-text');
    if (!textEl) return;
    if (isGameOver) return;
    textEl.textContent = currentPlayer === 'X' ? 'Player X\'s Turn' : gameMode === 'ai' ? 'Arcade AI Thinking...' : 'Player O\'s Turn';
  }

  function endGame(winner, winLine) {
    isGameOver = true;
    const duration = Math.round((Date.now() - startTime) / 1000);
    const summaryBanner = container.querySelector('#round-summary-banner');

    if (winLine) {
      winLine.forEach(idx => {
        const cell = container.querySelector(`.ttt-cell[data-index="${idx}"]`);
        if (cell) cell.classList.add('cell-win');
      });
    }

    if (winner === 'X') {
      audio.win();
    } else if (winner === 'O') {
      audio.wrong();
    }

    const totalCalculatedScore = (winner === 'X' ? 100 : winner === 'draw' ? 50 : 20) + oopScore;

    // Record session to progress service
    progress.recordSession({
      gameId: 'tictactoe',
      gameTitle: 'Tic Tac Toe + OOP Quiz',
      difficulty,
      durationSeconds: duration,
      score: totalCalculatedScore,
      maxScore: 200,
      questionsAnswered: oopAttempts,
      correctAnswers: Math.round(oopScore / (difficulty === 'hard' ? 30 : difficulty === 'medium' ? 20 : 10)),
      incorrectAnswers: Math.max(0, oopAttempts - Math.round(oopScore / 20)),
      tags: ['OOP', 'Minimax', 'Game Theory']
    });

    summaryBanner.style.display = 'block';
    summaryBanner.innerHTML = `
      <div style="width: 100%;">
        <h3>${winner === 'draw' ? 'Round Ended in a Draw!' : `Player ${winner} Won the Match!`}</h3>
        <p style="margin: var(--space-2xs) 0;">
          <strong>Total Score:</strong> ${totalCalculatedScore} pts (Board Result + ${oopScore} OOP Bonus)
        </p>
        <p style="font-size: var(--font-size-xs); color: var(--color-ink-faint);">
          Completed in ${duration}s. Session logged to your local Progress Dashboard.
        </p>
        <div style="margin-top: var(--space-sm); display: flex; gap: var(--space-xs);">
          <button type="button" id="play-again-btn" class="btn btn-primary btn-sm">Play Another Round</button>
          <a href="#/dashboard" class="btn btn-subtle btn-sm">View in Dashboard</a>
        </div>
      </div>
    `;

    summaryBanner.querySelector('#play-again-btn').addEventListener('click', resetGame);
  }

  function resetGame() {
    board = Array(9).fill(null);
    currentPlayer = 'X';
    isGameOver = false;
    moveCount = 0;
    oopScore = 0;
    oopAttempts = 0;
    startTime = Date.now();
    pendingCellIndex = null;
    currentQuestion = null;
    render();
    bindEvents();
  }

  init();

  return {
    destroy: () => {
      // Clean up references and prevent memory leaks
      board = null;
    }
  };
}
