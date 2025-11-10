
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Chat } from '@google/genai';
import { ChatMessage } from '../types';
import { createChatSession, streamChatMessage } from '../services/geminiService';
import { Icon } from './Icon';
import Loader from './Loader';

interface ChatInterfaceProps {
  studyMaterials: string;
}

const getPersonaPrompt = (materials: string) => `
**[P: PERSONA]**
Du bist "Lackierer-Meister Corion", ein KI-Lerncoach für angehende KFZ-Lackierer-Meister.
* **Ton:** Professionell, geduldig und unterstützend.
* **Mission:** Führe den Schüler ("Meister-Anwärter") aktiv durch die bereitgestellten Lernmaterialien.
* **Regeln:**
  1. Deine einzige Wissensquelle sind die untenstehenden Lernmaterialien. Beziehe dich **immer** darauf.
  2. Sei proaktiv. Nachdem du geantwortet hast, schlage immer den nächsten Schritt vor. Nutze Vorschläge wie: "Möchtest du, dass ich dir dazu einige Übungsfragen stelle?", "Soll ich dir das Konzept von [Konzept aus Material] genauer erklären?", "Wollen wir ein anderes Thema aus deinen Materialien durchgehen?".
  3. Gib keine direkten Antworten, wenn der Schüler nicht weiterweiß. Stelle stattdessen gezielte Fragen, um ihn zur Lösung zu führen.
  4. Starte die Konversation mit einer kurzen, professionellen Begrüßung und erwähne den "Corion Tages-Streak".

**[T: LERNMATERIALIEN]**
---
${materials.trim() || "Es wurden noch keine Lernmaterialien bereitgestellt. Die Lerninhalte können in der 'Lernbibliothek' eingesehen werden."}
---
`;

const ChatInterface: React.FC<ChatInterfaceProps> = ({ studyMaterials }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [chat, setChat] = useState<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        setIsLoading(true);
        const prompt = getPersonaPrompt(studyMaterials);
        const newChat = createChatSession(prompt);
        setChat(newChat);
        
        const initialMessage: ChatMessage = { role: 'model', text: '' };
        setMessages([initialMessage]);

        streamChatMessage(newChat, "Begrüße mich und beginne die Sitzung.")
            .then(async (stream) => {
                let text = '';
                for await (const chunk of stream) {
                    text += chunk.text;
                    setMessages([{ ...initialMessage, text }]);
                }
                setIsLoading(false);
            })
            .catch(error => {
                console.error("Error starting chat:", error);
                setMessages([{ role: 'model', text: 'Beim Initialisieren des Chats ist ein Fehler aufgetreten.' }]);
                setIsLoading(false);
            });
    }, [studyMaterials]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'de-DE';
            recognitionRef.current.onresult = (event) => {
                let interimTranscript = '';
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
                setUserInput(finalTranscript + interimTranscript);
            };
        }
    }, []);

    const toggleRecording = () => {
        if (isRecording) {
            recognitionRef.current?.stop();
            setIsRecording(false);
        } else {
            recognitionRef.current?.start();
            setIsRecording(true);
        }
    };

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
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
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = { role: 'model', text: 'Entschuldigung, es ist ein Fehler aufgetreten.' };
                return newMessages;
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="flex flex-col h-full bg-gray-900">
            <div className="p-4 border-b border-gray-700">
                <h2 className="text-xl font-semibold">Lackierer-Meister Corion</h2>
                <p className="text-sm text-gray-400">Ihr persönlicher Leitfaden für die Meisterprüfung.</p>
            </div>
            
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 p-4 overflow-y-auto">
                    <div className="space-y-4 max-w-4xl mx-auto">
                         {studyMaterials.trim() === '' && (
                            <div className="m-4 p-4 bg-yellow-900/50 border border-yellow-700 rounded-lg text-yellow-200 text-center">
                                <p className="font-bold">Keine Lernmaterialien gefunden.</p>
                                <p>Die Lerninhalte können in der <span className="font-semibold">"Lernbibliothek"</span> eingesehen werden.</p>
                            </div>
                        )}
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xl p-3 rounded-lg ${msg.role === 'user' ? 'bg-red-600' : 'bg-gray-700'}`}>
                                    <p className="whitespace-pre-wrap">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                         {isLoading && (
                            <div className="flex justify-start">
                                <div className="max-w-xl p-3 rounded-lg bg-gray-700">
                                    <Loader text="Corion überlegt..." />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                <div className="p-4 border-t border-gray-700">
                    <form onSubmit={handleSendMessage} className="flex items-center space-x-2 max-w-4xl mx-auto">
                        <textarea
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder={isRecording ? "Höre zu..." : "Schreiben Sie Ihre Nachricht oder einen Befehl..."}
                            rows={1}
                            className="flex-1 p-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-200 resize-none"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    handleSendMessage(e);
                                }
                            }}
                            disabled={!studyMaterials.trim()}
                        />
                        <button
                            type="button"
                            onClick={toggleRecording}
                            className={`p-2 rounded-full transition-colors ${isRecording ? 'bg-red-700 text-white animate-pulse' : 'bg-gray-600 hover:bg-gray-500'}`}
                             disabled={!studyMaterials.trim()}
                        >
                            <Icon name="mic" className="h-6 w-6" />
                        </button>
                        <button type="submit" disabled={isLoading || !userInput.trim()} className="p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-500">
                            <Icon name="send" className="h-6 w-6" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;