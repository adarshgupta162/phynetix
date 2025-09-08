"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Clock, Target, TrendingUp, Users } from "lucide-react"
import Link from "next/link"
import { use } from "react"

export default function TestAnalysisPage({
  params,
  searchParams,
}: {
  params: Promise<{ testId: string }>
  searchParams: Promise<{ attemptId: string }>
}) {
  const { testId } = use(params)
  const { attemptId } = use(searchParams)

  const [result, setResult] = useState<any>(null)
  const [analysis, setAnalysis] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setUser(user)

        // Fetch detailed analysis
        const response = await fetch(`/api/attempts/${attemptId}/result`)
        const data = await response.json()

        if (data.success) {
          setResult(data.result)
          setAnalysis(data.analysis)
        }
      } catch (error) {
        console.error("Error fetching analysis:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (attemptId) {
      fetchData()
    }
  }, [attemptId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading detailed analysis...</p>
        </div>
      </div>
    )
  }

  if (!result || !analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Analysis not available</p>
          <Link href="/dashboard">
            <Button className="mt-4">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href={`/tests/${testId}/results?attemptId=${attemptId}`}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Results
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Detailed Analysis</h1>
          <p className="text-gray-600">In-depth performance breakdown and insights</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Performance Overview */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Section-wise Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysis.sectionAnalysis?.map((section: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold">{section.section}</h3>
                        <Badge variant={section.accuracy >= 70 ? "default" : "destructive"}>
                          {section.accuracy.toFixed(1)}% Accuracy
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Attempted</p>
                          <p className="font-semibold">
                            {section.attempted}/{section.total}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Correct</p>
                          <p className="font-semibold text-green-600">{section.correct}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Time Spent</p>
                          <p className="font-semibold">{Math.round(section.timeSpent / 60)}m</p>
                        </div>
                      </div>
                      <div className="mt-2 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${section.accuracy}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Time Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{Math.round(analysis.averageTimePerQuestion)}s</p>
                    <p className="text-sm text-gray-600">Avg. Time per Question</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{Math.round(result.time_taken / 60)}m</p>
                    <p className="text-sm text-gray-600">Total Time Taken</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Insights Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="font-semibold text-blue-800">Strengths</p>
                  <ul className="text-sm text-blue-700 mt-1 space-y-1">
                    {analysis.strengths?.map((strength: string, index: number) => (
                      <li key={index}>• {strength}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className="font-semibold text-orange-800">Areas to Improve</p>
                  <ul className="text-sm text-orange-700 mt-1 space-y-1">
                    {analysis.improvements?.map((improvement: string, index: number) => (
                      <li key={index}>• {improvement}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Peer Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-indigo-600 mb-2">{analysis.percentile}th</p>
                  <p className="text-sm text-gray-600 mb-4">Percentile</p>
                  <p className="text-xs text-gray-500">You performed better than {analysis.percentile}% of students</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
