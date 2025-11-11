
import React from 'react';
import { Icon } from './Icon';

interface WelcomeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg p-8 w-full max-w-lg shadow-xl border border-gray-700 text-center">
                <h2 className="text-3xl font-bold mb-4 text-white">Willkommen beim Corion-Meister AI!</h2>
                <p className="text-gray-300 mb-6">Ihr persönlicher Lerncoach für die Meisterprüfung.</p>

                <div className="text-left space-y-4 mb-8">
                    <div className="flex items-start gap-3">
                        <Icon name="credit-card" className="h-6 w-6 text-yellow-400 flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="font-semibold">Hub+1 Credits</h3>
                            <p className="text-sm text-gray-400">Sie starten mit einem kostenlosen Guthaben. Nutzen Sie es für AI-Funktionen wie Bewertungen und Erklärungen. Mehr Guthaben kann in den Einstellungen erworben werden.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Icon name="chat" className="h-6 w-6 text-red-400 flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="font-semibold">Interaktives Lernen</h3>
                            <p className="text-sm text-gray-400">Nutzen Sie den Chat mit "Meister Corion", üben Sie mit Lernkarten und testen Sie Ihr Wissen mit Quizzen, um bestens vorbereitet zu sein.</p>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={onClose} 
                    className="w-full py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors"
                >
                    Los geht's!
                </button>
            </div>
        </div>
    );
};

export default WelcomeModal;
