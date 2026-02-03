
"use client";

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Textarea } from "../ui/textarea"
import { Upload, Plus, Trash2, X } from "lucide-react"
import { useAuth } from "@/hooks/use-auth";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { useFirebase } from "@/firebase";
import { addDoc, collection } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

const videoUrlSchema = z.object({
    url: z.string().url("A valid URL is required.")
});

const formSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    category: z.string({ required_error: "Please select a category." }),
    primaryVideoURL: z.string().optional(),
    videoURLs: z.array(videoUrlSchema).default([]),
    documentFiles: z.any().optional(),
    imageFiles: z.any().optional(),
});

type FormData = z.infer<typeof formSchema>;


interface UploadMaterialDialogProps {
    openOverride?: boolean;
    onOpenChangeOverride?: (open: boolean) => void;
}

export function UploadMaterialDialog({ openOverride, onOpenChangeOverride }: UploadMaterialDialogProps) {
    const [open, setOpen] = useState(false);

    // Support controlled or uncontrolled state
    const isControlled = openOverride !== undefined;
    const currentOpen = isControlled ? openOverride : open;
    const setCurrentOpen = isControlled ? onOpenChangeOverride : setOpen;

    const { user } = useAuth();
    const { firestore, storage } = useFirebase();
    const { toast } = useToast();

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            category: "",
            primaryVideoURL: "",
            videoURLs: [],
            documentFiles: undefined,
            imageFiles: undefined,
        }
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "videoURLs"
    });

    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

    const { formState: { isSubmitting } } = form;

    const onSubmit = async (data: FormData) => {
        console.log("UploadMaterialDialog: Starting onSubmit", data);
        if (!user || !firestore || !storage) {
            toast({ title: "Services not available", variant: "destructive" });
            return;
        }

        let uploadedDocURLs: string[] = [];
        let uploadedImgURLs: string[] = [];
        let finalVideoURLs: string[] = [];

        try {
            // 1. Handle Documents
            if (data.documentFiles && data.documentFiles.length > 0) {
                for (let i = 0; i < data.documentFiles.length; i++) {
                    const file = data.documentFiles[i];
                    const storageRef = ref(storage, `training/documents/${user.id}/${Date.now()}-${file.name}`);
                    const uploadResult = await uploadBytes(storageRef, file);
                    const url = await getDownloadURL(uploadResult.ref);
                    uploadedDocURLs.push(url);
                }
            }

            // 2. Handle Images
            if (data.imageFiles && data.imageFiles.length > 0) {
                for (let i = 0; i < data.imageFiles.length; i++) {
                    const file = data.imageFiles[i];
                    const storageRef = ref(storage, `training/images/${user.id}/${Date.now()}-${file.name}`);
                    const uploadResult = await uploadBytes(storageRef, file);
                    const url = await getDownloadURL(uploadResult.ref);
                    uploadedImgURLs.push(url);
                }
            }

            // 3. Handle Video URLs
            if (data.primaryVideoURL) {
                finalVideoURLs.push(data.primaryVideoURL);
            }
            if (data.videoURLs && data.videoURLs.length > 0) {
                const supplementalVideos = data.videoURLs.map(v => v.url).filter(url => url !== "");
                finalVideoURLs = [...finalVideoURLs, ...supplementalVideos];
            }

        } catch (uploadError: any) {
            console.error("Resource processing error:", uploadError);
            toast({ title: "Upload Failed", description: uploadError.message || "Could not upload files to storage.", variant: "destructive" });
            return;
        }

        // 4. Handle Thumbnail
        let finalThumbnailURL = "";
        if (thumbnailFile) {
            const thumbRef = ref(storage, `training/thumbnails/${user.id}/${Date.now()}-${thumbnailFile.name}`);
            await uploadBytes(thumbRef, thumbnailFile);
            finalThumbnailURL = await getDownloadURL(thumbRef);
        }

        // 5. Determine FileType
        const hasDocs = uploadedDocURLs.length > 0;
        const hasImgs = uploadedImgURLs.length > 0;
        const hasVideos = finalVideoURLs.length > 0;

        let finalFileType: 'document' | 'video' | 'image' | 'mixed' = 'mixed';
        if (hasDocs && !hasImgs && !hasVideos) finalFileType = 'document';
        else if (!hasDocs && hasImgs && !hasVideos) finalFileType = 'image';
        else if (!hasDocs && !hasImgs && hasVideos) finalFileType = 'video';
        else if (!hasDocs && !hasImgs && !hasVideos) {
            toast({ title: "No content", description: "Please provide at least one document, image, or video link.", variant: "destructive" });
            return;
        }

        const materialData = {
            title: data.title,
            description: data.description,
            category: data.category,
            fileType: finalFileType,
            fileURL: uploadedDocURLs[0] || uploadedImgURLs[0] || "",
            videoURL: finalVideoURLs[0] || "",
            fileURLs: [...uploadedDocURLs, ...uploadedImgURLs],
            documentURLs: uploadedDocURLs,
            imageURLs: uploadedImgURLs,
            videoURLs: finalVideoURLs,
            thumbnailURL: finalThumbnailURL,
            uploadedBy: user.id,
            uploadedAt: new Date().toISOString(),
            views: 0,
        };

        try {
            const trainingCollectionRef = collection(firestore, "trainingMaterials");
            await addDoc(trainingCollectionRef, materialData);
            toast({ title: "Success!", description: `"${data.title}" added successfully.` });
            form.reset();
            setThumbnailFile(null);
            if (setCurrentOpen) setCurrentOpen(false);
        } catch (e: any) {
            console.error("Firestore save error:", e);
            toast({ title: "Save Failed", description: e.message || "Could not save material to database.", variant: "destructive" });
        }
    }

    return (
        <Dialog open={currentOpen} onOpenChange={setCurrentOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="h-8 gap-1">
                    <Upload className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Upload Material</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle>Upload New Material</DialogTitle>
                    <DialogDescription>
                        Add a new training document, video, or link to the library.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-grow overflow-y-auto p-6 pt-0">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} id="upload-material-form" className="space-y-4 py-4">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Advanced Forklift Techniques" {...field} value={field.value ?? ""} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="A brief summary of the material" {...field} value={field.value ?? ""} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Safety">Safety</SelectItem>
                                                <SelectItem value="Operations">Operations</SelectItem>
                                                <SelectItem value="Emergency">Emergency</SelectItem>
                                                <SelectItem value="Other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-2 border rounded-lg p-4 bg-muted/30">
                                <FormLabel className="text-sm font-medium">Card Thumbnail (Optional)</FormLabel>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                                />
                                <FormDescription className="text-[10px]">Upload a custom image for the training card.</FormDescription>
                            </div>

                            <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
                                <h4 className="text-sm font-semibold flex items-center gap-2">
                                    <Upload className="h-4 w-4" />
                                    Resource Uploads
                                </h4>

                                <FormField
                                    control={form.control}
                                    name="documentFiles"
                                    render={({ field: { onChange, value, ...fieldProps } }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs">Document Files (PDF/Word)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="file"
                                                    multiple
                                                    accept=".pdf,.doc,.docx"
                                                    onChange={(event) => onChange(event.target.files)}
                                                    {...fieldProps}
                                                    className="h-8 text-xs px-2 py-1"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="imageFiles"
                                    render={({ field: { onChange, value, ...fieldProps } }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs">Image Files</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    onChange={(event) => onChange(event.target.files)}
                                                    {...fieldProps}
                                                    className="h-8 text-xs px-2 py-1"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="primaryVideoURL"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs">Main Video URL (Optional)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="https://youtube.com/watch?v=..." {...field} value={field.value ?? ""} className="h-8 text-xs" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Supplemental / Additional Videos Section */}
                            <div className="space-y-4 pt-4 border-t">
                                <div className="flex items-center justify-between">
                                    <FormLabel className="text-sm font-medium">Video Links</FormLabel>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-7 px-2 text-xs"
                                        onClick={() => append({ url: "" })}
                                    >
                                        <Plus className="mr-1 h-3 w-3" />
                                        Add Link
                                    </Button>
                                </div>

                                {fields.length === 0 && (
                                    <p className="text-[10px] text-muted-foreground italic">No supplemental videos added yet.</p>
                                )}

                                <div className="space-y-3">
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="flex gap-2 items-start">
                                            <FormField
                                                control={form.control}
                                                name={`videoURLs.${index}.url`}
                                                render={({ field }) => (
                                                    <FormItem className="flex-grow space-y-0">
                                                        <FormControl>
                                                            <Input placeholder="Video URL (YouTube, Vimeo, etc.)" {...field} value={field.value ?? ""} />
                                                        </FormControl>
                                                        <FormMessage className="text-[10px]" />
                                                    </FormItem>
                                                )}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 text-muted-foreground hover:text-destructive"
                                                onClick={() => remove(index)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </form>
                    </Form>
                </div>
                <DialogFooter className="p-6 pt-2 border-t">
                    <Button type="submit" form="upload-material-form" disabled={isSubmitting} className="w-full">
                        {isSubmitting ? "Uploading Resources..." : "Upload Material"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    )
}
