"use client";

import { useAuth } from "@/hooks/use-auth";
import { QuizList } from "@/components/quizzes/quiz-list";
import { CreateQuizDialog } from "@/components/quizzes/create-quiz-dialog";

export default function QuizzesPage() {
    const { user } = useAuth();
    
    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight font-headline">Quizzes</h2>
                {user?.role === 'manager' && <CreateQuizDialog />}
            </div>
            <p className="text-muted-foreground">
                Test your knowledge and complete required assessments.
            </p>
            <QuizList />
        </div>
    );
}
