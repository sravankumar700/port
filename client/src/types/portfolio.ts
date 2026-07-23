export interface Project {
  id: number;
  title: string;
  description: string;
  problem_statement?: string;
  solution?: string;
  features: string[];
  technologies: string[];
  architecture_diagram?: string;
  database_design?: string;
  challenges?: string;
  learnings?: string;
  future_improvements?: string;
  github_url?: string;
  live_url?: string;
  doc_url?: string;
  duration?: string;
  difficulty?: string;
  status?: string;
  featured: boolean;
  image_url?: string;
}

export interface Skill {
  id: number;
  name: string;
  category: string;
  proficiency: number;
  years_of_experience: number;
  related_projects: string[];
  learning_status: string;
}

export interface Education {
  id: number;
  degree: string;
  college: string;
  university: string;
  cgpa: number;
  duration: string;
  description?: string;
}

export interface Experience {
  id: number;
  role: string;
  company: string;
  location?: string;
  start_date: string;
  end_date?: string;
  description: string;
  type: string;
  technologies: string[];
  achievements: string[];
}

export interface Achievement {
  id: number;
  title: string;
  description: string;
  date: string;
  category?: string;
  link?: string;
}

export interface Certification {
  id: number;
  name: string;
  organization: string;
  issue_date: string;
  skills_learned: string[];
  credential_url?: string;
}

export interface Blog {
  id: number;
  title: string;
  slug: string;
  content: string;
  summary?: string;
  category: string;
  reading_time: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  name: string;
  email: string;
  company?: string;
  subject: string;
  purpose?: string;
  message: string;
  read: boolean;
  replied: boolean;
  created_at: string;
}

export interface SocialLink {
  id: number;
  platform: string;
  url: string;
  icon?: string;
}

export interface SiteSettings {
  [key: string]: string;
}

export interface AnalyticsTimeline {
  date: string;
  views: number;
  uniques: number;
}

export interface TopPage {
  path: string;
  views: number;
}

export interface AnalyticsStats {
  total_views: number;
  unique_visitors: number;
  top_pages: TopPage[];
  timeline: AnalyticsTimeline[];
}
