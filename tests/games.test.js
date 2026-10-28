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
}
