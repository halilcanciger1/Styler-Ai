import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, ArrowRight, Sparkles, Settings, Fuel as Queue, User, Shirt, WaypointsIcon as Pants, ChevronDown, Info, Shuffle } from 'lucide-react';
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  const { updateGeneration, fetchGenerations } = useGenerationStore();
  const { profile, updateProfile } = useAuthStore();

  // Fashion AI API Configuration
  const FASHION_AI_CONFIG = {
    baseUrl: 'https://api.fashn.ai/v1',
    apiKey: 'fa-Dy6SV0P0ZUSd-TijrFG5cmW5khB3TLrkmNVNk',
  };

  // Call Fashion AI API
  const callFashionAI = async (modelImageUrl: string, garmentImageUrl: string) => {
    const requestBody = {
      model_image: modelImageUrl,
      garment_image: garmentImageUrl,
      category: category,
      ...(seed && { seed }),
      ...(samples > 1 && { samples }),
      ...(quality !== 'balanced' && { quality }),
    };

    console.log('Calling Fashion AI API with:', requestBody);

    const response = await fetch(`${FASHION_AI_CONFIG.baseUrl}/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FASHION_AI_CONFIG.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Fashion AI API failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Fashion AI API response:', result);
    return result;
  };

  // Poll Fashion AI status
  const pollFashionAIStatus = async (jobId: string) => {
    const maxAttempts = 60; // 5 minutes max
    let attempts = 0;

    while (attempts < maxAttempts) {
      attempts++;
      setStatusMessage(`Checking status... (${attempts}/${maxAttempts})`);
      setGenerationProgress(50 + (attempts / maxAttempts) * 40);

      const response = await fetch(`${FASHION_AI_CONFIG.baseUrl}/status/${jobId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${FASHION_AI_CONFIG.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`Status check failed: ${response.status} - ${errorText}`);
        
        // Continue polling for temporary errors
        if (response.status >= 500 || response.status === 429) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        } else {
          throw new Error(`Status check failed: ${response.status} - ${errorText}`);
        }
      }

      const statusData = await response.json();
      console.log('Status check response:', statusData);

      if (statusData.status === 'completed') {
        return statusData;
      }

      if (statusData.status === 'failed' || statusData.status === 'error') {
        throw new Error(`Generation failed: ${statusData.error || 'Unknown error'}`);
      }

      // Wait 1 second before next check
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    throw new Error('Generation timeout - the process took longer than expected');
  };

  // Main generation handler
  const handleGenerate = async () => {
    if (!modelImage || !garmentImage) {
      toast.error('Please upload both model and garment images');
      return;
    }

    if (!profile || profile.credits < 1) {
      toast.error('Insufficient credits. Please upgrade your plan.');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    setStatusMessage('Preparing images...');

    try {
      // Step 1: Upload images to Supabase storage
      console.log('Starting image upload process...');
      const modelFile = await fetch(modelImage).then(r => r.blob());
      const garmentFile = await fetch(garmentImage).then(r => r.blob());

      const modelFileName = `${profile.id}-model-${Date.now()}.jpg`;
      const garmentFileName = `${profile.id}-garment-${Date.now()}.jpg`;

      setGenerationProgress(10);
      setStatusMessage('Uploading images...');

      const [modelUrl, garmentUrl] = await Promise.all([
        uploadFile(STORAGE_BUCKETS.MODELS, modelFileName, new File([modelFile], modelFileName, { type: modelFile.type })),
        uploadFile(STORAGE_BUCKETS.GARMENTS, garmentFileName, new File([garmentFile], garmentFileName, { type: garmentFile.type }))
      ]);

      console.log('Images uploaded:', { modelUrl, garmentUrl });

      // Step 2: Create generation record in database
      setGenerationProgress(20);
      setStatusMessage('Creating generation record...');

      const { data: generation, error: insertError } = await supabase
        .from('generations')
        .insert({
          user_id: profile.id,
          model_image_url: modelUrl,
          garment_image_url: garmentUrl,
          category,
          seed,
          samples,
          quality,
          status: 'processing',
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(`Database error: ${insertError.message}`);
      }

      setCurrentGenerationId(generation.id);
      console.log('Generation record created:', generation);

      // Step 3: Call Fashion AI API
      setGenerationProgress(30);
      setStatusMessage('Calling Fashion AI service...');

      const fashionAIResult = await callFashionAI(modelUrl, garmentUrl);
      
      if (!fashionAIResult.id) {
        throw new Error('No job ID returned from Fashion AI API');
      }

      // Step 4: Update generation with job ID
      await supabase
        .from('generations')
        .update({
          metadata: {
            fashion_ai_job_id: fashionAIResult.id,
            estimated_time: fashionAIResult.estimated_time,
            api_response: fashionAIResult,
          },
        })
        .eq('id', generation.id);

      // Step 5: Poll for completion
      setGenerationProgress(50);
      setStatusMessage('AI is processing your request...');

      const finalResult = await pollFashionAIStatus(fashionAIResult.id);

      // Step 6: Update generation with results
      setGenerationProgress(90);
      setStatusMessage('Saving results...');

      const resultUrls = finalResult.output || finalResult.images || finalResult.image;
      const processingTime = finalResult.processing_time || finalResult.duration;

      await supabase
        .from('generations')
        .update({
          status: 'completed',
          result_urls: Array.isArray(resultUrls) ? resultUrls : [resultUrls],
          processing_time: processingTime,
          metadata: {
            ...generation.metadata,
            final_result: finalResult,
            completed_at: new Date().toISOString(),
          },
        })
        .eq('id', generation.id);

      // Step 7: Deduct credits and refresh data
      await updateProfile({ credits: profile.credits - 1 });
      await fetchGenerations();

      setGenerationProgress(100);
      setStatusMessage('Generation completed successfully!');
      toast.success('Generation completed successfully!');

      console.log('Full generation process completed successfully');

    } catch (error) {
      console.error('Generation error:', error);
      
      // Update generation with error status if we have a generation ID
      if (currentGenerationId) {
        try {
          await supabase
            .from('generations')
            .update({
              status: 'failed',
              error_message: error instanceof Error ? error.message : 'Unknown error occurred',
              metadata: {
                error_details: error,
                failed_at: new Date().toISOString(),
              },
            })
            .eq('id', currentGenerationId);
        } catch (updateError) {
          console.error('Failed to update generation with error status:', updateError);
        }
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Generation failed: ${errorMessage}`);
      setStatusMessage(`Failed: ${errorMessage}`);
      
    } finally {
      setIsGenerating(false);
      setTimeout(() => {
        setGenerationProgress(0);
        setStatusMessage('');
      }, 3000);
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

  const generateRandomSeed = () => {
    setSeed(Math.floor(Math.random() * 1000000));
  };

  const categories = [
    { id: 'auto', label: 'Auto', icon: User },
    { id: 'tops', label: 'Top', icon: Shirt },
    { id: 'bottoms', label: 'Bottom', icon: Pants },
    { id: 'full-body', label: 'Full-body', icon: User },
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-stone-800 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="font-bold text-stone-800">FASHNAI</span>
            <div className="text-xs text-stone-500 bg-stone-100 px-2 py-1 rounded">
              Current plan: {profile?.subscription_tier?.toUpperCase() || 'FREE'}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-stone-600">
              Credits: <span className="font-medium">{profile?.credits || 0}</span>
            </div>
            <button
              onClick={() => setIsTemplateGalleryOpen(true)}
              className="flex items-center text-stone-600 hover:text-stone-800 font-medium transition-colors"
            >
              Explore Templates
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Progress Bar */}
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <ProgressBar
              progress={generationProgress}
              status={statusMessage || "Generating your fashion visualization..."}
            />
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Model Upload */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center mb-4">
                <h3 className="text-lg font-medium text-stone-900">Select Model</h3>
                <Info className="w-4 h-4 text-stone-400 ml-2" />
              </div>
              <div className="bg-white border-2 border-dashed border-stone-200 rounded-xl p-8 text-center hover:border-stone-300 transition-colors">
                {modelImage ? (
                  <div className="space-y-4">
                    <div className="w-full h-80 bg-stone-100 rounded-lg overflow-hidden">
                      <img
                        src={modelImage}
                        alt="Model"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => setModelImage(null)}
                        className="text-stone-600 hover:text-stone-800 text-sm flex items-center"
                      >
                        <Shuffle className="w-4 h-4 mr-1" />
                        Replace
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-12 h-12 mx-auto bg-stone-100 rounded-lg flex items-center justify-center">
                      <User className="w-6 h-6 text-stone-400" />
                    </div>
                    <div>
                      <p className="text-stone-600 mb-2">Paste/drop image here</p>
                      <p className="text-stone-500 text-sm mb-4">OR</p>
                      <label className="bg-white border border-stone-300 px-4 py-2 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer">
                        Choose file
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = () => setModelImage(reader.result as string);
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Generate AI Model Button */}
              <button className="w-full mt-4 bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center">
                <Sparkles className="w-4 h-4 mr-2" />
                Generate AI Model
              </button>
            </div>
          </div>

          {/* Right Column - Garment Upload */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center mb-4">
                <h3 className="text-lg font-medium text-stone-900">Select Garment</h3>
                <Info className="w-4 h-4 text-stone-400 ml-2" />
              </div>
              <div className="bg-white border-2 border-dashed border-stone-200 rounded-xl p-8 text-center hover:border-stone-300 transition-colors">
                {garmentImage ? (
                  <div className="space-y-4">
                    <div className="w-full h-80 bg-stone-100 rounded-lg overflow-hidden">
                      <img
                        src={garmentImage}
                        alt="Garment"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => setGarmentImage(null)}
                        className="text-stone-600 hover:text-stone-800 text-sm flex items-center"
                      >
                        <Shuffle className="w-4 h-4 mr-1" />
                        Replace
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-12 h-12 mx-auto bg-stone-100 rounded-lg flex items-center justify-center">
                      <Shirt className="w-6 h-6 text-stone-400" />
                    </div>
                    <div>
                      <p className="text-stone-600 mb-2">Paste/drop image here</p>
                      <p className="text-stone-500 text-sm mb-4">OR</p>
                      <label className="bg-white border border-stone-300 px-4 py-2 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer">
                        Choose file
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = () => setGarmentImage(reader.result as string);
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Category Selector */}
        <div className="mt-8 flex justify-center">
          <div className="flex space-x-2 bg-white rounded-lg p-1 border border-stone-200">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => cat.id !== 'auto' && setCategory(cat.id as 'tops' | 'bottoms' | 'full-body')}
                className={`
                  flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors
                  ${cat.id === 'auto' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : category === cat.id
                      ? 'bg-stone-800 text-white'
                      : 'text-stone-700 hover:bg-stone-100'
                  }
                `}
              >
                <cat.icon className="w-4 h-4 mr-2" />
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Controls */}
        <div className="mt-8">
          <button
            onClick={() => setIsAdvancedExpanded(!isAdvancedExpanded)}
            className="w-full flex items-center justify-center text-stone-600 hover:text-stone-800 font-medium transition-colors mb-4"
          >
            <Settings className="w-4 h-4 mr-2" />
            Advanced
            <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isAdvancedExpanded ? 'rotate-180' : ''}`} />
          </button>

          {isAdvancedExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-xl border border-stone-200 p-6"
            >
              {/* Quality Controls */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                {['performance', 'balanced', 'quality'].map((q) => (
                  <button
                    key={q}
                    onClick={() => setQuality(q as typeof quality)}
                    className={`
                      px-4 py-3 rounded-lg text-sm font-medium capitalize transition-colors
                      ${quality === q
                        ? q === 'performance' 
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : q === 'balanced'
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                            : 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-stone-50 border border-stone-200 text-stone-700 hover:bg-stone-100'
                      }
                    `}
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Samples and Seed */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    No. of Samples
                    <Info className="w-3 h-3 inline ml-1 text-stone-400" />
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="1"
                      max="4"
                      value={samples}
                      onChange={(e) => setSamples(parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium text-stone-700 w-4">{samples}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Seed
                    <Info className="w-3 h-3 inline ml-1 text-stone-400" />
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={seed || ''}
                      onChange={(e) => setSeed(e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="Random"
                      className="flex-1 px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm"
                    />
                    <button
                      onClick={generateRandomSeed}
                      className="px-3 py-2 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg transition-colors"
                    >
                      <Shuffle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Fashion AI Configuration Display */}
              <div className="bg-stone-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-stone-700 mb-2">Fashion AI Configuration</h4>
                <div className="text-xs text-stone-600 space-y-1">
                  <div>API Endpoint: {FASHION_AI_CONFIG.baseUrl}</div>
                  <div>API Key: {FASHION_AI_CONFIG.apiKey.substring(0, 15)}...</div>
                  <div>Workflow: POST /run → Poll /status → Results</div>
                  <div>Storage: Supabase Storage buckets</div>
                  <div className="text-green-600 mt-2">
                    ✅ Using Fashion AI API for generation
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Run Button */}
        <div className="mt-8">
          <button
            onClick={handleGenerate}
            disabled={!modelImage || !garmentImage || isGenerating}
            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 disabled:from-stone-300 disabled:to-stone-400 disabled:cursor-not-allowed text-stone-800 font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none"
          >
            <Play className="w-5 h-5 mr-2" />
            {isGenerating ? 'Generating...' : `Run (~${quality === 'performance' ? '3' : quality === 'balanced' ? '5' : '8'}s)`}
          </button>
        </div>

        {/* Results Panel */}
        <div className="mt-8">
          <ResultsPanel />
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