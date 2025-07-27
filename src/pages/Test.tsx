import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../hooks/useTypedSelector";
import { updateAttempt, submitTest } from "../store/slices/testSlice";
import { QuestionCard } from "../components/test/QuestionCard";
import { Timer } from "../components/test/Timer";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import toast from "react-hot-toast";

export const Test: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentTest, currentAttempt } = useAppSelector((state) => state.test);
  console.log("currentAttempt:", currentAttempt);
  const { user } = useAppSelector((state) => state.auth);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

  // Tab switching detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        const newCount = tabSwitchCount + 1;
        setTabSwitchCount(newCount);

        if (newCount <= 3) {
          setShowWarning(true);
          toast.error(`Warning: Tab switch detected! (${newCount}/3)`, {
            duration: 3000,
          });
        }

        if (newCount >= 3) {
          handleSubmit(true);
          toast.error("Test auto-submitted due to multiple tab switches!", {
            duration: 5000,
          });
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [tabSwitchCount]);

  // Update attempt in store
  useEffect(() => {
    if (currentAttempt) {
      dispatch(
        updateAttempt({
          answers,
          tabSwitchCount,
        })
      );
    }
  }, [answers, tabSwitchCount, dispatch]);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmit = useCallback(
    async (autoSubmit = false) => {
      if (!currentTest || !currentAttempt || !user) return;

      // Calculate score
      let score = 0;
      currentTest.questions.forEach((question) => {
        const userAnswer = answers[question._id];
        if (
          userAnswer &&
          userAnswer.toLowerCase().trim() ===
            question.correctAnswer.toLowerCase().trim()
        ) {
          score += question.points;
        }
      });

      const percentage = Math.round((score / currentTest.totalPoints) * 100);

      // Determine category
      let category: "Beginner" | "Intermediate" | "Advanced" | "Expert" =
        "Beginner";
      if (percentage >= 90) category = "Expert";
      else if (percentage >= 75) category = "Advanced";
      else if (percentage >= 60) category = "Intermediate";

      const finalAttempt = {
        testId: testId,
        answers,
        timeSpent: currentTest.timeLimit * 60 - (currentAttempt.timeSpent || 0),
        tabSwitchCount,
      };
      console.log("finalAtt:", finalAttempt);

      await dispatch(submitTest(finalAttempt));
      navigate("/results");
    },
    [
      currentTest,
      currentAttempt,
      user,
      answers,
      tabSwitchCount,
      dispatch,
      navigate,
    ]
  );

  const handleTimeUp = () => {
    toast.error("Time is up! Submitting test automatically.", {
      duration: 3000,
    });
    handleSubmit(true);
  };

  if (!currentTest || !currentAttempt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-purple-900 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Test not found
          </h2>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </Card>
      </div>
    );
  }

  const currentQuestion = currentTest.questions[currentQuestionIndex];
  const isLastQuestion =
    currentQuestionIndex === currentTest.questions.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-purple-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Warning Modal */}
        {showWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <Card className="p-6 max-w-md w-full text-center">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Tab Switch Detected!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Please stay on this tab during the test. After 3 switches, your
                test will be auto-submitted.
              </p>
              <Button onClick={() => setShowWarning(false)}>
                I Understand
              </Button>
            </Card>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {currentTest.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {currentTest.subject} • {currentTest.class}
              </p>
            </div>
            <Timer duration={currentTest.timeLimit} onTimeUp={handleTimeUp} />
          </div>

          {/* Tab Switch Warning */}
          {tabSwitchCount > 0 && (
            <Card className="p-4 border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                <span className="text-yellow-800 dark:text-yellow-200">
                  Tab switches: {tabSwitchCount}/3 - Please stay on this tab
                </span>
              </div>
            </Card>
          )}

          {/* Question */}
          <QuestionCard
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={currentTest.questions.length}
            answer={answers[currentQuestion._id] || ""}
            onAnswerChange={(answer) =>
              handleAnswerChange(currentQuestion._id, answer)
            }
          />

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() =>
                setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
              }
              disabled={currentQuestionIndex === 0}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </Button>

            <div className="text-sm text-gray-500 dark:text-gray-400">
              {currentQuestionIndex + 1} of {currentTest.questions.length}
            </div>

            {isLastQuestion ? (
              <Button
                onClick={() => handleSubmit()}
                className="flex items-center space-x-2"
              >
                <span>Submit Test</span>
              </Button>
            ) : (
              <Button
                onClick={() =>
                  setCurrentQuestionIndex((prev) =>
                    Math.min(currentTest.questions.length - 1, prev + 1)
                  )
                }
                className="flex items-center space-x-2"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Progress indicators */}
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {currentTest.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`h-8 rounded text-xs font-medium transition-colors ${
                  index === currentQuestionIndex
                    ? "bg-blue-500 text-white"
                    : answers[currentTest.questions[index].id]
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
