import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ProgressItem {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'done' | 'error';
  error?: string;
}

export type DeployStep = 'auth' | 'repo' | 'deploying' | 'success' | 'error';

export interface DeployState {
  // Auth
  token: string | null;
  username: string | null;
  rememberToken: boolean;

  // Dialog
  isOpen: boolean;
  step: DeployStep;

  // Repo
  repoSlug: string;
  branchName: string;
  baseBranch: string;

  // Progress
  progress: ProgressItem[];

  // Result
  prUrl: string | null;
  error: string | null;

  // Deploy in flight
  isDeploying: boolean;
}

export interface DeployActions {
  openDialog: () => void;
  closeDialog: () => void;
  setToken: (token: string, username: string) => void;
  clearToken: () => void;
  setRememberToken: (remember: boolean) => void;
  setStep: (step: DeployStep) => void;
  setRepoSlug: (slug: string) => void;
  setBranchName: (name: string) => void;
  setBaseBranch: (name: string) => void;
  initProgress: () => void;
  updateProgress: (id: string, update: Partial<ProgressItem>) => void;
  setSuccess: (prUrl: string) => void;
  setError: (error: string) => void;
  setIsDeploying: (v: boolean) => void;
  resetTransient: () => void;
}

export type DeployStore = DeployState & DeployActions;

const DEPLOY_STEPS: ProgressItem[] = [
  { id: 'verify', label: 'Verify repository access', status: 'pending' },
  { id: 'branch', label: 'Create branch', status: 'pending' },
  { id: 'upload-md', label: 'Upload workflow source', status: 'pending' },
  { id: 'upload-yml', label: 'Upload compiled YAML', status: 'pending' },
  { id: 'pr', label: 'Create pull request', status: 'pending' },
];

const initialTransient = {
  isOpen: false,
  step: 'auth' as DeployStep,
  repoSlug: '',
  branchName: '',
  baseBranch: 'main',
  progress: DEPLOY_STEPS.map((s) => ({ ...s })),
  prUrl: null,
  error: null,
  isDeploying: false,
};

export const useDeployStore = create<DeployStore>()(
  persist(
    (set) => ({
      // Auth
      token: null,
      username: null,
      rememberToken: false,

      // Transient
      ...initialTransient,

      openDialog: () =>
        set((state) => ({
          isOpen: true,
          // If we have a saved token, skip to repo step
          step: state.token ? 'repo' : 'auth',
          progress: DEPLOY_STEPS.map((s) => ({ ...s })),
          prUrl: null,
          error: null,
          isDeploying: false,
        })),

      closeDialog: () =>
        set({
          isOpen: false,
          progress: DEPLOY_STEPS.map((s) => ({ ...s })),
          prUrl: null,
          error: null,
          isDeploying: false,
        }),

      setToken: (token, username) => set({ token, username }),

      clearToken: () =>
        set({ token: null, username: null, rememberToken: false, step: 'auth' }),

      setRememberToken: (rememberToken) => set({ rememberToken }),

      setStep: (step) => set({ step }),

      setRepoSlug: (repoSlug) => set({ repoSlug }),

      setBranchName: (branchName) => set({ branchName }),

      setBaseBranch: (baseBranch) => set({ baseBranch }),

      initProgress: () =>
        set({ progress: DEPLOY_STEPS.map((s) => ({ ...s })) }),

      updateProgress: (id, update) =>
        set((state) => ({
          progress: state.progress.map((p) =>
            p.id === id ? { ...p, ...update } : p,
          ),
        })),

      setSuccess: (prUrl) => set({ prUrl, step: 'success', isDeploying: false }),

      setError: (error) => set({ error, step: 'error', isDeploying: false }),

      setIsDeploying: (isDeploying) => set({ isDeploying }),

      resetTransient: () =>
        set((state) => ({
          ...initialTransient,
          // Keep auth if remembered
          step: state.token ? 'repo' : 'auth',
        })),
    }),
    {
      name: 'gh-aw-deploy',
      partialize: (state) => {
        // Only persist token/username if rememberToken is true
        if (state.rememberToken) {
          return {
            token: state.token,
            username: state.username,
            rememberToken: state.rememberToken,
          };
        }
        return {};
      },
    },
  ),
);
