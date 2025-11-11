
import React, { useEffect, useState } from 'react';
import { Achievement } from '../types';
import { Icon } from './Icon';

interface AchievementNotificationProps {
    achievement: Achievement;
    onDismiss: () => void;
}

const AchievementNotification: React.FC<AchievementNotificationProps> = ({ achievement, onDismiss }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(true);
        const timer = setTimeout(() => {
            setVisible(false);
            // Allow animation to finish before calling dismiss
            setTimeout(onDismiss, 300);
        }, 4700);

        return () => clearTimeout(timer);
    }, [achievement, onDismiss]);

    return (
        <div className={`fixed top-5 right-5 z-50 w-full max-w-sm p-4 bg-gray-800 border-2 border-yellow-500 rounded-lg shadow-2xl transition-transform duration-300 ease-out ${visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
            <div className="flex items-start gap-4">
                <Icon name="trophy" className="h-10 w-10 text-yellow-400 flex-shrink-0" />
                <div>
                    <p className="font-bold text-white">Erfolg freigeschaltet!</p>
                    <p className="text-sm text-gray-300">{achievement.name}</p>
                </div>
                <button onClick={onDismiss} className="ml-auto -mt-2 -mr-2 text-gray-500 hover:text-white">
                    <Icon name="close" className="h-4 w-4"/>
                </button>
            </div>
            {/* Progress bar for notification lifetime */}
            <div className="absolute bottom-0 left-0 h-1 bg-yellow-500 animate-[shrink_5s_linear]"></div>
            <style>{`
                @keyframes shrink {
                    from { width: 100%; }
                    to { width: 0%; }
                }
                .animate-\\[shrink_5s_linear\\] {
                    animation: shrink 5s linear;
                }
            `}</style>
        </div>
    );
};

export default AchievementNotification;
