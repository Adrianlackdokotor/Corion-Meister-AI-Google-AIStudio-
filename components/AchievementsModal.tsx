
import React from 'react';
import { UserAchievement } from '../types';
import { achievementsData } from '../data/achievementsData';
import { Icon } from './Icon';

interface AchievementsModalProps {
    isOpen: boolean;
    onClose: () => void;
    userAchievements: UserAchievement[];
}

const AchievementsModal: React.FC<AchievementsModalProps> = ({ isOpen, onClose, userAchievements }) => {
    if (!isOpen) return null;

    const unlockedIds = new Set(userAchievements.map(ua => ua.achievementId));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg p-8 w-full max-w-2xl shadow-xl border border-gray-700 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-white">Meine Erfolge</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <Icon name="close" className="h-6 w-6" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto max-h-[60vh] p-1">
                    {achievementsData.map(achievement => {
                        const isUnlocked = unlockedIds.has(achievement.id);
                        return (
                            <div 
                                key={achievement.id} 
                                className={`p-4 rounded-lg border-2 ${isUnlocked ? 'bg-yellow-900/50 border-yellow-600' : 'bg-gray-700/50 border-gray-600'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon 
                                        name={achievement.icon} 
                                        className={`h-10 w-10 ${isUnlocked ? 'text-yellow-400' : 'text-gray-500'}`}
                                    />
                                    <div>
                                        <h3 className={`font-bold ${isUnlocked ? 'text-white' : 'text-gray-300'}`}>{achievement.name}</h3>
                                        <p className={`text-xs ${isUnlocked ? 'text-gray-300' : 'text-gray-400'}`}>{achievement.description}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                 <div className="mt-6 flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500">
                        Schließen
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AchievementsModal;
