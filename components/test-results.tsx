"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Trophy, Clock, Target, TrendingUp, CheckCircle, XCircle, AlertCircle, BarChart3 } from "lucide-react"
import Link from "next/link"

interface TestResult {
  attempt: {
    id: string
    total_marks: number
    obtained_marks: number
    time_spent_seconds: number
    submitted_at: string
  }
  test: {
    id: string
    title: string
    duration_minutes: number
    total_marks: number
  }
  sectionWiseResults: {
    section: string
    totalQuestions: number
    attempted: number
    correct: number
    incorrect: number
    marks: number
    timeSpent: number
  }[]
  questionWiseResults: {
    questionId: string
    section: string
    questionText: string
    isCorrect: boolean
    marksAwarded: number
    timeSpent: number
    selectedAnswers: string[]
    correctAnswers: string[]
  }[]
  percentile: number
  averageScore: number
}

interface TestResultsProps {
  result: TestResult
}

export function TestResults({ result }: TestResultsProps) {
  const { attempt, test, sectionWiseResults, questionWiseResults, percentile, averageScore } = result

  const percentage = Math.round((attempt.obtained_marks / attempt.total_marks) * 100)
  const totalQuestions = questionWiseResults.length
  const correctAnswers = questionWiseResults.filter((q) => q.isCorrect).length
  const incorrectAnswers = questionWiseResults.filter((q) => !q.isCorrect && q.selectedAnswers.length > 0).length
  const unattempted = totalQuestions - correctAnswers - incorrectAnswers

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600"
    if (percentage >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getPerformanceBadge = (percentage: number) => {
    if (percentage >= 80) return { label: "Excellent", variant: "default" as const }
    if (percentage >= 60) return { label: "Good", variant: "secondary" as const }
    return { label: "Needs Improvement", variant: "destructive" as const }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    }
    return `${minutes}m ${secs}s`
  }

  const performanceBadge = getPerformanceBadge(percentage)

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Trophy className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl">{test.title} - Results</CardTitle>
          </div>
          <Badge
            className={`mx-auto ${performanceBadge.variant === "default" ? "bg-primary" : performanceBadge.variant === "secondary" ? "bg-secondary" : "bg-destructive"}`}
          >
            {performanceBadge.label}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="text-4xl font-bold text-primary">
              {attempt.obtained_marks} / {attempt.total_marks}
            </div>
            <div className="text-2xl font-semibold text-muted-foreground">{percentage}%</div>
            <Progress value={percentage} className="h-3 max-w-md mx-auto" />
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
            <div className="text-sm text-muted-foreground">Correct</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-600">{incorrectAnswers}</div>
            <div className="text-sm text-muted-foreground">Incorrect</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <AlertCircle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-600">{unattempted}</div>
            <div className="text-sm text-muted-foreground">Unattempted</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{formatTime(attempt.time_spent_seconds)}</div>
            <div className="text-sm text-muted-foreground">Time Taken</div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Performance Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Your Score</span>
              <span className={`font-bold ${getPerformanceColor(percentage)}`}>{percentage}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Class Average</span>
              <span className="font-medium">{averageScore}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Your Percentile</span>
              <span className="font-bold text-primary">{percentile}th</span>
            </div>
            <div className="pt-2">
              <div className="text-sm text-muted-foreground mb-2">
                You performed better than {percentile}% of students
              </div>
              <Progress value={percentile} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Time Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Time</span>
              <span className="font-medium">{formatTime(attempt.time_spent_seconds)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Average per Question</span>
              <span className="font-medium">{formatTime(Math.floor(attempt.time_spent_seconds / totalQuestions))}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Time Remaining</span>
              <span className="font-medium">
                {formatTime(Math.max(0, test.duration_minutes * 60 - attempt.time_spent_seconds))}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section-wise Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Section-wise Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sectionWiseResults.map((section) => {
              const sectionPercentage = Math.round((section.correct / section.totalQuestions) * 100)
              return (
                <div key={section.section} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{section.section}</h4>
                    <Badge variant="outline">
                      {section.correct}/{section.totalQuestions} ({sectionPercentage}%)
                    </Badge>
                  </div>
                  <Progress value={sectionPercentage} className="h-2" />
                  <div className="grid grid-cols-4 gap-4 text-sm text-muted-foreground">
                    <div>Attempted: {section.attempted}</div>
                    <div>Correct: {section.correct}</div>
                    <div>Marks: {section.marks}</div>
                    <div>Time: {formatTime(section.timeSpent)}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Button asChild>
          <Link href={`/tests/${test.id}/analysis?attemptId=${attempt.id}`}>
            <BarChart3 className="mr-2 h-4 w-4" />
            Detailed Analysis
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/tests">Take Another Test</Link>
        </Button>
      </div>
    </div>
  )
}
