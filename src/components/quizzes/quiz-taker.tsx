import type { Quiz, QuizQuestion, QuizResult } from "@/lib/types";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useFirebase } from "@/firebase";
import { useAuth } from "@/hooks/use-auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

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
    const { firestore } = useFirebase();
    const { user } = useAuth();
    const [isSaving, setIsSaving] = useState(false);

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex) / quiz.questions.length) * 100;

    const handleNext = () => {
        const newAnswers = [...answers, selectedAnswer];
        setAnswers(newAnswers);
        setSelectedAnswer(null);

        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            handleFinish(newAnswers);
        }
    };

    const handleFinish = async (finalAnswers: (number | null)[]) => {
        let correct = 0;
        let totalPoints = 0;
        let earnedPoints = 0;

        quiz.questions.forEach((q, index) => {
            totalPoints += q.points;
            if (finalAnswers[index] === q.correctAnswer) {
                correct++;
                earnedPoints += q.points;
            }
        });

        const score = Math.round((earnedPoints / totalPoints) * 100);
        setResult({
            score,
            correctAnswers: correct,
            incorrectAnswers: quiz.questions.length - correct,
        });
        setQuizFinished(true);

        if (firestore && user) {
            setIsSaving(true);
            try {
                await addDoc(collection(firestore, "quizResults"), {
                    userId: user.id,
                    quizId: quiz.id,
                    score,
                    totalPoints,
                    earnedPoints, // Extra field for clarity
                    answers: finalAnswers,
                    completedAt: new Date().toISOString(),
                });
                toast({ title: "Quiz result saved successfully." });
            } catch (error) {
                console.error("Error saving quiz result:", error);
                toast({
                    title: "Error",
                    description: "Failed to save result, but your score is shown below.",
                    variant: "destructive"
                });
            } finally {
                setIsSaving(false);
            }
        }
    };

    if (quizFinished && result) {
        return (
            <Card className="w-full max-w-2xl border-2 shadow-lg overflow-hidden">
                <CardHeader className="bg-primary/5 border-b text-center py-10">
                    <CardTitle className="text-3xl mb-2">Quiz Complete!</CardTitle>
                    <CardDescription className="text-base">Here's how you did on "{quiz.title}".</CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-8 p-10">
                    <div className="relative inline-flex items-center justify-center">
                        <svg className="h-40 w-40 transform -rotate-90">
                            <circle
                                className="text-muted-foreground/10"
                                strokeWidth="8"
                                stroke="currentColor"
                                fill="transparent"
                                r="70"
                                cx="80"
                                cy="80"
                            />
                            <circle
                                className="text-primary transition-all duration-1000 ease-out"
                                strokeWidth="8"
                                strokeDasharray={70 * 2 * Math.PI}
                                strokeDashoffset={70 * 2 * Math.PI * (1 - result.score / 100)}
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="transparent"
                                r="70"
                                cx="80"
                                cy="80"
                            />
                        </svg>
                        <span className="absolute text-4xl font-black text-primary">{result.score}%</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                        <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-green-50/50 border border-green-100">
                            <CheckCircle className="h-6 w-6 text-green-500" />
                            <span className="text-sm text-muted-foreground">Correct</span>
                            <span className="text-xl font-bold text-green-700">{result.correctAnswers}</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-destructive/5 border border-destructive/10">
                            <XCircle className="h-6 w-6 text-destructive" />
                            <span className="text-sm text-muted-foreground">Incorrect</span>
                            <span className="text-xl font-bold text-destructive">{result.incorrectAnswers}</span>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="p-6 bg-muted/20 border-t">
                    <Button
                        className="w-full h-12 text-lg shadow-md"
                        onClick={() => router.push("/dashboard/quizzes")}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Saving your results...
                            </>
                        ) : (
                            "Back to Quizzes"
                        )}
                    </Button>
                </CardFooter>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-2xl">
            <CardHeader>
                <Progress value={progress} className="mb-4" />
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
