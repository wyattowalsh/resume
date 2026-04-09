import fullVariantData from '@assets/data/variants/full.json';
import singleVariantData from '@assets/data/variants/single.json';
import siteVariantData from '@assets/data/variants/site.json';
import resumeData from '@assets/data/resume.json';
import { describe, expect, it } from 'vitest';
import { getResumeVariant } from './resume-data';

interface WorkSelection {
  name: string;
  summary?: string;
  highlightIndexes?: number[];
}

interface ProjectSelection {
  name: string;
  description?: string;
  highlightIndexes?: number[];
}

interface SkillSelection {
  name: string;
  keywordIndexes?: number[];
}

function pickByIndexes<T>(values: T[], indexes?: number[]) {
  return indexes ? indexes.map((index) => values[index]) : values;
}

function getBaseWork(name: string) {
  const item = resumeData.work.find((entry) => entry.name === name);

  expect(item).toBeDefined();
  return item!;
}

function getBaseProject(name: string) {
  const item = resumeData.projects?.find((entry) => entry.name === name);

  expect(item).toBeDefined();
  return item!;
}

function getBaseSkill(name: string) {
  const item = resumeData.skills?.find((entry) => entry.name === name);

  expect(item).toBeDefined();
  return item!;
}

describe('getResumeVariant', () => {
  it('memoizes resolved variants', () => {
    expect(getResumeVariant('full')).toBe(getResumeVariant('full'));
  });

  it('applies basics summary overrides for curated variants', () => {
    expect(getResumeVariant('site').basics.summary).toBe(siteVariantData.basics?.summary);
    expect(getResumeVariant('single').basics.summary).toBeUndefined();
  });

  it('resolves full-artifact work selections in declared order', () => {
    const expectedWork = ((fullVariantData.work ?? []) as WorkSelection[]).map((selection) => {
      const baseJob = getBaseWork(selection.name);

      return {
        ...baseJob,
        summary: selection.summary ?? baseJob.summary,
        highlights: pickByIndexes(baseJob.highlights, selection.highlightIndexes),
      };
    });

    expect(getResumeVariant('full').work).toEqual(expectedWork);
  });

  it('resolves single-artifact projects and skills from configured indexes', () => {
    const single = getResumeVariant('single');
    const expectedProjects = ((singleVariantData.projects ?? []) as ProjectSelection[]).map(
      (selection) => {
        const baseProject = getBaseProject(selection.name);

        return {
          ...baseProject,
          description: selection.description ?? baseProject.description,
          highlights: pickByIndexes(baseProject.highlights, selection.highlightIndexes),
        };
      },
    );
    const expectedSkills = ((singleVariantData.skills ?? []) as SkillSelection[]).map(
      (selection) => {
        const baseSkill = getBaseSkill(selection.name);

        return {
          ...baseSkill,
          keywords: pickByIndexes(baseSkill.keywords, selection.keywordIndexes),
        };
      },
    );

    expect(single.projects).toEqual(expectedProjects);
    expect(single.skills).toEqual(expectedSkills);
  });

  it('preserves single-artifact education order from the variant file', () => {
    const expectedEducation = (singleVariantData.education ?? []).map((institution) => {
      const item = resumeData.education.find((entry) => entry.institution === institution);

      expect(item).toBeDefined();
      return item!;
    });

    expect(getResumeVariant('single').education).toEqual(expectedEducation);
  });
});
