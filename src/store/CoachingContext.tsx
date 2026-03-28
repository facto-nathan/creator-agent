"use client";

import { CoachingState, useCoachingStore } from "@/store/useCoachingStore";
import { createContext, ReactNode, useContext } from "react";

const CoachingContext = createContext<CoachingState | null>(null);

export function CoachingProvider({ children }: { children: ReactNode }) {
  const store = useCoachingStore();
  return (
    <CoachingContext.Provider value={store}>
      {children}
    </CoachingContext.Provider>
  );
}

export function useCoaching() {
  const context = useContext(CoachingContext);
  if (!context) {
    throw new Error("useCoaching must be used within CoachingProvider");
  }
  return context;
}
