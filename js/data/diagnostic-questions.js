/**
 * Interview Arcade — Diagnostic Skill Assessment Question Bank
 * Rapid 5-question multi-domain assessment used for initial skill calibration,
 * baseline mastery scoring, and personalized target-role recommendations.
 */

export const DIAGNOSTIC_QUESTIONS = [
  {
    id: 'diag_1',
    skill: 'oop',
    domain: 'Object-Oriented Design',
    prompt: 'In a microservice event handler, a class defines a method with the exact same name and parameter signatures as a virtual method in its base class. At runtime, the derived implementation executes when invoked through a base pointer. Which mechanism facilitates this behavior?',
    options: [
      'Static Early Binding via name mangling',
      'Dynamic Dispatch via Virtual Method Table (vtable / vptr)',
      'Compile-time Template Specialization',
      'Memory Slicing'
    ],
    correctIndex: 1,
    explanation: 'Dynamic dispatch (late binding) in C++ and Java uses a virtual method table (vtable). Each polymorphic object contains an internal vptr pointing to its class vtable to resolve method addresses at runtime.'
  },
  {
    id: 'diag_2',
    skill: 'sql',
    domain: 'Relational Databases',
    prompt: 'Consider an `orders` table. You need to identify all customers who placed more than 3 orders with an average total exceeding $150. Which SQL clause is required to filter this grouped aggregate condition?',
    options: [
      'WHERE count(id) > 3 AND avg(total) > 150',
      'HAVING count(id) > 3 AND avg(total) > 150',
      'ORDER BY count(id) > 3 AND avg(total) > 150',
      'GROUP FILTER count(id) > 3 AND avg(total) > 150'
    ],
    correctIndex: 1,
    explanation: 'The WHERE clause filters individual input rows before grouping. The HAVING clause is specifically executed after GROUP BY to filter aggregate groups based on group calculations.'
  },
  {
    id: 'diag_3',
    skill: 'dsa',
    domain: 'Algorithms & Data Structures',
    prompt: 'You must maintain a dynamic collection of 10,000,000 real-time temperature sensor readings while continually supporting: (1) finding the median temperature in O(1) time and (2) inserting new readings in O(log n) time. What data structure pairing is ideal?',
    options: [
      'Two heaps: a Max-Heap for the lower half and a Min-Heap for the upper half',
      'A single doubly linked list with a middle pointer',
      'A Hash Table with sorted keys',
      'A Circular Queue with binary search insertion'
    ],
    correctIndex: 0,
    explanation: 'The classic Two-Heap approach (Max-Heap for values <= median, Min-Heap for values > median) balances sizes within 1 element. Median lookup is O(1) from heap tops, and heap insertion takes O(log n).'
  },
  {
    id: 'diag_4',
    skill: 'aptitude',
    domain: 'Quantitative Aptitude',
    prompt: 'Pipe A can fill a reservoir in 6 hours, while Pipe B can fill it in 12 hours. A leak at the base empties the full reservoir in 24 hours. If all three operate concurrently starting with an empty reservoir, how long does it take to fill completely?',
    options: [
      '3 hours',
      '4 hours',
      '4.8 hours',
      '5.2 hours'
    ],
    correctIndex: 2,
    explanation: 'Net filling rate per hour = 1/6 + 1/12 - 1/24 = (4 + 2 - 1) / 24 = 5/24 reservoir per hour. Time to fill = 24 / 5 = 4.8 hours.'
  },
  {
    id: 'diag_5',
    skill: 'systems',
    domain: 'Systems & Memory Safety',
    prompt: 'Consider the following C++ function: `int* createArray() { int arr[5] = {1, 2, 3, 4, 5}; return arr; }`. Why will dereferencing the returned pointer in the caller lead to undefined behavior or segmentation fault?',
    options: [
      'Arrays in C++ must be passed by reference to avoid copying overhead.',
      '`arr` is allocated on the thread call stack and automatically deallocated when `createArray()` returns, leaving a dangling pointer.',
      'The array elements are integers instead of heap-allocated pointers.',
      'Return types of C++ functions cannot be pointer types without `unique_ptr`.'
    ],
    correctIndex: 1,
    explanation: 'Stack-allocated local variables are freed as soon as their enclosing scope exits. Returning the raw address of a local stack array leaves a dangling pointer pointing to reclaimed memory.'
  }
];
