// FIX: Imported `useMemo` to resolve 'Cannot find name' error.
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Icon } from './Icon';
import { Flashcard, FlashcardEvaluation, Language, LibraryCategory, User } from '../types';
import { evaluateFlashcardAnswer, generateFlashcardsFromText } from '../services/geminiService';
import Loader from './Loader';
import { AudioManager } from '../utils/audioManager';

type Category = LibraryCategory;

interface FlashcardViewerProps {
    category: Category;
    cards: Flashcard[];
    onBack: () => void;
    onUpdateCardMastery: (cardId: string, result: 'richtig' | 'teilweise' | 'falsch') => void;
    onUpdateCardImage: (cardId: string, imageUrl: string) => void;
    audioManager: AudioManager;
    language: Language;
    currentUser: User;
}

const MasteryStars = ({ level }: { level: number }) => (
    <div className="flex justify-center items-center gap-1" title={`Mastery Level: ${level}/5`}>
        <span className="text-sm mr-2 text-yellow-300">Mastery:</span>
        {Array.from({ length: 5 }).map((_, i) => (
            <svg key={i} className={`h-5 w-5 ${i < level ? 'text-yellow-400' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
        ))}
    </div>
);


const FlashcardViewer: React.FC<FlashcardViewerProps> = ({ category, cards, onBack, onUpdateCardMastery, onUpdateCardImage, audioManager, language, currentUser }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnswerVisible, setIsAnswerVisible] = useState(false);
    const [userAnswer, setUserAnswer] = useState('');
    const [aiFeedback, setAiFeedback] = useState<FlashcardEvaluation | null>(null);
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const currentCard = cards[currentIndex];
    
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'de-DE';

            recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
                let interimTranscript = '';
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
                setUserAnswer(finalTranscript + interimTranscript);
            };
        }
    }, []);

    const toggleRecording = () => {
        if (isRecording) {
            recognitionRef.current?.stop();
        } else {
            recognitionRef.current?.start();
        }
        setIsRecording(!isRecording);
    };


    useEffect(() => {
        // Reset state when the card changes
        resetCardState();
    }, [currentIndex, cards]);

    const resetCardState = () => {
        setIsAnswerVisible(false);
        setUserAnswer('');
        setAiFeedback(null);
        setIsEvaluating(false);
        if (isRecording) {
            recognitionRef.current?.stop();
            setIsRecording(false);
        }
    };

    const goToPrevCard = () => {
        audioManager.play('click');
        setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    };

    const goToNextCard = () => {
        audioManager.play('click');
        setCurrentIndex((prev) => (prev + 1) % cards.length);
    };

    const handleEvaluate = async () => {
        if (!userAnswer.trim() || currentUser.credits <= 0) return;
        setIsEvaluating(true);
        setAiFeedback(null);
        try {
            const evaluation = await evaluateFlashcardAnswer(currentCard.front, currentCard.back, userAnswer, language);
            setAiFeedback(evaluation);
            onUpdateCardMastery(currentCard.id, evaluation.result);
            if (evaluation.result === 'richtig') audioManager.play('correct');
            else if (evaluation.result === 'teilweise') audioManager.play('partial');
            else audioManager.play('incorrect');
            setIsAnswerVisible(true); // Show correct answer after evaluation
        } catch (error) {
            console.error("Evaluation failed:", error);
            audioManager.play('incorrect');
            setAiFeedback({ result: 'falsch', feedback: 'Beim Bewerten der Antwort ist ein Fehler aufgetreten.' });
        } finally {
            setIsEvaluating(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const imageUrl = reader.result as string;
                onUpdateCardImage(currentCard.id, imageUrl);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const getFeedbackStyles = () => {
        if (!aiFeedback) return { borderColor: 'border-gray-700', icon: 'chat', color: 'text-gray-400', title: '' };
        switch (aiFeedback.result) {
            case 'richtig':
                return { borderColor: 'border-green-500', icon: 'check', color: 'text-green-400', title: "Antwort 'Corion-Grün' - Perfekt!" };
            case 'teilweise':
                return { borderColor: 'border-yellow-500', icon: 'edit', color: 'text-yellow-400', title: "Fast! Eine 'Corion-Orange' Antwort..." };
            case 'falsch':
                return { borderColor: 'border-red-500', icon: 'close', color: 'text-red-400', title: "Lass uns das noch einmal ansehen..." };
            default:
                return { borderColor: 'border-gray-700', icon: 'chat', color: 'text-gray-400', title: '' };
        }
    };
    const feedbackStyles = getFeedbackStyles();


    if (!currentCard) {
        return (
            <div className="flex flex-col h-full items-center justify-center p-4">
                 <button onClick={() => { audioManager.play('click'); onBack(); }} className="self-start mb-4 flex items-center text-red-400 hover:text-red-300">
                    <Icon name="back" className="h-5 w-5 mr-2" />
                    Zurück zur Kategorienauswahl
                </button>
                <div className="text-center text-gray-400">
                    <h3 className="text-xl font-semibold mb-4">{category.title}</h3>
                    <p>Für diese Kategorie wurden noch keine Lernkarten hinzugefügt.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
             <button onClick={() => { audioManager.play('click'); onBack(); }} className="self-start m-4 flex items-center text-red-400 hover:text-red-300">
                <Icon name="back" className="h-5 w-5 mr-2" />
                Zurück zur Kategorienauswahl
            </button>
            <div className="flex-grow flex flex-col items-center overflow-y-auto relative p-4">
                <h3 className="text-xl font-semibold mb-2 text-center">{category.title}</h3>
                <p className="text-gray-400 mb-4">Karte {currentIndex + 1} von {cards.length}</p>
                
                <div className="w-full max-w-3xl flex items-center justify-center">
                    <button onClick={goToPrevCard} className="p-2 rounded-full hover:bg-gray-700 transition-colors mx-2"><Icon name="arrowLeft" /></button>
                    {/* Card Display */}
                    <div 
                        className={`w-full max-w-2xl min-h-[20rem] h-auto rounded-lg shadow-2xl bg-cover bg-center p-6 flex flex-col justify-between relative overflow-hidden transition-colors duration-300 border-4 ${aiFeedback ? feedbackStyles.borderColor : 'border-transparent'}`}
                        style={{ backgroundImage: `url(${currentCard.backgroundImageUrl})`}}
                    >
                        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
                        <div className="relative z-10 flex-grow flex flex-col items-center justify-center text-center">
                           <p className="text-xl font-semibold text-white">{currentCard.front}</p>
                           {isAnswerVisible && (
                             <div className="w-full mt-4">
                                <hr className="w-full border-gray-600/50" />
                                <div className="mt-4 p-4 bg-black/25 rounded-md">
                                    <p className="text-lg text-gray-200">{currentCard.back}</p>
                                </div>
                            </div>
                           )}
                        </div>
                        <div className="relative z-10 mt-auto">
                           <div className="flex justify-between items-center">
                                <MasteryStars level={currentCard.masteryLevel} />
                                <div className="flex items-center gap-2">
                                     {!isAnswerVisible && (
                                        <button onClick={() => { setIsAnswerVisible(true); audioManager.play('click'); }} className="px-4 py-1 text-sm bg-gray-600 rounded-md hover:bg-gray-500">
                                            Antwort anzeigen
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="p-2 rounded-full text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                                        title="Hintergrundbild ändern"
                                    >
                                        <Icon name="upload" className="h-5 w-5"/>
                                    </button>
                                </div>
                                <input 
                                    type="file" 
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                    accept="image/*"
                                    className="hidden"
                                />
                           </div>
                        </div>
                    </div>
                    <button onClick={goToNextCard} className="p-2 rounded-full hover:bg-gray-700 transition-colors mx-2"><Icon name="arrowRight" /></button>
                </div>

                {/* AI Evaluation Area */}
                <div className="mt-6 w-full max-w-2xl">
                    <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 flex flex-col items-center gap-4">
                        <p className="font-semibold text-lg text-gray-200">Schreibe deine Antwort hier:</p>
                        <textarea
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            placeholder={currentUser.credits <= 0 ? "Kein Guthaben für die AI-Bewertung vorhanden." : "Gib deine Antwort zur AI-Bewertung ein..."}
                            rows={3}
                            className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-200 resize-none"
                            disabled={isEvaluating || currentUser.credits <= 0}
                        />
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => { handleEvaluate(); audioManager.play('click'); }}
                                disabled={isEvaluating || !userAnswer.trim() || currentUser.credits <= 0}
                                className="px-8 py-2 bg-red-600 rounded-lg text-white font-semibold hover:bg-red-700 disabled:bg-gray-500 transition-colors flex items-center gap-2"
                            >
                                {isEvaluating ? 'Wird bewertet...' : 'Antwort bewerten'}
                            </button>
                             <button
                                type="button"
                                onClick={toggleRecording}
                                className={`p-3 rounded-full transition-colors ${isRecording ? 'bg-red-700 text-white animate-pulse' : 'bg-gray-600 hover:bg-gray-500'}`}
                                disabled={isEvaluating || currentUser.credits <= 0}
                                title={isRecording ? "Aufnahme stoppen" : "Antwort diktieren"}
                            >
                                <Icon name="mic" className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {isEvaluating && (
                        <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700 flex justify-center">
                            <Loader text="Meister Corion analysiert..." />
                        </div>
                    )}

                    {aiFeedback && (
                         <div className={`mt-4 p-4 bg-gray-800 rounded-lg border-2 ${feedbackStyles.borderColor}`}>
                             <h4 className={`flex items-center gap-2 text-lg font-bold ${feedbackStyles.color}`}>
                                 <Icon name={feedbackStyles.icon} className="h-6 w-6" />
                                 {feedbackStyles.title}
                             </h4>
                             {aiFeedback.correctAnswerDE && (
                                <div className="mt-4 p-3 bg-gray-900/50 rounded-md border border-gray-600">
                                    <p className="text-sm font-semibold text-gray-300">Korrekte Antwort:</p>
                                    <p className="mt-1 text-gray-200 whitespace-pre-wrap">{aiFeedback.correctAnswerDE}</p>
                                </div>
                             )}
                             <p className="mt-2 text-gray-300 whitespace-pre-wrap">{aiFeedback.feedback}</p>
                             <div className="flex justify-end mt-4">
                                <button onClick={goToNextCard} className="px-6 py-2 bg-red-600 rounded-lg text-white font-semibold hover:bg-red-700 transition-colors">
                                    Nächste Karte
                                </button>
                             </div>
                         </div>
                    )}
                </div>
            </div>
        </div>
    );
};


interface FlashcardsProps {
    audioManager: AudioManager;
    language: Language;
    studyLibrary: LibraryCategory[];
    currentUser: User;
}

const Flashcards: React.FC<FlashcardsProps> = ({ audioManager, language, studyLibrary, currentUser }) => {
    
    // State to hold user-specific progress like mastery and background images
    const [cardProgress, setCardProgress] = useState<{ [key: string]: { masteryLevel: number; backgroundImageUrl: string } }>(() => {
        try {
            const saved = localStorage.getItem('flashcard_progress');
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            console.error("Could not parse flashcard progress from localStorage", error);
            return {};
        }
    });

    // Combine library data with user progress to create the final flashcard set
    const cards: Flashcard[] = useMemo(() => {
        return studyLibrary.flatMap(category =>
            category.entries.map(entry => {
                const progress = cardProgress[entry.id] || { masteryLevel: 0, backgroundImageUrl: `https://source.unsplash.com/random/800x600?texture,abstract,${category.title.split(' ')[0]}` };
                return {
                    id: entry.id,
                    categoryId: category.title,
                    front: entry.question,
                    back: entry.answer,
                    masteryLevel: progress.masteryLevel,
                    backgroundImageUrl: progress.backgroundImageUrl,
                };
            })
        );
    }, [studyLibrary, cardProgress]);
    
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

    const handleResetProgress = () => {
        audioManager.play('click');
        setIsResetConfirmOpen(true);
    };
    
    const executeResetProgress = () => {
        setCardProgress({});
        setIsResetConfirmOpen(false);
        audioManager.play('click');
    };
    
    useEffect(() => {
        localStorage.setItem('flashcard_progress', JSON.stringify(cardProgress));
    }, [cardProgress]);
    
    const handleUpdateCardMastery = (cardId: string, result: 'richtig' | 'teilweise' | 'falsch') => {
        setCardProgress(prev => {
            const current = prev[cardId] || { masteryLevel: 0, backgroundImageUrl: `https://source.unsplash.com/random/800x600?texture` };
            let newMasteryLevel = current.masteryLevel;
            switch (result) {
                case 'richtig':
                    newMasteryLevel = Math.min(5, current.masteryLevel + 1);
                    break;
                case 'falsch':
                    newMasteryLevel = 0;
                    break;
            }
            return {
                ...prev,
                [cardId]: { ...current, masteryLevel: newMasteryLevel }
            };
        });
    };

    const handleUpdateCardImage = (cardId: string, imageUrl: string) => {
         setCardProgress(prev => {
            const current = prev[cardId] || { masteryLevel: 0, backgroundImageUrl: '' };
            return {
                ...prev,
                [cardId]: { ...current, backgroundImageUrl: imageUrl }
            };
        });
    };

    if (selectedCategory) {
        const categoryCards = cards.filter(card => card.categoryId === selectedCategory.title);
        return (
            <FlashcardViewer 
                category={selectedCategory} 
                cards={categoryCards}
                onBack={() => setSelectedCategory(null)} 
                onUpdateCardMastery={handleUpdateCardMastery}
                onUpdateCardImage={handleUpdateCardImage}
                audioManager={audioManager}
                language={language}
                currentUser={currentUser}
            />
        )
    }

    return (
        <div className="flex flex-col h-full p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                 <div>
                    <h2 className="text-2xl font-bold">Flashcards</h2>
                    <p className="text-gray-400">Wähle eine Kategorie aus, um mit dem Lernen zu beginnen.</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                    <button 
                        onClick={handleResetProgress}
                        className="flex items-center justify-center gap-2 p-2 md:px-4 bg-gray-700 text-white font-semibold rounded-lg hover:bg-red-800 transition-colors"
                        title="Setzt den Lernfortschritt aller Karten auf Null zurück."
                    >
                        <Icon name="refresh" className="h-5 w-5"/>
                        <span className="hidden md:inline">Fortschritt zurücksetzen</span>
                    </button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto p-1">
                {studyLibrary.map(category => {
                    const categoryCards = cards.filter(c => c.categoryId === category.title);
                    const total = categoryCards.length;
                    if (total === 0) return null;

                    const mastered = categoryCards.filter(c => c.masteryLevel === 5).length;
                    const inProgress = categoryCards.filter(c => c.masteryLevel > 0 && c.masteryLevel < 5).length;
                    const notStarted = total - mastered - inProgress;
                    
                    const masteredPercentage = total > 0 ? (mastered / total) * 100 : 0;
                    const inProgressPercentage = total > 0 ? (inProgress / total) * 100 : 0;
                    
                    return (
                        <button 
                            key={category.title} 
                            onClick={() => { setSelectedCategory(category); audioManager.play('click'); }}
                            className="p-6 bg-gray-800 rounded-lg text-left hover:bg-gray-700 hover:ring-2 hover:ring-red-500 transition-all duration-200 flex flex-col justify-between min-h-[12rem]"
                        >
                            <div>
                                <h3 className="text-lg font-bold text-red-500">{category.title}</h3>
                                <p className="text-sm text-gray-500 mt-1">Karten Gesamt: {total}</p>
                            </div>
                            <div className="mt-4">
                                <div 
                                    className="w-full bg-gray-600 rounded-full h-2.5 flex overflow-hidden" 
                                    title={`Gemeistert: ${masteredPercentage.toFixed(0)}%, In Bearbeitung: ${inProgressPercentage.toFixed(0)}%`}
                                >
                                    <div className="bg-green-500 h-2.5" style={{ width: `${masteredPercentage}%` }}></div>
                                    <div className="bg-yellow-500 h-2.5" style={{ width: `${inProgressPercentage}%` }}></div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-center text-xs text-gray-400 mt-2">
                                    <div>
                                        <span className="block font-semibold text-gray-200">{notStarted}</span>
                                        <span>Nicht begonnen</span>
                                    </div>
                                    <div>
                                        <span className="block font-semibold text-yellow-400">{inProgress}</span>
                                        <span>In Bearbeitung</span>
                                    </div>
                                    <div>
                                        <span className="block font-semibold text-green-400">{mastered}</span>
                                        <span>Gemeistert</span>
                                    </div>
                                </div>
                            </div>
                        </button>
                    )
                })}
            </div>

            {isResetConfirmOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-lg p-8 w-full max-w-md shadow-xl border border-gray-700 text-center">
                        <h3 className="text-2xl font-bold mb-4 text-white">Fortschritt zurücksetzen?</h3>
                        <p className="text-gray-400 mb-6">
                            Möchten Sie den gesamten Lernfortschritt für alle Karten wirklich auf Null zurücksetzen? Diese Aktion kann nicht rückgängig gemacht werden.
                        </p>
                        <div className="flex justify-center gap-4">
                            <button 
                                onClick={() => { setIsResetConfirmOpen(false); audioManager.play('click'); }} 
                                className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500"
                            >
                                Abbrechen
                            </button>
                            <button 
                                onClick={executeResetProgress} 
                                className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700"
                            >
                                Bestätigen
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Flashcards;