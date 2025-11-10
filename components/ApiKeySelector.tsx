
import React from 'react';

interface ApiKeySelectorProps {
  onKeySelected: () => void;
}

const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onKeySelected }) => {
  const handleSelectKey = async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      await window.aistudio.openSelectKey();
      // Assume success and let the parent component retry the API call.
      onKeySelected();
    } else {
      alert("API key selection utility is not available.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-800 rounded-lg p-8 text-center border-2 border-dashed border-gray-600">
      <h3 className="text-xl font-bold mb-2">API Key Required for Video Generation</h3>
      <p className="text-gray-400 mb-4 max-w-md">
        The Veo video generation model requires you to select your own API key.
        This ensures you are aware of any associated costs.
      </p>
      <button
        onClick={handleSelectKey}
        className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
      >
        Select API Key
      </button>
      <a
        href="https://ai.google.dev/gemini-api/docs/billing"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 text-sm text-red-400 hover:underline"
      >
        View Billing Information
      </a>
    </div>
  );
};

export default ApiKeySelector;
