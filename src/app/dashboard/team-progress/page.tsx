
"use client";

import { TeamProgressTable } from "@/components/team-progress/team-progress-table";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function TeamProgressPage() {
    const { user } = useAuth();
    const router = useRouter();
  
    useEffect(() => {
        // The layout handles loading and the case where user is null.
        // We only need to check for the manager role here.
        if (user && user.role !== 'manager') {
            router.push('/dashboard');
        }
    }, [user, router]);

    // The layout shows a loading spinner, so we can assume user is loaded here.
    // This provides a fallback UI if the redirect hasn't happened yet.
    if (user?.role !== 'manager') {
        return <div className="flex items-center justify-center h-full">Redirecting...</div>; 
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
