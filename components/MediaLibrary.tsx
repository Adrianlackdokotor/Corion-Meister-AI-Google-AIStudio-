
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { MediaLibraryItem } from '../types';
import { Icon } from './Icon';
import Loader from './Loader';
import { getMedia } from '../utils/db';
import { generateImageForAudio } from '../services/geminiService';

// --- Modal for adding media ---
const AddMediaModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAddItems: (items: { file: File; title: string; description: string }[]) => void;
}> = ({ isOpen, onClose, onAddItems }) => {
    const [files, setFiles] = useState<File[]>([]);
    const [metadata, setMetadata] = useState<Record<string, { title: string; description: string }>>({});
    const [isSaving, setIsSaving] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setFiles(newFiles);
            const newMetadata: Record<string, { title: string; description: string }> = {};
            newFiles.forEach((file: File) => {
                newMetadata[file.name] = { title: file.name.replace(/\.[^/.]+$/, ""), description: '' };
            });
            setMetadata(newMetadata);
        }
    };

    const handleMetadataChange = (fileName: string, field: 'title' | 'description', value: string) => {
        setMetadata(prev => ({
            ...prev,
            [fileName]: { ...prev[fileName], [field]: value }
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const newItems = files.map(file => ({
                file,
                title: metadata[file.name].title,
                description: metadata[file.name].description,
            }));
            onAddItems(newItems);
            handleClose();
        } catch (err) {
            alert('Ein Fehler ist aufgetreten.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleClose = () => {
        setFiles([]);
        setMetadata({});
        setIsSaving(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl shadow-xl border border-gray-700 max-h-[90vh] flex flex-col">
                <h3 className="text-2xl font-bold mb-4 flex-shrink-0">Neue Medien hinzufügen</h3>
                {isSaving ? (
                    <div className="flex-grow flex items-center justify-center">
                        <Loader text="Dateien werden gespeichert..." />
                    </div>
                ) : (
                    <>
                        <div className="flex-grow overflow-y-auto pr-2">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-300 mb-2">1. Dateien auswählen (Video oder Audio)</label>
                                <input
                                    type="file"
                                    multiple
                                    accept="video/*,audio/*"
                                    onChange={handleFileChange}
                                    className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700"
                                />
                            </div>
                            {files.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">2. Titel und Beschreibung bearbeiten</label>
                                    <div className="space-y-4">
                                        {files.map(file => (
                                            <div key={file.name} className="p-3 bg-gray-700 rounded-lg">
                                                <p className="text-sm font-semibold text-red-400 truncate mb-2">{file.name}</p>
                                                <input
                                                    type="text"
                                                    placeholder="Titel"
                                                    value={metadata[file.name]?.title || ''}
                                                    onChange={e => handleMetadataChange(file.name, 'title', e.target.value)}
                                                    className="w-full p-2 mb-2 bg-gray-800 border border-gray-600 rounded-md"
                                                />
                                                <textarea
                                                    placeholder="Beschreibung (optional)"
                                                    rows={2}
                                                    value={metadata[file.name]?.description || ''}
                                                    onChange={e => handleMetadataChange(file.name, 'description', e.target.value)}
                                                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md resize-none"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="mt-6 flex justify-end gap-4 flex-shrink-0">
                            <button onClick={handleClose} className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500">Abbrechen</button>
                            <button onClick={handleSave} disabled={files.length === 0} className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 disabled:bg-gray-500">
                                Hinzufügen
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const IMAGE_GENERATION_COST = 50;

// --- Viewer for a single media item ---
const MediaItemViewer: React.FC<{
    item: MediaLibraryItem;
    onDelete: () => void;
    backgroundImageUrl?: string;
    onUpdateBackground: (itemId: string, imageUrl: string) => void;
    consumeCredits: (amount: number, description: string) => boolean;
}> = ({ item, onDelete, backgroundImageUrl, onUpdateBackground, consumeCredits }) => {
    const [mediaUrl, setMediaUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isGeneratingBg, setIsGeneratingBg] = useState(false);

    useEffect(() => {
        let objectUrl: string | null = null;
        const loadMedia = async () => {
            setIsLoading(true);
            setError('');
            try {
                const blob = await getMedia(item.id);
                if (blob) {
                    objectUrl = URL.createObjectURL(blob);
                    setMediaUrl(objectUrl);
                } else {
                    setError('Mediendatei nicht in der Datenbank gefunden.');
                }
            } catch (e) {
                console.error("Failed to load media from DB", e);
                setError('Fehler beim Laden der Mediendatei.');
            } finally {
                setIsLoading(false);
            }
        };

        loadMedia();

        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [item.id]);
    
    const handleGenerateBackground = async () => {
        if (!item.description.trim()) {
            alert("Bitte fügen Sie eine Beschreibung hinzu, um ein Bild zu generieren.");
            return;
        }
        if (!consumeCredits(IMAGE_GENERATION_COST, `Hintergrundbild für: ${item.title}`)) {
            alert("Guthaben reicht nicht aus, um ein Bild zu generieren.");
            return;
        }
        setIsGeneratingBg(true);
        try {
            const imageUrl = await generateImageForAudio(item.description);
            onUpdateBackground(item.id, imageUrl);
        } catch (err) {
            console.error("Failed to generate background", err);
            alert("Hintergrundbild konnte nicht generiert werden.");
        } finally {
            setIsGeneratingBg(false);
        }
    };


    return (
        <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-4" style={{ scrollSnapAlign: 'start' }}>
            <div className="mb-4 bg-black rounded-lg flex items-center justify-center" style={{ minHeight: '300px', maxHeight: '70vh' }}>
                {isLoading ? <Loader text="Lade Medium..." /> :
                 error ? <p className="text-red-400 p-4">{error}</p> :
                 mediaUrl && (
                    item.type === 'video' ? (
                        <video src={mediaUrl} controls className="w-full h-full object-contain rounded-lg " style={{ maxHeight: '70vh' }}></video>
                    ) : (
                        <div
                            className="w-full flex flex-col items-center justify-center rounded-lg p-4 h-48 bg-cover bg-center relative"
                            style={{ backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : 'none' }}
                        >
                            <div className="absolute inset-0 bg-black/50 rounded-lg"></div>
                            <div className="relative z-10 flex flex-col items-center justify-center w-full">
                                <Icon name="volume-up" className="h-16 w-16 text-red-500 mb-4"/>
                                <audio src={mediaUrl} controls className="w-full max-w-sm"></audio>
                            </div>
                            {!backgroundImageUrl && (
                                <div className="absolute bottom-2 right-2 z-10">
                                    <button
                                        onClick={handleGenerateBackground}
                                        disabled={!item.description || isGeneratingBg}
                                        className="px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded-md hover:bg-red-700 disabled:bg-gray-500 flex items-center gap-1"
                                        title={!item.description ? "Fügen Sie eine Beschreibung hinzu, um diese Funktion zu aktivieren" : "Hintergrundbild generieren"}
                                    >
                                        {isGeneratingBg ? (
                                            <>
                                              <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white"></div>
                                              Generiere...
                                            </>
                                        ) : (
                                            <>
                                                <Icon name="image" className="h-3 w-3"/>
                                                BG generieren
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    )
                 )
                }
            </div>
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-bold">{item.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">{item.description}</p>
                </div>
                <button onClick={onDelete} className="text-gray-500 hover:text-red-500 p-1 flex-shrink-0" title="Löschen">
                    <Icon name="trash" className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
};

// --- The main component ---
interface MediaLibraryProps {
    items: MediaLibraryItem[];
    onAddItems: (newItems: { file: File, title: string, description: string }[]) => void;
    onDeleteItem: (itemId: string) => void;
    mediaBackgrounds: { [key: string]: string };
    onUpdateMediaBackground: (itemId: string, imageUrl: string) => void;
    consumeCredits: (amount: number, description: string) => boolean;
}

const MediaLibrary: React.FC<MediaLibraryProps> = ({ items, onAddItems, onDeleteItem, mediaBackgrounds, onUpdateMediaBackground, consumeCredits }) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    const sortedItems = useMemo(() => [...items].reverse(), [items]);
    
    const handleDelete = (item: MediaLibraryItem) => {
        if(window.confirm(`Sind Sie sicher, dass Sie "${item.title}" löschen möchten?`)){
            onDeleteItem(item.id);
        }
    }

    return (
        <div className="h-full flex flex-col p-6 bg-gray-900">
            <div className="flex justify-between items-center mb-6 flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-bold">Video & Audio Bibliothek</h1>
                    <p className="text-gray-400">Ihre persönliche Sammlung von Lernmedien.</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 flex items-center gap-2"
                >
                    <Icon name="add" className="h-5 w-5" />
                    Medien hinzufügen
                </button>
            </div>
            
            <div className="flex-grow overflow-y-auto" style={{ scrollSnapType: 'y mandatory' }}>
                {sortedItems.length > 0 ? (
                    <div className="space-y-8 max-w-3xl mx-auto">
                        {sortedItems.map(item => (
                           <MediaItemViewer
                                key={item.id}
                                item={item}
                                onDelete={() => handleDelete(item)}
                                backgroundImageUrl={mediaBackgrounds[item.id]}
                                onUpdateBackground={onUpdateMediaBackground}
                                consumeCredits={consumeCredits}
                           />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                        <Icon name="video" className="h-24 w-24 mb-4" />
                        <h2 className="text-xl font-semibold">Ihre Bibliothek ist leer</h2>
                        <p>Klicken Sie auf "Medien hinzufügen", um Ihre ersten Videos oder Audiodateien hochzuladen.</p>
                    </div>
                )}
            </div>
            
            <AddMediaModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAddItems={onAddItems} />
        </div>
    );
};

export default MediaLibrary;
