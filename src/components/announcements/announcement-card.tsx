import type { Announcement } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { placeholderUsers } from "@/lib/placeholder-data";

const priorityVariantMap: { [key: string]: "default" | "secondary" | "destructive" } = {
    'Normal': 'default',
    'Important': 'secondary',
    'Urgent': 'destructive'
}

export function AnnouncementCard({ announcement }: { announcement: Announcement }) {
    const author = placeholderUsers.find(u => u.id === announcement.postedBy);
    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle>{announcement.title}</CardTitle>
                    <Badge variant={priorityVariantMap[announcement.priority]}>{announcement.priority}</Badge>
                </div>
                <CardDescription>
                    Posted by {author?.displayName || 'Admin'} on {new Date(announcement.postedAt).toLocaleDateString()}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-card-foreground">{announcement.content}</p>
            </CardContent>
        </Card>
    )
}
