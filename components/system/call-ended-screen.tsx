"use client";

import { PhoneOff } from "lucide-react";

export function CallEndedScreen() {
  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-6">
          <PhoneOff className="w-10 h-10 text-red-500" />
        </div>
        <p className="text-xl text-zinc-400">Chamada encerrada</p>
      </div>
    </div>
  );
}
