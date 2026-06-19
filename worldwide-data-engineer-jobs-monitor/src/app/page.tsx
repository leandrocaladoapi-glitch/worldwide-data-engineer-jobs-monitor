'use client';

import { useState, useEffect } from 'react';
import { JobCard } from '@/components/JobCard';

export default function Home() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ingesting, setIngesting] = useState(false);
  const [ingestResult, setIngestResult] = useState<any>(null);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/jobs/accepted');
      const data = await res.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const triggerIngestion = async () => {
    setIngesting(true);
    setIngestResult(null);
    try {
      const res = await fetch('/api/ingest', { method: 'POST' });
      const data = await res.json();
      setIngestResult(data);
      if (data.success) {
        await fetchJobs();
      }
    } catch (err: any) {
      setIngestResult({ success: false, failureReason: err.message });
    } finally {
      setIngesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <main className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Worldwide Data Engineer Jobs</h1>
          <div className="flex gap-4">
            <a href="/admin" className="text-blue-600 hover:text-blue-800 font-medium my-auto">Admin / Logs</a>
            <button
              onClick={triggerIngestion}
              disabled={ingesting}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              {ingesting ? 'Ingesting...' : 'Trigger Manual Ingestion'}
            </button>
          </div>
        </header>

        {ingestResult && (
          <div className={`mb-8 p-4 rounded-md ${ingestResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <h3 className={`text-lg font-medium ${ingestResult.success ? 'text-green-800' : 'text-red-800'}`}>
              Ingestion {ingestResult.success ? 'Successful' : 'Failed'}
            </h3>
            <p className="mt-2 text-sm text-gray-700">
              Fetched: {ingestResult.totalFetched} |
              Accepted: {ingestResult.totalAccepted} |
              Rejected: {ingestResult.totalRejected} |
              Duplicates: {ingestResult.totalDuplicate} |
              Invalid: {ingestResult.totalInvalid}
            </p>
            {ingestResult.failureReason && (
              <p className="mt-2 text-sm text-red-700 font-semibold bg-red-100 p-2 rounded">
                {ingestResult.failureReason}
              </p>
            )}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No worldwide Data Engineer jobs found. Try triggering an ingestion.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
