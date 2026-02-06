"use client";

import { useState, useEffect, useRef } from "react";
import { Phone, Volume2 } from "lucide-react";

interface ActiveCallScreenProps {
  onCallComplete: () => void;
}

export function ActiveCallScreen({ onCallComplete }: ActiveCallScreenProps) {
  const [callDuration, setCallDuration] = useState(0);
  const [audioEnded, setAudioEnded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Play audio immediately when component mounts
  useEffect(() => {
    const audio = new Audio("/audio/call-audio.mp3");
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;

    // Event when audio finishes
    audio.onended = () => {
      setAudioEnded(true);
      setTimeout(() => {
        onCallComplete();
      }, 500);
    };

    // Handle potential loading errors silently for the user
    audio.onerror = () => {
      // We don't force a redirect here anymore to avoid cutting long audios
      // if a non-fatal error event occurs.
    };

    // Start playback
    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay prevented by browser policy - not an error
      });
    }

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [onCallComplete]);

  // Call duration timer
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Top bar with call info */}
      <div className="flex-shrink-0 pt-12 pb-6 px-6 text-center animate-fade-in">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
          <span className="text-green-500 text-sm font-medium">Em chamada</span>
        </div>
        <h1 className="text-xl font-light text-white mb-1">Central de Analise</h1>
        <p className="text-zinc-500 text-sm">{formatDuration(callDuration)}</p>
      </div>

      {/* Call avatar */}
      <div className="flex-shrink-0 flex justify-center py-8">
        <div className="relative">
          {/* Pulsing rings */}
          <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ring-wave" />
          <div className="absolute inset-0 rounded-full bg-green-500/15 animate-ring-wave-delay" />
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center border border-zinc-600 relative z-10">
            <Phone className="w-12 h-12 text-white" />
          </div>
        </div>
      </div>

      {/* Audio visualization */}
      <div className="flex-1 px-6 py-4 flex items-center justify-center">
        <div className="max-w-sm mx-auto w-full">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Volume2 className="w-5 h-5 text-green-500" />
            <span className="text-sm text-zinc-400">Audio em reproducao...</span>
          </div>

          {/* Audio waveform visualization */}
          <div className="flex items-center justify-center gap-1 h-16">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="w-1 bg-green-500 rounded-full transition-all duration-150"
                style={{
                  height: audioEnded ? "4px" : `${Math.random() * 100}%`,
                  animationDelay: `${i * 50}ms`,
                  animation: audioEnded ? "none" : "pulse 0.5s ease-in-out infinite alternate",
                }}
              />
            ))}
          </div>

          {audioEnded && (
            <p className="text-center text-zinc-400 mt-6 animate-fade-in">
              Chamada encerrada. Redirecionando...
            </p>
          )}
        </div>
      </div>

      {/* End call button */}
      <div className="flex-shrink-0 pb-12 px-6">
        <div className="flex justify-center">
          <button
            onClick={onCallComplete}
            className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/30 active:scale-95 transition-transform"
          >
            <Phone className="w-7 h-7 text-white rotate-[135deg]" />
          </button>
        </div>
      </div>
    </div>
  );
}
