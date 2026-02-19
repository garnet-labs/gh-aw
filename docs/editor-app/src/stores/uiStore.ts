import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UIState {
  // Panel visibility
  sidebarOpen: boolean;
  propertiesPanelOpen: boolean;
  yamlPreviewOpen: boolean;

  // Theme
  theme: 'light' | 'dark' | 'auto';

  // Disclosure level
  disclosureLevel: 1 | 2 | 3;

  // Onboarding
  hasSeenOnboarding: boolean;
  guidedTourStep: number | null;

  // Auto-compile toggle
  autoCompile: boolean;
}

export interface UIActions {
  toggleSidebar: () => void;
  togglePropertiesPanel: () => void;
  toggleYamlPreview: () => void;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  setDisclosureLevel: (level: 1 | 2 | 3) => void;
  setHasSeenOnboarding: (seen: boolean) => void;
  setGuidedTourStep: (step: number | null) => void;
  setAutoCompile: (enabled: boolean) => void;
}

export type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      propertiesPanelOpen: true,
      yamlPreviewOpen: false,
      theme: 'auto',
      disclosureLevel: 1,
      hasSeenOnboarding: false,
      guidedTourStep: null,
      autoCompile: true,

      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      togglePropertiesPanel: () => set((s) => ({ propertiesPanelOpen: !s.propertiesPanelOpen })),
      toggleYamlPreview: () => set((s) => ({ yamlPreviewOpen: !s.yamlPreviewOpen })),
      setTheme: (theme) => set({ theme }),
      setDisclosureLevel: (disclosureLevel) => set({ disclosureLevel }),
      setHasSeenOnboarding: (hasSeenOnboarding) => set({ hasSeenOnboarding }),
      setGuidedTourStep: (guidedTourStep) => set({ guidedTourStep }),
      setAutoCompile: (autoCompile) => set({ autoCompile }),
    }),
    {
      name: 'workflow-editor-ui',
    }
  )
);
