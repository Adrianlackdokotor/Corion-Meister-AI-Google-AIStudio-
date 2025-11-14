import React, { useState, useEffect } from 'react';
import { FormelFlashcard, User } from '../types';
import { Icon } from './Icon';
import { generateFormelFlashcardsFromText } from '../services/geminiService';
import { processFile } from '../utils/fileProcessor';
import Loader from './Loader';

// --- MODAL: Add/Edit Manually ---
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
            alert('Beide Felder müssen ausgefüllt sein.');
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
                        <label htmlFor="front" className="block text-sm font-medium text-gray-300 mb-1">Vorderseite (Frage/Name)</label>
                        <textarea id="front" rows={3} value={front} onChange={(e) => setFront(e.target.value)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md resize-none" />
                    </div>
                    <div>
                        <label htmlFor="back" className="block text-sm font-medium text-gray-300 mb-1">Rückseite (Formel/Antwort)</label>
                        <textarea id="back" rows={5} value={back} onChange={(e) => setBack(e.target.value)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md resize-none" />
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

const AI_PROCESSING_COST = 250;

const formulaExtractionMessages = [
    "Scanne Text nach Formeln...",
    "Identifiziere Variablen und Einheiten...",
    "Formatiere die Lernkarten...",
    "Stelle die Ergebnisse zusammen..."
];

// --- MODAL: Process with AI ---
const AiProcessingModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onBulkAdd: (cards: Pick<FormelFlashcard, 'front' | 'back'>[]) => void;
    currentUser: User;
    consumeCredits: (amount: number, description: string) => boolean;
}> = ({ isOpen, onClose, onBulkAdd, currentUser, consumeCredits }) => {
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
        
        if (!consumeCredits(AI_PROCESSING_COST, 'Formeln mit AI verarbeitet')) {
            setError('Guthaben nicht ausreichend.');
            return;
        }
        
        setError('');
        setIsGenerating(true);
        try {
            const newCards = await generateFormelFlashcardsFromText(text);
            onBulkAdd(newCards);
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
    
    const hasCredits = currentUser.credits >= AI_PROCESSING_COST;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg p-8 w-full max-w-2xl shadow-xl border border-gray-700">
                <h3 className="text-2xl font-bold mb-4">Formeln mit AI verarbeiten</h3>
                <p className="text-gray-400 mb-6">Laden Sie eine Datei hoch oder fügen Sie Text ein. Die AI extrahiert daraus automatisch Formeln und erstellt Lernkarten.</p>
                
                {isGenerating ? <div className="h-64 flex justify-center items-center"><Loader text={formulaExtractionMessages}/></div> : <>
                    <div className="space-y-4">
                        <input type="file" onChange={handleFileChange} disabled={isProcessingFile} accept=".pdf,.docx,image/*" className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700"/>
                        {isProcessingFile && <div className="w-full bg-gray-600 rounded-full h-2.5"><div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div></div>}
                        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} placeholder="Oder fügen Sie hier Ihren Text mit Formeln ein..." className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md resize-y"/>
                    </div>
                    {error && <p className="text-red-400 mt-4">{error}</p>}
                </>}

                <div className="mt-6 flex justify-end gap-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500">Abbrechen</button>
                    <button onClick={handleGenerate} disabled={!text.trim() || isProcessingFile || isGenerating || !hasCredits} className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50">
                        {`Generieren (-${AI_PROCESSING_COST} Hub+1)`}
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Main Component ---
interface MateFormelnProps {
  flashcards: FormelFlashcard[];
  onAddCard: (card: Omit<FormelFlashcard, 'id'>) => void;
  onUpdateCard: (card: FormelFlashcard) => void;
  onDeleteCard: (cardId: string) => void;
  onBulkAddCards: (cards: Pick<FormelFlashcard, 'front' | 'back'>[]) => void;
  currentUser: User;
  consumeCredits: (amount: number, description: string) => boolean;
}

const MateFormeln: React.FC<MateFormelnProps> = ({ flashcards, onAddCard, onUpdateCard, onDeleteCard, onBulkAddCards, currentUser, consumeCredits }) => {
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
    <div className="flex flex-col h-full bg-gray-900 p-6">
      <div className="flex-shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Formel-Bibliothek</h2>
          <p className="text-gray-400">Ihre Sammlung von wichtigen Formeln und Berechnungen.</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={handleOpenAddModal}
                className="px-4 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 flex items-center gap-2"
            >
                <Icon name="add" className="h-5 w-5" />
                Manuell hinzufügen
            </button>
             <button 
                onClick={() => setIsAiModalOpen(true)}
                className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 flex items-center gap-2"
                disabled={currentUser.credits < AI_PROCESSING_COST}
                title="Laden Sie eine Datei hoch oder fügen Sie Text ein, um automatisch Formelkarten zu erstellen."
            >
                <Icon name="ai-process" className="h-5 w-5" />
                {`Mit AI verarbeiten (-${AI_PROCESSING_COST} Hub+1)`}
            </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {flashcards.map((card) => (
                <div key={card.id} className="group [perspective:1000px]">
                    <div className="relative h-48 w-full rounded-xl shadow-xl transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                        {/* Front */}
                        <div className="absolute inset-0 bg-gray-800 border border-gray-700 rounded-xl flex flex-col justify-center items-center p-4 text-center [backface-visibility:hidden]">
                            <p className="text-lg font-semibold text-gray-200">{card.front}</p>
                        </div>
                        {/* Back */}
                        <div className="absolute inset-0 bg-gray-700 border border-red-500 rounded-xl p-4 [transform:rotateY(180deg)] [backface-visibility:hidden]">
                           <div className="flex flex-col h-full">
                                <p className="text-sm text-gray-300 whitespace-pre-wrap flex-grow">{card.back}</p>
                                {card.isUserCreated && (
                                <div className="flex justify-end gap-2 mt-auto">
                                    <button onClick={() => handleOpenEditModal(card)} className="text-gray-400 hover:text-white" title="Bearbeiten">
                                        <Icon name="edit" className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => handleDelete(card.id)} className="text-gray-400 hover:text-red-500" title="Löschen">
                                        <Icon name="trash" className="h-4 w-4" />
                                    </button>
                                </div>
                                )}
                           </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
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
        currentUser={currentUser}
        consumeCredits={consumeCredits}
      />
    </div>
  );
};

export default MateFormeln;