import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, AlertCircle, CheckCircle, Clock, ExternalLink } from 'lucide-react';
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

  // n8n Configuration
  const N8N_CONFIG = {
    webhookUrl: 'https://your-n8n-instance.com/webhook/fashion-ai-trigger',
    workflowId: 'Q0c9yGVeD1G8ZzsN',
    apiKey: 'fa-Dy6SV0P0ZUSd-TijrFG5cmW5khB3TLrkmNVNk',
  };

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
              toast.success('n8n workflow completed successfully!');
            } else if (newRecord.status === 'failed') {
              setIsExecuting(false);
              toast.error('n8n workflow execution failed');
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
      // Get generation data
      const { data: generation, error: genError } = await supabase
        .from('generations')
        .select('*')
        .eq('id', generationId)
        .single();

      if (genError) throw genError;

      // Create workflow execution record
      const { data: workflowExecution, error } = await supabase
        .from('workflow_executions')
        .insert({
          user_id: profile.id,
          generation_id: generationId,
          workflow_id: N8N_CONFIG.workflowId,
          status: 'running',
          input_data: {
            generation_id: generationId,
            model_image: generation.model_image_url,
            garment_image: generation.garment_image_url,
            category: generation.category,
            seed: generation.seed,
            samples: generation.samples,
            quality: generation.quality,
            timestamp: new Date().toISOString(),
          },
        })
        .select()
        .single();

      if (error) throw error;
      setExecution(workflowExecution);

      // Trigger n8n webhook
      console.log('Triggering n8n webhook:', N8N_CONFIG.webhookUrl);
      
      const webhookResponse = await fetch(N8N_CONFIG.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${N8N_CONFIG.apiKey}`,
        },
        body: JSON.stringify({
          generation_id: generationId,
          user_id: profile.id,
          model_image: generation.model_image_url,
          garment_image: generation.garment_image_url,
          category: generation.category,
          seed: generation.seed,
          samples: generation.samples,
          quality: generation.quality,
          webhook_trigger: true,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!webhookResponse.ok) {
        const errorText = await webhookResponse.text();
        throw new Error(`Webhook failed: ${webhookResponse.status} - ${errorText}`);
      }

      const webhookResult = await webhookResponse.json();
      console.log('Webhook triggered successfully:', webhookResult);

      // Update execution with webhook response
      await supabase
        .from('workflow_executions')
        .update({
          execution_id: webhookResult.execution_id || 'webhook-triggered',
          output_data: {
            webhook_response: webhookResult,
            triggered_at: new Date().toISOString(),
          },
        })
        .eq('id', workflowExecution.id);

      // Simulate progress updates while waiting for n8n to complete
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 10;
        });
      }, 1000);

      toast.success('n8n workflow triggered successfully!');

    } catch (error) {
      console.error('Error executing workflow:', error);
      setIsExecuting(false);
      
      if (execution) {
        await supabase
          .from('workflow_executions')
          .update({
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error',
            completed_at: new Date().toISOString(),
          })
          .eq('id', execution.id);
      }
      
      toast.error(`Workflow execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    if (!execution) return 'Ready to execute n8n workflow';
    
    switch (execution.status) {
      case 'completed':
        return 'n8n workflow completed successfully';
      case 'failed':
        return 'n8n workflow execution failed';
      case 'running':
        return 'n8n workflow is running...';
      case 'pending':
        return 'n8n workflow is pending';
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
        <h3 className="text-lg font-semibold text-stone-900">n8n Workflow Integration</h3>
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <a
            href="https://your-n8n-instance.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-stone-400 hover:text-stone-600"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
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
            {execution.execution_id && (
              <div className="flex justify-between text-sm">
                <span className="text-stone-600">Execution ID:</span>
                <span className="text-stone-900 font-mono">{execution.execution_id}</span>
              </div>
            )}
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

        {/* Configuration Display */}
        <div className="bg-blue-50 rounded-lg p-3">
          <h4 className="text-sm font-medium text-blue-900 mb-2">n8n Configuration</h4>
          <div className="text-xs text-blue-800 space-y-1">
            <div>Webhook: {N8N_CONFIG.webhookUrl}</div>
            <div>Workflow: {N8N_CONFIG.workflowId}</div>
            <div>API Key: {N8N_CONFIG.apiKey.substring(0, 15)}...</div>
          </div>
          <div className="text-xs text-orange-600 mt-2">
            ⚠️ Update webhook URL to your n8n instance
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          {!execution || execution.status === 'pending' ? (
            <button
              onClick={executeWorkflow}
              disabled={isExecuting}
              className="flex-1 bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-300 text-stone-800 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <Play className="w-4 h-4 mr-2" />
              {isExecuting ? 'Executing...' : 'Execute n8n Workflow'}
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