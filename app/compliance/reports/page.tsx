'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, FileText, Download, Calendar, Filter, Loader2 } from 'lucide-react';

export default function NCAAReportsPage() {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      setGenerating(true);

      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const params = new URLSearchParams();
      params.set('format', format);
      if (selectedStatuses.length > 0) {
        params.set('status', selectedStatuses.join(','));
      }

      const response = await fetch(`/api/compliance/export?${params.toString()}`, {
        credentials: 'include',
        headers: accessToken ? {
          'Authorization': `Bearer ${accessToken}`,
        } : {},
      });

      if (!response.ok) throw new Error('Export failed');

      if (format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ncaa_compliance_report_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ncaa_compliance_report_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const toggleStatus = (status: string) => {
    if (selectedStatuses.includes(status)) {
      setSelectedStatuses(selectedStatuses.filter(s => s !== status));
    } else {
      setSelectedStatuses([...selectedStatuses, status]);
    }
  };

  const statusOptions = [
    { value: 'red', label: 'Red (Critical)', color: 'bg-red-500' },
    { value: 'yellow', label: 'Yellow (Review)', color: 'bg-amber-500' },
    { value: 'green', label: 'Green (Compliant)', color: 'bg-green-500' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.push('/compliance/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">NCAA Compliance Reports</h1>
              <p className="text-sm text-gray-500">Generate and export compliance data</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Report Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Configuration</h2>

          {/* Status Filter */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <Filter className="w-4 h-4" />
              Filter by Compliance Status
            </label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map(status => (
                <button
                  key={status.value}
                  onClick={() => toggleStatus(status.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedStatuses.includes(status.value)
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${status.color}`} />
                  {status.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {selectedStatuses.length === 0 ? 'All statuses will be included' : `${selectedStatuses.length} status(es) selected`}
            </p>
          </div>

          {/* Date Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              Report generated: {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>

          {/* Export Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => handleExport('csv')}
              disabled={generating}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              {generating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
              Download CSV
            </button>
            <button
              onClick={() => handleExport('json')}
              disabled={generating}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {generating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <FileText className="w-5 h-5" />
              )}
              Download JSON
            </button>
          </div>
        </motion.div>

        {/* Report Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Contents</h2>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-blue-600">1</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Athlete Information</p>
                <p className="text-sm text-gray-500">Name, email, sport for all athletes with deals</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-blue-600">2</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Deal Details</p>
                <p className="text-sm text-gray-500">Third party, deal type, compensation, deliverables, dates</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-blue-600">3</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Compliance Scores</p>
                <p className="text-sm text-gray-500">Total score, status, and all 6 dimension scores</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* NCAA Compliance Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-amber-50 border border-amber-200 rounded-2xl p-6"
        >
          <h3 className="font-medium text-amber-800 mb-2">NCAA Reporting Reminder</h3>
          <p className="text-sm text-amber-700">
            NCAA rules require institutions to report NIL activities. This report is designed to help
            with compliance documentation but should be reviewed by your compliance office before
            submission. Ensure all required disclosures are made within the required timeframe.
          </p>
        </motion.div>
      </main>
    </div>
  );
}
