"use client";
import { create } from "zustand";

type State = {
  mobileOpen: boolean;
  applicationFilter: string;
  opportunityFilter: string;
  saved: string[];
  setMobileOpen: (value: boolean) => void;
  setApplicationFilter: (value: string) => void;
  setOpportunityFilter: (value: string) => void;
  toggleSaved: (id: string) => void;
};

export const useMemberDashboardStore = create<State>((set) => ({
  mobileOpen: false,
  applicationFilter: "All",
  opportunityFilter: "All",
  saved: [],
  setMobileOpen: (mobileOpen) => set({ mobileOpen }),
  setApplicationFilter: (applicationFilter) => set({ applicationFilter }),
  setOpportunityFilter: (opportunityFilter) => set({ opportunityFilter }),
  toggleSaved: (id) =>
    set((state) => ({
      saved: state.saved.includes(id)
        ? state.saved.filter((value) => value !== id)
        : [...state.saved, id]
    }))
}));
