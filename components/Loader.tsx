import React, { useState, useEffect } from 'react';

interface LoaderProps {
  text?: string | string[];
  interval?: number;
}

const Loader: React.FC<LoaderProps> = ({ text = "Thinking...", interval = 2500 }) => {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    let textInterval: number;

    if (Array.isArray(text)) {
      let currentIndex = 0;
      setDisplayText(text[currentIndex]); // Set initial text immediately
      textInterval = window.setInterval(() => {
        currentIndex = (currentIndex + 1) % text.length;
        setDisplayText(text[currentIndex]);
      }, interval);
    } else {
      setDisplayText(text);
    }

    return () => clearInterval(textInterval);
  }, [text, interval]);
  
  return (
    <div className="flex flex-col items-center justify-center space-y-3 p-4">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border-4 border-t-red-500 border-gray-600 animate-spin"></div>
        <div className="absolute inset-2 rounded-full border-4 border-b-red-500 border-gray-700 animate-[spin-reverse_1.5s_linear_infinite]"></div>
      </div>
      <p className="text-gray-400 text-sm animate-pulse">{displayText}</p>
      <style>{`
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-\\[spin-reverse_1\\.5s_linear_infinite\\] {
          animation: spin-reverse 1.5s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Loader;