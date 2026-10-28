/**
 * Interview Arcade — SQL Query Challenges Bank
 * Real relational schemas, query fill-in-the-blanks, and rigorous database explanations.
 */

export const SQL_SCHEMAS = {
  employees: {
    tableName: 'employees',
    columns: ['id (INT)', 'name (VARCHAR)', 'department (VARCHAR)', 'salary (INT)', 'manager_id (INT)'],
    rows: [
      [101, 'Alice Vance', 'Engineering', 95000, 'NULL'],
      [102, 'Bob Chen', 'Engineering', 82000, 101],
      [103, 'Carol Danvers', 'Marketing', 74000, 'NULL'],
      [104, 'David Miller', 'Finance', 91000, 'NULL'],
      [105, 'Elena Rostova', 'Engineering', 88000, 101]
    ]
  },
  orders: {
    tableName: 'orders',
    columns: ['order_id (INT)', 'customer_id (INT)', 'order_date (DATE)', 'amount (DECIMAL)'],
    rows: [
      [1, 501, '2026-03-01', 250.00],
      [2, 502, '2026-03-02', 120.50],
      [3, 501, '2026-03-05', 400.00],
      [4, 503, '2026-03-07', 85.00]
    ]
  }
};

export const SQL_CHALLENGES = [
  // Easy
  {
    id: 'sql_e1',
    difficulty: 'easy',
    title: 'Basic Filtering with WHERE',
    schemaKey: 'employees',
    scenario: 'Retrieve names and salaries of all employees working in the "Engineering" department with salary > 85000.',
    queryTemplate: 'SELECT name, salary FROM employees WHERE department = \'Engineering\' ___ salary > 85000;',
    blankLabel: 'Logical Operator',
    acceptedAnswers: ['AND'],
    hint: 'Use the standard boolean conjunction operator when both conditions must evaluate to true.',
    explanation: 'The AND operator requires both predicates ("department = \'Engineering\'" AND "salary > 85000") to be satisfied.'
  },
  {
    id: 'sql_e2',
    difficulty: 'easy',
    title: 'Sorting and Limiting Results',
    schemaKey: 'employees',
    scenario: 'Find the single highest-paid employee by sorting descending and returning 1 row.',
    queryTemplate: 'SELECT name, salary FROM employees ORDER BY salary DESC ___ 1;',
    blankLabel: 'Row Constraint Keyword',
    acceptedAnswers: ['LIMIT'],
    hint: 'SQL clause used to restrict the count of returned tuples.',
    explanation: 'LIMIT 1 restricts the result set to the single top record after sorting by salary in descending order.'
  },

  // Medium
  {
    id: 'sql_m1',
    difficulty: 'medium',
    title: 'Aggregation with GROUP BY & HAVING',
    schemaKey: 'employees',
    scenario: 'List departments with an average salary exceeding 80,000.',
    queryTemplate: 'SELECT department, AVG(salary) FROM employees GROUP BY department ___ AVG(salary) > 80000;',
    blankLabel: 'Group Filter Keyword',
    acceptedAnswers: ['HAVING'],
    hint: 'WHERE filters rows before grouping; which clause filters groups after aggregation?',
    explanation: 'HAVING filters aggregate values calculated over groups, whereas WHERE only filters individual rows prior to grouping.'
  },
  {
    id: 'sql_m2',
    difficulty: 'medium',
    title: 'Null Value Handling',
    schemaKey: 'employees',
    scenario: 'Find all top-level executives who do not report to any manager (manager_id is NULL).',
    queryTemplate: 'SELECT name FROM employees WHERE manager_id ___ NULL;',
    blankLabel: 'Null Comparator',
    acceptedAnswers: ['IS', 'IS NOT FALSE'],
    hint: 'In SQL, NULL cannot be compared using the "=" operator due to 3-valued logic.',
    explanation: 'NULL represents an unknown value; standard equality (=) yields UNKNOWN. Always use IS NULL or IS NOT NULL.'
  },

  // Hard
  {
    id: 'sql_h1',
    difficulty: 'hard',
    title: 'Subqueries with Correlated NOT IN vs NOT EXISTS',
    schemaKey: 'orders',
    scenario: 'Retrieve orders where the customer amount exceeds the average amount of all orders.',
    queryTemplate: 'SELECT order_id, amount FROM orders WHERE amount > (___ AVG(amount) FROM orders);',
    blankLabel: 'Subquery Initiator',
    acceptedAnswers: ['SELECT'],
    hint: 'Scalar subqueries must be enclosed in parentheses and begin with the query keyword.',
    explanation: 'A scalar subquery returning a single aggregate average (SELECT AVG(amount) FROM orders) is evaluated and compared against each order amount.'
  },
  {
    id: 'sql_h2',
    difficulty: 'hard',
    title: 'Inner vs Outer Joins',
    schemaKey: 'orders',
    scenario: 'Perform a left outer join between customers and orders to retain customers with zero purchases.',
    queryTemplate: 'SELECT c.customer_id, o.order_id FROM customers c ___ JOIN orders o ON c.customer_id = o.customer_id;',
    blankLabel: 'Outer Join Direction',
    acceptedAnswers: ['LEFT', 'LEFT OUTER'],
    hint: 'Preserves all records from the left-hand table regardless of matches in the right table.',
    explanation: 'LEFT JOIN keeps every record from the left table ("customers") and fills unmatched right-table attributes with NULL.'
  }
];
