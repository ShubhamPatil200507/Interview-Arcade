/**
 * Interview Arcade — Services Automated Test Suite
 * Tests StorageService and ProgressService in isolation.
 */

import { storage } from '../js/services/storage.js';
import { progress, ACHIEVEMENT_DEFINITIONS } from '../js/services/progress.js';
import { mistakes } from '../js/services/mistakes.js';

export function runServicesTests(assert) {
  // Test StorageService
  assert.describe('StorageService', () => {
    storage.clearAllArcadeData();

    assert.equal(storage.get('non_existent', 42), 42, 'Returns default value for missing key');

    storage.set('test_key', { foo: 'bar', count: 7 });
    const retrieved = storage.get('test_key');
    assert.equal(retrieved.foo, 'bar', 'Stores and parses complex objects');
    assert.equal(retrieved.count, 7, 'Preserves numeric properties');

    storage.remove('test_key');
    assert.equal(storage.get('test_key', null), null, 'Removes key cleanly');
  });

  // Test ProgressService
  assert.describe('ProgressService', () => {
    progress.resetProgress();

    const emptyMetrics = progress.getMetrics();
    assert.equal(emptyMetrics.totalSessions, 0, 'Initial sessions count is 0');
    assert.equal(emptyMetrics.overallAccuracy, 0, 'Initial accuracy is 0%');

    // Record session 1 (TicTacToe)
    const result1 = progress.recordSession({
      gameId: 'tictactoe',
      gameTitle: 'Tic Tac Toe + OOP Quiz',
      difficulty: 'medium',
      durationSeconds: 45,
      score: 120,
      maxScore: 200,
      questionsAnswered: 4,
      correctAnswers: 3,
      incorrectAnswers: 1,
      tags: ['OOP']
    });

    assert.ok(result1 && result1.session, 'Successfully recorded valid session');
    assert.equal(result1.newlyUnlocked.length, 1, 'Unlocked "first_coin" milestone achievement');
    assert.equal(result1.newlyUnlocked[0].id, 'first_coin', 'Milestone ID matches first_coin');

    // Deduplication test: Immediate duplicate submission should be rejected
    const dupResult = progress.recordSession({
      gameId: 'tictactoe',
      timestamp: result1.session.timestamp,
      score: 120
    });
    assert.equal(dupResult, null, 'Deduplication rejects immediate identical duplicate session');

    // Record session 2 (DSA Match)
    progress.recordSession({
      gameId: 'dsa-match',
      gameTitle: 'DSA Match the Following',
      difficulty: 'hard',
      durationSeconds: 60,
      score: 90,
      maxScore: 100,
      questionsAnswered: 4,
      correctAnswers: 4,
      incorrectAnswers: 0,
      tags: ['DSA', 'Big-O']
    });

    const updatedMetrics = progress.getMetrics();
    assert.equal(updatedMetrics.totalSessions, 2, 'Total sessions count updated to 2');
    assert.equal(updatedMetrics.totalQuestionsAnswered, 8, 'Total questions answered is 8 (4 + 4)');
    assert.equal(updatedMetrics.totalCorrect, 7, 'Total correct answers is 7 (3 + 4)');
    // Accuracy = 7 / 8 = 87.5% -> round to 88%
    assert.equal(updatedMetrics.overallAccuracy, 88, 'Calculates genuine rounded accuracy (88%)');

    // Verify unlocked achievements contain first_coin and dsa_tactician
    const unlocked = progress.getUnlockedAchievements();
    assert.ok(unlocked.includes('first_coin'), 'Includes first_coin achievement');
    assert.ok(unlocked.includes('dsa_tactician'), 'Includes dsa_tactician achievement');

    // Test safe reset
    progress.resetProgress();
    const resetMetrics = progress.getMetrics();
    assert.equal(resetMetrics.totalSessions, 0, 'Sessions reset back to 0');
    assert.equal(progress.getUnlockedAchievements().length, 0, 'Achievements cleared on reset');
  });

  // Test MistakesService
  assert.describe('MistakesService', () => {
    mistakes.clearAll();
    assert.equal(mistakes.getMistakes().length, 0, 'Initial mistakes notebook is empty');

    // Record mistake 1
    const rec1 = mistakes.recordMistake({
      challengeId: 'oop_m2',
      category: 'OOP',
      title: 'Liskov Substitution Violation',
      prompt: 'Which principle states subtypes must be substitutable?',
      studentAnswer: 'Open/Closed Principle',
      correctAnswer: 'Liskov Substitution Principle',
      explanation: 'LSP ensures derived classes do not break base class contracts.'
    });

    assert.ok(rec1 && rec1.id, 'Successfully logged mistake record');
    assert.equal(mistakes.getMistakes().length, 1, 'Mistakes count is 1');
    assert.equal(mistakes.getPending().length, 1, 'Pending mistakes count is 1');
    assert.equal(mistakes.getMastered().length, 0, 'Mastered mistakes count is 0');

    // Re-recording same challenge updates existing rather than duplicating
    mistakes.recordMistake({
      challengeId: 'oop_m2',
      category: 'OOP',
      studentAnswer: 'Single Responsibility Principle'
    });
    assert.equal(mistakes.getMistakes().length, 1, 'Deduplicates by challengeId');
    assert.equal(mistakes.getMistakes()[0].attempts, 2, 'Increments attempt counter to 2');

    // Mark as mastered
    const masteredSuccess = mistakes.markMastered('oop_m2');
    assert.ok(masteredSuccess, 'Marking mistake as mastered returns true');
    assert.equal(mistakes.getMastered().length, 1, 'Mastered mistakes count is now 1');
    assert.equal(mistakes.getPending().length, 0, 'Pending mistakes count is now 0');

    // Stats
    const stats = mistakes.getStats();
    assert.equal(stats.total, 1, 'Total stats match');
    assert.equal(stats.masteredCount, 1, 'Mastered count in stats is 1');

    // Clean clear
    mistakes.clearAll();
    assert.equal(mistakes.getMistakes().length, 0, 'Mistakes notebook cleared successfully');
  });
}
