export type JLPTLevel = 'N1' | 'N2' | 'N3' | 'N4' | 'N5' | 'None';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  skills: string[];
  resumeUrl?: string;
  jlptLevel: JLPTLevel;
  preferredLocations: string[];
  createdAt: number;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  description: string;
  skills: string[];
  languageRequirements?: JLPTLevel;
  sourceUrl?: string;
  postedAt: number;
  matchScore?: number;
  missingSkills?: string[];
}

export type ApplicationStatus = 'Applied' | 'Interview' | 'Rejected' | 'Offer' | 'Saved';

export interface Application {
  id: string;
  userId: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  status: ApplicationStatus;
  notes?: string;
  appliedAt: number;
  updatedAt: number;
}

export interface SkillGapAnalysis {
  matchScore: number;
  missingSkills: string[];
  roadmapSuggestions: string[];
}
