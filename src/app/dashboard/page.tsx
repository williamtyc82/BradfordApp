"use client";

import { ManagerDashboard } from "@/components/dashboard/manager-dashboard";
import { WorkerDashboard } from "@/components/dashboard/worker-dashboard";
import { useAuth } from "@/hooks/use-auth";

export default function DashboardPage() {
    const { user } = useAuth();

    // The layout component now handles loading and auth checks.
    if (!user) {
        // This should not happen due to the layout guard, but it's a good fallback.
        return null;
    }

    return user.role === 'manager' ? <ManagerDashboard /> : <WorkerDashboard />;
}
