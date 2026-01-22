"use client";

import { useAuth } from "@/hooks/use-auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { quizzes, userProgressData } from "@/lib/placeholder-data";
import { RecentAnnouncements } from "./recent-announcements";
import { useRouter } from "next/navigation";

export function WorkerDashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const progress = user ? userProgressData.find(p => p.userId === user.id) : null;
    const pendingQuizzes = quizzes.filter(q => !progress?.quizzesTaken.some(qt => qt.quizId === q.id));

    if (!user) return null;

    return (
        <div className="flex flex-1 flex-col gap-4 md:gap-8">
            <div className="flex items-center">
                <h1 className="text-lg font-semibold md:text-2xl font-headline">Welcome back, {user.displayName}!</h1>
            </div>
            <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
                <Card className="xl:col-span-2">
                    <CardHeader>
                        <CardTitle>My Progress</CardTitle>
                        <CardDescription>Your current training and quiz completion status.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm font-medium">Training Completion</span>
                                <span className="text-sm text-muted-foreground">{progress?.trainingCompletion || 0}%</span>
                            </div>
                            <Progress value={progress?.trainingCompletion || 0} />
                        </div>
                        <div className="space-y-2">
                             <div className="flex justify-between">
                                <span className="text-sm font-medium">Average Quiz Score</span>
                                <span className="text-sm text-muted-foreground">
                                    {progress && progress.quizzesTaken.length > 0
                                        ? `${Math.round(progress.quizzesTaken.reduce((acc, curr) => acc + curr.score, 0) / progress.quizzesTaken.length)}%`
                                        : 'N/A'
                                    }
                                </span>
                            </div>
                            <Progress value={progress && progress.quizzesTaken.length > 0
                                        ? Math.round(progress.quizzesTaken.reduce((acc, curr) => acc + curr.score, 0) / progress.quizzesTaken.length)
                                        : 0} />
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Pending Quizzes</CardTitle>
                        <CardDescription>Quizzes you need to complete.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {pendingQuizzes.length > 0 ? (
                            pendingQuizzes.map(quiz => (
                                <div key={quiz.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                                    <span className="font-medium">{quiz.title}</span>
                                    <Button size="sm" onClick={() => router.push(`/dashboard/quizzes/${quiz.id}`)}>Start</Button>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">No pending quizzes. Great job!</p>
                        )}
                    </CardContent>
                </Card>
            </div>
             <RecentAnnouncements />
        </div>
    )
}
