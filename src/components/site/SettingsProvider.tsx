"use client";

import { createContext, useContext, type ReactNode } from "react";
import { DEFAULT_SETTINGS, type SiteSettings } from "@/lib/site-settings";

const SettingsContext = createContext<SiteSettings>(DEFAULT_SETTINGS);

// The site layout loads settings on the server once and hands them to every client component here.
export function SettingsProvider({ value, children }: { value: SiteSettings; children: ReactNode }) {
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SiteSettings {
  return useContext(SettingsContext);
}

export function useLabels(): SiteSettings["labels"] {
  return useContext(SettingsContext).labels;
}
