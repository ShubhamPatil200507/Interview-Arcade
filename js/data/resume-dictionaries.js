/**
 * Interview Arcade — Resume Skill Dictionaries & Parser Rules
 * Categorized keywords, normalization maps, and sample interview data.
 */

export const SKILL_CATEGORIES = {
  languages: [
    'c++', 'c', 'java', 'python', 'javascript', 'typescript', 'go', 'golang', 'rust',
    'c#', 'ruby', 'php', 'swift', 'kotlin', 'sql', 'html', 'css', 'bash', 'shell'
  ],
  frameworks_libraries: [
    'react', 'react.js', 'vue', 'vue.js', 'angular', 'node.js', 'express', 'express.js',
    'django', 'flask', 'fastapi', 'spring', 'spring boot', 'next.js', 'redux', 'tailwind',
    'bootstrap', 'pytorch', 'tensorflow', 'pandas', 'numpy', 'scikit-learn'
  ],
  databases: [
    'postgresql', 'postgres', 'mysql', 'mongodb', 'redis', 'sqlite', 'oracle',
    'cassandra', 'dynamodb', 'elasticsearch', 'mariadb', 'neo4j'
  ],
  cloud_devops: [
    'aws', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'k8s', 'ci/cd',
    'jenkins', 'git', 'github', 'gitlab', 'terraform', 'ansible', 'linux', 'nginx'
  ],
  cs_fundamentals: [
    'data structures', 'algorithms', 'dsa', 'object-oriented programming', 'oop',
    'system design', 'operating systems', 'computer networks', 'dbms', 'concurrency',
    'multithreading', 'rest api', 'graphql', 'microservices', 'design patterns'
  ],
  soft_skills: [
    'leadership', 'communication', 'problem solving', 'teamwork', 'collaboration',
    'agile', 'scrum', 'mentorship', 'time management', 'critical thinking'
  ]
};

export const ACTION_VERBS = [
  'architected', 'spearheaded', 'engineered', 'optimized', 'deployed', 'implemented',
  'reduced', 'increased', 'accelerated', 'refactored', 'designed', 'orchestrated'
];

export const SAMPLE_RESUME = `SHUBHAM PATEL
Full Stack Software Engineer | Computer Science & Engineering
Email: shubham@example.com | GitHub: github.com/shubham | LinkedIn: linkedin.com/in/shubham

EDUCATION
Bachelor of Technology in Computer Science & Engineering (2022 - 2026)
Relevant Coursework: Data Structures & Algorithms, Operating Systems, DBMS, Computer Networks, OOP

TECHNICAL SKILLS
- Languages: C++, Python, JavaScript, TypeScript, SQL, Bash
- Frameworks & Web: React, Node.js, Express, Tailwind CSS, REST APIs
- Databases & Tools: PostgreSQL, MongoDB, Redis, Docker, Git, Linux
- Core Competencies: Object-Oriented Programming, System Design, Concurrency, Problem Solving

PROJECTS
1. Distributed Cache Service (C++, Docker, Linux)
   - Architected a thread-safe in-memory key-value cache in modern C++ with LRU eviction.
   - Optimized cache throughput by 35% through lock-free concurrency and memory pooling.
   - Deployed reproducible benchmarking containers using Docker.

2. Campus Placement Portal (React, Node.js, PostgreSQL)
   - Engineered responsive full-stack platform with secure JWT auth and role-based access control.
   - Designed PostgreSQL schema handling 1,500+ student profiles and automated resume indexing.
   - Refactored REST API queries to decrease endpoint latency from 450ms to 95ms.`;

export const SAMPLE_JOB_DESCRIPTION = `Job Title: Associate Software Engineer — Backend & Core Systems

About the Role:
We are seeking a talented Computer Science graduate proficient in software engineering fundamentals. You will design, develop, and scale high-throughput services powering our distributed applications.

Requirements & Qualifications:
- Degree in Computer Science, Software Engineering, or related technical field.
- Strong proficiency in C++, Java, or Go, with solid object-oriented programming (OOP) principles.
- Demonstrated experience with Relational Databases (PostgreSQL or MySQL) and query optimization.
- Familiarity with containerization technologies like Docker and Kubernetes.
- Deep understanding of Data Structures and Algorithms (DSA), Operating Systems, and Computer Networks.
- Experience building RESTful APIs or Microservices architecture.
- Experience with Cloud environments (AWS, GCP, or Azure) and CI/CD pipelines is a plus.
- Excellent communication skills, teamwork, and proactive problem solving in an Agile environment.`;
