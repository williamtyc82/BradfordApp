
"use server";

import { initializeFirebase } from "@/firebase";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { TrainingMaterial } from "@/lib/types";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { z } from "zod";

const formSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    category: z.string(),
    fileType: z.enum(["pdf", "video", "image", "url"]),
    fileURL: z.string().url("Please enter a valid URL"),
    uploadedBy: z.string(),
});

type FormData = z.infer<typeof formSchema>;

export async function uploadTrainingMaterialAction(data: FormData) {
    const { firestore } = initializeFirebase();
    
    const validation = formSchema.safeParse(data);

    if (!validation.success) {
        return { success: false, errors: validation.error.flatten().fieldErrors };
    }

    try {
        const materialData = {
            ...validation.data,
            uploadedAt: new Date().toISOString(), // Using client date for now
            views: 0,
        };

        const docRef = await addDoc(collection(firestore, "trainingMaterials"), materialData);

        return { success: true, id: docRef.id };
    } catch (e: any) {
        console.error("Failed to upload training material:", e);
        return { success: false, error: e.message || "An unknown error occurred." };
    }
}
