import React, { useState } from 'react';
import { MultipleChoiceQuestion, Language, User } from '../types';
import { generateMultipleChoiceQuiz } from '../services/geminiService';
import Loader from './Loader';
import { Icon } from './Icon';

interface MultipleChoiceProps {
  studyMaterials: string;
  language: Language;
  currentUser: User;
}

const MultipleChoice: React.FC<MultipleChoiceProps> = ({ studyMaterials, language, currentUser }) => {
    const [quiz, setQuiz] = useState<MultipleChoiceQuestion[] | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
    const [score, setScore] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [askedQuestions, setAskedQuestions] = useState<string[]>([]);

    const handleGenerateQuiz = async () => {
        if (!studyMaterials.trim()) {
            setError('Die Lernmaterialien sind leer. Inhalte können in der "Lernbibliothek" eingesehen werden.');
            return;
        }
        if (currentUser.credits <= 0) {
            setError('Ihr Guthaben reicht nicht aus, um ein Quiz zu erstellen.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setQuiz(null);
        try {
            const generatedQuiz = await generateMultipleChoiceQuiz(studyMaterials, language, 15, askedQuestions);
            if (generatedQuiz.length === 0) {
                setError("Es konnten keine neuen, einzigartigen Fragen mehr aus dem Material generiert werden. Setzen Sie den Fragenverlauf zurück, um erneut zu beginnen.");
                setAskedQuestions([]); // Reset if exhausted
            } else {
                 setQuiz(generatedQuiz);
                 setAskedQuestions(prev => [...prev, ...generatedQuiz.map(q => q.question)]);
            }
            setCurrentQuestionIndex(0);
            setScore(0);
            setSelectedAnswerId(null);
        } catch (err: any) {
            setError(err.message || 'Ein unbekannter Fehler ist aufgetreten.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnswerSelect = (optionId: string) => {
        if (selectedAnswerId) return; // Prevent changing answer

        setSelectedAnswerId(optionId);
        if (optionId === quiz![currentQuestionIndex].correctAnswerId) {
            setScore(prev => prev + 1);
        }
    };
    
    const handleNextQuestion = () => {
        setSelectedAnswerId(null);
        setCurrentQuestionIndex(prev => prev + 1);
    };

    const handleRestart = () => {
        setQuiz(null);
        setCurrentQuestionIndex(0);
        setScore(0);
        setSelectedAnswerId(null);
        setError(null);
    };

    const renderQuiz = () => {
        if (!quiz) return null;

        if (currentQuestionIndex >= quiz.length) {
            return (
                <div className="text-center bg-gray-800 p-8 rounded-lg">
                    <h3 className="text-2xl font-bold mb-4">Quiz beendet!</h3>
                    <p className="text-xl mb-6">Ihr Endergebnis: <span className="font-bold text-red-400">{score}</span> von <span className="font-bold text-red-400">{quiz.length}</span> richtig.</p>
                    <button
                        onClick={handleRestart}
                        className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Zurück zum Start
                    </button>
                </div>
            );
        }

        const currentQuestion = quiz[currentQuestionIndex];

        return (
            <div className="w-full max-w-3xl mx-auto">
                <div className="mb-4 flex justify-between items-center text-lg">
                    <p className="font-semibold">Frage {currentQuestionIndex + 1} von {quiz.length}</p>
                    <p className="font-semibold">Punkte: <span className="text-red-400">{score}</span></p>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-semibold mb-6">{currentQuestion.question}</h3>
                    <div className="space-y-3">
                        {currentQuestion.options.map(option => {
                            const isSelected = selectedAnswerId === option.id;
                            const isCorrect = currentQuestion.correctAnswerId === option.id;
                            let buttonClass = 'bg-gray-700 hover:bg-gray-600';
                            if (selectedAnswerId) {
                                if (isCorrect) {
                                    buttonClass = 'bg-green-700 border-green-500 ring-2 ring-green-500'; // Correct answer
                                } else if (isSelected && !isCorrect) {
                                    buttonClass = 'bg-red-800 border-red-600'; // Incorrectly selected
                                } else {
                                     buttonClass = 'bg-gray-700 opacity-60'; // Not selected
                                }
                            }

                            return (
                                <button
                                    key={option.id}
                                    onClick={() => handleAnswerSelect(option.id)}
                                    disabled={!!selectedAnswerId}
                                    className={`w-full text-left p-4 rounded-lg border-2 border-transparent transition-all duration-200 ${buttonClass}`}
                                >
                                    <span className="font-bold mr-2">{option.id}.</span> {option.text}
                                </button>
                            );
                        })}
                    </div>

                    {selectedAnswerId && (
                        <div className="mt-6 p-4 bg-gray-900 rounded-md border border-gray-700">
                             <h4 className="font-bold text-red-400">Erklärung:</h4>
                             <p className="mt-2 text-gray-300">{currentQuestion.explanation}</p>
                             <div className="text-right mt-4">
                                <button
                                    onClick={handleNextQuestion}
                                    className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700"
                                >
                                    {currentQuestionIndex === quiz.length - 1 ? 'Ergebnisse anzeigen' : 'Nächste Frage'}
                                </button>
                             </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-gray-900 p-6">
            <div className="flex-shrink-0 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Multiple Choice Fragen</h2>
                    <p className="text-sm text-gray-400">Testen Sie Ihr Wissen basierend auf den von Ihnen bereitgestellten Materialien.</p>
                </div>
                 {quiz && (
                    <button onClick={handleRestart} className="flex items-center text-red-400 hover:text-red-300 transition-colors">
                        <Icon name="back" className="h-5 w-5 mr-2" />
                        Zurück
                    </button>
                )}
            </div>

            {!quiz ? (
                 <div className="flex-1 flex flex-col justify-center items-center">
                    <div className="w-full max-w-2xl text-center">
                       {studyMaterials.trim() ? (
                         <>
                            <p className="mb-4 text-gray-300">Bereit, Ihr Wissen zu testen? Klicken Sie, um ein Quiz mit 15 Fragen basierend auf Ihren Lernmaterialien zu erstellen.</p>
                            <button
                                onClick={handleGenerateQuiz}
                                disabled={isLoading || currentUser.credits <= 0}
                                className="w-full max-w-xs mx-auto py-3 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:bg-gray-500 transition-colors flex items-center justify-center text-lg"
                            >
                                <Icon name="list" className="h-6 w-6 mr-2"/>
                                {isLoading ? 'Quiz wird erstellt...' : 'Quiz erstellen'}
                            </button>
                            {currentUser.credits <= 0 && <p className="text-yellow-400 mt-4">Sie haben kein Guthaben mehr, um ein Quiz zu erstellen.</p>}
                         </>
                       ) : (
                         <div className="p-6 bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg">
                            <h3 className="text-xl font-bold mb-2">Kein Lernmaterial</h3>
                            <p className="text-gray-400">Die Lernmaterialien sind leer. Inhalte können in der <span className="font-semibold">"Lernbibliothek"</span> eingesehen werden.</p>
                        </div>
                       )}
                       {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex justify-center items-center overflow-y-auto pt-4">
                     {isLoading ? <Loader text="Quiz wird erstellt..." /> : renderQuiz()}
                </div>
            )}
        </div>
    );
};

export default MultipleChoice;