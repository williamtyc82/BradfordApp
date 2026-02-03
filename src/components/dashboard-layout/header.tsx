"use client";

import Link from 'next/link';
import {
  Home,
  Menu,
  Package2,
  Search,
  BookOpen,
  ClipboardList,
  AlertTriangle,
  Megaphone,
  Users,
} from 'lucide-react';
import { NavigationMenu } from './navigation-menu';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { UserNav } from './user-nav';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export function Header() {
  const logo = PlaceHolderImages.find((img) => img.id === 'logo');
  const pathname = usePathname();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');



  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!searchQuery.trim()) {
      toast({
        title: 'Search is empty',
        description: 'Please enter a term to search for.',
        variant: 'destructive',
      });
      return;
    }
    // In a real application, you would implement search logic here.
    // For now, we just show a toast notification.
    toast({
      title: 'Search Submitted',
      description: `You searched for: "${searchQuery}"`,
    });
  };


  return (
    <header className="flex h-[80px] items-center gap-4 border-b bg-card px-4 lg:px-6">
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col p-0">
          <SheetHeader className="flex h-[80px] flex-row items-center border-b px-4 lg:px-6">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <SheetDescription className="sr-only">Main navigation menu for the application.</SheetDescription>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-lg font-semibold"
              onClick={() => setIsSheetOpen(false)}
            >
              {logo ? (
                <Image
                  src={logo.imageUrl}
                  alt={logo.description}
                  width={150}
                  height={40}
                  className="object-contain"
                  data-ai-hint={logo.imageHint}
                />
              ) : (
                <>
                  <Package2 className="h-6 w-6" />
                  <span className="">Bradford Hub</span>
                </>
              )}
            </Link>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto">
            <nav className="grid items-start gap-6 p-4 text-base font-medium">
              <NavigationMenu onItemClick={() => setIsSheetOpen(false)} />
            </nav>
          </div>
        </SheetContent>
      </Sheet>
      <div className="w-full flex-1">
        {/* Search Bar Removed */}
      </div>
      <UserNav />
    </header>
  );
}
