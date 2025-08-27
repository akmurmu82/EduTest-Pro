import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Check, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../hooks/useTypedSelector";
import { clearCurrentTest } from "../store/slices/testSlice";
import { ResultCard } from "../components/results/ResultCard";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";

export const Results: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentTest, currentAttempt } = useAppSelector((state) => state.test);
  console.log('currentAtt:', currentAttempt)
  const { user } = useAppSelector((state) => state.auth);

  const [showAnswers, setShowAnswers] = useState(false);
  const [currentAnswerIndex, setCurrentAnswerIndex] = useState(0);

  const handleGoHome = () => {
    dispatch(clearCurrentTest());
    navigate("/");
  };

  if (!currentTest || !currentAttempt || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-purple-900 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            No results to display
          </h2>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </Card>
      </div>
    );
  }

  if (showAnswers) {
    const question = currentTest.questions[currentAnswerIndex];
    const userAnswer = currentAttempt.attempt.answers[question._id];
    const isCorrect =
      userAnswer?.toLowerCase().trim() ===
      question.correctAnswer.toLowerCase().trim();

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-purple-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => setShowAnswers(false)}
                className="flex items-center space-x-2"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Back to Results</span>
              </Button>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Question {currentAnswerIndex + 1} of{" "}
                {currentTest.questions.length}
              </div>
            </div>

            <Card className="p-6">
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex-1">
                    {question.question}
                  </h3>
                  <Badge
                    variant={isCorrect ? "success" : "danger"}
                    className="ml-4"
                  >
                    {isCorrect ? (
                      <>
                        <Check className="h-3 w-3 mr-1" /> Correct
                      </>
                    ) : (
                      <>
                        <X className="h-3 w-3 mr-1" /> Incorrect
                      </>
                    )}
                  </Badge>
                </div>

                {question.type === "objective" && question.options && (
                  <div className="space-y-3">
                    {question.options.map((option, index) => {
                      const isUserAnswer = userAnswer === option;
                      const isCorrectAnswer = option === question.correctAnswer;

                      return (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border-2 ${
                            isCorrectAnswer
                              ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                              : isUserAnswer && !isCorrectAnswer
                              ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                              : "border-gray-200 dark:border-gray-600"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-gray-700 dark:text-gray-300">
                              {option}
                            </span>
                            <div className="flex items-center space-x-2">
                              {isUserAnswer && (
                                <Badge variant="info" size="sm">
                                  Your Answer
                                </Badge>
                              )}
                              {isCorrectAnswer && (
                                <Badge variant="success" size="sm">
                                  Correct
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {question.type === "subjective" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Your Answer:
                      </label>
                      <div
                        className={`p-3 rounded-lg border-2 ${
                          isCorrect
                            ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                            : "border-red-500 bg-red-50 dark:bg-red-900/20"
                        }`}
                      >
                        <p className="text-gray-700 dark:text-gray-300">
                          {userAnswer || "No answer provided"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Correct Answer:
                      </label>
                      <div className="p-3 rounded-lg border-2 border-green-500 bg-green-50 dark:bg-green-900/20">
                        <p className="text-gray-700 dark:text-gray-300">
                          {question.correctAnswer}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {question.explanation && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
                      Explanation:
                    </h4>
                    <p className="text-blue-800 dark:text-blue-200">
                      {question.explanation}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() =>
                  setCurrentAnswerIndex((prev) => Math.max(0, prev - 1))
                }
                disabled={currentAnswerIndex === 0}
                className="flex items-center space-x-2"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </Button>

              <Button
                variant="outline"
                onClick={() =>
                  setCurrentAnswerIndex((prev) =>
                    Math.min(currentTest.questions.length - 1, prev + 1)
                  )
                }
                disabled={
                  currentAnswerIndex === currentTest.questions.length - 1
                }
                className="flex items-center space-x-2"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-purple-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <ResultCard
            attempt={currentAttempt.attempt}
            user={user}
            onViewAnswers={() => setShowAnswers(true)}
          />

          <div className="text-center">
            <Button
              onClick={handleGoHome}
              variant="outline"
              className="flex items-center justify-center space-x-2"
            >
              <Home className="h-4 w-4" />
              <span>Back to Home</span>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
