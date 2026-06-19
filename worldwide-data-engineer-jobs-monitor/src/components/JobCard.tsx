import React from 'react';

export function JobCard({ job }: { job: any }) {
  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{job.title}</h2>
          <p className="text-lg text-gray-600">{job.company}</p>
        </div>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {job.sourceName}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
        <div>
          <span className="font-semibold text-gray-700">Location:</span> {job.location || 'N/A'}
        </div>
        {job.salary && (
          <div>
            <span className="font-semibold text-gray-700">Salary:</span> {job.salary}
          </div>
        )}
        {job.publishedAt && (
          <div>
            <span className="font-semibold text-gray-700">Published:</span> {new Date(job.publishedAt).toLocaleDateString()}
          </div>
        )}
      </div>

      <div className="text-sm bg-gray-50 p-3 rounded mt-2">
        <div className="mb-1">
          <span className="font-semibold text-green-700">Role Evidence:</span> {job.roleEvidenceQuote || 'N/A'}
        </div>
        <div>
          <span className="font-semibold text-green-700">Worldwide Evidence:</span> {job.worldwideEvidenceQuote || 'N/A'}
        </div>
      </div>

      <div className="mt-auto pt-4">
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full"
        >
          Apply Now
        </a>
      </div>
    </div>
  );
}
