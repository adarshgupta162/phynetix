import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { CourseCard } from "@/components/course-card"
import { TestCard } from "@/components/test-card"
import { StatsCard } from "@/components/stats-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Trophy, Clock, TrendingUp, Calendar, Target } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) {
    redirect("/auth/login")
  }

  // Get enrolled courses
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(`
      *,
      courses (
        id,
        title,
        description,
        thumbnail_url
      )
    `)
    .eq("student_id", user.id)

  // Get recent tests
  const { data: recentTests } = await supabase
    .from("tests")
    .select(`
      *,
      courses (
        title
      ),
      attempts (
        id,
        is_submitted,
        obtained_marks,
        total_marks
      )
    `)
    .limit(4)

  // Mock data for demonstration
  const coursesWithProgress =
    enrollments?.map((enrollment) => ({
      ...enrollment.courses,
      progress: Math.floor(Math.random() * 100),
      totalLessons: Math.floor(Math.random() * 20) + 5,
      completedLessons: Math.floor(Math.random() * 15) + 1,
    })) || []

  const testsWithStatus =
    recentTests?.map((test) => ({
      ...test,
      course_title: test.courses?.title,
      status: test.attempts?.length > 0 ? (test.attempts[0].is_submitted ? "completed" : "in_progress") : "available",
      score:
        test.attempts?.length > 0 && test.attempts[0].is_submitted
          ? Math.round((test.attempts[0].obtained_marks / test.attempts[0].total_marks) * 100)
          : undefined,
    })) || []

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={profile} />

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, {profile.full_name}!</h1>
          <p className="text-muted-foreground">
            Continue mastering physics, chemistry, and mathematics. You&apos;re making excellent progress!
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Enrolled Courses"
            value={coursesWithProgress.length}
            description="Active learning paths"
            icon={BookOpen}
          />
          <StatsCard
            title="Tests Completed"
            value={testsWithStatus.filter((t) => t.status === "completed").length}
            description="This month"
            icon={Trophy}
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Study Hours"
            value="24.5"
            description="This week"
            icon={Clock}
            trend={{ value: 8, isPositive: true }}
          />
          <StatsCard
            title="Average Score"
            value="78%"
            description="Last 5 tests"
            icon={TrendingUp}
            trend={{ value: 5, isPositive: true }}
          />
        </div>

        {/* Quick Actions */}
        <Card className="mb-8 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-primary" />
              <span>Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="sm" className="bg-primary hover:bg-primary/90">
                <Link href="/tests">Take a Practice Test</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/courses">Browse Courses</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/results">View Results</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Enrolled Courses */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-foreground">My Courses</h2>
              <Button asChild variant="outline" size="sm">
                <Link href="/courses">View All</Link>
              </Button>
            </div>

            {coursesWithProgress.length > 0 ? (
              <div className="space-y-4">
                {coursesWithProgress.slice(0, 3).map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-card-foreground mb-2">No courses enrolled yet</h3>
                <p className="text-muted-foreground mb-4">Start your learning journey by enrolling in a course</p>
                <Button asChild>
                  <Link href="/courses">Browse Courses</Link>
                </Button>
              </Card>
            )}
          </div>

          {/* Recent Tests */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-foreground">Recent Tests</h2>
              <Button asChild variant="outline" size="sm">
                <Link href="/tests">View All</Link>
              </Button>
            </div>

            {testsWithStatus.length > 0 ? (
              <div className="space-y-4">
                {testsWithStatus.slice(0, 3).map((test) => (
                  <TestCard key={test.id} test={test} />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-card-foreground mb-2">No tests available</h3>
                <p className="text-muted-foreground mb-4">Tests will appear here once you enroll in courses</p>
                <Button asChild>
                  <Link href="/courses">Enroll in Courses</Link>
                </Button>
              </Card>
            )}
          </div>
        </div>

        {/* Motivational Quote */}
        <Card className="mt-8 bg-gradient-to-r from-secondary/10 to-primary/10 border-secondary/20">
          <CardContent className="p-6 text-center">
            <blockquote className="text-lg font-medium text-card-foreground mb-2">
              &quot;Success is the sum of small efforts repeated day in and day out.&quot;
            </blockquote>
            <cite className="text-sm text-muted-foreground">— Robert Collier</cite>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
