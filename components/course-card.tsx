import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Clock } from "lucide-react"
import Link from "next/link"

interface CourseCardProps {
  course: {
    id: string
    title: string
    description: string
    thumbnail_url?: string
    progress?: number
    totalLessons?: number
    completedLessons?: number
  }
}

export function CourseCard({ course }: CourseCardProps) {
  const progress = course.progress || 0
  const completedLessons = course.completedLessons || 0
  const totalLessons = course.totalLessons || 0

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-border/50 hover:border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors">
              {course.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <BookOpen className="h-4 w-4" />
            <span>
              {completedLessons}/{totalLessons} lessons
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{Math.round(progress)}% complete</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium text-primary">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="flex space-x-2 pt-2">
          <Button asChild className="flex-1" size="sm">
            <Link href={`/courses/${course.id}`}>Continue Learning</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/courses/${course.id}/tests`}>View Tests</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
