import { QuizTaker } from "@/components/quizzes/quiz-taker";
import { quizzes } from "@/lib/placeholder-data";
import { notFound } from "next/navigation";

type QuizPageProps = {
    params: {
        id: string;
    }
}

export default function QuizPage({ params }: QuizPageProps) {
    const quiz = quizzes.find(q => q.id === params.id);

    if (!quiz) {
        notFound();
    }

    return (
        <div className="flex-1 flex items-center justify-center">
            <QuizTaker quiz={quiz} />
        </div>
    );
}
