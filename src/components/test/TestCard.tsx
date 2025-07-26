import React from "react";
import { motion } from "framer-motion";
import { Clock, BookOpen, Target, Play } from "lucide-react";
import { Test } from "../../types";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";

interface TestCardProps {
  test: Test;
  onStartTest: (testId: string) => void;
}

export const TestCard: React.FC<TestCardProps> = ({ test, onStartTest }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "success";
      case "medium":
        return "warning";
      case "hard":
        return "danger";
      default:
        return "default";
    }
  };

  return (
    <Card className="p-6 h-full flex flex-col">
      <div className="flex-1">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {test.title}
            </h3>
            <div className="flex items-center space-x-2 mb-3">
              <Badge variant="info">{test.subject}</Badge>
              <Badge variant={getDifficultyColor(test.difficulty)}>
                {test.difficulty.charAt(0).toUpperCase() +
                  test.difficulty.slice(1)}
              </Badge>
            </div>
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {test.description}
        </p>

        <div className="space-y-2 mb-6">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <BookOpen className="h-4 w-4 mr-2" />
            <span>{test.class}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Clock className="h-4 w-4 mr-2" />
            <span>{test.timeLimit} minutes</span>
          </div>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Target className="h-4 w-4 mr-2" />
            <span>{test.totalPoints} points</span>
          </div>
        </div>
      </div>

      <Button
        onClick={() => onStartTest(test._id)}
        className="w-full flex items-center justify-center space-x-2"
      >
        <Play className="h-4 w-4" />
        <span>Start Test</span>
      </Button>
    </Card>
  );
};
