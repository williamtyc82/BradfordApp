export type User = {
  id: string;
  email: string;
  displayName: string;
  role: 'worker' | 'manager';
  photoURL: string;
  createdAt: string;
  lastLogin: string;
};

export type TrainingMaterial = {
  id: string;
  title: string;
  description: string;
  category: string;
  fileURL: string;
  fileType: 'pdf' | 'video' | 'image';
  uploadedBy: string; // userId
  uploadedAt: string;
  views: number;
};

export type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
};

export type Quiz = {
  id: string;
  title: string;
  description: string;
  category: string;
  questions: QuizQuestion[];
  duration: number; // minutes
  createdBy: string; // userId
  createdAt: string;
};

export type QuizResult = {
  id: string;
  userId: string;
  quizId: string;
  score: number;
  totalPoints: number;
  answers: (number | null)[];
  completedAt: string;
};

export type Incident = {
  id: string;
  reportedBy: string; // userId
  title: string;
  description: string;
  category: 'Safety' | 'Equipment' | 'Logistics' | 'Other';
  location: string;
  severity: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'In Progress' | 'Resolved';
  mediaURLs: string[];
  reportedAt: string;
  resolvedAt?: string | null;
  managerComments: {
    comment: string;
    userId: string;
    createdAt: string;
  }[];
};

export type Announcement = {
  id: string;
  title: string;
  content: string;
  priority: 'Normal' | 'Important' | 'Urgent';
  postedBy: string; // userId
  postedAt: string;
  expiresAt?: string | null;
  readBy: string[]; // userIds
};

export type UserProgress = {
  userId: string;
  completedMaterials: string[]; // materialIds
  quizzesTaken: { quizId: string; score: number }[];
  totalScore: number;
  lastActivity: string;
  trainingCompletion: number; // percentage
};
