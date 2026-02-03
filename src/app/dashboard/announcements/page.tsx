"use client"

import { useAuth } from "@/hooks/use-auth"
import { AnnouncementCard } from "@/components/announcements/announcement-card"
import { AnnouncementDialog } from "@/components/announcements/announcement-dialog"
import { useFirebase, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy } from "firebase/firestore"
import { Announcement } from "@/lib/types"
import { Loader2 } from "lucide-react"

export default function AnnouncementsPage() {
    const { user } = useAuth();
    const { firestore } = useFirebase();

    const announcementsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, "announcements"), orderBy("postedAt", "desc"));
    }, [firestore]);

    const { data: announcements, isLoading } = useCollection<Announcement>(announcementsQuery);

    return (
        <div className="flex-1 space-y-4 min-w-0">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-3xl font-bold tracking-tight font-headline">Announcements</h2>
                {user?.role === 'manager' && <AnnouncementDialog />}
            </div>
            <p className="text-muted-foreground">
                Stay up-to-date with the latest news and updates from the company.
            </p>

            {isLoading ? (
                <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="space-y-4">
                    {announcements && announcements.length > 0 ? (
                        announcements.map(announcement => (
                            <AnnouncementCard key={announcement.id} announcement={announcement} />
                        ))
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            No announcements found.
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
