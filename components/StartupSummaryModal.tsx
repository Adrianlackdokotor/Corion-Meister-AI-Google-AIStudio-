import React from 'react';
import { Icon } from './Icon';
import { User } from '../types';

interface StartupSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
}

const StartupSummaryModal: React.FC<StartupSummaryModalProps> = ({ isOpen, onClose, currentUser }) => {
  if (!isOpen || !currentUser) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-lg p-8 w-full max-w-md shadow-xl border border-gray-700 text-center"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-2xl font-bold mb-4 text-white">Willkommen zurück, Meister-Anwärter!</h3>
        <p className="text-gray-400 mb-6">Hier ist eine Zusammenfassung Ihres Guthabens:</p>
        
        <div className="space-y-4 text-left p-4 bg-gray-700/50 rounded-lg">
            <div>
                <p className="text-sm text-gray-400">Aktuelles Guthaben:</p>
                <p className="text-2xl font-bold text-yellow-400">{currentUser.credits.toLocaleString('de-DE')} Hub+1</p>
            </div>
             <div>
                <p className="text-sm text-gray-400">In Ihrer letzten Sitzung verbraucht:</p>
                <p className="text-lg font-semibold text-red-400">
                    {currentUser.lastSessionCreditUsage.toLocaleString('de-DE')} Hub+1
                </p>
            </div>
        </div>

        <button 
          onClick={onClose} 
          className="mt-8 px-8 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
        >
          Training starten
        </button>
      </div>
    </div>
  );
};

export default StartupSummaryModal;