"use client";

import { useDoc, useFirebase, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { QuizTaker } from "@/components/quizzes/quiz-taker";
import { notFound } from "next/navigation";
import { use } from "react";
import { Loader2 } from "lucide-react";
import type { Quiz } from "@/lib/types";

type QuizPageProps = {
    params: Promise<{
        id: string;
    }>;
}

export default function QuizPage({ params }: QuizPageProps) {
    const { id } = use(params);
    const { firestore } = useFirebase();

    const quizDocRef = useMemoFirebase(() => {
        return id && firestore ? doc(firestore, "quizzes", id) : null;
    }, [id, firestore]);

    const { data: quiz, isLoading } = useDoc<Quiz>(quizDocRef);

    if (isLoading || !id || !firestore) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary/50 mb-4" />
                <p className="text-muted-foreground">Loading quiz details...</p>
            </div>
        );
    }

    if (!quiz) {
        notFound();
    }

    return (
        <div className="flex-1 flex items-center justify-center p-4">
            <QuizTaker quiz={quiz} />
        </div>
    );
}
