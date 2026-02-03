"use client";

import { IncidentDetails } from "@/components/incidents/incident-details";
import { notFound, useParams } from "next/navigation";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import Link from "next/link";
import { useFirebase, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { Incident } from "@/lib/types";
import { Loader2 } from "lucide-react";

export default function IncidentDetailPage() {
    const params = useParams();
    const id = params?.id as string;
    const { firestore } = useFirebase();

    const incidentDocRef = useMemoFirebase(() => {
        return id && firestore ? doc(firestore, "incidents", id) : null;
    }, [id, firestore]);

    const { data: incident, isLoading } = useDoc<Incident>(incidentDocRef);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse text-lg">Loading incident details...</p>
            </div>
        );
    }

    if (!incident) {
        notFound();
    }

    return (
        <div className="flex-1 space-y-4">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/dashboard">Dashboard</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/dashboard/incidents">Incidents</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Incident Details</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <IncidentDetails incident={incident} />
        </div>
    );
}