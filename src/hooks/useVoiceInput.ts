import { useState, useCallback, useRef, useEffect } from 'react';

interface VoiceInputOptions {
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
}

export function useVoiceInput(options: VoiceInputOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    continuous = false,
    interimResults = true,
    language = 'en-US'
  } = options;

  // Check for browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
    }
  }, []);

  const initializeRecognition = useCallback(() => {
    if (!recognitionRef.current) return;

    const recognition = recognitionRef.current;
    
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
      
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
    };

    recognition.onerror = (event) => {
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
      
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcriptText = result[0].transcript;

        if (result.isFinal) {
          finalTranscript += transcriptText;
        } else {
          interimTranscript += transcriptText;
        }
      }

      if (finalTranscript) {
        setTranscript(prev => prev + finalTranscript);
        setInterimTranscript('');
      } else {
        setInterimTranscript(interimTranscript);
      }

      // Reset silence timer on speech
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }

      // Auto-stop after 3 seconds of silence
      silenceTimerRef.current = setTimeout(() => {
        if (recognition && isListening) {
          recognition.stop();
        }
      }, 3000);
    };
  }, [continuous, interimResults, language, isListening]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser');
      return;
    }

    if (!recognitionRef.current) {
      setError('Speech recognition not initialized');
      return;
    }

    try {
      initializeRecognition();
      recognitionRef.current.start();
    } catch (error) {
      setError('Failed to start speech recognition');
      console.error('Speech recognition start error:', error);
    }
  }, [isSupported, initializeRecognition]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  const parseTaskFromTranscript = useCallback((text: string) => {
    const cleanText = text.trim().toLowerCase();
    
    // Simple parsing logic for voice commands
    const result = {
      title: '',
      description: '',
      priority: 'medium' as const,
      dueDate: undefined as Date | undefined,
      dueTime: ''
    };

    // Remove common voice command prefixes
    let taskText = cleanText
      .replace(/^(add task|create task|new task|add|create|make|schedule|remind me to|i need to|todo)/i, '')
      .trim();

    // Extract priority keywords
    if (/\b(urgent|important|high priority|asap|critical)\b/i.test(taskText)) {
      result.priority = 'high';
      taskText = taskText.replace(/\b(urgent|important|high priority|asap|critical)\b/gi, '').trim();
    } else if (/\b(low priority|later|someday|when possible)\b/i.test(taskText)) {
      result.priority = 'low';
      taskText = taskText.replace(/\b(low priority|later|someday|when possible)\b/gi, '').trim();
    }

    // Extract time-related keywords
    const timePatterns = [
      { pattern: /\b(today|this afternoon|this evening)\b/i, date: new Date() },
      { pattern: /\btomorrow\b/i, date: new Date(Date.now() + 24 * 60 * 60 * 1000) },
      { pattern: /\bnext week\b/i, date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
    ];

    for (const timePattern of timePatterns) {
      if (timePattern.pattern.test(taskText)) {
        result.dueDate = timePattern.date;
        taskText = taskText.replace(timePattern.pattern, '').trim();
        break;
      }
    }

    // Extract time of day
    const timeMatch = taskText.match(/\bat (\d{1,2}):?(\d{2})?\s*(am|pm|a\.m\.|p\.m\.)?/i);
    if (timeMatch) {
      const hour = parseInt(timeMatch[1]);
      const minute = parseInt(timeMatch[2] || '0');
      const meridiem = timeMatch[3]?.toLowerCase();
      
      let hour24 = hour;
      if (meridiem?.includes('p') && hour !== 12) {
        hour24 += 12;
      } else if (meridiem?.includes('a') && hour === 12) {
        hour24 = 0;
      }
      
      result.dueTime = `${hour24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      taskText = taskText.replace(timeMatch[0], '').trim();
    }

    // Split title and description
    const sentences = taskText.split(/[.!?]/).filter(s => s.trim());
    if (sentences.length > 0) {
      result.title = sentences[0].trim();
      if (sentences.length > 1) {
        result.description = sentences.slice(1).join('. ').trim();
      }
    }

    // Clean up title
    result.title = result.title
      .replace(/^(and|with|for|to)\s+/i, '')
      .trim();

    // Capitalize first letter
    if (result.title) {
      result.title = result.title.charAt(0).toUpperCase() + result.title.slice(1);
    }

    return result;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening]);

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
    parseTaskFromTranscript
  };
}