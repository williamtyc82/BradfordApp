import type { Announcement, User } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { useFirebase, useDoc, useMemoFirebase } from "@/firebase";
import { doc, deleteDoc } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { AnnouncementDialog } from "./announcement-dialog";
import { useToast } from "@/hooks/use-toast";

const priorityVariantMap: { [key: string]: "default" | "secondary" | "destructive" } = {
    'Normal': 'default',
    'Important': 'secondary',
    'Urgent': 'destructive'
}

export function AnnouncementCard({ announcement }: { announcement: Announcement }) {
    const { firestore } = useFirebase();
    const { user } = useAuth();
    const { toast } = useToast();
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    const userRef = useMemoFirebase(() => firestore ? doc(firestore, "users", announcement.postedBy) : null, [firestore, announcement.postedBy]);
    const { data: author, isLoading } = useDoc<User>(userRef);

    const handleDelete = async () => {
        if (!firestore) return;

        if (!confirm("Are you sure you want to delete this announcement?")) return;

        try {
            await deleteDoc(doc(firestore, "announcements", announcement.id));
            toast({
                title: "Announcement deleted",
                description: "The announcement has been permanently removed."
            });
        } catch (error) {
            console.error("Error deleting announcement:", error);
            toast({
                title: "Error",
                description: "Failed to delete announcement.",
                variant: "destructive"
            });
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <CardTitle>{announcement.title}</CardTitle>
                            <Badge variant={priorityVariantMap[announcement.priority] || 'default'}>{announcement.priority}</Badge>
                        </div>

                        {user?.role === 'manager' && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">Open menu</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                    <CardDescription>
                        Posted by {isLoading ? "..." : (author?.displayName || 'Unknown User')} on {new Date(announcement.postedAt).toLocaleDateString()}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-card-foreground whitespace-pre-wrap">{announcement.content}</p>
                </CardContent>
            </Card>

            <AnnouncementDialog
                announcement={announcement}
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
            />
        </>
    )
}
