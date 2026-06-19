import { describe, it, expect } from 'vitest';
import { validateRole, validateWorldwide } from '@/lib/validation';
import { RawJob } from '@/lib/fetchers/types';

describe('Validation Logic', () => {
  const baseJob: RawJob = {
    title: '',
    company: 'Test Inc',
    location: '',
    description: '',
    url: 'http://test.com',
    sourceName: 'Test',
    rawPayloadJson: '{}',
  };

  describe('validateRole', () => {
    it('accepts Data Engineer roles', () => {
      const job = { ...baseJob, title: 'Data Engineer', description: 'Looking for a DE' };
      const result = validateRole(job);
      expect(result.valid).toBe(true);
      expect(result.evidenceQuote).toContain('data engineer');
    });

    it('rejects unrelated roles like AI Video Editor', () => {
      const job = { ...baseJob, title: 'AI Video Editor', description: 'Edit videos with AI' };
      const result = validateRole(job);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('rejected due to title containing: video editor');
    });

    it('rejects Data Analyst and Data Scientist', () => {
      let job = { ...baseJob, title: 'Data Analyst' };
      expect(validateRole(job).valid).toBe(false);
      expect(validateRole(job).reason).toContain('data analyst');

      job = { ...baseJob, title: 'Data Scientist' };
      expect(validateRole(job).valid).toBe(false);
      expect(validateRole(job).reason).toContain('data scientist');
    });
  });

  describe('validateWorldwide', () => {
    it('accepts worldwide jobs', () => {
      const job = { ...baseJob, location: 'Worldwide', description: 'Work from anywhere' };
      const result = validateWorldwide(job);
      expect(result.valid).toBe(true);
      expect(result.evidenceQuote).toContain('worldwide');
    });

    it('rejects US only, UK only, Canada only, EU only, Brazil only', () => {
      const restrictedLocations = ['US only', 'UK only', 'Canada only', 'EU only', 'Brazil only'];
      for (const loc of restrictedLocations) {
        const job = { ...baseJob, location: loc };
        const result = validateWorldwide(job);
        expect(result.valid).toBe(false);
        expect(result.reason?.toLowerCase()).toContain('restricted');
      }
    });

    it('rejects jobs lacking worldwide evidence', () => {
      const job = { ...baseJob, location: 'Remote', description: 'Work remotely' };
      const result = validateWorldwide(job);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('No explicit worldwide evidence found');
    });
  });
});
