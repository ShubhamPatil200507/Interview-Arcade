/**
 * Interview Arcade — Progress Service
 * Honest progress calculation, session persistence, personal bests, and genuine achievements.
 * Zero invented or hardcoded metrics.
 */

import { storage } from './storage.js';

const SESSIONS_KEY = 'arcade_sessions';
const ACHIEVEMENTS_KEY = 'arcade_achievements';

// Defined system achievements based on verified milestones
export const ACHIEVEMENT_DEFINITIONS = [
  {
    id: 'first_coin',
    title: 'Inserted First Coin',
    description: 'Completed your very first mini-game session.',
    icon: '🪙'
  },
  {
    id: 'streak_5',
    title: 'Arcade Regular',
    description: 'Completed 5 game sessions across any categories.',
    icon: '🕹️'
  },
  {
    id: 'perfect_run',
    title: 'Flawless Strategy',
    description: 'Achieved 100% accuracy in any quiz challenge.',
    icon: '✨'
  },
  {
    id: 'dsa_tactician',
    title: 'Big-O Tactician',
    description: 'Scored 80% or higher in DSA Match the Following.',
    icon: '📊'
  },
  {
    id: 'sql_master',
    title: 'Query Commander',
    description: 'Successfully completed the SQL Query challenge.',
    icon: '🗄️'
  },
  {
    id: 'bug_hunter',
    title: 'Code Surgeon',
    description: 'Identified and fixed all bugs in a C++ Debugging session.',
    icon: '🐛'
  },
  {
    id: 'all_rounder',
    title: 'Full Stack Gamer',
    description: 'Completed sessions in at least 5 different mini-game modules.',
    icon: '🎖️'
  }
];

class ProgressService {
  constructor() {
    this._recentSessionIds = new Set();
  }

  getSessions() {
    return storage.get(SESSIONS_KEY, []);
  }

  recordSession(sessionData) {
    if (!sessionData || !sessionData.gameId) {
      console.warn('Attempted to record invalid session:', sessionData);
      return null;
    }

    const timestamp = sessionData.timestamp || Date.now();
    const score = Number(sessionData.score || 0);

    // Deduplication check: prevent duplicate saves on component rerender or double clicks
    const dedupeKey = `${sessionData.gameId}_${score}`;
    const sessions = this.getSessions();
    if (sessions.length > 0) {
      const last = sessions[0];
      if (last.gameId === sessionData.gameId && last.score === score && Math.abs(timestamp - last.timestamp) < 3000) {
        console.warn('Duplicate session within 3s suppressed:', dedupeKey);
        return null;
      }
    }

    if (this._recentSessionIds.has(dedupeKey)) {
      console.warn('Duplicate session suppressed by cache key:', dedupeKey);
      return null;
    }
    this._recentSessionIds.add(dedupeKey);
    setTimeout(() => this._recentSessionIds.delete(dedupeKey), 4000);

    const session = {
      id: 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      gameId: sessionData.gameId,
      gameTitle: sessionData.gameTitle || sessionData.gameId,
      difficulty: sessionData.difficulty || 'medium',
      timestamp,
      durationSeconds: Math.max(1, Math.round(sessionData.durationSeconds || 0)),
      score,
      maxScore: Number(sessionData.maxScore || sessionData.score || 100),
      questionsAnswered: Number(sessionData.questionsAnswered || 0),
      correctAnswers: Number(sessionData.correctAnswers || 0),
      incorrectAnswers: Number(sessionData.incorrectAnswers || 0),
      tags: Array.isArray(sessionData.tags) ? sessionData.tags : [],
      details: sessionData.details || null
    };

    sessions.unshift(session);
    // Keep last 150 sessions to stay lightweight
    if (sessions.length > 150) {
      sessions.pop();
    }
    storage.set(SESSIONS_KEY, sessions);

    // Evaluate real achievements
    const newlyUnlocked = this._evaluateAchievements(session, sessions);

    return { session, newlyUnlocked };
  }

  getMetrics() {
    const sessions = this.getSessions();
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        totalTimeSeconds: 0,
        totalQuestionsAnswered: 0,
        totalCorrect: 0,
        overallAccuracy: 0,
        uniqueGamesPlayed: 0,
        gameStats: {},
        recentSessions: []
      };
    }

    let totalTime = 0;
    let totalQuestions = 0;
    let totalCorrect = 0;
    const gameStats = {};
    const playedGameIds = new Set();

    sessions.forEach(s => {
      totalTime += s.durationSeconds;
      totalQuestions += s.questionsAnswered;
      totalCorrect += s.correctAnswers;
      playedGameIds.add(s.gameId);

      if (!gameStats[s.gameId]) {
        gameStats[s.gameId] = {
          gameTitle: s.gameTitle,
          sessionsCount: 0,
          bestScore: 0,
          maxScorePossible: s.maxScore,
          totalCorrect: 0,
          totalQuestions: 0,
          lastPlayed: s.timestamp
        };
      }
      const g = gameStats[s.gameId];
      g.sessionsCount += 1;
      if (s.score > g.bestScore) {
        g.bestScore = s.score;
        g.maxScorePossible = s.maxScore;
      }
      g.totalCorrect += s.correctAnswers;
      g.totalQuestions += s.questionsAnswered;
      if (s.timestamp > g.lastPlayed) {
        g.lastPlayed = s.timestamp;
      }
    });

    const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    return {
      totalSessions: sessions.length,
      totalTimeSeconds: totalTime,
      totalQuestionsAnswered: totalQuestions,
      totalCorrect,
      overallAccuracy,
      uniqueGamesPlayed: playedGameIds.size,
      gameStats,
      recentSessions: sessions.slice(0, 8)
    };
  }

  getUnlockedAchievements() {
    return storage.get(ACHIEVEMENTS_KEY, []);
  }

  _evaluateAchievements(currentSession, allSessions) {
    const existing = new Set(this.getUnlockedAchievements());
    const newlyUnlocked = [];

    const unlock = (id) => {
      if (!existing.has(id)) {
        existing.add(id);
        const def = ACHIEVEMENT_DEFINITIONS.find(a => a.id === id);
        if (def) {
          newlyUnlocked.push(def);
        }
      }
    };

    // 1. First Coin
    if (allSessions.length >= 1) {
      unlock('first_coin');
    }

    // 2. Streak 5
    if (allSessions.length >= 5) {
      unlock('streak_5');
    }

    // 3. Perfect Run
    if (currentSession.questionsAnswered >= 3 && currentSession.correctAnswers === currentSession.questionsAnswered) {
      unlock('perfect_run');
    }

    // 4. DSA Tactician
    if (currentSession.gameId === 'dsa-match' && (currentSession.score / currentSession.maxScore) >= 0.8) {
      unlock('dsa_tactician');
    }

    // 5. SQL Master
    if (currentSession.gameId === 'sql-blanks' && currentSession.correctAnswers >= 3) {
      unlock('sql_master');
    }

    // 6. Bug Hunter
    if (currentSession.gameId === 'debugger' && currentSession.score >= 80) {
      unlock('bug_hunter');
    }

    // 7. Full Stack Gamer
    const uniqueGames = new Set(allSessions.map(s => s.gameId));
    if (uniqueGames.size >= 5) {
      unlock('all_rounder');
    }

    if (newlyUnlocked.length > 0) {
      storage.set(ACHIEVEMENTS_KEY, Array.from(existing));
    }

    return newlyUnlocked;
  }

  resetProgress() {
    storage.remove(SESSIONS_KEY);
    storage.remove(ACHIEVEMENTS_KEY);
    return true;
  }
}

export const progress = new ProgressService();
