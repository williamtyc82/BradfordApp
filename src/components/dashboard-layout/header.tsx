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

export function Header() {
  const logo = PlaceHolderImages.find((img) => img.id === 'logo');
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/dashboard/training', label: 'Training', icon: BookOpen },
    { href: '/dashboard/quizzes', label: 'Quizzes', icon: ClipboardList, badge: 3 },
    { href: '/dashboard/incidents', label: 'Incidents', icon: AlertTriangle, badge: 2 },
    { href: '/dashboard/announcements', label: 'Announcements', icon: Megaphone },
  ];

  if (user?.role === 'manager') {
    navItems.push({ href: '/dashboard/team-progress', label: 'Team Progress', icon: Users });
  }

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // In a real application, you would implement search logic here.
    // For now, we just prevent the page from reloading.
    console.log("Search submitted");
  };


  return (
    <header className="flex h-[80px] items-center gap-4 border-b bg-card px-4 lg:px-6">
      <Sheet>
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
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                  pathname === item.href && 'bg-muted text-primary'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                {item.badge && (
                  <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            ))}
            </nav>
          </div>
        </SheetContent>
      </Sheet>
      <div className="w-full flex-1">
        <form onSubmit={handleSearchSubmit}>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
            />
          </div>
        </form>
      </div>
      <UserNav />
    </header>
  );
}
