"use client";

import type { Incident } from "@/lib/types";
import { placeholderUsers } from "@/lib/placeholder-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Image from "next/image";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Wand2, Bot } from "lucide-react";
import { useState, useTransition } from "react";
import { summarizeIncidentAction } from "@/app/actions/summarize";
import { Skeleton } from "../ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useAuth } from "@/hooks/use-auth";

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

export function IncidentDetails({ incident: initialIncident }: { incident: Incident }) {
    const { user } = useAuth();
    const reporter = placeholderUsers.find(u => u.id === initialIncident.reportedBy);
    const [isPending, startTransition] = useTransition();
    const [summary, setSummary] = useState<string | null>(null);
    const [incident, setIncident] = useState(initialIncident);

    const handleSummarize = () => {
        startTransition(async () => {
            const result = await summarizeIncidentAction(incident.description);
            if (result.summary) {
                setSummary(result.summary);
            }
        });
    }

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
                        {summary && (
                             <Card className="bg-muted/50">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Bot className="h-5 w-5 text-primary" />
                                        AI Generated Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm">{summary}</p>
                                </CardContent>
                            </Card>
                        )}
                        {isPending && <Skeleton className="h-24 w-full" />}
                        {incident.mediaURLs.length > 0 && (
                            <div>
                                <h3 className="font-semibold mb-2">Attached Media</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {incident.mediaURLs.map((url, index) => (
                                        <Image key={index} src={url} alt={`Incident media ${index+1}`} width={300} height={200} className="rounded-lg object-cover" />
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Manager Comments</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {incident.managerComments.map((comment, i) => {
                            const commenter = placeholderUsers.find(u => u.id === comment.userId);
                            return (
                                <div key={i} className="flex gap-3">
                                    <Avatar>
                                        <AvatarImage src={commenter?.photoURL} />
                                        <AvatarFallback>{commenter?.displayName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{commenter?.displayName} <span className="text-xs text-muted-foreground font-normal">{new Date(comment.createdAt).toLocaleDateString()}</span></p>
                                        <p className="text-sm">{comment.comment}</p>
                                    </div>
                                </div>
                            )
                        })}
                         <div className="flex gap-3">
                            <Avatar>
                                <AvatarImage src={user?.photoURL} />
                                <AvatarFallback>{user?.displayName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-2">
                               <Textarea placeholder="Add a comment..." />
                               <Button size="sm">Add Comment</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Severity</span>
                            <div className="flex items-center gap-2 font-semibold">
                                <span className={`h-2 w-2 rounded-full ${severityColorMap[incident.severity]}`}></span>
                                {incident.severity}
                            </div>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Category</span>
                            <span className="font-semibold">{incident.category}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-muted-foreground">Location</span>
                            <span className="font-semibold text-right">{incident.location}</span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                     <CardHeader>
                        <CardTitle>Reporter</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-3">
                        <Avatar>
                           <AvatarImage src={reporter?.photoURL} />
                           <AvatarFallback>{reporter?.displayName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">{reporter?.displayName}</p>
                            <p className="text-sm text-muted-foreground">{reporter?.email}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button className="w-full gap-2" onClick={handleSummarize} disabled={isPending}>
                            <Wand2 className="h-4 w-4" />
                            {isPending ? "Generating..." : "AI Generate Summary"}
                        </Button>
                         <div className="space-y-1">
                            <Label>Update Status</Label>
                            <Select value={incident.status} onValueChange={(val: "Pending" | "In Progress" | "Resolved") => setIncident({...incident, status: val })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Change status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                    <SelectItem value="Resolved">Resolved</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
