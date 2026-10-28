/**
 * Interview Arcade — Game 2: Technical Memory Match
 * Tactile card flipping, term-to-definition matching, difficulty scaling, and timer.
 */

import { MEMORY_PAIRS } from '../data/memory-pairs.js';
import { progress } from '../services/progress.js';
import { audio } from '../services/audio.js';

export function createMemoryView(params, container) {
  let difficulty = 'easy'; // 'easy' (6 pairs), 'medium' (8 pairs), 'hard' (12 pairs)
  let cards = [];
  let flippedCards = [];
  let matchedPairsCount = 0;
  let totalPairsNeeded = 6;
  let moves = 0;
  let timerInterval = null;
  let elapsedSeconds = 0;
  let isLocked = false;
  let isGameWon = false;

  function init() {
    setupGame();
    render();
    bindEvents();
    startTimer();
  }

  function setupGame() {
    clearInterval(timerInterval);
    elapsedSeconds = 0;
    moves = 0;
    matchedPairsCount = 0;
    flippedCards = [];
    isLocked = false;
    isGameWon = false;

    totalPairsNeeded = difficulty === 'hard' ? 12 : difficulty === 'medium' ? 8 : 6;

    // Filter or select pool of terms
    const availablePool = [...MEMORY_PAIRS];
    // Shuffle pool
    availablePool.sort(() => Math.random() - 0.5);
    const selectedPairs = availablePool.slice(0, totalPairsNeeded);

    // Create 2 cards per pair (one term, one definition)
    cards = [];
    selectedPairs.forEach((pair, idx) => {
      cards.push({
        uid: `term_${idx}`,
        pairId: pair.id,
        type: 'Term',
        category: pair.category,
        text: pair.term,
        isFlipped: false,
        isMatched: false
      });
      cards.push({
        uid: `def_${idx}`,
        pairId: pair.id,
        type: 'Definition',
        category: pair.category,
        text: pair.definition,
        isFlipped: false,
        isMatched: false
      });
    });

    // Shuffle cards
    cards.sort(() => Math.random() - 0.5);
  }

  function render() {
    container.innerHTML = `
      <div class="content-container">
        <div class="game-frame">
          <!-- Game Header -->
          <div class="game-header-bar">
            <div class="game-title-group">
              <span class="badge badge-accent">Computer Science</span>
              <h2>Technical Memory Match</h2>
            </div>
            <div class="game-controls-bar">
              <div class="difficulty-selector" role="group" aria-label="Game Difficulty">
                <button type="button" class="diff-btn ${difficulty === 'easy' ? 'active' : ''}" data-diff="easy">Easy (6 Pairs)</button>
                <button type="button" class="diff-btn ${difficulty === 'medium' ? 'active' : ''}" data-diff="medium">Medium (8 Pairs)</button>
                <button type="button" class="diff-btn ${difficulty === 'hard' ? 'active' : ''}" data-diff="hard">Hard (12 Pairs)</button>
              </div>
              <button type="button" id="restart-memory-btn" class="btn btn-sm btn-subtle">Reshuffle & Restart</button>
            </div>
          </div>

          <!-- Stats Status Bar -->
          <div class="ttt-status-card" style="justify-content: space-around;">
            <div>
              <span class="stat-label">Timer</span>
              <div id="memory-timer" style="font-family: var(--font-mono); font-weight: bold; font-size: var(--font-size-md);">00:00</div>
            </div>
            <div>
              <span class="stat-label">Moves</span>
              <div id="memory-moves" style="font-family: var(--font-mono); font-weight: bold; font-size: var(--font-size-md);">${moves}</div>
            </div>
            <div>
              <span class="stat-label">Pairs Matched</span>
              <div id="memory-matched" style="font-family: var(--font-mono); font-weight: bold; font-size: var(--font-size-md); color: var(--color-success);">
                ${matchedPairsCount} / ${totalPairsNeeded}
              </div>
            </div>
          </div>

          <!-- Card Grid -->
          <div class="memory-grid grid-${difficulty}" role="region" aria-label="Memory Card Grid">
            ${cards.map((c, i) => `
              <button type="button" 
                      class="memory-card ${c.isFlipped ? 'flipped' : ''} ${c.isMatched ? 'matched' : ''}" 
                      data-index="${i}"
                      aria-label="Card ${i+1}: ${c.isFlipped || c.isMatched ? c.type + ' ' + c.text : 'Face down'}"
                      ${c.isMatched ? 'disabled' : ''}>
                <div class="card-face card-back"></div>
                <div class="card-face card-front">
                  <span class="card-type-tag">${c.category} • ${c.type}</span>
                  <div class="card-text">${c.text}</div>
                </div>
              </button>
            `).join('')}
          </div>

          <!-- Victory Banner -->
          <div id="memory-victory-banner" style="display: none;" class="notice-box notice-success"></div>
        </div>
      </div>
    `;
  }

  function bindEvents() {
    container.querySelectorAll('.diff-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        difficulty = e.target.getAttribute('data-diff');
        audio.click();
        setupGame();
        render();
        bindEvents();
        startTimer();
      });
    });

    const restartBtn = container.querySelector('#restart-memory-btn');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        audio.click();
        setupGame();
        render();
        bindEvents();
        startTimer();
      });
    }

    container.querySelectorAll('.memory-card').forEach(cardEl => {
      cardEl.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.getAttribute('data-index'), 10);
        handleCardClick(index);
      });
    });
  }

  function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      elapsedSeconds += 1;
      const timerEl = container.querySelector('#memory-timer');
      if (timerEl) {
        const mins = String(Math.floor(elapsedSeconds / 60)).padStart(2, '0');
        const secs = String(elapsedSeconds % 60).padStart(2, '0');
        timerEl.textContent = `${mins}:${secs}`;
      }
    }, 1000);
  }

  function handleCardClick(index) {
    if (isLocked || isGameWon) return;
    const card = cards[index];
    if (card.isFlipped || card.isMatched) return;

    // Flip this card
    card.isFlipped = true;
    flippedCards.push({ card, index });
    audio.cardFlip();

    const cardEl = container.querySelector(`.memory-card[data-index="${index}"]`);
    if (cardEl) {
      cardEl.classList.add('flipped');
      cardEl.setAttribute('aria-label', `Card ${index+1}: ${card.type} ${card.text}`);
    }

    if (flippedCards.length === 2) {
      moves += 1;
      const movesEl = container.querySelector('#memory-moves');
      if (movesEl) movesEl.textContent = moves;

      evaluateMatch();
    }
  }

  function evaluateMatch() {
    isLocked = true;
    const [c1, c2] = flippedCards;

    if (c1.card.pairId === c2.card.pairId) {
      // MATCH!
      c1.card.isMatched = true;
      c2.card.isMatched = true;
      matchedPairsCount += 1;
      audio.correct();

      setTimeout(() => {
        const el1 = container.querySelector(`.memory-card[data-index="${c1.index}"]`);
        const el2 = container.querySelector(`.memory-card[data-index="${c2.index}"]`);
        if (el1) {
          el1.classList.add('matched');
          el1.disabled = true;
        }
        if (el2) {
          el2.classList.add('matched');
          el2.disabled = true;
        }

        const matchedEl = container.querySelector('#memory-matched');
        if (matchedEl) matchedEl.textContent = `${matchedPairsCount} / ${totalPairsNeeded}`;

        flippedCards = [];
        isLocked = false;

        if (matchedPairsCount === totalPairsNeeded) {
          handleVictory();
        }
      }, 500);
    } else {
      // MISMATCH
      audio.wrong();
      setTimeout(() => {
        c1.card.isFlipped = false;
        c2.card.isFlipped = false;
        const el1 = container.querySelector(`.memory-card[data-index="${c1.index}"]`);
        const el2 = container.querySelector(`.memory-card[data-index="${c2.index}"]`);
        if (el1) el1.classList.remove('flipped');
        if (el2) el2.classList.remove('flipped');

        flippedCards = [];
        isLocked = false;
      }, 900);
    }
  }

  function handleVictory() {
    isGameWon = true;
    clearInterval(timerInterval);
    audio.win();

    // Accuracy and score calculation
    // Perfect score = totalPairsNeeded moves
    const accuracy = Math.min(100, Math.round((totalPairsNeeded / moves) * 100));
    const baseScore = difficulty === 'hard' ? 180 : difficulty === 'medium' ? 120 : 80;
    const timePenalty = Math.min(30, Math.floor(elapsedSeconds / 5));
    const finalScore = Math.max(20, baseScore + Math.round(accuracy * 0.5) - timePenalty);

    progress.recordSession({
      gameId: 'memory',
      gameTitle: 'Technical Memory Match',
      difficulty,
      durationSeconds: elapsedSeconds,
      score: finalScore,
      maxScore: 200,
      questionsAnswered: moves,
      correctAnswers: totalPairsNeeded,
      incorrectAnswers: Math.max(0, moves - totalPairsNeeded),
      tags: ['Memory', 'Definitions', 'Core CS']
    });

    const banner = container.querySelector('#memory-victory-banner');
    if (banner) {
      banner.style.display = 'block';
      banner.innerHTML = `
        <div style="width: 100%;">
          <h3>Arcade Match Complete!</h3>
          <p style="margin: var(--space-2xs) 0;">
            Matched all <strong>${totalPairsNeeded} technical concept pairs</strong> in <strong>${moves} moves</strong> (${elapsedSeconds}s) with <strong>${accuracy}% efficiency</strong>!
          </p>
          <p style="font-size: var(--font-size-xs); color: var(--color-ink-faint);">
            Score Awarded: <strong>${finalScore} pts</strong>. Logged to your Progress Dashboard.
          </p>
          <div style="margin-top: var(--space-sm); display: flex; gap: var(--space-xs);">
            <button type="button" id="memory-play-again" class="btn btn-primary btn-sm">Play Again</button>
            <a href="#/dashboard" class="btn btn-subtle btn-sm">View in Dashboard</a>
          </div>
        </div>
      `;
      banner.querySelector('#memory-play-again').addEventListener('click', () => {
        setupGame();
        render();
        bindEvents();
        startTimer();
      });
      banner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  init();

  return {
    destroy: () => {
      clearInterval(timerInterval);
    }
  };
}
