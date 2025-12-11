'use client';

import { useRouter } from 'next/navigation';
import { useArtistVerification } from '@/hooks/useArtistVerification';
import { QuickVerificationFlow } from './QuickVerificationFlow';

export function ArtistVerificationProvider() {
  const router = useRouter();
  const { showVerificationFlow, closeVerificationFlow } = useArtistVerification();

  const handleComplete = () => {
    closeVerificationFlow();
    router.push('/artist');
  };

  const handleCancel = () => {
    closeVerificationFlow();
  };

  if (!showVerificationFlow) return null;

  return (
    <QuickVerificationFlow
      onComplete={handleComplete}
      onCancel={handleCancel}
    />
  );
}