import { GoogleGenAI, Chat, GenerateContentResponse, Modality, Type, LiveSession, LiveServerMessage, CloseEvent, ErrorEvent, FunctionDeclaration } from '@google/genai';
import { FlashcardEvaluation, MultipleChoiceQuestion, Flashcard, Language, LibraryCategory, LibraryEntry, MateMaterial, FormelFlashcard } from '../types';

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. VEO features may require user selection.");
}

const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Text & Chat ---
export const createChatSession = (systemInstruction: string): Chat => {
  const ai = getAIClient();
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction,
    },
  });
};

export const streamChatMessage = async (chat: Chat, message: string) => {
  return chat.sendMessageStream({ message });
};

// --- Image Understanding ---
export const analyzeImage = async (prompt: string, imageBase64: string, mimeType: string): Promise<string> => {
  const ai = getAIClient();
  const imagePart = {
    inlineData: { data: imageBase64, mimeType },
  };
  const textPart = { text: prompt };
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [imagePart, textPart] },
  });
  return response.text;
};


// --- Image Generation ---
export const generateImage = async (prompt: string, aspectRatio: string): Promise<string> => {
  const ai = getAIClient();
  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/jpeg',
      aspectRatio,
    },
  });
  const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
  return `data:image/jpeg;base64,${base64ImageBytes}`;
};

// --- Image Editing ---
export const editImage = async (prompt: string, imageBase64: string, mimeType: string): Promise<string> => {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                {
                    inlineData: { data: imageBase64, mimeType },
                },
                { text: prompt },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            return `data:image/png;base64,${base64ImageBytes}`;
        }
    }
    throw new Error("No image generated in response");
};


// --- Video Generation ---
export const generateVideo = async (prompt: string, aspectRatio: '16:9' | '9:16', image?: { base64: string; mimeType: string }) => {
    const ai = getAIClient(); // Get a fresh client to ensure latest API key is used
    const imagePayload = image ? { imageBytes: image.base64, mimeType: image.mimeType } : undefined;

    let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        image: imagePayload,
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: aspectRatio,
        }
    });

    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
        throw new Error("Video generation failed or did not return a URI.");
    }

    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
};


// --- Text-to-Speech ---
export const generateSpeech = async (text: string): Promise<string> => {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
            },
        },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error("No audio data returned from TTS API.");
    }
    return base64Audio;
};


// --- Live Conversation ---
export const connectLiveSession = (callbacks: {
    onopen: () => void,
    onmessage: (message: LiveServerMessage) => Promise<void>,
    onerror: (e: ErrorEvent) => void,
    onclose: (e: CloseEvent) => void,
  }): Promise<LiveSession> => {
    const ai = getAIClient();
    return ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks,
        config: {
            responseModalities: [Modality.AUDIO],
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
            },
            systemInstruction: 'You are a friendly and helpful AI assistant.',
        },
    });
};

