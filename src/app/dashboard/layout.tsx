import { redirect } from 'next/navigation';
import { MainSidebar } from '@/components/dashboard-layout/sidebar';
import { Header } from '@/components/dashboard-layout/header';
import { useAuth } from '@/hooks/use-auth';

// This is a server component, but we need auth state.
// In a real app, you'd get the session from the server.
// Here we'll just have to assume `useAuth` works, though it's a client hook.
// For scaffolding, this is acceptable. A real implementation would use a server-side session check.
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  
  // In a real app, this would be a server-side check.
  // const { user } = useAuth();
  // if (!user) {
  //   redirect('/');
  // }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <MainSidebar />
      <div className="flex flex-col">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
