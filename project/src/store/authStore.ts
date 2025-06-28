import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { Database } from '../types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  fetchProfile: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        set({ user: session.user, isAuthenticated: true });
        await get().fetchProfile();
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      set({ isLoading: false });
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        set({ user: session.user, isAuthenticated: true });
        await get().fetchProfile();
      } else {
        set({ user: null, profile: null, isAuthenticated: false });
      }
    });
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      set({ user: data.user, isAuthenticated: true });
      await get().fetchProfile();
    } catch (error) {
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signup: async (email: string, password: string, name: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        set({ user: data.user, isAuthenticated: true });
        
        // Wait a moment for the trigger to create the profile
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Fetch the profile that should have been created by the trigger
        await get().fetchProfile();
      }
    } catch (error) {
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      set({ user: null, profile: null, isAuthenticated: false });
    } catch (error) {
      throw error;
    }
  },

  fetchProfile: async () => {
    const { user } = get();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        set({ profile: data });
      } else {
        // If no profile exists, the trigger might not have fired yet
        // Wait a bit and try again
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const { data: retryData, error: retryError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
          
        if (retryError) throw retryError;
        if (retryData) {
          set({ profile: retryData });
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  },

  updateProfile: async (updates: Partial<Profile>) => {
    const { user, profile } = get();
    if (!user || !profile) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      set({ profile: data });
    } catch (error) {
      throw error;
    }
  },
}));