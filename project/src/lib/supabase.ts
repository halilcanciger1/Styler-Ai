import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

// Environment variables with better error handling for deployment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log environment status for debugging (only in development)
if (import.meta.env.DEV) {
  console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Missing');
  console.log('Supabase Anon Key:', supabaseAnonKey ? 'Set' : 'Missing');
}

// Better error handling for missing environment variables
if (!supabaseUrl) {
  const error = 'Missing VITE_SUPABASE_URL environment variable';
  console.error(error);
  if (import.meta.env.PROD) {
    // In production, show user-friendly error
    throw new Error('Application configuration error. Please contact support.');
  }
  throw new Error(error);
}

if (!supabaseAnonKey) {
  const error = 'Missing VITE_SUPABASE_ANON_KEY environment variable';
  console.error(error);
  if (import.meta.env.PROD) {
    // In production, show user-friendly error
    throw new Error('Application configuration error. Please contact support.');
  }
  throw new Error(error);
}

// Create Supabase client with proper error handling
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'fashnai-web-app'
    }
  }
});

// Storage bucket names
export const STORAGE_BUCKETS = {
  MODELS: 'model-images',
  GARMENTS: 'garment-images',
  RESULTS: 'generated-results',
  AVATARS: 'avatars',
} as const;

// Helper functions for file uploads
export const uploadFile = async (
  bucket: string,
  path: string,
  file: File
): Promise<string> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error('File upload error:', error);
    throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const deleteFile = async (bucket: string, path: string): Promise<void> => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;
  } catch (error) {
    console.error('File deletion error:', error);
    throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Test Supabase connection
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
    console.log('Supabase connection test successful');
    return true;
  } catch (error) {
    console.error('Supabase connection test error:', error);
    return false;
  }
};