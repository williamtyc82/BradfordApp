"use client";

import type { Quiz, QuizQuestion } from "@/lib/types";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle } from "lucide-react";

type QuizResultState = {
    score: number;
    correctAnswers: number;
    incorrectAnswers: number;
}

export function QuizTaker({ quiz }: { quiz: Quiz }) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [answers, setAnswers] = useState<(number | null)[]>([]);
    const [quizFinished, setQuizFinished] = useState(false);
    const [result, setResult] = useState<QuizResultState | null>(null);
    
    const router = useRouter();
    const { toast } = useToast();
    
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex) / quiz.questions.length) * 100;

    const handleNext = () => {
        const newAnswers = [...answers, selectedAnswer];
        setAnswers(newAnswers);
        setSelectedAnswer(null);

        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            calculateResult(newAnswers);
            setQuizFinished(true);
        }
    };

    const calculateResult = (finalAnswers: (number | null)[]) => {
        let correct = 0;
        quiz.questions.forEach((q, index) => {
            if (finalAnswers[index] === q.correctAnswer) {
                correct++;
            }
        });
        const score = Math.round((correct / quiz.questions.length) * 100);
        setResult({
            score,
            correctAnswers: correct,
            incorrectAnswers: quiz.questions.length - correct,
        });
    }

    if (quizFinished && result) {
        return (
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>Quiz Complete!</CardTitle>
                    <CardDescription>Here's how you did on "{quiz.title}".</CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <p className="text-6xl font-bold text-primary">{result.score}%</p>
                    <div className="flex justify-around">
                        <div className="flex items-center gap-2">
                           <CheckCircle className="h-6 w-6 text-green-500" />
                           <span className="font-medium">{result.correctAnswers} Correct</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <XCircle className="h-6 w-6 text-destructive" />
                            <span className="font-medium">{result.incorrectAnswers} Incorrect</span>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" onClick={() => {
                        toast({ title: "Quiz result saved."});
                        router.push("/dashboard/quizzes");
                    }}>
                        Back to Quizzes
                    </Button>
                </CardFooter>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-2xl">
            <CardHeader>
                <Progress value={progress} className="mb-4"/>
                <CardTitle>{quiz.title}</CardTitle>
                <CardDescription>Question {currentQuestionIndex + 1} of {quiz.questions.length}</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-lg font-semibold mb-4">{currentQuestion.question}</p>
                <RadioGroup onValueChange={(val) => setSelectedAnswer(Number(val))} value={selectedAnswer?.toString()}>
                    {currentQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2 p-3 rounded-md border has-[:checked]:bg-muted">
                            <RadioGroupItem value={index.toString()} id={`r${index}`} />
                            <Label htmlFor={`r${index}`} className="flex-1 cursor-pointer">{option}</Label>
                        </div>
                    ))}
                </RadioGroup>
            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={handleNext} disabled={selectedAnswer === null}>
                    {currentQuestionIndex < quiz.questions.length - 1 ? "Next Question" : "Finish Quiz"}
                </Button>
            </CardFooter>
        </Card>
    );
}
