'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { useTheme } from '@/lib/context/ThemeContext';

export default function LoginPage() {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Hide header on login page
  useEffect(() => {
    const header = document.querySelector('header');
    if (header) {
      header.style.display = 'none';
    }
    return () => {
      if (header) {
        header.style.display = '';
      }
    };
  }, []);

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
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#0A0A0A]' : 'bg-[#FAFAFA]'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0A0A0A]' : 'bg-[#FAFAFA]'}`}>
      <div className="min-h-screen flex items-center justify-center p-4">
        <LoginForm />
      </div>
    </div>
  );
}
