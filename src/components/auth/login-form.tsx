"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useFirebase } from '@/firebase';
import { useAuth } from '@/hooks/use-auth';
import { signInWithEmailAndPassword } from 'firebase/auth';



export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { auth } = useFirebase();
  const { user } = useAuth(); // Monitor user state
  const [email, setEmail] = useState('worker1@bradford.co');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  // Redirect when user is detected (handles both initial load and successful login)
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!auth) {
      toast({ title: "Auth service not available", variant: "destructive" });
      setLoading(false);
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Do NOT router.push here. Wait for useAuth to update user state and trigger useEffect.
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
    } catch (error: any) {
      console.error("Login failed:", error);
      let description = "An unknown error occurred. Please try again.";
      if (error.code === 'auth/invalid-credential') {
        description = "Incorrect email or password. If you want to register as a manager, please use the sign-up page.";
      } else if (error.message) {
        description = error.message;
      }

      toast({
        title: "Login Failed",
        description: description,
        variant: "destructive",
      });
      setLoading(false); // Only stop loading on error. On success, keep loading while redirecting.
    } finally {
      // Don't set loading(false) on success, to prevent form re-enabling during redirect
      if (!auth.currentUser) {
        setLoading(false);
      }
    }
  };



  return (
    <form onSubmit={handleLogin} className="grid gap-4">
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
      <div className="grid gap-2">
        <div className="flex items-center">
          <Label htmlFor="password">Password</Label>
          <Link
            href="/forgot-password"
            className="ml-auto inline-block text-sm underline"
          >
            Forgot your password?
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
      </div>
      <Button id="login-button" type="submit" className="w-full" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </Button>

      <div className="mt-4 text-center text-sm">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="underline">
          Sign up
        </Link>
      </div>
    </form>
  );
}
