import { create } from 'zustand';
import { supabase, uploadFile, STORAGE_BUCKETS } from '../lib/supabase';
import { Database } from '../types/database';
import { RealtimeChannel } from '@supabase/supabase-js';

type Generation = Database['public']['Tables']['generations']['Row'];
type GenerationInsert = Database['public']['Tables']['generations']['Insert'];

interface GenerationState {
  generations: Generation[];
  currentRequest: Partial<GenerationInsert> | null;
  isGenerating: boolean;
  generationProgress: number;
  realtimeChannel: RealtimeChannel | null;
  setCurrentRequest: (request: Partial<GenerationInsert>) => void;
  generateImage: () => Promise<void>;
  fetchGenerations: () => Promise<void>;
  updateGeneration: (id: string, updates: Partial<Generation>) => Promise<void>;
  deleteGeneration: (id: string) => Promise<void>;
  setGenerationProgress: (progress: number) => void;
  subscribeToRealtime: (userId: string) => void;
  unsubscribeFromRealtime: () => void;
}

export const useGenerationStore = create<GenerationState>((set, get) => ({
  generations: [],
  currentRequest: null,
  isGenerating: false,
  generationProgress: 0,
  realtimeChannel: null,

  setCurrentRequest: (request: Partial<GenerationInsert>) => {
    set({ currentRequest: request });
  },

  generateImage: async () => {
    const { currentRequest } = get();
    if (!currentRequest || !currentRequest.model_image_url || !currentRequest.garment_image_url) {
      throw new Error('Model and garment images are required');
    }

    set({ isGenerating: true, generationProgress: 0 });

    try {
      // Insert generation record
      const { data: generation, error } = await supabase
        .from('generations')
        .insert({
          ...currentRequest,
          status: 'processing',
        } as GenerationInsert)
        .select()
        .single();

      if (error) throw error;

      // Update local state immediately
      set(state => ({
        generations: [generation, ...state.generations]
      }));

      // Simulate API call to fashion AI service
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model_image: currentRequest.model_image_url,
          garment_image: currentRequest.garment_image_url,
          category: currentRequest.category,
          seed: currentRequest.seed,
          samples: currentRequest.samples,
          quality: currentRequest.quality,
        }),
      });

      if (!response.ok) {
        throw new Error('Generation failed');
      }

      const result = await response.json();

      // Update generation with results
      await get().updateGeneration(generation.id, {
        status: 'completed',
        result_urls: result.images,
        processing_time: result.processing_time,
      });

    } catch (error) {
      set({ isGenerating: false, generationProgress: 0 });
      throw error;
    }

    set({ isGenerating: false, generationProgress: 0 });
  },

  fetchGenerations: async () => {
    try {
      const { data, error } = await supabase
        .from('generations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ generations: data || [] });
    } catch (error) {
      console.error('Error fetching generations:', error);
    }
  },

  updateGeneration: async (id: string, updates: Partial<Generation>) => {
    try {
      const { data, error } = await supabase
        .from('generations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        generations: state.generations.map(gen =>
          gen.id === id ? data : gen
        )
      }));
    } catch (error) {
      console.error('Error updating generation:', error);
      throw error;
    }
  },

  deleteGeneration: async (id: string) => {
    try {
      const { error } = await supabase
        .from('generations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        generations: state.generations.filter(gen => gen.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting generation:', error);
      throw error;
    }
  },

  setGenerationProgress: (progress: number) => {
    set({ generationProgress: progress });
  },

  subscribeToRealtime: (userId: string) => {
    const { realtimeChannel } = get();
    
    // If there's already a channel, unsubscribe first
    if (realtimeChannel) {
      realtimeChannel.unsubscribe();
    }

    // Create a new channel instance
    const channel = supabase.channel(`generations-${userId}`);
    
    // Set up the channel listener
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'generations',
        filter: `user_id=eq.${userId}`,
      },
      (payload: any) => {
        const { eventType, new: newRecord, old: oldRecord } = payload;

        set(state => {
          let updatedGenerations = [...state.generations];

          switch (eventType) {
            case 'INSERT':
              // Only add if not already in the list
              if (!updatedGenerations.find(g => g.id === newRecord.id)) {
                updatedGenerations = [newRecord, ...updatedGenerations];
              }
              break;
            case 'UPDATE':
              updatedGenerations = updatedGenerations.map(gen =>
                gen.id === newRecord.id ? newRecord : gen
              );
              break;
            case 'DELETE':
              updatedGenerations = updatedGenerations.filter(gen =>
                gen.id !== oldRecord.id
              );
              break;
          }

          return { generations: updatedGenerations };
        });
      }
    );

    // Subscribe to the channel
    channel.subscribe();

    // Store the channel instance
    set({ realtimeChannel: channel });
  },

  unsubscribeFromRealtime: () => {
    const { realtimeChannel } = get();
    if (realtimeChannel) {
      realtimeChannel.unsubscribe();
      set({ realtimeChannel: null });
    }
  },
}));