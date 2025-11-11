import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Icon } from './Icon';
import { MateMaterial, Language } from '../types';
import { generateMateMaterialFromText, explainTextSelection } from '../services/geminiService';
import { processFile } from '../utils/fileProcessor';
import Loader from './Loader';

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
}> = ({ isOpen, onClose, onSave }) => {
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
                    <button onClick={handleGenerate} disabled={!text.trim() || isProcessingFile || isGenerating} className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50">Generieren</button>
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
}> = ({ isOpen, onClose, isLoading, explanation, error }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg p-8 w-full max-w-xl shadow-xl border border-gray-700">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2"><Icon name="chat" /> Meister Corion erklärt:</h3>
                <div className="max-h-96 overflow-y-auto p-4 bg-gray-900 rounded-md">
                    {isLoading && <Loader text="Erklärung wird geladen..." />}
                    {error && <p className="text-red-400">{error}</p>}
                    {!isLoading && !error && <p className="text-gray-300 whitespace-pre-wrap">{explanation}</p>}
                </div>
                <div className="mt-6 text-right">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500">Schließen</button>
                </div>
            </div>
        </div>
    );
};


// --- Main Component ---
interface MateKalkulationProps {
    materials: MateMaterial[];
    onAddMaterial: (newMaterial: Omit<MateMaterial, 'id'>) => void;
    onUpdateMaterial: (updatedMaterial: MateMaterial) => void;
    onDeleteMaterial: (materialId: string) => void;
    language: Language;
}

const MateKalkulation: React.FC<MateKalkulationProps> = ({ materials, onAddMaterial, onDeleteMaterial, language }) => {
    const [view, setView] = useState<'hub' | 'viewer'>('hub');
    const [currentMaterial, setCurrentMaterial] = useState<MateMaterial | null>(null);
    
    const [isAddManualModalOpen, setIsAddManualModalOpen] = useState(false);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [isExplanationModalOpen, setIsExplanationModalOpen] = useState(false);

    const [explanation, setExplanation] = useState({ loading: false, text: '', error: '' });
    const [selectionPopup, setSelectionPopup] = useState<{ top: number; left: number } | null>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const handleSelectMaterial = (material: MateMaterial) => {
        setCurrentMaterial(material);
        setView('viewer');
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
    
    const handleExplainSelection = async () => {
        const selection = window.getSelection();
        if (!selection || !currentMaterial) return;

        const selectedText = selection.toString().trim();
        if (!selectedText) return;
        
        setSelectionPopup(null);
        setIsExplanationModalOpen(true);
        setExplanation({ loading: true, text: '', error: '' });

        try {
            const result = await explainTextSelection(selectedText, currentMaterial.content, language);
            setExplanation({ loading: false, text: result, error: '' });
        } catch (err: any) {
            setExplanation({ loading: false, text: '', error: err.message || 'Ein Fehler ist aufgetreten.' });
        }
    };

    const parsedContent = useMemo(() => {
        if (view === 'viewer' && currentMaterial && typeof marked !== 'undefined') {
            return { __html: marked.parse(currentMaterial.content) };
        }
        return { __html: '' };
    }, [view, currentMaterial]);


    if (view === 'viewer' && currentMaterial) {
        return (
            <div className="p-6 h-full flex flex-col">
                {selectionPopup && (
                    <button
                        onClick={handleExplainSelection}
                        className="absolute z-20 px-3 py-1 bg-red-600 text-white rounded-lg shadow-lg text-sm flex items-center gap-1"
                        style={{ top: `${selectionPopup.top}px`, left: `${selectionPopup.left}px`, transform: 'translateX(-50%)' }}
                    >
                        <Icon name="sparkles" className="h-4 w-4" /> Erklären
                    </button>
                )}
                <button onClick={() => setView('hub')} className="self-start mb-4 flex items-center text-red-400 hover:text-red-300">
                    <Icon name="back" className="h-5 w-5 mr-2" /> Zurück zur Bibliothek
                </button>
                <h1 className="text-3xl font-bold mb-4">{currentMaterial.title}</h1>
                <div
                    ref={contentRef}
                    onMouseUp={handleMouseUp}
                    className="prose prose-invert prose-headings:text-red-400 prose-strong:text-white prose-code:bg-gray-700 prose-code:p-1 prose-code:rounded max-w-none flex-grow bg-gray-800 p-6 rounded-lg border border-gray-700 overflow-y-auto"
                    dangerouslySetInnerHTML={parsedContent}
                />
                 <AIExplanationModal 
                    isOpen={isExplanationModalOpen}
                    onClose={() => setIsExplanationModalOpen(false)}
                    isLoading={explanation.loading}
                    explanation={explanation.text}
                    error={explanation.error}
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
                    <button onClick={() => setIsAIModalOpen(true)} className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 flex items-center gap-2">
                        <Icon name="ai-process" className="h-5 w-5" /> Materialien mit AI verarbeiten
                    </button>
                </div>
            </div>
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto">
                {materials.map(material => (
                    <div key={material.id} className="bg-gray-800 rounded-lg p-4 flex flex-col justify-between border border-gray-700 hover:border-red-500 transition-colors">
                        <h3 className="text-lg font-bold text-gray-200">{material.title}</h3>
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
            <AIProcessModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} onSave={onAddMaterial} />
        </div>
    );
};

export default MateKalkulation;