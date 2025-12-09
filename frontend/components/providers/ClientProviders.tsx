'use client';

import { AuthProvider } from "@/lib/context/AuthContext";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
