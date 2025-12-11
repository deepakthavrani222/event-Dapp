'use client';

import { AuthProvider } from "@/lib/context/AuthContext";
import { ArtistVerificationProvider } from "@/components/artist/ArtistVerificationProvider";
import { NotificationSystem } from "@/components/shared/NotificationSystem";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <ArtistVerificationProvider />
      <NotificationSystem />
    </AuthProvider>
  );
}
