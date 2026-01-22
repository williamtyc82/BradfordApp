"use client";

import { ManagerDashboard } from "@/components/dashboard/manager-dashboard";
import { WorkerDashboard } from "@/components/dashboard/worker-dashboard";
import { useAuth } from "@/hooks/use-auth";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
    const { user } = useAuth();
  
    useEffect(() => {
        if (!user) {
            redirect('/');
        }
    }, [user]);

    if (!user) {
        return <div className="flex items-center justify-center h-full">Loading...</div>; // Or a spinner
    }

    return user.role === 'manager' ? <ManagerDashboard /> : <WorkerDashboard />;
}
