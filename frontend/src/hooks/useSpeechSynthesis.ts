import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type WordRange = {
  start: number;
  end: number;
};

export interface SpeechVoiceOption {
  id: string;
  name: string;
  lang: string;
  label: string;
  localService: boolean;
  isDefault: boolean;
}

export interface LanguageOption {
  lang: string;
  label: string;
  voiceCount: number;
}

export interface SpeechProgress {
  currentWordIndex: number;
  totalWords: number;
  percentage: number;
}

export interface UseSpeechSynthesisResult {
  isPlaying: boolean;
  isPaused: boolean;
  isSpeaking: boolean;
  play: (text?: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  rate: number;
  setRate: (nextRate: number) => void;
  pitch: number;
  setPitch: (nextPitch: number) => void;
  volume: number;
  setVolume: (nextVolume: number) => void;
  progress: SpeechProgress;
  isSupported: boolean;
  isReady: boolean;
  error: string | null;
  currentWordIndex: number;
  isLoading: boolean;
  availableVoices: SpeechSynthesisVoice[];
  selectedVoiceIndex: number;
  setSelectedVoice: (index: number) => void;
  playbackRate: number;
  setPlaybackRate: (nextRate: number) => void;
  voices: SpeechVoiceOption[];
  selectedVoiceId: string;
  setSelectedVoiceId: (id: string) => void;
  selectedLanguage: string;
  setSelectedLanguage: (lang: string) => void;
  languageOptions: LanguageOption[];
}

const hasSpeechSupport = (): boolean => {
  return (
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    "SpeechSynthesisUtterance" in window
  );
};

const getVoiceId = (voice: SpeechSynthesisVoice): string =>
  voice.voiceURI || `${voice.name}-${voice.lang}`;

const filterVoicesByGender = (
  browserVoices: SpeechSynthesisVoice[],
  gender?: "female" | "male",
): SpeechSynthesisVoice[] => {
  if (!gender) {
    return browserVoices;
  }

  const femalePattern =
    /female|woman|samantha|zira|victoria|karen|moira|tessa|fiona|veena|lekha|susan|linda|heather|serena|aria/i;
  const malePattern =
    /male|man|daniel|david|alex|fred|tom|rishi|mark|james|george|richard|guy|ryan|brian/i;

  const pattern = gender === "female" ? femalePattern : malePattern;
  const filtered = browserVoices.filter((voice) => pattern.test(voice.name));

  return filtered.length > 0 ? filtered : browserVoices;
};

const getLanguageLabel = (lang: string): string => {
  try {
    const display = new Intl.DisplayNames([window.navigator.language || "en"], {
      type: "language",
    });
    return display.of(lang.split("-")[0]) ?? lang;
  } catch {
    return lang;
  }
};

const mapVoiceOption = (voice: SpeechSynthesisVoice): SpeechVoiceOption => ({
  id: getVoiceId(voice),
  name: voice.name,
  lang: voice.lang,
  label: `${voice.name} (${voice.lang})`,
  localService: voice.localService,
  isDefault: voice.default,
});

const getPreferredLanguage = (): string => {
  return window.navigator.language || "en-US";
};

const findVoiceForLanguage = (
  voices: SpeechVoiceOption[],
  language: string,
): SpeechVoiceOption | undefined => {
  const normalizedLanguage = language.toLowerCase();
  const languagePrefix = normalizedLanguage.split("-")[0];

  return (
    voices.find((voice) => voice.lang.toLowerCase() === normalizedLanguage) ||
    voices.find((voice) => voice.lang.toLowerCase().startsWith(`${languagePrefix}-`)) ||
    voices.find((voice) => voice.lang.toLowerCase().startsWith(languagePrefix))
  );
};

const buildWordRanges = (inputText: string): WordRange[] => {
  if (!inputText.trim()) {
    return [];
  }

  const ranges: WordRange[] = [];
  const wordPattern = /\S+/g;

  for (const match of inputText.matchAll(wordPattern)) {
    const start = match.index ?? 0;
    ranges.push({
      start,
      end: start + match[0].length,
    });
  }

  return ranges;
};

const getWordIndexAtCharIndex = (
  charIndex: number,
  ranges: WordRange[],
): number => {
  if (ranges.length === 0) {
    return 0;
  }

  const matchIndex = ranges.findIndex(
    (range) => charIndex >= range.start && charIndex <= range.end,
  );

  if (matchIndex >= 0) {
    return matchIndex;
  }

  const fallbackIndex = ranges.findIndex((range) => charIndex < range.start);
  return fallbackIndex >= 0 ? Math.max(0, fallbackIndex - 1) : ranges.length - 1;
};

export const useSpeechSynthesis = (
  text: string = "",
  voiceGender?: "female" | "male",
): UseSpeechSynthesisResult => {
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const sessionRef = useRef(0);
  const previousTextRef = useRef(text);
  const wordRangesRef = useRef<WordRange[]>(buildWordRanges(text));

  const [isSupported, setIsSupported] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [rateState, setRateState] = useState(1);
  const [pitchState, setPitchState] = useState(1);
  const [volumeState, setVolumeState] = useState(1);

  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(0);
  const [selectedVoiceId, setSelectedVoiceId] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");

  const voices = useMemo(() => {
    const genderFiltered = filterVoicesByGender(availableVoices, voiceGender);
    return genderFiltered.map(mapVoiceOption);
  }, [availableVoices, voiceGender]);

  const languageOptions = useMemo<LanguageOption[]>(() => {
    const counts = new Map<string, number>();
    for (const voice of voices) {
      counts.set(voice.lang, (counts.get(voice.lang) ?? 0) + 1);
    }

    return Array.from(counts.entries())
      .map(([lang, voiceCount]) => ({
        lang,
        label: getLanguageLabel(lang),
        voiceCount,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [voices]);

  useEffect(() => {
    wordRangesRef.current = buildWordRanges(text);
  }, [text]);

  const resolveBrowserVoice = useCallback(
    (voiceId: string): SpeechSynthesisVoice | undefined => {
      const genderFiltered = filterVoicesByGender(availableVoices, voiceGender);
      return genderFiltered.find((voice) => getVoiceId(voice) === voiceId);
    },
    [availableVoices, voiceGender],
  );

  const clearUtterance = useCallback(() => {
    utteranceRef.current = null;
    if (synthRef.current) {
      synthRef.current.cancel();
    }
  }, []);

  const resetNarrationState = useCallback(() => {
    setIsPaused(false);
    setIsSpeaking(false);
    setCurrentWordIndex(0);
  }, []);

  const stop = useCallback(() => {
    sessionRef.current += 1;
    clearUtterance();
    resetNarrationState();
  }, [clearUtterance, resetNarrationState]);

  const play = useCallback(
    (textToSpeakOverride?: string) => {
      if (!isSupported) {
        setError("Speech synthesis is not supported in this browser.");
        return;
      }

      const textToSpeak = (textToSpeakOverride ?? text).trim();
      if (!textToSpeak) {
        setError("No text available for narration.");
        return;
      }

      if (!isReady || availableVoices.length === 0) {
        setError("Speech voices are still loading. Please try again in a moment.");
        return;
      }

      const speechSynthesis = window.speechSynthesis;
      sessionRef.current += 1;
      const sessionId = sessionRef.current;

      clearUtterance();
      setError(null);
      setCurrentWordIndex(0);
      setIsPaused(false);
      setIsSpeaking(true);

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = rateState;
      utterance.pitch = pitchState;
      utterance.volume = volumeState;
      utterance.lang = selectedLanguage;

      let browserVoice = resolveBrowserVoice(selectedVoiceId);
      if (!browserVoice && availableVoices[selectedVoiceIndex]) {
        browserVoice = availableVoices[selectedVoiceIndex];
      }

      if (browserVoice) {
        utterance.voice = browserVoice;
        utterance.lang = browserVoice.lang;
      }

      utterance.onstart = () => {
        if (sessionRef.current !== sessionId) return;
        setIsSpeaking(true);
        setIsPaused(false);
      };

      utterance.onboundary = (event: SpeechSynthesisEvent) => {
        if (sessionRef.current !== sessionId) return;
        if (event.name !== "word") return;
        if (typeof event.charIndex === "number") {
          const ranges = textToSpeakOverride ? buildWordRanges(textToSpeak) : wordRangesRef.current;
          setCurrentWordIndex(getWordIndexAtCharIndex(event.charIndex, ranges));
        }
      };

      utterance.onend = () => {
        if (sessionRef.current !== sessionId) return;
        utteranceRef.current = null;
        setIsSpeaking(false);
        setIsPaused(false);
        const ranges = textToSpeakOverride ? buildWordRanges(textToSpeak) : wordRangesRef.current;
        setCurrentWordIndex(ranges.length);
      };

      utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
        if (sessionRef.current !== sessionId) return;
        utteranceRef.current = null;
        setIsSpeaking(false);
        setIsPaused(false);
        if (event.error !== "interrupted") {
          setError("Narration failed to play.");
        }
      };

      utteranceRef.current = utterance;
      speechSynthesis.speak(utterance);
    },
    [
      isSupported,
      isReady,
      text,
      availableVoices,
      selectedVoiceIndex,
      selectedVoiceId,
      selectedLanguage,
      rateState,
      pitchState,
      volumeState,
      resolveBrowserVoice,
      clearUtterance,
    ],
  );

  const pause = useCallback(() => {
    if (synthRef.current && isSpeaking && !isPaused) {
      synthRef.current.pause();
      setIsPaused(true);
    }
  }, [isPaused, isSpeaking]);

  const resume = useCallback(() => {
    if (synthRef.current && isPaused) {
      synthRef.current.resume();
      setIsPaused(false);
    }
  }, [isPaused]);

  const setRate = useCallback((nextRate: number) => {
    const clamped = Math.min(2, Math.max(0.5, nextRate));
    setRateState(clamped);
    if (utteranceRef.current) {
      utteranceRef.current.rate = clamped;
    }
  }, []);

  const setPlaybackRate = useCallback((nextRate: number) => {
    const clamped = Math.min(2, Math.max(0.5, nextRate));
    setRateState(clamped);
    if (utteranceRef.current) {
      utteranceRef.current.rate = clamped;
    }
  }, []);

  const setPitch = useCallback((nextPitch: number) => {
    const clamped = Math.min(2, Math.max(0.5, nextPitch));
    setPitchState(clamped);
    if (utteranceRef.current) {
      utteranceRef.current.pitch = clamped;
    }
  }, []);

  const setVolume = useCallback((nextVolume: number) => {
    const clamped = Math.min(1, Math.max(0, nextVolume));
    setVolumeState(clamped);
    if (utteranceRef.current) {
      utteranceRef.current.volume = clamped;
    }
  }, []);

  const handleSetSelectedLanguage = useCallback((nextLanguage: string) => {
    stop();
    setSelectedLanguage(nextLanguage);
    const matchedVoice = findVoiceForLanguage(voices, nextLanguage);
    if (matchedVoice) {
      setSelectedVoiceId(matchedVoice.id);
    }
  }, [stop, voices]);

  const handleSetSelectedVoiceId = useCallback((nextVoiceId: string) => {
    stop();
    setSelectedVoiceId(nextVoiceId);
    const matchedVoice = voices.find((voice) => voice.id === nextVoiceId);
    if (matchedVoice) {
      setSelectedLanguage(matchedVoice.lang);
    }
  }, [stop, voices]);

  const handleSetSelectedVoice = useCallback((index: number) => {
    stop();
    setSelectedVoiceIndex(index);
    if (availableVoices[index]) {
      setSelectedVoiceId(getVoiceId(availableVoices[index]));
    }
  }, [stop, availableVoices]);

  useEffect(() => {
    const supported = hasSpeechSupport();
    setIsSupported(supported);

    if (!supported) {
      setIsReady(false);
      setError("Speech synthesis is not supported in this browser.");
      return;
    }

    const speechSynthesis = window.speechSynthesis;
    synthRef.current = speechSynthesis;
    let isMounted = true;

    const syncVoices = () => {
      if (!isMounted) return;
      const loadedVoices = speechSynthesis.getVoices();
      setAvailableVoices(loadedVoices);
      setIsReady(loadedVoices.length > 0);
    };

    syncVoices();

    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.addEventListener("voiceschanged", syncVoices);
      return () => {
        isMounted = false;
        speechSynthesis.removeEventListener("voiceschanged", syncVoices);
      };
    }

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (voices.length === 0) return;
    const voiceStillExists = voices.some((voice) => voice.id === selectedVoiceId);
    if (!voiceStillExists) {
      setSelectedVoiceId(voices[0].id);
    }
  }, [selectedVoiceId, voices]);

  useEffect(() => {
    if (languageOptions.length === 0) return;
    const languageStillExists = languageOptions.some(
      (option) => option.lang === selectedLanguage,
    );
    if (!languageStillExists) {
      setSelectedLanguage(languageOptions[0].lang);
    }
  }, [languageOptions, selectedLanguage]);

  useEffect(() => {
    const textChanged = previousTextRef.current !== text;
    previousTextRef.current = text;
    if (textChanged) {
      stop();
    }
  }, [text, stop]);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  const progress = useMemo<SpeechProgress>(() => {
    const totalWords = wordRangesRef.current.length;
    if (totalWords === 0) {
      return {
        currentWordIndex: 0,
        totalWords: 0,
        percentage: 0,
      };
    }

    const boundedCurrentWordIndex = Math.min(
      Math.max(currentWordIndex, 0),
      totalWords - 1,
    );

    const hasNarrationProgress = isSpeaking || isPaused || currentWordIndex > 0;
    const spokenWords = hasNarrationProgress ? Math.min(boundedCurrentWordIndex + 1, totalWords) : 0;

    return {
      currentWordIndex: boundedCurrentWordIndex,
      totalWords,
      percentage: totalWords > 0 ? spokenWords / totalWords : 0,
    };
  }, [currentWordIndex, isSpeaking, isPaused]);

  return {
    isPlaying: isSpeaking && !isPaused,
    isPaused,
    isSpeaking,
    play,
    pause,
    resume,
    stop,
    rate: rateState,
    setRate,
    pitch: pitchState,
    setPitch,
    volume: volumeState,
    setVolume,
    progress,
    isSupported,
    isReady,
    error,
    currentWordIndex,
    isLoading: isSupported && !isReady,
    availableVoices,
    selectedVoiceIndex,
    setSelectedVoice: handleSetSelectedVoice,
    playbackRate: rateState,
    setPlaybackRate,
    voices,
    selectedVoiceId,
    setSelectedVoiceId: handleSetSelectedVoiceId,
    selectedLanguage,
    setSelectedLanguage: handleSetSelectedLanguage,
    languageOptions,
  };
};

export default useSpeechSynthesis;
