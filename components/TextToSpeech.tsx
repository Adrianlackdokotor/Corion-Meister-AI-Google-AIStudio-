import React, { useState, useRef } from 'react';
import { generateSpeech } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audioUtils';
import Loader from './Loader';
import { Icon } from './Icon';

const ttsMessages = [
    "Analysiere den Text...",
    "Synthetisiere die Sprache...",
    "Generiere die Audiodaten..."
];

const TextToSpeech: React.FC = () => {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const handleGenerateAndPlay = async () => {
    if (!text.trim()) {
      setError("Please enter some text.");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
      }
      const audioContext = audioContextRef.current;
      
      const base64Audio = await generateSpeech(text);
      const audioBytes = decode(base64Audio);
      const audioBuffer = await decodeAudioData(audioBytes, audioContext, 24000, 1);
      
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();

    } catch (err) {
      setError("Failed to generate speech. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-6">
      <h2 className="text-2xl font-bold mb-4">Text to Speech (TTS)</h2>
      <div className="flex-grow flex flex-col items-center justify-center gap-6">
        <div className="w-full max-w-2xl flex flex-col gap-4">
          <label htmlFor="tts-text" className="font-semibold text-gray-300 text-lg">Enter Text to Synthesize</label>
          <textarea
            id="tts-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste your text here..."
            className="w-full h-48 p-4 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-200 resize-none text-lg"
          />
          <button
            onClick={handleGenerateAndPlay}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:bg-gray-500 transition-colors flex items-center justify-center text-lg"
          >
            <Icon name="volume-up" className="h-6 w-6 mr-2" />
            {isLoading ? 'Generating Audio...' : 'Generate and Play'}
          </button>
          {isLoading && <div className="mx-auto"><Loader text={ttsMessages}/></div>}
          {error && <p className="text-red-400 mt-2 text-center">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default TextToSpeech;