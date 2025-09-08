import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminHeader } from "@/components/admin-header"
import { StatsCard } from "@/components/stats-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Users, FileText, TrendingUp, Plus, Eye } from "lucide-react"
import Link from "next/link"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile and check if admin
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "admin") {
    redirect("/dashboard")
  }

  // Get statistics
  const { data: courses } = await supabase.from("courses").select("id").eq("is_active", true)
  const { data: students } = await supabase.from("profiles").select("id").eq("role", "student")
  const { data: tests } = await supabase.from("tests").select("id").eq("is_active", true)
  const { data: enrollments } = await supabase.from("enrollments").select("id")

  // Get recent activity
  const { data: recentCourses } = await supabase
    .from("courses")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(5)

  const { data: recentTests } = await supabase
    .from("tests")
    .select(`
      *,
      courses (
        title
      )
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader user={profile} />

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage courses, tests, and monitor student progress</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard title="Total Courses" value={courses?.length || 0} description="Active courses" icon={BookOpen} />
          <StatsCard
            title="Total Students"
            value={students?.length || 0}
            description="Registered students"
            icon={Users}
          />
          <StatsCard title="Total Tests" value={tests?.length || 0} description="Active tests" icon={FileText} />
          <StatsCard
            title="Total Enrollments"
            value={enrollments?.length || 0}
            description="Course enrollments"
            icon={TrendingUp}
          />
        </div>

        {/* Quick Actions */}
        <Card className="mb-8 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5 text-primary" />
              <span>Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="sm" className="bg-primary hover:bg-primary/90">
                <Link href="/admin/courses/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Course
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/tests/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Test
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/students">
                  <Eye className="mr-2 h-4 w-4" />
                  View Students
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Courses */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-foreground">Recent Courses</h2>
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/courses">View All</Link>
              </Button>
            </div>

            {recentCourses && recentCourses.length > 0 ? (
              <div className="space-y-4">
                {recentCourses.map((course) => (
                  <Card key={course.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="font-medium text-card-foreground">{course.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                          <p className="text-xs text-muted-foreground">
                            Created {new Date(course.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/courses/${course.id}`}>Edit</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-card-foreground mb-2">No courses created yet</h3>
                <p className="text-muted-foreground mb-4">Start by creating your first course</p>
                <Button asChild>
                  <Link href="/admin/courses/new">Create Course</Link>
                </Button>
              </Card>
            )}
          </div>

          {/* Recent Tests */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-foreground">Recent Tests</h2>
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/tests">View All</Link>
              </Button>
            </div>

            {recentTests && recentTests.length > 0 ? (
              <div className="space-y-4">
                {recentTests.map((test) => (
                  <Card key={test.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="font-medium text-card-foreground">{test.title}</h3>
                          <p className="text-sm text-muted-foreground">{test.courses?.title}</p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>{test.duration_minutes} minutes</span>
                            <span>{test.total_marks} marks</span>
                          </div>
                        </div>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/tests/${test.id}`}>Edit</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-card-foreground mb-2">No tests created yet</h3>
                <p className="text-muted-foreground mb-4">Create tests for your courses</p>
                <Button asChild>
                  <Link href="/admin/tests/new">Create Test</Link>
                </Button>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
