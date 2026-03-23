"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import {
  ChartTooltipContent,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart"
import { useFirebase, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query } from "firebase/firestore"
import { useMemo } from "react"

export function ProgressChart() {
  const { firestore } = useFirebase();
  
  const trainingLogsRef = useMemoFirebase(() => 
    firestore ? query(collection(firestore, "trainingLogs")) : null, 
    [firestore]
  );
  const { data: trainingLogs } = useCollection<{ viewedAt: string }>(trainingLogsRef);

  const quizResultsRef = useMemoFirebase(() => 
    firestore ? query(collection(firestore, "quizResults")) : null, 
    [firestore]
  );
  const { data: quizResults } = useCollection<{ completedAt: string, score: number }>(quizResultsRef);

  const chartData = useMemo(() => {
    const months: { 
      label: string; 
      year: number; 
      monthNum: number; 
      training: number; 
      quizzesTotal: number; 
      quizzesCount: number; 
      quizzes: number 
    }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push({
        label: d.toLocaleString('default', { month: 'short' }),
        year: d.getFullYear(),
        monthNum: d.getMonth(),
        training: 0,
        quizzesTotal: 0,
        quizzesCount: 0,
        quizzes: 0 // Will store avg score
      });
    }

    if (trainingLogs) {
      trainingLogs.forEach(log => {
        if (!log.viewedAt) return;
        const d = new Date(log.viewedAt);
        const m = months.find(m => m.year === d.getFullYear() && m.monthNum === d.getMonth());
        if (m) m.training += 1; // Count raw training material views
      });
    }

    if (quizResults) {
      quizResults.forEach(res => {
        if (!res.completedAt) return;
        const d = new Date(res.completedAt);
        const m = months.find(m => m.year === d.getFullYear() && m.monthNum === d.getMonth());
        if (m) {
          m.quizzesTotal += res.score;
          m.quizzesCount += 1;
        }
      });
      months.forEach(m => {
        if (m.quizzesCount > 0) {
          m.quizzes = Math.round(m.quizzesTotal / m.quizzesCount);
        }
      });
    }

    return months.map(m => ({
      month: m.label,
      training: m.training,
      quizzes: m.quizzes
    }));
  }, [trainingLogs, quizResults]);

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
          data={chartData}
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
