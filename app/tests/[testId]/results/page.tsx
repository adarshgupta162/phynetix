import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TestResults } from "@/components/test-results"

export default async function TestResultsPage({
  params,
  searchParams,
}: {
  params: Promise<{ testId: string }>
  searchParams: Promise<{ attemptId: string }>
}) {
  const { testId } = await params
  const { attemptId } = await searchParams

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  if (!attemptId) {
    redirect("/dashboard")
  }

  // Fetch result data using the API
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/attempts/${attemptId}/result`,
    {
      headers: {
        Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
      },
    },
  )

  if (!response.ok) {
    redirect("/dashboard")
  }

  const result = await response.json()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <TestResults result={result} />
      </div>
    </div>
  )
}
