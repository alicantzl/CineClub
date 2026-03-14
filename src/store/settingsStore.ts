import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SettingsState = Record<string, never>;

export const useSettingsStore = create<SettingsState>()(
  persist(
    () => ({
      // Add other settings here in the future
    }),
    {
      name: 'cineclub-settings',
    }
  )
);
