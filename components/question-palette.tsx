"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Question {
  id: string
  section: string
  order_index: number
}

interface QuestionStatus {
  questionId: string
  status: "not-visited" | "not-attempted" | "attempted" | "marked-for-review" | "attempted-and-marked"
}

interface QuestionPaletteProps {
  questions: Question[]
  questionStatuses: QuestionStatus[]
  currentQuestionId: string
  onQuestionSelect: (questionId: string) => void
  sections: string[]
  currentSection: string
  onSectionChange: (section: string) => void
}

export function QuestionPalette({
  questions,
  questionStatuses,
  currentQuestionId,
  onQuestionSelect,
  sections,
  currentSection,
  onSectionChange,
}: QuestionPaletteProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "attempted":
        return "bg-green-500 text-white hover:bg-green-600"
      case "not-attempted":
        return "bg-red-500 text-white hover:bg-red-600"
      case "marked-for-review":
        return "bg-purple-500 text-white hover:bg-purple-600"
      case "attempted-and-marked":
        return "bg-blue-500 text-white hover:bg-blue-600"
      default:
        return "bg-gray-300 text-gray-700 hover:bg-gray-400"
    }
  }

  const getStatusCount = (status: string) => {
    return questionStatuses.filter((q) => q.status === status).length
  }

  const getSectionQuestions = (section: string) => {
    return questions.filter((q) => q.section === section)
  }

  const getQuestionStatus = (questionId: string) => {
    return questionStatuses.find((q) => q.questionId === questionId)?.status || "not-visited"
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Question Palette</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Section Navigation */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">Sections</div>
          <div className="flex flex-wrap gap-2">
            {sections.map((section) => (
              <Button
                key={section}
                variant={currentSection === section ? "default" : "outline"}
                size="sm"
                onClick={() => onSectionChange(section)}
                className="text-xs"
              >
                {section}
              </Button>
            ))}
          </div>
        </div>

        {/* Status Legend */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">Legend</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-300 rounded"></div>
              <span>Not Visited ({getStatusCount("not-visited")})</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>Not Attempted ({getStatusCount("not-attempted")})</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Attempted ({getStatusCount("attempted")})</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-purple-500 rounded"></div>
              <span>Marked ({getStatusCount("marked-for-review")})</span>
            </div>
          </div>
        </div>

        {/* Question Grid */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-muted-foreground">{currentSection} Questions</div>
          <div className="grid grid-cols-5 gap-2">
            {getSectionQuestions(currentSection).map((question, index) => {
              const status = getQuestionStatus(question.id)
              const isActive = question.id === currentQuestionId

              return (
                <Button
                  key={question.id}
                  variant="outline"
                  size="sm"
                  className={`
                    h-10 w-10 p-0 text-xs font-medium
                    ${getStatusColor(status)}
                    ${isActive ? "ring-2 ring-primary ring-offset-2" : ""}
                  `}
                  onClick={() => onQuestionSelect(question.id)}
                >
                  {index + 1}
                </Button>
              )
            })}
          </div>
        </div>

        {/* Summary */}
        <div className="pt-4 border-t">
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Questions:</span>
              <span className="font-medium">{questions.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Attempted:</span>
              <span className="font-medium text-green-600">
                {getStatusCount("attempted") + getStatusCount("attempted-and-marked")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Marked for Review:</span>
              <span className="font-medium text-purple-600">
                {getStatusCount("marked-for-review") + getStatusCount("attempted-and-marked")}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
