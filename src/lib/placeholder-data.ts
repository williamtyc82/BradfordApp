import type { User, TrainingMaterial, Quiz, Incident, Announcement, UserProgress, QuizResult } from './types';

export const placeholderUsers: User[] = [
  {
    id: 'user-1',
    email: 'manager@bradford.co',
    displayName: 'Alex Johnson',
    role: 'manager',
    photoURL: 'https://picsum.photos/seed/avatar1/100/100',
    createdAt: new Date('2022-01-15T09:30:00Z').toISOString(),
    lastLogin: new Date().toISOString(),
  },
  {
    id: 'user-2',
    email: 'worker1@bradford.co',
    displayName: 'Maria Garcia',
    role: 'worker',
    photoURL: 'https://picsum.photos/seed/avatar2/100/100',
    createdAt: new Date('2023-03-20T14:00:00Z').toISOString(),
    lastLogin: new Date().toISOString(),
  },
  {
    id: 'user-3',
    email: 'worker2@bradford.co',
    displayName: 'David Smith',
    role: 'worker',
    photoURL: 'https://picsum.photos/seed/avatar3/100/100',
    createdAt: new Date('2023-05-10T11:45:00Z').toISOString(),
    lastLogin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'user-4',
    email: 'worker3@bradford.co',
    displayName: 'Chen Wang',
    role: 'worker',
    photoURL: 'https://picsum.photos/seed/avatar4/100/100',
    createdAt: new Date('2023-08-01T08:00:00Z').toISOString(),
    lastLogin: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

export const trainingMaterials: TrainingMaterial[] = [
  {
    id: 'material-1',
    title: 'Forklift Operation Safety',
    description: 'A comprehensive guide to operating forklifts safely in the warehouse.',
    category: 'Safety',
    fileURL: '/path/to/forklift-safety.pdf',
    fileType: 'pdf',
    uploadedBy: 'user-1',
    uploadedAt: new Date('2023-10-01T10:00:00Z').toISOString(),
    views: 125,
  },
  {
    id: 'material-2',
    title: 'Handling Hazardous Materials',
    description: 'Video tutorial on the proper procedures for handling hazardous substances.',
    category: 'Safety',
    fileURL: '/path/to/hazardous-materials.mp4',
    fileType: 'video',
    uploadedBy: 'user-1',
    uploadedAt: new Date('2023-10-05T15:20:00Z').toISOString(),
    views: 88,
  },
  {
    id: 'material-3',
    title: 'Warehouse Inventory System Guide',
    description: 'Learn how to use our new inventory management software.',
    category: 'Operations',
    fileURL: '/path/to/inventory-guide.pdf',
    fileType: 'pdf',
    uploadedBy: 'user-1',
    uploadedAt: new Date('2023-11-10T09:00:00Z').toISOString(),
    views: 210,
  },
  {
    id: 'material-4',
    title: 'Fire Extinguisher Usage',
    description: 'Quick visual guide on how to use a fire extinguisher.',
    category: 'Emergency',
    fileURL: '/path/to/fire-extinguisher.jpg',
    fileType: 'image',
    uploadedBy: 'user-1',
    uploadedAt: new Date('2023-09-20T11:00:00Z').toISOString(),
    views: 301,
  }
];

export const quizzes: Quiz[] = [
  {
    id: 'quiz-1',
    title: 'Safety Procedures Quiz',
    description: 'Test your knowledge on the basic safety procedures.',
    category: 'Safety',
    questions: [
      { question: 'What does PPE stand for?', options: ['Personal Protective Equipment', 'Private Property Entry', 'Primary Power Engine', 'Personnel Protection Equipment'], correctAnswer: 0, points: 10 },
      { question: 'When should you report a safety hazard?', options: ['At the end of your shift', 'Immediately', 'Only if someone gets hurt', 'During the weekly meeting'], correctAnswer: 1, points: 10 },
    ],
    duration: 15,
    createdBy: 'user-1',
    createdAt: new Date('2023-10-15T11:00:00Z').toISOString(),
  },
  {
    id: 'quiz-2',
    title: 'Inventory Management Basics',
    description: 'A quiz on our warehouse inventory system.',
    category: 'Operations',
    questions: [
      { question: 'Which system do we use for inventory tracking?', options: ['LogiTrack', 'StockWare', 'InvenSys', 'Manual Ledgers'], correctAnswer: 2, points: 10 },
      { question: 'What is a SKU?', options: ['Stock Keeping Unit', 'Safe Keeping Utility', 'Standard Key User', 'System Knowledge Unit'], correctAnswer: 0, points: 10 },
    ],
    duration: 10,
    createdBy: 'user-1',
    createdAt: new Date('2023-11-15T14:00:00Z').toISOString(),
  }
];

export const quizResults: QuizResult[] = [
    {
        id: 'qr-1',
        userId: 'user-2',
        quizId: 'quiz-1',
        score: 10,
        totalPoints: 20,
        answers: [1, 1],
        completedAt: new Date('2023-10-16T10:00:00Z').toISOString()
    },
    {
        id: 'qr-2',
        userId: 'user-3',
        quizId: 'quiz-1',
        score: 20,
        totalPoints: 20,
        answers: [0, 1],
        completedAt: new Date('2023-10-17T11:30:00Z').toISOString()
    },
];

export const incidents: Incident[] = [
  {
    id: 'incident-1',
    reportedBy: 'user-2',
    title: 'Minor spill in Aisle 4',
    description: 'A small amount of non-hazardous liquid was spilled in Aisle 4. Clean-up crew has been notified.',
    category: 'Safety',
    location: 'Warehouse B, Aisle 4',
    severity: 'Low',
    status: 'In Progress',
    mediaURLs: ['https://picsum.photos/seed/spill/600/400'],
    reportedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    managerComments: [],
  },
  {
    id: 'incident-2',
    reportedBy: 'user-3',
    title: 'Forklift 3 not starting',
    description: 'Forklift #3 is unresponsive. It was working fine yesterday.',
    category: 'Equipment',
    location: 'Charging Station 2',
    severity: 'Medium',
    status: 'Pending',
    mediaURLs: [],
    reportedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    managerComments: [],
  },
  {
    id: 'incident-3',
    reportedBy: 'user-2',
    title: 'Damaged package found',
    description: 'A package for order #12345 was found with significant damage to the corner.',
    category: 'Logistics',
    location: 'Outbound staging area',
    severity: 'Medium',
    status: 'Resolved',
    mediaURLs: ['https://picsum.photos/seed/damagedbox/600/400'],
    reportedAt: new Date('2023-11-20T16:00:00Z').toISOString(),
    resolvedAt: new Date('2023-11-20T18:30:00Z').toISOString(),
    managerComments: [
        { comment: 'Customer notified, replacement sent.', userId: 'user-1', createdAt: new Date('2023-11-20T18:25:00Z').toISOString() }
    ],
  },
];

export const announcements: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Holiday Schedule Update',
    content: 'Please note that the warehouse will be closed on December 25th and January 1st. Plan your shifts accordingly.',
    priority: 'Important',
    postedBy: 'user-1',
    postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    readBy: ['user-2', 'user-3'],
  },
  {
    id: 'ann-2',
    title: 'New Safety Vests Distributed',
    content: 'New high-visibility safety vests are available for pickup at the front office. It is mandatory to wear them starting next Monday.',
    priority: 'Urgent',
    postedBy: 'user-1',
    postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    readBy: ['user-2'],
  },
  {
    id: 'ann-3',
    title: 'Team Lunch this Friday',
    content: 'To celebrate a great quarter, we will be having a team lunch this Friday at noon in the main breakroom. Pizza will be provided!',
    priority: 'Normal',
    postedBy: 'user-1',
    postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    readBy: ['user-2', 'user-3', 'user-4'],
  }
];

export const userProgressData: UserProgress[] = [
    {
        userId: 'user-2',
        completedMaterials: ['material-1'],
        quizzesTaken: [{ quizId: 'quiz-1', score: 10 }],
        totalScore: 10,
        lastActivity: new Date().toISOString(),
        trainingCompletion: 25,
    },
    {
        userId: 'user-3',
        completedMaterials: ['material-1', 'material-4'],
        quizzesTaken: [{ quizId: 'quiz-1', score: 20 }],
        totalScore: 20,
        lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        trainingCompletion: 50,
    },
    {
        userId: 'user-4',
        completedMaterials: [],
        quizzesTaken: [],
        totalScore: 0,
        lastActivity: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        trainingCompletion: 0,
    }
];
