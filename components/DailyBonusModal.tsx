
import React from 'react';
import { Icon } from './Icon';

interface DailyBonusModalProps {
    isOpen: boolean;
    onClose: () => void;
    streak: number;
    bonus: number;
}

const DailyBonusModal: React.FC<DailyBonusModalProps> = ({ isOpen, onClose, streak, bonus }) => {
    if (!isOpen) return null;

    const streakMessages: { [key: number]: string } = {
        7: 'Eine Woche durchgehalten! Dafür gibt es einen Extra-Bonus von 500 Credits!',
        14: 'Zwei Wochen am Stück! Fantastisch! +1.000 Credits für Sie!',
        30: 'Ein ganzer Monat! Sie sind auf dem besten Weg zum Meister! +2.500 Credits!',
    };

    const streakMessage = streakMessages[streak];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg p-8 w-full max-w-md shadow-xl border border-gray-700 text-center">
                <Icon name="star" className="h-16 w-16 text-yellow-400 mx-auto animate-pulse" />
                <h2 className="text-2xl font-bold mt-4 mb-2 text-white">Täglicher Bonus!</h2>
                <p className="text-gray-300 mb-4">Schön, Sie wiederzusehen! Für Ihre tägliche Mühe erhalten Sie:</p>
                
                <div className="p-4 bg-gray-700/50 rounded-lg mb-6">
                    <p className="text-3xl font-bold text-yellow-400">+{bonus} Hub+1</p>
                    <p className="text-sm text-gray-400">Täglicher Login-Bonus</p>
                </div>

                <div className="flex justify-center items-center gap-2 mb-4">
                    <Icon name="fire" className="h-8 w-8 text-orange-400" />
                    <p className="text-xl font-bold">
                        {streak} Tag{streak !== 1 && 'e'} Streak!
                    </p>
                </div>
                
                {streakMessage && (
                    <p className="text-green-400 font-semibold mb-6">{streakMessage}</p>
                )}

                <button 
                    onClick={onClose} 
                    className="w-full py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                >
                    Weiter lernen
                </button>
            </div>
        </div>
    );
};

export default DailyBonusModal;
