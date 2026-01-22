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
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { UserNav } from './user-nav';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';

export function Header() {
  const logo = PlaceHolderImages.find((img) => img.id === 'logo');
  return (
    <header className="flex items-center gap-4 border-b bg-card px-4 lg:px-6 py-7">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col p-0">
          <div className="flex items-center border-b px-4 lg:px-6 py-7">
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
          </div>
          <div className="flex-1 overflow-y-auto">
            <nav className="grid items-start p-4 text-base font-medium">
              <Link
                href="/dashboard"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                href="/dashboard/training"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <BookOpen className="h-4 w-4" />
                Training
              </Link>
              <Link
                href="/dashboard/quizzes"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <ClipboardList className="h-4 w-4" />
                Quizzes
              </Link>
              <Link
                href="/dashboard/incidents"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <AlertTriangle className="h-4 w-4" />
                Incidents
              </Link>
              <Link
                href="/dashboard/announcements"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Megaphone className="h-4 w-4" />
                Announcements
              </Link>
            </nav>
          </div>
        </SheetContent>
      </Sheet>
      <div className="w-full flex-1">
        <form>
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
