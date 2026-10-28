/**
 * Interview Arcade — Game Logic Automated Tests
 * Tests algorithmic components: TicTacToe win evaluation, Resume tokenization, and DSA matching.
 */

import { SKILL_CATEGORIES } from '../js/data/resume-dictionaries.js';

export function runGameLogicTests(assert) {
  // 1. Tic Tac Toe Win Detection Logic
  assert.describe('TicTacToe Win Detection Logic', () => {
    function checkWinner(b) {
      const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
      ];
      for (const [x, y, z] of lines) {
        if (b[x] && b[x] === b[y] && b[x] === b[z]) return [x, y, z];
      }
      return null;
    }

    const emptyBoard = Array(9).fill(null);
    assert.equal(checkWinner(emptyBoard), null, 'Empty board has no winner');

    // Horizontal Row Win
    const rowWin = ['X', 'X', 'X', null, 'O', null, 'O', null, null];
    assert.deepEqual(checkWinner(rowWin), [0, 1, 2], 'Detects row 1 win for X');

    // Diagonal Win
    const diagWin = ['O', 'X', null, null, 'O', 'X', null, null, 'O'];
    assert.deepEqual(checkWinner(diagWin), [0, 4, 8], 'Detects main diagonal win for O');

    // Draw Board
    const drawBoard = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
    assert.equal(checkWinner(drawBoard), null, 'Full draw board returns null winner');
    assert.ok(drawBoard.every(c => c !== null), 'Identifies draw when board is full and no winner');
  });

  // 2. Resume Keyword Matcher Logic
  assert.describe('Resume Matcher Keyword Tokenizer', () => {
    function matchSkills(text, dictionary) {
      const lower = text.toLowerCase();
      const matched = [];
      dictionary.forEach(skill => {
        const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = /[\W_]$/.test(skill)
          ? new RegExp(`(?:^|[\\s,.;:!?/()])${escaped}(?=[\\s,.;:!?/()]|$)`, 'i')
          : new RegExp(`\\b${escaped}\\b`, 'i');
        if (regex.test(lower)) {
          matched.push(skill);
        }
      });
      return matched;
    }

    const sampleText = 'Experienced in Python, C++, and PostgreSQL with Docker deployment and Git.';
    const languages = SKILL_CATEGORIES.languages;
    const matchedLangs = matchSkills(sampleText, languages);

    assert.ok(matchedLangs.includes('python'), 'Matches "python"');
    assert.ok(matchedLangs.includes('c++'), 'Matches "c++" with special symbols');
    assert.ok(!matchedLangs.includes('java'), 'Does not match absent language "java"');

    const dbs = SKILL_CATEGORIES.databases;
    const matchedDBs = matchSkills(sampleText, dbs);
    assert.ok(matchedDBs.includes('postgresql'), 'Matches "postgresql"');
    assert.ok(!matchedDBs.includes('mongodb'), 'Does not match absent database "mongodb"');
  });

  // 3. Interview Evaluation & STAR Grading Logic
  assert.describe('Interview Scenario Scoring Logic', () => {
    function computeInterviewGrade(totalPoints, maxPoints) {
      const pct = Math.round((totalPoints / maxPoints) * 100);
      if (pct >= 85) return 'Strong Hire';
      if (pct >= 70) return 'Hire';
      if (pct >= 50) return 'Borderline';
      return 'No Hire';
    }

    assert.equal(computeInterviewGrade(550, 600), 'Strong Hire', '92% yields Strong Hire');
    assert.equal(computeInterviewGrade(450, 600), 'Hire', '75% yields Hire');
    assert.equal(computeInterviewGrade(320, 600), 'Borderline', '53% yields Borderline');
    assert.equal(computeInterviewGrade(200, 600), 'No Hire', '33% yields No Hire');
  });

  // 4. Diagnostic Role Recommendation Calibration
  assert.describe('Diagnostic Role Calibration Logic', () => {
    function recommendRole(domainScores) {
      if (domainScores.systems === 100 && domainScores.dsa === 100) return 'systems';
      if (domainScores.sql === 100 && domainScores.aptitude === 100) return 'data';
      if (domainScores.oop === 100 && domainScores.sql === 100) return 'backend';
      return 'fullstack';
    }

    assert.equal(
      recommendRole({ oop: 100, sql: 100, dsa: 0, aptitude: 0, systems: 0 }),
      'backend',
      'Strong OOP and SQL recommends backend track'
    );
    assert.equal(
      recommendRole({ oop: 0, sql: 0, dsa: 100, aptitude: 0, systems: 100 }),
      'systems',
      'Strong Systems and DSA recommends systems track'
    );
    assert.equal(
      recommendRole({ oop: 0, sql: 100, dsa: 0, aptitude: 100, systems: 0 }),
      'data',
      'Strong SQL and Aptitude recommends data track'
    );
    assert.equal(
      recommendRole({ oop: 0, sql: 0, dsa: 0, aptitude: 0, systems: 0 }),
      'fullstack',
      'Default/balanced profile recommends fullstack track'
    );
  });
}
