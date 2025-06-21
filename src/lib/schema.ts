import { z } from 'zod';

const profileSchema = z.object({
  network: z.string(),
  username: z.string(),
  url: z.string().url(),
});

const basicsSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  url: z.string().url(),
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
  summary: z.string(),
  highlights: z.array(z.string()),
});

const educationSchema = z.object({
  institution: z.string(),
  url: z.string().url().optional(),
  studyType: z.string(),
  area: z.string().optional(),
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
  level: z.string(),
  keywords: z.array(z.string()),
});

const projectSchema = z.object({
  name: z.string(),
  description: z.string(),
  url: z.string().url().optional(),
  startDate: z.string(),
  endDate: z.string().nullable(),
  highlights: z.array(z.string()),
});

export const resumeSchema = z.object({
  basics: basicsSchema,
  work: z.array(workSchema),
  education: z.array(educationSchema),
  certificates: z.array(certificateSchema),
  publications: z.array(publicationSchema),
  skills: z.array(skillSchema).optional(),
  projects: z.array(projectSchema),
});

export type Resume = z.infer<typeof resumeSchema>;
export type Basics = z.infer<typeof basicsSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type Work = z.infer<typeof workSchema>;
export type Education = z.infer<typeof educationSchema>;
export type Certificate = z.infer<typeof certificateSchema>;
export type Publication = z.infer<typeof publicationSchema>;
export type Skill = z.infer<typeof skillSchema>;
export type Project = z.infer<typeof projectSchema>; 