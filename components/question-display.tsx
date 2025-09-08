"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Flag } from "lucide-react"

interface Question {
  id: string
  section: string
  question_type: string
  question_text: string
  options?: Record<string, string>
  marks: number
  negative_marks: number
  comprehension_passage?: string
}

interface Answer {
  questionId: string
  selectedAnswers: string[]
  isMarkedForReview: boolean
  timeSpent: number
}

interface QuestionDisplayProps {
  question: Question
  questionNumber: number
  totalQuestions: number
  answer?: Answer
  onAnswerChange: (answer: Answer) => void
  onNext: () => void
  onPrevious: () => void
  onMarkForReview: () => void
  canGoNext: boolean
  canGoPrevious: boolean
}

export function QuestionDisplay({
  question,
  questionNumber,
  totalQuestions,
  answer,
  onAnswerChange,
  onNext,
  onPrevious,
  onMarkForReview,
  canGoNext,
  canGoPrevious,
}: QuestionDisplayProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>(answer?.selectedAnswers || [])
  const [numericAnswer, setNumericAnswer] = useState(answer?.selectedAnswers?.[0] || "")
  const [timeSpent, setTimeSpent] = useState(0)
  const [startTime] = useState(Date.now())

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [startTime])

  useEffect(() => {
    // Update answer when selections change
    const finalAnswers = question.question_type === "numeric" ? [numericAnswer] : selectedAnswers
    onAnswerChange({
      questionId: question.id,
      selectedAnswers: finalAnswers,
      isMarkedForReview: answer?.isMarkedForReview || false,
      timeSpent: timeSpent,
    })
  }, [selectedAnswers, numericAnswer, timeSpent, question.id, answer?.isMarkedForReview, onAnswerChange])

  const handleOptionSelect = (optionKey: string) => {
    if (question.question_type === "mcq_single") {
      setSelectedAnswers([optionKey])
    } else if (question.question_type === "mcq_multiple" || question.question_type === "comprehension") {
      setSelectedAnswers((prev) =>
        prev.includes(optionKey) ? prev.filter((key) => key !== optionKey) : [...prev, optionKey],
      )
    }
  }

  const isOptionSelected = (optionKey: string) => {
    return selectedAnswers.includes(optionKey)
  }

  return (
    <div className="space-y-6">
      {/* Question Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="text-sm">
                Question {questionNumber} of {totalQuestions}
              </Badge>
              <Badge variant="secondary">{question.section}</Badge>
              <Badge variant="outline">
                +{question.marks} / -{question.negative_marks}
              </Badge>
            </div>
            <Button
              variant={answer?.isMarkedForReview ? "default" : "outline"}
              size="sm"
              onClick={onMarkForReview}
              className="flex items-center space-x-1"
            >
              <Flag className="h-4 w-4" />
              <span>{answer?.isMarkedForReview ? "Marked" : "Mark for Review"}</span>
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Comprehension Passage */}
      {question.comprehension_passage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Comprehension Passage</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap">{question.comprehension_passage}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Question Content */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Question Text */}
            <div className="prose prose-sm max-w-none">
              <p className="text-lg font-medium whitespace-pre-wrap">{question.question_text}</p>
            </div>

            {/* Answer Options */}
            {question.question_type === "numeric" ? (
              <div className="space-y-3">
                <label className="text-sm font-medium text-muted-foreground">Enter your answer:</label>
                <Input
                  type="text"
                  value={numericAnswer}
                  onChange={(e) => setNumericAnswer(e.target.value)}
                  placeholder="Enter numeric answer"
                  className="max-w-xs"
                />
              </div>
            ) : (
              question.options && (
                <div className="space-y-3">
                  {Object.entries(question.options).map(([key, value]) => (
                    <div
                      key={key}
                      className={`
                        flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-colors
                        ${
                          isOptionSelected(key)
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                        }
                      `}
                      onClick={() => handleOptionSelect(key)}
                    >
                      {question.question_type === "mcq_single" ? (
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          checked={isOptionSelected(key)}
                          onChange={() => handleOptionSelect(key)}
                          className="mt-1"
                        />
                      ) : (
                        <Checkbox
                          checked={isOptionSelected(key)}
                          onCheckedChange={() => handleOptionSelect(key)}
                          className="mt-1"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-start space-x-2">
                          <span className="font-medium text-primary">{key}.</span>
                          <span className="whitespace-pre-wrap">{value}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={onPrevious} disabled={!canGoPrevious}>
              Previous
            </Button>

            <div className="text-sm text-muted-foreground">
              Time spent: {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, "0")}
            </div>

            <Button onClick={onNext} disabled={!canGoNext}>
              {canGoNext ? "Next" : "Last Question"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
