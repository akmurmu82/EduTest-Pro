import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, Clock, Eye } from 'lucide-react';
import { TestAttempt, User } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface ResultCardProps {
  attempt: TestAttempt;
  user: User;
  onViewAnswers: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ attempt, user, onViewAnswers }) => {
  console.log("attempt:", attempt)
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Expert': return 'success';
      case 'Advanced': return 'info';
      case 'Intermediate': return 'warning';
      case 'Beginner': return 'default';
      default: return 'default';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Expert': return '🏆';
      case 'Advanced': return '🥇';
      case 'Intermediate': return '🥈';
      case 'Beginner': return '🥉';
      default: return '📚';
    }
  };

  return (
    <Card className="p-8 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6"
      >
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Test Completed!
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Great job, {user.name}!
          </p>
        </div>

        <div className="flex justify-center">
          <div className="text-6xl mb-4">
            {getCategoryIcon(attempt.category)}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-center">
            <Badge variant={getCategoryColor(attempt.category)} size="lg">
              {attempt.category}
            </Badge>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6">
            <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {attempt.score}/{attempt.totalPoints}
            </div>
            <div className="text-xl text-gray-600 dark:text-gray-400">
              {attempt.percentage}% Score
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="flex justify-center">
                <Target className="h-5 w-5 text-blue-500" />
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {attempt.percentage}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy</div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-center">
                <Clock className="h-5 w-5 text-green-500" />
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {Math.floor(attempt.timeSpent / 60)}m {attempt.timeSpent % 60}s
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Time Spent</div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-center">
                <Trophy className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {attempt.tabSwitchCount}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Tab Switches</div>
            </div>
          </div>
        </div>

        <Button onClick={onViewAnswers} className="flex items-center justify-center space-x-2">
          <Eye className="h-4 w-4" />
          <span>Review Answers</span>
        </Button>
      </motion.div>
    </Card>
  );
};