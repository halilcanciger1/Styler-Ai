import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

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
};

export const deleteFile = async (bucket: string, path: string): Promise<void> => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) throw error;
};

// Real-time subscriptions
export const subscribeToGenerations = (
  userId: string,
  callback: (payload: any) => void
) => {
  return supabase
    .channel('generations')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'generations',
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe();
};