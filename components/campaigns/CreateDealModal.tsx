'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, DollarSign, Calendar, Loader2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreateDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (deal: any) => void;
  athleteId: string;
  athleteName: string;
  campaignId?: string;
  campaignName?: string;
}

const DEAL_TYPES = [
  { value: 'sponsorship', label: 'Sponsorship' },
  { value: 'endorsement', label: 'Endorsement' },
  { value: 'appearance', label: 'Appearance' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'licensing', label: 'Licensing' },
  { value: 'merchandise', label: 'Merchandise' },
  { value: 'content_creation', label: 'Content Creation' },
  { value: 'other', label: 'Other' },
];

export function CreateDealModal({
  isOpen,
  onClose,
  onSuccess,
  athleteId,
  athleteName,
  campaignId,
  campaignName,
}: CreateDealModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    deal_title: campaignName ? `${campaignName} - Deal` : '',
    deal_type: 'sponsorship',
    brand_name: '',
    description: '',
    compensation_amount: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    deliverables: [] as string[],
    newDeliverable: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/nil-deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          athlete_id: athleteId,
          deal_title: formData.deal_title,
          deal_type: formData.deal_type,
          brand_name: formData.brand_name || null,
          description: formData.description || null,
          compensation_amount: formData.compensation_amount ? parseFloat(formData.compensation_amount) : null,
          start_date: formData.start_date,
          end_date: formData.end_date || null,
          deliverables: formData.deliverables,
          status: 'draft',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create deal');
      }

      const data = await response.json();
      setSuccess(true);

      setTimeout(() => {
        onSuccess?.(data.deal);
        onClose();
        // Reset form
        setSuccess(false);
        setFormData({
          deal_title: '',
          deal_type: 'sponsorship',
          brand_name: '',
          description: '',
          compensation_amount: '',
          start_date: new Date().toISOString().split('T')[0],
          end_date: '',
          deliverables: [],
          newDeliverable: '',
        });
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create deal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addDeliverable = () => {
    if (formData.newDeliverable.trim()) {
      setFormData({
        ...formData,
        deliverables: [...formData.deliverables, formData.newDeliverable.trim()],
        newDeliverable: '',
      });
    }
  };

  const removeDeliverable = (index: number) => {
    setFormData({
      ...formData,
      deliverables: formData.deliverables.filter((_, i) => i !== index),
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Create NIL Deal</h2>
                <p className="text-white/80 text-sm">with {athleteName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Deal Created!</h3>
                <p className="text-gray-600">Your NIL deal has been created successfully.</p>
              </motion.div>
            ) : (
              <div className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    {error}
                  </div>
                )}

                {/* Deal Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Deal Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.deal_title}
                    onChange={(e) => setFormData({ ...formData, deal_title: e.target.value })}
                    placeholder="e.g., Summer Brand Ambassador Partnership"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                  />
                </div>

                {/* Deal Type & Brand */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Deal Type *
                    </label>
                    <select
                      required
                      value={formData.deal_type}
                      onChange={(e) => setFormData({ ...formData, deal_type: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors bg-white"
                    >
                      {DEAL_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Brand Name
                    </label>
                    <input
                      type="text"
                      value={formData.brand_name}
                      onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
                      placeholder="e.g., Nike, Gatorade"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Compensation */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Compensation Amount
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.compensation_amount}
                      onChange={(e) => setFormData({ ...formData, compensation_amount: e.target.value })}
                      placeholder="0.00"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        required
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      End Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        value={formData.end_date}
                        min={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the deal terms, expectations, and any special conditions..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors resize-none"
                  />
                </div>

                {/* Deliverables */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Deliverables
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={formData.newDeliverable}
                      onChange={(e) => setFormData({ ...formData, newDeliverable: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDeliverable())}
                      placeholder="e.g., 3 Instagram posts per month"
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={addDeliverable}
                      className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-gray-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  {formData.deliverables.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.deliverables.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg"
                        >
                          <span className="text-sm text-green-700">{item}</span>
                          <button
                            type="button"
                            onClick={() => removeDeliverable(index)}
                            className="text-green-600 hover:text-green-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="px-6 py-3 text-gray-700 font-semibold hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={cn(
                      'flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl transition-all',
                      isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-green-500/30'
                    )}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <FileText className="w-5 h-5" />
                        Create Deal
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default CreateDealModal;
