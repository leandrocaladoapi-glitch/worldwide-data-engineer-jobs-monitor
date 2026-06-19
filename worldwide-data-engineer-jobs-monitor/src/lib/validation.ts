import { RawJob } from './fetchers/types';

export const ACCEPTED_TITLES = [
  'data engineer',
  'senior data engineer',
  'staff data engineer',
  'lead data engineer',
  'principal data engineer',
  'analytics engineer',
  'big data engineer',
  'cloud data engineer',
  'platform data engineer',
  'data infrastructure engineer',
  'data pipeline engineer'
];

export const REJECTED_TITLES = [
  'data analyst',
  'data scientist',
  'machine learning engineer',
  'mlops',
  'ai engineer',
  'prompt engineer',
  'software engineer',
  'backend engineer',
  'full stack engineer',
  'product manager',
  'designer',
  'video editor',
  'marketing',
  'sales',
  'customer success',
  'support',
  'recruiter',
  'architect'
];

export const WORLDWIDE_EVIDENCE = [
  'worldwide',
  'remote worldwide',
  'work from anywhere',
  'anywhere in the world',
  'global',
  'international applicants welcome',
  'open to candidates globally',
  'remote, timezone overlap only',
  'americas / emea / apac allowed',
  'latam allowed',
  'europe and americas allowed'
];

export const RESTRICTED_EVIDENCE = [
  'us only',
  'usa',
  'united states',
  'canada only',
  'uk only',
  'eu only',
  'brazil only',
  'must reside in',
  'citizens only',
  'residents only',
  'visa unavailable',
  'no sponsorship',
  'requires local work authorization',
  'hybrid',
  'on-site'
];

export type ValidationResult = {
  valid: boolean;
  reason?: string;
  evidenceQuote?: string;
};

export function validateRole(job: RawJob): ValidationResult {
  const searchableText = `${job.title} ${job.description}`.toLowerCase();
  const titleLower = job.title.toLowerCase();
  const compLower = job.company.toLowerCase();

  for (const rejected of REJECTED_TITLES) {
    if (titleLower.includes(rejected.toLowerCase())) {
      return { valid: false, reason: `Role rejected due to title containing: ${rejected}` };
    }
  }

  // Reject HackerNews spam jobs that don't actually match
  if (job.sourceName === 'Hacker News' && !searchableText.includes('data engineer')) {
     return { valid: false, reason: 'Does not match any accepted Data Engineer roles.' };
  }

  for (const accepted of ACCEPTED_TITLES) {
    if (titleLower.includes(accepted.toLowerCase()) || compLower.includes(accepted.toLowerCase())) {
      return { valid: true, evidenceQuote: `Title or Company matched accepted role: ${accepted}` };
    }
  }

  if (searchableText.includes('data engineer')) {
     return { valid: true, evidenceQuote: `Description matched accepted role keyword: data engineer` };
  }

  return { valid: false, reason: 'Does not match any accepted Data Engineer roles.' };
}

export function validateWorldwide(job: RawJob): ValidationResult {
  const searchableText = `${job.location} ${job.description}`.toLowerCase();

  for (const restricted of RESTRICTED_EVIDENCE) {
    if (searchableText.includes(restricted.toLowerCase())) {
      return { valid: false, reason: `Location restricted due to: ${restricted}` };
    }
  }

  for (const evidence of WORLDWIDE_EVIDENCE) {
    if (searchableText.includes(evidence.toLowerCase())) {
      return { valid: true, evidenceQuote: `Matched worldwide evidence: ${evidence}` };
    }
  }

  return { valid: false, reason: 'No explicit worldwide evidence found.' };
}
