/**
 * Interview Arcade — Adaptive Question Client & Repetition Elimination Service
 * Bridges frontend modules with backend dynamic question generation.
 * Handles seen question tracking, mistake revision queries, and offline fallbacks.
 */

import { api } from './api-client.js';

const SEEN_STORAGE_PREFIX = 'ia_seen_q_';
const MAX_SEEN_CACHE = 120;

class QuestionClient {
  /**
   * Retrieves array of question IDs previously seen in this chamber/game.
   */
  static getSeenQuestionIds(gameId) {
    try {
      if (typeof localStorage === 'undefined') return [];
      const raw = localStorage.getItem(`${SEEN_STORAGE_PREFIX}${gameId}`);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  /**
   * Persists a question ID to the client's seen list to avoid repeat delivery.
   */
  static recordSeenQuestion(gameId, questionId) {
    if (!questionId) return;
    try {
      if (typeof localStorage === 'undefined') return;
      const seen = this.getSeenQuestionIds(gameId);
      if (!seen.includes(questionId)) {
        seen.push(questionId);
        // Retain only latest MAX_SEEN_CACHE items
        const trimmed = seen.slice(-MAX_SEEN_CACHE);
        localStorage.setItem(`${SEEN_STORAGE_PREFIX}${gameId}`, JSON.stringify(trimmed));
      }
    } catch (e) {}
  }

  /**
   * Clears seen question history for a given game to restart fresh.
   */
  static clearSeenHistory(gameId) {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.removeItem(`${SEEN_STORAGE_PREFIX}${gameId}`);
    } catch (e) {}
  }

  /**
   * Requests a tailored batch of questions from the server.
   * Falls back gracefully to the provided static bank if offline or unreachable.
   */
  static async fetchQuestions({
    gameId,
    topic = null,
    subtopic = null,
    difficulty = 'all',
    count = 5,
    mode = 'fresh',
    fallbackBank = []
  }) {
    const seenIds = this.getSeenQuestionIds(gameId);

    // 1. Attempt server generation
    try {
      const response = await api.generateQuestions({
        game_id: gameId,
        topic: topic || undefined,
        subtopic: subtopic || undefined,
        difficulty: difficulty || 'all',
        count: Math.max(1, Math.min(20, count)),
        mode: mode || 'fresh',
        exclude_ids: mode === 'fresh' ? seenIds : []
      });

      if (response && Array.isArray(response.questions) && response.questions.length > 0) {
        // Record questions as seen
        response.questions.forEach(q => this.recordSeenQuestion(gameId, q.id));

        return {
          questions: response.questions,
          requestedCount: response.requested_count,
          deliveredCount: response.delivered_count,
          bankCount: response.bank_count,
          generatedCount: response.generated_count,
          isGenerated: response.generated_count > 0,
          message: response.message,
          mode: response.mode,
          isOfflineFallback: false
        };
      }
    } catch (err) {
      console.warn(`[QuestionClient] Server generation unavailable, using local bank fallback:`, err.message);
    }

    // 2. Offline / Local Bank Fallback
    return this._selectFromLocalBank({
      gameId,
      topic,
      difficulty,
      count,
      mode,
      seenIds,
      fallbackBank
    });
  }

  /**
   * Local selection logic for offline testing or disconnected environments.
   */
  static _selectFromLocalBank({
    gameId,
    topic,
    difficulty,
    count,
    mode,
    seenIds,
    fallbackBank = []
  }) {
    let pool = [...fallbackBank];

    // Filter by difficulty
    if (difficulty && difficulty !== 'all') {
      pool = pool.filter(q => (q.difficulty || '').toLowerCase() === difficulty.toLowerCase());
    }

    // Filter by topic
    if (topic && topic.trim()) {
      const lowerTopic = topic.toLowerCase();
      pool = pool.filter(q => (q.topic || '').toLowerCase().includes(lowerTopic) || (q.category || '').toLowerCase().includes(lowerTopic));
    }

    // Filter by unseen if in fresh mode
    if (mode === 'fresh' && seenIds && seenIds.length > 0) {
      const unseen = pool.filter(q => !seenIds.includes(q.id));
      if (unseen.length >= count) {
        pool = unseen;
      } else if (unseen.length > 0) {
        // Combine unseen first, then pad with oldest seen
        const seenItems = pool.filter(q => seenIds.includes(q.id));
        pool = [...unseen, ...seenItems];
      }
    }

    // Shuffle and slice
    const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, count);

    // Normalize format to match server QuestionItemResponse
    const normalized = shuffled.map(item => ({
      id: item.id,
      game_id: gameId,
      topic: item.topic || item.category || 'General',
      subtopic: item.subtopic || null,
      difficulty: item.difficulty || 'medium',
      question_type: item.acceptedAnswers ? 'sql_token' : (item.buggyLine !== undefined ? 'debug' : 'mcq'),
      prompt: item.question || item.queryTemplate || item.prompt || item.code || '',
      options: item.options || item.acceptedAnswers || [],
      metadata: {
        hint: item.hint || null,
        schemaKey: item.schemaKey || null,
        category: item.category || null,
        buggyLine: item.buggyLine || null,
        fixSnippet: item.fixSnippet || null
      },
      source: 'bank'
    }));

    // Record as seen
    normalized.forEach(q => this.recordSeenQuestion(gameId, q.id));

    return {
      questions: normalized,
      requestedCount: count,
      deliveredCount: normalized.length,
      bankCount: normalized.length,
      generatedCount: 0,
      isGenerated: false,
      message: null,
      mode,
      isOfflineFallback: true
    };
  }

  /**
   * Fetches candidate question attempt statistics and weak skills.
   */
  static async fetchHistory(gameId = null) {
    try {
      const data = await api.getQuestionHistory(gameId);
      if (data) return data;
    } catch (e) {
      console.warn(`[QuestionClient] Could not fetch question history from server:`, e.message);
    }
    return {
      total_attempted: 0,
      total_correct: 0,
      total_incorrect: 0,
      accuracy_rate: 0.0,
      by_game: {},
      weak_topics: []
    };
  }
}

export { QuestionClient };
