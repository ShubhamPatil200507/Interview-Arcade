/**
 * Interview Arcade — Technical & Behavioral Interview Scenarios Bank
 * Implements the STAR methodology (Situation, Task, Action, Result)
 * for campus placements and technical interview simulations.
 */

export const INTERVIEW_SCENARIOS = [
  {
    id: 'beh_1',
    type: 'behavioral',
    category: 'Conflict Resolution & Technical Debate',
    title: 'Relational vs NoSQL Architecture Disagreement',
    situation: 'During the design phase of a multi-tenant payment reconciliation ledger, your tech lead proposes using MongoDB for schema flexibility and fast inserts. However, your analysis reveals that reconciliation requires strict multi-table ACID transactions, financial rollbacks, and foreign key referential integrity.',
    prompt: 'How do you handle this disagreement and guide the team toward the soundest engineering decision?',
    timeLimitSeconds: 120,
    starRubric: {
      situation: 'Identifies conflicting trade-offs: developer agility vs data consistency guarantee.',
      task: 'Build consensus on data safety without creating adversarial confrontation.',
      action: 'Benchmark failure modes, construct a concrete proof-of-concept, and evaluate trade-offs objectively.',
      result: 'Team aligns on the architecture with documented architectural decision record (ADR).'
    },
    options: [
      {
        id: 'A',
        text: 'Concede immediately to avoid team friction, as the tech lead has higher seniority and holds final accountability.',
        score: 30,
        critique: 'Passive avoidance. Yielding on critical financial integrity leads to catastrophic silent corruption in production.'
      },
      {
        id: 'B',
        text: 'Document the specific ACID requirements, build a small comparative benchmark simulating concurrent ledger transfers with rollbacks, and present the trade-offs in an Architectural Decision Record (ADR) during team design review.',
        score: 100,
        critique: 'Exemplary STAR approach. Backs claims with reproducible data, respects peer expertise, uses industry-standard ADR documentation, and focuses on business correctness.'
      },
      {
        id: 'C',
        text: 'Privately escalate to the engineering manager that the tech lead is making an irresponsible architectural choice.',
        score: 20,
        critique: 'Toxic escalation. Bypasses peer discussion and destroys team psychological safety before presenting technical evidence.'
      },
      {
        id: 'D',
        text: 'Accept MongoDB but implement two-phase commit and distributed locking mechanisms entirely inside application layer code.',
        score: 45,
        critique: 'Reinventing the wheel poorly. Building custom distributed transaction coordinators in application logic introduces extreme bugs that mature RDBMS engines solved decades ago.'
      }
    ],
    correctIndex: 1,
    explanation: 'Senior and hireable junior engineers resolve technical disagreements through data, benchmarks, and written ADRs (Architectural Decision Records). Objective proof-of-concept demonstrations disarm subjective debates and prioritize system correctness.'
  },
  {
    id: 'beh_2',
    type: 'behavioral',
    category: 'Incident Management & Pressure',
    title: 'Critical Production Outage 15 Minutes Before Launch',
    situation: '15 minutes before the public launch of a campus placement portal, API latency spikes to 12 seconds and database connection pools are 100% saturated. Students are encountering HTTP 504 Gateway Timeouts.',
    prompt: 'What is your immediate sequence of actions to triage and stabilize the platform under acute pressure?',
    timeLimitSeconds: 120,
    starRubric: {
      situation: 'Production saturation and user-facing 504 errors on launch day.',
      task: 'Stop the bleeding, mitigate user impact, establish incident communications, and identify root cause.',
      action: 'Check recent deploys/traffic, throttle non-critical endpoints or scale pool, communicate transparently.',
      result: 'Restored service availability followed by a blameless post-mortem.'
    },
    options: [
      {
        id: 'A',
        text: 'Immediately SSH directly into the production database server and manually kill active query processes one by one.',
        score: 30,
        critique: 'High-risk cowboy troubleshooting. Manually killing connections can leave uncommitted locks and corrupt active transactions.'
      },
      {
        id: 'B',
        text: 'Post an outage status banner, check APM/logs for recent migrations or N+1 queries, activate read replicas or circuit breakers, and temporarily enable rate-limiting while the incident commander coordinates the fix.',
        score: 100,
        critique: 'Flawless incident response. Follows triage protocol: communicate to stakeholders, isolate blast radius with circuit breakers/rate limits, and use telemetry to pinpoint bottlenecks.'
      },
      {
        id: 'C',
        text: 'Post on team Slack that the infrastructure team failed to provision sufficient CPU and wait for them to upscale servers.',
        score: 15,
        critique: 'Blame-shifting. During an active SEV-1 incident, ownership and cross-functional triage take absolute precedence over finger-pointing.'
      },
      {
        id: 'D',
        text: 'Quickly restart all application backend server containers simultaneously to free up connections.',
        score: 40,
        critique: 'Thundering herd risk. Simultaneous container restarts create a stampede of reconnects and cache misses that often crash the database harder.'
      }
    ],
    correctIndex: 1,
    explanation: 'Incident triage follows the hierarchy: (1) Contain blast radius & communicate, (2) Mitigate user impact via circuit breakers / throttling, (3) Diagnose via APM logs, (4) Conduct a blameless retrospective with root cause analysis (RCA).'
  },
  {
    id: 'beh_3',
    type: 'behavioral',
    category: 'Deadlines & Scope Management',
    title: 'Blocked Sprint Goal Due to Upstream Dependency',
    situation: 'Two days before the end of a sprint, an external authentication service changes its OAuth 2.0 token endpoint schema, breaking your SSO integration deliverable that was committed to product management.',
    prompt: 'How do you handle this deadline risk and communicate with your team and product manager?',
    timeLimitSeconds: 120,
    starRubric: {
      situation: 'Unanticipated third-party breaking change blocking committed sprint commitment.',
      task: 'Manage expectations early and propose pragmatic contingency pathways.',
      action: 'Assess fix scope, notify PM immediately with options (feature toggle, scope trim, mock fallback).',
      result: 'No launch surprises; stakeholders make informed risk decisions.'
    },
    options: [
      {
        id: 'A',
        text: 'Work through the night without telling anyone, hoping to figure out an undocumented reverse-engineered workaround before the sprint demo.',
        score: 35,
        critique: 'Hero culture fallacy. Secret crunch without stakeholder visibility risks delivering untested, brittle security code and hides systemic risks.'
      },
      {
        id: 'B',
        text: 'Immediately notify the PM and tech lead with an impact summary: quantify the breaking change, provide 2 concrete options (deploy behind feature flag with email fallback vs 1-day sprint slip), and update the sprint board.',
        score: 100,
        critique: 'Exemplary engineering maturity. "Bad news does not age well." Proactive communication with structured options empowers the business to make strategic decisions.'
      },
      {
        id: 'C',
        text: 'Silently drop the SSO story from the sprint board and hope nobody notices during sprint review.',
        score: 10,
        critique: 'Deceptive and unprofessional. Concealing blocked progress breaks trust with leadership and peers.'
      },
      {
        id: 'D',
        text: 'Bypass the OAuth validation altogether in code and allow any incoming token to pass to satisfy the demo.',
        score: 15,
        critique: 'Severe security hazard. Bypassing authentication to meet an arbitrary deadline violates engineering ethics and invites vulnerabilities.'
      }
    ],
    correctIndex: 1,
    explanation: 'Engineering management values early predictability far higher than eleventh-hour heroics. Stating problems promptly alongside evaluated mitigation options is the definition of professional accountability.'
  },
  {
    id: 'beh_4',
    type: 'behavioral',
    category: 'Stakeholder Communication',
    title: 'Pitching Technical Refactoring to Non-Technical Leadership',
    situation: 'Your team spends 40% of every sprint fixing regressions in an 8-year-old monolithic billing module. Product leadership wants to push ahead with 4 major new feature requests and rejects requests for "code cleanup".',
    prompt: 'How do you pitch refactoring the billing engine in terms that resonate with business leadership?',
    timeLimitSeconds: 120,
    starRubric: {
      situation: 'Crippling technical debt dismissed as an engineering indulgence.',
      task: 'Translate engineering pain into business value (revenue, churn, delivery velocity).',
      action: 'Frame refactoring around quantifiable metrics: customer bug count, onboarding latency, sprint cycle time.',
      result: 'Secured dedicated sprint capacity (e.g., 20% budget) for continuous architectural hardening.'
    },
    options: [
      {
        id: 'A',
        text: 'Explain that the code violates clean architecture principles, lacks SOLID design, and makes developers unhappy.',
        score: 40,
        critique: 'Engineering jargon. Executives make capital allocation decisions based on revenue, cost, customer retention, and velocity—not abstract cleanliness.'
      },
      {
        id: 'B',
        text: 'Refuse to write new features until management agrees to rewrite the entire billing codebase in Rust.',
        score: 15,
        critique: 'Insurrectionary rewrite trap. Second-system syndrome rewrites take 3x longer than anticipated and introduce new regressions.'
      },
      {
        id: 'C',
        text: 'Translate the debt into business metrics: show that billing bugs caused $25,000 in customer refunds and delayed feature delivery by 3 weeks last quarter. Propose an incremental strangler-fig refactor alongside feature work using a 20% technical debt budget.',
        score: 100,
        critique: 'Masterclass in stakeholder alignment. Ties architectural remediation directly to financial impact and proposes an incremental, low-risk execution plan.'
      },
      {
        id: 'D',
        text: 'Secretly refactor the module during nights and weekends without informing the product manager.',
        score: 25,
        critique: 'Unsanctioned risk. Unbudgeted large-scale refactors lack QA coverage and jeopardize business commitments if unexpected regressions occur.'
      }
    ],
    correctIndex: 2,
    explanation: 'Technical debt must be articulated in terms of business impact: cycle time, monetary refunds, SLA violations, and feature delivery drag. The Strangler Fig pattern provides an incremental path rather than a hazardous complete rewrite.'
  },
  {
    id: 'beh_5',
    type: 'technical',
    category: 'System Design & Scalability',
    title: 'High-Throughput Distributed Rate Limiter',
    situation: 'You are designing an API Gateway rate limiter that must enforce a quota of 100 requests per minute per API key across 20 distributed microservice nodes handling 60,000 total requests/sec.',
    prompt: 'Which algorithmic and storage architecture satisfies low latency (<5ms) and accurate boundary enforcement without race conditions?',
    timeLimitSeconds: 120,
    starRubric: {
      situation: 'High-throughput distributed API rate limiting with sub-5ms overhead.',
      task: 'Choose rate limiting algorithm and distributed state synchronization mechanism.',
      action: 'Evaluate Fixed Window vs Sliding Window Log vs Token Bucket; choose atomic Redis Lua script.',
      result: 'Prevents burst exploits at window boundaries with minimal round-trip latency.'
    },
    options: [
      {
        id: 'A',
        text: 'Store timestamps in an in-memory SQL database on each microservice node and sync rows via database replication.',
        score: 25,
        critique: 'High latency and synchronization lag. Cross-node database replication will easily breach the 5ms latency SLA under 60k RPS.'
      },
      {
        id: 'B',
        text: 'Use Redis cluster with a Sliding Window Counter algorithm implemented via an atomic Lua script (combining ZADD, ZREMRANGEBYSCORE, and ZCARD) or Redis cell token bucket.',
        score: 100,
        critique: 'Optimal system architecture. Redis in-memory execution guarantees sub-millisecond lookups; an atomic Lua script prevents race conditions between read and increment.'
      },
      {
        id: 'C',
        text: 'Use a Fixed Window Counter with a simple Redis INCR and 60-second TTL.',
        score: 55,
        critique: 'Boundary burst vulnerability. Fixed window allows up to 2x the quota (200 requests) if a client sends 100 requests at 00:59 and 100 requests at 01:01.'
      },
      {
        id: 'D',
        text: 'Keep rate counters exclusively in local JVM/Node.js process memory without cross-node synchronization.',
        score: 40,
        critique: 'Inaccurate quota. With 20 nodes, round-robin load balancing would allow an abusive client to make up to 2,000 requests per minute before any individual node throttles them.'
      }
    ],
    correctIndex: 1,
    explanation: 'Distributed rate limiting at scale requires in-memory low-latency state (Redis) paired with atomic transactions (Lua scripts) to eliminate check-then-act race conditions, utilizing Sliding Window or Token Bucket algorithms to mitigate boundary bursts.'
  },
  {
    id: 'beh_6',
    type: 'technical',
    category: 'System Design & Distributed Data',
    title: 'Distributed 64-Bit Unique ID Generator',
    situation: 'Your social platform needs to generate globally unique, 64-bit integer IDs for posts at a peak rate of 100,000 IDs per second. IDs must be roughly chronological for efficient B-Tree database indexing and generated without a central database bottleneck.',
    prompt: 'Which design best fulfills these constraints with high availability and minimal coordination overhead?',
    timeLimitSeconds: 120,
    starRubric: {
      situation: 'High-throughput 64-bit monotonically increasing ID generation without central single point of failure.',
      task: 'Select bit allocation scheme and distributed clock synchronization strategy.',
      action: 'Implement Twitter Snowflake bit-packing (Timestamp + Worker ID + Sequence Counter).',
      result: 'Zero inter-node coordination required during ID generation; highly cache-friendly for storage engines.'
    },
    options: [
      {
        id: 'A',
        text: 'Central MySQL database with AUTO_INCREMENT column using a single writer master node.',
        score: 30,
        critique: 'Catastrophic bottleneck. A single MySQL master cannot sustain 100,000 disk writes/sec and represents a fatal single point of failure.'
      },
      {
        id: 'B',
        text: 'Standard 128-bit UUID v4 generated randomly on each application server.',
        score: 45,
        critique: 'Breaches constraints. UUID v4 is 128 bits (violating the 64-bit requirement), lacks chronological ordering, and causes severe B-Tree index fragmentation.'
      },
      {
        id: 'C',
        text: 'Twitter Snowflake bit-partitioned layout: 41 bits for epoch timestamp (milliseconds), 10 bits for machine/worker ID, and 12 bits for a local per-millisecond sequence counter.',
        score: 100,
        critique: 'Canonical industry solution. Snowflake IDs fit in a 64-bit signed integer, allow up to 4,096 IDs per millisecond per node without network coordination, and are naturally time-ordered.'
      },
      {
        id: 'D',
        text: 'Centralized ZooKeeper znode sequential counters for each generated ID.',
        score: 40,
        critique: 'Consensus overhead. ZooKeeper consensus (Zab protocol) over the network cannot sustain 100k distributed transactions per second without massive latency spikes.'
      }
    ],
    correctIndex: 2,
    explanation: 'Twitter Snowflake architecture allocates 64 bits across timestamp (41 bits ~69 years), worker ID (10 bits ~1,024 nodes), and sequence counter (12 bits ~4,096 IDs/ms). Because generation is local to each worker node, zero network coordination is needed.'
  }
];
