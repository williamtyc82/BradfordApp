import {
    ArrowUpRight,
  } from "lucide-react"
  import Link from "next/link"
  
  import { Badge } from "@/components/ui/badge"
  import { Button } from "@/components/ui/button"
  import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { incidents, placeholderUsers } from "@/lib/placeholder-data"

const statusVariantMap: { [key: string]: "default" | "secondary" | "destructive" } = {
    'Resolved': 'default',
    'In Progress': 'secondary',
    'Pending': 'destructive'
}
  
export function RecentIncidents() {
    const recentIncidents = incidents.slice(0, 5);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center">
                <div className="grid gap-2">
                    <CardTitle>Recent Incidents</CardTitle>
                    <CardDescription>
                    A list of the most recently reported incidents.
                    </CardDescription>
                </div>
                <Button asChild size="sm" className="ml-auto gap-1">
                    <Link href="/dashboard/incidents">
                    View All
                    <ArrowUpRight className="h-4 w-4" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent className="grid gap-4">
               {recentIncidents.map(incident => {
                    const user = placeholderUsers.find(u => u.id === incident.reportedBy);
                    return (
                        <div key={incident.id} className="flex items-center gap-4">
                            <div className="grid gap-1">
                                <p className="text-sm font-medium leading-none">
                                    {incident.title}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Reported by {user?.displayName || 'Unknown'}
                                </p>
                            </div>
                            <div className="ml-auto font-medium">
                                <Badge variant={statusVariantMap[incident.status]}>{incident.status}</Badge>
                            </div>
                        </div>
                    )
               })}
            </CardContent>
        </Card>
    )
}