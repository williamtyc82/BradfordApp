import { quizzes } from "@/lib/placeholder-data";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Clock, Edit, Play, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";

export function QuizList() {
    const { user } = useAuth();

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quizzes.map(quiz => (
                <Card key={quiz.id}>
                    <CardHeader>
                        <CardTitle>{quiz.title}</CardTitle>
                        <CardDescription>{quiz.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Badge variant="secondary">{quiz.category}</Badge>
                        <div className="flex items-center text-sm text-muted-foreground">
                            <span>{quiz.questions.length} Questions</span>
                            <span className="mx-2">•</span>
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{quiz.duration} min</span>
                        </div>
                    </CardContent>
                    <CardFooter>
                        {user?.role === 'worker' ? (
                            <Button asChild className="w-full">
                                <Link href={`/dashboard/quizzes/${quiz.id}`}>
                                    <Play className="mr-2 h-4 w-4" />
                                    Start Quiz
                                </Link>
                            </Button>
                        ) : (
                            <div className="flex w-full gap-2">
                                <Button variant="outline" className="w-full">
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </Button>
                                <Button variant="destructive" className="w-full">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </Button>
                            </div>
                        )}
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
