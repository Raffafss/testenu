"use client";

import { useState, useCallback } from "react";
import { WhatsAppNotificationScreen } from "../system/whatsapp-notification-screen";
import { WhatsAppChat } from "../chat/whatsapp-chat";

// CAMADA 2: Estados do SISTEMA - Notificacao WhatsApp (transicao)
// CAMADA 3: Estados da OPERACAO - Chat WhatsApp (funil real)
type SystemState = "notification" | "chat" | "success";

export interface FunnelEvent {
  layer: "SYSTEM" | "NOTIFICATION" | "CHAT";
  action: string;
  value?: string | number | Record<string, unknown>;
  timestamp: string;
}

export function CreditFunnel() {
  const [systemState, setSystemState] = useState<SystemState>("chat");
  const [events, setEvents] = useState<FunnelEvent[]>([]);

  const logEvent = useCallback(
    (
      layer: "SYSTEM" | "NOTIFICATION" | "CHAT",
      action: string,
      value?: string | number | Record<string, unknown>
    ) => {
      const event: FunnelEvent = {
        layer,
        action,
        value,
        timestamp: new Date().toISOString(),
      };
      setEvents((prev) => [...prev, event]);
      console.log(`[v0] ${layer} Event:`, event);
    },
    []
  );

  // CAMADA 2: Handler da Notificacao
  const handleNotificationClick = useCallback(() => {
    logEvent("NOTIFICATION", "WHATSAPP_NOTIFICATION_OPENED");
    // Abre o chat WhatsApp onde o funil acontece
    setSystemState("chat");
  }, [logEvent]);

  // CAMADA 3: Handler do Chat (Funil)
  const handleFunnelComplete = useCallback(
    (data: Record<string, unknown>) => {
      logEvent("CHAT", "FUNNEL_COMPLETED", data);
      console.log("[v0] Funnel completed with data:", data);

      // Transicao para tela de sucesso
      setTimeout(() => {
        setSystemState("success");
      }, 1500);
    },
    [logEvent]
  );

  // CAMADA 2: Tela de Notificacao (Lockscreen)
  if (systemState === "notification") {
    return (
      <WhatsAppNotificationScreen onNotificationClick={handleNotificationClick} />
    );
  }

  // CAMADA 4: Tela de Sucesso Final
  if (systemState === "success") {
    return (
      <div className="fixed inset-0 z-50 bg-[#0b141a] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 mb-6 bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(37,211,102,0.3)]">
          <svg
            className="w-10 h-10 text-[#0b141a]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Solicitação Recebida!</h1>
        <p className="text-zinc-400 text-sm max-w-xs leading-relaxed">
          Os seus dados já estão com nossos especialistas.
          <br /><br />
          Em breve entraremos em contato via WhatsApp para finalizar sua análise de crédito.
        </p>
      </div>
    );
  }

  // CAMADA 3: Chat WhatsApp (funil real)
  return <WhatsAppChat onFunnelComplete={handleFunnelComplete} />;
}
