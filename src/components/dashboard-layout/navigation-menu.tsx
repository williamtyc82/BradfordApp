"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home,
    BookOpen,
    ClipboardList,
    AlertTriangle,
    Megaphone,
    Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { useFirebase, useCollection } from '@/firebase';
import { collection, query, where, getCountFromServer, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';

interface NavigationMenuProps {
    onItemClick?: () => void;
}

export function NavigationMenu({ onItemClick }: NavigationMenuProps) {
    const pathname = usePathname();
    const { user } = useAuth();
    const { firestore } = useFirebase();
    const [counts, setCounts] = useState({ quizzes: 0, incidents: 0 });

    useEffect(() => {
        if (!firestore || !user) return;

        const fetchCounts = async () => {
            try {
                // Count quizzes (Assuming all quizzes available to user)
                const quizzesColl = collection(firestore, 'quizzes');
                const quizzesSnapshot = await getCountFromServer(quizzesColl);
                const totalQuizzes = quizzesSnapshot.data().count;

                // Count completed quizzes (unique)
                const resultsColl = collection(firestore, 'quizResults');
                const resultsQuery = query(resultsColl, where("userId", "==", user.id));
                const resultsSnapshot = await getDocs(resultsQuery);
                const completedQuizIds = new Set(resultsSnapshot.docs.map(doc => doc.data().quizId));
                const completedCount = completedQuizIds.size;

                // Count incidents
                const incidentsColl = collection(firestore, 'incidents');
                let incidentsQuery;

                if (user.role === 'manager') {
                    // Managers see all incidents, or maybe active ones? keeping it simple for now: all
                    incidentsQuery = incidentsColl;
                } else {
                    // Workers see their own incidents
                    incidentsQuery = query(incidentsColl, where("reportedBy", "==", user.id));
                }

                const incidentsSnapshot = await getCountFromServer(incidentsQuery);

                setCounts({
                    quizzes: Math.max(0, totalQuizzes - completedCount),
                    incidents: incidentsSnapshot.data().count
                });
            } catch (error) {
                console.error("Error fetching nav counts:", error);
            }
        };

        fetchCounts();
        // Simple polling every 30s to keep counts relatively fresh without realtime listener overhead for just badges
        const interval = setInterval(fetchCounts, 30000);
        return () => clearInterval(interval);

    }, [firestore, user]);


    const navItems = [
        { href: '/dashboard', label: 'Dashboard', icon: Home },
        { href: '/dashboard/training', label: 'Training', icon: BookOpen },
        { href: '/dashboard/quizzes', label: 'Quizzes', icon: ClipboardList, badge: counts.quizzes },
        { href: '/dashboard/incidents', label: 'Incidents', icon: AlertTriangle, badge: counts.incidents },
        { href: '/dashboard/announcements', label: 'Announcements', icon: Megaphone },
    ];

    if (user?.role === 'manager') {
        navItems.push({ href: '/dashboard/team-progress', label: 'Team Progress', icon: Users });
    }

    return (
        <>
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Navigation
            </div>
            {navItems.map((item) => (
                <Link
                    key={item.label}
                    href={item.href}
                    onClick={onItemClick}
                    className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                        pathname === item.href && 'bg-muted text-primary'
                    )}
                >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                    {item.badge !== undefined && item.badge > 0 && (
                        <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                            {item.badge}
                        </Badge>
                    )}
                </Link>
            ))}

            {user?.role === 'manager' && (
                <>
                    <div className="mt-4 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Manager Tools
                    </div>
                    <Link
                        href="/dashboard/team-progress"
                        onClick={onItemClick}
                        className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                            pathname === '/dashboard/team-progress' && 'bg-muted text-primary'
                        )}
                    >
                        <Users className="h-4 w-4" />
                        Team Progress
                    </Link>
                    <Link
                        href="/dashboard/training?manage=true"
                        onClick={onItemClick}
                        className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                            pathname === '/dashboard/training' && 'bg-muted text-primary'
                        )}
                    >
                        <BookOpen className="h-4 w-4" />
                        Manage Training
                    </Link>
                </>
            )}
        </>
    );
}
