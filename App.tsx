
import React, { useState, useEffect, useMemo } from 'react';
import ChatInterface from './components/ChatInterface';
import Flashcards from './components/Flashcards';
import MultipleChoice from './components/MultipleChoice';
import Fachgespraech from './components/Fachgespraech';
import Login from './components/Login';
import StudyMaterials from './components/StudyMaterials';
import SettingsModal from './components/SettingsModal';
import { Icon } from './components/Icon';
import { LibraryCategory, LibraryEntry, FachgespraechTopic, Language, User } from './types';
import { parsedLibraryData } from './data/libraryData';
import { AudioManager } from './utils/audioManager';

type Feature = 'chat' | 'flashcards' | 'multipleChoice' | 'fachgespraech' | 'studyMaterials';

const logoBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABDgAAAG+CAYAAABVVl3fAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhcwAADsMAAA7DAcdvqGAAAP+lSURBVHhe7J0FnFRF1sf7l5CAJCRkIYSQhAwhhEAEBEFFVFDEgoCiIBZFRERBQRQVUREEFEFAECggISQhJJCQhExI+v/3zN7d7OzuzO7s7EhyPvd5Pp+cnZmdnZ3Z2Zmd7713Zmd2d0IIoYqjiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqg-n-";

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('currentUser');
    try {
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed && typeof parsed.email === 'string' && typeof parsed.credits === 'number') {
          return parsed;
        }
      }
    } catch (error) {
      console.error("Could not parse user from localStorage", error);
    }
    return null;
  });

  const [activeFeature, setActiveFeature] = useState<Feature>('flashcards');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [userLibrary, setUserLibrary] = useState<LibraryCategory[]>(() => {
    try {
        const saved = localStorage.getItem('userStudyLibrary');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) return parsed;
        }
    } catch (error) { console.error("Could not parse user library from localStorage", error); }
    return [];
  });

  const studyLibrary = useMemo(() => {
      const merged: LibraryCategory[] = JSON.parse(JSON.stringify(parsedLibraryData)); // Deep copy base library
      userLibrary.forEach(userCategory => {
          const existingCategory = merged.find(c => c.title === userCategory.title);
          if (existingCategory) {
              existingCategory.entries.push(...userCategory.entries);
          } else {
              merged.push(userCategory);
          }
      });
      return merged;
  }, [userLibrary]);


  const [fachgespraechTopics, setFachgespraechTopics] = useState<FachgespraechTopic[]>(() => {
    const saved = localStorage.getItem('fachgespraechTopics');
    return saved ? JSON.parse(saved) : [];
  });

  const [volume, setVolume] = useState<number>(() => {
    const saved = localStorage.getItem('app_volume');
    return saved ? parseFloat(saved) : 0.7;
  });
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    const saved = localStorage.getItem('app_isMuted');
    return saved ? JSON.parse(saved) : false;
  });
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('app_language');
    return (saved as Language) || 'Romanian';
  });

  const audioManager = useMemo(() => new AudioManager(volume, isMuted), [volume, isMuted]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('userStudyLibrary', JSON.stringify(userLibrary));
  }, [userLibrary]);

  useEffect(() => {
    localStorage.setItem('fachgespraechTopics', JSON.stringify(fachgespraechTopics));
  }, [fachgespraechTopics]);
  
  useEffect(() => {
    localStorage.setItem('app_volume', volume.toString());
  }, [volume]);
  
  useEffect(() => {
    localStorage.setItem('app_isMuted', JSON.stringify(isMuted));
  }, [isMuted]);

  useEffect(() => {
    localStorage.setItem('app_language', language);
  }, [language]);


  const studyMaterials = useMemo(() => {
    return studyLibrary
      .map(category => 
        category.entries.map(entry => `Frage: ${entry.question}\nAntwort: ${entry.answer}`).join('\n\n')
      )
      .join('\n\n---\n\n');
  }, [studyLibrary]);

  const handleLogin = (email: string) => {
    const newUser: User = {
      email,
      credits: 20000, // Freemium credits (€2 worth)
      tier: email.toLowerCase() === 'adrianlackdoktor@gmail.com' ? 'admin' : 'user',
    };
    setCurrentUser(newUser);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleAddLibraryEntry = (newEntry: Omit<LibraryEntry, 'id'>, categoryTitle: string) => {
    setUserLibrary(prevLibrary => {
        const newLibrary = JSON.parse(JSON.stringify(prevLibrary)); // Deep copy
        let category = newLibrary.find((cat: LibraryCategory) => cat.title === categoryTitle);
        if (!category) {
            category = { title: categoryTitle, entries: [] };
            newLibrary.push(category);
        }
        const newId = `user-${Date.now()}`;
        category.entries.push({ ...newEntry, id: newId });
        return newLibrary;
    });
  };

  const handleUpdateLibraryEntry = (updatedEntry: LibraryEntry, categoryTitle: string) => {
      setUserLibrary(prevLibrary => prevLibrary.map(category => {
          if (category.title === categoryTitle) {
              return {
                  ...category,
                  entries: category.entries.map(entry =>
                      entry.id === updatedEntry.id ? updatedEntry : entry
                  ),
              };
          }
          return category;
      }));
  };

  const handleDeleteLibraryEntry = (entryId: string, categoryTitle: string) => {
      setUserLibrary(prevLibrary => prevLibrary.map(category => {
          if (category.title === categoryTitle) {
              return {
                  ...category,
                  entries: category.entries.filter(entry => entry.id !== entryId),
              };
          }
          return category;
      }).filter(category => category.entries.length > 0)); // Remove empty categories
  };

  const handleBulkAddLibraryEntries = (newEntries: { question: string; answer: string; categoryTitle: string }[]) => {
    setUserLibrary(prevLibrary => {
        const newLibrary: LibraryCategory[] = JSON.parse(JSON.stringify(prevLibrary));
        newEntries.forEach(newEntryData => {
            let category = newLibrary.find(cat => cat.title === newEntryData.categoryTitle);
            if (!category) {
                // Also check base library categories
                const baseCategoryExists = parsedLibraryData.some(cat => cat.title === newEntryData.categoryTitle);
                if (baseCategoryExists) {
                    category = { title: newEntryData.categoryTitle, entries: [] };
                    newLibrary.push(category);
                } else {
                    // If category doesn't exist anywhere, create it in the user library
                    category = { title: newEntryData.categoryTitle, entries: [] };
                    newLibrary.push(category);
                }
            }
             const newId = `user-${Date.now()}-${Math.random()}`;
             category.entries.push({
                id: newId,
                question: newEntryData.question,
                answer: newEntryData.answer
             });
        });
        return newLibrary;
    });
};


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }


  const renderFeature = () => {
    const props = {
      studyMaterials,
      language,
      audioManager,
      currentUser
    };
    switch (activeFeature) {
      case 'chat':
        return <ChatInterface {...props} />;
      case 'flashcards':
        // FIX: Pass the 'studyLibrary' prop to the Flashcards component.
        return <Flashcards {...props} studyLibrary={studyLibrary} />;
      case 'multipleChoice':
        return <MultipleChoice {...props} />;
      case 'fachgespraech':
        return <Fachgespraech {...props} topics={fachgespraechTopics} onUpdateTopics={setFachgespraechTopics} />;
      case 'studyMaterials':
        return <StudyMaterials 
                    library={studyLibrary}
                    onAddEntry={handleAddLibraryEntry}
                    onUpdateEntry={handleUpdateLibraryEntry}
                    onDeleteEntry={handleDeleteLibraryEntry}
                    onBulkAdd={handleBulkAddLibraryEntries}
                />;
      default:
        // FIX: Pass the 'studyLibrary' prop to the Flashcards component.
        return <Flashcards {...props} studyLibrary={studyLibrary} />;
    }
  };

  const NavButton = ({ feature, label, iconName }: { feature: Feature; label: string; iconName: string }) => (
    <button
      onClick={() => {
        setActiveFeature(feature);
        setIsMenuOpen(false);
        audioManager.play('click');
      }}
      className={`flex items-center w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 ${
        activeFeature === feature
          ? 'bg-red-600 text-white'
          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
      }`}
    >
      <Icon name={iconName} className="h-6 w-6 mr-3" />
      <span>{label}</span>
    </button>
  );

  const NavContent = () => (
    <>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <img src={logoBase64} alt="Corion Logo" className="h-12 w-auto" />
          <span className="text-2xl font-bold">
            <span className="text-red-500">Corion-Meister </span>
            <span className="text-white">AI</span>
          </span>
        </div>
        <button onClick={() => setIsMenuOpen(false)} className="md:hidden p-1 text-gray-400 hover:text-white">
            <Icon name="close" className="h-6 w-6" />
        </button>
      </div>
      <div className="space-y-2">
        <NavButton feature="flashcards" label="Flashcards" iconName="flashcards" />
        <NavButton feature="multipleChoice" label="Multiple Choice Fragen" iconName="list" />
        <NavButton feature="fachgespraech" label="Praktische Prüfung" iconName="exam" />
        <NavButton feature="studyMaterials" label="Lernbibliothek" iconName="book" />
        <NavButton feature="chat" label="Lackierer-Meister" iconName="chat" />
      </div>
      <div className="mt-auto pt-4 border-t border-gray-700">
         <button
            onClick={() => {
                setIsSettingsOpen(true);
                audioManager.play('click');
            }}
            className="flex items-center w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 text-gray-300 hover:bg-gray-700 hover:text-white"
        >
            <Icon name="settings" className="h-6 w-6 mr-3" />
            <span>Einstellungen</span>
        </button>
        <div className="px-4 py-2 space-y-1">
          <div className="text-sm text-gray-400" title={currentUser.email}>
            Angemeldet als: <span className="font-semibold text-gray-300 truncate">{currentUser.email}</span>
          </div>
          <div className="text-sm text-gray-400">
            Guthaben: <span className="font-semibold text-yellow-400">{currentUser.credits.toLocaleString('de-DE')} Hub+1-Credits</span>
          </div>
        </div>
         <button
            onClick={handleLogout}
            className="flex items-center w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 text-gray-300 hover:bg-gray-700 hover:text-white"
        >
            <Icon name="logout" className="h-6 w-6 mr-3" />
            <span>Logout</span>
        </button>
        <div className="mt-4 text-center text-gray-500 text-xs">
            <p>Powered by Gemini</p>
        </div>
      </div>
    </>
  );

  return (
    <div className="h-screen font-sans bg-gray-900 text-gray-100 flex flex-col md:flex-row overflow-hidden">
        <header className="md:hidden flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700 flex-shrink-0">
             <div className="flex items-center gap-2">
                <img src={logoBase64} alt="Corion Logo" className="h-10 w-auto" />
                <span className="text-xl font-bold">
                    <span className="text-red-500">Corion-Meister </span>
                    <span className="text-white">AI</span>
                </span>
            </div>
             <button onClick={() => setIsMenuOpen(true)} className="p-1 text-gray-300 hover:text-white">
                 <Icon name="menu" className="h-6 w-6" />
             </button>
        </header>

        {isMenuOpen && (
            <div
                className="fixed inset-0 bg-black bg-opacity-60 z-20 md:hidden"
                onClick={() => setIsMenuOpen(false)}
            ></div>
        )}

        <nav className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-800 p-4 flex flex-col border-r border-gray-700
                         transform transition-transform duration-300 ease-in-out
                         md:relative md:translate-x-0 md:flex-shrink-0
                         ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <NavContent />
        </nav>
      
      <main className="flex-1 bg-gray-900 overflow-auto">
        {renderFeature()}
      </main>

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        volume={volume}
        setVolume={setVolume}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        language={language}
        setLanguage={setLanguage}
        audioManager={audioManager}
        currentUser={currentUser}
      />
    </div>
  );
};

export default App;