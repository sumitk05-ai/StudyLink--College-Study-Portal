
export type UserRole = 'STUDENT' | 'FOUNDER' | null;

export type Category = 'Notes' | 'Solved PYQs' | 'Important Questions';

export type Subject = 
  | 'Physics' 
  | 'Chemistry' 
  | 'BCME' 
  | 'Mechanics' 
  | 'BEEE' 
  | 'M-I' 
  | 'M-II';

export interface UserCredential {
  email: string;
  password: string;
  loginTime: string;
}

export interface StudyFile {
  id: string;
  name: string;
  subject: Subject;
  category: Category;
  unit: number;
  url: string;
  uploadDate: string;
}

export const SUBJECTS: Subject[] = [
  'Physics',
  'Chemistry',
  'BCME',
  'Mechanics',
  'BEEE',
  'M-I',
  'M-II'
];

export const CATEGORIES: Category[] = [
  'Solved PYQs',
  'Notes',
  'Important Questions'
];

export const UNITS = [1, 2, 3, 4, 5, 6];

export interface AppState {
  role: UserRole;
  files: StudyFile[];
  users: UserCredential[];
}
