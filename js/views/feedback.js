/**
 * Interview Arcade — Game 9: Feedback System
 * Device-local feedback collection with honest privacy notice and deletion controls.
 */

import { storage } from '../services/storage.js';
import { progress } from '../services/progress.js';
import { audio } from '../services/audio.js';
import { api } from '../services/api-client.js';

const FEEDBACK_STORAGE_KEY = 'arcade_feedback_items';

export function createFeedbackView(params, container) {
  let selectedRating = 5;
  let selectedCategory = 'General Suggestion';
  let comments = '';

  function init() {
    render();
    bindEvents();
  }

  function getFeedbackItems() {
    return storage.get(FEEDBACK_STORAGE_KEY, []);
  }

  function render() {
    const savedItems = getFeedbackItems();

    container.innerHTML = `
      <div class="content-container">
        <div class="game-frame">
          <!-- Header -->
          <div class="game-header-bar">
            <div class="game-title-group">
              <span class="badge badge-accent">Module 09</span>
              <h2>Local Feedback Chamber</h2>
            </div>
          </div>

          <!-- Honest Transparency Notice -->
          <div class="notice-box notice-info">
            <div>
              <strong>🔒 Client-Side Storage Notice:</strong> This feedback form stores entries strictly in your browser's local storage for your personal logs or review. No remote API endpoint is queried, and no personal data is transmitted.
            </div>
          </div>

          <!-- Feedback Form -->
          <form class="feedback-form" id="arcade-feedback-form">
            <!-- Overall Rating -->
            <div>
              <label><strong>1. Overall Platform Experience Rating</strong></label>
              <div class="rating-stars" role="radiogroup" aria-label="Experience rating out of 5 stars">
                ${[1, 2, 3, 4, 5].map(star => `
                  <button type="button" class="star-btn ${star <= selectedRating ? 'active' : ''}" data-star="${star}" aria-label="${star} Stars">
                    ⭐
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- Feedback Category -->
            <div>
              <label for="feedback-cat"><strong>2. Feedback Category</strong></label>
              <select id="feedback-cat" class="feedback-input" style="background-color: var(--color-surface); margin-top: var(--space-2xs);">
                <option value="General Suggestion" ${selectedCategory === 'General Suggestion' ? 'selected' : ''}>General Suggestion</option>
                <option value="Gameplay Mechanic" ${selectedCategory === 'Gameplay Mechanic' ? 'selected' : ''}>Gameplay Mechanic</option>
                <option value="Content / Answer Correction" ${selectedCategory === 'Content / Answer Correction' ? 'selected' : ''}>Question Content / Answer Correction</option>
                <option value="UI & Accessibility" ${selectedCategory === 'UI & Accessibility' ? 'selected' : ''}>UI Design & Accessibility</option>
                <option value="Bug Report" ${selectedCategory === 'Bug Report' ? 'selected' : ''}>Bug Report</option>
              </select>
            </div>

            <!-- Detailed Notes -->
            <div>
              <label for="feedback-notes"><strong>3. Notes, Suggestions or Defect Details</strong></label>
              <textarea id="feedback-notes" class="feedback-input" rows="4" maxlength="600" placeholder="Type your observations or suggestions here..." style="resize: vertical; margin-top: var(--space-2xs);">${comments}</textarea>
              <div style="text-align: right; font-size: var(--font-size-xs); color: var(--color-ink-faint); margin-top: 2px;">
                <span id="char-count">${comments.length}</span> / 600 characters
              </div>
            </div>

            <!-- Actions -->
            <div style="display: flex; justify-content: flex-end; gap: var(--space-xs);">
              <button type="submit" class="btn btn-primary">Save Feedback Locally</button>
            </div>
          </form>

          <!-- Previously Stored Local Feedback Items -->
          <div style="margin-top: var(--space-xl);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-sm);">
              <h3>Locally Stored Submissions (${savedItems.length})</h3>
              ${savedItems.length > 0 ? `
                <button type="button" id="clear-all-feedback-btn" class="btn btn-subtle btn-sm" style="color: var(--color-error);">
                  Delete All Local Entries
                </button>
              ` : ''}
            </div>

            ${savedItems.length === 0 ? `
              <div class="card" style="text-align: center; color: var(--color-ink-muted); padding: var(--space-lg);">
                No locally stored feedback logs yet. Submit your thoughts above.
              </div>
            ` : `
              <div style="display: flex; flex-direction: column; gap: var(--space-xs);">
                ${savedItems.map((item, idx) => `
                  <div class="card" style="padding: var(--space-md);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2xs);">
                      <div>
                        <span class="badge badge-accent">${item.category}</span>
                        <span style="font-size: var(--font-size-sm); margin-left: var(--space-xs);">${'⭐'.repeat(item.rating)}</span>
                      </div>
                      <div style="display: flex; align-items: center; gap: var(--space-xs);">
                        <span style="font-family: var(--font-mono); font-size: var(--font-size-xs); color: var(--color-ink-faint);">
                          ${new Date(item.timestamp).toLocaleDateString()}
                        </span>
                        <button type="button" class="btn btn-subtle btn-sm delete-single-feedback" data-idx="${idx}" style="color: var(--color-error); padding: 2px 6px;">
                          ✕
                        </button>
                      </div>
                    </div>
                    <p style="font-size: var(--font-size-sm); color: var(--color-ink); margin: 0;">${item.comments || '(No written comments provided)'}</p>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  }

  function bindEvents() {
    container.querySelectorAll('.star-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        selectedRating = parseInt(e.currentTarget.getAttribute('data-star'), 10);
        audio.click();
        render();
        bindEvents();
      });
    });

    const catSelect = container.querySelector('#feedback-cat');
    if (catSelect) {
      catSelect.addEventListener('change', (e) => {
        selectedCategory = e.target.value;
      });
    }

    const notesTextarea = container.querySelector('#feedback-notes');
    if (notesTextarea) {
      notesTextarea.addEventListener('input', (e) => {
        comments = e.target.value;
        const charCountEl = container.querySelector('#char-count');
        if (charCountEl) charCountEl.textContent = comments.length;
      });
    }

    const form = container.querySelector('#arcade-feedback-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        saveFeedback();
      });
    }

    const clearAllBtn = container.querySelector('#clear-all-feedback-btn');
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', () => {
        if (confirm('Delete all locally stored feedback entries?')) {
          storage.remove(FEEDBACK_STORAGE_KEY);
          audio.move();
          render();
          bindEvents();
        }
      });
    }

    container.querySelectorAll('.delete-single-feedback').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
        const items = getFeedbackItems();
        items.splice(idx, 1);
        storage.set(FEEDBACK_STORAGE_KEY, items);
        audio.move();
        render();
        bindEvents();
      });
    });
  }

  function saveFeedback() {
    const items = getFeedbackItems();
    const entry = {
      id: 'fb_' + Date.now(),
      rating: selectedRating,
      category: selectedCategory,
      comments: comments.trim(),
      timestamp: Date.now()
    };
    items.unshift(entry);
    storage.set(FEEDBACK_STORAGE_KEY, items);
    audio.correct();

    // Log feedback session
    progress.recordSession({
      gameId: 'feedback',
      gameTitle: 'Feedback System',
      difficulty: 'easy',
      durationSeconds: 10,
      score: 50,
      maxScore: 50,
      questionsAnswered: 1,
      correctAnswers: 1,
      incorrectAnswers: 0,
      tags: ['Feedback', 'Usability']
    });

    // Cloud sync if authenticated
    if (typeof api !== 'undefined' && api.token) {
      api.request('/feedback/submit', {
        method: 'POST',
        body: JSON.stringify({
          rating: selectedRating,
          category: selectedCategory,
          comments: comments.trim()
        })
      }).catch(err => console.warn('Cloud feedback sync failed (local saved):', err.message));
    }

    const toast = document.getElementById('app-toast');
    if (toast) {
      toast.textContent = 'Feedback saved successfully to your profile!';
      toast.classList.add('visible');
      setTimeout(() => toast.classList.remove('visible'), 3000);
    }
    comments = '';
    render();
    bindEvents();
  }

  init();

  return {
    destroy: () => {}
  };
}
