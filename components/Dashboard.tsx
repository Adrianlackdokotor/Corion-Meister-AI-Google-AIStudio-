
import React, { useMemo } from 'react';
import { User, LibraryCategory, AchievementId } from '../types';
import { Icon } from './Icon';
import { achievementsData } from '../data/achievementsData';

interface DashboardProps {
    user: User;
    studyLibrary: LibraryCategory[];
    cardProgress: { [key: string]: { masteryLevel: number } };
    onSelectCategory: (feature: 'flashcards', category: LibraryCategory) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, studyLibrary, cardProgress, onSelectCategory }) => {

    const recommendedCategory = useMemo(() => {
        let lowestScore = Infinity;
        let recommendation: LibraryCategory | null = null;

        studyLibrary.forEach(category => {
            const categoryCards = category.entries;
            if (categoryCards.length === 0) return;

            const totalMastery = categoryCards.reduce((sum, entry) => {
                const progress = cardProgress[entry.id];
                return sum + (progress ? progress.masteryLevel : 0);
            }, 0);
            
            const maxMastery = categoryCards.length * 5;
            const score = (totalMastery / maxMastery) * 100;

            if (score < 100 && score < lowestScore) {
                lowestScore = score;
                recommendation = category;
            }
        });

        return recommendation || studyLibrary.find(cat => cat.entries.length > 0) || null;
    }, [studyLibrary, cardProgress]);

    const nextAchievement = useMemo(() => {
        const userAchievementIds = new Set(user.achievements.map(a => a.achievementId));
        return achievementsData.find(ach => !userAchievementIds.has(ach.id));
    }, [user.achievements]);

    return (
        <div className="p-8 h-full overflow-y-auto">
            <h1 className="text-3xl font-bold">Willkommen zurück, <span className="text-red-500">{user.email.split('@')[0]}</span>!</h1>
            <p className="text-gray-400 mt-1">Lassen Sie uns Ihr Training fortsetzen und den Meistertitel anstreben.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                {/* Streak */}
                <div className="bg-gray-800 p-6 rounded-lg flex items-center gap-4 border border-gray-700">
                    <Icon name="fire" className="h-12 w-12 text-orange-400" />
                    <div>
                        <p className="text-gray-400 text-sm">Tages-Streak</p>
                        <p className="text-2xl font-bold">{user.dailyStreak} Tag{user.dailyStreak !== 1 && 'e'}</p>
                    </div>
                </div>
                {/* Credits */}
                <div className="bg-gray-800 p-6 rounded-lg flex items-center gap-4 border border-gray-700">
                     <Icon name="credit-card" className="h-12 w-12 text-yellow-400" />
                    <div>
                        <p className="text-gray-400 text-sm">Guthaben</p>
                        <p className="text-2xl font-bold">{user.credits.toLocaleString('de-DE')} Hub+1</p>
                    </div>
                </div>
                {/* Achievements */}
                <div className="bg-gray-800 p-6 rounded-lg flex items-center gap-4 border border-gray-700">
                     <Icon name="trophy" className="h-12 w-12 text-red-400" />
                    <div>
                        <p className="text-gray-400 text-sm">Erfolge</p>
                        <p className="text-2xl font-bold">{user.achievements.length} / {achievementsData.length}</p>
                    </div>
                </div>
            </div>
            
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* Recommended for you */}
                <div className="bg-gradient-to-br from-red-800 to-red-600 p-6 rounded-lg">
                    <h2 className="text-xl font-bold mb-4">Empfohlen für Sie</h2>
                    {recommendedCategory ? (
                        <div>
                            <p className="text-red-200 mb-2">Konzentrieren wir uns auf den Bereich, in dem Sie sich am meisten verbessern können:</p>
                            <div className="bg-black/20 p-4 rounded-lg">
                                 <h3 className="font-bold text-lg">{recommendedCategory.title}</h3>
                                 <p className="text-sm text-red-100">{recommendedCategory.entries.length} Karten in dieser Kategorie.</p>
                            </div>
                            <button 
                                onClick={() => onSelectCategory('flashcards', recommendedCategory)}
                                className="mt-4 w-full py-2 bg-white text-red-600 font-bold rounded-lg hover:bg-red-100 transition-colors"
                            >
                                Jetzt lernen
                            </button>
                        </div>
                    ) : (
                        <p>Alle Kategorien gemeistert! Fügen Sie neue Materialien in der Lernbibliothek hinzu.</p>
                    )}
                </div>

                {/* Next Achievement */}
                {nextAchievement && (
                    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                        <h2 className="text-xl font-bold mb-4">Nächster Erfolg</h2>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gray-700 rounded-full">
                                <Icon name={nextAchievement.icon} className="h-8 w-8 text-red-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">{nextAchievement.name}</h3>
                                <p className="text-sm text-gray-400">{nextAchievement.description}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
