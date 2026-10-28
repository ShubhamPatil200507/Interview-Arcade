/**
 * Interview Arcade — CLI Automated Test Runner (Node.js)
 * Executes all test suites and prints summary with exit codes.
 */

// Simple assertion framework
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
let currentSuite = '';

const assert = {
  describe(name, fn) {
    currentSuite = name;
    console.log(`\n\x1b[1m\x1b[36m▶ Suite: ${name}\x1b[0m`);
    fn();
  },

  ok(val, message) {
    totalTests++;
    if (Boolean(val)) {
      passedTests++;
      console.log(`  \x1b[32m✓\x1b[0m ${message}`);
    } else {
      failedTests++;
      console.error(`  \x1b[31m✗\x1b[0m ${message} (Expected truthy, received: ${val})`);
    }
  },

  equal(actual, expected, message) {
    totalTests++;
    if (actual === expected) {
      passedTests++;
      console.log(`  \x1b[32m✓\x1b[0m ${message}`);
    } else {
      failedTests++;
      console.error(`  \x1b[31m✗\x1b[0m ${message} (Expected ${JSON.stringify(expected)}, received: ${JSON.stringify(actual)})`);
    }
  },

  deepEqual(actual, expected, message) {
    totalTests++;
    const actualStr = JSON.stringify(actual);
    const expectedStr = JSON.stringify(expected);
    if (actualStr === expectedStr) {
      passedTests++;
      console.log(`  \x1b[32m✓\x1b[0m ${message}`);
    } else {
      failedTests++;
      console.error(`  \x1b[31m✗\x1b[0m ${message} (Expected ${expectedStr}, received: ${actualStr})`);
    }
  }
};

// Polyfill window / localStorage for Node.js test environment
globalThis.window = {
  localStorage: (() => {
    let store = {};
    return {
      getItem: (k) => (k in store ? store[k] : null),
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: (k) => { delete store[k]; },
      clear: () => { store = {}; },
      get length() { return Object.keys(store).length; },
      key: (i) => Object.keys(store)[i] || null
    };
  })()
};

async function main() {
  console.log('\x1b[1m\x1b[35m=== INTERVIEW ARCADE AUTOMATED TEST SUITE ===\x1b[0m');

  const { runServicesTests } = await import('./services.test.js');
  const { runContentTests } = await import('./content.test.js');
  const { runGameLogicTests } = await import('./games.test.js');

  runServicesTests(assert);
  runContentTests(assert);
  runGameLogicTests(assert);

  console.log('\n\x1b[1m--------------------------------------------------\x1b[0m');
  console.log(`Total Assertions: ${totalTests}`);
  console.log(`\x1b[32mPassed: ${passedTests}\x1b[0m`);
  if (failedTests > 0) {
    console.error(`\x1b[31mFailed: ${failedTests}\x1b[0m`);
    process.exit(1);
  } else {
    console.log('\x1b[1m\x1b[32mALL TESTS PASSED SUCCESSFULLY! (100% Green)\x1b[0m\n');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Fatal test runner crash:', err);
  process.exit(1);
});
