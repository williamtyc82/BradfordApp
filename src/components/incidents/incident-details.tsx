"use client";

import type { Incident } from "@/lib/types";
import { placeholderUsers } from "@/lib/placeholder-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Image from "next/image";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "../ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useFirebase, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { doc, updateDoc, arrayUnion, query, collection, where } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Label } from "../ui/label";

const statusVariantMap: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
    'Resolved': 'default',
    'In Progress': 'secondary',
    'Pending': 'destructive'
};

const severityColorMap: { [key: string]: string } = {
    'Low': 'bg-green-500',
    'Medium': 'bg-yellow-500',
    'High': 'bg-red-500'
};

const UserInfo = ({ userId, showEmail = false }: { userId: string, showEmail?: boolean }) => {
    const { firestore } = useFirebase();
    // Use doc() + useDoc() for direct access (allowed by security rules "get")
    // instead of query() + useCollection() (which counts as "list" and is restricted)
    const userRef = useMemoFirebase(() => firestore ? doc(firestore, "users", userId) : null, [firestore, userId]);
    // Assume User type or any
    const { data: user, isLoading } = useDoc<any>(userRef);

    if (isLoading) return <Skeleton className="h-10 w-32" />;

    return (
        <div className="flex items-center gap-3">
            <Avatar>
                <AvatarImage src={user?.photoURL} />
                <AvatarFallback>{(user?.displayName || userId).charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
                <p className="font-semibold">{user?.displayName || userId}</p>
                {showEmail && user?.email && <p className="text-sm text-muted-foreground">{user?.email}</p>}
            </div>
        </div>
    );
}

export function IncidentDetails({ incident }: { incident: Incident }) {
    const { user } = useAuth();
    const { firestore } = useFirebase();
    const { toast } = useToast();
    const [comment, setComment] = useState("");
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);



    const handleAddComment = async () => {
        if (!comment.trim() || !firestore || !user) return;
        setIsSubmittingComment(true);
        try {
            const incidentRef = doc(firestore, "incidents", incident.id);
            await updateDoc(incidentRef, {
                managerComments: arrayUnion({
                    userId: user.id,
                    comment: comment.trim(),
                    createdAt: new Date().toISOString()
                })
            });
            setComment("");
            toast({ title: "Comment Added", description: "Your comment has been saved." });
        } catch (error) {
            toast({ title: "Failed to Add Comment", description: "Something went wrong.", variant: "destructive" });
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleStatusChange = async (newStatus: Incident['status']) => {
        if (!firestore) return;
        setIsUpdatingStatus(true);
        try {
            const incidentRef = doc(firestore, "incidents", incident.id);
            await updateDoc(incidentRef, {
                status: newStatus,
                updatedAt: new Date().toISOString(),
                ...(newStatus === 'Resolved' ? { resolvedAt: new Date().toISOString() } : {})
            });
            toast({ title: "Status Updated", description: `Incident is now ${newStatus}.` });
        } catch (error) {
            toast({ title: "Failed to Update Status", description: "Something went wrong.", variant: "destructive" });
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    return (
        <div className="grid gap-4 md:grid-cols-3 md:gap-8">
            <div className="md:col-span-2 space-y-4">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="font-headline text-2xl">{incident.title}</CardTitle>
                                <CardDescription>Reported on {new Date(incident.reportedAt).toLocaleString()}</CardDescription>
                            </div>
                            <Badge variant={statusVariantMap[incident.status] || 'outline'}>{incident.status}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="prose dark:prose-invert max-w-none text-card-foreground">
                            <p>{incident.description}</p>
                        </div>

                        {incident.mediaURLs && incident.mediaURLs.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="font-semibold text-lg">Attached Media</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {incident.mediaURLs.map((url: string, index: number) => (
                                        <div key={index} className="relative group cursor-zoom-in">
                                            <Image
                                                src={url}
                                                alt={`Incident media ${index + 1}`}
                                                width={300}
                                                height={200}
                                                className="rounded-xl object-cover aspect-video border shadow-sm transition-transform group-hover:scale-[1.02]"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Manager Timeline & Comments</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            {incident.managerComments && incident.managerComments.length > 0 ? (
                                incident.managerComments.map((comment: any, i: number) => (
                                    <div key={i} className="flex gap-4 p-4 rounded-lg bg-muted/30">
                                        <UserInfo userId={comment.userId} />
                                        <div className="flex-1">
                                            <p className="text-sm text-muted-foreground mb-1">{new Date(comment.createdAt).toLocaleString()}</p>
                                            <p className="text-sm">{comment.comment}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center py-4 text-muted-foreground text-sm italic">No comments yet.</p>
                            )}
                        </div>

                        {user?.role === 'manager' && (
                            <div className="flex gap-3 pt-4 border-t">
                                <Avatar>
                                    <AvatarImage src={user?.photoURL || undefined} />
                                    <AvatarFallback>{user?.displayName?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-2">
                                    <Textarea
                                        placeholder="Add a management note or status update comment..."
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        className="min-h-[100px]"
                                    />
                                    <div className="flex justify-end">
                                        <Button
                                            size="sm"
                                            onClick={handleAddComment}
                                            disabled={isSubmittingComment || !comment.trim()}
                                        >
                                            {isSubmittingComment && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Add Comment
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Metadata</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Severity</span>
                            <Badge className={`${severityColorMap[incident.severity] || 'bg-gray-500'} text-white border-0`}>
                                {incident.severity}
                            </Badge>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Category</span>
                            <span className="font-semibold">{incident.category}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Location</span>
                            <span className="font-semibold text-right max-w-[150px] truncate" title={incident.location}>{incident.location}</span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Reporter Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <UserInfo userId={incident.reportedBy} showEmail />
                    </CardContent>
                </Card>
                {user?.role === 'manager' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">


                            <div className="space-y-2 pt-2 border-t">
                                <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider">Update Status</Label>
                                <Select
                                    value={incident.status}
                                    onValueChange={(val: Incident['status']) => handleStatusChange(val)}
                                    disabled={isUpdatingStatus}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Change status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Pending">Pending</SelectItem>
                                        <SelectItem value="In Progress">In Progress</SelectItem>
                                        <SelectItem value="Resolved">Resolved</SelectItem>
                                    </SelectContent>
                                </Select>
                                {isUpdatingStatus && <div className="flex items-center justify-center pt-1"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
