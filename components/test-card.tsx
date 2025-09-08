import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, FileText, Award } from "lucide-react"
import Link from "next/link"

interface TestCardProps {
  test: {
    id: string
    title: string
    description: string
    duration_minutes: number
    total_marks: number
    course_title?: string
    status?: "available" | "completed" | "in_progress"
    score?: number
  }
}

export function TestCard({ test }: TestCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-primary text-primary-foreground"
      case "in_progress":
        return "bg-secondary text-secondary-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed"
      case "in_progress":
        return "In Progress"
      default:
        return "Available"
    }
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-border/50 hover:border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors">
              {test.title}
            </CardTitle>
            {test.course_title && <p className="text-sm text-muted-foreground">{test.course_title}</p>}
            <p className="text-sm text-muted-foreground line-clamp-2">{test.description}</p>
          </div>
          <Badge className={getStatusColor(test.status || "available")}>
            {getStatusText(test.status || "available")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{test.duration_minutes} min</span>
          </div>
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{test.total_marks} marks</span>
          </div>
          {test.score !== undefined && (
            <div className="flex items-center space-x-2">
              <Award className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-primary">{test.score}%</span>
            </div>
          )}
        </div>

        <div className="flex space-x-2 pt-2">
          {test.status === "completed" ? (
            <Button asChild variant="outline" className="flex-1 bg-transparent" size="sm">
              <Link href={`/tests/${test.id}/results`}>View Results</Link>
            </Button>
          ) : test.status === "in_progress" ? (
            <Button asChild className="flex-1" size="sm">
              <Link href={`/tests/${test.id}/resume`}>Resume Test</Link>
            </Button>
          ) : (
            <Button asChild className="flex-1" size="sm">
              <Link href={`/tests/${test.id}/start`}>Start Test</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
