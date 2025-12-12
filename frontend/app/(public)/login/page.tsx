'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { Footer } from '@/components/shared/footer';

export default function LoginPage() {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      // Check for redirect URL first
      const redirectUrl = searchParams.get('redirect');
      if (redirectUrl) {
        router.push(decodeURIComponent(redirectUrl));
        return;
      }

      // Otherwise redirect based on role
      const roleRoutes: Record<string, string> = {
        BUYER: '/buyer',
        ORGANIZER: '/organizer',
        ADMIN: '/admin',
        PROMOTER: '/promoter',
        INSPECTOR: '/inspector',
        VENUE_OWNER: '/venue-owner',
        ARTIST: '/artist',
        RESELLER: '/reseller',
      };

      const route = roleRoutes[user.role] || '/buyer';
      router.push(route);
    }
  }, [isAuthenticated, user, loading, router, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="min-h-screen flex items-center justify-center p-4">
        <LoginForm />
      </div>
      <Footer />
    </div>
  );
}
