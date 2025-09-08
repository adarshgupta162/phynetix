import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify user authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all user attempts
    const { data: attempts } = await supabase
      .from("attempts")
      .select(`
        *,
        tests (
          title,
          total_marks
        )
      `)
      .eq("student_id", user.id)
      .eq("is_submitted", true)
      .order("submitted_at", { ascending: false })

    if (!attempts || attempts.length === 0) {
      return NextResponse.json({
        overallStats: {
          totalTests: 0,
          averageScore: 0,
          bestScore: 0,
          totalTimeSpent: 0,
          improvementTrend: 0,
        },
        sectionWisePerformance: [],
        recentTests: [],
        timeAnalysis: [],
        strengthsWeaknesses: {
          strengths: [],
          weaknesses: [],
          recommendations: [],
        },
      })
    }

    // Calculate overall stats
    const totalTests = attempts.length
    const averageScore = Math.round(
      attempts.reduce((sum, a) => sum + (a.obtained_marks / a.total_marks) * 100, 0) / totalTests,
    )
    const bestScore = Math.max(...attempts.map((a) => Math.round((a.obtained_marks / a.total_marks) * 100)))
    const totalTimeSpent = attempts.reduce((sum, a) => sum + a.time_spent_seconds, 0)

    // Calculate improvement trend (compare last 3 tests with previous 3)
    let improvementTrend = 0
    if (attempts.length >= 6) {
      const recent3 = attempts.slice(0, 3)
      const previous3 = attempts.slice(3, 6)
      const recentAvg = recent3.reduce((sum, a) => sum + (a.obtained_marks / a.total_marks) * 100, 0) / 3
      const previousAvg = previous3.reduce((sum, a) => sum + (a.obtained_marks / a.total_marks) * 100, 0) / 3
      improvementTrend = Math.round(recentAvg - previousAvg)
    }

    // Get answers for section-wise analysis
    const { data: answers } = await supabase
      .from("answers")
      .select(`
        *,
        questions (
          section,
          question_type
        ),
        attempts!inner (
          student_id
        )
      `)
      .eq("attempts.student_id", user.id)

    // Calculate section-wise performance
    const sectionWisePerformance = ["Physics", "Chemistry", "Mathematics"].map((section) => {
      const sectionAnswers = answers?.filter((a) => a.questions?.section === section) || []
      const totalQuestions = sectionAnswers.length
      const correctAnswers = sectionAnswers.filter((a) => a.is_correct).length
      const averageScore = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0
      const averageTime =
        totalQuestions > 0
          ? Math.round(sectionAnswers.reduce((sum, a) => sum + (a.time_spent_seconds || 0), 0) / totalQuestions)
          : 0

      return {
        section,
        averageScore,
        totalQuestions,
        correctAnswers,
        averageTime,
      }
    })

    // Recent tests data
    const recentTests = attempts.slice(0, 10).map((attempt) => ({
      testTitle: attempt.tests?.title || "Test",
      score: attempt.obtained_marks,
      percentage: Math.round((attempt.obtained_marks / attempt.total_marks) * 100),
      date: new Date(attempt.submitted_at || "").toLocaleDateString(),
      timeSpent: attempt.time_spent_seconds,
    }))

    // Time analysis by question type
    const questionTypes = ["mcq_single", "mcq_multiple", "numeric", "comprehension"]
    const timeAnalysis = questionTypes.map((type) => {
      const typeAnswers = answers?.filter((a) => a.questions?.question_type === type) || []
      const averageTime =
        typeAnswers.length > 0
          ? Math.round(typeAnswers.reduce((sum, a) => sum + (a.time_spent_seconds || 0), 0) / typeAnswers.length)
          : 0
      const accuracy =
        typeAnswers.length > 0
          ? Math.round((typeAnswers.filter((a) => a.is_correct).length / typeAnswers.length) * 100)
          : 0

      return {
        questionType: type.replace("_", " ").toUpperCase(),
        averageTime,
        accuracy,
      }
    })

    // Generate strengths, weaknesses, and recommendations
    const strengths = []
    const weaknesses = []
    const recommendations = []

    // Analyze performance
    sectionWisePerformance.forEach((section) => {
      if (section.averageScore >= 80) {
        strengths.push(`Strong performance in ${section.section}`)
      } else if (section.averageScore < 60) {
        weaknesses.push(`Needs improvement in ${section.section}`)
        recommendations.push(`Focus more practice on ${section.section} concepts`)
      }
    })

    if (averageScore >= 80) {
      strengths.push("Consistently high performance across tests")
    }

    if (improvementTrend > 0) {
      strengths.push("Showing positive improvement trend")
    } else if (improvementTrend < -5) {
      weaknesses.push("Recent performance decline")
      recommendations.push("Review recent test mistakes and practice more")
    }

    // Time-based analysis
    const avgTimePerQuestion = totalTimeSpent / (attempts.length * 30) // Assuming 30 questions per test
    if (avgTimePerQuestion > 120) {
      // More than 2 minutes per question
      weaknesses.push("Taking too much time per question")
      recommendations.push("Practice time management and quick problem-solving techniques")
    }

    const analyticsData = {
      overallStats: {
        totalTests,
        averageScore,
        bestScore,
        totalTimeSpent,
        improvementTrend,
      },
      sectionWisePerformance,
      recentTests,
      timeAnalysis,
      strengthsWeaknesses: {
        strengths: strengths.length > 0 ? strengths : ["Keep practicing to build strengths"],
        weaknesses: weaknesses.length > 0 ? weaknesses : ["No major weaknesses identified"],
        recommendations: recommendations.length > 0 ? recommendations : ["Continue regular practice"],
      },
    }

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error("[v0] Error fetching analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
