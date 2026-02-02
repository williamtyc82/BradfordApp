"use client";

import { Button } from "@/components/ui/button";
import { TrainingCard } from "@/components/training/training-card";
import { Upload, ListFilter } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { UploadMaterialDialog } from "@/components/training/upload-material-dialog";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import type { TrainingMaterial } from "@/lib/types";
import { collection, query, orderBy } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

export default function TrainingPage() {
    const { user: appUser } = useAuth();
    const { firestore, user: firebaseUser, isUserLoading: authIsLoading } = useFirebase();

    const trainingCollectionRef = useMemoFirebase(() => {
        if (!firestore || !firebaseUser) return null;
        return query(collection(firestore, "trainingMaterials"), orderBy("uploadedAt", "desc"));
    }, [firestore, firebaseUser]);
    
    const { data: materials, isLoading: materialsIsLoading } = useCollection<TrainingMaterial>(trainingCollectionRef);
    
    const isLoading = authIsLoading || materialsIsLoading;

    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight font-headline">Training Materials</h2>
                <div className="flex items-center space-x-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                        <ListFilter className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Filter
                        </span>
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by category</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem checked>
                        Safety
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>Operations</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>Emergency</DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                {appUser?.role === 'manager' && <UploadMaterialDialog />}
                </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {isLoading && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-96" />)}
                {materials?.map(material => (
                    <TrainingCard key={material.id} material={material} />
                ))}
                 {!isLoading && materials?.length === 0 && (
                    <div className="col-span-full text-center text-muted-foreground py-12">
                        No training materials have been uploaded yet.
                    </div>
                )}
            </div>
        </div>
    )
}
