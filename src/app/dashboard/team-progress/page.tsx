
"use client";

import { TeamProgressTable } from "@/components/team-progress/team-progress-table";
import { useAuth } from "@/hooks/use-auth";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function TeamProgressPage() {
    const { user } = useAuth();
  
    useEffect(() => {
        // Redirect if not a manager
        if (user && user.role !== 'manager') {
            redirect('/dashboard');
        }
    }, [user]);

    if (user?.role !== 'manager') {
        return <div className="flex items-center justify-center h-full">Loading...</div>; // Or a spinner/access denied
    }

    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight font-headline">Team Progress</h2>
            </div>
            <p className="text-muted-foreground">
                Monitor the training and quiz performance of your team members.
            </p>
            <TeamProgressTable />
        </div>
    );
}
