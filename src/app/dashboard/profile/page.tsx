'use client';

import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { redirect } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Local state for editable fields
  const [displayName, setDisplayName] = useState(user?.displayName || '');

  useEffect(() => {
    if (!user) {
      redirect('/');
    } else {
      setDisplayName(user.displayName);
    }
  }, [user]);

  if (!user) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPhotoURL = reader.result as string;
        updateUser({ photoURL: newPhotoURL });
        toast({
            title: "Photo Updated",
            description: "Your profile picture has been changed.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = () => {
    if (displayName.trim() === '') {
        toast({
            title: "Invalid Name",
            description: "Display name cannot be empty.",
            variant: "destructive",
        });
        return;
    }
    updateUser({ displayName });
    toast({
        title: "Profile Saved",
        description: "Your changes have been saved successfully.",
    });
  }

  return (
    <div className="flex-1 space-y-4">
      <h2 className="text-3xl font-bold tracking-tight font-headline">My Profile</h2>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>View and update your personal details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.photoURL} alt={user.displayName} />
              <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
            </Avatar>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                Change Photo
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoChange}
              className="hidden"
              accept="image/*"
            />
          </div>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" defaultValue={user.email} disabled />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" defaultValue={user.role.charAt(0).toUpperCase() + user.role.slice(1)} disabled />
            </div>
          </div>
          <Button onClick={handleSaveChanges}>Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  );
}
