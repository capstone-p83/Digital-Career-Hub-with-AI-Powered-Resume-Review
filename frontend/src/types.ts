export type Language = 'en' | 'bn';

export interface User {
  id: string;
  name: string;
  email: string;
  bio?: string;
  targetRole?: string;
}

export interface ResumeReview {
  id: string;
  timestamp: string;
  score: number;
  targetJob: string;
  feedback: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };
  originalFileName: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'guide';
  category: 'resume' | 'interview' | 'networking' | 'skills';
  url: string;
}
