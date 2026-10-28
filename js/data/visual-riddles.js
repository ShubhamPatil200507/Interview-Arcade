/**
 * Interview Arcade — Visual Logic Riddles
 * Handcrafted vector SVG diagrams for pattern recognition and sequence deduction.
 */

export const VISUAL_RIDDLES = [
  // Easy: Clockwise Rotating Pointer
  {
    id: 'vis_e1',
    difficulty: 'easy',
    title: 'Clockwise Rotation Matrix',
    instructions: 'Observe the progressive rotation of the directional pointer across the 3 frames. Deduce the 4th frame.',
    svgDiagram: `
      <svg viewBox="0 0 400 110" width="100%" height="110" xmlns="http://www.w3.org/2000/svg">
        <!-- Frame 1 (Pointing North) -->
        <rect x="10" y="10" width="80" height="80" rx="6" fill="#F3EFE6" stroke="#1C1917" stroke-width="2"/>
        <line x1="50" y1="70" x2="50" y2="25" stroke="#1C1917" stroke-width="4" stroke-linecap="round"/>
        <polygon points="50,18 42,32 58,32" fill="#E05626"/>
        <text x="50" y="102" font-family="monospace" font-size="12" text-anchor="middle" fill="#57534E">1 (0°)</text>

        <!-- Frame 2 (Pointing East: 90° CW) -->
        <rect x="110" y="10" width="80" height="80" rx="6" fill="#F3EFE6" stroke="#1C1917" stroke-width="2"/>
        <line x1="30" y1="50" x2="75" y2="50" stroke="#1C1917" stroke-width="4" stroke-linecap="round"/>
        <polygon points="82,50 68,42 68,58" fill="#E05626"/>
        <text x="150" y="102" font-family="monospace" font-size="12" text-anchor="middle" fill="#57534E">2 (90°)</text>

        <!-- Frame 3 (Pointing South: 180° CW) -->
        <rect x="210" y="10" width="80" height="80" rx="6" fill="#F3EFE6" stroke="#1C1917" stroke-width="2"/>
        <line x1="250" y1="30" x2="250" y2="75" stroke="#1C1917" stroke-width="4" stroke-linecap="round"/>
        <polygon points="250,82 242,68 258,68" fill="#E05626"/>
        <text x="250" y="102" font-family="monospace" font-size="12" text-anchor="middle" fill="#57534E">3 (180°)</text>

        <!-- Frame 4 (Target) -->
        <rect x="310" y="10" width="80" height="80" rx="6" fill="#ECE6D8" stroke="#E05626" stroke-width="2" stroke-dasharray="4"/>
        <text x="350" y="58" font-family="monospace" font-size="28" text-anchor="middle" font-weight="bold" fill="#E05626">?</text>
        <text x="350" y="102" font-family="monospace" font-size="12" text-anchor="middle" fill="#E05626">4 (?)</text>
      </svg>
    `,
    options: [
      'Pointing West (270° Clockwise)',
      'Pointing North (0° Clockwise)',
      'Pointing North-East (45° Clockwise)',
      'Pointing South-West (225° Clockwise)'
    ],
    correctIndex: 0,
    hint: 'Add 90° clockwise to the angle of each preceding frame.',
    explanation: 'The pointer steps 90° clockwise in each sequential frame: 0° (North), 90° (East), 180° (South). Therefore, frame 4 must rotate another 90° to 270°, pointing West.'
  },

  // Medium: Grid Dot Density & Shading Inversion
  {
    id: 'vis_m1',
    difficulty: 'medium',
    title: 'Symmetry Inversion Matrix',
    instructions: 'A 2x2 matrix puzzle. Row 1 transforms from 1 dark dot in top-left to 3 dark dots. Row 2 transforms from top-right dark dot. What is the matching transformation?',
    svgDiagram: `
      <svg viewBox="0 0 320 160" width="100%" height="160" xmlns="http://www.w3.org/2000/svg">
        <!-- Tile A (Row 1 Left) -->
        <rect x="20" y="20" width="50" height="50" rx="4" fill="#FFFFFF" stroke="#1C1917" stroke-width="2"/>
        <circle cx="35" cy="35" r="7" fill="#E05626"/>
        
        <!-- Arrow -->
        <text x="90" y="50" font-family="sans-serif" font-size="18" fill="#1C1917">→</text>

        <!-- Tile B (Row 1 Right) -->
        <rect x="110" y="20" width="50" height="50" rx="4" fill="#FFFFFF" stroke="#1C1917" stroke-width="2"/>
        <circle cx="125" cy="55" r="7" fill="#1C1917"/>
        <circle cx="145" cy="35" r="7" fill="#1C1917"/>
        <circle cx="145" cy="55" r="7" fill="#1C1917"/>

        <!-- Tile C (Row 2 Left) -->
        <rect x="20" y="90" width="50" height="50" rx="4" fill="#FFFFFF" stroke="#1C1917" stroke-width="2"/>
        <circle cx="55" cy="105" r="7" fill="#E05626"/>

        <!-- Arrow -->
        <text x="90" y="120" font-family="sans-serif" font-size="18" fill="#1C1917">→</text>

        <!-- Target -->
        <rect x="110" y="90" width="50" height="50" rx="4" fill="#ECE6D8" stroke="#E05626" stroke-width="2" stroke-dasharray="3"/>
        <text x="135" y="122" font-family="monospace" font-size="20" font-weight="bold" fill="#E05626">?</text>
      </svg>
    `,
    options: [
      'Invert: fill all corners EXCEPT the top-right corner',
      'Fill only the top-left and bottom-right corners',
      'Fill all 4 corners',
      'Leave all corners empty'
    ],
    correctIndex: 0,
    hint: 'Rule is bitwise NOT: all unshaded corners become shaded, and the original shaded corner becomes empty.',
    explanation: 'The transformation performs a bitwise complement / inversion: the single filled cell empties, and all 3 remaining empty quadrant positions become filled.'
  },

  // Hard: Polygon Vertex Increment & Nested Concentrics
  {
    id: 'vis_h1',
    difficulty: 'hard',
    title: 'Topological Vertex Progression',
    instructions: 'A sequence of shapes: Triangle (3 vertices) with 1 interior dot, Square (4 vertices) with 2 dots, Pentagon (5 vertices) with 3 dots. What comes next?',
    svgDiagram: `
      <svg viewBox="0 0 380 110" width="100%" height="110" xmlns="http://www.w3.org/2000/svg">
        <!-- 1: Triangle with 1 dot -->
        <rect x="10" y="10" width="80" height="80" rx="6" fill="#F3EFE6" stroke="#1C1917" stroke-width="2"/>
        <polygon points="50,25 25,65 75,65" fill="none" stroke="#1C1917" stroke-width="2"/>
        <circle cx="50" cy="50" r="4" fill="#E05626"/>

        <!-- 2: Square with 2 dots -->
        <rect x="105" y="10" width="80" height="80" rx="6" fill="#F3EFE6" stroke="#1C1917" stroke-width="2"/>
        <rect x="125" y="30" width="40" height="40" fill="none" stroke="#1C1917" stroke-width="2"/>
        <circle cx="138" cy="50" r="4" fill="#E05626"/>
        <circle cx="152" cy="50" r="4" fill="#E05626"/>

        <!-- 3: Pentagon with 3 dots -->
        <rect x="200" y="10" width="80" height="80" rx="6" fill="#F3EFE6" stroke="#1C1917" stroke-width="2"/>
        <polygon points="240,26 262,42 254,66 226,66 218,42" fill="none" stroke="#1C1917" stroke-width="2"/>
        <circle cx="232" cy="50" r="4" fill="#E05626"/>
        <circle cx="240" cy="42" r="4" fill="#E05626"/>
        <circle cx="248" cy="50" r="4" fill="#E05626"/>

        <!-- 4: Target -->
        <rect x="295" y="10" width="80" height="80" rx="6" fill="#ECE6D8" stroke="#E05626" stroke-width="2" stroke-dasharray="3"/>
        <text x="335" y="58" font-family="monospace" font-size="28" font-weight="bold" fill="#E05626">?</text>
      </svg>
    `,
    options: [
      'Hexagon (6 vertices) with 4 interior dots',
      'Octagon (8 vertices) with 5 interior dots',
      'Pentagon (5 vertices) with 4 interior dots',
      'Circle with 6 interior dots'
    ],
    correctIndex: 0,
    hint: 'Count vertices N = 3, 4, 5... and interior dots D = 1, 2, 3...',
    explanation: 'Both properties increment linearly by +1 each step: Vertices N = 3 (Triangle) -> 4 (Square) -> 5 (Pentagon) -> 6 (Hexagon). Dots D = 1 -> 2 -> 3 -> 4.'
  }
];
