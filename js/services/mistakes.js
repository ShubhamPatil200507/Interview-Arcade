/**
 * Interview Arcade — Mistakes & Error Notebook Service
 * Catalogs student mistakes across all games and provides pedagogical
 * review and mastery retesting.
 */

import { storage } from './storage.js';

const MISTAKES_KEY = 'arcade_mistakes';

class MistakesService {
  getMistakes() {
    return storage.get(MISTAKES_KEY, []);
  }

  recordMistake({
    challengeId,
    category = 'General',
    title = '',
    prompt = '',
    studentAnswer = '',
    correctAnswer = '',
    explanation = '',
    gameId = '',
    gameTitle = ''
  }) {
    if (!challengeId) return null;

    const mistakes = this.getMistakes();
    const existingIndex = mistakes.findIndex(m => m.challengeId === challengeId);

    const record = {
      id: existingIndex >= 0 ? mistakes[existingIndex].id : `err_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      challengeId,
      category,
      title: title || `Review: ${category}`,
      prompt,
      studentAnswer,
      correctAnswer,
      explanation,
      gameId,
      gameTitle,
      mastered: false,
      attempts: existingIndex >= 0 ? (mistakes[existingIndex].attempts || 1) + 1 : 1,
      lastRecorded: Date.now()
    };

    if (existingIndex >= 0) {
      mistakes[existingIndex] = record;
    } else {
      mistakes.unshift(record);
    }

    // Keep up to 100 mistakes
    if (mistakes.length > 100) {
      mistakes.pop();
    }

    storage.set(MISTAKES_KEY, mistakes);
    return record;
  }

  markMastered(challengeId) {
    const mistakes = this.getMistakes();
    const item = mistakes.find(m => m.challengeId === challengeId || m.id === challengeId);
    if (item) {
      item.mastered = true;
      item.masteredAt = Date.now();
      storage.set(MISTAKES_KEY, mistakes);
      return true;
    }
    return false;
  }

  getPending() {
    return this.getMistakes().filter(m => !m.mastered);
  }

  getMastered() {
    return this.getMistakes().filter(m => m.mastered);
  }

  getStats() {
    const all = this.getMistakes();
    const pending = all.filter(m => !m.mastered);
    const mastered = all.filter(m => m.mastered);

    const categories = {};
    all.forEach(m => {
      const cat = m.category || 'General';
      categories[cat] = (categories[cat] || 0) + 1;
    });

    return {
      total: all.length,
      pendingCount: pending.length,
      masteredCount: mastered.length,
      categories
    };
  }

  clearAll() {
    storage.remove(MISTAKES_KEY);
  }
}

export const mistakes = new MistakesService();
