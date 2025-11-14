

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ChatInterface from './components/ChatInterface';
import Flashcards from './components/Flashcards';
import MultipleChoice from './components/MultipleChoice';
import Fachgespraech from './components/Fachgespraech';
import Login from './components/Login';
import StudyMaterials from './components/StudyMaterials';
import SettingsModal from './components/SettingsModal';
import StartupSummaryModal from './components/StartupSummaryModal';
import { Icon } from './components/Icon';
import { LibraryCategory, LibraryEntry, FachgespraechTopic, Language, User, MateMaterial, FormelFlashcard, Transaction, AchievementId, UserAchievement, Achievement, MediaLibraryItem } from './types';
import { parsedLibraryData } from './data/libraryData';
import { initialMateData } from './data/mateData';
import { initialFormelnData } from './data/formelnData';
import { AudioManager } from './utils/audioManager';
import MateFormeln from './components/MateFormeln';
import MateKalkulation from './components/MateKalkulation';
import Dashboard from './components/Dashboard';
import WelcomeModal from './components/WelcomeModal';
import DailyBonusModal from './components/DailyBonusModal';
import { achievementsData } from './data/achievementsData';
import AchievementNotification from './components/AchievementNotification';
import AchievementsModal from './components/AchievementsModal';
import MediaLibrary from './components/MediaLibrary';
import { initDB, saveMedia, deleteMedia, getMediaMetadata, saveMediaMetadata } from './utils/db';

type Feature = 'dashboard' | 'chat' | 'flashcards' | 'multipleChoice' | 'fachgespraech' | 'studyMaterials' | 'mate-formeln' | 'mate-kalkulation' | 'media-library';

const logoBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABDgAAAG+CAYAAABVVl3fAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhcwAADsMAAA7DAcdvqGAAAP+lSURBVHhe7J0FnFRF1sf7l5CAJCRkIYSQhAwhhEAEBEFFVFDEgoCiIBZFRERBQRQVUREEFEFAECggISQhJJCQhExI+v/3zN7d7OzuzO7s7EhyPvd5Pp+cnZmdnZ3Z2Zmd7713Zmd2d0IIoYqjiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqg-n-";

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('currentUser');
    try {
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed && typeof parsed.email === 'string' && typeof parsed.credits === 'number') {
          return {
            transactions: [],
            lastSessionCreditUsage: 0,
            lastLoginDate: '',
            dailyStreak: 0,
            achievements: [],
            // FIX: Initialize new gamification fields for existing users.
            quizzesCompleted: 0,
            examsCompleted: 0,
            ...parsed,
          };
        }
      }
    } catch (error) {
      console.error("Could not parse user from localStorage", error);
    }
    return null;
  });

  const [activeFeature, setActiveFeature] = useState<Feature>('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMateMenuOpen, setIsMateMenuOpen] = useState(false);
  const [isStartupSummaryOpen, setIsStartupSummaryOpen] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [isDailyBonusModalOpen, setIsDailyBonusModalOpen] = useState(false);
  const [isAchievementsModalOpen, setIsAchievementsModalOpen] = useState(false);
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null);
  
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

   const [mateMaterials, setMateMaterials] = useState<MateMaterial[]>(() => {
    try {
      const saved = localStorage.getItem('mateMaterials');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (error) { console.error("Could not parse mate materials from localStorage", error); }
    return initialMateData;
  });

  const [formelFlashcards, setFormelFlashcards] = useState<FormelFlashcard[]>(() => {
    try {
      const saved = localStorage.getItem('formelFlashcards');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (error) { console.error("Could not parse formula flashcards from localStorage", error); }
    return initialFormelnData;
  });

  // Lifted state from Flashcards component
  const [cardProgress, setCardProgress] = useState<{ [key: string]: { masteryLevel: number; backgroundImageUrl?: string } }>(() => {
      try {
          const saved = localStorage.getItem('flashcard_progress');
          return saved ? JSON.parse(saved) : {};
      } catch (error) {
          console.error("Could not parse flashcard progress from localStorage", error);
          return {};
      }
  });

  const [mediaLibraryItems, setMediaLibraryItems] = useState<MediaLibraryItem[]>([]);
  const [dbInitialized, setDbInitialized] = useState(false);

  const [mediaBackgrounds, setMediaBackgrounds] = useState<{ [key: string]: string }>(() => {
    try {
      const saved = localStorage.getItem('mediaBackgrounds');
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error("Could not parse media backgrounds from localStorage", error);
      return {};
    }
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

  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('app_language');
    return (saved as Language) || 'German';
  });

  const audioManager = useMemo(() => new AudioManager(0, true), []);

  const consumeCredits = useCallback((amount: number, description: string): boolean => {
    if (!currentUser || currentUser.credits < amount) {
      return false;
    }
    const newTransaction: Transaction = {
      id: `t-${Date.now()}`,
      date: new Date().toISOString(),
      description,
      amount: -amount,
    };
    setCurrentUser(prevUser => {
        if (!prevUser) return null;
        const updatedUser = {
            ...prevUser,
            credits: prevUser.credits - amount,
            transactions: [newTransaction, ...prevUser.transactions],
        };
        const currentUsage = parseInt(sessionStorage.getItem('sessionCreditUsage') || '0', 10);
        sessionStorage.setItem('sessionCreditUsage', (currentUsage + amount).toString());
        return updatedUser;
    });
    return true;
  }, [currentUser]);

  const addCredits = useCallback((amount: number, description: string) => {
    if (!currentUser) return;
     const newTransaction: Transaction = {
      id: `t-${Date.now()}`,
      date: new Date().toISOString(),
      description,
      amount,
    };
    setCurrentUser(prevUser => {
        if (!prevUser) return null;
        return {
            ...prevUser,
            credits: prevUser.credits + amount,
            transactions: [newTransaction, ...prevUser.transactions],
        };
    });
  }, [currentUser]);


  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
      sessionStorage.removeItem('sessionCreditUsage');
      localStorage.removeItem('lastSessionCreditUsage');
    }
  }, [currentUser]);

  useEffect(() => {
    const initialize = async () => {
        await initDB();
        
        let loadedItems: MediaLibraryItem[] = [];
        const savedInLocalStorage = localStorage.getItem('mediaLibraryItems');

        if (savedInLocalStorage) {
            console.log("Found media metadata in localStorage, migrating to IndexedDB...");
            try {
                const parsed = JSON.parse(savedInLocalStorage);
                if (Array.isArray(parsed)) {
                    loadedItems = parsed;
                    await saveMediaMetadata(loadedItems);
                    localStorage.removeItem('mediaLibraryItems');
                    console.log("Metadata migration successful.");
                }
            } catch (error) {
                console.error("Could not migrate media metadata from localStorage, falling back to DB.", error);
                loadedItems = await getMediaMetadata();
            }
        } else {
             loadedItems = await getMediaMetadata();
        }

        const blobMigrationNeeded = loadedItems.some(item => !!item.data);
        if (blobMigrationNeeded) {
            console.log("Performing one-time migration of media blobs from base64 to IndexedDB blobs...");
            const migrationPromises = loadedItems.map(async (item) => {
                if (item.data) {
                    try {
                        const fetchRes = await fetch(`data:${item.mimeType};base64,${item.data}`);
                        const blob = await fetchRes.blob();
                        await saveMedia(item.id, blob);
                    } catch (e) {
                        console.error(`Failed to migrate item blob ${item.id}`, e);
                    }
                }
            });
            await Promise.all(migrationPromises);
            
            const migratedItems = loadedItems.map(({ data, ...rest }) => rest);
            setMediaLibraryItems(migratedItems);
            await saveMediaMetadata(migratedItems);
            console.log("Blob migration complete.");
        } else {
             setMediaLibraryItems(loadedItems);
        }

        setDbInitialized(true);
    };
    initialize().catch(err => console.error("Failed to initialize DB and migrate data", err));
  }, []);

  useEffect(() => { localStorage.setItem('userStudyLibrary', JSON.stringify(userLibrary)); }, [userLibrary]);
  useEffect(() => { localStorage.setItem('fachgespraechTopics', JSON.stringify(fachgespraechTopics)); }, [fachgespraechTopics]);
  useEffect(() => { localStorage.setItem('app_language', language); }, [language]);
  useEffect(() => { localStorage.setItem('mateMaterials', JSON.stringify(mateMaterials)); }, [mateMaterials]);
  useEffect(() => { localStorage.setItem('formelFlashcards', JSON.stringify(formelFlashcards)); }, [formelFlashcards]);
  useEffect(() => { localStorage.setItem('flashcard_progress', JSON.stringify(cardProgress)); }, [cardProgress]);
  
  useEffect(() => {
    if (dbInitialized) {
      saveMediaMetadata(mediaLibraryItems).catch(err => console.error("Failed to save media metadata", err));
    }
  }, [mediaLibraryItems, dbInitialized]);

  useEffect(() => { localStorage.setItem('mediaBackgrounds', JSON.stringify(mediaBackgrounds)); }, [mediaBackgrounds]);


  const studyMaterials = useMemo(() => {
    return studyLibrary
      .map(category => 
        category.entries.map(entry => `Frage: ${entry.question}\nAntwort: ${entry.answer}`).join('\n\n')
      )
      .join('\n\n---\n\n');
  }, [studyLibrary]);
  
  const mateStudyMaterials = useMemo(() => {
    return mateMaterials.map(m => `### ${m.title}\n\n${m.content}`).join('\n\n---\n\n');
  }, [mateMaterials]);


  const handleLogin = (email: string) => {
      const isFirstLoginEver = !localStorage.getItem('currentUser');
      const today = new Date().toISOString().split('T')[0];
      
      if (!isFirstLoginEver) {
          const lastUsage = sessionStorage.getItem('sessionCreditUsage') || '0';
          localStorage.setItem('lastSessionCreditUsage', lastUsage);
          setIsStartupSummaryOpen(true);
      } else {
          setIsWelcomeModalOpen(true);
      }
      sessionStorage.setItem('sessionCreditUsage', '0');

      const savedUser = localStorage.getItem('currentUser');
      let userToLogin: User;
      
      if (savedUser) {
          try {
              const parsed = JSON.parse(savedUser);
              if (parsed.email === email) {
                  userToLogin = { ...parsed };
              } else {
                  // New user email, reset
                  userToLogin = createNewUser(email);
              }
          } catch (e) {
              userToLogin = createNewUser(email);
          }
      } else {
          userToLogin = createNewUser(email);
      }

      // Handle daily bonus and streak
      const lastLogin = userToLogin.lastLoginDate;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastLogin !== today) {
          userToLogin.lastLoginDate = today;
          if (lastLogin === yesterdayStr) {
              userToLogin.dailyStreak += 1; // Increment streak
          } else {
              userToLogin.dailyStreak = 1; // Reset streak
          }
          userToLogin.credits += 10;
          userToLogin.transactions = [
            { id: `t-daily-${Date.now()}`, date: new Date().toISOString(), description: 'Täglicher Login-Bonus', amount: 10 },
            ...userToLogin.transactions
          ];
          setIsDailyBonusModalOpen(true);

          // Streak achievements
          if (userToLogin.dailyStreak === 7) addCredits(500, 'Streak-Bonus (7 Tage)');
          if (userToLogin.dailyStreak === 14) addCredits(1000, 'Streak-Bonus (14 Tage)');
          if (userToLogin.dailyStreak === 30) addCredits(2500, 'Streak-Bonus (30 Tage)');

      }
      userToLogin.lastSessionCreditUsage = parseInt(localStorage.getItem('lastSessionCreditUsage') || '0', 10);
      setCurrentUser(userToLogin);
  };
  
  const createNewUser = (email: string): User => ({
      email,
      credits: 1000,
      tier: email.toLowerCase() === 'adrianlackdoktor@gmail.com' ? 'admin' : 'user',
      transactions: [],
      lastSessionCreditUsage: 0,
      lastLoginDate: '',
      dailyStreak: 0,
      achievements: [],
      // FIX: Initialize new gamification fields for new users.
      quizzesCompleted: 0,
      examsCompleted: 0,
  });

  const handleLogout = () => {
    const currentUsage = sessionStorage.getItem('sessionCreditUsage') || '0';
    localStorage.setItem('lastSessionCreditUsage', currentUsage);
    setCurrentUser(null);
  };

  const unlockAchievement = useCallback((achievementId: AchievementId) => {
      if (!currentUser || currentUser.achievements.some(a => a.achievementId === achievementId)) {
          return;
      }
      const newAchievement: UserAchievement = {
          achievementId,
          unlockedAt: new Date().toISOString(),
      };
      setCurrentUser(prev => prev ? { ...prev, achievements: [...prev.achievements, newAchievement] } : null);
      
      const achievementData = achievementsData.find(a => a.id === achievementId);
      if (achievementData) {
          setUnlockedAchievement(achievementData);
          setTimeout(() => setUnlockedAchievement(null), 5000); // Hide notification after 5s
      }
  }, [currentUser]);

  // FIX: Added handlers for quiz and exam completion to track progress.
  const handleQuizComplete = useCallback(() => {
    setCurrentUser(prevUser => {
        if (!prevUser) return null;
        const newCount = (prevUser.quizzesCompleted || 0) + 1;
        return { ...prevUser, quizzesCompleted: newCount };
    });
  }, []);

  const handleExamComplete = useCallback(() => {
      setCurrentUser(prevUser => {
          if (!prevUser) return null;
          const newCount = (prevUser.examsCompleted || 0) + 1;
          return { ...prevUser, examsCompleted: newCount };
      });
  }, []);


  // Achievement checking logic
  useEffect(() => {
    if (!currentUser) return;

    const stats = {
        // FIX: Added explicit type to the filter parameter to resolve the TypeScript error.
        masteredCards: Object.values(cardProgress).filter((p: { masteryLevel: number }) => p.masteryLevel === 5).length,
        userContentAdded: userLibrary.reduce((sum, cat) => sum + cat.entries.length, 0),
        streak: currentUser.dailyStreak,
        // FIX: Added quiz and exam completion stats to enable achievement unlocking.
        quizzesCompleted: currentUser.quizzesCompleted || 0,
        examsCompleted: currentUser.examsCompleted || 0,
    };
    
    achievementsData.forEach(achievement => {
        if (!currentUser.achievements.some(a => a.achievementId === achievement.id)) {
            const criteria = achievement.criteria;
            // FIX: Removed @ts-ignore by ensuring all criteria types are present in the `stats` object.
            if (stats[criteria.type as keyof typeof stats] >= criteria.value) {
                unlockAchievement(achievement.id);
            }
        }
    });
  }, [currentUser, cardProgress, userLibrary, unlockAchievement]);


  const handleUpdateCardMastery = useCallback((cardId: string, result: 'richtig' | 'teilweise' | 'falsch') => {
      setCardProgress(prev => {
          const current = prev[cardId] || { masteryLevel: 0 };
          let newMasteryLevel = current.masteryLevel;
          switch (result) {
              case 'richtig':
                  newMasteryLevel = Math.min(5, current.masteryLevel + 1);
                  break;
              case 'falsch':
                  newMasteryLevel = 0;
                  break;
          }
          return {
              ...prev,
              [cardId]: { ...current, masteryLevel: newMasteryLevel }
          };
      });
  }, []);

  const handleAddLibraryEntry = (newEntry: Omit<LibraryEntry, 'id'>, categoryTitle: string) => {
    setUserLibrary(prevLibrary => {
        const newLibrary = JSON.parse(JSON.stringify(prevLibrary)); // Deep copy
        let category = newLibrary.find((cat: LibraryCategory) => cat.title === categoryTitle);
        if (!category) {
            category = { title: categoryTitle, entries: [], isUserCreated: true };
            newLibrary.push(category);
        }
        const newId = `user-${Date.now()}`;
        category.entries.push({ ...newEntry, id: newId });
        return newLibrary;
    });
  };

  const handleDeleteCategory = (categoryTitle: string) => {
    setUserLibrary(prev => prev.filter(cat => cat.title !== categoryTitle));
  };

  const handleAddMateMaterial = (newMaterial: Omit<MateMaterial, 'id'>) => {
    setMateMaterials(prev => [
      ...prev,
      { ...newMaterial, id: `user-${Date.now()}`, isUserCreated: true }
    ]);
  };
  
  const handleDeleteMateMaterial = (materialId: string) => {
    setMateMaterials(prev => prev.filter(m => m.id !== materialId));
  };

  const handleAddNoteToMaterial = (materialId: string, note: string) => {
    setMateMaterials(prev => prev.map(m => {
        if (m.id === materialId) {
            const newNotes = [...(m.notes || []), note];
            return { ...m, notes: newNotes };
        }
        return m;
    }));
  };

  const handleAddFormelFlashcard = (newCard: Omit<FormelFlashcard, 'id'>) => {
    setFormelFlashcards(prev => [
      ...prev,
      { ...newCard, id: `user-formel-${Date.now()}`, isUserCreated: true }
    ]);
  };

  const handleUpdateFormelFlashcard = (updatedCard: FormelFlashcard) => {
    setFormelFlashcards(prev => prev.map(c => c.id === updatedCard.id ? updatedCard : c));
  };

  const handleDeleteFormelFlashcard = (cardId: string) => {
    setFormelFlashcards(prev => prev.filter(c => c.id !== cardId));
  };

  const handleBulkAddFormelFlashcards = (newCards: Pick<FormelFlashcard, 'front' | 'back'>[]) => {
      const cardsToAdd: FormelFlashcard[] = newCards.map(c => ({
        ...c,
        id: `user-formel-${Date.now()}-${Math.random()}`,
        isUserCreated: true,
      }));
      setFormelFlashcards(prev => [...prev, ...cardsToAdd]);
  };

  const handleUpdateFachgespraechTopicImage = (topicId: string, imageUrl: string) => {
    setFachgespraechTopics(prevTopics =>
      prevTopics.map(topic =>
        topic.id === topicId
          ? { ...topic, backgroundImageUrl: imageUrl }
          : topic
      )
    );
  };

  const handleAddMediaItems = (newItems: { file: File, title: string, description: string }[]) => {
    const processAndSave = async () => {
        const newMetadataArray: MediaLibraryItem[] = [];
        for (const item of newItems) {
            const newItemId = `media-${Date.now()}-${Math.random()}`;
            try {
                await saveMedia(newItemId, item.file);
                newMetadataArray.push({
                    id: newItemId,
                    title: item.title,
                    description: item.description,
                    type: item.file.type.startsWith('video') ? 'video' : 'audio',
                    mimeType: item.file.type,
                });
            } catch (err) {
                console.error(`Failed to save file ${item.file.name} to DB`, err);
                // Optionally remove already saved items for this batch to keep it transactional
                throw new Error("Error saving files.");
            }
        }
        return newMetadataArray;
    };

    processAndSave()
        .then(newMetadata => {
            setMediaLibraryItems(prev => [...prev, ...newMetadata]);
        })
        .catch(err => {
            alert("Ein Fehler ist beim Speichern der Mediendateien aufgetreten. Bitte versuchen Sie es erneut.");
        });
  };

  const handleDeleteMediaItem = async (itemId: string) => {
      try {
        await deleteMedia(itemId);
        setMediaLibraryItems(prev => prev.filter(item => item.id !== itemId));
      } catch (err) {
        console.error(`Failed to delete media item ${itemId}`, err);
        alert('Fehler beim Löschen der Mediendatei.');
      }
  };

  const handleUpdateMediaBackground = (itemId: string, imageUrl: string) => {
    setMediaBackgrounds(prev => ({ ...prev, [itemId]: imageUrl }));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        setIsSettingsOpen(false);
        setIsStartupSummaryOpen(false);
        setIsWelcomeModalOpen(false);
        setIsDailyBonusModalOpen(false);
        setIsAchievementsModalOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }


  const renderFeature = () => {
    const commonProps = {
      language,
      audioManager,
      currentUser,
      consumeCredits
    };

    switch (activeFeature) {
      case 'dashboard':
        return <Dashboard 
                  user={currentUser} 
                  studyLibrary={studyLibrary} 
                  cardProgress={cardProgress}
                  onSelectCategory={(feature, category) => {
                      // This is a bit of a hack to jump into flashcards with a category
                      setActiveFeature(feature);
                      // The actual category selection happens inside the Flashcards component
                  }}
              />;
      case 'chat':
        return <ChatInterface {...commonProps} studyMaterials={studyMaterials} />;
      case 'flashcards':
        return <Flashcards 
                    {...commonProps} 
                    studyLibrary={studyLibrary} 
                    cardProgress={cardProgress}
                    onUpdateCardMastery={handleUpdateCardMastery}
                    onUpdateCardImage={(cardId, imageUrl) => setCardProgress(prev => ({...prev, [cardId]: {...prev[cardId], backgroundImageUrl: imageUrl}}))}
                />;
      case 'multipleChoice':
        // FIX: Pass the new centralized handler to the component.
        return <MultipleChoice {...commonProps} studyMaterials={studyMaterials} onQuizComplete={handleQuizComplete} />;
      case 'fachgespraech':
        // FIX: Pass the new centralized handler to the component.
        return <Fachgespraech 
                  {...commonProps} 
                  studyMaterials={studyMaterials} 
                  topics={fachgespraechTopics} 
                  onUpdateTopics={setFachgespraechTopics} 
                  onExamComplete={handleExamComplete} 
                  onUpdateTopicImage={handleUpdateFachgespraechTopicImage}
               />;
      case 'studyMaterials':
        return <StudyMaterials 
                    library={studyLibrary}
                    onAddEntry={handleAddLibraryEntry}
                    onUpdateEntry={() => {}} // Not implemented from this view
                    onDeleteEntry={() => {}} // Not implemented from this view
                    onBulkAdd={() => {}} // Not implemented from this view
                    onDeleteCategory={handleDeleteCategory}
                    consumeCredits={consumeCredits}
                    currentUser={currentUser}
                />;
      case 'mate-formeln':
        return <MateFormeln 
                  flashcards={formelFlashcards}
                  onAddCard={handleAddFormelFlashcard}
                  onUpdateCard={handleUpdateFormelFlashcard}
                  onDeleteCard={handleDeleteFormelFlashcard}
                  onBulkAddCards={handleBulkAddFormelFlashcards}
                  consumeCredits={consumeCredits}
                  currentUser={currentUser}
              />;
      case 'mate-kalkulation':
        return <MateKalkulation 
                    materials={mateMaterials}
                    onAddMaterial={handleAddMateMaterial}
                    onUpdateMaterial={() => {}} // Not implemented from this view
                    onDeleteMaterial={handleDeleteMateMaterial}
                    onAddNote={handleAddNoteToMaterial}
                    {...commonProps}
                />;
      case 'media-library':
        return <MediaLibrary 
                  items={mediaLibraryItems}
                  onAddItems={handleAddMediaItems}
                  onDeleteItem={handleDeleteMediaItem}
                  mediaBackgrounds={mediaBackgrounds}
                  onUpdateMediaBackground={handleUpdateMediaBackground}
                  consumeCredits={consumeCredits}
               />;
      default:
        return <Dashboard 
                  user={currentUser} 
                  studyLibrary={studyLibrary} 
                  cardProgress={cardProgress}
                  onSelectCategory={() => {}}
               />;
    }
  };
  
  const NavButton = ({ feature, label, iconName, isDashboard = false }: { feature: Feature; label: string; iconName: string, isDashboard?: boolean }) => (
    <button
      onClick={() => {
        setActiveFeature(feature);
        setIsMenuOpen(false);
      }}
      className={`flex items-center w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 ${
        activeFeature === feature
          ? 'bg-red-600 text-white'
          : `text-gray-300 hover:bg-gray-700 hover:text-white ${isDashboard ? 'mb-4 border-b border-gray-700 pb-4' : ''}`
      }`}
    >
      <Icon name={iconName} className="h-6 w-6 mr-3" />
      <span>{label}</span>
    </button>
  );

  const NavContent = () => (
    <>
      <div className="flex items-center justify-between mb-6">
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
        <NavButton feature="dashboard" label="Dashboard" iconName="home" isDashboard={true} />
        <NavButton feature="flashcards" label="Flashcards" iconName="flashcards" />
        <NavButton feature="multipleChoice" label="Multiple Choice Fragen" iconName="list" />
        <NavButton feature="fachgespraech" label="Praktische Prüfung" iconName="exam" />
        <NavButton feature="studyMaterials" label="Lernbibliothek" iconName="book" />
        <NavButton feature="media-library" label="Video & Audio Bibliothek" iconName="video" />
        <div>
            <button
                onClick={() => setIsMateMenuOpen(!isMateMenuOpen)}
                className="flex items-center justify-between w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
                <div className="flex items-center">
                    <Icon name="calculator" className="h-6 w-6 mr-3" />
                    <span>MATE</span>
                </div>
                <Icon name="chevron-down" className={`h-5 w-5 transition-transform duration-200 ${isMateMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            {isMateMenuOpen && (
                <div className="pl-8 space-y-1 mt-1">
                    <NavButton feature="mate-formeln" label="Formeln" iconName="formula" /> 
                    <NavButton feature="mate-kalkulation" label="Kalkulation" iconName="calculation-list" />
                </div>
            )}
        </div>
        <NavButton feature="chat" label="Lackierer-Meister" iconName="chat" />
      </div>
      <div className="mt-auto pt-4 border-t border-gray-700">
         <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 text-gray-300 hover:bg-gray-700 hover:text-white"
        >
            <Icon name="settings" className="h-6 w-6 mr-3" />
            <span>Einstellungen</span>
        </button>
        <div className="px-4 py-2 space-y-1">
          <div className="text-sm text-gray-400" title={currentUser.email}>
            Angemeldet als: <span className="font-semibold text-gray-300 truncate">{currentUser.email}</span>
          </div>
          <div className="flex items-center gap-4">
              <div className="text-sm text-gray-400">
                Guthaben: <span className="font-semibold text-yellow-400">{currentUser.credits.toLocaleString('de-DE')} Hub+1</span>
              </div>
               <div className="text-sm text-gray-400 flex items-center gap-1" title={`Tages-Streak: ${currentUser.dailyStreak}`}>
                <Icon name="fire" className="h-5 w-5 text-orange-400" />
                <span className="font-semibold text-orange-400">{currentUser.dailyStreak}</span>
              </div>
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
      {unlockedAchievement && <AchievementNotification achievement={unlockedAchievement} onDismiss={() => setUnlockedAchievement(null)} />}
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

        <nav className={`fixed inset-y-0 left-0 z-30 w-72 bg-gray-800 p-4 flex flex-col border-r border-gray-700
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
        onOpenAchievements={() => setIsAchievementsModalOpen(true)}
        language={language}
        setLanguage={setLanguage}
        currentUser={currentUser}
        onAddCredits={addCredits}
      />
      <StartupSummaryModal
        isOpen={isStartupSummaryOpen}
        onClose={() => setIsStartupSummaryOpen(false)}
        currentUser={currentUser}
      />
      <WelcomeModal 
        isOpen={isWelcomeModalOpen}
        onClose={() => setIsWelcomeModalOpen(false)}
      />
      <DailyBonusModal
        isOpen={isDailyBonusModalOpen}
        onClose={() => setIsDailyBonusModalOpen(false)}
        streak={currentUser.dailyStreak}
        bonus={10}
      />
      <AchievementsModal
        isOpen={isAchievementsModalOpen}
        onClose={() => setIsAchievementsModalOpen(false)}
        userAchievements={currentUser.achievements}
      />
    </div>
  );
};

export default App;