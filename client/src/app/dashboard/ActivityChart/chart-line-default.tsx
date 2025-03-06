"use client"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"
import { useState } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Button } from "@/components/ui/button"

const weekData = [
  { day: "Mon", tasks: 5 },
  { day: "Tue", tasks: 8 },
  { day: "Wed", tasks: 12 },
  { day: "Thu", tasks: 7 },
  { day: "Fri", tasks: 10 },
  { day: "Sat", tasks: 3 },
  { day: "Sun", tasks: 2 },
]

const monthData = [
  { week: "Week 1", tasks: 30 },
  { week: "Week 2", tasks: 45 },
  { week: "Week 3", tasks: 38 },
  { week: "Week 4", tasks: 50 },
]

const chartConfig = {
  tasks: {
    label: "Tasks Completed",
    color: "#5030e5",
  },
} satisfies ChartConfig

export function ActivityChart() {
  const [view, setView] = useState<"week" | "month">("week")

  const chartData = view === "week" ? weekData : monthData
  const xAxisKey = view === "week" ? "day" : "week"

  return (
    <Card className="h-50">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Activity</CardTitle>
          <CardDescription>{view === "week" ? "Last 7 days" : "Last 4 weeks"}</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={() => setView(view === "week" ? "month" : "week")}>
          {view === "week" ? "Month View" : "Week View"}
        </Button>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-40 w-full ">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis dataKey={xAxisKey} tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line dataKey="tasks" type="natural" stroke="#5030e5" strokeWidth={2} dot={false} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

