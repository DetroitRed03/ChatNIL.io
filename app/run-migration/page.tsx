'use client';

import { useState } from 'react';

export default function RunMigrationPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const runMigration = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/run-migration', {
        method: 'POST',
      });
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error: any) {
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Run Badge RLS Migration</h1>
        <button
          onClick={runMigration}
          disabled={loading}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
        >
          {loading ? 'Running...' : 'Run Migration'}
        </button>
        {result && (
          <pre className="mt-4 p-4 bg-white rounded-lg border border-gray-200 overflow-auto">
            {result}
          </pre>
        )}
      </div>
    </div>
  );
}
