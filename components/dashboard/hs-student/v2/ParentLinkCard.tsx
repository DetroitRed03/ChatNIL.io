'use client';

import { motion } from 'framer-motion';

interface ParentLinkCardProps {
  connected: boolean;
  parentName?: string;
  parentEmail?: string;
  onInvite: () => void;
  onManage?: () => void;
}

export function ParentLinkCard({
  connected,
  parentName,
  parentEmail,
  onInvite,
  onManage,
}: ParentLinkCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">👨‍👩‍👦</span>
        <h3 className="font-bold text-gray-900">Parent Link</h3>
      </div>

      {connected ? (
        <div>
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold">
                {parentName?.charAt(0) || 'P'}
              </span>
            </div>
            <div>
              <p className="font-medium text-green-800">
                {parentName || 'Parent'}
              </p>
              <p className="text-sm text-green-600">✓ Connected</p>
            </div>
          </div>

          {onManage && (
            <button
              onClick={onManage}
              className="w-full mt-3 text-sm text-gray-600 hover:text-gray-700 font-medium py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Manage Connection
            </button>
          )}
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 mb-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-400">○</span>
            </div>
            <div>
              <p className="font-medium text-gray-500">Not connected</p>
              <p className="text-sm text-gray-400">Invite a parent to view your progress</p>
            </div>
          </div>

          <motion.button
            onClick={onInvite}
            className="w-full bg-purple-500 text-white font-medium py-2.5 rounded-xl hover:bg-purple-600 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Invite Parent →
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}