// --- Flashcard Evaluation ---
export const evaluateFlashcardAnswer = async (
  question: string,
  correctAnswer: string,
  userAnswer: string,
  language: Language
): Promise<FlashcardEvaluation> => {
  const ai = getAIClient();
  const prompt = `
    Du bist ein Experte für Lackiertechnik und bewertest die Antwort eines Schülers auf eine Lernkarte.
    Frage: "${question}"
    Erwartete korrekte Antwort: "${correctAnswer}"
    Antwort des Schülers: "${userAnswer}"

    Analysiere, ob die Antwort des Schülers im Vergleich zur korrekten Antwort richtig, teilweise richtig oder falsch ist.
    - Wenn die Antwort 'richtig' ist, gib ein kurzes, positives Feedback.
    - Wenn die Antwort 'teilweise' oder 'falsch' ist, MUSS deine Antwort zwei Teile enthalten:
        1. Die **vollständige, korrekte Antwort auf Deutsch** (im Feld 'correctAnswerDE').
        2. Ein kurzes, konstruktives Feedback, das den Fehler erklärt (im Feld 'feedback').

    **WICHTIG: Das Feedback ('feedback') muss in der Sprache "${language}" verfasst sein.** Die korrekte Antwort ('correctAnswerDE') muss IMMER auf Deutsch sein.

    Deine Antwort muss ein valides JSON sein, das dem folgenden Schema entspricht.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            result: {
              type: Type.STRING,
              enum: ['richtig', 'teilweise', 'falsch'],
              description: "Bewertung der Antwort: richtig, teilweise, oder falsch."
            },
            feedback: {
              type: Type.STRING,
              description: `Ein kurzes, nützliches Feedback in der Sprache ${language}, das die Bewertung erklärt.`
            },
            correctAnswerDE: {
              type: Type.STRING,
              description: "Die vollständige, korrekte Antwort auf Deutsch. NUR angeben, wenn das Ergebnis 'falsch' oder 'teilweise' ist."
            }
          },
          required: ['result', 'feedback'],
        },
      },
    });

    const jsonString = response.text.trim();
    const parsedJson = JSON.parse(jsonString);
    if (parsedJson.result && parsedJson.feedback) {
      return parsedJson as FlashcardEvaluation;
    }
    throw new Error('Invalid JSON structure from API');
  } catch (error) {
    console.error("Failed to evaluate answer:", error);
    return {
      result: 'falsch',
      feedback: 'Bei der Bewertung der Antwort ist ein Fehler aufgetreten. Bitte versuche es erneut.'
    };
  }
};

// --- Multiple Choice Quiz Generation ---
export const generateMultipleChoiceQuiz = async (
  studyMaterials: string,
  language: Language,
  questionCount: number = 5,
  askedQuestions: string[] = []
): Promise<MultipleChoiceQuestion[]> => {
  const ai = getAIClient();
  const askedQuestionsList = askedQuestions.length > 0
    ? `\n\n**WICHTIG: Erstelle KEINE Fragen, die mit den folgenden Fragen identisch oder sehr ähnlich sind:**\n${askedQuestions.map(q => `- ${q}`).join('\n')}`
    : '';

  const prompt = `
    Du bist ein Experte für Lackiertechnik und erstellst ein Multiple-Choice-Quiz für einen Meisterschüler.
    Basierend auf dem folgenden Lernmaterial, erstelle genau ${questionCount} Multiple-Choice-Fragen auf Deutsch.
    Jede Frage muss sich ausschließlich auf den bereitgestellten Text beziehen.
    ${askedQuestionsList}

    Lernmaterial:
    ---
    ${studyMaterials}
    ---
    
    **WICHTIG: Die Erklärung für die richtige Antwort ('explanation') muss in der Sprache "${language}" verfasst sein.** Die Fragen und Optionen müssen auf Deutsch bleiben.

    Deine Antwort muss ein valides JSON-Array sein, das dem folgenden Schema entspricht. Jede Frage muss eine Frage, 4 Optionen (A, B, C, D), die ID der korrekten Antwort und eine kurze Erklärung für die richtige Antwort enthalten.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    text: { type: Type.STRING },
                  },
                  required: ['id', 'text'],
                }
              },
              correctAnswerId: { type: Type.STRING },
              explanation: { type: Type.STRING, description: `Die Erklärung in der Sprache ${language}` }
            },
            required: ['question', 'options', 'correctAnswerId', 'explanation'],
          }
        },
      },
    });

    const jsonString = response.text.trim();
    const parsedJson = JSON.parse(jsonString);
    if (Array.isArray(parsedJson) && parsedJson.length > 0) {
      return parsedJson as MultipleChoiceQuestion[];
    }
    throw new Error('Invalid JSON structure from API or empty array');
  } catch (error) {
    console.error("Failed to generate quiz:", error);
    throw new Error('Bei der Erstellung des Quiz ist ein Fehler aufgetreten. Bitte versuche es erneut.');
  }
};

// --- Flashcard Generation from Text (for Flashcards component) ---
export const generateFlashcardsFromText = async (
  studyMaterials: string,
  categories: { id: string; name: string }[]
): Promise<Pick<Flashcard, 'front' | 'back' | 'categoryId'>[]> => {
  const ai = getAIClient();
  const categoryEnum = categories.map(c => c.id);
  const formattedCategories = JSON.stringify(categories, null, 2);

  const prompt = `
    Du bist ein Experte für Lackiertechnik und erstellst Lernkarten.
    Basierend auf dem folgenden Text, erstelle relevante Lernkarten (Frage/Antwort).
    Ordne JEDE Lernkarte der am besten passenden Kategorie-ID aus der Liste zu.

    Text:
    ---
    ${studyMaterials}
    ---

    Kategorien:
    ---
    ${formattedCategories}
    ---

    Deine Antwort muss ein valides JSON-Array sein.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              front: { type: Type.STRING },
              back: { type: Type.STRING },
              categoryId: { type: Type.STRING, enum: categoryEnum }
            },
            required: ['front', 'back', 'categoryId'],
          }
        },
      },
    });

    const jsonString = response.text.trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Failed to generate flashcards from text:", error);
    throw new Error('Fehler bei der AI-Generierung von Lernkarten.');
  }
};


// --- Library Entry Generation from Text (for StudyMaterials component) ---
export const generateLibraryEntriesFromText = async (
  extractedText: string,
  existingCategories: LibraryCategory[]
): Promise<{ question: string; answer: string; categoryTitle: string }[]> => {
  const ai = getAIClient();
  const categoryTitles = existingCategories.map(c => c.title);

  const prompt = `
    Du bist ein Experte für Lackiertechnik und deine Aufgabe ist es, aus einem Text sinnvolle Frage-Antwort-Paare für eine Lernbibliothek zu erstellen.
    Analysiere den folgenden Text und erstelle eine Liste von strukturierten Frage-Antwort-Paaren.
    Ordne jedes Paar einer passenden Kategorie zu. Du kannst eine der existierenden Kategorien verwenden oder, falls keine passt, einen neuen, prägnanten Kategorietitel vorschlagen.

    Text zum Analysieren:
    ---
    ${extractedText}
    ---

    Existierende Kategorien:
    ---
    ${categoryTitles.join(', ')}
    ---

    Deine Antwort muss ein valides JSON-Array sein, bei dem jedes Objekt eine 'question', eine 'answer' und einen 'categoryTitle' enthält.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING, description: "Die generierte Frage." },
              answer: { type: Type.STRING, description: "Die generierte Antwort." },
              categoryTitle: { type: Type.STRING, description: "Der Titel der passendsten Kategorie (existierend oder neu)." }
            },
            required: ['question', 'answer', 'categoryTitle'],
          }
        },
      },
    });

    const jsonString = response.text.trim();
    const parsedJson = JSON.parse(jsonString);
    if (Array.isArray(parsedJson)) {
      return parsedJson;
    }
    throw new Error('Invalid JSON structure from API');
  } catch (error) {
    console.error("Failed to generate library entries:", error);
    throw new Error('Fehler bei der AI-Generierung von Bibliothekeinträgen.');
  }
};

