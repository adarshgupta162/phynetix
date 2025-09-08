"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Plus, Trash2 } from "lucide-react"

interface QuestionFormProps {
  testId: string
  question?: {
    id: string
    section: string
    question_type: string
    question_text: string
    options: any
    correct_answers: any
    marks: number
    negative_marks: number
    comprehension_passage?: string
  }
  onSuccess?: () => void
  onCancel?: () => void
}

export function QuestionForm({ testId, question, onSuccess, onCancel }: QuestionFormProps) {
  const [section, setSection] = useState(question?.section || "Physics")
  const [questionType, setQuestionType] = useState(question?.question_type || "mcq_single")
  const [questionText, setQuestionText] = useState(question?.question_text || "")
  const [options, setOptions] = useState<Record<string, string>>(question?.options || { A: "", B: "", C: "", D: "" })
  const [correctAnswers, setCorrectAnswers] = useState<string[]>(question?.correct_answers || [])
  const [numericAnswer, setNumericAnswer] = useState(question?.correct_answers?.[0] || "")
  const [marks, setMarks] = useState(question?.marks || 4)
  const [negativeMarks, setNegativeMarks] = useState(question?.negative_marks || 1)
  const [comprehensionPassage, setComprehensionPassage] = useState(question?.comprehension_passage || "")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const handleOptionChange = (key: string, value: string) => {
    setOptions((prev) => ({ ...prev, [key]: value }))
  }

  const addOption = () => {
    const nextKey = String.fromCharCode(65 + Object.keys(options).length)
    setOptions((prev) => ({ ...prev, [nextKey]: "" }))
  }

  const removeOption = (key: string) => {
    const newOptions = { ...options }
    delete newOptions[key]
    setOptions(newOptions)
    setCorrectAnswers((prev) => prev.filter((answer) => answer !== key))
  }

  const handleCorrectAnswerChange = (optionKey: string, checked: boolean) => {
    if (questionType === "mcq_single") {
      setCorrectAnswers(checked ? [optionKey] : [])
    } else {
      setCorrectAnswers((prev) => (checked ? [...prev, optionKey] : prev.filter((answer) => answer !== optionKey)))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      let finalCorrectAnswers: string[]
      let finalOptions: Record<string, string> | null = null

      if (questionType === "numeric") {
        finalCorrectAnswers = [numericAnswer]
      } else if (questionType === "comprehension") {
        finalCorrectAnswers = correctAnswers
        finalOptions = options
      } else {
        finalCorrectAnswers = correctAnswers
        finalOptions = options
      }

      const questionData = {
        test_id: testId,
        section,
        question_type: questionType,
        question_text: questionText,
        options: finalOptions,
        correct_answers: finalCorrectAnswers,
        marks,
        negative_marks: negativeMarks,
        comprehension_passage: questionType === "comprehension" ? comprehensionPassage : null,
      }

      if (question) {
        // Update existing question
        const { error } = await supabase.from("questions").update(questionData).eq("id", question.id)
        if (error) throw error
      } else {
        // Create new question
        const { error } = await supabase.from("questions").insert(questionData)
        if (error) throw error
      }

      if (onSuccess) {
        onSuccess()
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{question ? "Edit Question" : "Create New Question"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="section">Section</Label>
              <Select value={section} onValueChange={setSection}>
                <SelectTrigger>
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Physics">Physics</SelectItem>
                  <SelectItem value="Chemistry">Chemistry</SelectItem>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="questionType">Question Type</Label>
              <Select value={questionType} onValueChange={setQuestionType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select question type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mcq_single">MCQ (Single Correct)</SelectItem>
                  <SelectItem value="mcq_multiple">MCQ (Multiple Correct)</SelectItem>
                  <SelectItem value="numeric">Numeric Answer</SelectItem>
                  <SelectItem value="comprehension">Comprehension</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {questionType === "comprehension" && (
            <div className="space-y-2">
              <Label htmlFor="comprehensionPassage">Comprehension Passage</Label>
              <Textarea
                id="comprehensionPassage"
                value={comprehensionPassage}
                onChange={(e) => setComprehensionPassage(e.target.value)}
                placeholder="Enter the comprehension passage"
                rows={4}
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="questionText">Question Text</Label>
            <Textarea
              id="questionText"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Enter the question"
              rows={3}
              required
            />
          </div>

          {questionType !== "numeric" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Options</Label>
                <Button type="button" variant="outline" size="sm" onClick={addOption}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Option
                </Button>
              </div>

              <div className="space-y-3">
                {Object.entries(options).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {questionType === "mcq_single" ? (
                        <input
                          type="radio"
                          name="correct"
                          checked={correctAnswers.includes(key)}
                          onChange={(e) => handleCorrectAnswerChange(key, e.target.checked)}
                          className="h-4 w-4"
                        />
                      ) : (
                        <Checkbox
                          checked={correctAnswers.includes(key)}
                          onCheckedChange={(checked) => handleCorrectAnswerChange(key, !!checked)}
                        />
                      )}
                      <Label className="font-medium">{key}:</Label>
                    </div>
                    <Input
                      value={value}
                      onChange={(e) => handleOptionChange(key, e.target.value)}
                      placeholder={`Option ${key}`}
                      className="flex-1"
                      required
                    />
                    {Object.keys(options).length > 2 && (
                      <Button type="button" variant="outline" size="sm" onClick={() => removeOption(key)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {questionType === "numeric" && (
            <div className="space-y-2">
              <Label htmlFor="numericAnswer">Correct Answer</Label>
              <Input
                id="numericAnswer"
                value={numericAnswer}
                onChange={(e) => setNumericAnswer(e.target.value)}
                placeholder="Enter the numeric answer"
                required
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="marks">Marks</Label>
              <Input
                id="marks"
                type="number"
                value={marks}
                onChange={(e) => setMarks(Number.parseInt(e.target.value))}
                min="1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="negativeMarks">Negative Marks</Label>
              <Input
                id="negativeMarks"
                type="number"
                value={negativeMarks}
                onChange={(e) => setNegativeMarks(Number.parseInt(e.target.value))}
                min="0"
                required
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex space-x-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {question ? "Update Question" : "Create Question"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
