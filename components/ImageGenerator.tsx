
import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';
import Loader from './Loader';
import { Icon } from './Icon';

const aspectRatios = ["1:1", "3:4", "4:3", "9:16", "16:9"];

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    try {
      const imageUrl = await generateImage(prompt, aspectRatio);
      setGeneratedImage(imageUrl);
    } catch (err) {
      setError("Failed to generate image. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-6">
      <h2 className="text-2xl font-bold mb-4">Image Generation (Imagen 4.0)</h2>
      <div className="flex-grow flex flex-col md:flex-row gap-6 overflow-hidden">
        {/* Controls */}
        <div className="md:w-1/3 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="prompt" className="font-semibold text-gray-300">Prompt</label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A robot holding a red skateboard."
              className="w-full h-32 p-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-200 resize-none"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="aspectRatio" className="font-semibold text-gray-300">Aspect Ratio</label>
            <select
              id="aspectRatio"
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-200"
            >
              {aspectRatios.map(ar => <option key={ar} value={ar}>{ar}</option>)}
            </select>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:bg-gray-500 transition-colors flex items-center justify-center"
          >
            <Icon name="image" className="h-5 w-5 mr-2"/>
            {isLoading ? 'Generating...' : 'Generate Image'}
          </button>
          {error && <p className="text-red-400 mt-2">{error}</p>}
        </div>

        {/* Display Area */}
        <div className="md:w-2/3 bg-gray-800 rounded-lg flex items-center justify-center p-4 overflow-auto border border-gray-700">
          {isLoading ? (
            <Loader text="Creating your image..." />
          ) : generatedImage ? (
            <img src={generatedImage} alt="Generated" className="max-h-full max-w-full object-contain rounded-md" />
          ) : (
            <div className="text-center text-gray-500">
              <Icon name="image" className="h-16 w-16 mx-auto mb-2" />
              <p>Your generated image will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;
