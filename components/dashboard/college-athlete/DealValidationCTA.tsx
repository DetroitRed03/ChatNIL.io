'use client';

import { motion } from 'framer-motion';
import { Shield, Plus } from 'lucide-react';

interface DealValidationCTAProps {
  onClick: () => void;
  disabled?: boolean;
}

export function DealValidationCTA({ onClick, disabled }: DealValidationCTAProps) {
  return (
    <motion.button
      data-testid="validate-deal-cta"
      onClick={onClick}
      disabled={disabled}
      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700
                 text-white font-semibold py-4 px-6 rounded-xl shadow-lg
                 flex items-center justify-center gap-3
                 disabled:opacity-50 disabled:cursor-not-allowed
                 transition-all duration-200"
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
    >
      <div className="flex items-center gap-2">
        <Shield className="w-5 h-5" />
        <Plus className="w-4 h-4" />
      </div>
      <span className="text-lg">Validate New Deal</span>
    </motion.button>
  );
}
