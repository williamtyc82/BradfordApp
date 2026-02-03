"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useFirebase } from '@/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import Link from 'next/link';

export function ForgotPasswordForm() {
    const { toast } = useToast();
    const { auth } = useFirebase();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast({ title: "Please enter an email", variant: "destructive" });
            return;
        }
        setLoading(true);

        if (!auth) {
            toast({ title: "Auth service not available", variant: "destructive" });
            setLoading(false);
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            setSent(true);
            toast({
                title: "Reset Link Sent",
                description: "If an account exists for this email, you will receive a password reset link.",
            });
        } catch (error: any) {
            console.error("Password reset failed:", error);
            let description = error.message || "Failed to send reset link.";
            if (error.code === 'auth/invalid-email') {
                description = "Please enter a valid email address.";
            }
            toast({
                title: "Error",
                description: description,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="grid gap-4 text-center">
                <div className="text-sm text-muted-foreground">
                    Check your email ({email}) for a link to reset your password.
                </div>
                <Button asChild className="w-full" variant="outline">
                    <Link href="/">Back to Login</Link>
                </Button>
                <Button
                    variant="link"
                    className="text-sm text-muted-foreground mt-2"
                    onClick={() => setSent(false)}
                >
                    Try another email
                </Button>
            </div>
        )
    }

    return (
        <form onSubmit={handleReset} className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
            <div className="text-center text-sm">
                <Link href="/" className="underline text-muted-foreground">
                    Back to Login
                </Link>
            </div>
        </form>
    );
}
