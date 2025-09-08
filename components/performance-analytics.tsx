"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, Clock, Target, Award } from "lucide-react"

interface PerformanceData {
  overallStats: {
    totalTests: number
    averageScore: number
    bestScore: number
    totalTimeSpent: number
    improvementTrend: number
  }
  sectionWisePerformance: {
    section: string
    averageScore: number
    totalQuestions: number
    correctAnswers: number
    averageTime: number
  }[]
  recentTests: {
    testTitle: string
    score: number
    percentage: number
    date: string
    timeSpent: number
  }[]
  timeAnalysis: {
    questionType: string
    averageTime: number
    accuracy: number
  }[]
  strengthsWeaknesses: {
    strengths: string[]
    weaknesses: string[]
    recommendations: string[]
  }
}

interface PerformanceAnalyticsProps {
  data: PerformanceData
}

export function PerformanceAnalytics({ data }: PerformanceAnalyticsProps) {
  const { overallStats, sectionWisePerformance, recentTests, timeAnalysis, strengthsWeaknesses } = data

  const COLORS = ["#15803d", "#84cc16", "#f97316", "#ea580c"]

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const pieData = sectionWisePerformance.map((section, index) => ({
    name: section.section,
    value: section.averageScore,
    color: COLORS[index % COLORS.length],
  }))

  return (
    <div className="space-y-6">
      {/* Overall Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-primary">{overallStats.totalTests}</div>
            <div className="text-sm text-muted-foreground">Tests Taken</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{overallStats.averageScore}%</div>
            <div className="text-sm text-muted-foreground">Average Score</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{overallStats.bestScore}%</div>
            <div className="text-sm text-muted-foreground">Best Score</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">{formatTime(overallStats.totalTimeSpent)}</div>
            <div className="text-sm text-muted-foreground">Total Study Time</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section-wise Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Section-wise Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sectionWisePerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="section" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="averageScore" fill="#15803d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Test Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Test Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={recentTests}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="testTitle" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="percentage" stroke="#15803d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Time vs Accuracy Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {timeAnalysis.map((item) => (
                <div key={item.questionType} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{item.questionType}</span>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{formatTime(item.averageTime)}</Badge>
                      <Badge variant={item.accuracy >= 70 ? "default" : "destructive"}>{item.accuracy}%</Badge>
                    </div>
                  </div>
                  <Progress value={item.accuracy} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Score Distribution by Subject</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Strengths and Weaknesses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Strengths</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {strengthsWeaknesses.strengths.map((strength, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-sm">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Areas for Improvement</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {strengthsWeaknesses.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  <span className="text-sm">{weakness}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-blue-600">Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {strengthsWeaknesses.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-sm">{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Improvement Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Performance Trend</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="text-3xl font-bold text-primary">
              {overallStats.improvementTrend > 0 ? "+" : ""}
              {overallStats.improvementTrend}%
            </div>
            <div className="text-muted-foreground">
              {overallStats.improvementTrend > 0 ? "Improvement" : "Change"} from last month
            </div>
          </div>
          <Progress
            value={Math.abs(overallStats.improvementTrend)}
            className={`h-3 mt-2 ${overallStats.improvementTrend > 0 ? "" : "opacity-50"}`}
          />
        </CardContent>
      </Card>
    </div>
  )
}
