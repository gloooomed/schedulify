export interface AppConfig {
  collegeName: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  groqApiKey: string;
  setupComplete: boolean;
}

const KEY = 'schedulify_config';

export const configStore = {
  get(): AppConfig | null {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      return JSON.parse(raw) as AppConfig;
    } catch {
      return null;
    }
  },

  set(config: Partial<AppConfig>): void {
    const existing = configStore.get() ?? {} as AppConfig;
    localStorage.setItem(KEY, JSON.stringify({ ...existing, ...config }));
  },

  clear(): void {
    localStorage.removeItem(KEY);
  },

  isReady(): boolean {
    const c = configStore.get();
    const hasLocalConfig = !!(c?.setupComplete && c.supabaseUrl && c.supabaseAnonKey);
    // In production (Vercel), env vars are baked in — all users skip setup wizard
    const hasEnvConfig = !!(
      import.meta.env.VITE_SUPABASE_URL &&
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );
    return hasLocalConfig || hasEnvConfig;
  },

  getCollegeName(): string {
    return configStore.get()?.collegeName ?? 'Schedulify';
  },
};
