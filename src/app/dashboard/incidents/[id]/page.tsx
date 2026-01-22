import { IncidentDetails } from "@/components/incidents/incident-details";
import { incidents } from "@/lib/placeholder-data";
import { notFound } from "next/navigation";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
  } from "@/components/ui/breadcrumb"
import Link from "next/link";
  

type IncidentDetailPageProps = {
    params: {
        id: string;
    }
}

export default function IncidentDetailPage({ params }: IncidentDetailPageProps) {
    const incident = incidents.find(i => i.id === params.id);

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
                    <BreadcrumbPage>Incident #{incident.id}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <IncidentDetails incident={incident} />
        </div>
    );
}