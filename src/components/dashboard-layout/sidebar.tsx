"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell,
  Home,
  Package2,
  BookOpen,
  ClipboardList,
  Siren,
  Megaphone,
  Users,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';

export function MainSidebar() {
  const pathname = usePathname();
  const { user, switchRole } = useAuth();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/dashboard/training', label: 'Training', icon: BookOpen },
    { href: '/dashboard/quizzes', label: 'Quizzes', icon: ClipboardList, badge: 3 },
    { href: '/dashboard/incidents', label: 'Incidents', icon: Siren, badge: 2 },
    { href: '/dashboard/announcements', label: 'Announcements', icon: Megaphone },
  ];

  if (user?.role === 'manager') {
    navItems.push({ href: '#', label: 'Team Progress', icon: Users });
  }

  return (
    <div className="hidden border-r bg-card text-card-foreground md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Package2 className="h-6 w-6 text-primary" />
            <span className="">Bradford Hub</span>
          </Link>
          <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Toggle notifications</span>
          </Button>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
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
        <div className="mt-auto p-4">
           {/* Role Switcher for Demo */}
           <Card>
            <CardHeader className="p-2 pt-0 md:p-4">
              <CardTitle className="text-sm font-medium">Demo Controls</CardTitle>
            </CardHeader>
            <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
               <div className="flex items-center space-x-2">
                <Label htmlFor="role-switch">Manager Mode</Label>
                <Switch 
                  id="role-switch" 
                  checked={user?.role === 'manager'}
                  onCheckedChange={(checked) => switchRole(checked ? 'manager' : 'worker')}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
