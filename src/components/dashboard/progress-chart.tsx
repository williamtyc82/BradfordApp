"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

import {
  ChartTooltipContent,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart"

const data = [
  { month: "January", training: 65, quizzes: 70 },
  { month: "February", training: 70, quizzes: 75 },
  { month: "March", training: 72, quizzes: 78 },
  { month: "April", training: 75, quizzes: 80 },
  { month: "May", training: 78, quizzes: 85 },
  { month: "June", training: 80, quizzes: 88 },
]

export function ProgressChart() {
  return (
    <div className="h-[300px] w-full min-w-[600px]">
      <ChartContainer
        config={{
          training: {
            label: "Training",
            color: "hsl(var(--chart-1))",
          },
          quizzes: {
            label: "Quizzes",
            color: "hsl(var(--chart-2))",
          },
        }}
        className="h-full w-full"
      >
        <BarChart
          accessibilityLayer
          data={data}
          margin={{
            left: 12,
            right: 12,
          }}
          barGap={8}
        >
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => value.slice(0, 3)}
          />
          <YAxis
            tickFormatter={(value) => `${value}%`}
            axisLine={false}
            tickLine={false}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dot" />}
          />
          <Bar dataKey="training" fill="var(--color-training)" radius={[4, 4, 0, 0]} barSize={20} />
          <Bar dataKey="quizzes" fill="var(--color-quizzes)" radius={[4, 4, 0, 0]} barSize={20} />
        </BarChart>
      </ChartContainer>
    </div>
  )
}
