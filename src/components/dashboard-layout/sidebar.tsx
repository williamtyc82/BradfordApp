
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell,
  Home,
  Package2,
  BookOpen,
  ClipboardList,
  AlertTriangle,
  Megaphone,
  Users,
} from 'lucide-react';

import { NavigationMenu } from './navigation-menu';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';

export function MainSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const logo = PlaceHolderImages.find((img) => img.id === 'logo');

  return (
    <div className="hidden border-r bg-card text-card-foreground md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-[80px] items-center border-b px-4 lg:px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
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
                <Package2 className="h-6 w-6 text-primary" />
                <span className="">Bradford Hub</span>
              </>
            )}
          </Link>
          {/* Bell Icon Removed */}
        </div>
        <div className="flex-1">
          <nav className="grid items-start gap-4 px-2 text-sm font-medium lg:px-4">
            <NavigationMenu />
          </nav>
        </div>



      </div>
    </div>
  );
}
