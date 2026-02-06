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
  type: "text" | "audio" | "options";
  content: string;
  sender: "bot" | "user";
  timestamp: string;
  options?: string[];
  audioUrl?: string;
}

interface WhatsAppChatProps {
  onFunnelComplete: (data: Record<string, unknown>) => void;
}

// Funnel flow configuration - controlled responses
const FUNNEL_FLOW: {
  step: number;
  message: string;
  type: "text" | "audio" | "options";
  options?: string[];
  audioUrl?: string;
  delay: number;
  nextStep?: Record<string, number>;
}[] = [
    {
      step: 0,
      message: "Olá! Seja muito bem-vindo. Para começarmos, como posso te chamar?",
      type: "text",
      delay: 1000,
    },
    {
      step: 1,
      message: "Olá {name}! fico muito feliz em te ver aqui, provavelmente você já sabe qual é sua pontuação do score, ou ainda não sabe?",
      type: "options",
      options: ["Sei qual minha pontuação", "Eu não sei qual minha pontuação"],
      delay: 1200,
      nextStep: { "Sei qual minha pontuação": 7, "Eu não sei qual minha pontuação": 8 },
    },
    {
      step: 2,
      message:
        "Perfeito! Antes de tudo, preciso confirmar alguns pontos importantes sobre seu perfil.",
      type: "text",
      delay: 1500,
    },
    {
      step: 3,
      message: "Voce esta negativado hoje?",
      type: "options",
      options: ["Nao", "Sim"],
      delay: 1200,
      nextStep: { Nao: 4, Sim: 10 },
    },
    {
      step: 4,
      message: "Otimo! Voce possui conta bancaria ativa?",
      type: "options",
      options: ["Sim, possuo", "Nao tenho"],
      delay: 1200,
      nextStep: { "Sim, possuo": 5, "Nao tenho": 10 },
    },
    {
      step: 5,
      message: "Perfeito. Voce tem comprovante de renda ou recebe algum beneficio?",
      type: "options",
      options: ["Tenho comprovante", "Recebo beneficio", "Nenhum dos dois"],
      delay: 1500,
      nextStep: {
        "Tenho comprovante": 6,
        "Recebo beneficio": 6,
        "Nenhum dos dois": 10,
      },
    },
    {
      step: 6,
      message:
        "Excelente! Agora preciso verificar seu score. Voce sabe qual e seu score atual?",
      type: "options",
      options: ["Sei meu score", "Nao sei", "Preciso consultar"],
      delay: 1500,
      nextStep: { "Sei meu score": 7, "Nao sei": 8, "Preciso consultar": 8 },
    },
    {
      step: 7,
      message: "Qual e o valor do seu score?",
      type: "options",
      options: ["Menos de 400", "400 a 600", "600 a 800", "Acima de 800"],
      delay: 1000,
      nextStep: {
        "Menos de 400": 10,
        "400 a 600": 13,
        "600 a 800": 13,
        "Acima de 800": 13,
      },
    },
    {
      step: 8,
      message:
        "Sem problemas! Para que eu consiga te ajudar agora mesmo, abra o aplicativo do seu banco ou do Serasa, tire um print do seu score e envie aqui para mim.\n\nFico no aguardo do seu print abaixo! 👇",
      type: "text",
      delay: 1500,
    },
    {
      step: 9,
      message:
        "Parabens! Voce tem um perfil pre-aprovado para nossa analise. Para finalizar, preciso apenas do seu E-mail para confirmar os dados.",
      type: "text",
      delay: 2000,
    },
    {
      step: 10,
      message:
        "Infelizmente, seu perfil nao atende aos requisitos minimos no momento. Mas fique tranquilo, voce pode tentar novamente em 30 dias!",
      type: "text",
      delay: 1500,
    },
    {
      step: 11,
      message:
        "Aqui estao os links para consulta gratuita:\n\n- Serasa: serasa.com.br\n- Registrato (Banco Central): registrato.bcb.gov.br\n\nQuando consultar, me avise!",
      type: "options",
      options: ["Ja consultei!"],
      delay: 1000,
      nextStep: { "Ja consultei!": 7 },
    },
    {
      step: 12,
      message: "Recebi seu print! Minha IA já está analisando e em instantes um consultor entrará em contato com você para finalizar sua aprovação. Fique atento!",
      type: "text",
      delay: 1000,
    },
    {
      step: 13,
      message: "Para darmos continuidade, qual o melhor número de WhatsApp para falarmos com você?",
      type: "text",
      delay: 1200,
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
      type: "text" | "audio" | "options" = "text",
      options?: string[],
      audioUrl?: string
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
      };
      setMessages((prev) => [...prev, newMessage]);
    },
    []
  );

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
          flowItem.audioUrl
        );

        // Check if step 0 (initial name)
        if (step === 0) {
          setWaitingForName(true);
        }

        // Check if step 9 (success) - wait for Email
        if (step === 9) {
          setWaitingForEmail(true);
        }

        // Check if step 13 - wait for Phone
        if (step === 13) {
          setWaitingForPhone(true);
        }

        // Auto advance for text-only messages
        if (flowItem.type === "text" && step === 2) {
          setTimeout(() => processStep(3), 1500);
        }
      }, flowItem.delay);
    },
    [addBotMessage, setWaitingForEmail, setWaitingForPhone]
  );

  // Start the conversation
  useEffect(() => {
    if (!initiatedRef.current) {
      processStep(0);
      initiatedRef.current = true;
    }
  }, [processStep]);

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
    } else if (currentStep === 1) {
      processStep(2);
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

    // Advance to Step 1 (Score question)
    setTimeout(() => {
      processStep(1);
    }, 1000);
  };

  const handlePhoneSubmit = () => {
    if (!inputValue.trim()) return;

    const phone = inputValue.replace(/\D/g, "");
    if (phone.length < 10) {
      addBotMessage("Por favor, digite um numero valido com DDD.", "text");
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "text",
      content: formatPhone(phone),
      sender: "user",
      timestamp: new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setWaitingForPhone(false);

    // Update funnel data - saving to state and Ref
    const newData = { phone };
    funnelDataRef.current = { ...funnelDataRef.current, ...newData };
    setFunnelData(funnelDataRef.current);

    // Advance to next step (Email or Success message)
    setTimeout(() => {
      // If score was high, go to Email (Step 9)
      // For simplicity, let's go to Step 9
      processStep(9);
    }, 1200);
  };

  const handleEmailSubmit = () => {
    if (!inputValue.trim()) return;

    const email = inputValue.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      addBotMessage("Por favor, digite um e-mail valido (ex: nome@gmail.com).", "text");
      return;
    }

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

    // Final message
    setIsTyping(true);
    setTimeout(async () => {
      setIsTyping(false);
      addBotMessage(
        "Perfeito! Seus dados foram recebidos com sucesso. Nossa equipe vai entrar em contato em breve para finalizar sua analise. Obrigado!",
        "text"
      );

      // Complete funnel - CRITICAL: Send aggregation to webhook
      const finalFields = {
        email,
        completedAt: new Date().toISOString(),
      };
      funnelDataRef.current = { ...funnelDataRef.current, ...finalFields };
      setFunnelData(funnelDataRef.current);

      // Log para verificacao no console
      console.log("[v0] CRITICAL: Dispatching final lead data...");

      try {
        // Send critical conversion webhook with TOTAL aggregated data
        // We use await to ensure it's SENT before the UI unmounts
        await sendToWebhook({
          event: "lead_conversion",
          event_name: "funnel_completed", // Redundancia para filtros do n8n
          is_final_conversion: true,
          ...funnelDataRef.current,
        });

        console.log("[v0] FINAL CONVERSION DATA SENT SUCCESSFULLY");
      } catch (error) {
        console.error("[v0] CRITICAL ERROR IN FINAL WEBHOOK:", error);
      }

      // Notify parent to transition to success screen
      onFunnelComplete(funnelDataRef.current);
    }, 1500);
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
    if (waitingForEmail) {
      setInputValue(e.target.value);
    } else if (waitingForPhone) {
      setInputValue(formatPhone(e.target.value));
    } else {
      setInputValue(e.target.value);
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

    // Advance to phone step after image
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
            src="/placeholder.svg"
            alt="Titia Dark"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 ml-2">
          <h1 className="text-white font-medium text-base">Titia Dark</h1>
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
                    <p className="text-sm whitespace-pre-line">
                      {message.content}
                    </p>
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
                  ? "Digite seu E-mail..."
                  : waitingForPhone
                    ? "Digite seu WhatsApp..."
                    : "Selecione uma opcao acima"
            }
            disabled={!waitingForEmail && !waitingForPhone && !waitingForName}
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

        {(waitingForEmail || waitingForPhone || waitingForName) && inputValue ? (
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
