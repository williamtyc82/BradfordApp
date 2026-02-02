'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
  const { user } = useAuth();

  if (!user) {
    // Handled by layout, but good practice for a guard
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
                <div>
                    <Label htmlFor="email-notifications" className="font-semibold">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive updates and summaries via email.</p>
                </div>
                <Switch id="email-notifications" defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                    <Label htmlFor="push-notifications" className="font-semibold">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Get real-time alerts on your device.</p>
                </div>
                <Switch id="push-notifications" />
            </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize the look and feel of the application.</CardDescription>
            </CardHeader>
            <CardContent>
            {/* In a real app, you would have a theme toggle here */}
            <p className="text-sm text-muted-foreground">Dark mode and theme options are coming soon.</p>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Manage your account settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Button variant="outline">Change Password</Button>
                <Separator />
                <div>
                    <Button variant="destructive">Delete Account</Button>
                    <p className="text-xs text-muted-foreground pt-2">
                        This action is permanent and cannot be undone. All your data will be removed.
                    </p>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
