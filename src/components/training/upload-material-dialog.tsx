
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
import { Upload } from "lucide-react"
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { useFirebase, errorEmitter, FirestorePermissionError } from "@/firebase";
import { addDoc, collection } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";


const baseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string({ required_error: "Please select a category." }),
});

const videoSchema = baseSchema.extend({
  fileType: z.literal("video"),
  fileURL: z.string().url("A valid URL is required for videos."),
  file: z.any().optional(),
});

const pdfSchema = baseSchema.extend({
  fileType: z.literal("pdf"),
  file: z.any()
    .refine((files): files is FileList => files instanceof FileList, "File is required.")
    .refine(files => files.length > 0, "A file is required."),
  fileURL: z.string().optional(),
});

const imageSchema = baseSchema.extend({
    fileType: z.literal("image"),
    file: z.any()
      .refine((files): files is FileList => files instanceof FileList, "File is required.")
      .refine(files => files.length > 0, "A file is required."),
    fileURL: z.string().optional(),
});

const formSchema = z.discriminatedUnion("fileType", [videoSchema, pdfSchema, imageSchema]);

type FormData = z.infer<typeof formSchema>;


export function UploadMaterialDialog() {
  const { user } = useAuth();
  const { firestore, storage } = useFirebase();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        title: "",
        description: "",
        fileType: "video",
        fileURL: "",
    }
  });

  const { formState: { isSubmitting }, watch } = form;
  const fileType = watch("fileType");

  const onSubmit = async (data: FormData) => {
    if (!user || !firestore || !storage) {
        toast({ title: "Services not available", variant: "destructive" });
        return;
    }

    let materialUrl = '';

    try {
        if (data.fileType === 'video') {
            materialUrl = data.fileURL;
        } else {
            const file = data.file[0];
            if (!file) {
                 toast({ title: "File required", description: `Please select a ${data.fileType} file to upload.`, variant: "destructive" });
                 return;
            }
            const storageRef = ref(storage, `training-materials/${user.id}/${Date.now()}-${file.name}`);
            const uploadResult = await uploadBytes(storageRef, file);
            materialUrl = await getDownloadURL(uploadResult.ref);
        }
    } catch (uploadError) {
        console.error("File upload error:", uploadError);
        toast({ title: "Upload Failed", description: "Could not upload file to storage.", variant: "destructive" });
        return;
    }

    const materialData = {
        title: data.title,
        description: data.description,
        category: data.category,
        fileType: data.fileType,
        fileURL: materialUrl,
        uploadedBy: user.id,
        uploadedAt: new Date().toISOString(),
        views: 0,
    };
    
    const trainingCollectionRef = collection(firestore, "trainingMaterials");

    try {
        await addDoc(trainingCollectionRef, materialData);
        toast({ title: "Upload successful!", description: `"${data.title}" has been added.` });
        form.reset();
        setOpen(false);
    } catch (e: any) {
        const contextualError = new FirestorePermissionError({
          operation: 'create',
          path: trainingCollectionRef.path,
          requestResourceData: materialData,
        });
        errorEmitter.emit('permission-error', contextualError);

        toast({ title: "Save Failed", description: "Could not save material to database.", variant: "destructive" });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 gap-1">
            <Upload className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Upload Material</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload New Material</DialogTitle>
          <DialogDescription>
            Add a new training document, video, or link to the library.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. Advanced Forklift Techniques" {...field} />
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
                                <Textarea placeholder="A brief summary of the material" {...field} />
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
                <FormField
                    control={form.control}
                    name="fileType"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Material Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a material type" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="video">Video (URL)</SelectItem>
                                    <SelectItem value="pdf">PDF (Upload)</SelectItem>
                                    <SelectItem value="image">Image (Upload)</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                
                {fileType === 'video' && (
                     <FormField
                        control={form.control}
                        name="fileURL"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Video URL</FormLabel>
                                <FormControl>
                                    <Input placeholder="https://youtube.com/watch?v=..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                {(fileType === 'pdf' || fileType === 'image') && (
                     <FormField
                        control={form.control}
                        name="file"
                        render={({ field: { onChange, ...fieldProps } }) => (
                            <FormItem>
                                <FormLabel>{fileType === 'pdf' ? 'PDF File' : 'Image File'}</FormLabel>
                                <FormControl>
                                    <Input 
                                        type="file" 
                                        accept={fileType === 'pdf' ? '.pdf' : 'image/*'}
                                        onChange={(event) => onChange(event.target.files)}
                                        {...fieldProps}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
               
                <DialogFooter>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Uploading..." : "Upload"}
                    </Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
