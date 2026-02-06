"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Phone, PhoneOff } from "lucide-react";

interface IncomingCallScreenProps {
  onAnswer: () => void;
  onDecline: () => void;
}

export function IncomingCallScreen({
  onAnswer,
  onDecline,
}: IncomingCallScreenProps) {
  const [isVibrating, setIsVibrating] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const vibrationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Vibration pattern simulation
  useEffect(() => {
    // Tenta vibrar imediatamente ao montar (se o navegador permitir)
    if (isVibrating && typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate([1000, 500, 1000, 500]);
      } catch (e) {
        console.log("Vibration blocked by browser policy");
      }

      // Loop de vibracao continua
      vibrationIntervalRef.current = setInterval(() => {
        try {
          // Padrao de chamada telefonica: Longo (1s), Pausa(0.5s), Longo(1s)
          navigator.vibrate([1000, 500, 1000, 500]);
        } catch (e) {
          // Ignorar erros de permissao
        }
      }, 3000); // 3 segundos para cobrir o padrao completo + pausa
    }

    return () => {
      if (vibrationIntervalRef.current) {
        clearInterval(vibrationIntervalRef.current);
      }
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(0);
      }
    };
  }, [isVibrating]);

  // Play ringtone
  useEffect(() => {
    // Create audio context for ringtone simulation
    const playRingtone = () => {
      try {
        const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
        if (AudioContext) {
          const ctx = new AudioContext();
          const oscillator = ctx.createOscillator();
          const gainNode = ctx.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(ctx.destination);

          oscillator.frequency.value = 440;
          oscillator.type = "sine";
          gainNode.gain.value = 0.1;

          oscillator.start();

          // Ring pattern
          let ringCount = 0;
          const ringInterval = setInterval(() => {
            if (ringCount % 2 === 0) {
              gainNode.gain.value = 0.1;
            } else {
              gainNode.gain.value = 0;
            }
            ringCount++;
          }, 500);

          audioRef.current = {
            pause: () => {
              oscillator.stop();
              clearInterval(ringInterval);
              if (ctx.state !== "closed") {
                ctx.close().catch(() => { });
              }
            },
          } as unknown as HTMLAudioElement;
        }
      } catch {
        // Audio not supported, continue without sound
      }
    };

    // Small delay before starting ringtone
    const timeout = setTimeout(playRingtone, 300);

    return () => {
      clearTimeout(timeout);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const handleAnswer = useCallback(() => {
    setIsVibrating(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if ("vibrate" in navigator) {
      navigator.vibrate(0);
    }
    onAnswer();
  }, [onAnswer]);

  const handleDecline = useCallback(() => {
    setIsVibrating(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if ("vibrate" in navigator) {
      navigator.vibrate(0);
    }
    onDecline();
  }, [onDecline]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-between py-16 px-6 overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/50 via-black to-black" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center flex-1 justify-center">
        {/* Caller avatar with ring animations */}
        <div className="relative mb-8">
          {/* Outer ring waves */}
          <div className="absolute inset-0 w-32 h-32 rounded-full bg-green-500/20 animate-ring-wave" />
          <div className="absolute inset-0 w-32 h-32 rounded-full bg-green-500/20 animate-ring-wave-delay" />

          {/* Main avatar circle */}
          <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center animate-ring-pulse border-2 border-zinc-600">
            <Phone className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Caller info */}
        <div className="text-center animate-slide-up">
          <h1 className="text-3xl font-light text-white mb-2">
            Central de Analise
          </h1>
          <p className="text-lg text-zinc-400">
            Ligacao segura
          </p>
        </div>
      </div>

      {/* Bottom buttons - iOS style */}
      <div className="relative z-10 w-full max-w-xs animate-fade-in">
        <div className="flex items-center justify-between px-4">
          {/* Decline button */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={handleDecline}
              className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center active:scale-95 transition-transform shadow-lg shadow-red-500/30"
              aria-label="Recusar chamada"
            >
              <PhoneOff className="w-7 h-7 text-white" />
            </button>
            <span className="text-sm text-zinc-400">Recusar</span>
          </div>

          {/* Answer button */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={handleAnswer}
              className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center active:scale-95 transition-transform shadow-lg shadow-green-500/30 animate-button-glow"
              aria-label="Atender chamada"
            >
              <Phone className="w-7 h-7 text-white" />
            </button>
            <span className="text-sm text-zinc-400">Atender</span>
          </div>
        </div>
      </div>
    </div>
  );
}
