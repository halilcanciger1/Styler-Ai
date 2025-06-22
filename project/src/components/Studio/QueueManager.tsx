import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Play, Pause, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { formatDistanceToNow } from 'date-fns';

interface QueueItem {
  id: string;
  generation_id: string;
  priority: number;
  retry_count: number;
  max_retries: number;
  status: string;
  scheduled_at: string;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
  metadata: any;
  generation: {
    category: string;
    model_image_url: string;
    garment_image_url: string;
  };
}

const QueueManager: React.FC = () => {
  const { profile } = useAuthStore();
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchQueueItems();
      subscribeToQueueUpdates();
    }
  }, [profile]);

  const fetchQueueItems = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('generation_queue')
        .select(`
          *,
          generation:generations(
            category,
            model_image_url,
            garment_image_url
          )
        `)
        .eq('user_id', profile.id)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;
      setQueueItems(data || []);
    } catch (error) {
      console.error('Error fetching queue items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToQueueUpdates = () => {
    if (!profile) return;

    const subscription = supabase
      .channel('queue_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'generation_queue',
          filter: `user_id=eq.${profile.id}`,
        },
        () => {
          fetchQueueItems();
        }
      )
      .subscribe();

    return () => subscription.unsubscribe();
  };

  const updateQueueItem = async (id: string, updates: Partial<QueueItem>) => {
    try {
      const { error } = await supabase
        .from('generation_queue')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      fetchQueueItems();
    } catch (error) {
      console.error('Error updating queue item:', error);
    }
  };

  const deleteQueueItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('generation_queue')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchQueueItems();
    } catch (error) {
      console.error('Error deleting queue item:', error);
    }
  };

  const retryQueueItem = async (id: string) => {
    await updateQueueItem(id, {
      status: 'queued',
      retry_count: 0,
      error_message: null,
      scheduled_at: new Date().toISOString(),
    });
  };

  const pauseQueueItem = async (id: string) => {
    await updateQueueItem(id, { status: 'paused' });
  };

  const resumeQueueItem = async (id: string) => {
    await updateQueueItem(id, { status: 'queued' });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'processing':
        return <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-stone-500" />;
      default:
        return <Clock className="w-4 h-4 text-stone-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'paused':
        return 'bg-stone-100 text-stone-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-stone-200 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-stone-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-stone-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-stone-200">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-stone-900">Generation Queue</h3>
          <span className="text-sm text-stone-600">
            {queueItems.filter(item => item.status === 'queued').length} pending
          </span>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        <AnimatePresence>
          {queueItems.length === 0 ? (
            <div className="p-8 text-center">
              <Clock className="w-8 h-8 text-stone-400 mx-auto mb-3" />
              <h4 className="font-medium text-stone-900 mb-2">No items in queue</h4>
              <p className="text-stone-600 text-sm">Your generation queue is empty</p>
            </div>
          ) : (
            queueItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 border-b border-stone-100 last:border-b-0 hover:bg-stone-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  {/* Preview */}
                  <div className="w-12 h-12 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.generation.model_image_url}
                      alt="Model"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      {getStatusIcon(item.status)}
                      <span className="text-sm font-medium text-stone-900 capitalize">
                        {item.generation.category}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                      {item.priority > 0 && (
                        <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                          Priority: {item.priority}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-xs text-stone-500">
                      <span>
                        Scheduled {formatDistanceToNow(new Date(item.scheduled_at), { addSuffix: true })}
                      </span>
                      {item.retry_count > 0 && (
                        <span>Retries: {item.retry_count}/{item.max_retries}</span>
                      )}
                    </div>

                    {item.error_message && (
                      <p className="text-xs text-red-600 mt-1 truncate">
                        {item.error_message}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-1">
                    {item.status === 'failed' && (
                      <button
                        onClick={() => retryQueueItem(item.id)}
                        className="p-1.5 text-stone-400 hover:text-green-600 rounded transition-colors"
                        title="Retry"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    )}
                    
                    {item.status === 'queued' && (
                      <button
                        onClick={() => pauseQueueItem(item.id)}
                        className="p-1.5 text-stone-400 hover:text-yellow-600 rounded transition-colors"
                        title="Pause"
                      >
                        <Pause className="w-4 h-4" />
                      </button>
                    )}
                    
                    {item.status === 'paused' && (
                      <button
                        onClick={() => resumeQueueItem(item.id)}
                        className="p-1.5 text-stone-400 hover:text-green-600 rounded transition-colors"
                        title="Resume"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => deleteQueueItem(item.id)}
                      className="p-1.5 text-stone-400 hover:text-red-600 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default QueueManager;