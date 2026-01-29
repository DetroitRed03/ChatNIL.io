'use client';

import { motion } from 'framer-motion';
import { ChapterCard } from './ChapterCard';

interface Chapter {
  id: string;
  icon: string;
  title: string;
  progress: number;
  unlocked: boolean;
  isComplete: boolean;
  levelRequired: number;
}

interface ChaptersGridV2Props {
  chapters: Chapter[];
  currentChapter: string;
  currentLevel: number;
  onChapterClick: (id: string, unlocked: boolean) => void;
}

const defaultChapters: Chapter[] = [
  { id: 'identity', icon: '🎭', title: 'Identity', progress: 0, unlocked: true, isComplete: false, levelRequired: 1 },
  { id: 'business', icon: '📋', title: 'Business', progress: 0, unlocked: false, isComplete: false, levelRequired: 2 },
  { id: 'money', icon: '💰', title: 'Money', progress: 0, unlocked: false, isComplete: false, levelRequired: 3 },
  { id: 'legacy', icon: '⭐', title: 'Legacy', progress: 0, unlocked: false, isComplete: false, levelRequired: 4 },
];

export function ChaptersGridV2({
  chapters = defaultChapters,
  currentChapter,
  currentLevel,
  onChapterClick,
}: ChaptersGridV2Props) {
  const completedCount = chapters.filter(c => c.isComplete).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold flex items-center gap-2 text-gray-900">
          <span>📚</span>
          Chapters
        </h3>
        <span className="text-sm text-gray-500 font-medium">
          {completedCount}/{chapters.length}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {chapters.map((chapter) => {
          const isLocked = !chapter.unlocked && chapter.levelRequired > currentLevel;
          return (
            <ChapterCard
              key={chapter.id}
              {...chapter}
              isCurrent={chapter.id === currentChapter}
              isLocked={isLocked}
              onClick={() => onChapterClick(chapter.id, !isLocked)}
            />
          );
        })}
      </div>
    </motion.div>
  );
}
