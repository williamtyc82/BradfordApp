'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const { firestore, auth } = useFirebase();
  const { toast } = useToast();
  const [isResetting, setIsResetting] = useState(false);

  // Live settings from Firestore
  const userRef = useMemoFirebase(() => {
    return (firestore && user) ? doc(firestore, 'users', user.id) : null;
  }, [firestore, user]);

  const { data: userSettings } = useDoc(userRef);

  const handleEmailToggle = async (checked: boolean) => {
    if (!userRef) return;
    try {
      await updateDoc(userRef, { emailNotifications: checked });
      toast({ title: "Settings updated", description: `Email notifications ${checked ? 'enabled' : 'disabled'}.` });
    } catch (e) {
      toast({ title: "Error", description: "Failed to update settings.", variant: 'destructive' });
    }
  };

  const handlePasswordReset = async () => {
    if (!auth || !user?.email) return;
    setIsResetting(true);
    try {
      await sendPasswordResetEmail(auth, user.email);
      toast({
        title: "Email Sent",
        description: `We've sent a password reset link to ${user.email}.`
      });
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "Failed to send reset email.",
        variant: 'destructive'
      });
    } finally {
      setIsResetting(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex-1 space-y-4">
      <h2 className="text-3xl font-bold tracking-tight font-headline">Settings</h2>
      <div className="space-y-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Manage how you receive notifications.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications" className="font-semibold">Email Notifications</Label>
                <p className="text-sm text-muted-foreground mr-4">Receive updates and summaries via registered email.</p>
              </div>
              <Switch
                id="email-notifications"
                checked={userSettings?.emailNotifications ?? false}
                onCheckedChange={handleEmailToggle}
                disabled={!userSettings} // Disable until loaded
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance Section Removed as per request */}

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Manage your account settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label className="font-semibold">Password</Label>
              <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/20">
                <div className="text-sm text-muted-foreground">
                  Update your password securely via email verification.
                </div>
                <Button variant="outline" onClick={handlePasswordReset} disabled={isResetting}>
                  {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Change Password
                </Button>
              </div>
            </div>

            {/* Delete Account Removed as per request */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
