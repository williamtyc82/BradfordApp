"use client"
import React from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Textarea } from "../ui/textarea"
import { PlusCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useFirebase } from "@/firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Loader2 } from "lucide-react";

const incidentSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    category: z.enum(["Safety", "Equipment", "Logistics", "Other"]),
    severity: z.enum(["Low", "Medium", "High"]),
    location: z.string().min(2, "Location is required"),
    description: z.string().min(10, "Description must be at least 10 characters"),
});

type IncidentValues = z.infer<typeof incidentSchema>;

export function ReportIncidentDialog({ triggerButton }: { triggerButton?: React.ReactNode }) {
    const { user } = useAuth()
    const [open, setOpen] = React.useState(false);

    const defaultTrigger = (
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Report New Incident
        </Button>
    )

    if (user?.role !== 'worker' && !triggerButton) return null
    if (user?.role === 'manager' && triggerButton) {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Incident
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xl w-[90vw] max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create New Incident Report</DialogTitle>
                        <DialogDescription>
                            Manually create an incident report.
                        </DialogDescription>
                    </DialogHeader>
                    <IncidentForm onSuccess={() => setOpen(false)} />
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {triggerButton || defaultTrigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl w-[90vw] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Report New Incident</DialogTitle>
                    <DialogDescription>
                        Fill out the form below to report a new incident. Provide as much detail as possible.
                    </DialogDescription>
                </DialogHeader>
                <IncidentForm onSuccess={() => setOpen(false)} />
            </DialogContent>
        </Dialog>
    )
}

function IncidentForm({ onSuccess }: { onSuccess: () => void }) {
    const { user } = useAuth();
    const { firestore, storage } = useFirebase();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [files, setFiles] = React.useState<FileList | null>(null);

    const form = useForm<IncidentValues>({
        resolver: zodResolver(incidentSchema),
        defaultValues: {
            title: "",
            location: "",
            description: "",
        }
    });

    const onSubmit = async (data: IncidentValues) => {
        if (!user || !firestore || !storage) return;
        setIsSubmitting(true);

        try {
            const mediaURLs: string[] = [];
            if (files && files.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const storageRef = ref(storage, `incidents/${user.id}/${Date.now()}-${file.name}`);
                    const uploadResult = await uploadBytes(storageRef, file);
                    const url = await getDownloadURL(uploadResult.ref);
                    mediaURLs.push(url);
                }
            }

            await addDoc(collection(firestore, "incidents"), {
                ...data,
                reportedBy: user.id,
                reportedAt: new Date().toISOString(),
                status: "Pending",
                mediaURLs: mediaURLs,
                managerComments: [],
            });

            toast({
                title: "Report Submitted",
                description: "The incident has been successfully reported.",
            });
            onSuccess();
        } catch (error) {
            console.error("Error submitting incident:", error);
            toast({
                title: "Submission Failed",
                description: "There was an error reporting the incident.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-4 py-4 pr-2">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem className="grid grid-cols-4 items-center gap-4 space-y-0">
                                <FormLabel className="text-right">Title</FormLabel>
                                <FormControl className="col-span-3">
                                    <Input placeholder="e.g. Forklift malfunction" {...field} />
                                </FormControl>
                                <FormMessage className="col-start-2 col-span-3" />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem className="grid grid-cols-4 items-center gap-4 space-y-0">
                                <FormLabel className="text-right">Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl className="col-span-3">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Safety">Safety</SelectItem>
                                        <SelectItem value="Equipment">Equipment</SelectItem>
                                        <SelectItem value="Logistics">Logistics</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage className="col-start-2 col-span-3" />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="severity"
                        render={({ field }) => (
                            <FormItem className="grid grid-cols-4 items-center gap-4 space-y-0">
                                <FormLabel className="text-right">Severity</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl className="col-span-3">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select severity level" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Low">Low</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="High">High</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage className="col-start-2 col-span-3" />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                            <FormItem className="grid grid-cols-4 items-center gap-4 space-y-0">
                                <FormLabel className="text-right">Location</FormLabel>
                                <FormControl className="col-span-3">
                                    <Input placeholder="e.g. Warehouse B, Aisle 3" {...field} />
                                </FormControl>
                                <FormMessage className="col-start-2 col-span-3" />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem className="grid grid-cols-4 items-start gap-4 space-y-0">
                                <FormLabel className="text-right pt-2">Description</FormLabel>
                                <FormControl className="col-span-3">
                                    <Textarea placeholder="Describe the incident..." {...field} />
                                </FormControl>
                                <FormMessage className="col-start-2 col-span-3" />
                            </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Media</Label>
                        <Input
                            type="file"
                            multiple
                            onChange={(e) => setFiles(e.target.files)}
                            className="col-span-3"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Report
                    </Button>
                </DialogFooter>
            </form>
        </Form>
    )
}
