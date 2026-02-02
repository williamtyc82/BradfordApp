"use client";

import { ManagerDashboard } from "@/components/dashboard/manager-dashboard";
import { WorkerDashboard } from "@/components/dashboard/worker-dashboard";
import { useAuth } from "@/hooks/use-auth";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
    const { user, loading } = useAuth();
  
    useEffect(() => {
        if (!loading && !user) {
            redirect('/');
        }
    }, [user, loading]);

    if (loading || !user) {
        return (
            <div className="flex flex-1 flex-col gap-4 md:gap-8">
                <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                    <Skeleton className="h-24" />
                    <Skeleton className="h-24" />
                    <Skeleton className="h-24" />
                    <Skeleton className="h-24" />
                </div>
                <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
                    <Skeleton className="h-80 xl:col-span-2" />
                    <Skeleton className="h-80" />
                </div>
            </div>
        )
    }

    return user.role === 'manager' ? <ManagerDashboard /> : <WorkerDashboard />;
}
