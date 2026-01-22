"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.05 1.05-2.86 2.25-5.02 2.25-4.42 0-8.01-3.6-8.01-8.01s3.58-8.01 8.01-8.01c2.54 0 4.13 1.05 5.02 2.02l2.7-2.7C17.03 1.48 15.01 0 12.48 0 5.88 0 .01 5.88.01 12.48s5.87 12.48 12.47 12.48c6.99 0 12-4.92 12-12.02 0-.8-.08-1.58-.2-2.34z"
      />
    </svg>
  );

export function SignUpForm() {
    const router = useRouter();
    const { login } = useAuth();
    const { toast } = useToast();
    const [email, setEmail] = useState('');
  
    const handleSignUp = (e: React.FormEvent) => {
      e.preventDefault();
      if (!email || !email.includes('@')) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address.",
          variant: "destructive",
        });
        return;
      }
      // In a real app, this would create a new user.
      // Here we just log in as a new worker.
      login(email); 
      toast({
        title: "Account Created",
        description: "Welcome to Bradford Workforce Hub!",
      });
      router.push('/dashboard');
    };

    const handleGoogleSignUp = () => {
        login('worker1@bradford.co'); // Mock Google sign-up
        toast({
            title: "Account Created",
            description: "Welcome to Bradford Workforce Hub!",
          });
        router.push('/dashboard');
    };

  return (
    <form onSubmit={handleSignUp} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="full-name">Full Name</Label>
        <Input id="full-name" placeholder="John Doe" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="m@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" required />
      </div>
      <Button type="submit" className="w-full">
        Create an account
      </Button>
      <Button variant="outline" type="button" className="w-full" onClick={handleGoogleSignUp}>
        <GoogleIcon className="mr-2 h-4 w-4"/>
        Sign up with Google
      </Button>
    </form>
  );
}
