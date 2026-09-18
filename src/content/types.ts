export type StatLabelKey =
  | "yearsExperience"
  | "steelTons"
  | "concreteM3"
  | "industrialClients"
  | "ownProjects";

export interface Stat {
  id: string;
  value: number;
  suffix?: string;
  labelKey: StatLabelKey;
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  location: string;
  startDate: string; // YYYY-MM
  endDate: string | null; // null = present
  summary: string;
  highlights: string[];
}

export type ProjectTrack = "structural" | "systems";

export interface ProjectItem {
  id: string;
  track: ProjectTrack;
  name: string;
  role?: string;
  client?: string;
  date: string;
  description: string;
  highlights?: string[];
  stack?: string[];
  featured?: boolean;
  image?: string | null;
  videoUrl?: string;
  draft?: boolean;
}

export interface SkillTag {
  name: string;
  highlight?: boolean;
}

export interface SkillCategory {
  id: string;
  nameKey: "categoryStructural" | "categorySystems";
  description: string;
  tags: SkillTag[];
}

export type EducationType = "degree" | "postgraduate" | "teaching" | "certification";

export interface EducationItem {
  id: string;
  title: string;
  institution: string;
  location: string;
  startYear: number;
  endYear: number | null;
  type: EducationType;
  detail?: string;
}

export interface LanguageItem {
  language: string;
  level: string;
  certification?: string | null;
}

export interface PersonInfo {
  name: string;
  shortName: string;
  role: string;
  location: string;
  email: string;
  phone: string;
  whatsappUrl: string;
  linkedinUrl: string;
  careerStart: string; // YYYY-MM
}

export interface SiteContent {
  person: PersonInfo;
  about: { paragraphs: string[] };
  stats: Stat[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  skills: SkillCategory[];
  education: EducationItem[];
  languages: LanguageItem[];
}
