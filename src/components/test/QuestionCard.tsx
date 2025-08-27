import React from 'react';
import { motion } from 'framer-motion';
import { Question } from '../../types';
import { Card } from '../ui/Card';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  answer: string;
  onAnswerChange: (answer: string) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  answer,
  onAnswerChange,
}) => {
  return (
    <Card className="p-6">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
            Question {questionNumber} of {totalQuestions}
          </span>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {question.points} points
          </span>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(questionNumber/ totalQuestions) * 100}%` }}
          />
        </div>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {question.question}
        </h3>

        <div className="space-y-3">
          {question.type === 'objective' && question.options ? (
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <label
                  key={index}
                  className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={option}
                    checked={answer === option}
                    onChange={(e) => onAnswerChange(e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">{option}</span>
                </label>
              ))}
            </div>
          ) : (
            <textarea
              value={answer}
              onChange={(e) => onAnswerChange(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
            />
          )}
        </div>
      </motion.div>
    </Card>
  );
};