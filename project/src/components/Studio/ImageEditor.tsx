import React, { useState, useRef, useCallback } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Transformer } from 'react-konva';
import { motion } from 'framer-motion';
import { 
  RotateCcw, 
  Crop, 
  Palette, 
  Sliders, 
  Download,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { ChromePicker } from 'react-color';

interface ImageEditorProps {
  imageUrl: string;
  onSave: (editedImageUrl: string) => void;
  onClose: () => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ imageUrl, onSave, onClose }) => {
  const [selectedTool, setSelectedTool] = useState<'select' | 'crop' | 'color' | 'adjust'>('select');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [scale, setScale] = useState(1);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const stageRef = useRef<any>(null);
  const imageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);

  const tools = [
    { id: 'select', label: 'Select', icon: Crop },
    { id: 'crop', label: 'Crop', icon: Crop },
    { id: 'color', label: 'Color', icon: Palette },
    { id: 'adjust', label: 'Adjust', icon: Sliders },
  ];

  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId as any);
    setShowColorPicker(toolId === 'color');
  };

  const handleSave = useCallback(() => {
    if (stageRef.current) {
      const dataURL = stageRef.current.toDataURL();
      onSave(dataURL);
    }
  }, [onSave]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
    }
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.2, 0.1));
  };

  const handleReset = () => {
    setBrightness(0);
    setContrast(0);
    setSaturation(0);
    setScale(1);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col"
    >
      {/* Header */}
      <div className="bg-stone-900 border-b border-stone-700 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-white font-semibold">Image Editor</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-2 text-stone-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-2 text-stone-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleZoomOut}
            className="p-2 text-stone-400 hover:text-white"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-white text-sm">{Math.round(scale * 100)}%</span>
          <button
            onClick={handleZoomIn}
            className="p-2 text-stone-400 hover:text-white"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 text-stone-400 hover:text-white"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handleSave}
            className="bg-yellow-400 hover:bg-yellow-500 text-stone-800 px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Save
          </button>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white px-4 py-2"
          >
            Cancel
          </button>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Toolbar */}
        <div className="bg-stone-800 border-r border-stone-700 p-4 w-64">
          <div className="space-y-4">
            {/* Tools */}
            <div>
              <h3 className="text-white font-medium mb-3">Tools</h3>
              <div className="grid grid-cols-2 gap-2">
                {tools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => handleToolSelect(tool.id)}
                    className={`p-3 rounded-lg flex flex-col items-center space-y-1 transition-colors ${
                      selectedTool === tool.id
                        ? 'bg-yellow-400 text-stone-800'
                        : 'bg-stone-700 text-stone-300 hover:bg-stone-600'
                    }`}
                  >
                    <tool.icon className="w-5 h-5" />
                    <span className="text-xs">{tool.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Adjustments */}
            {selectedTool === 'adjust' && (
              <div>
                <h3 className="text-white font-medium mb-3">Adjustments</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-stone-300 text-sm mb-2">Brightness</label>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={brightness}
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      className="w-full"
                    />
                    <span className="text-stone-400 text-xs">{brightness}</span>
                  </div>
                  <div>
                    <label className="block text-stone-300 text-sm mb-2">Contrast</label>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={contrast}
                      onChange={(e) => setContrast(Number(e.target.value))}
                      className="w-full"
                    />
                    <span className="text-stone-400 text-xs">{contrast}</span>
                  </div>
                  <div>
                    <label className="block text-stone-300 text-sm mb-2">Saturation</label>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={saturation}
                      onChange={(e) => setSaturation(Number(e.target.value))}
                      className="w-full"
                    />
                    <span className="text-stone-400 text-xs">{saturation}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Color Picker */}
            {showColorPicker && (
              <div>
                <h3 className="text-white font-medium mb-3">Color</h3>
                <ChromePicker
                  color="#ffffff"
                  onChange={(color) => console.log(color)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 flex items-center justify-center bg-stone-900">
          <Stage
            ref={stageRef}
            width={800}
            height={600}
            scaleX={scale}
            scaleY={scale}
          >
            <Layer>
              <KonvaImage
                ref={imageRef}
                image={new window.Image()}
                filters={[]}
                brightness={brightness / 100}
                contrast={contrast / 100}
                saturation={saturation / 100}
              />
              <Transformer ref={transformerRef} />
            </Layer>
          </Stage>
        </div>
      </div>
    </motion.div>
  );
};

export default ImageEditor;