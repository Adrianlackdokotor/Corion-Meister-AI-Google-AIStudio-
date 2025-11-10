import React, { useState } from 'react';
import { Icon } from './Icon';
import { Language, User } from '../types';
import { AudioManager } from '../utils/audioManager';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  volume: number;
  setVolume: (volume: number) => void;
  isMuted: boolean;
  setIsMuted: (isMuted: boolean) => void;
  language: Language;
  setLanguage: (language: Language) => void;
  audioManager: AudioManager;
  currentUser: User | null;
}

type SettingsTab = 'general' | 'billing';

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  volume,
  setVolume,
  isMuted,
  setIsMuted,
  language,
  setLanguage,
  audioManager,
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  
  if (!isOpen) return null;

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if(isMuted) setIsMuted(false);
  };
  
  const handleToggleMute = () => {
      setIsMuted(!isMuted);
      audioManager.play('click');
  }

  const GeneralSettings = () => (
    <div className="space-y-6">
        {/* Audio Settings */}
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Audio-Steuerung</label>
            <div className="flex items-center gap-4 bg-gray-700 p-3 rounded-lg">
                <button onClick={handleToggleMute} className="p-2 text-gray-300 hover:text-white">
                    <Icon name={isMuted || volume === 0 ? 'volume-off' : 'volume-up'} className="h-6 w-6" />
                </button>
                <input 
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    style={{
                        background: `linear-gradient(to right, #EF4444 ${volume * 100}%, #4B5563 ${volume * 100}%)`
                    }}
                />
            </div>
        </div>
        
        {/* Language Settings */}
        <div className="space-y-2">
            <label htmlFor="language-select" className="block text-sm font-medium text-gray-300">
                Sprache für AI-Erklärungen
            </label>
            <p className="text-xs text-gray-400">Die App-Oberfläche bleibt auf Deutsch. Dies ändert nur die Sprache des Feedbacks von der AI.</p>
            <select 
                id="language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
            >
                <option value="Romanian">Română</option>
                <option value="English">English</option>
                <option value="Polish">Polski</option>
            </select>
        </div>
    </div>
  );

  const BillingSettings = () => (
    <div className="space-y-4">
        <div>
            <p className="text-sm text-gray-400">Ihr aktuelles Guthaben:</p>
            <p className="text-3xl font-bold text-yellow-400">{currentUser?.credits.toLocaleString('de-DE')} Hub+1-Credits</p>
        </div>
        <div className="p-4 bg-gray-700/50 rounded-lg text-sm text-gray-300">
            <p className="mb-2">Jeder neue Benutzer erhält ein kostenloses Startguthaben im Wert von 2 €. Dies ermöglicht die volle Nutzung aller AI-Funktionen.</p>
            <p>Sobald Ihr Guthaben aufgebraucht ist, werden AI-gestützte Funktionen (wie Quiz-Erstellung, Antwortbewertung usw.) gesperrt, bis Sie Ihr Guthaben aufladen. Funktionen, die keine AI verwenden, bleiben kostenlos.</p>
        </div>
        <button className="w-full py-2 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700">
            Guthaben aufladen (Stripe Integration)
        </button>
    </div>
  );

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-lg w-full max-w-md shadow-xl border border-gray-700 flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
            <h3 className="text-2xl font-bold text-white">Einstellungen</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
                <Icon name="close" className="h-6 w-6" />
            </button>
        </div>
        
        <div className="p-2 bg-gray-900">
            <div className="flex border-b border-gray-700">
                 <button 
                    onClick={() => setActiveTab('general')}
                    className={`flex-1 py-2 text-center font-semibold transition-colors ${activeTab === 'general' ? 'text-white border-b-2 border-red-500' : 'text-gray-400 hover:text-white'}`}
                >
                    Allgemein
                </button>
                <button 
                    onClick={() => setActiveTab('billing')}
                    className={`flex-1 py-2 text-center font-semibold transition-colors flex items-center justify-center gap-2 ${activeTab === 'billing' ? 'text-white border-b-2 border-red-500' : 'text-gray-400 hover:text-white'}`}
                >
                    <Icon name="credit-card" className="h-5 w-5"/>
                    Abrechnung & Guthaben
                </button>
            </div>
        </div>
        
        <div className="p-6">
            {activeTab === 'general' ? <GeneralSettings /> : <BillingSettings />}
        </div>
        
        <div className="p-6 mt-auto border-t border-gray-700 flex justify-end bg-gray-800/50">
             <button 
                onClick={onClose} 
                className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors"
            >
                Schließen
            </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;