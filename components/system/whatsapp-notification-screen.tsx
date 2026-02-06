"use client";

import { useState, useEffect } from "react";
import { Wifi, Signal, BatteryMedium } from "lucide-react";

interface WhatsAppNotificationScreenProps {
  onNotificationClick: () => void;
}

export function WhatsAppNotificationScreen({
  onNotificationClick,
}: WhatsAppNotificationScreenProps) {
  const [currentTime, setCurrentTime] = useState("");
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // Set initial time
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Show notification with delay and play sound
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotification(true);
      // Play WhatsApp notification sound
      const audio = new Audio("/audio/whatsapp-notification.mp3");
      audio.volume = 0.5;
      audio.play().catch(() => { });
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-[#0a1014] flex flex-col overflow-hidden">
      {/* Phone Wallpaper Background */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Status Bar */}
      <div className="relative flex items-center justify-between px-6 pt-3 pb-2">
        <span className="text-white text-sm font-medium">{currentTime}</span>
        <div className="flex items-center gap-1.5">
          <Signal className="w-4 h-4 text-white" />
          <Wifi className="w-4 h-4 text-white" />
          <BatteryMedium className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Lock Screen Clock */}
      <div className="relative flex-1 flex flex-col items-center justify-center">
        <p className="text-white/60 text-sm mb-2">
          {new Date().toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
        <h1 className="text-white text-7xl font-extralight tracking-tight">
          {currentTime}
        </h1>
      </div>

      {/* WhatsApp Notification Card */}
      {showNotification && (
        <div className="relative px-4 pb-8">
          <button
            onClick={onNotificationClick}
            className="w-full bg-[#1f2c34]/95 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-white/10 active:scale-[0.98] transition-transform animate-slide-up text-left"
          >
            {/* Notification Header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#25D366] flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium text-sm">
                    WhatsApp
                  </span>
                  <span className="text-white/50 text-xs">agora</span>
                </div>
              </div>
            </div>

            {/* Message Content */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-zinc-700">
                <img
                  src="/placeholder.svg"
                  alt="Titia Dark"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm">Titia Dark</p>
                <p className="text-white/70 text-sm truncate">
                  Oi, vi que voce atendeu a analise. Podemos continuar por aqui?
                </p>
              </div>
            </div>

            {/* Slide hint */}
            <div className="mt-4 flex justify-center">
              <div className="w-12 h-1 bg-white/20 rounded-full" />
            </div>
          </button>
        </div>
      )}

      {/* Home indicator */}
      <div className="relative pb-2 flex justify-center">
        <div className="w-32 h-1 bg-white/30 rounded-full" />
      </div>
    </div>
  );
}
