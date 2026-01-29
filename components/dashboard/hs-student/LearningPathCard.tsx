'use client';

import { motion } from 'framer-motion';
import { GraduationCap, ArrowRight, BookOpen, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

interface LearningPathCardProps {
  pathName: string;
  progress: number;
  nextLesson: string;
}

export function LearningPathCard({ pathName, progress, nextLesson }: LearningPathCardProps) {
  const router = useRouter();

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-green-400" />
          Learning Path
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Path Info */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Current Path</p>
            <p className="text-lg font-medium text-green-400">{pathName}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{progress}%</p>
            <p className="text-xs text-gray-400">Complete</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>

        {/* Next Lesson */}
        <div className="bg-gray-700/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-4 w-4 text-gray-400" />
            <span className="text-xs text-gray-400">Up Next</span>
          </div>
          <p className="text-sm text-white">{nextLesson}</p>
        </div>

        {/* Continue Button */}
        <Button
          onClick={() => router.push('/learn')}
          variant="outline"
          className="w-full border-green-500/50 text-green-400 hover:bg-green-500/10"
        >
          Continue Learning
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>

        {/* Milestones */}
        <div className="pt-2 border-t border-gray-700">
          <p className="text-xs text-gray-500 mb-2">Milestones</p>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((milestone) => (
              <div
                key={milestone}
                className={`flex-1 h-1 rounded-full ${
                  progress >= milestone * 20 ? 'bg-green-500' : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
