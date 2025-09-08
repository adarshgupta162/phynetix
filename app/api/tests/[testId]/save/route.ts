import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: Promise<{ testId: string }> }) {
  try {
    const { testId } = await params
    const { attemptId, answers, timeSpent } = await request.json()

    const supabase = await createClient()

    // Verify user authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify attempt belongs to user
    const { data: attempt } = await supabase
      .from("attempts")
      .select("*")
      .eq("id", attemptId)
      .eq("student_id", user.id)
      .single()

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 })
    }

    // Save/update answers
    for (const answer of answers) {
      const { error } = await supabase.from("answers").upsert({
        attempt_id: attemptId,
        question_id: answer.questionId,
        selected_answers: answer.selectedAnswers,
        is_marked_for_review: answer.isMarkedForReview,
        time_spent_seconds: answer.timeSpent,
        answered_at: answer.selectedAnswers.length > 0 ? new Date().toISOString() : null,
      })

      if (error) {
        console.error("[v0] Error saving answer:", error)
        return NextResponse.json({ error: "Failed to save answer" }, { status: 500 })
      }
    }

    // Update attempt with total time spent
    const { error: attemptError } = await supabase
      .from("attempts")
      .update({
        time_spent_seconds: attempt.time_spent_seconds + timeSpent,
        updated_at: new Date().toISOString(),
      })
      .eq("id", attemptId)

    if (attemptError) {
      console.error("[v0] Error updating attempt:", attemptError)
      return NextResponse.json({ error: "Failed to update attempt" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in save route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
