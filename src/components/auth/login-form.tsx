"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useFirebase } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.05 1.05-2.86 2.25-5.02 2.25-4.42 0-8.01-3.6-8.01-8.01s3.58-8.01 8.01-8.01c2.54 0 4.13 1.05 5.02 2.02l2.7-2.7C17.03 1.48 15.01 0 12.48 0 5.88 0 .01 5.88.01 12.48s5.87 12.48 12.47 12.48c6.99 0 12-4.92 12-12.02 0-.8-.08-1.58-.2-2.34z"
      />
    </svg>
  );

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { auth } = useFirebase();
  const [email, setEmail] = useState('worker1@bradford.co');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if(!auth) {
        toast({ title: "Auth service not available", variant: "destructive" });
        setLoading(false);
        return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Login failed:", error);
      toast({
        title: "Login Failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
        setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // In a real app, you would use signInWithPopup(auth, new GoogleAuthProvider());
    // For this demo, we'll just sign in as the manager.
    setEmail('manager@bradford.co');
    setPassword('password123');
    toast({
      title: "Manager Login",
      description: "Click 'Login' to sign in as manager@bradford.co",
    });
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
            href="#"
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
      <Button variant="outline" type="button" className="w-full" onClick={handleGoogleSignIn} disabled={loading}>
        <GoogleIcon className="mr-2 h-4 w-4"/>
        Login with Google
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
