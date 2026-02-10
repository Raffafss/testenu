"use client";

import Link from "next/link";
import { ArrowLeft, Download, Maximize, Share2 } from "lucide-react";

export default function LeituraPage() {
    return (
        <main className="min-h-screen bg-[#0b141a] text-white flex flex-col">
            {/* Visualizer Header */}
            <header className="bg-[#1f2c34] px-4 py-3 flex items-center justify-between border-b border-white/5 shadow-lg">
                <div className="flex items-center gap-3">
                    <Link href="/compra" className="p-2 hover:bg-white/5 rounded-full text-white/80 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-sm font-semibold text-white/90">Visualizador de Guia</h1>
                        <p className="text-[10px] text-[#25D366] font-medium uppercase tracking-wider">Como subir 150 pontos em 1 semana</p>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <a
                        href="/Guia do Aumento de Score.pdf"
                        download
                        className="p-2 hover:bg-white/5 rounded-full text-white/80 transition-colors"
                        title="Download PDF"
                    >
                        <Download className="w-5 h-5" />
                    </a>
                    <button className="p-2 hover:bg-white/5 rounded-full text-white/80 transition-colors" title="Compartilhar">
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* PDF Container */}
            <div className="flex-1 overflow-hidden relative p-4 lg:p-10 flex items-center justify-center bg-[#0b141a]">
                {/* Background blobs for aesthetics */}
                <div className="absolute top-[20%] left-[30%] w-[30%] h-[30%] bg-[#25D366]/5 rounded-full blur-[100px] pointer-events-none" />

                <div className="w-full h-full max-w-5xl bg-[#1f2c34] rounded-2xl overflow-hidden shadow-2xl border border-white/5 relative z-10 flex flex-col">
                    <iframe
                        src="/Guia do Aumento de Score.pdf#toolbar=0"
                        className="w-full h-full border-none"
                        title="Guia do Aumento de Score"
                    />
                </div>
            </div>

            {/* Mobile Footer CTA */}
            <div className="p-4 bg-[#1f2c34] lg:hidden flex justify-center border-t border-white/5">
                <a
                    href="/Guia do Aumento de Score.pdf"
                    download
                    className="w-full py-4 bg-[#25D366] text-[#0b141a] text-center font-bold rounded-xl flex items-center justify-center gap-2"
                >
                    <Download className="w-5 h-5" />
                    <span>BAIXAR GUIA COMPLETO</span>
                </a>
            </div>
        </main>
    );
}
