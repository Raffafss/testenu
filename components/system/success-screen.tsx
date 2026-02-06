import React from "react";

export const SuccessScreen: React.FC = () => {
    return (
        <div className="fixed inset-0 z-50 bg-[#0b141a] flex items-center justify-center p-6 text-center">
            <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="flex justify-center">
                    <div className="w-20 h-20 bg-[#25D366]/20 rounded-full flex items-center justify-center">
                        <div className="w-16 h-16 bg-[#25D366] rounded-full flex items-center justify-center text-white">
                            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-2xl font-bold text-white uppercase tracking-wider">
                        Solicitação Enviada!
                    </h1>
                    <p className="text-zinc-400 text-lg leading-relaxed">
                        Recebemos seus dados e estamos finalizando sua análise.
                        <br />
                        <span className="text-white font-medium">Você será atendido agora mesmo por um de nossos especialistas.</span>
                    </p>
                </div>

                <button
                    onClick={() => window.location.href = "https://wa.me/5548991553467?text=Quero%20finalizar%20minha%20aprova%C3%A7%C3%A3o"}
                    className="w-full bg-[#25D366] hover:bg-[#20bd5c] text-white font-bold py-4 px-8 rounded-xl text-xl transition-all hover:scale-105 active:scale-95 shadow-xl shadow-[#25D366]/20 flex items-center justify-center gap-3"
                >
                    Falar com Consultor
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.29-4.143c1.552.92 3.31 1.406 5.103 1.406h.005c5.454 0 9.893-4.438 9.895-9.895.001-2.646-1.027-5.131-2.895-6.999-1.868-1.868-4.354-2.895-7-2.895-5.455 0-9.893 4.438-9.896 9.895-.001 1.816.499 3.591 1.447 5.147l-1.018 3.715 3.847-1.01zm11.366-4.512c-.302-.151-1.785-.881-2.056-.98-.271-.1-.468-.151-.665.151s-.762.98-.935 1.171-.345.213-.647.062c-.302-.151-1.272-.469-2.422-1.496-.893-.797-1.495-1.781-1.67-2.083-.176-.302-.019-.465.132-.615.136-.135.302-.352.453-.528.151-.176.201-.302.302-.503s.05-.377-.025-.528c-.076-.151-.665-1.606-.911-2.198-.239-.579-.482-.5-.665-.51l-.566-.009c-.197 0-.517.074-.786.374s-1.034 1.018-1.034 2.484 1.07 2.881 1.22 3.081c.151.201 2.106 3.216 5.1 4.512.713.309 1.269.493 1.703.631.716.227 1.368.195 1.883.117.574-.087 1.785-.73 2.039-1.436.254-.706.254-1.31.178-1.437s-.272-.201-.573-.352z" />
                    </svg>
                </button>

                <p className="text-zinc-500 text-sm">
                    © 2026 UnixBank - Todos os direitos reservados
                </p>
            </div>
        </div>
    );
};
