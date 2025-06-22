import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

interface WorkflowExecution {
  id: string;
  workflow_id: string;
  execution_id: string | null;
  status: string;
  input_data: any;
  output_data: any;
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
}

interface WorkflowIntegrationProps {
  generationId: string;
  onStatusUpdate: (status: string, data?: any) => void;
}

const WorkflowIntegration: React.FC<WorkflowIntegrationProps> = ({ 
  generationId, 
  onStatusUpdate 
}) => {
  const { profile } = useAuthStore();
  const [execution, setExecution] = useState<WorkflowExecution | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (generationId) {
      fetchWorkflowExecution();
      subscribeToUpdates();
    }
  }, [generationId]);

  const fetchWorkflowExecution = async () => {
    try {
      const { data, error } = await supabase
        .from('workflow_executions')
        .select('*')
        .eq('generation_id', generationId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) setExecution(data);
    } catch (error) {
      console.error('Error fetching workflow execution:', error);
    }
  };

  const subscribeToUpdates = () => {
    const subscription = supabase
      .channel('workflow_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workflow_executions',
          filter: `generation_id=eq.${generationId}`,
        },
        (payload) => {
          const { new: newRecord, eventType } = payload;
          if (eventType === 'UPDATE' || eventType === 'INSERT') {
            setExecution(newRecord);
            onStatusUpdate(newRecord.status, newRecord.output_data);
            
            if (newRecord.status === 'completed') {
              setIsExecuting(false);
              setProgress(100);
              toast.success('Workflow completed successfully!');
            } else if (newRecord.status === 'failed') {
              setIsExecuting(false);
              toast.error('Workflow execution failed');
            }
          }
        }
      )
      .subscribe();

    return () => subscription.unsubscribe();
  };

  const executeWorkflow = async () => {
    if (!profile) return;

    setIsExecuting(true);
    setProgress(0);

    try {
      // Create workflow execution record
      const { data: workflowExecution, error } = await supabase
        .from('workflow_executions')
        .insert({
          user_id: profile.id,
          generation_id: generationId,
          workflow_id: 'Q0c9yGVeD1G8ZzsN', // From the n8n workflow
          status: 'running',
          input_data: {
            generation_id: generationId,
            timestamp: new Date().toISOString(),
          },
        })
        .select()
        .single();

      if (error) throw error;
      setExecution(workflowExecution);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 10;
        });
      }, 1000);

      // In a real implementation, you would trigger the n8n workflow here
      // For now, we'll simulate the workflow execution
      setTimeout(async () => {
        clearInterval(progressInterval);
        
        // Update execution with completion
        await supabase
          .from('workflow_executions')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            output_data: {
              result_urls: [
                'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg',
                'https://images.pexels.com/photos/1536620/pexels-photo-1536620.jpeg',
              ],
              processing_time: 5000,
            },
          })
          .eq('id', workflowExecution.id);

        setProgress(100);
        setIsExecuting(false);
      }, 8000);

    } catch (error) {
      console.error('Error executing workflow:', error);
      setIsExecuting(false);
      toast.error('Failed to execute workflow');
    }
  };

  const retryWorkflow = async () => {
    if (!execution) return;

    try {
      await supabase
        .from('workflow_executions')
        .update({
          status: 'pending',
          error_message: null,
          started_at: new Date().toISOString(),
        })
        .eq('id', execution.id);

      executeWorkflow();
    } catch (error) {
      console.error('Error retrying workflow:', error);
      toast.error('Failed to retry workflow');
    }
  };

  const getStatusIcon = () => {
    if (!execution) return <Clock className="w-5 h-5 text-stone-400" />;
    
    switch (execution.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'running':
        return <div className="w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-stone-400" />;
    }
  };

  const getStatusText = () => {
    if (!execution) return 'Ready to execute';
    
    switch (execution.status) {
      case 'completed':
        return 'Workflow completed successfully';
      case 'failed':
        return 'Workflow execution failed';
      case 'running':
        return 'Workflow is running...';
      case 'pending':
        return 'Workflow is pending';
      default:
        return 'Unknown status';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-stone-200 rounded-lg p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-stone-900">Workflow Execution</h3>
        {getStatusIcon()}
      </div>

      <div className="space-y-4">
        {/* Status */}
        <div>
          <p className="text-stone-600 text-sm mb-2">{getStatusText()}</p>
          {isExecuting && (
            <div className="w-full bg-stone-200 rounded-full h-2">
              <motion.div
                className="h-full bg-yellow-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          )}
        </div>

        {/* Error Message */}
        {execution?.error_message && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-800 text-sm">{execution.error_message}</p>
          </div>
        )}

        {/* Execution Details */}
        {execution && (
          <div className="bg-stone-50 rounded-lg p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-stone-600">Workflow ID:</span>
              <span className="text-stone-900 font-mono">{execution.workflow_id}</span>
            </div>
            {execution.started_at && (
              <div className="flex justify-between text-sm">
                <span className="text-stone-600">Started:</span>
                <span className="text-stone-900">
                  {new Date(execution.started_at).toLocaleString()}
                </span>
              </div>
            )}
            {execution.completed_at && (
              <div className="flex justify-between text-sm">
                <span className="text-stone-600">Completed:</span>
                <span className="text-stone-900">
                  {new Date(execution.completed_at).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2">
          {!execution || execution.status === 'pending' ? (
            <button
              onClick={executeWorkflow}
              disabled={isExecuting}
              className="flex-1 bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-300 text-stone-800 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <Play className="w-4 h-4 mr-2" />
              {isExecuting ? 'Executing...' : 'Execute Workflow'}
            </button>
          ) : execution.status === 'failed' ? (
            <button
              onClick={retryWorkflow}
              className="flex-1 bg-stone-800 hover:bg-stone-900 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Retry Workflow
            </button>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
};

export default WorkflowIntegration;