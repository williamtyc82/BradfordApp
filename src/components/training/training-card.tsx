import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { TrainingMaterial } from "@/lib/types";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { FileType, Video, File, Trash2, X, Plus, Image as ImageIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useFirebase } from "@/firebase";
import { deleteDoc, doc, addDoc, collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { useToast } from "@/hooks/use-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

const typeIconMap = {
    document: FileType,
    video: Video,
    image: File,
    mixed: FileType
}

export function TrainingCard({ material }: { material: TrainingMaterial }) {
    const { user } = useAuth();
    const { firestore, storage } = useFirebase();
    const { toast } = useToast();
    const isManager = user?.role === 'manager';

    // Resources handling
    const docURLs = material.documentURLs || [];
    const imgURLs = material.imageURLs || [];
    const videoURLs = material.videoURLs || (material.videoURL ? [material.videoURL] : []);

    // For backward compatibility if new arrays are missing
    const legacyFileURLs = (!material.documentURLs && !material.imageURLs) ? (material.fileURLs || (material.fileURL ? [material.fileURL] : [])) : [];

    const [selectedDocURL, setSelectedDocURL] = useState(docURLs[0] || legacyFileURLs[0] || "");
    const [selectedImgURL, setSelectedImgURL] = useState(imgURLs[0] || "");
    const [selectedVideoURL, setSelectedVideoURL] = useState(videoURLs[0] || "");

    const handleOpen = (url: string) => {
        if (url) {
            // Log the view asynchronously
            if (firestore && user) {
                addDoc(collection(firestore, "trainingLogs"), {
                    userId: user.id,
                    materialId: material.id,
                    materialTitle: material.title,
                    viewedAt: new Date().toISOString(),
                }).catch(err => console.error("Error logging view:", err));

                // Check for and complete any pending assignments
                const assignmentsRef = collection(firestore, "trainingAssignments");
                const q = query(
                    assignmentsRef,
                    where("userId", "==", user.id),
                    where("materialId", "==", material.id),
                    where("status", "==", "pending")
                );

                getDocs(q).then((snapshot) => {
                    snapshot.forEach((docSnap) => {
                        updateDoc(doc(firestore, "trainingAssignments", docSnap.id), {
                            status: 'completed',
                            completedAt: new Date().toISOString()
                        }).catch(err => console.error("Error updating assignment:", err));
                    });
                }).catch(err => console.error("Error checking assignments:", err));
            }
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    }

    const handleDelete = async () => {
        if (!firestore || !material.id) return;

        try {
            await deleteDoc(doc(firestore, "trainingMaterials", material.id));

            if (storage) {
                const allFilesToRemove = [
                    ...(material.documentURLs || []),
                    ...(material.imageURLs || []),
                    ...(material.fileURLs || []),
                    ...(material.fileURL ? [material.fileURL] : []),
                    ...(material.thumbnailURL ? [material.thumbnailURL] : [])
                ];

                for (const url of Array.from(new Set(allFilesToRemove))) {
                    try {
                        const decodedUrl = decodeURIComponent(url);
                        const pathStart = decodedUrl.indexOf('/o/') + 3;
                        const pathEnd = decodedUrl.indexOf('?');
                        if (pathStart > 2 && pathEnd > pathStart) {
                            const storagePath = decodedUrl.substring(pathStart, pathEnd);
                            await deleteObject(ref(storage, storagePath));
                        }
                    } catch (err) {
                        console.warn("TrainingCard: Cleanup error:", url, err);
                    }
                }
            }

            toast({ title: "Material deleted", description: `"${material.title}" has been removed.` });
        } catch (error: any) {
            toast({ title: "Error", description: error.message || "Failed to delete.", variant: "destructive" });
        }
    };

    const hasDocs = docURLs.length > 0 || legacyFileURLs.length > 0;
    const hasImgs = imgURLs.length > 0;
    const hasVideos = videoURLs.length > 0;

    return (
        <Card className="flex flex-col h-full overflow-hidden border-muted-foreground/20 hover:border-primary/50 transition-colors">
            <CardHeader className="p-4 pb-2 space-y-2">
                <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
                    {material.thumbnailURL ? (
                        <Image
                            src={material.thumbnailURL}
                            alt={material.title}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            <FileType className="h-10 w-10 opacity-20" />
                        </div>
                    )}
                    <Badge className="absolute top-2 right-2 shadow-sm" variant="secondary">
                        {material.category}
                    </Badge>
                </div>
                <div>
                    <CardTitle className="text-lg line-clamp-1">{material.title}</CardTitle>
                    <CardDescription className="text-xs line-clamp-2 mt-1">{material.description}</CardDescription>
                </div>
            </CardHeader>

            <CardContent className="p-4 pt-2 flex-grow space-y-4">
                {/* Documents Section */}
                {(docURLs.length > 0 || legacyFileURLs.length > 0) && (
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                <File className="h-3 w-3" />
                                {imgURLs.length > 0 || videoURLs.length > 0 ? "Documents" : "Files"}
                            </label>
                            {(docURLs.length > 1 || legacyFileURLs.length > 1) && (
                                <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded-full font-medium">
                                    {docURLs.length || legacyFileURLs.length} Files
                                </span>
                            )}
                        </div>

                        {(docURLs.length > 1 || legacyFileURLs.length > 1) ? (
                            <Select value={selectedDocURL} onValueChange={setSelectedDocURL}>
                                <SelectTrigger className="h-8 text-xs bg-muted/30">
                                    <SelectValue placeholder="Select document" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(docURLs.length > 0 ? docURLs : legacyFileURLs).map((url, idx) => (
                                        <SelectItem key={idx} value={url} className="text-xs">
                                            File {idx + 1}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : null}

                        <Button variant="default" size="sm" className="w-full h-8 text-xs font-medium" onClick={() => handleOpen(selectedDocURL)}>
                            <FileType className="mr-2 h-3.5 w-3.5" />
                            View Document
                        </Button>
                    </div>
                )}

                {/* Images Section */}
                {imgURLs.length > 0 && (
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                <ImageIcon className="h-3 w-3" />
                                Images
                            </label>
                            {imgURLs.length > 1 && (
                                <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded-full font-medium">
                                    {imgURLs.length} Images
                                </span>
                            )}
                        </div>

                        {imgURLs.length > 1 ? (
                            <Select value={selectedImgURL} onValueChange={setSelectedImgURL}>
                                <SelectTrigger className="h-8 text-xs bg-muted/30">
                                    <SelectValue placeholder="Select image" />
                                </SelectTrigger>
                                <SelectContent>
                                    {imgURLs.map((url, idx) => (
                                        <SelectItem key={idx} value={url} className="text-xs">
                                            Image {idx + 1}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : null}

                        <Button variant="outline" size="sm" className="w-full h-8 text-xs font-medium" onClick={() => handleOpen(selectedImgURL)}>
                            <File className="mr-2 h-3.5 w-3.5" />
                            View Image
                        </Button>
                    </div>
                )}

                {/* Videos Section */}
                {hasVideos && (
                    <div className="space-y-1.5 pt-2 border-t border-muted-foreground/10">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                <Video className="h-3 w-3" />
                                Video Resources
                            </label>
                            {videoURLs.length > 1 && (
                                <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded-full font-medium">
                                    {videoURLs.length} Links
                                </span>
                            )}
                        </div>

                        {videoURLs.length > 1 ? (
                            <Select value={selectedVideoURL} onValueChange={setSelectedVideoURL}>
                                <SelectTrigger className="h-8 text-xs bg-muted/30">
                                    <SelectValue placeholder="Select video" />
                                </SelectTrigger>
                                <SelectContent>
                                    {videoURLs.map((url, idx) => (
                                        <SelectItem key={idx} value={url} className="text-xs text-left line-clamp-1">
                                            Video {idx + 1}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : null}

                        <Button variant={hasDocs || hasImgs ? "ghost" : "default"} size="sm" className="w-full h-8 text-xs font-medium border border-transparent hover:border-primary/20" onClick={() => handleOpen(selectedVideoURL)}>
                            <Video className="mr-2 h-3.5 w-3.5" />
                            Watch Video
                        </Button>
                    </div>
                )}
            </CardContent>

            <CardFooter className="p-4 pt-0 flex flex-col items-center">
                {isManager && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="w-full text-[10px] h-7 text-destructive hover:text-destructive hover:bg-destructive/10 uppercase font-bold tracking-tighter">
                                <Trash2 className="mr-1 h-3 w-3" />
                                Delete Material
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Training Material?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently remove "{material.title}" and all associated files/links. This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                    Delete Permanently
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </CardFooter>
        </Card>
    );
}
