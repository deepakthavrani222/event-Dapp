import { create } from 'zustand';

interface ArtistVerificationStore {
  showVerificationFlow: boolean;
  openVerificationFlow: () => void;
  closeVerificationFlow: () => void;
}

export const useArtistVerification = create<ArtistVerificationStore>((set) => ({
  showVerificationFlow: false,
  openVerificationFlow: () => set({ showVerificationFlow: true }),
  closeVerificationFlow: () => set({ showVerificationFlow: false }),
}));