import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ attemptId: string }> }) {
  try {
    const { attemptId } = await params
    const supabase = await createClient()

    // Verify user authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get attempt with test details
    const { data: attempt } = await supabase
      .from("attempts")
      .select(`
        *,
        tests (
          id,
          title,
          duration_minutes,
          total_marks,
          courses (
            title
          )
        )
      `)
      .eq("id", attemptId)
      .eq("student_id", user.id)
      .single()

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 })
    }

    // Get all answers for this attempt
    const { data: answers } = await supabase
      .from("answers")
      .select(`
        *,
        questions (
          id,
          section,
          question_text,
          correct_answers,
          marks,
          negative_marks
        )
      `)
      .eq("attempt_id", attemptId)

    // Calculate section-wise results
    const sectionWiseResults = ["Physics", "Chemistry", "Mathematics"].map((section) => {
      const sectionAnswers = answers?.filter((a) => a.questions?.section === section) || []
      const totalQuestions = sectionAnswers.length
      const attempted = sectionAnswers.filter((a) => a.selected_answers && a.selected_answers.length > 0).length
      const correct = sectionAnswers.filter((a) => a.is_correct).length
      const incorrect = attempted - correct
      const marks = sectionAnswers.reduce((sum, a) => sum + (a.marks_awarded || 0), 0)
      const timeSpent = sectionAnswers.reduce((sum, a) => sum + (a.time_spent_seconds || 0), 0)

      return {
        section,
        totalQuestions,
        attempted,
        correct,
        incorrect,
        marks,
        timeSpent,
      }
    })

    // Get question-wise results
    const questionWiseResults =
      answers?.map((answer) => ({
        questionId: answer.question_id,
        section: answer.questions?.section || "",
        questionText: answer.questions?.question_text || "",
        isCorrect: answer.is_correct || false,
        marksAwarded: answer.marks_awarded || 0,
        timeSpent: answer.time_spent_seconds || 0,
        selectedAnswers: answer.selected_answers || [],
        correctAnswers: answer.questions?.correct_answers || [],
      })) || []

    // Calculate percentile (mock calculation - in real app, compare with all attempts)
    const { data: allAttempts } = await supabase
      .from("attempts")
      .select("obtained_marks")
      .eq("test_id", attempt.test_id)
      .eq("is_submitted", true)

    let percentile = 50 // Default percentile
    if (allAttempts && allAttempts.length > 1) {
      const betterScores = allAttempts.filter((a) => a.obtained_marks < attempt.obtained_marks).length
      percentile = Math.round((betterScores / allAttempts.length) * 100)
    }

    // Calculate average score
    const averageScore =
      allAttempts && allAttempts.length > 0
        ? Math.round(allAttempts.reduce((sum, a) => sum + a.obtained_marks, 0) / allAttempts.length)
        : 0

    const result = {
      attempt,
      test: attempt.tests,
      sectionWiseResults,
      questionWiseResults,
      percentile,
      averageScore,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Error fetching result:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
