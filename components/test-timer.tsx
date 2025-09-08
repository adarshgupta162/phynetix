"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, AlertTriangle } from "lucide-react"

interface TestTimerProps {
  durationMinutes: number
  onTimeUp: () => void
  isActive: boolean
}

export function TestTimer({ durationMinutes, onTimeUp, isActive }: TestTimerProps) {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60) // Convert to seconds
  const [isWarning, setIsWarning] = useState(false)

  useEffect(() => {
    if (!isActive) return

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onTimeUp()
          return 0
        }

        // Show warning when 5 minutes left
        if (prev <= 300 && !isWarning) {
          setIsWarning(true)
        }

        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive, onTimeUp, isWarning])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card className={`${isWarning ? "border-destructive bg-destructive/5" : "border-primary bg-primary/5"}`}>
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          {isWarning ? (
            <AlertTriangle className="h-5 w-5 text-destructive" />
          ) : (
            <Clock className="h-5 w-5 text-primary" />
          )}
          <div>
            <div className="text-sm text-muted-foreground">Time Remaining</div>
            <div className={`text-xl font-mono font-bold ${isWarning ? "text-destructive" : "text-primary"}`}>
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
