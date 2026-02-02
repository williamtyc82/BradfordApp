"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useFirebase } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

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
    const { toast } = useToast();
    const { auth, firestore } = useFirebase();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
  
    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth || !firestore) {
            toast({ title: "Services not available", variant: "destructive"});
            return;
        }
        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Update Firebase Auth profile
            await updateProfile(user, { displayName: fullName, photoURL: `https://picsum.photos/seed/${user.uid}/100/100` });

            // Create user document in Firestore
            const userDocRef = doc(firestore, "users", user.uid);
            await setDoc(userDocRef, {
                id: user.uid,
                email: user.email,
                displayName: fullName,
                role: 'worker', // All signups are workers by default
                photoURL: `https://picsum.photos/seed/${user.uid}/100/100`,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
            });
            
            // Create user progress document
            const progressDocRef = doc(firestore, "userProgress", user.uid);
            await setDoc(progressDocRef, {
                userId: user.uid,
                completedMaterials: [],
                quizzesTaken: [],
                totalScore: 0,
                lastActivity: new Date().toISOString(),
                trainingCompletion: 0,
            });

            toast({
                title: "Account Created",
                description: "Welcome to Bradford Workforce Hub!",
            });
            router.push('/dashboard');
        } catch (error: any) {
            console.error("Sign up failed:", error);
            toast({
                title: "Sign Up Failed",
                description: error.message || "Could not create account.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignUp = () => {
        // In a real app, this would use signInWithPopup(auth, new GoogleAuthProvider());
        toast({
            title: "Info",
            description: "Google Sign-Up is not implemented in this demo. Please use email and password.",
        });
    };

  return (
    <form onSubmit={handleSignUp} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="full-name">Full Name</Label>
        <Input 
            id="full-name" 
            placeholder="John Doe" 
            required 
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={loading}
        />
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
          disabled={loading}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input 
            id="password" 
            type="password" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Creating Account...' : 'Create an account'}
      </Button>
      <Button variant="outline" type="button" className="w-full" onClick={handleGoogleSignUp} disabled={loading}>
        <GoogleIcon className="mr-2 h-4 w-4"/>
        Sign up with Google
      </Button>
    </form>
  );
}
