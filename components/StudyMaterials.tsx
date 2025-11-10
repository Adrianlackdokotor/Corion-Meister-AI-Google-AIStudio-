
import React, { useState, useEffect } from 'react';
import { LibraryCategory, LibraryEntry } from '../types';
import { Icon } from './Icon';

interface AddEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (entry: LibraryEntry, categoryTitle: string) => void;
    onAdd: (entry: Omit<LibraryEntry, 'id'>, categoryTitle: string) => void;
    entryToEdit: LibraryEntry | null;
    categories: LibraryCategory[];
    initialCategoryTitle: string | null;
}

const AddEditModal: React.FC<AddEditModalProps> = ({ isOpen, onClose, onSave, onAdd, entryToEdit, categories, initialCategoryTitle }) => {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [categoryTitle, setCategoryTitle] = useState('');

    useEffect(() => {
        if (entryToEdit) {
            setQuestion(entryToEdit.question);
            setAnswer(entryToEdit.answer);
            setCategoryTitle(initialCategoryTitle || '');
        } else {
            setQuestion('');
            setAnswer('');
            setCategoryTitle(initialCategoryTitle || (categories.length > 0 ? categories[0].title : ''));
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
                            disabled={!!entryToEdit} // Can't change category when editing for simplicity
                        >
                            {categories.map(cat => <option key={cat.title} value={cat.title}>{cat.title}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="question" className="block text-sm font-medium text-gray-300 mb-1">Frage</label>
                        <textarea
                            id="question"
                            rows={3}
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md resize-none"
                        />
                    </div>
                    <div>
                        <label htmlFor="answer" className="block text-sm font-medium text-gray-300 mb-1">Antwort</label>
                        <textarea
                            id="answer"
                            rows={5}
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md resize-none"
                        />
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


interface StudyMaterialsProps {
  library: LibraryCategory[];
  onAddEntry: (entry: Omit<LibraryEntry, 'id'>, categoryTitle: string) => void;
  onUpdateEntry: (entry: LibraryEntry, categoryTitle: string) => void;
  onDeleteEntry: (entryId: string, categoryTitle: string) => void;
}


const LibraryCard: React.FC<{ 
    entry: LibraryEntry; 
    onEdit: () => void;
    onDelete: () => void;
}> = ({ entry, onEdit, onDelete }) => (
  <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden flex flex-col">
    <div className="p-4 border-b border-gray-600 flex justify-between items-center">
        <span className="text-xs font-bold text-red-400 bg-gray-700 px-2 py-1 rounded-full">Frage #{entry.id.split('-').pop()}</span>
        <div className="flex gap-2">
            <button onClick={onEdit} className="text-gray-400 hover:text-white" title="Bearbeiten">
                <Icon name="edit" className="h-4 w-4" />
            </button>
            <button onClick={onDelete} className="text-gray-400 hover:text-red-500" title="Löschen">
                <Icon name="trash" className="h-4 w-4" />
            </button>
        </div>
    </div>
    <div className="p-4 flex-grow">
      <h4 className="font-semibold text-gray-200 mb-2">{entry.question}</h4>
      <p className="text-gray-400 text-sm">{entry.answer}</p>
    </div>
  </div>
);

const StudyMaterials: React.FC<StudyMaterialsProps> = ({ library, onAddEntry, onUpdateEntry, onDeleteEntry }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [entryToEdit, setEntryToEdit] = useState<LibraryEntry | null>(null);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    const handleOpenAddModal = (categoryTitle: string) => {
        setEntryToEdit(null);
        setActiveCategory(categoryTitle);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (entry: LibraryEntry, categoryTitle: string) => {
        setEntryToEdit(entry);
        setActiveCategory(categoryTitle);
        setIsModalOpen(true);
    };

    const handleDelete = (entryId: string, categoryTitle: string) => {
        if (window.confirm('Sind Sie sicher, dass Sie diese Frage löschen möchten?')) {
            onDeleteEntry(entryId, categoryTitle);
        }
    };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <div className="p-6 flex-shrink-0 flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold">Lernbibliothek</h2>
            <p className="text-gray-400">Dies ist die zentrale Wissensdatenbank für Ihr Meisterstudium.</p>
        </div>
        <button 
            onClick={() => handleOpenAddModal(library.length > 0 ? library[0].title : '')}
            className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 flex items-center gap-2"
        >
            <Icon name="add" className="h-5 w-5" />
            Neue Frage hinzufügen
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-8">
        {library.length > 0 ? (
          library.map((category) => (
            <section key={category.title}>
              <h3 className="text-xl font-bold text-red-500 mb-4 pb-2 border-b-2 border-gray-700">{category.title}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {category.entries.map((entry) => (
                  <LibraryCard 
                    key={entry.id} 
                    entry={entry} 
                    onEdit={() => handleOpenEditModal(entry, category.title)}
                    onDelete={() => handleDelete(entry.id, category.title)}
                    />
                ))}
              </div>
            </section>
          ))
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Die Lernbibliothek ist derzeit leer. Fügen Sie eine neue Frage hinzu, um zu beginnen.</p>
          </div>
        )}
      </div>
      <AddEditModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onUpdateEntry}
        onAdd={onAddEntry}
        entryToEdit={entryToEdit}
        categories={library}
        initialCategoryTitle={activeCategory}
      />
    </div>
  );
};

export default StudyMaterials;
