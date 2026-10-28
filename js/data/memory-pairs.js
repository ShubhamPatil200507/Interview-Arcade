/**
 * Interview Arcade — Technical Memory Terms Bank
 * High-yield computer science definitions across Core CS domains.
 */

export const MEMORY_PAIRS = [
  // Easy Pairs (Foundational Concepts)
  {
    id: 'mem_1',
    category: 'Data Structures',
    difficulty: 'easy',
    term: 'Stack',
    definition: 'LIFO (Last In First Out) structure with O(1) push and pop at the top'
  },
  {
    id: 'mem_2',
    category: 'Data Structures',
    difficulty: 'easy',
    term: 'Queue',
    definition: 'FIFO (First In First Out) structure with enqueue at rear and dequeue at front'
  },
  {
    id: 'mem_3',
    category: 'Algorithms',
    difficulty: 'easy',
    term: 'Binary Search',
    definition: 'O(log n) search algorithm that halves the search space in a sorted array'
  },
  {
    id: 'mem_4',
    category: 'Databases',
    difficulty: 'easy',
    term: 'Primary Key',
    definition: 'Unique column constraint that non-nullably identifies each row in a table'
  },
  {
    id: 'mem_5',
    category: 'OOP',
    difficulty: 'easy',
    term: 'Polymorphism',
    definition: 'Ability of different classes to respond to the same interface or method call'
  },
  {
    id: 'mem_6',
    category: 'Operating Systems',
    difficulty: 'easy',
    term: 'Deadlock',
    definition: 'State where two or more processes are permanently blocked waiting for each other\'s held resources'
  },

  // Medium Pairs (Core Interview Standards)
  {
    id: 'mem_7',
    category: 'Algorithms',
    difficulty: 'medium',
    term: 'Quick Sort',
    definition: 'Divide-and-conquer sort with average O(n log n) time using a partitioning pivot'
  },
  {
    id: 'mem_8',
    category: 'Data Structures',
    difficulty: 'medium',
    term: 'Hash Map',
    definition: 'Key-value container providing average O(1) lookups via a hashing function'
  },
  {
    id: 'mem_9',
    category: 'Operating Systems',
    difficulty: 'medium',
    term: 'Virtual Memory',
    definition: 'Hardware-assisted abstraction presenting a contiguous address space backed by RAM and disk paging'
  },
  {
    id: 'mem_10',
    category: 'Networking',
    difficulty: 'medium',
    term: 'TCP 3-Way Handshake',
    definition: 'SYN, SYN-ACK, ACK connection establishment ensuring sequence synchronization and reliability'
  },
  {
    id: 'mem_11',
    category: 'Databases',
    difficulty: 'medium',
    term: 'ACID Properties',
    definition: 'Atomicity, Consistency, Isolation, and Durability guarantees for database transactions'
  },
  {
    id: 'mem_12',
    category: 'Networking',
    difficulty: 'medium',
    term: 'DNS',
    definition: 'Hierarchical decentralized naming system translating human hostnames into IP addresses'
  },

  // Hard Pairs (Advanced Systems & Architecture)
  {
    id: 'mem_13',
    category: 'System Design',
    difficulty: 'hard',
    term: 'CAP Theorem',
    definition: 'Distributed storage trade-off: in presence of a partition (P), choose Consistency (C) or Availability (A)'
  },
  {
    id: 'mem_14',
    category: 'Operating Systems',
    difficulty: 'hard',
    term: 'Copy-on-Write (CoW)',
    definition: 'Optimization delaying memory duplication during fork() until a process attempts modification'
  },
  {
    id: 'mem_15',
    category: 'Data Structures',
    difficulty: 'hard',
    term: 'B+ Tree',
    definition: 'Self-balancing n-ary tree with all values in linked leaf nodes, optimal for disk-based databases'
  },
  {
    id: 'mem_16',
    category: 'System Design',
    difficulty: 'hard',
    term: 'Consistent Hashing',
    definition: 'Ring-based key distribution minimizing rehashing churn when cache nodes scale up or fail'
  },
  {
    id: 'mem_17',
    category: 'Databases',
    difficulty: 'hard',
    term: 'Write-Ahead Log (WAL)',
    definition: 'Append-only log where transactions are recorded prior to flushing dirty pages to data files'
  },
  {
    id: 'mem_18',
    category: 'Algorithms',
    difficulty: 'hard',
    term: 'Trie (Prefix Tree)',
    definition: 'Tree where node paths represent shared string prefixes, enabling O(L) autocomplete lookup'
  }
];
