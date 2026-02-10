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
      options: ["Menos de 400", "400 a 699", "700 a 850", "Acima de 850"],
      delay: 1000,
      nextStep: {
        "Menos de 400": 14,
        "400 a 699": 14,
        "700 a 850": 13,
        "Acima de 850": 13,
      },
    },
    {
      step: 8,
      message: "Sem problemas! Eu te ajudo. 💡\n\nPara consultar o seu score agora mesmo, clique no link oficial abaixo:\n\n🔗 **[CONSULTAR SCORE NO SERASA](https://www.serasa.com.br/score/)**\n\nBasta entrar com seu CPF e fazer o cadastro gratuito. O seu score aparecerá logo na tela inicial.\n\nFico no aguardo do seu retorno aqui! 👇",
      type: "options",
      options: ["Já consultei meu score!"],
      delay: 2000,
      nextStep: { "Já consultei meu score!": 17 },
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
    },
    {
      step: 14,
      message: "Infelizmente não foi apresentado nenhuma oferta de empréstimo para essa pontuação. Um de nossos consultores consegue te guiar para alcançar *50 pontos ainda essa semana* e validar o empréstimo para você. É do seu interesse?",
      type: "options",
      options: ["SIM"],
      delay: 1500,
      nextStep: { "SIM": 15 },
    },
    {
      step: 15,
      message: "Nosso consultor cobra o valor de *R$67,00* para fazer uma análise completa do seu nome e te passar todas as ações necessárias para que você consiga subir os pontos aprovando o empréstimo ainda essa semana. É o que você deseja?",
      type: "options",
      options: ["SIM"],
      delay: 1500,
      nextStep: { "SIM": 18 },
    },
    {
      step: 16,
      message: "Ótimo, muito bom ver que você realmente quer um empréstimo, para começar hoje a subir seu score, efetue o pagamento abaixo \n\nLembrando que nosso consultor não consegue atender a todos que comprarem, então se você ainda visualiza essa oferta, saiba que está disponível, mas assim que encerrar as *12 vagas restantes* será fechado essa consultoria.",
      type: "text",
      delay: 1500,
    },
    {
      step: 17,
      message: "Perfeito! Agora me diga, qual é o valor exato do seu score que apareceu lá?",
      type: "text",
      delay: 1200,
    },
    {
      step: 18,
      message: "Perfeito! Para que nosso analista envie o material de apoio e o link de acesso, qual é o seu melhor e-mail?",
      type: "options",
      options: ["NÃO TENHO EMAIL"],
      delay: 1200,
      nextStep: { "NÃO TENHO EMAIL": 13 },
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
  const [waitingForScore, setWaitingForScore] = useState(false);
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

        // Check if step 17 - wait for Score input
        if (step === 17) {
          setWaitingForScore(true);
        }

        // Check if step 18 - wait for Email in low score flow
        if (step === 18) {
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

  const firePixelEvent = useCallback((event: string, params?: any) => {
    if (typeof window !== "undefined" && (window as any).fbq) {
      console.log(`[v0] [Pixel] Firing ${event}`, params);
      (window as any).fbq('track', event, params);
    } else {
      console.warn(`[v0] [Pixel] fbq not found while firing ${event}`);
      // If not yet available, we can try to fire PageView as a fallback or queue it
    }
  }, []);

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

    // Reset waiting states when selecting an option to avoid overlapping input handlers
    setWaitingForName(false);
    setWaitingForEmail(false);
    setWaitingForPhone(false);
    setWaitingForScore(false);
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

    // Send incremental webhook
    sendToWebhook({
      event: "name_captured",
      name
    });

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

    // Send incremental webhook
    sendToWebhook({
      event: "phone_captured",
      ...funnelDataRef.current
    });

    // Advance to next step (Email or Success message or Checkout)
    setTimeout(() => {
      // If we are in the R$ 67 flow, we just captured phone and should go to Step 16 (Payment)
      // We check if score was low (manual_score < 700)
      const isLowScore = (funnelDataRef.current.manual_score as number) < 700;

      if (isLowScore) {
        processStep(16);
      } else {
        processStep(9);
      }
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

    // Update funnel data
    funnelDataRef.current = { ...funnelDataRef.current, email };
    setFunnelData(funnelDataRef.current);

    // Send incremental webhook
    sendToWebhook({
      event: "email_captured",
      ...funnelDataRef.current
    });

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

      // If we were at step 18 (low score flow), we just captured email and should go to Step 13 (Phone)
      if (currentStep === 18) {
        processStep(13);
        return;
      }

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

  const handleScoreSubmit = () => {
    if (!inputValue.trim()) return;

    const scoreValue = parseInt(inputValue.replace(/\D/g, ""));
    if (isNaN(scoreValue)) {
      addBotMessage("Por favor, digite apenas números para o seu score.", "text");
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "text",
      content: scoreValue.toString(),
      sender: "user",
      timestamp: new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setWaitingForScore(false);

    // Update funnel data
    funnelDataRef.current = { ...funnelDataRef.current, manual_score: scoreValue };
    setFunnelData(funnelDataRef.current);

    // Send incremental webhook
    sendToWebhook({
      event: "score_captured",
      ...funnelDataRef.current
    });

    // Logic to redirect based on score value
    setTimeout(() => {
      if (scoreValue < 700) {
        // Offer consultancy (Step 14)
        processStep(14);
      } else {
        // High score, proceed to WhatsApp (Step 13)
        processStep(13);
      }
    }, 1200);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (waitingForEmail) {
      setInputValue(e.target.value);
    } else if (waitingForPhone) {
      setInputValue(formatPhone(e.target.value));
    } else if (waitingForScore) {
      setInputValue(e.target.value.replace(/\D/g, "").slice(0, 4));
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
            src="/audio/imagem.jpg"
            alt="Fernanda Moretto"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 ml-2">
          <h1 className="text-white font-medium text-base">Fernanda Moretto</h1>
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
                      {message.content.split(/(\*\*\[.+?\]\(.+?\)\*\*|\[.+?\]\(.+?\)|https?:\/\/[^\s]+|\*[^*]+\*)/g).map((part, i) => {
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
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (waitingForName) handleNameSubmit();
                if (waitingForEmail) handleEmailSubmit();
                if (waitingForPhone) handlePhoneSubmit();
                if (waitingForScore) handleScoreSubmit();
              }
            }}
            placeholder={
              waitingForName
                ? "Como devo te chamar?"
                : waitingForEmail
                  ? "Digite seu E-mail..."
                  : waitingForPhone
                    ? "Digite seu WhatsApp..."
                    : waitingForScore
                      ? "Digite seu score (números)..."
                      : "Selecione uma opcao acima"
            }
            disabled={!waitingForEmail && !waitingForPhone && !waitingForName && !waitingForScore}
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

        {(waitingForEmail || waitingForPhone || waitingForName || waitingForScore) && inputValue ? (
          <button
            onClick={
              waitingForName
                ? handleNameSubmit
                : waitingForEmail
                  ? handleEmailSubmit
                  : waitingForPhone
                    ? handlePhoneSubmit
                    : handleScoreSubmit
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
