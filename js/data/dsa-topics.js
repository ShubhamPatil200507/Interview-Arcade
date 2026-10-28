/**
 * Interview Arcade — DSA Matching Topics & Complexity Bank
 * Precise Big-O mappings and canonical interview problem scenarios.
 */

export const DSA_SETS = {
  easy: [
    {
      id: 'dsa_e1',
      concept: 'Array Lookup by Index',
      matchType: 'Time Complexity',
      correctMatch: 'O(1) Constant Time',
      explanation: 'Direct memory pointer arithmetic: address = base_address + (index × element_size).'
    },
    {
      id: 'dsa_e2',
      concept: 'Binary Search (Sorted Array)',
      matchType: 'Time Complexity',
      correctMatch: 'O(log n) Logarithmic Time',
      explanation: 'The search interval is repeatedly bisected at each iteration.'
    },
    {
      id: 'dsa_e3',
      concept: 'Linear Scan (Unsorted List)',
      matchType: 'Time Complexity',
      correctMatch: 'O(n) Linear Time',
      explanation: 'In the worst case, every element must be inspected sequentially.'
    },
    {
      id: 'dsa_e4',
      concept: 'Selection Sort',
      matchType: 'Time Complexity',
      correctMatch: 'O(n²) Quadratic Time',
      explanation: 'Two nested loops scanning remaining elements: n(n-1)/2 comparisons regardless of initial order.'
    }
  ],
  medium: [
    {
      id: 'dsa_m1',
      concept: 'Merge Sort Worst-Case Time',
      matchType: 'Complexity',
      correctMatch: 'O(n log n) Guaranteed',
      explanation: 'Recursively divides into 2 halves (log n levels), each level taking O(n) total merge work.'
    },
    {
      id: 'dsa_m2',
      concept: 'Hash Map Lookup (Average vs Worst)',
      matchType: 'Complexity',
      correctMatch: 'Average O(1), Worst O(n)',
      explanation: 'Average O(1) assuming uniform distribution; degrades to O(n) or O(log n) when collisions degrade buckets.'
    },
    {
      id: 'dsa_m3',
      concept: 'Breadth-First Search (Adjacency List)',
      matchType: 'Complexity',
      correctMatch: 'O(V + E) Time, O(V) Space',
      explanation: 'Visits every vertex V and traverses every edge E once; queue space stores up to O(V) frontier nodes.'
    },
    {
      id: 'dsa_m4',
      concept: 'Quick Sort Auxiliary Space',
      matchType: 'Complexity',
      correctMatch: 'O(log n) Average Stack Space',
      explanation: 'In-place array swapping; recursive call stack takes O(log n) on balanced partitions, O(n) worst.'
    }
  ],
  hard: [
    {
      id: 'dsa_h1',
      concept: 'Dijkstra\'s Algorithm with Min-Heap',
      matchType: 'Complexity',
      correctMatch: 'O((V + E) log V)',
      explanation: 'Each vertex is extracted from the priority queue in O(log V); edge relaxation takes O(E log V).'
    },
    {
      id: 'dsa_h2',
      concept: 'Tarjan\'s Strongly Connected Components',
      matchType: 'Complexity',
      correctMatch: 'O(V + E) Single DFS Pass',
      explanation: 'Maintains low-link values and a vertex stack during a single depth-first search traversal.'
    },
    {
      id: 'dsa_h3',
      concept: 'Trie Memory Complexity',
      matchType: 'Complexity',
      correctMatch: 'O(ALPHABET_SIZE × Key_Length × N)',
      explanation: 'Each node allocates an array or map of branch pointers for each potential alphabet character.'
    },
    {
      id: 'dsa_h4',
      concept: 'Floyd-Warshall All-Pairs Shortest Path',
      matchType: 'Complexity',
      correctMatch: 'O(V³) Time, O(V²) Space',
      explanation: 'Dynamic programming formulation over three nested loops iterating through intermediate vertices.'
    }
  ]
};
