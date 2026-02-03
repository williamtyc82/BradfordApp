import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "../ui/badge";
import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import type { Announcement } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

const priorityVariantMap: { [key: string]: "default" | "secondary" | "destructive" } = {
    'Normal': 'default',
    'Important': 'secondary',
    'Urgent': 'destructive'
}

export function RecentAnnouncements() {
    const { firestore } = useFirebase();

    const announcementsRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, "announcements"), orderBy("postedAt", "desc"), limit(3));
    }, [firestore]);

    const { data: recentAnnouncements, isLoading } = useCollection<Announcement>(announcementsRef);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Announcements</CardTitle>
                <CardDescription>
                    Latest updates and news from the management team.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                {isLoading && (
                    <>
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </>
                )}
                {!isLoading && recentAnnouncements?.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No announcements yet.</p>
                )}
                {recentAnnouncements?.map(announcement => (
                    <div key={announcement.id} className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold">{announcement.title}</h3>
                            <Badge variant={priorityVariantMap[announcement.priority] || 'default'}>{announcement.priority}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{announcement.content}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                            {announcement.postedAt ? new Date(announcement.postedAt).toLocaleDateString() : 'Just now'}
                        </p>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