// --- MATE Formeln Flashcard Generation ---
export const generateFormelFlashcardsFromText = async (
  extractedText: string
): Promise<Pick<FormelFlashcard, 'front' | 'back'>[]> => {
  const ai = getAIClient();
  const prompt = `
    Du bist ein Experte für Lackiertechnik und Betriebswirtschaft. Deine Aufgabe ist es, aus einem Text relevante Formeln und deren Erklärungen zu extrahieren und sie in Lernkarten umzuwandeln.
    Analysiere den folgenden Text und erstelle eine Liste von Lernkarten. Jede Lernkarte sollte einen Namen/eine Frage auf der Vorderseite ('front') und die Formel/Erklärung auf der Rückseite ('back') haben.

    **Text zum Analysieren:**
    ---
    ${extractedText}
    ---

    **Deine Antwort muss ein valides JSON-Array sein, bei dem jedes Objekt einen 'front'- und einen 'back'-Schlüssel enthält.**
    - 'front': Der Name der Formel oder eine Frage dazu.
    - 'back': Die Formel selbst, ein Rechenbeispiel oder eine kurze Erklärung.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              front: { type: Type.STRING, description: "Der Name der Formel oder eine Frage dazu." },
              back: { type: Type.STRING, description: "Die Formel selbst, ein Rechenbeispiel oder eine kurze Erklärung." }
            },
            required: ['front', 'back'],
          }
        },
      },
    });
    const jsonString = response.text.trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Failed to generate formula flashcards:", error);
    throw new Error('Fehler bei der AI-Generierung von Formel-Lernkarten.');
  }
};

// --- MATE Kalkulation Explanation ---
export const explainTextSelection = async (
  selectedText: string,
  fullContext: string,
  language: Language
): Promise<string> => {
  const ai = getAIClient();
  const prompt = `
    Du bist "Lackierer-Meister Corion", ein KI-Lerncoach.
    Ein Schüler hat einen Textabschnitt aus einem Lernmaterial markiert und bittet um eine Erklärung.
    Erkläre den markierten Abschnitt einfach und klar, im Kontext des gesamten Dokuments.

    **Gesamtes Dokument (Kontext):**
    ---
    ${fullContext}
    ---

    **Vom Schüler markierter Text:**
    ---
    ${selectedText}
    ---

    **Deine Aufgabe:**
    Erstelle eine kurze, hilfreiche Erklärung für den markierten Text.
    **WICHTIG: Die Erklärung muss in der Sprache "${language}" verfasst sein.**
  `;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Failed to explain text selection:", error);
    throw new Error('Fehler bei der AI-Erklärung.');
  }
};

// --- MATE Kalkulation Material Generation ---
export const generateMateMaterialFromText = async (
  extractedText: string
): Promise<Pick<MateMaterial, 'title' | 'content'>> => {
    const ai = getAIClient();
    const prompt = `
      Du bist ein Experte für Lackiertechnik und Betriebswirtschaft. Deine Aufgabe ist es, einen unstrukturierten Text in ein sauberes, formatiertes Lernmaterial für die "Kalkulation"-Bibliothek umzuwandeln.
      Analysiere den folgenden Text und erstelle einen passenden Titel und einen gut strukturierten Inhalt im Markdown-Format.

      **Roh-Text zum Analysieren:**
      ---
      ${extractedText}
      ---

      **Deine Antwort muss ein valides JSON-Objekt sein mit den Schlüsseln "title" und "content".**
      - 'title': Ein kurzer, prägnanter Titel für das Lernmaterial.
      - 'content': Der formatierte Inhalt in Markdown (Überschriften, Listen, fette Schrift etc. verwenden).
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING, description: "Der generierte Titel." },
                        content: { type: Type.STRING, description: "Der Inhalt in Markdown formatiert." }
                    },
                    required: ['title', 'content'],
                },
            },
        });
        const jsonString = response.text.trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Failed to generate MATE material:", error);
        throw new Error('Fehler bei der AI-Generierung von Kalkulationsmaterial.');
    }
};