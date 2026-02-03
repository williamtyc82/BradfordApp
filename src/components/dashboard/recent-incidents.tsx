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
import { useFirebase } from "@/firebase";
import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, onSnapshot, getDoc, doc } from "firebase/firestore";

const statusVariantMap: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
    'Resolved': 'default',
    'In Progress': 'secondary',
    'Pending': 'destructive'
}

export function RecentIncidents() {
    const { firestore } = useFirebase();
    const [recentIncidents, setRecentIncidents] = useState<any[]>([]);

    useEffect(() => {
        if (!firestore) return;
        const q = query(
            collection(firestore, "incidents"),
            orderBy("reportedAt", "desc"),
            limit(5)
        );

        // Use onSnapshot for realtime updates or getDocs for static
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const incidents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setRecentIncidents(incidents);
        });
        return () => unsubscribe();
    }, [firestore]);

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
                {recentIncidents.length > 0 ? recentIncidents.map(incident => (
                    <IncidentItem key={incident.id} incident={incident} />
                )) : (
                    <p className="text-sm text-muted-foreground">No incidents reported recently.</p>
                )}
            </CardContent>
        </Card>
    )
}

function IncidentItem({ incident }: { incident: any }) {
    const { firestore } = useFirebase();
    const [userName, setUserName] = useState(incident.reportedBy);

    useEffect(() => {
        if (!firestore || !incident.reportedBy) return;
        getDoc(doc(firestore, "users", incident.reportedBy)).then(snap => {
            if (snap.exists()) {
                setUserName(snap.data().displayName || snap.data().email || incident.reportedBy);
            }
        });
    }, [firestore, incident.reportedBy]);

    return (
        <div className="flex items-center gap-4">
            <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">
                    {incident.title}
                </p>
                <p className="text-sm text-muted-foreground">
                    Reported by {userName}
                </p>
            </div>
            <div className="ml-auto font-medium">
                <Badge variant={statusVariantMap[incident.status] || 'outline'}>{incident.status}</Badge>
            </div>
        </div>
    )
}