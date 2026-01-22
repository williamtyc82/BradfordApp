"use client";

import { Button } from "@/components/ui/button";
import { TrainingCard } from "@/components/training/training-card";
import { trainingMaterials } from "@/lib/placeholder-data";
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

export default function TrainingPage() {
    const { user } = useAuth();
    
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
                {user?.role === 'manager' && <UploadMaterialDialog />}
                </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {trainingMaterials.map(material => (
                    <TrainingCard key={material.id} material={material} />
                ))}
            </div>
        </div>
    )
}
