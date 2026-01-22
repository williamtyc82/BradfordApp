"use client"

import { useAuth } from "@/hooks/use-auth"
import { IncidentsTable } from "@/components/incidents/incidents-table"
import { ReportIncidentDialog } from "@/components/incidents/report-incident-dialog"

export default function IncidentsPage() {
    const { user } = useAuth()
    
    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight font-headline">Incident Reports</h2>
                <div className="flex items-center space-x-2">
                    {user?.role === 'worker' ? (
                       <ReportIncidentDialog />
                    ) : (
                        <ReportIncidentDialog triggerButton={null} />
                    )}
                </div>
            </div>
            <p className="text-muted-foreground">
                {user?.role === 'manager' 
                    ? "Review, manage, and resolve reported incidents."
                    : "Report new incidents and view the status of your past reports."}
            </p>
            
            <IncidentsTable />

        </div>
    )
}
