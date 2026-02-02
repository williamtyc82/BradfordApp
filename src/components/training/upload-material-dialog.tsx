
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


const formSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    category: z.string({ required_error: "Please select a category." }),
    fileType: z.enum(["pdf", "video", "image"], { required_error: "Please select a file type." }),
    fileURL: z.string().min(1, "A file or URL is required"),
});

type FormData = z.infer<typeof formSchema>;


export function UploadMaterialDialog() {
  const { user } = useAuth();
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        title: "",
        description: "",
        fileURL: "",
    }
  });

  const { formState: { isSubmitting }, watch, setValue } = form;
  const fileType = watch("fileType");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue("fileURL", reader.result as string, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: FormData) => {
    if (!user || !firestore) {
        toast({ title: "Not authenticated or Firestore not available", variant: "destructive" });
        return Promise.reject(new Error("Not authenticated or Firestore not available"));
    }

    const materialData = {
        ...data,
        uploadedBy: user.id,
        uploadedAt: new Date().toISOString(),
        views: 0,
    };
    
    const trainingCollectionRef = collection(firestore, "trainingMaterials");

    return addDoc(trainingCollectionRef, materialData)
        .then((docRef) => {
            toast({ title: "Upload successful!", description: `"${data.title}" has been added.` });
            form.reset();
            setOpen(false);
        })
        .catch(async (e: any) => {
            const contextualError = new FirestorePermissionError({
              operation: 'create',
              path: trainingCollectionRef.path,
              requestResourceData: materialData,
            });
            errorEmitter.emit('permission-error', contextualError);

            toast({ title: "Upload Failed", description: "Could not upload material. Check permissions.", variant: "destructive" });
            // Re-throw to make sure react-hook-form knows the submission failed
            throw e;
        });
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
                     <FormItem>
                        <FormLabel>{fileType === 'pdf' ? 'PDF File' : 'Image File'}</FormLabel>
                        <FormControl>
                            <Input 
                                type="file" 
                                accept={fileType === 'pdf' ? '.pdf' : 'image/*'}
                                onChange={handleFileChange}
                            />
                        </FormControl>
                         {/* Manually display error for fileURL since the input is not a direct RHF component */}
                        <FormMessage>{form.formState.errors.fileURL?.message}</FormMessage>
                    </FormItem>
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
