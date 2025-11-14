import React, { useState } from 'react';
import { editImage } from '../services/geminiService';
import { fileToGenerativePart } from '../utils/fileUtils';
import Loader from './Loader';
import { Icon } from './Icon';

const imageEditMessages = [
    "Analysiere das Originalbild...",
    "Verstehe die Bearbeitungsanweisung...",
    "Wende die Änderungen an...",
    "Rendere das Ergebnis..."
];

const ImageEditor: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [originalImage, setOriginalImage] = useState<{ file: File; preview: string } | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setOriginalImage({ file, preview: URL.createObjectURL(file) });
      setEditedImage(null);
    }
  };
  
  const handleEdit = async () => {
    if (!prompt.trim() || !originalImage) {
      setError("Please upload an image and enter an editing prompt.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setEditedImage(null);

    try {
      const { base64, mimeType } = await fileToGenerativePart(originalImage.file);
      const imageUrl = await editImage(prompt, base64, mimeType);
      setEditedImage(imageUrl);
    } catch (err) {
      setError("Failed to edit image. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-6">
      <h2 className="text-2xl font-bold mb-4">Image Editor (Gemini 2.5 Flash Image)</h2>
      <div className="flex-grow flex flex-col gap-6 overflow-hidden">
        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="w-full md:w-1/3">
                <label className="block font-semibold text-gray-300 mb-2">1. Upload Image</label>
                <div className="h-32 w-full border-2 border-dashed border-gray-600 rounded-md flex items-center justify-center text-gray-400 relative">
                {originalImage ? (
                    <img src={originalImage.preview} alt="Original" className="h-full w-full object-contain p-1" />
                ) : (
                    <div className="text-center">
                        <Icon name="upload" className="h-8 w-8 mx-auto mb-1"/>
                        <span>Click to upload</span>
                    </div>
                )}
                <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
            </div>
            <div className="flex-grow w-full">
                <label htmlFor="prompt" className="font-semibold text-gray-300 mb-2 block">2. Describe Your Edit</label>
                <textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., Add a retro filter, Remove the person in the background"
                    className="w-full h-32 p-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-200 resize-none"
                />
            </div>
        </div>
         <div className="flex-shrink-0">
          <button
            onClick={handleEdit}
            disabled={isLoading || !originalImage || !prompt}
            className="w-full md:w-auto py-3 px-8 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:bg-gray-500 transition-colors flex items-center justify-center"
          >
            <Icon name="edit" className="h-5 w-5 mr-2" />
            {isLoading ? 'Editing...' : 'Apply Edit'}
          </button>
          {error && <p className="text-red-400 mt-2">{error}</p>}
        </div>
        
        {/* Display Area */}
        <div className="flex-grow flex gap-4 overflow-auto">
          <div className="w-1/2 bg-gray-800 rounded-lg flex flex-col items-center justify-center p-4 border border-gray-700">
            <h3 className="text-lg font-semibold mb-2">Original</h3>
            <div className="flex-grow w-full flex items-center justify-center">
                {originalImage ? <img src={originalImage.preview} alt="Original" className="max-h-full max-w-full object-contain rounded-md" /> : <p className="text-gray-500">Upload an image to begin</p>}
            </div>
          </div>
          <div className="w-1/2 bg-gray-800 rounded-lg flex flex-col items-center justify-center p-4 border border-gray-700">
             <h3 className="text-lg font-semibold mb-2">Edited</h3>
             <div className="flex-grow w-full flex items-center justify-center">
                {isLoading ? (
                    <Loader text={imageEditMessages} />
                ) : editedImage ? (
                    <img src={editedImage} alt="Edited" className="max-h-full max-w-full object-contain rounded-md" />
                ) : (
                    <p className="text-gray-500">Your edited image will appear here.</p>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;