
"use client";

import { Activity, AlertTriangle, ArrowUpRight, DollarSign, Users, BookOpen, ClipboardList } from "lucide-react"
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

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useFirebase } from "@/firebase";
import { useEffect, useState } from "react";
import { collection, query, where, getCountFromServer } from "firebase/firestore";

export function ManagerDashboard() {
  const { firestore } = useFirebase();
  const [stats, setStats] = useState({
    users: 0,
    pendingIncidents: 0,
    resolvedIncidents: 0,
    totalQuizzes: 0
  });

  useEffect(() => {
    if (!firestore) return;

    const fetchStats = async () => {
      try {
        const usersSnap = await getCountFromServer(collection(firestore, "users"));

        const incidentsColl = collection(firestore, "incidents");
        const pendingSnap = await getCountFromServer(query(incidentsColl, where("status", "==", "Pending")));
        const resolvedSnap = await getCountFromServer(query(incidentsColl, where("status", "==", "Resolved")));

        const quizzesSnap = await getCountFromServer(collection(firestore, "quizzes"));

        setStats({
          users: usersSnap.data().count,
          pendingIncidents: pendingSnap.data().count,
          resolvedIncidents: resolvedSnap.data().count,
          totalQuizzes: quizzesSnap.data().count
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };

    fetchStats();
  }, [firestore]);

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-8 min-w-0">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats.users.toString()}
          icon={Users}
          description="Registered active users"
        />
        <StatCard
          title="Pending Incidents"
          value={stats.pendingIncidents.toString()}
          icon={AlertTriangle}
          description="Requires attention"
        />
        <StatCard
          title="Resolved Incidents"
          value={stats.resolvedIncidents.toString()}
          icon={Activity}
          description="Successfully closed"
        />
        <StatCard
          title="Active Quizzes"
          value={stats.totalQuizzes.toString()}
          icon={ClipboardList}
          description="Available for training"
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
        <Card>
          <CardHeader>
            <CardTitle>Manager Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button asChild className="w-full justify-start py-6 text-base" size="lg">
              <Link href="/dashboard/training?upload=true">
                <BookOpen className="mr-3 h-5 w-5" />
                Upload New Training Material
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start py-6 text-base" size="lg">
              <Link href="/dashboard/quizzes">
                <ClipboardList className="mr-3 h-5 w-5" />
                Create New Quiz
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
