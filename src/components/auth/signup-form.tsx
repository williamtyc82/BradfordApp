
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
import { Switch } from '@/components/ui/switch';

const MANAGER_ACCESS_CODE = "BRADFORD_MANAGER_2024";



export function SignUpForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { auth, firestore } = useFirebase();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isManagerSignup, setIsManagerSignup] = useState(false);
  const [accessCode, setAccessCode] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) {
      toast({ title: "Services not available", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      let role: 'worker' | 'manager' = 'worker';
      if (isManagerSignup) {
        if (accessCode === MANAGER_ACCESS_CODE) {
          role = 'manager';
        } else {
          throw new Error("Invalid Manager Access Code");
        }
      }

      // Update Firebase Auth profile
      await updateProfile(user, { displayName: fullName, photoURL: `https://picsum.photos/seed/${user.uid}/100/100` });

      // Create user document in Firestore
      const userDocRef = doc(firestore, "users", user.uid);
      await setDoc(userDocRef, {
        id: user.uid,
        email: user.email,
        displayName: fullName,
        role: role,
        photoURL: `https://picsum.photos/seed/${user.uid}/100/100`,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      });

      // If the user is a manager, create the role document in roles_manager
      if (role === 'manager') {
        const managerRoleDocRef = doc(firestore, "roles_manager", user.uid);
        await setDoc(managerRoleDocRef, { createdAt: new Date().toISOString() });
      }

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
      let description = error.message || "Could not create account.";

      if (error.code === 'auth/email-already-in-use') {
        description = "This email is already registered. Please go to the login page to sign in.";
      }

      toast({
        title: "Sign Up Failed",
        description: description,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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


      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center justify-between space-x-2">
          <div className="flex flex-col space-y-1">
            <Label htmlFor="manager-mode">Register as Manager</Label>
            <p className="text-sm text-muted-foreground italic">Requires a valid access code</p>
          </div>
          <Switch
            id="manager-mode"
            checked={isManagerSignup}
            onCheckedChange={setIsManagerSignup}
            disabled={loading}
          />
        </div>

        {isManagerSignup && (
          <div className="grid gap-2 mt-4 animate-in fade-in slide-in-from-top-1">
            <Label htmlFor="access-code">Manager Access Code</Label>
            <Input
              id="access-code"
              placeholder="Enter code"
              required={isManagerSignup}
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              disabled={loading}
            />
          </div>
        )}
      </div>
    </form>
  );
}
