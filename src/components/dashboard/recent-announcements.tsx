import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { announcements } from "@/lib/placeholder-data"
import { Badge } from "../ui/badge";

const priorityVariantMap: { [key: string]: "default" | "secondary" | "destructive" } = {
    'Normal': 'default',
    'Important': 'secondary',
    'Urgent': 'destructive'
}

export function RecentAnnouncements() {
    const recentAnnouncements = announcements.slice(0, 3);
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Announcements</CardTitle>
                <CardDescription>
                    Latest updates and news from the management team.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                {recentAnnouncements.map(announcement => (
                    <div key={announcement.id} className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold">{announcement.title}</h3>
                            <Badge variant={priorityVariantMap[announcement.priority]}>{announcement.priority}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{announcement.content}</p>
                        <p className="text-xs text-muted-foreground mt-2">{new Date(announcement.postedAt).toLocaleDateString()}</p>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
