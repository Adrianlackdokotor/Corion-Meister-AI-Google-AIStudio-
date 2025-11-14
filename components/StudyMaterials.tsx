import React, { useState, useEffect } from 'react';
import { LibraryCategory, LibraryEntry, User } from '../types';
import { Icon } from './Icon';
import { processFile } from '../utils/fileProcessor';
import { generateLibraryEntriesFromText } from '../services/geminiService';
import Loader from './Loader';

// Modal for adding/editing a single entry manually
const AddEditModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (entry: LibraryEntry, categoryTitle: string) => void;
    onAdd: (entry: Omit<LibraryEntry, 'id'>, categoryTitle: string) => void;
    entryToEdit: LibraryEntry | null;
    categories: LibraryCategory[];
    initialCategoryTitle: string | null;
}> = ({ isOpen, onClose, onSave, onAdd, entryToEdit, categories, initialCategoryTitle }) => {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [categoryTitle, setCategoryTitle] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (entryToEdit) {
                setQuestion(entryToEdit.question);
                setAnswer(entryToEdit.answer);
                setCategoryTitle(initialCategoryTitle || '');
            } else {
                setQuestion('');
                setAnswer('');
                setCategoryTitle(initialCategoryTitle || (categories.length > 0 ? categories[0].title : ''));
            }
        }
    }, [entryToEdit, isOpen, initialCategoryTitle, categories]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim() || !answer.trim() || !categoryTitle) {
            alert('Alle Felder müssen ausgefüllt sein.');
            return;
        }
        if (entryToEdit) {
            onSave({ ...entryToEdit, question, answer }, categoryTitle);
        } else {
            onAdd({ question, answer }, categoryTitle);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg p-8 w-full max-w-lg shadow-xl border border-gray-700">
                <h3 className="text-2xl font-bold mb-6">{entryToEdit ? 'Frage bearbeiten' : 'Neue Frage hinzufügen'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">Kategorie</label>
                        <select
                            id="category"
                            value={categoryTitle}
                            onChange={(e) => setCategoryTitle(e.target.value)}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md"
                        >
                            {categories.map(cat => <option key={cat.title} value={cat.title}>{cat.title}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="question" className="block text-sm font-medium text-gray-300 mb-1">Frage</label>
                        <textarea id="question" rows={3} value={question} onChange={(e) => setQuestion(e.target.value)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md resize-none" />
                    </div>
                    <div>
                        <label htmlFor="answer" className="block text-sm font-medium text-gray-300 mb-1">Antwort</label>
                        <textarea id="answer" rows={5} value={answer} onChange={(e) => setAnswer(e.target.value)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md resize-none" />
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

const aiProcessingMessages = [
    "Analysiere das Dokument...",
    "Extrahiere Schlüsselkonzepte...",
    "Formuliere Fragen und Antworten...",
    "Strukturiere die neuen Lernkarten..."
];

// Modal for processing materials with AI
const AiProcessingModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onBulkAdd: (entries: { question: string, answer: string, categoryTitle: string }[]) => void;
    categories: LibraryCategory[];
    currentUser: User;
    consumeCredits: (amount: number, description: string) => boolean;
}> = ({ isOpen, onClose, onBulkAdd, categories, currentUser, consumeCredits }) => {
    const [activeTab, setActiveTab] = useState<'upload' | 'text'>('upload');
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
        setActiveTab('upload');
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
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
        
        if (!consumeCredits(AI_PROCESSING_COST, 'Lernmaterial mit AI verarbeitet')) {
            setError('Guthaben nicht ausreichend.');
            return;
        }

        setError('');
        setIsGenerating(true);
        try {
            const newEntries = await generateLibraryEntriesFromText(extractedText, categories);
            onBulkAdd(newEntries);
            handleClose();
        } catch (err: any) {
            setError(err.message || 'Fehler bei der AI-Generierung.');
        } finally {
            setIsGenerating(false);
        }
    };
    
    const hasCredits = currentUser.credits >= AI_PROCESSING_COST;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg p-8 w-full max-w-2xl shadow-xl border border-gray-700 flex flex-col">
                <h3 className="text-2xl font-bold mb-4">Materialien mit AI verarbeiten</h3>
                <p className="text-gray-400 mb-6">Laden Sie eine Datei hoch oder fügen Sie Text ein. Die AI generiert daraus automatisch Frage-Antwort-Karten für Ihre Bibliothek.</p>

                {isGenerating ? (
                    <div className="flex flex-col items-center justify-center h-64">
                        <Loader text={aiProcessingMessages} />
                        {error && <p className="text-red-400 mt-4">{error}</p>}
                    </div>
                ) : (
                    <>
                        <div className="flex border-b border-gray-600 mb-4">
                            <button onClick={() => setActiveTab('upload')} className={`px-4 py-2 ${activeTab === 'upload' ? 'border-b-2 border-red-500 text-white' : 'text-gray-400'}`}>Datei-Upload</button>
                            <button onClick={() => setActiveTab('text')} className={`px-4 py-2 ${activeTab === 'text' ? 'border-b-2 border-red-500 text-white' : 'text-gray-400'}`}>Text einfügen</button>
                        </div>

                        {activeTab === 'upload' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Datei hochladen (PDF, DOCX, Bild)</label>
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    accept=".pdf,.docx,image/*"
                                    className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700"
                                    disabled={isProcessingFile}
                                />
                                {isProcessingFile && (
                                    <div className="mt-4">
                                        <div className="w-full bg-gray-600 rounded-full h-2.5">
                                            <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                                        </div>
                                        <p className="text-xs text-center text-gray-300 mt-1">Verarbeite Datei... {progress}%</p>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {activeTab === 'text' && (
                             <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Text hier einfügen</label>
                                <textarea
                                    value={extractedText}
                                    onChange={(e) => setExtractedText(e.target.value)}
                                    rows={10}
                                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md resize-y"
                                    placeholder="Kopieren Sie Ihren Text hier..."
                                />
                            </div>
                        )}
                        
                        {error && <p className="text-red-400 mt-4">{error}</p>}
                    </>
                )}

                <div className="mt-6 flex justify-end gap-4">
                    <button onClick={handleClose} disabled={isGenerating} className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500 disabled:opacity-50">Abbrechen</button>
                    <button onClick={handleGenerate} disabled={!extractedText || isGenerating || isProcessingFile || !hasCredits} className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50">
                        {isGenerating ? 'Wird generiert...' : `Generieren (-${AI_PROCESSING_COST} Hub+1)`}
                    </button>
                </div>
            </div>
        </div>
    );
};


interface StudyMaterialsProps {
  library: LibraryCategory[];
  onAddEntry: (entry: Omit<LibraryEntry, 'id'>, categoryTitle: string) => void;
  onUpdateEntry: (entry: LibraryEntry, categoryTitle: string) => void;
  onDeleteEntry: (entryId: string, categoryTitle: string) => void;
  onBulkAdd: (entries: { question: string, answer: string, categoryTitle: string }[]) => void;
  onDeleteCategory: (categoryTitle: string) => void;
  currentUser: User;
  consumeCredits: (amount: number, description: string) => boolean;
}


const LibraryCard: React.FC<{ 
    entry: LibraryEntry; 
    isUserGenerated: boolean;
    onEdit: () => void;
    onDelete: () => void;
}> = ({ entry, isUserGenerated, onEdit, onDelete }) => (
  <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden flex flex-col">
    <div className="p-4 border-b border-gray-600 flex justify-between items-center">
        <span className="text-xs font-bold text-red-400 bg-gray-700 px-2 py-1 rounded-full">
            Frage #{entry.id.startsWith('user-') ? entry.id.substring(5, 9) : entry.id}
        </span>
        {isUserGenerated && (
            <div className="flex gap-2">
                <button onClick={onEdit} className="text-gray-400 hover:text-white" title="Bearbeiten">
                    <Icon name="edit" className="h-4 w-4" />
                </button>
                <button onClick={onDelete} className="text-gray-400 hover:text-red-500" title="Löschen">
                    <Icon name="trash" className="h-4 w-4" />
                </button>
            </div>
        )}
    </div>
    <div className="p-4 flex-grow">
      <h4 className="font-semibold text-gray-200 mb-2">{entry.question}</h4>
      <p className="text-gray-400 text-sm">{entry.answer}</p>
    </div>
  </div>
);

const StudyMaterials: React.FC<StudyMaterialsProps> = ({ library, onAddEntry, onUpdateEntry, onDeleteEntry, onBulkAdd, onDeleteCategory, currentUser, consumeCredits }) => {
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [entryToEdit, setEntryToEdit] = useState<LibraryEntry | null>(null);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    const handleOpenAddModal = (categoryTitle: string) => {
        setEntryToEdit(null);
        setActiveCategory(categoryTitle);
        setIsAddEditModalOpen(true);
    };

    const handleOpenEditModal = (entry: LibraryEntry, categoryTitle: string) => {
        setEntryToEdit(entry);
        setActiveCategory(categoryTitle);
        setIsAddEditModalOpen(true);
    };

    const handleDelete = (entryId: string, categoryTitle: string) => {
        if (window.confirm('Sind Sie sicher, dass Sie diese Frage löschen möchten?')) {
            onDeleteEntry(entryId, categoryTitle);
        }
    };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <div className="p-6 flex-shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold">Lernbibliothek</h2>
            <p className="text-gray-400">Dies ist die zentrale Wissensdatenbank für Ihr Meisterstudium.</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => handleOpenAddModal(library.length > 0 ? library[0].title : '')}
                className="px-4 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 flex items-center gap-2"
            >
                <Icon name="add" className="h-5 w-5" />
                Manuell hinzufügen
            </button>
             <button 
                onClick={() => setIsAiModalOpen(true)}
                className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 flex items-center gap-2"
                disabled={currentUser.credits < AI_PROCESSING_COST}
                title="Laden Sie eine Datei hoch oder fügen Sie Text ein, um automatisch Lernkarten zu erstellen."
            >
                <Icon name="ai-process" className="h-5 w-5" />
                {`Mit AI verarbeiten (-${AI_PROCESSING_COST} Hub+1)`}
            </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-8">
        {library.length > 0 ? (
          library.map((category) => (
            <section key={category.title}>
              <div className="flex justify-between items-center mb-4 pb-2 border-b-2 border-gray-700">
                <h3 className="text-xl font-bold text-red-500">{category.title}</h3>
                {category.isUserCreated && (
                    <button
                        onClick={() => {
                            if (window.confirm(`Sind Sie sicher, dass Sie die Kategorie "${category.title}" und alle darin enthaltenen Fragen löschen möchten?`)) {
                                onDeleteCategory(category.title);
                            }
                        }}
                        className="text-gray-400 hover:text-red-500 p-1"
                        title="Kategorie löschen"
                    >
                        <Icon name="trash" className="h-5 w-5" />
                    </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {category.entries.map((entry) => {
                    const isUserGenerated = entry.id.startsWith('user-');
                    return (
                        <LibraryCard 
                            key={entry.id} 
                            entry={entry}
                            isUserGenerated={isUserGenerated}
                            onEdit={() => handleOpenEditModal(entry, category.title)}
                            onDelete={() => handleDelete(entry.id, category.title)}
                        />
                    );
                })}
              </div>
            </section>
          ))
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8 border-2 border-dashed border-gray-700 rounded-lg">
                 <p className="text-gray-500">Die Lernbibliothek ist leer.</p>
                 <p className="text-gray-500">Fügen Sie Inhalte manuell oder mit AI hinzu, um zu beginnen.</p>
            </div>
          </div>
        )}
      </div>
      <AddEditModal 
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        onSave={onUpdateEntry}
        onAdd={onAddEntry}
        entryToEdit={entryToEdit}
        categories={library}
        initialCategoryTitle={activeCategory}
      />
      <AiProcessingModal 
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onBulkAdd={onBulkAdd}
        categories={library}
        currentUser={currentUser}
        consumeCredits={consumeCredits}
      />
    </div>
  );
};

export default StudyMaterials;