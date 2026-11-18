"use client";

import { ArrowUpRight, MessageCircle, X } from "lucide-react";
import { useEffect } from "react";

interface LaunchYourProjectModalProps {
  open: boolean;
  onClose: () => void;
}

const WHATSAPP_URL =
  "https://wa.me/525568661831?text=Hola%20Ra%C3%BAl%2C%20acabo%20de%20probar%20el%20demo%20interactivo%20de%20viw%20y%20me%20interesa%20ver%20c%C3%B3mo%20implementarlo%20en%20un%20desarrollo%20inmobiliario.";

export default function LaunchYourProjectModal({
  open,
  onClose,
}: LaunchYourProjectModalProps) {
  useEffect(() => {
    if (!open) return;
    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90]">
      <button
        type="button"
        aria-label="Cerrar modal"
        className="absolute inset-0 h-full w-full bg-black/60 backdrop-blur-[6px] animate-fade-in"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="launch-project-title"
        className="viw-glass animate-modal-in absolute left-1/2 top-1/2 w-[calc(100%-2rem)] max-w-[460px] -translate-x-1/2 -translate-y-1/2 rounded-[26px] bg-[#242321]/80 p-6 sm:p-7"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="viw-eyebrow">viw by Ultea</p>
            <h2
              id="launch-project-title"
              className="mt-2 font-display text-[22px] font-medium leading-[1.05] tracking-[-0.04em] text-viw-text"
            >
              Lleva tu preventa al siguiente nivel.
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-viw-text/40 hover:bg-viw-text/10 hover:text-viw-text"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-viw-text/45">
          Convierte tu desarrollo inmobiliario en una experiencia interactiva
          con inventario en tiempo real, recorridos 360°/VR y fichas digitales
          que generan leads estructurados.
        </p>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-viw-accent text-[11px] font-bold uppercase tracking-[0.12em] text-[#242321] transition-all hover:bg-[#79F1F5]"
        >
          <MessageCircle className="h-4 w-4" />
          Quiero viw en mi desarrollo →
          <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
        <p className="mt-3 text-center text-[8px] uppercase tracking-[0.14em] text-viw-text/25">
          Respuesta en menos de 24 h · Ultea
        </p>
      </section>
    </div>
  );
}