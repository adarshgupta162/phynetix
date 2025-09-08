import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: Promise<{ testId: string }> }) {
  try {
    const { testId } = await params
    const { attemptId, answers } = await request.json()

    const supabase = await createClient()

    // Verify user authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get test questions with correct answers
    const { data: questions } = await supabase.from("questions").select("*").eq("test_id", testId)

    if (!questions) {
      return NextResponse.json({ error: "Questions not found" }, { status: 404 })
    }

    // Grade answers
    let totalMarks = 0
    let obtainedMarks = 0

    for (const question of questions) {
      totalMarks += question.marks

      const studentAnswer = answers.find((a: any) => a.questionId === question.id)
      if (!studentAnswer || !studentAnswer.selectedAnswers.length) {
        continue
      }

      let isCorrect = false
      const correctAnswers = question.correct_answers
      const selectedAnswers = studentAnswer.selectedAnswers

      if (question.question_type === "mcq_single") {
        isCorrect = selectedAnswers.length === 1 && correctAnswers.includes(selectedAnswers[0])
      } else if (question.question_type === "mcq_multiple" || question.question_type === "comprehension") {
        isCorrect =
          correctAnswers.length === selectedAnswers.length &&
          correctAnswers.every((answer: string) => selectedAnswers.includes(answer))
      } else if (question.question_type === "numeric") {
        const studentNumeric = Number.parseFloat(selectedAnswers[0])
        const correctNumeric = Number.parseFloat(correctAnswers[0])
        isCorrect = Math.abs(studentNumeric - correctNumeric) < 0.01
      }

      const marksAwarded = isCorrect ? question.marks : -question.negative_marks

      // Update answer with grading
      await supabase.from("answers").upsert({
        attempt_id: attemptId,
        question_id: question.id,
        selected_answers: selectedAnswers,
        is_correct: isCorrect,
        marks_awarded: marksAwarded,
        is_marked_for_review: studentAnswer.isMarkedForReview,
        time_spent_seconds: studentAnswer.timeSpent,
        answered_at: new Date().toISOString(),
      })

      obtainedMarks += marksAwarded
    }

    // Update attempt as submitted
    const { error: attemptError } = await supabase
      .from("attempts")
      .update({
        is_submitted: true,
        submitted_at: new Date().toISOString(),
        total_marks: totalMarks,
        obtained_marks: Math.max(0, obtainedMarks), // Ensure non-negative
      })
      .eq("id", attemptId)

    if (attemptError) {
      console.error("[v0] Error updating attempt:", attemptError)
      return NextResponse.json({ error: "Failed to submit test" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      totalMarks,
      obtainedMarks: Math.max(0, obtainedMarks),
      percentage: Math.round((Math.max(0, obtainedMarks) / totalMarks) * 100),
    })
  } catch (error) {
    console.error("[v0] Error in submit route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
