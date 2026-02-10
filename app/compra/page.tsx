"use client";

import Script from "next/script";
import Link from "next/link";
import { CheckCircle, ArrowRight, Download, BookOpen, ShieldCheck } from "lucide-react";

export default function CompraPage() {
    return (
        <main className="min-h-screen bg-[#0b141a] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Meta Pixel Purchase Tracking */}
            <Script id="fb-purchase-track" strategy="afterInteractive">
                {`
          if (typeof fbq !== 'undefined') {
            fbq('track', 'Purchase');
          }
        `}
            </Script>
            <noscript>
                <img
                    height="1"
                    width="1"
                    style={{ display: "none" }}
                    src="https://www.facebook.com/tr?id=1450619856584265&ev=PageView&noscript=1"
                />
            </noscript>

            {/* Decorative background gradients */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#25D366]/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#25D366]/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-md w-full bg-[#1f2c34] rounded-3xl p-8 border border-white/5 shadow-2xl relative z-10 text-center animate-in fade-in zoom-in duration-700">
                <div className="w-20 h-20 bg-[#25D366]/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(37,211,102,0.15)] border border-[#25D366]/20">
                    <CheckCircle className="w-10 h-10 text-[#25D366]" />
                </div>

                <h1 className="text-3xl font-extrabold mb-2 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent italic tracking-tight">PAGAMENTO APROVADO!</h1>
                <p className="text-zinc-400 mb-8 text-sm leading-relaxed">
                    Sua consultoria e o bônus exclusivo já estão liberados. Prepare-se para ver seu score decolar!
                </p>

                <div className="space-y-4 mb-8 text-left">
                    <div className="flex items-center gap-3 p-4 bg-[#2a3942] rounded-2xl border border-white/5 group hover:bg-[#32424b] transition-colors">
                        <div className="w-10 h-10 bg-[#25D366]/20 rounded-xl flex items-center justify-center text-[#25D366]">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-semibold text-sm">Guia Estratégico</p>
                            <p className="text-[11px] text-zinc-500 italic">Como subir 150 pontos em 1 semana</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-[#2a3942] rounded-2xl border border-white/5 group hover:bg-[#32424b] transition-colors">
                        <div className="w-10 h-10 bg-[#25D366]/20 rounded-xl flex items-center justify-center text-[#25D366]">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-semibold text-sm">Acesso Vitalício</p>
                            <p className="text-[11px] text-zinc-500 italic">Conteúdo garantido e atualizado</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <Link
                        href="/leitura"
                        className="w-full py-4 bg-[#25D366] hover:bg-[#20bd5b] text-[#0b141a] font-bold rounded-2xl shadow-[0_10px_30px_rgba(37,211,102,0.3)] transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group"
                    >
                        <span>ACESSAR MEU CONTEÚDO AGORA</span>
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </Link>

                    <a
                        href="/Guia do Aumento de Score.pdf"
                        download
                        className="w-full py-4 bg-transparent border border-white/10 hover:bg-white/5 text-white/70 font-medium rounded-2xl transition-all flex items-center justify-center gap-2 text-sm"
                    >
                        <Download className="w-4 h-4" />
                        <span>Baixar PDF (Cópia de Segurança)</span>
                    </a>
                </div>
            </div>

            <p className="mt-8 text-white/30 text-xs flex items-center gap-2 uppercase tracking-[0.2em] font-medium">
                <ShieldCheck className="w-3 h-3 text-[#25D366]" />
                Ambiente 100% Seguro & Criptografado
            </p>
        </main>
    );
}
