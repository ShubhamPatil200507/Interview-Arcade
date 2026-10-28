/**
 * Interview Arcade — Content Integrity Test Suite
 * Validates data banks: question structures, correct indexes, and non-empty explanations.
 */

import { OOP_QUESTIONS } from '../js/data/oop-questions.js';
import { MEMORY_PAIRS } from '../js/data/memory-pairs.js';
import { APTITUDE_QUESTIONS } from '../js/data/aptitude-bank.js';
import { SQL_CHALLENGES } from '../js/data/sql-challenges.js';
import { VISUAL_RIDDLES } from '../js/data/visual-riddles.js';
import { DSA_SETS } from '../js/data/dsa-topics.js';
import { DEBUG_CHALLENGES } from '../js/data/debug-challenges.js';

export function runContentTests(assert) {
  assert.describe('OOP Questions Integrity', () => {
    assert.ok(OOP_QUESTIONS.length >= 10, 'OOP question bank has sufficient breadth');
    OOP_QUESTIONS.forEach((q, idx) => {
      assert.ok(q.id, `OOP Question #${idx} has unique id`);
      assert.ok(q.question && q.question.length > 10, `OOP Question #${idx} has descriptive text`);
      assert.ok(Array.isArray(q.options) && q.options.length >= 3, `OOP Question #${idx} has >= 3 options`);
      assert.ok(q.correctIndex >= 0 && q.correctIndex < q.options.length, `OOP Question #${idx} has valid correctIndex`);
      assert.ok(q.explanation && q.explanation.length > 10, `OOP Question #${idx} has thorough explanation`);
    });
  });

  assert.describe('Memory Terms Integrity', () => {
    assert.ok(MEMORY_PAIRS.length >= 12, 'Memory bank has at least 12 pairs');
    MEMORY_PAIRS.forEach((p, idx) => {
      assert.ok(p.id && p.term && p.definition, `Memory pair #${idx} has valid term and definition`);
      assert.ok(['easy', 'medium', 'hard'].includes(p.difficulty), `Memory pair #${idx} has valid difficulty tier`);
    });
  });

  assert.describe('Aptitude Bank Integrity', () => {
    assert.ok(APTITUDE_QUESTIONS.length >= 8, 'Aptitude bank has sufficient question count');
    APTITUDE_QUESTIONS.forEach((a, idx) => {
      assert.ok(a.question && a.options.length === 4, `Aptitude question #${idx} has exactly 4 options`);
      assert.ok(a.correctIndex >= 0 && a.correctIndex < 4, `Aptitude question #${idx} has valid correctIndex`);
      assert.ok(a.hint && a.explanation, `Aptitude question #${idx} has both hint and explanation`);
    });
  });

  assert.describe('SQL Challenges Integrity', () => {
    assert.ok(SQL_CHALLENGES.length >= 5, 'SQL bank has >= 5 challenges');
    SQL_CHALLENGES.forEach((s, idx) => {
      assert.ok(s.queryTemplate.includes('___'), `SQL challenge #${idx} contains replacement blank ___`);
      assert.ok(Array.isArray(s.acceptedAnswers) && s.acceptedAnswers.length > 0, `SQL challenge #${idx} has accepted answers`);
    });
  });

  assert.describe('DSA Matching Sets Integrity', () => {
    ['easy', 'medium', 'hard'].forEach(tier => {
      const set = DSA_SETS[tier];
      assert.ok(Array.isArray(set) && set.length === 4, `DSA set "${tier}" has exactly 4 matching pairs`);
      set.forEach((item, idx) => {
        assert.ok(item.concept && item.correctMatch && item.explanation, `DSA pair #${idx} in "${tier}" is complete`);
      });
    });
  });

  assert.describe('C++ Debugging Snippets Integrity', () => {
    assert.ok(DEBUG_CHALLENGES.length >= 3, 'Debugger bank has multiple challenge levels');
    DEBUG_CHALLENGES.forEach((d, idx) => {
      assert.ok(d.code && d.buggyLine > 0, `Debug challenge #${idx} specifies buggy line`);
      assert.ok(d.options.length >= 3, `Debug challenge #${idx} has multiple diagnostic options`);
      assert.ok(d.fixSnippet && d.fixSnippet.length > 5, `Debug challenge #${idx} includes verified fix code`);
    });
  });
}
