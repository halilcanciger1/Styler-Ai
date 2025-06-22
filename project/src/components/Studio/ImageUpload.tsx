import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, RotateCcw } from 'lucide-react';

interface ImageUploadProps {
  title: string;
  image: string | null;
  onImageUpload: (image: string) => void;
  onImageRemove: () => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  title,
  image,
  onImageUpload,
  onImageRemove,
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onImageUpload(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: false,
  });

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-stone-700 font-medium">{title}</h3>
        {image && (
          <button
            onClick={onImageRemove}
            className="p-1 text-stone-400 hover:text-stone-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
          ${isDragActive 
            ? 'border-yellow-400 bg-yellow-50' 
            : image 
              ? 'border-stone-200 bg-stone-50' 
              : 'border-stone-300 hover:border-stone-400 hover:bg-stone-50'
          }
        `}
      >
        <input {...getInputProps()} />
        
        {image ? (
          <div className="space-y-4">
            <img
              src={image}
              alt="Uploaded"
              className="w-full h-48 object-cover rounded-lg"
            />
            <div className="flex justify-center">
              <button className="flex items-center text-stone-600 hover:text-stone-800 text-sm">
                <RotateCcw className="w-4 h-4 mr-2" />
                Replace Image
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-12 h-12 mx-auto bg-stone-200 rounded-lg flex items-center justify-center">
              <Upload className="w-6 h-6 text-stone-400" />
            </div>
            <div>
              <p className="text-stone-600 mb-2">
                {isDragActive ? 'Drop image here' : 'Paste/drop image here'}
              </p>
              <p className="text-stone-500 text-sm mb-4">OR</p>
              <button className="bg-white border border-stone-300 px-4 py-2 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors">
                Choose file
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;