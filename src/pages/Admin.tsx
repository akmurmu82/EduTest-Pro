import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  BookOpen,
  BarChart3,
  Settings,
  Plus,
  Edit,
  Trash2,
  Brain,
  Save,
  X,
  FileText,
  Clock,
  Target,
  Download,
  Upload,
  RefreshCw,
} from "lucide-react";
import { useAppSelector } from "../hooks/useTypedSelector";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { questionsAPI, testsAPI, adminAPI } from "../services/api";
import { Question, Test, User, QuestionGenerationRequest } from "../types";
import toast from "react-hot-toast";

export const Admin: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [showTestForm, setShowTestForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editingTest, setEditingTest] = useState<Test | null>(null);

  // AI Generation Form
  const [aiRequest, setAiRequest] = useState<QuestionGenerationRequest>({
    subject: "",
    class: "",
    difficulty: "medium",
    type: "objective",
    count: 5,
    topic: "",
  });

  // Question Form
  const [questionForm, setQuestionForm] = useState({
    subject: "",
    class: "",
    difficulty: "medium" as const,
    type: "objective" as const,
    question: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    explanation: "",
    points: 10,
  });

  // Test Form
  const [testForm, setTestForm] = useState({
    title: "",
    subject: "",
    class: "",
    difficulty: "medium" as const,
    description: "",
    selectedQuestions: [] as string[],
    timeLimit: 60,
  });

  useEffect(() => {
    if (user?.role === "admin") {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [questionsData, testsData, studentsData] = await Promise.all([
        questionsAPI.getQuestions(),
        testsAPI.getTests(),
        adminAPI.getStudents(),
      ]);
      setQuestions(questionsData);
      setTests(testsData);
      setStudents(studentsData);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuestions = async () => {
    setLoading(true);
    try {
      const generatedQuestions = await questionsAPI.generateQuestions(
        aiRequest
      );
      console.log("generatedQuestions:", generatedQuestions);
      setQuestions((prev) => [...prev, ...generatedQuestions]);
      setShowAIGenerator(false);
      toast.success(
        `Generated ${generatedQuestions.length} questions successfully!`
      );
    } catch (error) {
      toast.error("Failed to generate questions");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuestion = async () => {
    setLoading(true);
    try {
      const questionData = {
        ...questionForm,
        options:
          questionForm.type === "objective"
            ? questionForm.options.filter((opt) => opt.trim())
            : undefined,
        createdBy: "manual" as const,
      };

      if (editingQuestion) {
        const updated = await questionsAPI.updateQuestion(
          editingQuestion._id,
          questionData
        );
        setQuestions((prev) =>
          prev.map((q) => (q._id === editingQuestion._id ? updated : q))
        );
        toast.success("Question updated successfully!");
      } else {
        const newQuestion = await questionsAPI.createQuestion(questionData);
        setQuestions((prev) => [...prev, newQuestion]);
        toast.success("Question created successfully!");
      }

      setShowQuestionForm(false);
      setEditingQuestion(null);
      resetQuestionForm();
    } catch (error) {
      toast.error("Failed to save question");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      await questionsAPI.deleteQuestion(id);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      toast.success("Question deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete question");
    }
  };

  const handleSaveTest = async () => {
    setLoading(true);
    try {
      const testData = {
        ...testForm,
        questions: testForm.selectedQuestions,
      };

      if (editingTest) {
        const updated = await testsAPI.updateTest(editingTest._id, testData);
        setTests((prev) =>
          prev.map((t) => (t.id === editingTest._id ? updated : t))
        );
        toast.success("Test updated successfully!");
      } else {
        const newTest = await testsAPI.createTest(testData);
        setTests((prev) => [...prev, newTest]);
        toast.success("Test created successfully!");
      }

      setShowTestForm(false);
      setEditingTest(null);
      resetTestForm();
    } catch (error) {
      toast.error("Failed to save test");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTest = async (id: string) => {
    if (!confirm("Are you sure you want to delete this test?")) return;

    try {
      await testsAPI.deleteTest(id);
      setTests((prev) => prev.filter((t) => t.id !== id));
      toast.success("Test deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete test");
    }
  };

  const resetQuestionForm = () => {
    setQuestionForm({
      subject: "",
      class: "",
      difficulty: "medium",
      type: "objective",
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      explanation: "",
      points: 10,
    });
  };

  const resetTestForm = () => {
    setTestForm({
      title: "",
      subject: "",
      class: "",
      difficulty: "medium",
      description: "",
      selectedQuestions: [],
      timeLimit: 60,
    });
  };

  const handleExportData = () => {
    const data = {
      questions,
      tests,
      students,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `edutest-data-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Data exported successfully!");
  };

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "questions", label: "Questions", icon: BookOpen },
    { id: "tests", label: "Tests", icon: FileText },
    { id: "students", label: "Students", icon: Users },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-purple-900 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            You need admin privileges to access this page.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-purple-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mt-2">
              Manage your educational platform
            </p>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap justify-center gap-2">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "primary" : "outline"}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center space-x-2"
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </Button>
            ))}
          </div>

          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 text-center">
                <BookOpen className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {questions.length}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  Total Questions
                </div>
              </Card>
              <Card className="p-6 text-center">
                <Users className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {students.length}
                </div>
                <div className="text-gray-600 dark:text-gray-400">Students</div>
              </Card>
              <Card className="p-6 text-center">
                <BarChart3 className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {tests.length}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  Active Tests
                </div>
              </Card>
            </div>
          )}

          {/* Questions Tab */}
          {activeTab === "questions" && (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={() => setShowQuestionForm(true)}
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Question</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAIGenerator(true)}
                  className="flex items-center space-x-2"
                >
                  <Brain className="h-4 w-4" />
                  <span>AI Generate</span>
                </Button>
              </div>

              <div className="grid gap-4">
                {questions.map((question) => (
                  <Card key={question._id} className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="info">{question.subject}</Badge>
                          <Badge variant="default">{question.class}</Badge>
                          <Badge
                            variant={
                              question.difficulty === "easy"
                                ? "success"
                                : question.difficulty === "medium"
                                ? "warning"
                                : "danger"
                            }
                          >
                            {question.difficulty}
                          </Badge>
                          <Badge variant="default">{question.type}</Badge>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {question.question}
                        </h3>
                        {question.options && (
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Options: {question.options.join(", ")}
                          </div>
                        )}
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Correct: {question.correctAnswer} | Points:{" "}
                          {question.points}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingQuestion(question);
                            setQuestionForm({
                              subject: question.subject,
                              class: question.class,
                              difficulty: question.difficulty,
                              type: question.type,
                              question: question.question,
                              options: question.options || ["", "", "", ""],
                              correctAnswer: question.correctAnswer,
                              explanation: question.explanation || "",
                              points: question.points,
                            });
                            setShowQuestionForm(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteQuestion(question._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Tests Tab */}
          {activeTab === "tests" && (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={() => setShowTestForm(true)}
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Test</span>
                </Button>
              </div>

              <div className="grid gap-4">
                {tests.map((test) => (
                  <Card key={test.id} className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="info">{test.subject}</Badge>
                          <Badge variant="default">{test.class}</Badge>
                          <Badge
                            variant={
                              test.difficulty === "easy"
                                ? "success"
                                : test.difficulty === "medium"
                                ? "warning"
                                : "danger"
                            }
                          >
                            {test.difficulty}
                          </Badge>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {test.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {test.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <BookOpen className="h-4 w-4" />
                            <span>{test.questions.length} questions</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{test.timeLimit} min</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Target className="h-4 w-4" />
                            <span>{test.totalPoints} points</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingTest(test);
                            setTestForm({
                              title: test.title,
                              subject: test.subject,
                              class: test.class,
                              difficulty: test.difficulty,
                              description: test.description,
                              selectedQuestions: test.questions.map(
                                (q) => q._id || q.id
                              ),
                              timeLimit: test.timeLimit,
                            });
                            setShowTestForm(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteTest(test.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Students Tab */}
          {activeTab === "students" && (
            <div className="grid gap-4">
              {students.map((student) => (
                <Card key={student._id} className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {student.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {student.email}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="info">{student.class}</Badge>
                        <Badge variant="default">
                          {student.subjects.length} subjects
                        </Badge>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Joined: {new Date(student.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Data Management
                  </h3>
                  <div className="space-y-4">
                    <Button
                      onClick={handleExportData}
                      variant="outline"
                      className="w-full flex items-center justify-center space-x-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>Export All Data</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-center space-x-2"
                      onClick={() =>
                        toast.info("Import functionality coming soon!")
                      }
                    >
                      <Upload className="h-4 w-4" />
                      <span>Import Data</span>
                    </Button>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    System Actions
                  </h3>
                  <div className="space-y-4">
                    <Button
                      onClick={loadData}
                      variant="outline"
                      className="w-full flex items-center justify-center space-x-2"
                      loading={loading}
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span>Refresh Data</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-center space-x-2"
                      onClick={() => {
                        localStorage.clear();
                        toast.success("Cache cleared successfully!");
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Clear Cache</span>
                    </Button>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Platform Statistics
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Total Questions:
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {questions.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Total Tests:
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {tests.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Total Students:
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {students.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        AI Questions:
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {questions.filter((q) => q.createdBy === "ai").length}
                      </span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Quick Actions
                  </h3>
                  <div className="space-y-4">
                    <Button
                      onClick={() => setShowAIGenerator(true)}
                      className="w-full flex items-center justify-center space-x-2"
                    >
                      <Brain className="h-4 w-4" />
                      <span>Generate Questions</span>
                    </Button>
                    <Button
                      onClick={() => setShowTestForm(true)}
                      variant="outline"
                      className="w-full flex items-center justify-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Create New Test</span>
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* AI Generator Modal */}
          {showAIGenerator && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    AI Question Generator
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAIGenerator(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <Input
                    label="Subject"
                    value={aiRequest.subject}
                    onChange={(e) =>
                      setAiRequest((prev) => ({
                        ...prev,
                        subject: e.target.value,
                      }))
                    }
                    placeholder="e.g., Mathematics"
                  />
                  <Input
                    label="Class"
                    value={aiRequest.class}
                    onChange={(e) =>
                      setAiRequest((prev) => ({
                        ...prev,
                        class: e.target.value,
                      }))
                    }
                    placeholder="e.g., 10th Grade"
                  />
                  <Input
                    label="Topic (Optional)"
                    value={aiRequest.topic}
                    onChange={(e) =>
                      setAiRequest((prev) => ({
                        ...prev,
                        topic: e.target.value,
                      }))
                    }
                    placeholder="e.g., Algebra, Geometry"
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Difficulty
                    </label>
                    <select
                      value={aiRequest.difficulty}
                      onChange={(e) =>
                        setAiRequest((prev) => ({
                          ...prev,
                          difficulty: e.target.value as any,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Type
                    </label>
                    <select
                      value={aiRequest.type}
                      onChange={(e) =>
                        setAiRequest((prev) => ({
                          ...prev,
                          type: e.target.value as any,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="objective">Objective</option>
                      <option value="subjective">Subjective</option>
                      <option value="mixed">Mixed</option>
                    </select>
                  </div>
                  <Input
                    label="Number of Questions"
                    type="number"
                    value={aiRequest.count}
                    onChange={(e) =>
                      setAiRequest((prev) => ({
                        ...prev,
                        count: parseInt(e.target.value),
                      }))
                    }
                    min="1"
                    max="20"
                  />
                </div>

                <div className="flex space-x-4 mt-6">
                  <Button
                    onClick={handleGenerateQuestions}
                    loading={loading}
                    className="flex-1"
                  >
                    Generate Questions
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowAIGenerator(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Question Form Modal */}
          {showQuestionForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {editingQuestion ? "Edit Question" : "Add New Question"}
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowQuestionForm(false);
                      setEditingQuestion(null);
                      resetQuestionForm();
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Subject"
                      value={questionForm.subject}
                      onChange={(e) =>
                        setQuestionForm((prev) => ({
                          ...prev,
                          subject: e.target.value,
                        }))
                      }
                      placeholder="e.g., Mathematics"
                    />
                    <Input
                      label="Class"
                      value={questionForm.class}
                      onChange={(e) =>
                        setQuestionForm((prev) => ({
                          ...prev,
                          class: e.target.value,
                        }))
                      }
                      placeholder="e.g., 10th Grade"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Difficulty
                      </label>
                      <select
                        value={questionForm.difficulty}
                        onChange={(e) =>
                          setQuestionForm((prev) => ({
                            ...prev,
                            difficulty: e.target.value as any,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Type
                      </label>
                      <select
                        value={questionForm.type}
                        onChange={(e) =>
                          setQuestionForm((prev) => ({
                            ...prev,
                            type: e.target.value as any,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="objective">Objective</option>
                        <option value="subjective">Subjective</option>
                      </select>
                    </div>
                    <Input
                      label="Points"
                      type="number"
                      value={questionForm.points}
                      onChange={(e) =>
                        setQuestionForm((prev) => ({
                          ...prev,
                          points: parseInt(e.target.value),
                        }))
                      }
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Question
                    </label>
                    <textarea
                      value={questionForm.question}
                      onChange={(e) =>
                        setQuestionForm((prev) => ({
                          ...prev,
                          question: e.target.value,
                        }))
                      }
                      className="w-full h-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                      placeholder="Enter your question here..."
                    />
                  </div>

                  {questionForm.type === "objective" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Options
                      </label>
                      <div className="space-y-2">
                        {questionForm.options.map((option, index) => (
                          <Input
                            key={index}
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...questionForm.options];
                              newOptions[index] = e.target.value;
                              setQuestionForm((prev) => ({
                                ...prev,
                                options: newOptions,
                              }));
                            }}
                            placeholder={`Option ${index + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <Input
                    label="Correct Answer"
                    value={questionForm.correctAnswer}
                    onChange={(e) =>
                      setQuestionForm((prev) => ({
                        ...prev,
                        correctAnswer: e.target.value,
                      }))
                    }
                    placeholder="Enter the correct answer"
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Explanation (Optional)
                    </label>
                    <textarea
                      value={questionForm.explanation}
                      onChange={(e) =>
                        setQuestionForm((prev) => ({
                          ...prev,
                          explanation: e.target.value,
                        }))
                      }
                      className="w-full h-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                      placeholder="Explain why this is the correct answer..."
                    />
                  </div>
                </div>

                <div className="flex space-x-4 mt-6">
                  <Button
                    onClick={handleSaveQuestion}
                    loading={loading}
                    className="flex-1 flex items-center justify-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>{editingQuestion ? "Update" : "Save"} Question</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowQuestionForm(false);
                      setEditingQuestion(null);
                      resetQuestionForm();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Test Form Modal */}
          {showTestForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {editingTest ? "Edit Test" : "Create New Test"}
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowTestForm(false);
                      setEditingTest(null);
                      resetTestForm();
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <Input
                    label="Test Title"
                    value={testForm.title}
                    onChange={(e) =>
                      setTestForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="e.g., Mathematics Final Exam"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Subject"
                      value={testForm.subject}
                      onChange={(e) =>
                        setTestForm((prev) => ({
                          ...prev,
                          subject: e.target.value,
                        }))
                      }
                      placeholder="e.g., Mathematics"
                    />
                    <Input
                      label="Class"
                      value={testForm.class}
                      onChange={(e) =>
                        setTestForm((prev) => ({
                          ...prev,
                          class: e.target.value,
                        }))
                      }
                      placeholder="e.g., 10th Grade"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Difficulty
                      </label>
                      <select
                        value={testForm.difficulty}
                        onChange={(e) =>
                          setTestForm((prev) => ({
                            ...prev,
                            difficulty: e.target.value as any,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                    <Input
                      label="Time Limit (minutes)"
                      type="number"
                      value={testForm.timeLimit}
                      onChange={(e) =>
                        setTestForm((prev) => ({
                          ...prev,
                          timeLimit: parseInt(e.target.value),
                        }))
                      }
                      min="5"
                      max="180"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={testForm.description}
                      onChange={(e) =>
                        setTestForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="w-full h-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                      placeholder="Describe what this test covers..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Questions ({testForm.selectedQuestions.length}{" "}
                      selected)
                    </label>
                    <div className="max-h-60 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-3 space-y-2">
                      {questions.map((question) => (
                        <label
                          key={question._id}
                          className="flex items-start space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={testForm.selectedQuestions.includes(
                              question._id
                            )}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setTestForm((prev) => ({
                                  ...prev,
                                  selectedQuestions: [
                                    ...prev.selectedQuestions,
                                    question._id,
                                  ],
                                }));
                              } else {
                                setTestForm((prev) => ({
                                  ...prev,
                                  selectedQuestions:
                                    prev.selectedQuestions.filter(
                                      (id) => id !== question._id
                                    ),
                                }));
                              }
                            }}
                            className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <Badge variant="info" size="sm">
                                {question.subject}
                              </Badge>
                              <Badge variant="default" size="sm">
                                {question.difficulty}
                              </Badge>
                              <Badge variant="default" size="sm">
                                {question.points}pts
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                              {question.question}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4 mt-6">
                  <Button
                    onClick={handleSaveTest}
                    loading={loading}
                    className="flex-1 flex items-center justify-center space-x-2"
                    disabled={testForm.selectedQuestions.length === 0}
                  >
                    <Save className="h-4 w-4" />
                    <span>{editingTest ? "Update" : "Create"} Test</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowTestForm(false);
                      setEditingTest(null);
                      resetTestForm();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
