
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Icon } from './Icon';
import { MateMaterial, Language, ChatMessage, User } from '../types';
import { generateMateMaterialFromText, explainTextSelection, createChatSession, streamChatMessage } from '../services/geminiService';
import { processFile } from '../utils/fileProcessor';
import Loader from './Loader';
import { Chat } from '@google/genai';

const AI_MATERIAL_COST = 250;
const AI_EXPLANATION_COST = 5;
const AI_CHAT_COST = 1;

// --- MODAL: Add/Edit Manually ---
const AddManualModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (material: Omit<MateMaterial, 'id'>) => void;
}> = ({ isOpen, onClose, onSave }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

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
                <h3 className="text-2xl font-bold mb-6">Neues Material manuell hinzufügen</h3>
                <div className="space-y-4">
                    <input
                        type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                        placeholder="Titel des Materials"
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md"
                    />
                    <textarea
                        value={content} onChange={(e) => setContent(e.target.value)}
                        rows={10} placeholder="Inhalt hier einfügen (Markdown wird unterstützt)..."
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md resize-y"
                    />
                </div>
                <div className="mt-6 flex justify-end gap-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500">Abbrechen</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700">Speichern</button>
                </div>
            </div>
        </div>
    );
};

// --- MODAL: Process with AI ---
const AIProcessModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (material: Omit<MateMaterial, 'id'>) => void;
    currentUser: User;
    consumeCredits: (amount: number, description: string) => boolean;
}> = ({ isOpen, onClose, onSave, currentUser, consumeCredits }) => {
    const [text, setText] = useState('');
    const [isProcessingFile, setIsProcessingFile] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        setError('');
        setIsProcessingFile(true);
        setProgress(0);
        try {
            const file = e.target.files[0];
            const extractedText = await processFile(file, (p) => setProgress(p));
            setText(extractedText);
        } catch (err: any) {
            setError(err.message || 'Fehler beim Verarbeiten der Datei.');
        } finally {
            setIsProcessingFile(false);
        }
    };
    
    const handleGenerate = async () => {
        if (!text.trim()) return;

        if (!consumeCredits(AI_MATERIAL_COST, "MATE Material mit AI verarbeitet")) {
            setError("Guthaben nicht ausreichend.");
            return;
        }

        setError('');
        setIsGenerating(true);
        try {
            const newMaterial = await generateMateMaterialFromText(text);
            onSave(newMaterial);
            onClose();
        } catch (err: any) {
             setError(err.message || 'Fehler bei der AI-Generierung.');
        } finally {
            setIsGenerating(false);
        }
    };
    
    useEffect(() => {
        if(isOpen) {
            setText('');
            setError('');
            setIsGenerating(false);
            setIsProcessingFile(false);
        }
    }, [isOpen]);
    
    const hasCredits = currentUser.credits >= AI_MATERIAL_COST;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg p-8 w-full max-w-2xl shadow-xl border border-gray-700">
                <h3 className="text-2xl font-bold mb-4">Materialien mit AI verarbeiten</h3>
                <p className="text-gray-400 mb-6">Laden Sie eine Datei hoch oder fügen Sie Text ein. Die AI generiert daraus automatisch ein strukturiertes Lernmaterial.</p>
                
                {isGenerating ? <div className="h-64 flex justify-center items-center"><Loader text="Material wird erstellt..."/></div> : <>
                    <div className="space-y-4">
                        <input type="file" onChange={handleFileChange} disabled={isProcessingFile} accept=".pdf,.docx,image/*" className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700"/>
                        {isProcessingFile && <div className="w-full bg-gray-600 rounded-full h-2.5"><div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div></div>}
                        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} placeholder="Oder fügen Sie hier Ihren Text ein..." className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md resize-y"/>
                    </div>
                    {error && <p className="text-red-400 mt-4">{error}</p>}
                </>}

                <div className="mt-6 flex justify-end gap-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500">Abbrechen</button>
                    <button onClick={handleGenerate} disabled={!text.trim() || isProcessingFile || isGenerating || !hasCredits} className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50">
                       {`Generieren (-${AI_MATERIAL_COST} Hub+1)`}
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- MODAL: AI Explanation ---
const AIExplanationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    isLoading: boolean;
    explanation: string;
    error: string;
    onSaveNote: (note: string) => void;
}> = ({ isOpen, onClose, isLoading, explanation, error, onSaveNote }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg p-8 w-full max-w-xl shadow-xl border border-gray-700 flex flex-col">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2"><Icon name="chat" /> Meister Corion erklärt:</h3>
                <div className="max-h-80 overflow-y-auto p-4 bg-gray-900 rounded-md flex-grow">
                    {isLoading && <Loader text="Erklärung wird geladen..." />}
                    {error && <p className="text-red-400">{error}</p>}
                    {!isLoading && !error && <p className="text-gray-300 whitespace-pre-wrap">{explanation}</p>}
                </div>
                <div className="mt-6 flex justify-between items-center">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500">Schließen</button>
                    {!isLoading && !error && explanation && (
                         <button onClick={() => onSaveNote(explanation)} className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 flex items-center gap-2 text-sm">
                            <Icon name="add" className="h-4 w-4" />
                            Als Notiz speichern
                         </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const KEY_TERMS = ['Gemeinkosten', 'Betriebsergebnis', 'Werkstoffkosten', 'Lohnkosten', 'Gesamtkosten', 'Betriebsleistung', 'Gemeinkostenzuschlag', 'Wagnis & Gewinn', 'Deckungsbeitrag', 'Direkt verrechenbare Lohnkosten', 'Einzelkosten', 'Selbstkosten'];


// --- Main Component ---
interface MateKalkulationProps {
    materials: MateMaterial[];
    onAddMaterial: (newMaterial: Omit<MateMaterial, 'id'>) => void;
    onUpdateMaterial: (updatedMaterial: MateMaterial) => void;
    onDeleteMaterial: (materialId: string) => void;
    language: Language;
    onAddNote: (materialId: string, note: string) => void;
    currentUser: User;
    consumeCredits: (amount: number, description: string) => boolean;
}

const MateKalkulation: React.FC<MateKalkulationProps> = ({ materials, onAddMaterial, onUpdateMaterial, onDeleteMaterial, language, onAddNote, currentUser, consumeCredits }) => {
    const [view, setView] = useState<'hub' | 'viewer'>('hub');
    const [currentMaterial, setCurrentMaterial] = useState<MateMaterial | null>(null);
    
    const [isAddManualModalOpen, setIsAddManualModalOpen] = useState(false);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [isExplanationModalOpen, setIsExplanationModalOpen] = useState(false);

    const [explanation, setExplanation] = useState({ loading: false, text: '', error: '' });
    const [selectionPopup, setSelectionPopup] = useState<{ top: number; left: number } | null>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [highlightedText, setHighlightedText] = useState<string | null>(null);

    // Chat state
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [chat, setChat] = useState<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

     useEffect(() => {
        if (view === 'viewer' && currentMaterial) {
            const systemInstruction = `Du bist "Lackierer-Meister Corion", ein KI-Lerncoach. Deine einzige Wissensquelle ist das folgende Dokument. Beantworte Fragen des Schülers präzise und ausschließlich basierend auf diesem Text. Antworte immer in der Sprache: "${language}".\n\n**DOKUMENT:**\n---\n${currentMaterial.content}`;
            const newChat = createChatSession(systemInstruction);
            setChat(newChat);
            setMessages([]);
        }
    }, [currentMaterial, view, language]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!userInput.trim() || !chat) return;

        if (!consumeCredits(AI_CHAT_COST, `Kontext-Chat: ${currentMaterial?.title.substring(0,20)}...`)) {
            alert("Guthaben nicht ausreichend.");
            return;
        }

        const newUserMessage: ChatMessage = { role: 'user', text: userInput };
        setMessages(prev => [...prev, newUserMessage]);
        setUserInput('');
        setIsChatLoading(true);
        try {
            const stream = await streamChatMessage(chat, userInput);
            let text = '';
            const modelResponse: ChatMessage = { role: 'model', text: '' };
            setMessages(prev => [...prev, modelResponse]);
            for await (const chunk of stream) {
                text += chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = { ...modelResponse, text };
                    return newMessages;
                });
            }
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, {role: 'model', text: 'Ein Fehler ist aufgetreten.'}]);
        } finally {
            setIsChatLoading(false);
        }
    };

    const handleSelectMaterial = (material: MateMaterial) => {
        setCurrentMaterial(material);
        setView('viewer');
        setHighlightedText(null);
    };

    const handleMouseUp = () => {
        const selection = window.getSelection();
        if (selection && !selection.isCollapsed && contentRef.current?.contains(selection.anchorNode)) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            setSelectionPopup({
                top: rect.top + window.scrollY - 40,
                left: rect.left + window.scrollX + rect.width / 2,
            });
        } else {
            setSelectionPopup(null);
        }
    };
    
    const handleExplain = async (textToExplain: string) => {
        if (!currentMaterial) return;

        if (!consumeCredits(AI_EXPLANATION_COST, `Erklärung: ${textToExplain}`)) {
            alert("Guthaben nicht ausreichend.");
            return;
        }

        setSelectionPopup(null);
        setIsExplanationModalOpen(true);
        setExplanation({ loading: true, text: '', error: '' });
        setHighlightedText(textToExplain);

        try {
            const result = await explainTextSelection(textToExplain, currentMaterial.content, language);
            setExplanation({ loading: false, text: result, error: '' });
        } catch (err: any) {
            setExplanation({ loading: false, text: '', error: err.message || 'Ein Fehler ist aufgetreten.' });
        }
    };
    
     useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.matches('.interactive-term')) {
                e.preventDefault();
                handleExplain(target.innerText);
            }
        };
        const contentDiv = contentRef.current;
        contentDiv?.addEventListener('click', handleClick);
        return () => contentDiv?.removeEventListener('click', handleClick);
    }, [currentMaterial, language]);


    const parsedContent = useMemo(() => {
        if (view !== 'viewer' || !currentMaterial || typeof marked === 'undefined') {
            return { __html: '' };
        }
        let processedContent = currentMaterial.content;
        
        // This is tricky. We need to be careful not to replace parts of the interactive term links.
        // A safer way is to replace only after creating the links.
        let tempContent = processedContent;

        const regex = new RegExp(`\\b(${KEY_TERMS.join('|')})\\b`, 'gi');
        tempContent = tempContent.replace(regex, (match) => `<a href="#" class="interactive-term">${match}</a>`);

        if (highlightedText) {
            // To avoid breaking the HTML, we can do a simpler text-based highlight that's less robust but safer.
            // This would highlight the term inside the link too, which might be acceptable.
             tempContent = tempContent.replace(new RegExp(highlightedText, 'g'), `<mark>${highlightedText}</mark>`);
        }
        
        return { __html: marked.parse(tempContent) };
    }, [view, currentMaterial, highlightedText]);


    if (view === 'viewer' && currentMaterial) {
        return (
            <div className="p-6 h-full flex flex-col gap-4">
                {selectionPopup && currentUser.credits >= AI_EXPLANATION_COST && (
                    <button
                        onClick={() => handleExplain(window.getSelection()?.toString() || '')}
                        className="absolute z-20 px-3 py-1 bg-red-600 text-white rounded-lg shadow-lg text-sm flex items-center gap-1"
                        style={{ top: `${selectionPopup.top}px`, left: `${selectionPopup.left}px`, transform: 'translateX(-50%)' }}
                    >
                        <Icon name="sparkles" className="h-4 w-4" /> Erklären (-{AI_EXPLANATION_COST} Hub+1)
                    </button>
                )}
                <div className="flex justify-between items-center flex-shrink-0">
                    <button onClick={() => setView('hub')} className="flex items-center text-red-400 hover:text-red-300">
                        <Icon name="back" className="h-5 w-5 mr-2" /> Zurück zur Bibliothek
                    </button>
                </div>
                <div className="flex-grow flex flex-col lg:flex-row gap-4 overflow-hidden">
                    <div className="lg:w-2/3 h-full flex flex-col gap-2">
                        <h1 className="text-3xl font-bold">{currentMaterial.title}</h1>
                         <div
                            ref={contentRef}
                            onMouseUp={handleMouseUp}
                            className="prose prose-invert prose-headings:text-red-400 prose-strong:text-white prose-a:text-red-400 prose-a:no-underline hover:prose-a:underline prose-code:bg-gray-700 prose-code:p-1 prose-code:rounded max-w-none flex-grow bg-gray-800 p-6 rounded-lg border border-gray-700 overflow-y-auto"
                            dangerouslySetInnerHTML={parsedContent}
                        />
                         {currentMaterial.notes && currentMaterial.notes.length > 0 && (
                            <div className="flex-shrink-0 mt-2">
                                <h3 className="text-lg font-semibold">Gespeicherte Notizen:</h3>
                                <ul className="list-disc list-inside text-sm text-gray-300 bg-gray-800 p-3 rounded-md border border-gray-700 max-h-24 overflow-y-auto">
                                    {currentMaterial.notes.map((note, i) => <li key={i}>{note.substring(0, 100)}...</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                     <div className="lg:w-1/3 h-full flex flex-col bg-gray-800 rounded-lg border border-gray-700">
                        <div className="p-3 border-b border-gray-600 text-center">
                            <h3 className="font-semibold text-lg">Kontext-Chat</h3>
                            <p className="text-xs text-gray-400">Fragen Sie AI zu diesem Dokument</p>
                        </div>
                        <div className="flex-grow p-2 overflow-y-auto">
                           <div className="space-y-3">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-xs p-2 rounded-lg text-sm ${msg.role === 'user' ? 'bg-red-600' : 'bg-gray-700'}`}>
                                        <p className="whitespace-pre-wrap">{msg.text}</p>
                                    </div>
                                </div>
                            ))}
                            {isChatLoading && <div className="flex justify-start"><div className="p-2 rounded-lg bg-gray-700"><Loader text=""/></div></div> }
                             <div ref={messagesEndRef} />
                           </div>
                        </div>
                        <div className="p-2 border-t border-gray-600">
                            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                                <input value={userInput} onChange={e => setUserInput(e.target.value)} placeholder={currentUser.credits < AI_CHAT_COST ? "Guthaben leer" : `Frage stellen (-${AI_CHAT_COST} Hub+1)`} className="flex-1 p-2 text-sm bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500" disabled={isChatLoading || currentUser.credits < AI_CHAT_COST} />
                                <button type="submit" disabled={isChatLoading || !userInput.trim() || currentUser.credits < AI_CHAT_COST} className="p-2 bg-red-600 rounded-lg disabled:bg-gray-500"><Icon name="send" className="h-5 w-5" /></button>
                            </form>
                        </div>
                    </div>
                </div>

                 <AIExplanationModal 
                    isOpen={isExplanationModalOpen}
                    onClose={() => { setIsExplanationModalOpen(false); setHighlightedText(null); }}
                    isLoading={explanation.loading}
                    explanation={explanation.text}
                    error={explanation.error}
                    onSaveNote={(note) => {
                        onAddNote(currentMaterial.id, note);
                        setIsExplanationModalOpen(false);
                        setHighlightedText(null);
                    }}
                 />
            </div>
        );
    }

    return (
        <div className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Kalkulationsbibliothek</h1>
                    <p className="text-gray-400">Ihre Sammlung von Berechnungen und Fallstudien.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setIsAddManualModalOpen(true)} className="px-4 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 flex items-center gap-2">
                        <Icon name="add" className="h-5 w-5" /> Manuell hinzufügen
                    </button>
                    <button 
                        onClick={() => setIsAIModalOpen(true)} 
                        className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 flex items-center gap-2" 
                        disabled={currentUser.credits < AI_MATERIAL_COST}
                        title="Laden Sie eine Datei hoch oder fügen Sie Text ein, um automatisch ein strukturiertes Lernmaterial zu erstellen."
                    >
                        <Icon name="ai-process" className="h-5 w-5" /> {`Mit AI verarbeiten (-${AI_MATERIAL_COST} Hub+1)`}
                    </button>
                </div>
            </div>
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto">
                {materials.map(material => (
                    <div key={material.id} className="bg-gray-800 rounded-lg p-4 flex flex-col justify-between border border-gray-700 hover:border-red-500 transition-colors">
                        <div>
                            <h3 className="text-lg font-bold text-gray-200">{material.title}</h3>
                            <p className="text-xs text-gray-400 mt-1">{material.content.substring(0, 70)}...</p>
                        </div>
                        <div className="mt-4 flex justify-between items-center">
                            <button onClick={() => handleSelectMaterial(material)} className="text-sm text-red-400 hover:underline">Öffnen</button>
                            {material.isUserCreated && (
                                <button
                                    onClick={() => { if(window.confirm("Sind Sie sicher?")) onDeleteMaterial(material.id); }}
                                    className="text-gray-500 hover:text-red-500"
                                >
                                    <Icon name="trash" className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <AddManualModal isOpen={isAddManualModalOpen} onClose={() => setIsAddManualModalOpen(false)} onSave={onAddMaterial} />
            <AIProcessModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} onSave={onAddMaterial} currentUser={currentUser} consumeCredits={consumeCredits} />
        </div>
    );
};

export default MateKalkulation;
