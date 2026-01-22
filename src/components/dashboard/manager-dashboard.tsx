"use client";

import { Activity, ArrowUpRight, DollarSign, Users } from "lucide-react"
import { StatCard } from "./stat-card"
import { ProgressChart } from "./progress-chart"
import { RecentIncidents } from "./recent-incidents"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { placeholderUsers } from "@/lib/placeholder-data";

export function ManagerDashboard() {
    const activeWorkers = placeholderUsers.filter(u => new Date(u.lastLogin) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;

    return (
        <div className="flex flex-1 flex-col gap-4 md:gap-8">
            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
              <StatCard 
                title="Active Workers"
                value={activeWorkers.toString()}
                icon={Users}
                description="+2 since last week"
              />
              <StatCard 
                title="Training Completion"
                value="72%"
                icon={Activity}
                description="+5% since last month"
              />
              <StatCard 
                title="Incidents Reported"
                value="3"
                icon={Siren}
                description="1 new since yesterday"
              />
              <StatCard 
                title="Operational Costs"
                value="$12,345"
                icon={DollarSign}
                description="-2.1% from last month"
              />
            </div>
            <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
              <Card className="xl:col-span-2">
                <CardHeader>
                  <CardTitle>Worker Progress Overview</CardTitle>
                  <CardDescription>
                    Training and quiz completion rates for the past 6 months.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ProgressChart />
                </CardContent>
              </Card>
              <RecentIncidents />
            </div>
        </div>
    )
}
