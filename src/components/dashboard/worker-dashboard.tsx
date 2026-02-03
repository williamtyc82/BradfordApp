"use client";

import { useAuth } from "@/hooks/use-auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { RecentAnnouncements } from "./recent-announcements";
import { useRouter } from "next/navigation";
import { useFirebase, useMemoFirebase, useCollection } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Bell } from "lucide-react";

export function WorkerDashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const { firestore, user: firebaseUser } = useFirebase();

    // Check for assignments
    const assignmentsRef = useMemoFirebase(() => {
        if (!firestore || !firebaseUser) return null;
        return query(
            collection(firestore, "trainingAssignments"),
            where("userId", "==", firebaseUser.uid)
        );
    }, [firestore, firebaseUser]);
    const { data: assignments } = useCollection<{ status: string }>(assignmentsRef);

    // Filter for pending only
    const pendingAssignments = assignments?.filter(a => a.status === 'pending') || [];

    // Fetch Data for Progress
    const logsRef = useMemoFirebase(() => {
        if (!firestore || !firebaseUser) return null;
        return query(collection(firestore, "trainingLogs"), where("userId", "==", firebaseUser.uid));
    }, [firestore, firebaseUser]);
    const { data: logs } = useCollection<{ materialId: string }>(logsRef);

    const materialsRef = useMemoFirebase(() =>
        firestore ? query(collection(firestore, "trainingMaterials")) : null
        , [firestore]);
    const { data: materials } = useCollection<{ id: string }>(materialsRef);

    const quizResultsRef = useMemoFirebase(() => {
        if (!firestore || !firebaseUser) return null;
        return query(collection(firestore, "quizResults"), where("userId", "==", firebaseUser.uid));
    }, [firestore, firebaseUser]);
    const { data: quizResults } = useCollection<{ quizId: string, score: number }>(quizResultsRef);

    const quizzesRef = useMemoFirebase(() =>
        firestore ? query(collection(firestore, "quizzes")) : null
        , [firestore]);
    const { data: allQuizzes } = useCollection<{ id: string, title: string }>(quizzesRef);

    // Calculate Stats
    const totalMaterials = materials?.length || 0;
    const uniqueViewed = new Set(logs?.map(l => l.materialId)).size;
    const trainingCompletion = totalMaterials > 0 ? Math.round((uniqueViewed / totalMaterials) * 100) : 0;

    const avgQuizScore = quizResults && quizResults.length > 0
        ? Math.round(quizResults.reduce((acc, curr) => acc + curr.score, 0) / quizResults.length)
        : 0;

    // Pending Quizzes (Available but not taken)
    const pendingQuizzes = allQuizzes?.filter(q =>
        !quizResults?.some(qr => qr.quizId === q.id)
    ) || [];

    if (!user) return null;

    return (
        <div className="flex flex-1 flex-col gap-4 md:gap-8 min-w-0">
            <div className="flex items-center">
                <h1 className="text-lg font-semibold md:text-2xl font-headline">Welcome back, {user.displayName}!</h1>
            </div>

            {/* Assignment Alert */}
            {pendingAssignments.length > 0 && (
                <Alert className="border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-400">
                    <Bell className="h-4 w-4" />
                    <AlertTitle>Action Required</AlertTitle>
                    <AlertDescription className="flex items-center justify-between">
                        <span>
                            You have {pendingAssignments.length} new training assignment{pendingAssignments.length !== 1 ? 's' : ''}.
                        </span>
                        <Button variant="link" size="sm" className="px-0 ml-4 font-bold h-auto" onClick={() => router.push('/dashboard/training')}>
                            View Assignments &rarr;
                        </Button>
                    </AlertDescription>
                </Alert>
            )}
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
                                <span className="text-sm text-muted-foreground">{trainingCompletion}%</span>
                            </div>
                            <Progress value={trainingCompletion} />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm font-medium">Average Quiz Score</span>
                                <span className="text-sm text-muted-foreground">
                                    {quizResults && quizResults.length > 0 ? `${avgQuizScore}%` : 'N/A'}
                                </span>
                            </div>
                            <Progress value={avgQuizScore} />
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
