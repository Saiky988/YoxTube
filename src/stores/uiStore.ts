import { create } from 'zustand';

interface UIState {
  isMobileSearchOpen: boolean;
  setMobileSearchOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isMobileSearchOpen: false,
  setMobileSearchOpen: (open) => set({ isMobileSearchOpen: open }),
  isAuthModalOpen: false,
  authModalMode: 'login',
  openAuthModal: (mode = 'login') => set({ isAuthModalOpen: true, authModalMode: mode }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
}));
