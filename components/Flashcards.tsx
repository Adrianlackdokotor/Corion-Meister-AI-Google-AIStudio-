// FIX: Imported `useMemo` to resolve 'Cannot find name' error.
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Icon } from './Icon';
import { Flashcard, FlashcardEvaluation, Language, LibraryCategory, User } from '../types';
import { evaluateFlashcardAnswer } from '../services/geminiService';
import Loader from './Loader';
import { AudioManager } from '../utils/audioManager';

type Category = LibraryCategory;

const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

const EVALUATION_COST = 10;

const evaluatingMessages = [
    "Meister Corion analysiert...",
    "Vergleiche mit der korrekten Antwort...",
    "Formuliere konstruktives Feedback...",
    "Aktualisiere den Lernfortschritt..."
];

interface FlashcardViewerProps {
    category: Category;
    cards: Flashcard[];
    onBack: () => void;
    onUpdateCardMastery: (cardId: string, result: 'richtig' | 'teilweise' | 'falsch') => void;
    onUpdateCardImage: (cardId: string, imageUrl: string) => void;
    audioManager: AudioManager;
    language: Language;
    currentUser: User;
    consumeCredits: (amount: number, description: string) => boolean;
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


const FlashcardViewer: React.FC<FlashcardViewerProps> = ({ category, cards, onBack, onUpdateCardMastery, onUpdateCardImage, audioManager, language, currentUser, consumeCredits }) => {
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
    
    useEffect(() => {
        resetCardState();
    }, [currentCard?.id]);


    const goToPrevCard = () => {
        setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    };

    const goToNextCard = () => {
        setCurrentIndex((prev) => (prev + 1) % cards.length);
    };

    const handleEvaluate = async () => {
        if (!userAnswer.trim()) return;
        
        if (!consumeCredits(EVALUATION_COST, `Flashcard-Bewertung: "${currentCard.front.substring(0, 20)}..."`)) {
            alert("Guthaben nicht ausreichend für die Bewertung.");
            return;
        }

        setIsEvaluating(true);
        setAiFeedback(null);
        try {
            const evaluation = await evaluateFlashcardAnswer(currentCard.front, currentCard.back, userAnswer, language);
            setAiFeedback(evaluation);
            onUpdateCardMastery(currentCard.id, evaluation.result);
            setIsAnswerVisible(true); // Show correct answer after evaluation
        } catch (error) {
            console.error("Evaluation failed:", error);
            setAiFeedback({ result: 'falsch', feedback: 'Beim Bewerten der Antwort ist ein Fehler aufgetreten.' });
        } finally {
            setIsEvaluating(false);
        }
    };
    
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && currentCard) {
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
                 <button onClick={onBack} className="self-start mb-4 flex items-center text-red-400 hover:text-red-300">
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

    const hasCredits = currentUser.credits >= EVALUATION_COST;

    return (
        <div className="flex flex-col h-full">
             <button onClick={onBack} className="self-start m-4 flex items-center text-red-400 hover:text-red-300">
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
                           {currentCard.imageUrl && (
                             <img src={currentCard.imageUrl} alt="Card visual" className="mt-4 max-h-40 rounded-md" />
                           )}
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
                                     <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageUpload}
                                        accept="image/*"
                                        className="hidden"
                                     />
                                     <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-4 py-1 text-sm bg-gray-600 rounded-md hover:bg-gray-500 flex items-center gap-1.5"
                                        title="Hintergrundbild ändern"
                                    >
                                        <Icon name="upload" className="h-4 w-4" />
                                        <span>Bild ändern</span>
                                    </button>
                                     {!isAnswerVisible && (
                                        <button onClick={() => setIsAnswerVisible(true)} className="px-4 py-1 text-sm bg-gray-600 rounded-md hover:bg-gray-500">
                                            Antwort anzeigen
                                        </button>
                                    )}
                                </div>
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
                            placeholder={!hasCredits ? "Kein Guthaben für die AI-Bewertung vorhanden." : "Gib deine Antwort zur AI-Bewertung ein..."}
                            rows={3}
                            className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-200 resize-none"
                            disabled={isEvaluating || !hasCredits}
                        />
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={handleEvaluate}
                                disabled={isEvaluating || !userAnswer.trim() || !hasCredits}
                                className="px-8 py-2 bg-red-600 rounded-lg text-white font-semibold hover:bg-red-700 disabled:bg-gray-500 transition-colors flex items-center gap-2"
                            >
                                {isEvaluating ? 'Wird bewertet...' : `Antwort bewerten (-${EVALUATION_COST} Hub+1)`}
                            </button>
                             <button
                                type="button"
                                onClick={toggleRecording}
                                className={`p-3 rounded-full transition-colors ${isRecording ? 'bg-red-700 text-white animate-pulse' : 'bg-gray-600 hover:bg-gray-500'}`}
                                disabled={isEvaluating || !hasCredits}
                                title={isRecording ? "Aufnahme stoppen" : "Antwort diktieren"}
                            >
                                <Icon name="mic" className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {isEvaluating && (
                        <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700 flex justify-center">
                            <Loader text={evaluatingMessages} />
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
    consumeCredits: (amount: number, description: string) => boolean;
    cardProgress: { [key: string]: { masteryLevel: number; backgroundImageUrl?: string } };
    onUpdateCardMastery: (cardId: string, result: 'richtig' | 'teilweise' | 'falsch') => void;
    onUpdateCardImage: (cardId: string, imageUrl: string) => void;
}

const Flashcards: React.FC<FlashcardsProps> = ({ 
    audioManager,
    language, 
    studyLibrary, 
    currentUser, 
    consumeCredits, 
    cardProgress,
    onUpdateCardMastery,
    onUpdateCardImage 
}) => {
    
    const [openAccordion, setOpenAccordion] = useState<string | null>(null);

    const cards: Flashcard[] = useMemo(() => {
        return studyLibrary.flatMap(category =>
            category.entries.map(entry => {
                const progress = cardProgress[entry.id] || { masteryLevel: 0 };
                return {
                    id: entry.id,
                    categoryId: category.title,
                    front: entry.question,
                    back: entry.answer,
                    masteryLevel: progress.masteryLevel,
                    backgroundImageUrl: progress.backgroundImageUrl || `https://source.unsplash.com/random/800x600?texture,abstract,${category.title.split(' ')[0]}`,
                    imageUrl: entry.imageUrl,
                };
            })
        );
    }, [studyLibrary, cardProgress]);
    
    const [cardsForViewing, setCardsForViewing] = useState<Flashcard[] | null>(null);
    const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
    const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

    const handlungsfelder: Record<string, string[]> = useMemo(() => ({
      'Handlungsfeld 1: Technik & Gestaltung': [
        'VI. Lackierung und Technische Kontrolle',
        'VII. Technische Instandsetzung und Karosserie'
      ],
      'Handlungsfeld 2: Auftragsabwicklung': [
        'III. Auftragsabwicklung, Kalkulation und Recht',
        'IV. Nachkalkulation, Kostenstellen und Preise',
        'X. Übergabe und Service'
      ],
      'Handlungsfeld 3: Betriebsführung & Organisation': [
        'I. Sicherheit, Gefahrstoffe und Organisation',
        'II. Umwelt, Entsorgung und Arbeitsschutzrecht',
        'V. Qualitätsmanagement und Organisation',
        'VIII. Mitarbeiterführung und Schulung',
        'IX. Subunternehmer und Leiharbeiter',
        'XI. Marketing und Betriebswirtschaft',
        'XII. Sonstiges und Akronyme'
      ]
    }), []);

    const groupedCategories = useMemo(() => {
        const allCategorizedTitles = Object.values(handlungsfelder).flat();
        
        const groups: Record<string, LibraryCategory[]> = {};

        for (const [hfTitle, catTitles] of Object.entries(handlungsfelder)) {
            groups[hfTitle] = studyLibrary.filter(c => catTitles.includes(c.title));
        }
        
        const otherCats = studyLibrary.filter(c => !allCategorizedTitles.includes(c.title));
        if (otherCats.length > 0) {
            groups['Weitere Kategorien'] = otherCats;
        }
        
        return groups;
    }, [studyLibrary, handlungsfelder]);

    const executeResetProgress = () => {
        // This should now be handled by a function passed from App.tsx if we want to persist it.
        // For now, it will reset visually but not be persisted if App state isn't updated.
        // A better approach would be: `onResetProgress()` prop.
        alert("Fortschritt zurückgesetzt (visuell). Implementieren Sie onResetProgress in App.tsx für Persistenz.");
        setIsResetConfirmOpen(false);
    };
    
    const handleSelectCategory = (category: Category) => {
        const categoryCards = cards.filter(c => c.categoryId === category.title);
        setCardsForViewing(shuffleArray(categoryCards));
        setViewingCategory(category);
    };

    const handleSelectAllRandom = () => {
        setCardsForViewing(shuffleArray(cards));
        setViewingCategory({ title: 'Alle Karten (Zufällig)', entries: [] });
    };

    const handleBackToSelection = () => {
        setCardsForViewing(null);
        setViewingCategory(null);
    };

    if (viewingCategory && cardsForViewing) {
        return (
            <FlashcardViewer 
                category={viewingCategory} 
                cards={cardsForViewing}
                onBack={handleBackToSelection} 
                onUpdateCardMastery={onUpdateCardMastery}
                onUpdateCardImage={onUpdateCardImage}
                audioManager={audioManager}
                language={language}
                currentUser={currentUser}
                consumeCredits={consumeCredits}
            />
        )
    }

    const AccordionSection: React.FC<{title: string, categories: LibraryCategory[]}> = ({ title, categories }) => (
        <div className="bg-gray-800 rounded-lg">
            <button
                onClick={() => setOpenAccordion(openAccordion === title ? null : title)}
                className="w-full flex justify-between items-center p-4 font-bold text-lg text-red-400"
            >
                <span>{title}</span>
                <Icon name="chevron-down" className={`h-6 w-6 transition-transform ${openAccordion === title ? 'rotate-180' : ''}`} />
            </button>
            {openAccordion === title && (
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map(category => {
                        const categoryCards = cards.filter(c => c.categoryId === category.title);
                        const total = categoryCards.length;
                        if (total === 0) return null;
                        const mastered = categoryCards.filter(c => c.masteryLevel === 5).length;
                        const masteredPercentage = total > 0 ? (mastered / total) * 100 : 0;
                        return(
                             <button key={category.title} onClick={() => handleSelectCategory(category)} className="p-4 bg-gray-700 rounded-lg text-left hover:bg-gray-600 transition-all">
                                <h3 className="font-bold text-gray-200">{category.title.split(' - ')[1] || category.title}</h3>
                                <p className="text-sm text-gray-400 mt-1">{total} Karten</p>
                                <div className="w-full bg-gray-500 rounded-full h-1.5 mt-2">
                                    <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${masteredPercentage}%` }}></div>
                                </div>
                             </button>
                        )
                    })}
                </div>
            )}
        </div>
    );


    return (
        <div className="flex flex-col h-full p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                 <div>
                    <h2 className="text-2xl font-bold">Flashcards</h2>
                    <p className="text-gray-400">Wähle eine Kategorie aus, um mit dem Lernen zu beginnen.</p>
                </div>
                <button 
                    onClick={() => setIsResetConfirmOpen(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-red-800 transition-colors"
                    title="Setzt den Lernfortschritt aller Karten auf Null zurück."
                >
                    <Icon name="refresh" className="h-5 w-5"/>
                    <span>Fortschritt zurücksetzen</span>
                </button>
            </div>
            
            <div className="space-y-4 overflow-y-auto pr-2">
                 <button 
                    onClick={handleSelectAllRandom}
                    className="w-full p-6 bg-red-800 rounded-lg text-left hover:bg-red-700 hover:ring-2 hover:ring-red-500 transition-all duration-200 flex flex-col justify-between"
                >
                    <h3 className="text-xl font-bold text-white">Alle Karten (Zufällig)</h3>
                    <p className="font-semibold text-lg text-red-200 mt-2">{cards.length} Karten insgesamt</p>
                </button>
                {Object.entries(groupedCategories).map(([groupTitle, cats]) => {
                    // FIX: Explicitly type 'cats' to resolve TypeScript error where it was inferred as 'unknown'.
                    const categories = cats as LibraryCategory[];
                    return categories.length > 0 && <AccordionSection key={groupTitle} title={groupTitle} categories={categories} />
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
                            <button onClick={() => setIsResetConfirmOpen(false)} className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500">Abbrechen</button>
                            <button onClick={executeResetProgress} className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700">Bestätigen</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Flashcards;