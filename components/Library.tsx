'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Loader2,
  Shield,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  FileSearch,
  Sparkles,
  FileText,
} from 'lucide-react';
import { useLibraryStore } from '@/lib/stores/library';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useAnalysisStream } from '@/hooks/useAnalysisStream';
import type { DealAnalysis, DealExtraction } from '@/lib/types/deal-analysis';
import { mapDbRowToAnalysis } from '@/lib/types/deal-analysis';

import DealUploadZone from './library/DealUploadZone';
import AnalysisCard from './library/AnalysisCard';
import DealAnalysisResult from './library/DealAnalysisResult';
import ComplianceScoreRing from './library/ComplianceScoreRing';

// Lazy-load wizard to avoid large initial bundle
import dynamic from 'next/dynamic';
const DealValidationWizard = dynamic(
  () => import('./deal-validation/DealValidationWizard'),
  { ssr: false }
);

export default function Library() {
  const { user } = useAuth();
  const { startAnalysis, cancelAnalysis } = useAnalysisStream();

  const {
    analyses,
    setAnalyses,
    activeAnalysisId,
    setActiveAnalysisId,
    analysisStreamStatus,
    currentExtraction,
    analysisFilter,
    setAnalysisFilter,
    analysisSearchQuery,
    setAnalysisSearchQuery,
    getFilteredAnalyses,
    updateAnalysis,
  } = useLibraryStore();

  const [loading, setLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState<DealAnalysis | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardInitialData, setWizardInitialData] = useState<any>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Load analyses on mount
  useEffect(() => {
    if (user) {
      loadAnalyses();
    }
  }, [user]);

  // Auto-open result after analysis completes
  useEffect(() => {
    if (activeAnalysisId && !analysisStreamStatus) {
      const analysis = analyses.find(a => a.id === activeAnalysisId);
      if (analysis) {
        setSelectedAnalysis(analysis);
        setActiveAnalysisId(null);
      }
    }
  }, [activeAnalysisId, analysisStreamStatus, analyses]);

  const loadAnalyses = async () => {
    try {
      setLoading(true);
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;

      const res = await fetch('/api/library/analyses', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setAnalyses(data.analyses);
        }
      }
    } catch (error) {
      console.error('Failed to load analyses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelected = async (file: File) => {
    setUploadError(null);
    try {
      await startAnalysis(file);
      // Refresh list after completion
      await loadAnalyses();
    } catch (error: any) {
      console.error('Analysis failed:', error);
      setUploadError(error.message || 'Analysis failed');
    }
  };

  const handleConvertToDeal = async (analysisId: string) => {
    const analysis = analyses.find(a => a.id === analysisId);
    if (!analysis?.extractionResult) return;

    const extraction = analysis.extractionResult;

    // Pre-populate the wizard with extracted data
    setWizardInitialData({
      thirdPartyName: extraction.brand || '',
      dealType: extraction.dealType || 'other',
      compensation: extraction.compensation?.toString() || '',
      deliverables: extraction.deliverables || '',
      startDate: extraction.startDate || '',
      endDate: extraction.endDate || '',
    });

    setSelectedAnalysis(null);
    setShowWizard(true);
  };

  const handleWizardComplete = async () => {
    setShowWizard(false);
    setWizardInitialData(null);
    // Refresh analyses to show "Converted" badge
    await loadAnalyses();
  };

  const handleDeleteAnalysis = async (analysisId: string) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;

      // Use service role via API or direct delete
      const { error } = await supabase
        .from('deal_analyses')
        .delete()
        .eq('id', analysisId);

      if (!error) {
        setAnalyses(analyses.filter(a => a.id !== analysisId));
        setSelectedAnalysis(null);
      }
    } catch (error) {
      console.error('Failed to delete analysis:', error);
    }
  };

  const filteredAnalyses = getFilteredAnalyses();
  const isAnalyzing = !!analysisStreamStatus && analysisStreamStatus !== 'completed' && analysisStreamStatus !== 'failed';

  // Stats
  const completedAnalyses = analyses.filter(a => a.analysisStatus === 'completed');
  const greenCount = completedAnalyses.filter(a => a.complianceStatus === 'green').length;
  const yellowCount = completedAnalyses.filter(a => a.complianceStatus === 'yellow').length;
  const redCount = completedAnalyses.filter(a => a.complianceStatus === 'red').length;

  if (loading && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-amber-50/20">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-y-auto min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-amber-50/20 py-6 sm:py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto w-full">
        {/* Gradient Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-r from-orange-400/90 via-orange-500/90 to-amber-500/90 rounded-2xl px-6 py-8 mb-8 overflow-hidden shadow-xl shadow-orange-200/50"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 5, repeat: Infinity, repeatDelay: 3 }}
          />
          <div className="relative z-10 flex items-center">
            <motion.div
              className="p-4 bg-white/30 backdrop-blur-sm rounded-2xl mr-5"
              animate={{
                boxShadow: [
                  '0 0 25px rgba(255,255,255,0.5)',
                  '0 0 55px rgba(255,255,255,0.85)',
                  '0 0 25px rgba(255,255,255,0.5)',
                ],
              }}
              transition={{ duration: 3.5, repeat: Infinity }}
            >
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-1">Deal Intelligence</h1>
              <p className="text-white/90 text-lg">Your AI-powered deal analysis assistant</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        {completedAnalyses.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={<FileSearch className="w-5 h-5 text-orange-600" />}
              label="Total Analyses"
              value={completedAnalyses.length}
              delay={0.1}
            />
            <StatCard
              icon={<CheckCircle className="w-5 h-5 text-green-600" />}
              label="Compliant"
              value={greenCount}
              delay={0.2}
            />
            <StatCard
              icon={<Shield className="w-5 h-5 text-amber-600" />}
              label="Needs Review"
              value={yellowCount}
              delay={0.3}
            />
            <StatCard
              icon={<AlertTriangle className="w-5 h-5 text-red-600" />}
              label="Red Flags"
              value={redCount}
              delay={0.4}
            />
          </div>
        )}

        {/* Upload Zone */}
        <div className="mb-8">
          <DealUploadZone
            onFileSelected={handleFileSelected}
            isAnalyzing={isAnalyzing}
            currentStatus={analysisStreamStatus}
          />
          {uploadError && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-600 mt-2 flex items-center gap-1.5"
            >
              <AlertTriangle className="w-4 h-4" />
              {uploadError}
            </motion.p>
          )}
        </div>

        {/* Live Extraction Preview */}
        <AnimatePresence>
          {isAnalyzing && currentExtraction && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden"
            >
              <div className="bg-white rounded-xl border border-orange-200 shadow-md p-6">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
                  Analyzing your document...
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <span className="text-xs text-orange-600">Brand</span>
                    <p className="font-medium">{currentExtraction.brand}</p>
                  </div>
                  {currentExtraction.compensation && (
                    <div className="p-2 bg-orange-50 rounded-lg">
                      <span className="text-xs text-orange-600">Compensation</span>
                      <p className="font-medium">${currentExtraction.compensation.toLocaleString()}</p>
                    </div>
                  )}
                  {currentExtraction.deliverables && (
                    <div className="p-2 bg-orange-50 rounded-lg col-span-2">
                      <span className="text-xs text-orange-600">Deliverables</span>
                      <p className="font-medium truncate">{currentExtraction.deliverables}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters + Search */}
        {completedAnalyses.length > 0 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
            <div className="flex items-center gap-2 bg-white rounded-xl p-2 border border-orange-100 shadow-sm">
              <Filter className="w-4 h-4 text-orange-400 ml-2" />
              {(['all', 'green', 'yellow', 'red'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setAnalysisFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    analysisFilter === f
                      ? 'bg-gradient-to-r from-orange-400 to-amber-500 text-white shadow-md shadow-orange-200/50'
                      : 'text-gray-600 hover:bg-orange-50 hover:text-orange-700'
                  }`}
                >
                  {f === 'all' ? 'All' : f === 'green' ? 'Compliant' : f === 'yellow' ? 'Needs Review' : 'Red Flags'}
                </button>
              ))}
            </div>

            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by brand..."
                value={analysisSearchQuery}
                onChange={(e) => setAnalysisSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-orange-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm bg-white shadow-sm"
              />
            </div>
          </div>
        )}

        {/* Analysis Grid */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
        ) : filteredAnalyses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAnalyses.map((analysis, i) => (
              <AnalysisCard
                key={analysis.id}
                analysis={analysis}
                onClick={() => setSelectedAnalysis(analysis)}
                index={i}
              />
            ))}
          </div>
        ) : completedAnalyses.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center"
          >
            <Shield className="w-10 h-10 text-orange-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-800 mb-1">No Matching Analyses</h3>
            <p className="text-gray-500">Try adjusting your filters or search term.</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center"
          >
            <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-7 h-7 text-orange-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Your analyses will appear here</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              Upload a document above and our AI will extract key deal terms,
              flag risks, and run a full compliance check.
            </p>
          </motion.div>
        )}
      </div>

      {/* Analysis Detail Modal */}
      {selectedAnalysis && (
        <DealAnalysisResult
          analysis={selectedAnalysis}
          onClose={() => setSelectedAnalysis(null)}
          onConvertToDeal={handleConvertToDeal}
          onDelete={handleDeleteAnalysis}
        />
      )}

      {/* Deal Validation Wizard Modal */}
      {showWizard && wizardInitialData && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setShowWizard(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-4 sm:inset-8 lg:inset-16 bg-white rounded-2xl shadow-2xl z-50 overflow-auto"
          >
            <DealValidationWizard
              isModal={true}
              initialData={wizardInitialData}
              onComplete={handleWizardComplete}
              onClose={() => {
                setShowWizard(false);
                setWizardInitialData(null);
              }}
            />
          </motion.div>
        </>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, delay }: { icon: React.ReactNode; label: string; value: number; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 400, damping: 17 }}
      whileHover={{ scale: 1.05, y: -4, boxShadow: '0 20px 40px rgba(249,115,22,0.3)' }}
      className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 shadow-md border border-orange-100 cursor-default"
    >
      <div className="flex items-center justify-between mb-2">
        {icon}
        <span className="text-xs text-orange-700/70 font-medium">{label}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
    </motion.div>
  );
}
