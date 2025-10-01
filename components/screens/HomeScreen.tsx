
import React, { useState, useRef, useEffect } from 'react';
// FIX: Update import paths to use the common directory
import { Language, Vegetable, OrderItem, ParsedOrderItem, User } from '../../common/types';
import { translations } from '../../common/constants';
import VegetableCard from '../VegetableCard';
import LoadingSpinner from '../LoadingSpinner';
import { GoogleGenAI, LiveServerMessage, Modality, Blob, Session, Type } from '@google/genai';
import { getTodaysVegetables, sendDeliveryConfirmation, sendVoiceOrder } from '../../common/api';
import VegetableDetailModal from '../VegetableDetailModal';


// --- Gemini API Helpers ---
const API_KEY = process.env.API_KEY;

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}
// --- End Gemini API Helpers ---

interface HomeScreenProps {
  language: Language;
  searchQuery: string;
  user: User;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ language, searchQuery, user }) => {
  const [vegetables, setVegetables] = useState<Vegetable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deliveryChoice, setDeliveryChoice] = useState<'YES' | 'NO' | null>(null);
  const t = translations[language];

  // --- Order State ---
  const [modalVegetable, setModalVegetable] = useState<Vegetable | null>(null);
  const [order, setOrder] = useState<OrderItem[]>([]);
  const [confirmedVegIds, setConfirmedVegIds] = useState<number[]>([]);

  // --- Voice AI State ---
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [transcription, setTranscription] = useState('');
  const sessionRef = useRef<Session | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const transcriptionRef = useRef('');
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  // --- End Voice AI State ---

  useEffect(() => {
    const fetchVeggies = async () => {
      try {
        setIsLoading(true);
        const veggiesData = await getTodaysVegetables();
        setVegetables(veggiesData);
      } catch (error) {
        console.error("Failed to fetch vegetables:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVeggies();
  }, []);

  const handleDeliveryChoice = (choice: 'YES' | 'NO') => {
    setDeliveryChoice(choice);
    sendDeliveryConfirmation(choice, user);
  };
  
  const processTranscription = async (text: string) => {
    if (!text.trim() || !API_KEY) return;
    
    setIsProcessingVoice(true);
    console.log(`Processing transcription: "${text}"`);
    
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Parse the following user request and extract the vegetable names and their quantities. The quantity must be one of '100g', '250g', '500g', or '1kg'. Normalize weights like 'half a kilo' to '500g', 'a quarter kilo' to '250g', and 'pao' to '250g'. If no quantity is mentioned for a vegetable, default it to '1kg'. Request: "${text}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            vegetable: {
                                type: Type.STRING,
                                description: 'The name of the vegetable in English or Hindi.',
                            },
                            quantity: {
                                type: Type.STRING,
                                description: "The quantity. Must be one of: '100g', '250g', '500g', '1kg'.",
                            },
                        },
                        required: ["vegetable", "quantity"],
                    },
                },
            },
        });
        
        const jsonStr = response.text.trim();
        const parsedItems = JSON.parse(jsonStr) as ParsedOrderItem[];

        sendVoiceOrder({ transcription: text, items: parsedItems });

        const veggiesToUpdate = parsedItems.map(item => {
            const veg = vegetables.find(v => 
                v.name[Language.EN].toLowerCase() === item.vegetable.toLowerCase() || 
                v.name[Language.HI] === item.vegetable
            );
            return veg ? { id: veg.id, quantity: item.quantity } : null;
        }).filter((item): item is { id: number; quantity: string } => item !== null);

        veggiesToUpdate.forEach(item => {
            updateQuantity(item.id, item.quantity);
        });

    } catch (error) {
        console.error("Error processing transcription with Gemini:", error);
        const lowerText = text.toLowerCase();
        vegetables.forEach(veg => {
            const enName = veg.name[Language.EN].toLowerCase();
            const hiName = veg.name[Language.HI];
            if (lowerText.includes(enName) || lowerText.includes(hiName)) {
                updateQuantity(veg.id, '1kg');
            }
        });
    } finally {
        setIsProcessingVoice(false);
    }
  };

  const stopRecording = () => {
    if (!sessionRef.current && !isRecording) return;
    
    const sessionToClose = sessionRef.current;
    const currentTranscription = transcriptionRef.current;

    sessionRef.current = null;
    setIsRecording(false);
      
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(console.error);
    }
    audioContextRef.current = null;
    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
      outputAudioContextRef.current.close().catch(console.error);
    }
    outputAudioContextRef.current = null;
    
    if (sessionToClose) {
        sessionToClose.close();
    }

    setTranscription('');
    transcriptionRef.current = '';

    if (currentTranscription.trim()) {
      processTranscription(currentTranscription);
    }
  };

  const startRecording = async () => {
    if (!API_KEY) {
        alert("API_KEY is not set. Please configure it in your environment.");
        return;
    }
    setIsRecording(true);
    setTranscription('');
    transcriptionRef.current = '';

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        
        const ai = new GoogleGenAI({ apiKey: API_KEY });

        const sessionPromise = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            callbacks: {
                onopen: () => console.log('Session opened'),
                onmessage: async (message: LiveServerMessage) => {
                    if (message.serverContent?.inputTranscription) {
                        const text = message.serverContent.inputTranscription.text;
                        setTranscription(prev => prev + text);
                        transcriptionRef.current += text;
                    }

                    const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                    if (base64EncodedAudioString && outputAudioContextRef.current) {
                        nextStartTimeRef.current = Math.max(
                            nextStartTimeRef.current,
                            outputAudioContextRef.current.currentTime,
                        );
                        const audioBuffer = await decodeAudioData(
                            decode(base64EncodedAudioString),
                            outputAudioContextRef.current,
                            24000,
                            1,
                        );
                        const source = outputAudioContextRef.current.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(outputAudioContextRef.current.destination);
                        source.addEventListener('ended', () => {
                            sourcesRef.current.delete(source);
                        });

                        source.start(nextStartTimeRef.current);
                        nextStartTimeRef.current = nextStartTimeRef.current + audioBuffer.duration;
                        sourcesRef.current.add(source);
                    }

                    const interrupted = message.serverContent?.interrupted;
                    if (interrupted) {
                        for (const source of sourcesRef.current.values()) {
                          source.stop();
                          sourcesRef.current.delete(source);
                        }
                        nextStartTimeRef.current = 0;
                    }

                    if (message.serverContent?.turnComplete) {
                        stopRecording();
                    }
                },
                onerror: (e: ErrorEvent) => {
                    console.error('Session error:', e);
                    stopRecording();
                },
                onclose: (e: CloseEvent) => {
                    console.log('Session closed');
                    stopRecording();
                },
            },
            config: {
                responseModalities: [Modality.AUDIO],
                inputAudioTranscription: {},
            },
        });
        
        sessionRef.current = await sessionPromise;
        
        audioContextRef.current = new ((window as any).AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        outputAudioContextRef.current = new ((window as any).AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const source = audioContextRef.current.createMediaStreamSource(stream);
        const scriptProcessor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
        
        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
            const pcmBlob = createBlob(inputData);
            sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
        };
        
        scriptProcessorRef.current = scriptProcessor;
        source.connect(scriptProcessor);
        scriptProcessor.connect(audioContextRef.current.destination);

    } catch (error) {
        console.error("Failed to start recording:", error);
        setIsRecording(false);
        alert("Could not start recording. Please ensure you have given microphone permissions.");
    }
  };
  
  const handleVoiceButtonClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      handleDeliveryChoice('YES'); // Voice ordering implies a YES
      startRecording();
    }
  };

  useEffect(() => {
    return () => stopRecording(); // Cleanup on component unmount
  }, []);
  
  // --- Order Quantity Functions ---
  const updateQuantity = (vegId: number, newQuantity: string) => {
    const currentItem = order.find(item => item.id === vegId);
    const isAdding = newQuantity && (!currentItem || currentItem.quantity !== newQuantity);
    
    if (isAdding) {
      setConfirmedVegIds(prev => [...prev, vegId]);
      setTimeout(() => {
        setConfirmedVegIds(prev => prev.filter(id => id !== vegId));
      }, 1500);
    }

    setOrder(prevOrder => {
      const existingItemIndex = prevOrder.findIndex(item => item.id === vegId);
      if (existingItemIndex > -1) {
        if (!newQuantity) {
          return prevOrder.filter(item => item.id !== vegId);
        }
        const updatedOrder = [...prevOrder];
        updatedOrder[existingItemIndex] = { ...updatedOrder[existingItemIndex], quantity: newQuantity };
        return updatedOrder;
      } else if (newQuantity) {
        return [...prevOrder, { id: vegId, quantity: newQuantity }];
      }
      return prevOrder;
    });
  };

  const getQuantity = (vegId: number): string => {
    return order.find(item => item.id === vegId)?.quantity || '';
  };
  // ---

  const filteredVegetables = vegetables.filter(veg =>
    searchQuery === '' ||
    veg.name[Language.EN].toLowerCase().includes(searchQuery.toLowerCase()) ||
    veg.name[Language.HI].includes(searchQuery)
  );

  return (
    <div className="p-4 space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-4">{t.willYouTakeVeg}</h2>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => handleDeliveryChoice('YES')}
            className={`w-32 py-4 text-2xl font-bold text-white rounded-lg shadow-lg transform hover:scale-105 transition-transform ${deliveryChoice === 'YES' ? 'bg-green-600 ring-4 ring-green-300' : 'bg-green-500'}`}
          >
            {t.yes}
          </button>
          <button
            onClick={() => handleDeliveryChoice('NO')}
            className={`w-32 py-4 text-2xl font-bold text-white rounded-lg shadow-lg transform hover:scale-105 transition-transform ${deliveryChoice === 'NO' ? 'bg-red-700 ring-4 ring-red-300' : 'bg-red-600'}`}
          >
            {t.no}
          </button>
        </div>
         {deliveryChoice === 'YES' && (
            <div className="mt-6">
                <button 
                    onClick={handleVoiceButtonClick}
                    disabled={isProcessingVoice}
                    className={`w-full py-3 text-lg font-bold text-white rounded-lg shadow-md transition-colors flex items-center justify-center space-x-2 
                        ${isRecording ? 'bg-amber-500 animate-pulse' : 
                         isProcessingVoice ? 'bg-gray-400 cursor-not-allowed' : 
                         'bg-green-600 hover:bg-green-700'}`}
                    aria-label={isRecording ? 'Stop recording' : isProcessingVoice ? 'Processing your order' : 'Start recording for vegetable selection'}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    <span>
                        {isRecording ? (language === Language.EN ? 'Listening...' : 'सुन रहा है...') :
                         isProcessingVoice ? (language === Language.EN ? 'Processing...' : 'प्रोसेस हो रहा है...') :
                         (language === Language.EN ? 'Speak here' : 'यहां बोलें')}
                    </span>
                </button>
                {(isRecording || transcription) && <p className="text-sm text-gray-500 mt-2 h-4">{transcription || '...'}</p>}
            </div>
         )}
        {deliveryChoice && !isRecording && !isProcessingVoice && (
           <p className={`mt-4 text-md font-semibold ${deliveryChoice === 'YES' ? 'text-green-700' : 'text-red-800'}`}>
            {deliveryChoice === 'YES' ? t.deliveryConfirmation : t.noDeliveryConfirmation}
           </p>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{t.todaysVeggies}</h2>
        {isLoading ? <LoadingSpinner /> : filteredVegetables.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filteredVegetables.map((veg) => (
              <VegetableCard 
                key={veg.id} 
                vegetable={veg} 
                language={language} 
                onClick={() => setModalVegetable(veg)}
                onDeselect={() => updateQuantity(veg.id, '')}
                quantity={getQuantity(veg.id)}
                isConfirmed={confirmedVegIds.includes(veg.id)}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 mt-8">
            {language === Language.EN ? 'No vegetables found.' : 'कोई सब्जी नहीं मिली।'}
          </p>
        )}
      </div>

      {modalVegetable && (
        <VegetableDetailModal
            vegetable={modalVegetable}
            language={language}
            onClose={() => setModalVegetable(null)}
            onQuantityChange={updateQuantity}
            initialQuantity={getQuantity(modalVegetable.id)}
        />
      )}
    </div>
  );
};

export default HomeScreen;