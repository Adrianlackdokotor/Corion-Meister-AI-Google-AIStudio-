import React, { useState, useEffect } from 'react';
import { FormelFlashcard } from '../types';
import { Icon } from './Icon';
import { generateFormelFlashcardsFromText } from '../services/geminiService';
import { processFile } from '../utils/fileProcessor';
import Loader from './Loader';

// Modal for adding/editing a single entry manually
const AddEditModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (card: FormelFlashcard) => void;
    onAdd: (card: Omit<FormelFlashcard, 'id'>) => void;
    cardToEdit: FormelFlashcard | null;
}> = ({ isOpen, onClose, onSave, onAdd, cardToEdit }) => {
    const [front, setFront] = useState('');
    const [back, setBack] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (cardToEdit) {
                setFront(cardToEdit.front);
                setBack(cardToEdit.back);
            } else {
                setFront('');
                setBack('');
            }
        }
    }, [cardToEdit, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!front.trim() || !back.trim()) {
            alert('Alle Felder müssen ausgefüllt sein.');
            return;
        }
        if (cardToEdit) {
            onSave({ ...cardToEdit, front, back });
        } else {
            onAdd({ front, back });
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg p-8 w-full max-w-lg shadow-xl border border-gray-700">
                <h3 className="text-2xl font-bold mb-6">{cardToEdit ? 'Formel bearbeiten' : 'Neue Formel hinzufügen'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="front" className="block text-sm font-medium text-gray-300 mb-1">Name der Formel</label>
                        <input id="front" type="text" value={front} onChange={(e) => setFront(e.target.value)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md" />
                    </div>
                    <div>
                        <label htmlFor="back" className="block text-sm font-medium text-gray-300 mb-1">Formel & Rechenbeispiel</label>
                        <textarea id="back" rows={5} value={back} onChange={(e) => setBack(e.target.value)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md resize-y" placeholder="Formel: ...\nRechenbeispiel: ..." />
                    </div>
                    <div className="mt-6 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500">Abbrechen</button>
                        <button type="submit" className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700">Speichern</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Modal for processing materials with AI
const AiProcessingModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onBulkAdd: (cards: Omit<FormelFlashcard, 'id'>[]) => void;
}> = ({ isOpen, onClose, onBulkAdd }) => {
    const [extractedText, setExtractedText] = useState('');
    const [isProcessingFile, setIsProcessingFile] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');

    const resetState = () => {
        setExtractedText('');
        setIsProcessingFile(false);
        setIsGenerating(false);
        setProgress(0);
        setError('');
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        setError('');
        setIsProcessingFile(true);
        setProgress(0);
        try {
            const file = e.target.files[0];
            const text = await processFile(file, (p) => setProgress(p));
            setExtractedText(text);
        } catch (err: any) {
            setError(err.message || 'Fehler beim Verarbeiten der Datei.');
        } finally {
            setIsProcessingFile(false);
        }
    };

    const handleGenerate = async () => {
        if (!extractedText.trim()) {
            setError('Kein Text zum Verarbeiten vorhanden.');
            return;
        }
        setError('');
        setIsGenerating(true);
        try {
            const newCards = await generateFormelFlashcardsFromText(extractedText);
            onBulkAdd(newCards);
            handleClose();
        } catch (err: any) {
            setError(err.message || 'Fehler bei der AI-Generierung.');
        } finally {
            setIsGenerating(false);
        }
    };
    
    useEffect(() => { if (isOpen) resetState() }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg p-8 w-full max-w-2xl shadow-xl border border-gray-700 flex flex-col">
                <h3 className="text-2xl font-bold mb-4">Formeln mit AI extrahieren</h3>
                <p className="text-gray-400 mb-6">Laden Sie eine Datei hoch oder fügen Sie Text ein. Die AI extrahiert Formeln und erstellt daraus automatisch Lernkarten.</p>
                {isGenerating ? (
                    <div className="flex flex-col items-center justify-center h-64"><Loader text="Formeln werden extrahiert..." /></div>
                ) : (
                    <div className="space-y-4">
                         <input type="file" onChange={handleFileChange} accept=".pdf,.docx,image/*" className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700" disabled={isProcessingFile} />
                        {isProcessingFile && <div className="w-full bg-gray-600 rounded-full h-2.5"><div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div></div>}
                        <textarea value={extractedText} onChange={(e) => setExtractedText(e.target.value)} rows={10} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md resize-y" placeholder="Text hier einfügen..." />
                        {error && <p className="text-red-400 mt-2">{error}</p>}
                    </div>
                )}
                <div className="mt-6 flex justify-end gap-4">
                    <button onClick={handleClose} disabled={isGenerating} className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500 disabled:opacity-50">Abbrechen</button>
                    <button onClick={handleGenerate} disabled={!extractedText || isGenerating || isProcessingFile} className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50">{isGenerating ? 'Wird generiert...' : 'Generieren'}</button>
                </div>
            </div>
        </div>
    );
};


const FormelCard: React.FC<{ card: FormelFlashcard; onEdit: () => void; onDelete: () => void; }> = ({ card, onEdit, onDelete }) => (
  <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden flex flex-col">
    <div className="p-4 border-b border-gray-600 flex justify-between items-center">
        <h4 className="font-semibold text-gray-200 truncate">{card.front}</h4>
        {card.isUserCreated && (
            <div className="flex gap-2 flex-shrink-0">
                <button onClick={onEdit} className="text-gray-400 hover:text-white" title="Bearbeiten"><Icon name="edit" className="h-4 w-4" /></button>
                <button onClick={onDelete} className="text-gray-400 hover:text-red-500" title="Löschen"><Icon name="trash" className="h-4 w-4" /></button>
            </div>
        )}
    </div>
    <div className="p-4 flex-grow">
      <p className="text-gray-400 text-sm whitespace-pre-wrap">{card.back}</p>
    </div>
  </div>
);

interface MateFormelnProps {
    flashcards: FormelFlashcard[];
    onAddCard: (newCard: Omit<FormelFlashcard, 'id'>) => void;
    onUpdateCard: (updatedCard: FormelFlashcard) => void;
    onDeleteCard: (cardId: string) => void;
    onBulkAddCards: (newCards: Omit<FormelFlashcard, 'id'>[]) => void;
}

const MateFormeln: React.FC<MateFormelnProps> = ({ flashcards, onAddCard, onUpdateCard, onDeleteCard, onBulkAddCards }) => {
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [cardToEdit, setCardToEdit] = useState<FormelFlashcard | null>(null);

    const handleOpenAddModal = () => {
        setCardToEdit(null);
        setIsAddEditModalOpen(true);
    };

    const handleOpenEditModal = (card: FormelFlashcard) => {
        setCardToEdit(card);
        setIsAddEditModalOpen(true);
    };

    const handleDelete = (cardId: string) => {
        if (window.confirm('Sind Sie sicher, dass Sie diese Formel löschen möchten?')) {
            onDeleteCard(cardId);
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-900">
            <div className="p-6 flex-shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Formeln Bibliothek</h2>
                    <p className="text-gray-400">Ihre Sammlung von wichtigen Formeln und Rechenwegen.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleOpenAddModal} className="px-4 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 flex items-center gap-2">
                        <Icon name="add" className="h-5 w-5" />Manuell hinzufügen
                    </button>
                    <button onClick={() => setIsAiModalOpen(true)} className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 flex items-center gap-2">
                        <Icon name="ai-process" className="h-5 w-5" />Mit AI verarbeiten
                    </button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-6">
                {flashcards.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {flashcards.map((card) => (
                            <FormelCard 
                                key={card.id} 
                                card={card}
                                onEdit={() => handleOpenEditModal(card)}
                                onDelete={() => handleDelete(card.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center p-8 border-2 border-dashed border-gray-700 rounded-lg">
                            <p className="text-gray-500">Die Formel-Bibliothek ist leer.</p>
                            <p className="text-gray-500">Fügen Sie Formeln manuell oder mit AI hinzu.</p>
                        </div>
                    </div>
                )}
            </div>
            <AddEditModal 
                isOpen={isAddEditModalOpen}
                onClose={() => setIsAddEditModalOpen(false)}
                onSave={onUpdateCard}
                onAdd={onAddCard}
                cardToEdit={cardToEdit}
            />
            <AiProcessingModal 
                isOpen={isAiModalOpen}
                onClose={() => setIsAiModalOpen(false)}
                onBulkAdd={onBulkAddCards}
            />
        </div>
    );
};

export default MateFormeln;
