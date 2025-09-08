"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { TestTimer } from "./test-timer"
import { QuestionPalette } from "./question-palette"
import { QuestionDisplay } from "./question-display"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { AlertTriangle, Send } from "lucide-react"

interface Question {
  id: string
  section: string
  question_type: string
  question_text: string
  options?: Record<string, string>
  marks: number
  negative_marks: number
  comprehension_passage?: string
  order_index: number
}

interface Answer {
  questionId: string
  selectedAnswers: string[]
  isMarkedForReview: boolean
  timeSpent: number
}

interface QuestionStatus {
  questionId: string
  status: "not-visited" | "not-attempted" | "attempted" | "marked-for-review" | "attempted-and-marked"
}

interface TestInterfaceProps {
  testId: string
  attemptId: string
  test: {
    title: string
    duration_minutes: number
    total_marks: number
  }
  questions: Question[]
  initialAnswers?: Answer[]
}

export function TestInterface({ testId, attemptId, test, questions, initialAnswers = [] }: TestInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [currentSection, setCurrentSection] = useState("Physics")
  const [answers, setAnswers] = useState<Answer[]>(initialAnswers)
  const [questionStatuses, setQuestionStatuses] = useState<QuestionStatus[]>([])
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastSaveTime, setLastSaveTime] = useState(Date.now())

  const router = useRouter()
  const supabase = createClient()

  const sections = ["Physics", "Chemistry", "Mathematics"]
  const currentQuestion = questions[currentQuestionIndex]

  // Initialize question statuses
  useEffect(() => {
    const statuses: QuestionStatus[] = questions.map((question) => {
      const answer = answers.find((a) => a.questionId === question.id)
      let status: QuestionStatus["status"] = "not-visited"

      if (answer) {
        if (answer.selectedAnswers.length > 0 && answer.isMarkedForReview) {
          status = "attempted-and-marked"
        } else if (answer.selectedAnswers.length > 0) {
          status = "attempted"
        } else if (answer.isMarkedForReview) {
          status = "marked-for-review"
        } else {
          status = "not-attempted"
        }
      }

      return { questionId: question.id, status }
    })

    setQuestionStatuses(statuses)
  }, [questions, answers])

  // Update question status when visiting
  useEffect(() => {
    if (currentQuestion) {
      setQuestionStatuses((prev) =>
        prev.map((status) =>
          status.questionId === currentQuestion.id && status.status === "not-visited"
            ? { ...status, status: "not-attempted" }
            : status,
        ),
      )
    }
  }, [currentQuestion])

  // Auto-save every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveProgress()
    }, 10000)

    return () => clearInterval(interval)
  }, [answers])

  // Anti-cheating measures
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault()
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && (e.key === "c" || e.key === "v" || e.key === "a")) {
        e.preventDefault()
      }
      if (e.key === "F12") {
        e.preventDefault()
      }
    }
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.warn("[v0] User switched tabs during test")
      }
    }

    document.addEventListener("contextmenu", handleContextMenu)
    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    // Request fullscreen
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(console.error)
    }

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu)
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  const saveProgress = useCallback(async () => {
    try {
      const response = await fetch(`/api/tests/${testId}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId,
          answers,
          timeSpent: Math.floor((Date.now() - lastSaveTime) / 1000),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save progress")
      }

      setLastSaveTime(Date.now())
      console.log("[v0] Progress saved successfully")
    } catch (error) {
      console.error("[v0] Failed to save progress:", error)
    }
  }, [testId, attemptId, answers, lastSaveTime])

  const handleAnswerChange = (answer: Answer) => {
    setAnswers((prev) => {
      const existing = prev.findIndex((a) => a.questionId === answer.questionId)
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = answer
        return updated
      }
      return [...prev, answer]
    })
  }

  const handleQuestionSelect = (questionId: string) => {
    const index = questions.findIndex((q) => q.id === questionId)
    if (index >= 0) {
      setCurrentQuestionIndex(index)
      const question = questions[index]
      setCurrentSection(question.section)
    }
  }

  const handleSectionChange = (section: string) => {
    setCurrentSection(section)
    const firstQuestionInSection = questions.find((q) => q.section === section)
    if (firstQuestionInSection) {
      handleQuestionSelect(firstQuestionInSection.id)
    }
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
      const nextQuestion = questions[currentQuestionIndex + 1]
      setCurrentSection(nextQuestion.section)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
      const prevQuestion = questions[currentQuestionIndex - 1]
      setCurrentSection(prevQuestion.section)
    }
  }

  const handleMarkForReview = () => {
    const currentAnswer = answers.find((a) => a.questionId === currentQuestion.id)
    const updatedAnswer: Answer = {
      questionId: currentQuestion.id,
      selectedAnswers: currentAnswer?.selectedAnswers || [],
      isMarkedForReview: !currentAnswer?.isMarkedForReview,
      timeSpent: currentAnswer?.timeSpent || 0,
    }
    handleAnswerChange(updatedAnswer)
  }

  const handleTimeUp = () => {
    setIsSubmitDialogOpen(true)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/tests/${testId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId,
          answers,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit test")
      }

      const result = await response.json()
      router.push(`/tests/${testId}/results?attemptId=${attemptId}`)
    } catch (error) {
      console.error("[v0] Failed to submit test:", error)
      setIsSubmitting(false)
    }
  }

  const currentAnswer = answers.find((a) => a.questionId === currentQuestion?.id)

  return (
    <div className="min-h-screen bg-background">
      {/* Test Header */}
      <div className="sticky top-0 z-40 bg-background border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">{test.title}</h1>
              <p className="text-sm text-muted-foreground">Total Marks: {test.total_marks}</p>
            </div>
            <div className="flex items-center space-x-4">
              <TestTimer durationMinutes={test.duration_minutes} onTimeUp={handleTimeUp} isActive={true} />
              <Button
                variant="destructive"
                onClick={() => setIsSubmitDialogOpen(true)}
                className="flex items-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span>Submit Test</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Test Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Palette */}
          <div className="lg:col-span-1">
            <QuestionPalette
              questions={questions}
              questionStatuses={questionStatuses}
              currentQuestionId={currentQuestion?.id || ""}
              onQuestionSelect={handleQuestionSelect}
              sections={sections}
              currentSection={currentSection}
              onSectionChange={handleSectionChange}
            />
          </div>

          {/* Question Display */}
          <div className="lg:col-span-3">
            {currentQuestion && (
              <QuestionDisplay
                question={currentQuestion}
                questionNumber={currentQuestionIndex + 1}
                totalQuestions={questions.length}
                answer={currentAnswer}
                onAnswerChange={handleAnswerChange}
                onNext={handleNext}
                onPrevious={handlePrevious}
                onMarkForReview={handleMarkForReview}
                canGoNext={currentQuestionIndex < questions.length - 1}
                canGoPrevious={currentQuestionIndex > 0}
              />
            )}
          </div>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span>Submit Test</span>
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to submit your test? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Questions:</span>
                  <span className="font-medium">{questions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Attempted:</span>
                  <span className="font-medium text-green-600">
                    {
                      questionStatuses.filter((q) => q.status === "attempted" || q.status === "attempted-and-marked")
                        .length
                    }
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Not Attempted:</span>
                  <span className="font-medium text-red-600">
                    {questionStatuses.filter((q) => q.status === "not-attempted" || q.status === "not-visited").length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Marked for Review:</span>
                  <span className="font-medium text-purple-600">
                    {
                      questionStatuses.filter(
                        (q) => q.status === "marked-for-review" || q.status === "attempted-and-marked",
                      ).length
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSubmitDialogOpen(false)} disabled={isSubmitting}>
              Continue Test
            </Button>
            <Button variant="destructive" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Test"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
