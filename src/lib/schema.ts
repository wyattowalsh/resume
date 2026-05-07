import { z } from 'zod';

const profileSchema = z.object({
  network: z.string(),
  username: z.string(),
  url: z.string().url(),
});

export const imageSchema = z.string().url().or(z.string().startsWith("/"));

const selectionHintsSchema = z.object({
  themes: z.array(z.string()).optional(),
  aliases: z.array(z.string()).optional(),
  impactSignals: z.array(z.string()).optional(),
});

const basicsSchema = z.object({
  name: z.string(),
  label: z.string().optional(),
  email: z.string().email(),
  phone: z.string(),
  url: z.string().url(),
  image: imageSchema.optional(),
  summary: z.string().optional(),
  location: z.object({
    city: z.string(),
    region: z.string(),
    countryCode: z.string(),
  }),
  profiles: z.array(profileSchema),
});

const workSchema = z.object({
  name: z.string(),
  position: z.string(),
  url: z.string().url().optional(),
  startDate: z.string(),
  endDate: z.string().nullable(),
  location: z.string(),
  summary: z.string().optional(),
  highlights: z.array(z.string()),
  selectionHints: selectionHintsSchema.optional(),
});

const educationSchema = z.object({
  institution: z.string(),
  url: z.string().url().optional(),
  studyType: z.string(),
  area: z.string().optional(),
  score: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
});

const certificateSchema = z.object({
  name: z.string(),
  issuer: z.string(),
  date: z.string(),
  url: z.string().url().optional(),
});

const publicationSchema = z.object({
  name: z.string(),
  publisher: z.string(),
  releaseDate: z.string(),
  url: z.string().url(),
});

const skillSchema = z.object({
  name: z.string(),
  level: z.string().optional(),
  keywords: z.array(z.string()),
  selectionHints: selectionHintsSchema.optional(),
});

const projectSchema = z.object({
  name: z.string(),
  description: z.string(),
  url: z.string().url().optional(),
  githubUrl: z.string().url(),
  links: z.array(z.object({ label: z.string(), url: z.string().url() })).optional(),
  stack: z.array(z.string()).optional(),
  startDate: z.string(),
  endDate: z.string().nullable(),
  highlights: z.array(z.string()),
  selectionHints: selectionHintsSchema.optional(),
});

export const resumeSchema = z.object({
  basics: basicsSchema,
  work: z.array(workSchema),
  education: z.array(educationSchema),
  certificates: z.array(certificateSchema).optional(),
  publications: z.array(publicationSchema).optional(),
  skills: z.array(skillSchema).optional(),
  projects: z.array(projectSchema).optional(),
});

export type Resume = z.infer<typeof resumeSchema>;
export type Basics = z.infer<typeof basicsSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type SelectionHints = z.infer<typeof selectionHintsSchema>;
export type Work = z.infer<typeof workSchema>;
export type Education = z.infer<typeof educationSchema>;
export type Certificate = z.infer<typeof certificateSchema>;
export type Publication = z.infer<typeof publicationSchema>;
export type Skill = z.infer<typeof skillSchema>;
export type Project = z.infer<typeof projectSchema>; 
