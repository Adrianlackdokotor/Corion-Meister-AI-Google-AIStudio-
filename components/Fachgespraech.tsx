import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Chat } from '@google/genai';
import { ChatMessage, FachgespraechTopic, User } from '../types';
import { createChatSession, streamChatMessage, generateSpeech } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audioUtils';
import { processFile } from '../utils/fileProcessor';
import { Icon } from './Icon';
import Loader from './Loader';

interface FachgespraechProps {
  studyMaterials: string;
  topics: FachgespraechTopic[];
  onUpdateTopics: React.Dispatch<React.SetStateAction<FachgespraechTopic[]>>;
  currentUser: User;
}

const AddNewTopicModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (topic: Omit<FachgespraechTopic, 'id'>) => void;
}> = ({ isOpen, onClose, onSave }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        
        setIsProcessing(true);
        setProgress(0);
        
        try {
            const file = e.target.files[0];
            const text = await processFile(file, (p) => setProgress(p));
            setContent(prev => prev + '\n\n--- Aus Datei extrahiert ---\n' + text);
        } catch (error) {
            console.error('File processing failed:', error);
            alert('Fehler beim Verarbeiten der Datei.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSave = () => {
        if (!title.trim() || !content.trim()) {
            alert('Titel und Inhalt dürfen nicht leer sein.');
            return;
        }
        onSave({ title, content });
        setTitle('');
        setContent('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg p-8 w-full max-w-2xl shadow-xl border border-gray-700">
                <h3 className="text-2xl font-bold mb-6">Neues Thema hinzufügen</h3>
                <div className="space-y-4">
                     <div>
                        <label htmlFor="topic-title" className="block text-sm font-medium text-gray-300 mb-1">Thema Titel</label>
                        <input
                            id="topic-title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md"
                            placeholder="z.B. Instandsetzung von Kunststoffteilen"
                        />
                    </div>
                     <div>
                        <label htmlFor="topic-content" className="block text-sm font-medium text-gray-300 mb-1">Inhalt (Text einfügen oder Datei hochladen)</label>
                        <textarea
                            id="topic-content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={8}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md resize-none"
                            placeholder="Schreiben Sie hier den Inhalt Ihrer Präsentation..."
                        />
                    </div>
                     <div>
                         <label className="block text-sm font-medium text-gray-300 mb-1">Oder Datei hochladen (PDF, DOCX, Bild)</label>
                         <input
                            type="file"
                            onChange={handleFileChange}
                            accept=".pdf,.docx,image/*"
                            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700"
                            disabled={isProcessing}
                        />
                    </div>
                    {isProcessing && (
                        <div className="w-full bg-gray-600 rounded-full h-2.5">
                            <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                            <p className="text-xs text-center text-gray-300 mt-1">Verarbeite... {progress}%</p>
                        </div>
                    )}
                </div>
                <div className="mt-6 flex justify-end gap-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500">Abbrechen</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700">Thema speichern</button>
                </div>
            </div>
        </div>
    );
};


const Fachgespraech: React.FC<FachgespraechProps> = ({ studyMaterials, topics, onUpdateTopics, currentUser }) => {
    const [mode, setMode] = useState<'practice' | 'exam'>('practice');
    const [conversationState, setConversationState] = useState<'setup' | 'running' | 'finished'>('setup');
    const [selectedTopicId, setSelectedTopicId] = useState<string>('general');
    const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
    
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [chat, setChat] = useState<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    
    const getSystemPrompt = useCallback(() => {
        const selectedTopic = selectedTopicId === 'general' 
            ? { title: 'Allgemeines Wissen', content: studyMaterials }
            : topics.find(t => t.id === selectedTopicId);

        if (!selectedTopic) return ''; // Should not happen

        const examTopic = selectedTopic.content;
        
        if (mode === 'practice') {
            return `
**[P: PERSONA]**
Du bist ein freundlicher und hilfsbereiter Prüfer im Prüfungsausschuss für die Meisterschule KFZ Lackierer. Du führst eine Übungssitzung mit einem Schüler ("Meister-Anwärter") durch. **Deine gesamte Kommunikation mit dem Schüler muss auf DEUTSCH erfolgen.**
* **Ton:** Unterstützend, ermutigend, aber professionell. Du stellst klare Fragen **auf Deutsch**.
* **Mission:** Hilf dem Schüler, sein mündliches Fachgespräch basierend auf dem vorgegebenen Thema zu üben, indem du ausschließlich **auf Deutsch** kommunizierst.
* **Regeln:**
    1. Beginne das Gespräch mit "Guten Tag, fangen wir mit der Übungssitzung an. Bitte stellen Sie Ihr Thema vor." und warte auf eine Antwort.
    2. Stelle relevante Fragen **auf Deutsch**, eine nach der anderen, die sich STRIKT auf den folgenden Thementext beziehen.
    3. Warte auf die Antwort des Schülers.
    4. Gib nach jeder Antwort des Schülers konstruktives Feedback **auf DEUTSCH**. Zeige auf, was gut war, und schlage vor, wie die Antwort verbessert werden kann, um vollständiger oder professioneller zu sein. Wenn die Antwort falsch ist, korrigiere sie und erkläre kurz das richtige Konzept.
    5. Stelle unmittelbar nach deinem Feedback die nächste Frage **auf DEUTSCH**. Warte nicht auf eine weitere Antwort oder Bestätigung des Schülers.
    6. Halte eine natürliche Prüfungsgesprächsatmosphäre **auf Deutsch** aufrecht.

**[T: PRÜFUNGSTHEMA: ${selectedTopic.title}]**
---
${examTopic}
---
`;
        } else { // exam mode
            return `
**[P: PERSONA]**
Du bist ein anspruchsvolles, aber faires Mitglied des Prüfungsausschusses ("Prüfungsausschuss") für die Meisterschule KFZ Lackierer. Du bewertest einen Schüler ("Meister-Anwärter") in seiner mündlichen Abschlussprüfung ("Fachgespräch"). **Deine gesamte Kommunikation mit dem Schüler muss auf DEUTSCH erfolgen.**
* **Ton:** Formell, ernst, professionell.
* **Mission:** Bewerte das Wissen des Schülers basierend auf dem vorgegebenen Thema, indem du ausschließlich **auf Deutsch** kommunizierst.
* **Regeln:**
    1. Beginne die Prüfung mit "Guten Tag. Die Prüfung beginnt jetzt. Bitte stellen Sie Ihr Thema vor." und warte auf die Antwort.
    2. Stelle relevante und herausfordernde Fragen **auf Deutsch**, eine nach der anderen, die sich STRIKT auf den folgenden Thementext beziehen.
    3. Warte auf die Antwort des Schülers.
    4. Gib während der Prüfung KEINE Hinweise, Hilfestellungen oder Feedback. Antworte **auf Deutsch** nur mit "Verstanden.", "Fahren Sie fort." oder direkt mit der nächsten Frage.
    5. Wenn der Schüler sagt "Ich habe meine Ausführungen beendet" oder eine ähnliche Formulierung verwendet, um abzuschließen, beende die Befragung.
    6. Gib am Ende eine detaillierte und strukturierte Bewertung der Leistung des Schülers **auf Deutsch**. Bewerte Klarheit, technische Korrektheit und Souveränität. Formuliere einen Absatz für **Stärken** und einen Absatz für **Verbesserungspotenzial**. Beginne die Endbewertung mit "Die Prüfung ist beendet. Hier ist meine Bewertung:"

**[T: PRÜFUNGSTHEMA: ${selectedTopic.title}]**
---
${examTopic}
---
`;
        }
    }, [mode, studyMaterials, topics, selectedTopicId]);

    const handleStartConversation = async () => {
        setIsLoading(true);
        setConversationState('running');
        const systemInstruction = getSystemPrompt();
        if(!systemInstruction) {
             alert("Thema konnte nicht geladen werden.");
             setIsLoading(false);
             setConversationState('setup');
             return;
        }
        const newChat = createChatSession(systemInstruction);
        setChat(newChat);

        const initialMessage: ChatMessage = { role: 'model', text: '' };
        setMessages([initialMessage]);
        
        try {
            const stream = await streamChatMessage(newChat, "Beginne das Gespräch gemäß den Anweisungen.");
            let text = '';
            for await (const chunk of stream) {
                text += chunk.text;
                setMessages([{ ...initialMessage, text }]);
            }
        } catch (error) {
            console.error("Error starting conversation:", error);
            setMessages([{ role: 'model', text: 'Beim Initialisieren des Gesprächs ist ein Fehler aufgetreten.' }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGoBackToSetup = () => {
        if (conversationState === 'running' && !window.confirm("Möchten Sie die aktuelle Simulation wirklich beenden?")) {
            return;
        }
        setMessages([]);
        setChat(null);
        setIsLoading(false);
        setUserInput('');
        setIsRecording(false);
        setConversationState('setup');
    };

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'de-DE';
            recognition.onresult = (event) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) setUserInput(prev => prev + finalTranscript + ' ');
            };
            recognitionRef.current = recognition;
        }
    }, []);

    const toggleRecording = () => {
        if (isRecording) {
            recognitionRef.current?.stop();
            setIsRecording(false);
        } else {
            setUserInput('');
            recognitionRef.current?.start();
            setIsRecording(true);
        }
    };
    
    useEffect(() => { if (!isRecording && userInput.trim()) { handleSendMessage(); } }, [isRecording]);

    const handleSendMessage = async () => {
        if (!userInput.trim() || !chat) return;
        const newUserMessage: ChatMessage = { role: 'user', text: userInput };
        setMessages(prev => [...prev, newUserMessage]);
        setUserInput('');
        setIsLoading(true);
        const modelResponse: ChatMessage = { role: 'model', text: '' };
        setMessages(prev => [...prev, modelResponse]);
        try {
            const stream = await streamChatMessage(chat, userInput);
            let text = '';
            for await (const chunk of stream) {
                text += chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = { ...modelResponse, text };
                    return newMessages;
                });
            }
             if (mode === 'exam' && text.includes("Die Prüfung ist beendet.")) { setConversationState('finished'); }
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = { role: 'model', text: 'Entschuldigung, es ist ein Fehler aufgetreten.' };
                return newMessages;
            });
        } finally { setIsLoading(false); }
    };
    
    const handlePlayAudio = async (text: string) => {
        if (isSpeaking) return;
        setIsSpeaking(true);
        try {
            if (!audioContextRef.current) { audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 }); }
            const audioContext = audioContextRef.current;
            const base64Audio = await generateSpeech(text);
            const audioBytes = decode(base64Audio);
            const audioBuffer = await decodeAudioData(audioBytes, audioContext, 24000, 1);
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);
            source.start();
            source.onended = () => setIsSpeaking(false);
        } catch (err) { console.error(err); setIsSpeaking(false); }
    };

    const handleSaveNewTopic = (topic: Omit<FachgespraechTopic, 'id'>) => {
        const newTopic = { ...topic, id: `topic-${Date.now()}` };
        onUpdateTopics(prev => [...prev, newTopic]);
        setSelectedTopicId(newTopic.id);
    };
    
    const currentTopicContent = selectedTopicId === 'general' ? studyMaterials : topics.find(t => t.id === selectedTopicId)?.content || '';

    const renderSetup = () => (
        <div className="flex-1 flex flex-col justify-center items-center p-6">
            <div className="w-full max-w-3xl text-center">
                <Icon name="exam" className="h-16 w-16 mx-auto mb-4 text-red-500"/>
                <h2 className="text-3xl font-bold mb-2">Simulation: Fachgespräch</h2>
                <p className="text-gray-400 mb-6">Bereiten Sie sich auf Ihre mündliche Prüfung vor.</p>
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-left">
                     <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-200 mb-2">1. Prüfungsthema wählen</h3>
                         <div className="flex gap-2">
                             <select
                                value={selectedTopicId}
                                onChange={(e) => setSelectedTopicId(e.target.value)}
                                className="flex-grow p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                <option value="general">Allgemeines Wissen (Lernbibliothek)</option>
                                {topics.map(topic => (
                                    <option key={topic.id} value={topic.id}>{topic.title}</option>
                                ))}
                            </select>
                            <button onClick={() => setIsTopicModalOpen(true)} className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 flex items-center gap-2">
                                <Icon name="add" className="h-5 w-5" />
                                <span>Neues Thema</span>
                            </button>
                         </div>
                        <div className="w-full h-32 mt-3 p-3 bg-gray-900 border border-gray-600 rounded-md overflow-y-auto">
                            <p className="text-gray-300 whitespace-pre-wrap text-sm">{currentTopicContent || "Wählen Sie ein Thema, um den Inhalt anzuzeigen."}</p>
                        </div>
                    </div>
                    <div className="mb-6">
                        <h3 className="block text-lg font-semibold text-gray-200 mb-2">2. Wählen Sie einen Modus</h3>
                        <div className="flex gap-4">
                             <button onClick={() => setMode('practice')} className={`flex-1 p-4 rounded-md border-2 text-center ${mode === 'practice' ? 'bg-red-900/50 border-red-500' : 'bg-gray-700 border-gray-700 hover:border-gray-500'}`}>
                                <h4 className="font-bold">Übungsmodus</h4>
                                <p className="text-sm text-gray-400">Erhalten Sie Hinweise und korrigierendes Feedback.</p>
                            </button>
                             <button onClick={() => setMode('exam')} className={`flex-1 p-4 rounded-md border-2 text-center ${mode === 'exam' ? 'bg-red-900/50 border-red-500' : 'bg-gray-700 border-gray-700 hover:border-gray-500'}`}>
                                 <h4 className="font-bold">Prüfungsmodus</h4>
                                <p className="text-sm text-gray-400">Echte Prüfungssimulation mit Bewertung am Ende.</p>
                             </button>
                        </div>
                    </div>
                    <button 
                        onClick={handleStartConversation} 
                        disabled={!currentTopicContent.trim() || currentUser.credits <= 0} 
                        className="w-full py-3 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:bg-gray-500 transition-colors text-lg"
                    >
                        Simulation starten
                    </button>
                    {currentUser.credits <= 0 && <p className="text-yellow-400 mt-4 text-center">Sie haben kein Guthaben mehr, um eine Simulation zu starten.</p>}
                </div>
            </div>
            <AddNewTopicModal isOpen={isTopicModalOpen} onClose={() => setIsTopicModalOpen(false)} onSave={handleSaveNewTopic} />
        </div>
    );
    
    const renderConversation = () => (
        <div className="flex flex-col h-full bg-gray-900">
            <div className="relative flex items-center justify-center p-4 border-b border-gray-700">
                <button onClick={handleGoBackToSetup} className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center text-red-400 hover:text-red-300 transition-colors">
                    <Icon name="back" className="h-5 w-5 mr-2" />
                    Zurück
                </button>
                <h2 className="text-xl font-semibold">
                    Simulation: <span className={mode === 'practice' ? 'text-yellow-400' : 'text-red-400'}>{mode === 'practice' ? 'Übungsmodus' : 'Prüfungsmodus'}</span>
                </h2>
            </div>
             <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4 max-w-4xl mx-auto">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                             {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0"><Icon name="exam" className="h-5 w-5"/></div>}
                            <div className={`max-w-xl p-3 rounded-lg ${msg.role === 'user' ? 'bg-red-600' : 'bg-gray-700'}`}>
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                                {msg.role === 'model' && msg.text && (
                                     <button onClick={() => handlePlayAudio(msg.text)} disabled={isSpeaking} className="text-gray-400 hover:text-white mt-2 disabled:opacity-50">
                                        <Icon name="volume-up" className="h-5 w-5"/>
                                     </button>
                                )}
                            </div>
                        </div>
                    ))}
                     {isLoading && (
                        <div className="flex justify-start">
                            <div className="max-w-xl p-3 rounded-lg bg-gray-700">
                                <Loader text="Prüfer überlegt..." />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            <div className="p-4 border-t border-gray-700 flex flex-col items-center justify-center">
                {isRecording && <p className="text-gray-400 mb-2 animate-pulse">Höre zu...</p>}
                 <p className="mb-4 text-gray-300 h-10">{userInput}</p>
                 <button onClick={toggleRecording} className={`p-5 rounded-full transition-colors text-white ${isRecording ? 'bg-red-800 animate-pulse' : 'bg-red-600 hover:bg-red-700'}`}>
                    <Icon name="mic" className="h-8 w-8" />
                </button>
                <p className="mt-2 text-sm text-gray-500">{isRecording ? "Aufnahme stoppen & senden" : "Sprechen beginnen"}</p>
                 {mode === 'exam' && conversationState === 'running' && (
                     <button onClick={() => setUserInput("Ich habe meine Ausführungen beendet")} className="mt-4 px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-sm">
                         Ich habe meine Ausführungen beendet
                     </button>
                 )}
            </div>
        </div>
    );
    
    const renderFinished = () => (
         <div className="flex flex-col h-full justify-center items-center p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Prüfung beendet</h2>
             <div className="w-full max-w-3xl bg-gray-800 p-6 rounded-lg shadow-lg text-left overflow-y-auto">
                <h3 className="text-xl font-bold text-red-400 mb-4">Abschließende Bewertung</h3>
                <p className="whitespace-pre-wrap text-gray-200">
                    {messages.find(m => m.text.includes("Die Prüfung ist beendet."))?.text}
                </p>
            </div>
            <button onClick={handleGoBackToSetup} className="mt-6 px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2">
                <Icon name="back" className="h-5 w-5" />
                Zurück zum Setup
            </button>
         </div>
    );

    switch (conversationState) {
        case 'running': return renderConversation();
        case 'finished': return renderFinished();
        default: return renderSetup();
    }
};

export default Fachgespraech;