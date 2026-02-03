"use client";

import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Clock, Edit, Play, Trash2, ListChecks, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import type { Quiz } from "@/lib/types";
import { useState } from "react";
import { CreateQuizDialog } from "./create-quiz-dialog";
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
} from "@/components/ui/alert-dialog";

interface QuizListProps {
    quizzes: Quiz[] | null;
    isLoading: boolean;
    activeCategory: string;
}

export function QuizList({ quizzes, isLoading, activeCategory }: QuizListProps) {
    const { user: appUser } = useAuth();
    const { firestore } = useFirebase();
    const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
    const [deletingQuizId, setDeletingQuizId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const { toast } = useToast();

    const handleDelete = async () => {
        if (!firestore || !deletingQuizId) return;

        setIsDeleting(true);
        try {
            await deleteDoc(doc(firestore, "quizzes", deletingQuizId));
            toast({
                title: "Success",
                description: "Quiz deleted successfully",
            });
        } catch (error) {
            console.error("Error deleting quiz:", error);
            toast({
                title: "Error",
                description: "Failed to delete quiz",
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
            setDeletingQuizId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg bg-muted/20">
                <Loader2 className="h-8 w-8 animate-spin text-primary/50 mb-4" />
                <p className="text-muted-foreground">Loading quizzes...</p>
            </div>
        );
    }

    if (!quizzes || quizzes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg bg-muted/20">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <ListChecks className="h-6 w-6 text-primary/60" />
                </div>
                <h3 className="text-lg font-medium">No quizzes available</h3>
                <p className="text-sm text-muted-foreground">There are no assessments in the "{activeCategory}" category yet.</p>
            </div>
        );
    }

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {quizzes.map(quiz => (
                    <Card key={quiz.id} className="flex flex-col overflow-hidden border-2 border-transparent hover:border-primary/10 transition-all">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between mb-2">
                                <Badge variant="secondary" className="bg-primary/5 text-primary hover:bg-primary/10 border-none px-2 py-0">
                                    {quiz.category}
                                </Badge>
                            </div>
                            <CardTitle className="line-clamp-1">{quiz.title}</CardTitle>
                            <CardDescription className="line-clamp-2 h-10">{quiz.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 flex-1">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground bg-muted/30 p-2 rounded-lg">
                                <div className="flex items-center">
                                    <ListChecks className="h-4 w-4 mr-1.5 text-primary/60" />
                                    <span>{quiz.questions.length} Qs</span>
                                </div>
                                <div className="flex items-center">
                                    <Clock className="h-4 w-4 mr-1.5 text-primary/60" />
                                    <span>{quiz.duration} min</span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="pt-0 p-6 flex gap-2">
                            {appUser?.role === 'worker' ? (
                                <Button asChild className="w-full shadow-sm">
                                    <Link href={`/dashboard/quizzes/${quiz.id}`}>
                                        <Play className="mr-2 h-4 w-4" />
                                        Start Quiz
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        size="sm"
                                        onClick={() => setEditingQuiz(quiz)}
                                    >
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => setDeletingQuizId(quiz.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </>
                            )}
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {/* Edit Dialog */}
            {editingQuiz && (
                <CreateQuizDialog
                    quiz={editingQuiz}
                    open={!!editingQuiz}
                    onOpenChange={(open) => !open && setEditingQuiz(null)}
                />
            )}

            {/* Delete Confirmation */}
            <AlertDialog open={!!deletingQuizId} onOpenChange={(open) => !open && setDeletingQuizId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the quiz
                            and all associated records from the servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Deleting..." : "Delete Quiz"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
