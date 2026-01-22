"use client"

import { useAuth } from "@/hooks/use-auth"
import { AnnouncementCard } from "@/components/announcements/announcement-card"
import { announcements } from "@/lib/placeholder-data"
import { CreateAnnouncementDialog } from "@/components/announcements/create-announcement-dialog"

export default function AnnouncementsPage() {
    const { user } = useAuth();
    
    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight font-headline">Announcements</h2>
                {user?.role === 'manager' && <CreateAnnouncementDialog />}
            </div>
            <p className="text-muted-foreground">
                Stay up-to-date with the latest news and updates from the company.
            </p>
            <div className="space-y-4">
                {announcements.map(announcement => (
                    <AnnouncementCard key={announcement.id} announcement={announcement} />
                ))}
            </div>
        </div>
    )
}
