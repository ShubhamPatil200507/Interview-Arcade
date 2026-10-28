/**
 * Interview Arcade — Object-Oriented Programming Question Bank
 * Verified technical content with real difficulty levels and thorough explanations.
 */

export const OOP_QUESTIONS = [
  // Easy
  {
    id: 'oop_e1',
    difficulty: 'easy',
    topic: 'Encapsulation',
    question: 'Which OOP principle is primarily achieved by making class member variables private and providing public getters and setters?',
    options: ['Encapsulation', 'Polymorphism', 'Multiple Inheritance', 'Dynamic Binding'],
    correctIndex: 0,
    explanation: 'Encapsulation bundles data and the methods that operate on that data within a single unit and restricts direct access to internal components.'
  },
  {
    id: 'oop_e2',
    difficulty: 'easy',
    topic: 'Inheritance',
    question: 'In object-oriented programming, what relationship does inheritance model between a parent class and a derived child class?',
    options: ['"HAS-A" relationship', '"IS-A" relationship', '"USES-A" relationship', '"IMPLEMENTS-ALL" relationship'],
    correctIndex: 1,
    explanation: 'Inheritance models an "IS-A" relationship (e.g., a Dog "IS-A" Animal), whereas composition models a "HAS-A" relationship (e.g., a Car "HAS-A" Engine).'
  },
  {
    id: 'oop_e3',
    difficulty: 'easy',
    topic: 'Constructors',
    question: 'What is the primary role of a constructor in a class?',
    options: [
      'To deallocate memory when an object goes out of scope',
      'To initialize the newly created object\'s state and allocate resources',
      'To convert an object into a JSON string',
      'To enforce multiple inheritance at runtime'
    ],
    correctIndex: 1,
    explanation: 'Constructors initialize member attributes and allocate necessary resources whenever a new instance is instantiated.'
  },
  {
    id: 'oop_e4',
    difficulty: 'easy',
    topic: 'Polymorphism',
    question: 'Method overloading in Java and C++ is an example of which kind of polymorphism?',
    options: ['Compile-time (Static) Polymorphism', 'Run-time (Dynamic) Polymorphism', 'Subtyping Polymorphism', 'Ad-hoc Garbage Collection'],
    correctIndex: 0,
    explanation: 'Method overloading resolves which method signature to invoke at compile time based on parameter count and types.'
  },
  {
    id: 'oop_e5',
    difficulty: 'easy',
    topic: 'Abstraction',
    question: 'Can you directly instantiate an abstract class using the "new" operator?',
    options: ['No, abstract classes cannot be instantiated directly', 'Yes, always', 'Yes, but only if all methods are static', 'Yes, if it has no constructors'],
    correctIndex: 0,
    explanation: 'Abstract classes serve as blueprints and incomplete templates; they cannot be instantiated directly without being subclassed with concrete implementations.'
  },

  // Medium
  {
    id: 'oop_m1',
    difficulty: 'medium',
    topic: 'Polymorphism',
    question: 'How do C++ compilers achieve dynamic dispatch (runtime method overriding) for virtual member functions?',
    options: [
      'By scanning source files at runtime',
      'Using a Virtual Method Table (vtable) and a hidden vptr per object',
      'By converting all virtual functions to switch-case statements',
      'Through automatic heap reallocation'
    ],
    correctIndex: 1,
    explanation: 'When a class has virtual functions, the compiler creates a vtable containing pointers to the functions. Each object contains a hidden pointer (vptr) pointing to this vtable.'
  },
  {
    id: 'oop_m2',
    difficulty: 'medium',
    topic: 'Design Principles',
    question: 'In the SOLID design principles, what does the "Liskov Substitution Principle" (LSP) dictate?',
    options: [
      'Every class must implement at least two public interfaces',
      'Subtypes must be substitutable for their base types without altering program correctness',
      'Low-level modules must directly depend on high-level concrete classes',
      'Objects should never inherit from abstract classes'
    ],
    correctIndex: 1,
    explanation: 'LSP states that objects of a superclass should be replaceable with objects of its subclasses without breaking application behavior or violating pre/post-conditions.'
  },
  {
    id: 'oop_m3',
    difficulty: 'medium',
    topic: 'Destructors & Memory',
    question: 'Why should a base class destructor always be declared "virtual" in C++ when deleting a derived object via a base pointer?',
    options: [
      'To prevent the base constructor from executing twice',
      'To ensure the derived class destructor is invoked, preventing undefined behavior and resource leaks',
      'To force all member variables to become private',
      'To speed up stack allocation'
    ],
    correctIndex: 1,
    explanation: 'If the base destructor is not virtual, calling delete on a Base* pointing to a Derived instance only calls ~Base(), leaking resources allocated by ~Derived().'
  },
  {
    id: 'oop_m4',
    difficulty: 'medium',
    topic: 'Inheritance Problems',
    question: 'What is the "Diamond Problem" in object-oriented languages that allow multiple inheritance?',
    options: [
      'Circular dependency between two private methods',
      'Ambiguity when a class inherits from two classes that both inherit from the same common ancestor',
      'A memory leak caused by self-referential smart pointers',
      'The inability to declare private static variables'
    ],
    correctIndex: 1,
    explanation: 'The Diamond Problem occurs when class D inherits from B and C, which both inherit from A. Without virtual inheritance, D receives two conflicting copies of A\'s members.'
  },
  {
    id: 'oop_m5',
    difficulty: 'medium',
    topic: 'Composition vs Inheritance',
    question: 'Why does the design heuristic "Favor composition over inheritance" improve maintainability?',
    options: [
      'Composition prevents classes from having public methods',
      'Composition decouples components, allows runtime behavior changes, and avoids deep, brittle inheritance hierarchies',
      'Composition executes twice as fast as virtual method calls',
      'Inheritance is deprecated in modern C++'
    ],
    correctIndex: 1,
    explanation: 'Inheritance creates tight coupling ("white-box reuse"). Composition creates looser coupling ("black-box reuse"), allowing delegates to be swapped at runtime.'
  },

  // Hard
  {
    id: 'oop_h1',
    difficulty: 'hard',
    topic: 'Design Patterns',
    question: 'In the Observer pattern, what mechanism prevents memory leaks (the "Lapsed Listener Problem") in garbage-collected languages?',
    options: [
      'Using strong static references inside the Subject',
      'Explicitly unsubscribing or using Weak References (WeakReference/WeakMap) for listeners',
      'Calling System.gc() after every event dispatch',
      'Declaring the Observer as final'
    ],
    correctIndex: 1,
    explanation: 'If a long-lived subject holds strong references to short-lived observers, the garbage collector cannot reclaim the observers. Weak references or explicit deregistration solve this.'
  },
  {
    id: 'oop_h2',
    difficulty: 'hard',
    topic: 'C++ Object Model',
    question: 'In C++, what is Object Slicing and when does it occur?',
    options: [
      'When an array of objects exceeds stack boundaries',
      'When a derived class object is assigned to a base class object by value, stripping derived-specific state',
      'When a compiler strips unused template specializations',
      'When a destructor fails to deallocate heap memory'
    ],
    correctIndex: 1,
    explanation: 'Object slicing occurs when a derived class instance is copied into a base class value variable. The copy constructor of the base class only copies the base portion, discarding derived members.'
  },
  {
    id: 'oop_h3',
    difficulty: 'hard',
    topic: 'SOLID & Inversion of Control',
    question: 'How does the Dependency Inversion Principle (the D in SOLID) differ from Dependency Injection?',
    options: [
      'They are identical terms for passing constructors',
      'Dependency Inversion is an architectural principle (high/low modules depend on abstractions); Dependency Injection is a design technique to supply dependencies',
      'Dependency Inversion requires XML configuration files; Dependency Injection does not',
      'Dependency Inversion applies only to functional programming'
    ],
    correctIndex: 1,
    explanation: 'DIP is a structural guideline stating high-level policy should not depend on low-level detail. Dependency Injection (DI) is a specific design pattern implementing DIP by passing references.'
  }
];
