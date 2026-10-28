/**
 * Interview Arcade — Quantitative Aptitude & Logical Reasoning Bank
 * Placement assessment standards with verified single-solution keys and step-by-step math.
 */

export const APTITUDE_QUESTIONS = [
  // Easy
  {
    id: 'apt_e1',
    category: 'Number Series',
    difficulty: 'easy',
    question: 'Find the next number in the sequence: 4, 9, 16, 25, 36, ?',
    options: ['47', '49', '50', '64'],
    correctIndex: 1,
    hint: 'Look at the squares of consecutive integers starting from 2.',
    explanation: 'The series consists of consecutive perfect squares: 2²=4, 3²=9, 4²=16, 5²=25, 6²=36. The next term is 7² = 49.'
  },
  {
    id: 'apt_e2',
    category: 'Percentages',
    difficulty: 'easy',
    question: 'A programmer sells an old GPU for $480, incurring a 20% loss on the original cost. What was the original cost price?',
    options: ['$560', '$600', '$580', '$620'],
    correctIndex: 1,
    hint: 'Selling price = Cost Price × (1 - Loss Percentage).',
    explanation: 'Selling Price = Cost Price × (1 - 0.20) = 0.80 × CP. Therefore CP = 480 / 0.80 = $600.'
  },
  {
    id: 'apt_e3',
    category: 'Logical Reasoning',
    difficulty: 'easy',
    question: 'If "LOGIC" is coded as "MPHID" (+1 to each letter), how is "STACK" coded under the same rule?',
    options: ['TUBCM', 'TUADL', 'TUBDL', 'RUADJ'],
    correctIndex: 2,
    hint: 'Shift each alphabetical character forward by +1.',
    explanation: 'S+1=T, T+1=U, A+1=B, C+1=D, K+1=L. Thus "STACK" becomes "TUBDL".'
  },
  {
    id: 'apt_e4',
    category: 'Ratios & Averages',
    difficulty: 'easy',
    question: 'The average of four numbers is 25. If three of the numbers are 20, 28, and 32, what is the fourth number?',
    options: ['18', '20', '22', '24'],
    correctIndex: 1,
    hint: 'Total sum = Average × Total count.',
    explanation: 'Total sum = 4 × 25 = 100. Sum of 3 known numbers = 20 + 28 + 32 = 80. Fourth number = 100 - 80 = 20.'
  },

  // Medium
  {
    id: 'apt_m1',
    category: 'Time and Work',
    difficulty: 'medium',
    question: 'Worker A can build a feature in 10 hours, while Worker B can build the same feature in 15 hours. How long will it take them working together?',
    options: ['5 hours', '6 hours', '7.5 hours', '8 hours'],
    correctIndex: 1,
    hint: 'Add their hourly work rates: (1/10 + 1/15).',
    explanation: 'A\'s rate = 1/10 per hr. B\'s rate = 1/15 per hr. Combined rate = 1/10 + 1/15 = 3/30 + 2/30 = 5/30 = 1/6 per hr. Time required = 1 / (1/6) = 6 hours.'
  },
  {
    id: 'apt_m2',
    category: 'Probability',
    difficulty: 'medium',
    question: 'Two fair standard 6-sided dice are rolled simultaneously. What is the probability that the sum of the numbers rolled equals 8?',
    options: ['5/36', '1/6', '7/36', '1/9'],
    correctIndex: 0,
    hint: 'Enumerate pairs (a, b) where a + b = 8.',
    explanation: 'Total outcomes = 6 × 6 = 36. Favorable outcomes where sum=8: (2,6), (3,5), (4,4), (5,3), (6,2) = 5 outcomes. Probability = 5/36.'
  },
  {
    id: 'apt_m3',
    category: 'Number Series',
    difficulty: 'medium',
    question: 'Identify the next term: 3, 7, 15, 31, 63, ?',
    options: ['95', '120', '127', '131'],
    correctIndex: 2,
    hint: 'Notice the recurrence pattern: 2x + 1 or powers of 2 minus 1.',
    explanation: 'Each term is 2 × (previous term) + 1: 3×2+1=7, 7×2+1=15, 15×2+1=31, 31×2+1=63. Next term = 63×2+1 = 127 (or 2^(n+1) - 1).'
  },
  {
    id: 'apt_m4',
    category: 'Speed, Time & Distance',
    difficulty: 'medium',
    question: 'A train traveling at 72 km/h crosses a 100-meter platform in 15 seconds. What is the length of the train in meters?',
    options: ['150 m', '180 m', '200 m', '220 m'],
    correctIndex: 2,
    hint: 'Convert 72 km/h to m/s by multiplying by (5/18). Total distance = Speed × Time.',
    explanation: 'Speed in m/s = 72 × (5/18) = 20 m/s. In 15 seconds, total distance = 20 × 15 = 300 m. Train length + Platform length = 300 m. Train length = 300 - 100 = 200 m.'
  },

  // Hard
  {
    id: 'apt_h1',
    category: 'Combinatorics',
    difficulty: 'hard',
    question: 'In a room of 12 software engineers, everyone shakes hands with everyone else exactly once. How many total handshakes occur?',
    options: ['66', '72', '132', '144'],
    correctIndex: 0,
    hint: 'Use the combination formula C(n, 2) = n(n-1)/2.',
    explanation: 'Each handshake involves 2 distinct people. C(12, 2) = (12 × 11) / (2 × 1) = 132 / 2 = 66 handshakes.'
  },
  {
    id: 'apt_h2',
    category: 'Logical Deduction',
    difficulty: 'hard',
    question: 'A clock shows 3:15. What is the exact angle between the hour hand and the minute hand?',
    options: ['0°', '7.5°', '12°', '15°'],
    correctIndex: 1,
    hint: 'The minute hand moves 6° per minute. The hour hand moves 0.5° per minute from 3.',
    explanation: 'At 3:15, the minute hand is at 15 × 6° = 90° (pointing at 3). The hour hand is at (3 × 30°) + (15 × 0.5°) = 90° + 7.5° = 97.5°. Angle difference = 97.5° - 90° = 7.5°.'
  },
  {
    id: 'apt_h3',
    category: 'Probability',
    difficulty: 'hard',
    question: 'A box contains 5 red balls and 4 blue balls. If 2 balls are drawn at random without replacement, what is the probability that both are red?',
    options: ['5/18', '25/81', '5/9', '10/36'],
    correctIndex: 0,
    hint: 'Multiply the conditional probabilities: P(First is Red) × P(Second is Red | First is Red).',
    explanation: 'P(1st Red) = 5/9. After drawing 1 red, 4 red and 4 blue remain (total 8). P(2nd Red) = 4/8 = 1/2. Combined probability = (5/9) × (1/2) = 5/18.'
  }
];
