import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, ArrowRight, Sparkles, Settings, Fuel as Queue } from 'lucide-react';
import toast from 'react-hot-toast';
import ImageUpload from '../components/Studio/ImageUpload';
import CategorySelector from '../components/Studio/CategorySelector';
import AdvancedControls from '../components/Studio/AdvancedControls';
import ResultsPanel from '../components/Studio/ResultsPanel';
import TemplateGallery from '../components/Studio/TemplateGallery';
import GenerationHistory from '../components/Studio/GenerationHistory';
import WorkflowIntegration from '../components/Studio/WorkflowIntegration';
import QueueManager from '../components/Studio/QueueManager';
import ProgressBar from '../components/Layout/ProgressBar';
import { useGenerationStore } from '../store/generationStore';
import { useAuthStore } from '../store/authStore';
import { supabase, uploadFile, STORAGE_BUCKETS } from '../lib/supabase';

const Studio: React.FC = () => {
  const [modelImage, setModelImage] = useState<string | null>(null);
  const [garmentImage, setGarmentImage] = useState<string | null>(null);
  const [category, setCategory] = useState<'tops' | 'bottoms' | 'full-body'>('tops');
  const [isAdvancedExpanded, setIsAdvancedExpanded] = useState(false);
  const [isTemplateGalleryOpen, setIsTemplateGalleryOpen] = useState(false);
  const [showQueueManager, setShowQueueManager] = useState(false);
  const [samples, setSamples] = useState(1);
  const [seed, setSeed] = useState<number | undefined>(undefined);
  const [quality, setQuality] = useState<'performance' | 'balanced' | 'quality'>('balanced');
  const [currentGenerationId, setCurrentGenerationId] = useState<string | null>(null);

  const { generateImage, isGenerating, generationProgress, setCurrentRequest } = useGenerationStore();
  const { profile, updateProfile } = useAuthStore();

  const handleGenerate = async () => {
    if (!modelImage || !garmentImage) {
      toast.error('Please upload both model and garment images');
      return;
    }

    if (!profile || profile.credits < 1) {
      toast.error('Insufficient credits. Please upgrade your plan.');
      return;
    }

    try {
      // Upload images to Supabase storage
      const modelFile = await fetch(modelImage).then(r => r.blob());
      const garmentFile = await fetch(garmentImage).then(r => r.blob());

      const modelFileName = `${profile.id}-model-${Date.now()}.jpg`;
      const garmentFileName = `${profile.id}-garment-${Date.now()}.jpg`;

      const [modelUrl, garmentUrl] = await Promise.all([
        uploadFile(STORAGE_BUCKETS.MODELS, modelFileName, new File([modelFile], modelFileName)),
        uploadFile(STORAGE_BUCKETS.GARMENTS, garmentFileName, new File([garmentFile], garmentFileName))
      ]);

      // Create generation record
      const { data: generation, error } = await supabase
        .from('generations')
        .insert({
          user_id: profile.id,
          model_image_url: modelUrl,
          garment_image_url: garmentUrl,
          category,
          seed,
          samples,
          quality,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentGenerationId(generation.id);

      // Add to queue
      await supabase
        .from('generation_queue')
        .insert({
          user_id: profile.id,
          generation_id: generation.id,
          priority: 0,
          status: 'queued',
          metadata: {
            model_image_url: modelUrl,
            garment_image_url: garmentUrl,
            category,
            seed,
            samples,
            quality,
          },
        });

      toast.success('Generation added to queue successfully!');
      
      // Deduct credits
      await updateProfile({ credits: profile.credits - 1 });

    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Generation failed. Please try again.');
    }
  };

  const handleTemplateSelect = (template: any) => {
    setModelImage(template.modelImage);
    setGarmentImage(template.garmentImage);
    setCategory(template.category);
    toast.success(`Template "${template.name}" loaded successfully!`);
  };

  const handleWorkflowStatusUpdate = (status: string, data?: any) => {
    if (status === 'completed' && data?.result_urls) {
      toast.success('AI generation completed successfully!');
    } else if (status === 'failed') {
      toast.error('AI generation failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-900 mb-2">AI Fashion Studio</h1>
            <p className="text-stone-600">Create stunning fashion visualizations with AI</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowQueueManager(!showQueueManager)}
              className="flex items-center text-stone-600 hover:text-stone-800 font-medium transition-colors"
            >
              <Queue className="w-4 h-4 mr-2" />
              Queue Manager
            </button>
            <button
              onClick={() => setIsTemplateGalleryOpen(true)}
              className="flex items-center text-yellow-600 hover:text-yellow-700 font-medium transition-colors"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Explore Templates
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <ProgressBar
              progress={generationProgress}
              status="Generating your fashion visualization..."
            />
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <ImageUpload
                title="Select Model"
                image={modelImage}
                onImageUpload={setModelImage}
                onImageRemove={() => setModelImage(null)}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <ImageUpload
                title="Select Garment"
                image={garmentImage}
                onImageUpload={setGarmentImage}
                onImageRemove={() => setGarmentImage(null)}
              />
            </motion.div>
          </div>

          {/* Generate Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <button
              onClick={handleGenerate}
              disabled={!modelImage || !garmentImage || isGenerating}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 disabled:from-stone-300 disabled:to-stone-400 disabled:cursor-not-allowed text-stone-800 font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none"
            >
              <Play className="w-5 h-5 mr-2" />
              {isGenerating ? 'Generating...' : `Run (~${quality === 'performance' ? '3' : quality === 'balanced' ? '5' : '8'}s)`}
            </button>
          </motion.div>

          {/* Category Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <CategorySelector category={category} onChange={setCategory} />
          </motion.div>

          {/* Advanced Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <AdvancedControls
              isExpanded={isAdvancedExpanded}
              onToggle={() => setIsAdvancedExpanded(!isAdvancedExpanded)}
              samples={samples}
              onSamplesChange={setSamples}
              seed={seed}
              onSeedChange={setSeed}
              quality={quality}
              onQualityChange={setQuality}
            />
          </motion.div>

          {/* Workflow Integration */}
          {currentGenerationId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <WorkflowIntegration
                generationId={currentGenerationId}
                onStatusUpdate={handleWorkflowStatusUpdate}
              />
            </motion.div>
          )}
        </div>

        {/* Right Column - Results & History */}
        <div className="space-y-6">
          {showQueueManager ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <QueueManager />
            </motion.div>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <ResultsPanel />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <GenerationHistory />
              </motion.div>
            </>
          )}
        </div>
      </div>

      {/* Template Gallery Modal */}
      <TemplateGallery
        isOpen={isTemplateGalleryOpen}
        onClose={() => setIsTemplateGalleryOpen(false)}
        onSelectTemplate={handleTemplateSelect}
      />
    </div>
  );
};

export default Studio;