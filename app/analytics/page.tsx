"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { DashboardHeader } from "@/components/dashboard-header"
import { PerformanceAnalytics } from "@/components/performance-analytics"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState(null)
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get user
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser()
        if (!currentUser) {
          router.push("/auth/login")
          return
        }

        // Get user profile
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", currentUser.id).single()

        if (!profile) {
          router.push("/auth/login")
          return
        }

        setUser(profile)

        // Fetch analytics data
        const response = await fetch("/api/analytics/performance")
        if (!response.ok) {
          throw new Error("Failed to fetch analytics data")
        }

        const data = await response.json()
        setAnalyticsData(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [supabase, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card className="p-12 text-center">
            <CardContent>
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading your performance analytics...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card className="p-12 text-center">
            <CardContent>
              <p className="text-destructive mb-4">Error loading analytics: {error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {user && <DashboardHeader user={user} />}

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Performance Analytics</h1>
          <p className="text-muted-foreground">Detailed analysis of your test performance and learning progress</p>
        </div>

        {analyticsData && <PerformanceAnalytics data={analyticsData} />}
      </main>
    </div>
  )
}
