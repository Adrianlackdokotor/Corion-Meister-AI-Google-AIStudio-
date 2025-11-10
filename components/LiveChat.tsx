
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { LiveServerMessage, LiveSession } from '@google/genai';
import { connectLiveSession } from '../services/geminiService';
import { decode, decodeAudioData, createAudioBlob } from '../utils/audioUtils';
import { Icon } from './Icon';

type TranscriptionEntry = {
    speaker: 'user' | 'model';
    text: string;
};

const LiveChat: React.FC = () => {
    const [isConnecting, setIsConnecting] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [transcriptionHistory, setTranscriptionHistory] = useState<TranscriptionEntry[]>([]);
    
    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

    const currentInputTranscriptionRef = useRef('');
    const currentOutputTranscriptionRef = useRef('');
    const nextStartTimeRef = useRef(0);
    const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    
    const stopSession = useCallback(() => {
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => {
                session.close();
            }).catch(console.error);
            sessionPromiseRef.current = null;
        }

        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }

        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
         if (mediaStreamSourceRef.current) {
            mediaStreamSourceRef.current.disconnect();
            mediaStreamSourceRef.current = null;
        }
        
        // Stop any playing audio
        audioSourcesRef.current.forEach(source => source.stop());
        audioSourcesRef.current.clear();
        nextStartTimeRef.current = 0;

        setIsActive(false);
        setIsConnecting(false);
    }, []);


    const startSession = async () => {
        if (isActive || isConnecting) return;
        
        setIsConnecting(true);
        setError(null);
        setTranscriptionHistory([]);
        currentInputTranscriptionRef.current = '';
        currentOutputTranscriptionRef.current = '';

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            if (!inputAudioContextRef.current) inputAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
            if (!outputAudioContextRef.current) outputAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });

            sessionPromiseRef.current = connectLiveSession({
                onopen: () => {
                    console.log("Live session opened.");
                    setIsConnecting(false);
                    setIsActive(true);

                    const source = inputAudioContextRef.current!.createMediaStreamSource(mediaStreamRef.current!);
                    mediaStreamSourceRef.current = source;
                    const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
                    scriptProcessorRef.current = scriptProcessor;

                    scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const pcmBlob = createAudioBlob(inputData);
                        if (sessionPromiseRef.current) {
                           sessionPromiseRef.current.then((session) => {
                             session.sendRealtimeInput({ media: pcmBlob });
                           });
                        }
                    };
                    source.connect(scriptProcessor);
                    scriptProcessor.connect(inputAudioContextRef.current!.destination);
                },
                onmessage: async (message: LiveServerMessage) => {
                    // Handle audio playback
                    const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                    if (base64Audio && outputAudioContextRef.current) {
                        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current.currentTime);
                        const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current, 24000, 1);
                        const source = outputAudioContextRef.current.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(outputAudioContextRef.current.destination);
                        source.addEventListener('ended', () => audioSourcesRef.current.delete(source));
                        source.start(nextStartTimeRef.current);
                        nextStartTimeRef.current += audioBuffer.duration;
                        audioSourcesRef.current.add(source);
                    }
                    if (message.serverContent?.interrupted) {
                         audioSourcesRef.current.forEach(source => source.stop());
                         audioSourcesRef.current.clear();
                         nextStartTimeRef.current = 0;
                    }

                    // Handle transcriptions
                    if (message.serverContent?.outputTranscription) {
                        currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
                    }
                    if (message.serverContent?.inputTranscription) {
                        currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
                    }
                    if (message.serverContent?.turnComplete) {
                        const userInput = currentInputTranscriptionRef.current.trim();
                        const modelOutput = currentOutputTranscriptionRef.current.trim();
                        setTranscriptionHistory(prev => {
                           const newHistory = [...prev];
                           if(userInput) newHistory.push({ speaker: 'user', text: userInput });
                           if(modelOutput) newHistory.push({ speaker: 'model', text: modelOutput });
                           return newHistory;
                        });
                        currentInputTranscriptionRef.current = '';
                        currentOutputTranscriptionRef.current = '';
                    }
                },
                onerror: (e: ErrorEvent) => {
                    console.error("Live session error:", e);
                    setError("A connection error occurred.");
                    stopSession();
                },
                onclose: (e: CloseEvent) => {
                    console.log("Live session closed.", e);
                    stopSession();
                },
            });
        } catch (err) {
            console.error("Failed to start session:", err);
            setError("Could not access microphone. Please grant permission and try again.");
            setIsConnecting(false);
        }
    };
    
    useEffect(() => {
      // Cleanup on unmount
      return () => {
        stopSession();
      };
    }, [stopSession]);

    return (
        <div className="flex flex-col h-full p-6">
            <h2 className="text-2xl font-bold mb-4">Live Conversation</h2>
            <div className="flex-grow bg-gray-800 rounded-lg p-4 border border-gray-700 overflow-y-auto">
                {transcriptionHistory.length === 0 && !isActive && (
                    <div className="text-center text-gray-500 h-full flex items-center justify-center">
                        Click "Start Conversation" to begin.
                    </div>
                )}
                <div className="space-y-4">
                     {transcriptionHistory.map((entry, index) => (
                        <div key={index} className={`flex items-start gap-3 ${entry.speaker === 'user' ? 'justify-end' : ''}`}>
                             <div className={`p-3 rounded-lg max-w-xl ${entry.speaker === 'user' ? 'bg-red-600 text-right' : 'bg-gray-700'}`}>
                                 {entry.text}
                             </div>
                        </div>
                     ))}
                </div>
            </div>
            <div className="pt-4 flex flex-col items-center gap-4">
                <button
                    onClick={isActive ? stopSession : startSession}
                    disabled={isConnecting}
                    className={`px-8 py-4 rounded-full text-white font-bold text-lg flex items-center gap-2 transition-all duration-300 ${isActive ? 'bg-gray-600 hover:bg-gray-500' : 'bg-red-600 hover:bg-red-700'} disabled:bg-gray-500`}
                >
                    {isConnecting ? (
                        <>
                         <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                         Connecting...
                        </>
                    ) : isActive ? (
                        <>
                            <Icon name="stop" className="h-6 w-6"/>
                            Stop Conversation
                        </>
                    ) : (
                        <>
                            <Icon name="mic" className="h-6 w-6"/>
                            Start Conversation
                        </>
                    )}
                </button>
                {error && <p className="text-red-400">{error}</p>}
            </div>
        </div>
    );
};

export default LiveChat;
