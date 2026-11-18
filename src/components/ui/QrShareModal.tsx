"use client";

import { Check, Copy, ExternalLink, Link2, Smartphone, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { getUnitShareUrl } from "@/lib/utils";
import type { Unit } from "@/types/viw.types";

interface QrShareModalProps {
  open: boolean;
  unit: Unit | null;
  onClose: () => void;
}

export default function QrShareModal({
  open,
  unit,
  onClose,
}: QrShareModalProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = unit ? getUnitShareUrl(unit.code) : "";

  useEffect(() => {
    if (!open) return;

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [open, onClose]);

  function close() {
    setCopied(false);
    onClose();
  }

  async function copyLink() {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }

  if (!open || !unit) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4 backdrop-blur-[6px] animate-fade-in"
      onClick={close}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="qr-share-title"
        onClick={(event) => event.stopPropagation()}
        className="viw-glass relative w-full max-w-[380px] overflow-hidden rounded-[26px] p-5 animate-modal-in sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="viw-eyebrow">Compartir residencia</p>
            <h2
              id="qr-share-title"
              className="mt-1.5 font-display text-xl font-medium tracking-[-0.04em] text-viw-text"
            >
              Abre esta ficha
              <br />
              en cualquier pantalla.
            </h2>
          </div>
          <button
            type="button"
            onClick={close}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-viw-text/10 bg-black/15 text-viw-text/45 transition-colors hover:bg-viw-text/10 hover:text-viw-text"
            aria-label="Cerrar QR"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative mt-5 rounded-[20px] border border-viw-text/10 bg-[radial-gradient(circle_at_50%_0%,rgba(92,225,230,0.09),transparent_70%)] p-4">
          <span className="absolute left-3 top-3 h-3 w-3 border-l border-t border-viw-accent/40" />
          <span className="absolute right-3 top-3 h-3 w-3 border-r border-t border-viw-accent/40" />
          <span className="absolute bottom-3 left-3 h-3 w-3 border-b border-l border-viw-accent/40" />
          <span className="absolute bottom-3 right-3 h-3 w-3 border-b border-r border-viw-accent/40" />

          <div className="mx-auto flex w-fit rounded-[15px] bg-[#EEF4F4] p-3 shadow-[0_18px_50px_rgba(0,0,0,0.32)]">
            <QRCodeSVG
              value={shareUrl || "https://viw.demo"}
              size={172}
              bgColor="#EEF4F4"
              fgColor="#242321"
              level="H"
              marginSize={1}
              title={`Enlace directo a ${unit.name}`}
            />
          </div>

          <div className="mx-auto mt-3.5 flex w-fit items-center gap-1.5 rounded-full border border-viw-text/10 bg-black/20 px-3 py-1.5">
            <Smartphone className="h-3 w-3 text-viw-accent/70" />
            <span className="text-[8px] font-medium uppercase tracking-[0.13em] text-viw-text/40">
              Escanea para recorrer
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[8px] font-medium uppercase tracking-[0.16em] text-viw-text/30">
              {unit.code} · Nivel {unit.floor}
            </p>
            <p className="mt-0.5 truncate font-display text-[13px] font-medium tracking-[-0.02em] text-viw-text/80">
              {unit.name}
            </p>
          </div>
          <span className="shrink-0 font-display text-[12px] font-medium text-viw-text/40">
            viw<span className="text-viw-accent">.</span>
          </span>
        </div>

        <div className="mt-3.5 flex items-center gap-1.5 rounded-xl border border-viw-text/10 bg-black/15 p-1">
          <Link2 className="ml-2 h-3 w-3 shrink-0 text-viw-text/30" />
          <p className="min-w-0 flex-1 truncate text-[9px] text-viw-text/40">
            {shareUrl}
          </p>
          <button
            type="button"
            onClick={copyLink}
            className={`flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-3 text-[9px] font-medium transition-all ${
              copied
                ? "bg-viw-accent/15 text-viw-accent"
                : "bg-viw-text/[0.08] text-viw-text/65 hover:bg-viw-text/[0.13] hover:text-viw-text"
            }`}
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" /> Copiado
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" /> Copiar
              </>
            )}
          </button>
        </div>

        <a
          href={shareUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-[9px] font-medium text-viw-text/34 transition-colors hover:text-viw-text/65"
        >
          Abrir enlace directo <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
