"use client";

import { create } from "zustand";

type PublicUiState = {
  mobileMenuOpen: boolean;
  galleryFilter: string;
  teamFilter: string;
  castingFilter: string;
  talentFilter: string;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  setGalleryFilter: (value: string) => void;
  setTeamFilter: (value: string) => void;
  setCastingFilter: (value: string) => void;
  setTalentFilter: (value: string) => void;
};

export const usePublicUiStore = create<PublicUiState>((set) => ({
  mobileMenuOpen: false,
  galleryFilter: "All",
  teamFilter: "Core Team",
  castingFilter: "All",
  talentFilter: "All",
  toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
  closeMobileMenu: () => set({ mobileMenuOpen: false }),
  setGalleryFilter: (galleryFilter) => set({ galleryFilter }),
  setTeamFilter: (teamFilter) => set({ teamFilter }),
  setCastingFilter: (castingFilter) => set({ castingFilter }),
  setTalentFilter: (talentFilter) => set({ talentFilter }),
}));
