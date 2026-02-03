"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { QuizList } from "@/components/quizzes/quiz-list";
import { CreateQuizDialog } from "@/components/quizzes/create-quiz-dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import type { Quiz } from "@/lib/types";

const CATEGORIES = ["All", "Safety", "Operations", "Emergency", "Other"];

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function QuizzesPage() {
    const { user: appUser } = useAuth();
    const { firestore, user: firebaseUser, isUserLoading: authIsLoading } = useFirebase();
    const [activeCategory, setActiveCategory] = useState("All");

    const quizzesQuery = useMemoFirebase(() => {
        if (!firestore || !firebaseUser) return null;
        return query(collection(firestore, "quizzes"), orderBy("createdAt", "desc"));
    }, [firestore, firebaseUser]);

    const { data: quizzes, isLoading: quizzesIsLoading } = useCollection<Quiz>(quizzesQuery);

    const isLoading = authIsLoading || quizzesIsLoading;

    const filteredQuizzes = (quizzes || []).filter(q =>
        activeCategory === "All" || q.category === activeCategory
    );

    const getCount = (cat: string) => {
        if (!quizzes) return 0;
        if (cat === "All") return quizzes.length;
        return quizzes.filter(q => q.category === cat).length;
    };

    return (
        <div className="flex-1 space-y-6 w-full overflow-x-hidden">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight font-headline">Quizzes</h2>
                    <p className="text-muted-foreground text-sm">Test your knowledge and complete required assessments.</p>
                </div>
                {appUser?.role === 'manager' && <CreateQuizDialog />}
            </div>

            <div className="space-y-4">
                {/* Mobile View: Dropdown */}
                <div className="md:hidden">
                    <Select value={activeCategory} onValueChange={setActiveCategory}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                            {CATEGORIES.map(cat => (
                                <SelectItem key={cat} value={cat}>
                                    {cat} ({getCount(cat)})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <div className="mt-4">
                        <QuizList
                            quizzes={filteredQuizzes}
                            isLoading={isLoading}
                            activeCategory={activeCategory}
                        />
                    </div>
                </div>

                {/* Desktop View: Tabs */}
                <div className="hidden md:block">
                    <Tabs defaultValue="All" value={activeCategory} className="w-full" onValueChange={setActiveCategory}>
                        <div className="flex items-center justify-between overflow-x-auto pb-2 scrollbar-none">
                            <TabsList className="h-10 p-1 bg-muted/50">
                                {CATEGORIES.map(cat => (
                                    <TabsTrigger
                                        key={cat}
                                        value={cat}
                                        className="px-4 py-2 text-xs font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm"
                                    >
                                        {cat}
                                        <span className="ml-2 rounded-full bg-muted-foreground/10 px-1.5 py-0.5 text-[10px] text-muted-foreground group-data-[state=active]:bg-primary/10 group-data-[state=active]:text-primary transition-colors">
                                            {getCount(cat)}
                                        </span>
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>

                        <div className="mt-4">
                            <QuizList
                                quizzes={filteredQuizzes}
                                isLoading={isLoading}
                                activeCategory={activeCategory}
                            />
                        </div>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}

