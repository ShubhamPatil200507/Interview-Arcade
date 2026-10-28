/**
 * Interview Arcade — C++ Debugging Challenges Bank
 * Verified snippets with realistic compiler, boundary, and memory safety defects.
 */

export const DEBUG_CHALLENGES = [
  // Easy: Off-by-one boundary defect
  {
    id: 'dbg_e1',
    difficulty: 'easy',
    title: 'Array Index Out-of-Bounds in Vector Loop',
    category: 'Boundary Condition',
    code: `1: int calculateSum(const std::vector<int>& nums) {
2:     int total = 0;
3:     for (size_t i = 0; i <= nums.size(); ++i) {
4:         total += nums[i];
5:     }
6:     return total;
7: }`,
    buggyLine: 3,
    options: [
      'Line 2: total is initialized to 0 instead of 1',
      'Line 3: Loop condition i <= nums.size() causes an off-by-one buffer overrun',
      'Line 4: += operator is not supported on vector elements',
      'Line 6: const reference prevents returning an int'
    ],
    correctOptionIndex: 1,
    explanation: 'Vectors in C++ are 0-indexed with valid indices from 0 to size() - 1. Using i <= nums.size() reads nums[nums.size()], which is undefined behavior and crashes with out-of-bounds.',
    fixSnippet: `for (size_t i = 0; i < nums.size(); ++i)`
  },

  // Medium: Dangling pointer / Returning local address
  {
    id: 'dbg_m1',
    difficulty: 'medium',
    title: 'Dangling Pointer to Stack Memory',
    category: 'Memory Management',
    code: `1: int* createCounter() {
2:     int count = 10;
3:     count += 5;
4:     return &count;
5: }
6: 
7: void run() {
8:     int* ptr = createCounter();
9:     std::cout << *ptr << std::endl;
10: }`,
    buggyLine: 4,
    options: [
      'Line 2: Stack integers cannot be assigned literals greater than 8',
      'Line 4: Returns the memory address of a local automatic stack variable that is destroyed upon function return',
      'Line 8: Missing static_cast<int*>',
      'Line 9: std::endl cannot flush pointers'
    ],
    correctOptionIndex: 1,
    explanation: 'Variable "count" is allocated on the call stack of createCounter(). When createCounter() exits, its stack frame is popped. Returning &count yields a dangling pointer referencing deallocated stack memory.',
    fixSnippet: `// Return by value instead of pointer:
int createCounter() {
    int count = 10;
    count += 5;
    return count;
}`
  },

  // Hard: Double Free / Rule of Three Violation
  {
    id: 'dbg_h1',
    difficulty: 'hard',
    title: 'Double Free from Shallow Copy Constructor',
    category: 'Resource Management (RAII)',
    code: `1: class StringHolder {
2: public:
3:     char* data;
4:     StringHolder(const char* s) {
5:         data = new char[strlen(s) + 1];
6:         strcpy(data, s);
7:     }
8:     ~StringHolder() {
9:         delete[] data;
10:    }
11:    // Note: Copy constructor NOT defined!
12: };
13: 
14: void printCopy(StringHolder copy) {
15:     std::cout << copy.data;
16: }`,
    buggyLine: 14,
    options: [
      'Line 5: strlen() does not include NULL terminator',
      'Line 9: delete[] must be replaced with free()',
      'Line 14: Passing by value triggers default shallow memberwise copy, leading to a double-free of "data" when both instances destruct',
      'Line 15: std::cout cannot output char*'
    ],
    correctOptionIndex: 2,
    explanation: 'Because StringHolder does not adhere to the Rule of Three/Five and lacks a custom deep-copy constructor, passing "copy" by value performs a shallow bitwise copy of the pointer "data". When printCopy ends, ~StringHolder() deletes data. When the caller\'s object exits, it calls delete[] on the already-freed pointer, corrupting the heap.',
    fixSnippet: `// Adhere to Rule of Five: delete copies or implement deep-copy:
StringHolder(const StringHolder& other) {
    data = new char[strlen(other.data) + 1];
    strcpy(data, other.data);
}`
  }
];
