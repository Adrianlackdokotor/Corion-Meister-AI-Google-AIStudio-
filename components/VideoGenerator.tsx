import React, { useState, useEffect, useCallback } from 'react';
import { generateVideo } from '../services/geminiService';
import { fileToGenerativePart } from '../utils/fileUtils';
import Loader from './Loader';
import ApiKeySelector from './ApiKeySelector';
import { Icon } from './Icon';

const VideoGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const checkApiKey = useCallback(async () => {
    if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
      const keyStatus = await window.aistudio.hasSelectedApiKey();
      setHasApiKey(keyStatus);
    } else {
      // If the utility is not available, assume we can proceed (e.g. key is in env)
      setHasApiKey(true); 
    }
  }, []);

  useEffect(() => {
    checkApiKey();
  }, [checkApiKey]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() && !imageFile) {
      setError("Please enter a prompt or upload an image.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setGeneratedVideo(null);

    try {
      let imagePayload;
      if (imageFile) {
        const { base64, mimeType } = await fileToGenerativePart(imageFile);
        imagePayload = { base64, mimeType };
      }

      const videoUrl = await generateVideo(prompt, aspectRatio, imagePayload);
      setGeneratedVideo(videoUrl);
    } catch (err: any) {
      if (err.message?.includes("Requested entity was not found")) {
        setError("API Key error. Please select your key again.");
        setHasApiKey(false);
      } else {
        setError("Failed to generate video. Please try again.");
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadingMessages = [
    "Initializing VEO model...",
    "Analyzing prompt and concepts...",
    "Generating initial video frames...",
    "Refining motion and details...",
    "This can take a few minutes...",
    "Finalizing video render...",
    "Almost there, preparing your video..."
  ];

  if (hasApiKey === null) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader text="Checking API key status..." />
      </div>
    );
  }

  if (!hasApiKey) {
    return <div className="p-6 h-full"><ApiKeySelector onKeySelected={() => { setHasApiKey(true); setError(null); }} /></div>;
  }

  return (
    <div className="flex flex-col h-full p-6">
      <h2 className="text-2xl font-bold mb-4">Video Generation (VEO)</h2>
      <div className="flex-grow flex flex-col md:flex-row gap-6 overflow-hidden">
        {/* Controls */}
        <div className="md:w-1/3 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="prompt" className="font-semibold text-gray-300">Prompt (Optional with image)</label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A neon hologram of a cat driving at top speed"
              className="w-full h-32 p-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-200 resize-none"
            />
          </div>
           <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-300">Starting Image (Optional)</label>
            <div className="h-32 w-full border-2 border-dashed border-gray-600 rounded-md flex items-center justify-center text-gray-400 relative">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="h-full w-full object-contain p-1" />
              ) : (
                <div className="text-center">
                    <Icon name="upload" className="h-8 w-8 mx-auto mb-1"/>
                    <span>Click to upload</span>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-300">Aspect Ratio</label>
            <div className="flex gap-2">
                <button onClick={() => setAspectRatio('16:9')} className={`flex-1 p-2 rounded-md ${aspectRatio === '16:9' ? 'bg-red-600' : 'bg-gray-700'}`}>16:9 (Landscape)</button>
                <button onClick={() => setAspectRatio('9:16')} className={`flex-1 p-2 rounded-md ${aspectRatio === '9:16' ? 'bg-red-600' : 'bg-gray-700'}`}>9:16 (Portrait)</button>
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:bg-gray-500 transition-colors flex items-center justify-center"
          >
            <Icon name="video" className="h-5 w-5 mr-2"/>
            {isLoading ? 'Generating...' : 'Generate Video'}
          </button>
          {error && <p className="text-red-400 mt-2 text-center">{error}</p>}
        </div>

        {/* Display Area */}
        <div className="md:w-2/3 bg-gray-800 rounded-lg flex items-center justify-center p-4 overflow-auto border border-gray-700">
          {isLoading ? (
            <Loader text={loadingMessages} />
          ) : generatedVideo ? (
            <video src={generatedVideo} controls autoPlay loop className="max-h-full max-w-full rounded-md" />
          ) : (
             <div className="text-center text-gray-500">
              <Icon name="video" className="h-16 w-16 mx-auto mb-2" />
              <p>Your generated video will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoGenerator;