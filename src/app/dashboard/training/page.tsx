"use client";

import { Button } from "@/components/ui/button";
import { TrainingCard } from "@/components/training/training-card";
import { ListFilter } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import type { TrainingMaterial } from "@/lib/types";
import { collection, query, orderBy, where } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { UploadMaterialDialog } from "@/components/training/upload-material-dialog";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CATEGORIES = ["All", "Safety", "Operations", "Emergency", "Other"];
// ... imports

export default function TrainingPage() {
    const { user: appUser } = useAuth();
    const { firestore, user: firebaseUser, isUserLoading: authIsLoading } = useFirebase();

    const trainingCollectionRef = useMemoFirebase(() => {
        if (!firestore || !firebaseUser) return null;
        return query(collection(firestore, "trainingMaterials"), orderBy("uploadedAt", "desc"));
    }, [firestore, firebaseUser]);

    const { data: materials, isLoading: materialsIsLoading } = useCollection<TrainingMaterial>(trainingCollectionRef);

    // Fetch user's assignments
    const assignmentsRef = useMemoFirebase(() => {
        if (!firestore || !firebaseUser) return null;
        return query(
            collection(firestore, "trainingAssignments"),
            where("userId", "==", firebaseUser.uid)
        );
    }, [firestore, firebaseUser]);
    const { data: assignments } = useCollection<{ materialId: string, status: string }>(assignmentsRef);

    const searchParams = useSearchParams();
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState("All");

    useEffect(() => {
        if (searchParams.get('upload') === 'true') {
            setIsUploadOpen(true);
        }
    }, [searchParams]);

    const isLoading = authIsLoading || materialsIsLoading;

    // Filter assigned materials
    const assignedMaterials = materials?.filter(m =>
        assignments?.some(a => a.materialId === m.id && a.status !== 'completed')
    ) || [];

    const filteredMaterials = (materials || []).filter(m =>
        activeCategory === "All" || m.category === activeCategory
    );

    const getCount = (cat: string) => {
        if (!materials) return 0;
        if (cat === "All") return materials.length;
        return materials.filter(m => m.category === cat).length;
    };

    return (
        <div className="flex-1 space-y-6 min-w-0 w-full overflow-x-hidden">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight font-headline">Training Materials</h2>
                    <p className="text-muted-foreground text-sm">Access and manage resources to help with your daily operations.</p>
                </div>
                {appUser?.role === 'manager' && (
                    <div className="flex items-center gap-2">
                        <UploadMaterialDialog
                            openOverride={isUploadOpen}
                            onOpenChangeOverride={setIsUploadOpen}
                        />
                    </div>
                )}
            </div>

            {/* Assigned Training Section */}
            {assignedMaterials.length > 0 && (
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                    <h3 className="font-semibold leading-none tracking-tight mb-4 flex items-center gap-2 text-blue-700 dark:text-blue-400">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                        </span>
                        Assigned to You
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {assignedMaterials.map(material => (
                            <div key={material.id} className="relative">
                                {/* We can wrap or overlay a badge */}
                                <div className="absolute top-2 right-2 z-10 bg-blue-600 text-white text-xs px-2 py-1 rounded-full shadow-md">
                                    Required
                                </div>
                                <TrainingCard material={material} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {/* Mobile View: Dropdown */}
                <div className="md:hidden">
                    <Select value={activeCategory} onValueChange={setActiveCategory}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                            {CATEGORIES.map(cat => (
                                <SelectItem key={cat} value={cat}>
                                    {cat} ({getCount(cat)})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-4">
                        {isLoading && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-96" />)}
                        {!isLoading && filteredMaterials.length === 0 && (
                            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg bg-muted/20">
                                <ListFilter className="h-10 w-10 text-muted-foreground/30 mb-4" />
                                <h3 className="text-lg font-medium">No materials found</h3>
                                <p className="text-sm text-muted-foreground">There are no resources in the "{activeCategory}" category yet.</p>
                            </div>
                        )}
                        {filteredMaterials.map(material => (
                            <TrainingCard key={material.id} material={material} />
                        ))}
                    </div>
                </div>

                {/* Desktop View: Tabs */}
                <div className="hidden md:block">
                    <Tabs defaultValue="All" value={activeCategory} className="w-full" onValueChange={setActiveCategory}>
                        <div className="flex items-center justify-between overflow-x-auto pb-2 scrollbar-none">
                            <TabsList className="h-10 p-1 bg-muted/50">
                                {CATEGORIES.map(cat => (
                                    <TabsTrigger
                                        key={cat}
                                        value={cat}
                                        className="px-4 py-2 text-xs font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm"
                                    >
                                        {cat}
                                        <span className="ml-2 rounded-full bg-muted-foreground/10 px-1.5 py-0.5 text-[10px] text-muted-foreground group-data-[state=active]:bg-primary/10 group-data-[state=active]:text-primary transition-colors">
                                            {getCount(cat)}
                                        </span>
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-4">
                            {isLoading && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-96" />)}
                            {!isLoading && filteredMaterials.length === 0 && (
                                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg bg-muted/20">
                                    <ListFilter className="h-10 w-10 text-muted-foreground/30 mb-4" />
                                    <h3 className="text-lg font-medium">No materials found</h3>
                                    <p className="text-sm text-muted-foreground">There are no resources in the "{activeCategory}" category yet.</p>
                                </div>
                            )}
                            {filteredMaterials.map(material => (
                                <TrainingCard key={material.id} material={material} />
                            ))}
                        </div>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
