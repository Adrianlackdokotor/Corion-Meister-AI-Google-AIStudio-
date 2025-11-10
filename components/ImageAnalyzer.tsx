
import React, { useState } from 'react';
import { analyzeImage } from '../services/geminiService';
import { fileToGenerativePart } from '../utils/fileUtils';
import Loader from './Loader';
import { Icon } from './Icon';

const ImageAnalyzer: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<{ file: File; preview: string } | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage({ file, preview: URL.createObjectURL(file) });
      setAnalysis(null);
    }
  };

  const handleAnalyze = async () => {
    if (!prompt.trim() || !image) {
      setError("Please upload an image and enter a question.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const { base64, mimeType } = await fileToGenerativePart(image.file);
      const result = await analyzeImage(prompt, base64, mimeType);
      setAnalysis(result);
    } catch (err) {
      setError("Failed to analyze image. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-6">
      <h2 className="text-2xl font-bold mb-4">Image Analyzer (Gemini 2.5 Flash)</h2>
      <div className="flex-grow flex flex-col md:flex-row gap-6 overflow-hidden">
        {/* Input & Controls */}
        <div className="md:w-1/3 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-300">1. Upload Image</label>
            <div className="h-48 w-full border-2 border-dashed border-gray-600 rounded-md flex items-center justify-center text-gray-400 relative">
              {image ? (
                <img src={image.preview} alt="Upload preview" className="h-full w-full object-contain p-1" />
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
            <label htmlFor="prompt" className="font-semibold text-gray-300">2. Ask a question about the image</label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., What kind of car is this? What is happening in this image?"
              className="w-full h-24 p-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-200 resize-none"
            />
          </div>
          <button
            onClick={handleAnalyze}
            disabled={isLoading || !image || !prompt}
            className="w-full py-3 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:bg-gray-500 transition-colors flex items-center justify-center"
          >
            <Icon name="search" className="h-5 w-5 mr-2" />
            {isLoading ? 'Analyzing...' : 'Analyze Image'}
          </button>
          {error && <p className="text-red-400 mt-2">{error}</p>}
        </div>

        {/* Display Area */}
        <div className="md:w-2/3 bg-gray-800 rounded-lg flex items-center justify-center p-4 overflow-auto border border-gray-700">
          {isLoading ? (
            <Loader text="Analyzing image..." />
          ) : analysis ? (
            <div className="w-full h-full overflow-y-auto p-2 text-gray-200 whitespace-pre-wrap">
              {analysis}
            </div>
          ) : (
            <div className="text-center text-gray-500">
                <Icon name="search" className="h-16 w-16 mx-auto mb-2" />
                <p>The analysis of your image will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageAnalyzer;
