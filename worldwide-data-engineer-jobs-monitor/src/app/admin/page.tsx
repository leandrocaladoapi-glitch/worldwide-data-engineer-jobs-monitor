'use client';

import { useState, useEffect } from 'react';

export default function AdminLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/logs');
        const data = await res.json();
        setLogs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <main className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Admin / Logs</h1>
          <a href="/" className="text-blue-600 hover:text-blue-800 font-medium my-auto">← Back to Homepage</a>
        </header>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading logs...</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No ingestion logs found.</div>
        ) : (
          <div className="flex flex-col gap-6">
            {logs.map((log) => (
              <div key={log.id} className={`border rounded-lg p-6 bg-white shadow-sm ${log.success ? 'border-green-300' : 'border-red-300'}`}>
                <div className="flex justify-between mb-4">
                  <div>
                    <span className="font-bold text-gray-700">Run ID:</span> {log.id}
                  </div>
                  <div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${log.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {log.success ? 'SUCCESS' : 'FAILED'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm text-gray-600">
                  <div><span className="font-semibold">Started:</span> {new Date(log.startedAt).toLocaleString()}</div>
                  {log.finishedAt && <div><span className="font-semibold">Finished:</span> {new Date(log.finishedAt).toLocaleString()}</div>}
                  <div><span className="font-semibold">Total Fetched:</span> {log.totalFetched}</div>
                  <div><span className="font-semibold">Total Accepted:</span> <span className="text-green-600 font-bold">{log.totalAccepted}</span></div>
                  <div><span className="font-semibold">Total Rejected:</span> <span className="text-red-600 font-bold">{log.totalRejected}</span></div>
                  <div><span className="font-semibold">Total Duplicate:</span> {log.totalDuplicate}</div>
                  <div><span className="font-semibold">Total Invalid:</span> {log.totalInvalid}</div>
                </div>

                {!log.success && log.failureReason && (
                  <div className="mt-4 p-3 bg-red-50 text-red-800 text-sm rounded border border-red-200">
                    <span className="font-bold">Failure Reason: </span>{log.failureReason}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
