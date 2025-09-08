import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TestInterface } from "@/components/test-interface"

export default async function StartTestPage({ params }: { params: Promise<{ testId: string }> }) {
  const { testId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get test details
  const { data: test } = await supabase.from("tests").select("*").eq("id", testId).single()

  if (!test) {
    redirect("/dashboard")
  }

  // Check if user has existing attempt
  let { data: attempt } = await supabase
    .from("attempts")
    .select("*")
    .eq("test_id", testId)
    .eq("student_id", user.id)
    .single()

  // Get questions and randomize order
  const { data: questions } = await supabase
    .from("questions")
    .select("*")
    .eq("test_id", testId)
    .order("section")
    .order("order_index")

  if (!questions || questions.length === 0) {
    redirect("/dashboard")
  }

  // Randomize questions within each section
  const randomizedQuestions = questions.sort(() => Math.random() - 0.5)

  if (!attempt) {
    // Create new attempt
    const { data: newAttempt, error } = await supabase
      .from("attempts")
      .insert({
        test_id: testId,
        student_id: user.id,
        question_order: randomizedQuestions.map((q) => q.id),
      })
      .select()
      .single()

    if (error || !newAttempt) {
      redirect("/dashboard")
    }

    attempt = newAttempt
  } else if (attempt.is_submitted) {
    redirect(`/tests/${testId}/results?attemptId=${attempt.id}`)
  }

  // Get existing answers if resuming
  const { data: existingAnswers } = await supabase.from("answers").select("*").eq("attempt_id", attempt.id)

  const formattedAnswers =
    existingAnswers?.map((answer) => ({
      questionId: answer.question_id,
      selectedAnswers: answer.selected_answers || [],
      isMarkedForReview: answer.is_marked_for_review || false,
      timeSpent: answer.time_spent_seconds || 0,
    })) || []

  return (
    <TestInterface
      testId={testId}
      attemptId={attempt.id}
      test={test}
      questions={randomizedQuestions}
      initialAnswers={formattedAnswers}
    />
  )
}
