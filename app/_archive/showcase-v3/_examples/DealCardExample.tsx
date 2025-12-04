'use client';

import { motion } from 'framer-motion';
import { Building2, Calendar, DollarSign, FileText, Stamp } from 'lucide-react';

export function DealCardExample() {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 35
      }}
      className="w-full max-w-md"
    >
      <div
        className="relative bg-gradient-to-br from-white via-[#FFFBF7] to-white rounded-2xl border-2 border-[#E8E4DF] overflow-hidden"
        style={{
          boxShadow: `
            0 10px 30px -5px rgba(234, 88, 12, 0.08),
            0 4px 12px -2px rgba(234, 88, 12, 0.05),
            inset 0 1px 0 0 rgba(255, 255, 255, 0.9)
          `
        }}
      >
        {/* Invoice Header */}
        <div className="relative border-b-2 border-[#E8E4DF] bg-gradient-to-br from-[#FFF8F0] via-white to-[#FFFBF7] px-6 py-5">
          {/* Embossed line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />

          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ea580c] to-[#92400e] flex items-center justify-center"
                  style={{
                    boxShadow: `
                      0 4px 12px -2px rgba(234, 88, 12, 0.3),
                      inset 0 -2px 4px 0 rgba(0, 0, 0, 0.2)
                    `
                  }}
                >
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1a1d20] tracking-tight text-lg">
                    Nike Partnership
                  </h3>
                  <p className="text-xs text-[#adb5bd] tracking-wide">
                    Deal #NIL-2024-0892
                  </p>
                </div>
              </div>
            </div>

            {/* Wax seal style badge */}
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: 'spring',
                stiffness: 150,
                damping: 40,
                delay: 0.2
              }}
              className="relative"
            >
              <div
                className="w-16 h-16 rounded-full bg-gradient-to-br from-[#fcd34d] via-[#f59e0b] to-[#ea580c] flex items-center justify-center relative"
                style={{
                  boxShadow: `
                    0 4px 12px -2px rgba(252, 211, 77, 0.4),
                    inset 0 -2px 6px 0 rgba(0, 0, 0, 0.2),
                    inset 0 2px 2px 0 rgba(255, 255, 255, 0.3)
                  `
                }}
              >
                <Stamp className="w-7 h-7 text-white" />
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                />
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[#10b981] text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                ACTIVE
              </div>
            </motion.div>
          </div>

          {/* Deal Terms */}
          <div className="grid grid-cols-2 gap-3">
            <div
              className="bg-gradient-to-br from-[#FAF6F1] to-[#FFF8F0] rounded-lg p-3 border border-[#E8E4DF]"
              style={{
                boxShadow: `
                  inset 2px 2px 4px rgba(0, 0, 0, 0.03),
                  inset -2px -2px 4px rgba(255, 255, 255, 0.8)
                `
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-[#ea580c]" />
                <span className="text-xs text-[#adb5bd] tracking-wide uppercase font-medium">
                  Deal Value
                </span>
              </div>
              <div className="text-xl font-bold text-[#1a1d20] tracking-tight">
                $25,000
              </div>
            </div>

            <div
              className="bg-gradient-to-br from-[#FAF6F1] to-[#FFF8F0] rounded-lg p-3 border border-[#E8E4DF]"
              style={{
                boxShadow: `
                  inset 2px 2px 4px rgba(0, 0, 0, 0.03),
                  inset -2px -2px 4px rgba(255, 255, 255, 0.8)
                `
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-[#ea580c]" />
                <span className="text-xs text-[#adb5bd] tracking-wide uppercase font-medium">
                  Duration
                </span>
              </div>
              <div className="text-xl font-bold text-[#1a1d20] tracking-tight">
                12 Months
              </div>
            </div>
          </div>
        </div>

        {/* Deal Details */}
        <div className="px-6 py-5 space-y-4">
          {/* Deliverables */}
          <div>
            <h4 className="text-sm font-bold text-[#495057] mb-3 tracking-wide uppercase flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#ea580c]" />
              Deliverables
            </h4>
            <div className="space-y-2">
              {[
                { item: '4 Instagram posts per month', completed: true },
                { item: '2 Appearances at events', completed: true },
                { item: 'Exclusive product line collaboration', completed: false },
              ].map((deliverable, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.3 + index * 0.1,
                    duration: 0.5,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                  className="flex items-start gap-3"
                >
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      deliverable.completed
                        ? 'bg-gradient-to-br from-[#10b981] to-[#059669]'
                        : 'bg-gradient-to-br from-[#FAF6F1] to-[#FFF8F0] border border-[#E8E4DF]'
                    }`}
                    style={deliverable.completed ? {
                      boxShadow: `
                        0 2px 8px -1px rgba(16, 185, 129, 0.3),
                        inset 0 -1px 2px 0 rgba(0, 0, 0, 0.2)
                      `
                    } : {
                      boxShadow: `
                        inset 2px 2px 4px rgba(0, 0, 0, 0.03),
                        inset -2px -2px 4px rgba(255, 255, 255, 0.8)
                      `
                    }}
                  >
                    {deliverable.completed && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-sm ${deliverable.completed ? 'text-[#495057]' : 'text-[#adb5bd]'}`}>
                    {deliverable.item}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#6c757d] tracking-wide uppercase">
                Contract Progress
              </span>
              <span className="text-sm font-bold text-[#ea580c]">68%</span>
            </div>
            <div
              className="h-3 bg-gradient-to-br from-[#FAF6F1] to-[#FFF8F0] rounded-full overflow-hidden border border-[#E8E4DF]"
              style={{
                boxShadow: `
                  inset 2px 2px 4px rgba(0, 0, 0, 0.05),
                  inset -1px -1px 3px rgba(255, 255, 255, 0.8)
                `
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '68%' }}
                transition={{
                  duration: 1.5,
                  ease: [0.25, 0.46, 0.45, 0.94],
                  delay: 0.5
                }}
                className="h-full bg-gradient-to-r from-[#fcd34d] via-[#ea580c] to-[#92400e] relative"
                style={{
                  boxShadow: `
                    0 0 8px rgba(234, 88, 12, 0.4),
                    inset 0 -1px 2px rgba(0, 0, 0, 0.2)
                  `
                }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
              </motion.div>
            </div>
          </div>

          {/* Action Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-[#ea580c] via-[#c2410c] to-[#92400e] text-white font-bold py-3.5 rounded-xl relative overflow-hidden group mt-2"
            style={{
              boxShadow: `
                0 4px 12px -2px rgba(234, 88, 12, 0.4),
                inset 0 -2px 4px 0 rgba(0, 0, 0, 0.2)
              `
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <span className="relative tracking-wide">View Contract Details</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
