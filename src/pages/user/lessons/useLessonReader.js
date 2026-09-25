import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  stripMarkdownForSpeech, chunkSpeechText, getVoiceKey, sortVoices,
} from './lessonsHelpers';

export function useLessonReader({ selectedLesson, proStatus }) {
  const [isReadingLesson, setIsReadingLesson] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoiceKey, setSelectedVoiceKey] = useState(() => localStorage.getItem('lesson_reader_voice_key') || '');
  const [isVoiceMenuOpen, setIsVoiceMenuOpen] = useState(false);
  const speechSessionRef = useRef(0);

  useEffect(() => {
    const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    if (!synth) return undefined;

    const syncVoices = () => {
      const voices = sortVoices(synth.getVoices() || []);
      setAvailableVoices(voices);
    };

    syncVoices();
    synth.addEventListener?.('voiceschanged', syncVoices);

    return () => {
      synth.removeEventListener?.('voiceschanged', syncVoices);
    };
  }, []);

  useEffect(() => {
    if (!availableVoices.length) return;
    if (selectedVoiceKey && availableVoices.some((voice) => getVoiceKey(voice) === selectedVoiceKey)) {
      return;
    }
    const stored = localStorage.getItem('lesson_reader_voice_key') || '';
    if (stored && availableVoices.some((voice) => getVoiceKey(voice) === stored)) {
      setSelectedVoiceKey(stored);
      return;
    }
    const defaultVoice =
      availableVoices.find((voice) => `${voice.lang || ''}`.toLowerCase().startsWith('tr')) ||
      availableVoices[0];
    if (defaultVoice) {
      setSelectedVoiceKey(getVoiceKey(defaultVoice));
    }
  }, [availableVoices, selectedVoiceKey]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsReadingLesson(false);
    setIsVoiceMenuOpen(false);
    speechSessionRef.current += 1;
  }, [selectedLesson?._id]);

  const stopLessonReading = useCallback(() => {
    speechSessionRef.current += 1;
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsReadingLesson(false);
  }, []);

  const handleSelectVoice = useCallback((voiceKey) => {
    setSelectedVoiceKey(voiceKey);
    localStorage.setItem('lesson_reader_voice_key', voiceKey);
    setIsVoiceMenuOpen(false);
  }, []);

  const speakLessonChunks = useCallback(function speakNext(chunks, sessionId, index = 0) {
    if (
      typeof window === 'undefined' ||
      !window.speechSynthesis ||
      speechSessionRef.current !== sessionId
    ) {
      return;
    }

    if (index >= chunks.length) {
      setIsReadingLesson(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(chunks[index]);
    utterance.lang = 'tr-TR';
    utterance.rate = 0.98;
    utterance.pitch = 1;
    utterance.volume = 1;
    const selectedVoice = availableVoices.find((voice) => getVoiceKey(voice) === selectedVoiceKey);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang || utterance.lang;
    }
    utterance.onend = () => speakNext(chunks, sessionId, index + 1);
    utterance.onerror = () => {
      if (speechSessionRef.current === sessionId) {
        setIsReadingLesson(false);
      }
    };

    window.speechSynthesis.speak(utterance);
  }, [availableVoices, selectedVoiceKey]);

  const handleToggleLessonReading = useCallback(() => {
    if (
      typeof window === 'undefined' ||
      !window.speechSynthesis ||
      !selectedLesson ||
      (selectedLesson.isPro && !proStatus)
    ) {
      return;
    }

    if (window.speechSynthesis.speaking || isReadingLesson) {
      stopLessonReading();
      return;
    }

    const speechText = stripMarkdownForSpeech(
      `${selectedLesson.name}. ${selectedLesson.description ? `${selectedLesson.description}. ` : ''}${selectedLesson.content}`,
    );

    if (!speechText) return;

    const chunks = chunkSpeechText(speechText);
    speechSessionRef.current += 1;
    const sessionId = speechSessionRef.current;

    window.speechSynthesis.cancel();
    setIsReadingLesson(true);
    speakLessonChunks(chunks, sessionId, 0);
  }, [isReadingLesson, selectedLesson, speakLessonChunks, stopLessonReading, proStatus]);

  const selectedVoice = useMemo(
    () => availableVoices.find((voice) => getVoiceKey(voice) === selectedVoiceKey) || null,
    [availableVoices, selectedVoiceKey],
  );

  return {
    isReadingLesson, availableVoices, selectedVoiceKey, isVoiceMenuOpen,
    setIsVoiceMenuOpen, handleSelectVoice, handleToggleLessonReading, selectedVoice,
  };
}
