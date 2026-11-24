/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type JarvisStatus = "idle" | "listening" | "thinking" | "speaking";

interface JarvisVoiceAssistantProps {
  inventoryContext: unknown[];
  onExecuteAction: (name: string, args: Record<string, any>) => void;
}

interface SpeechRecognitionEventLike {
  results: { [index: number]: { [index: number]: { transcript: string } } };
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: unknown) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export default function JarvisVoiceAssistant({
  inventoryContext,
  onExecuteAction,
}: JarvisVoiceAssistantProps) {
  const [status, setStatus] = useState<JarvisStatus>("idle");
  const [transcript, setTranscript] = useState("");
  const [manualText, setManualText] = useState("");
  const [showManual, setShowManual] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const statusRef = useRef<JarvisStatus>("idle");
  const transcriptRef = useRef("");

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const preferred =
      voices.find((v) => v.lang === "es-MX") ||
      voices.find((v) => v.lang.startsWith("es"));
    if (preferred) utterance.voice = preferred;
    utterance.lang = preferred?.lang ?? "es-MX";
    utterance.rate = 1.05;
    setStatus("speaking");
    utterance.onend = () => setStatus("idle");
    utterance.onerror = () => setStatus("idle");
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, []);

  const sendTranscript = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      setStatus("thinking");
      try {
        const compact = Array.isArray(inventoryContext)
          ? inventoryContext.map((u: any) => ({
              code: u.code,
              status: u.status,
              bedrooms: u.bedrooms,
              priceUsd: u.priceUsd,
              floor: u.floor,
              orientation: u.orientation,
            }))
          : inventoryContext;
        const response = await fetch("/api/jarvis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transcript: text,
            inventoryContext: compact,
          }),
        });
        const data = await response.json();
        if (data?.toolCall) {
          onExecuteAction(data.toolCall.name, data.toolCall.args ?? {});
        }
        const reply = data?.replyText ?? "";
        if (reply) {
          speak(reply);
        } else {
          setStatus("idle");
        }
      } catch {
        setStatus("idle");
      }
    },
    [inventoryContext, onExecuteAction, speak],
  );

  const startListening = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      setShowManual(true);
      return;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    const recognition = new Ctor();
    recognition.lang = "es-MX";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      let finalText = "";
      for (let i = 0; i < Object.keys(event.results).length; i++) {
        const result = event.results[i];
        if (result && result[0]) {
          finalText += result[0].transcript;
        }
      }
      transcriptRef.current = finalText;
      setTranscript(finalText);
    };
    recognition.onerror = () => {
      setStatus("idle");
      setShowManual(true);
    };
    recognition.onend = () => {
      const final = transcriptRef.current;
      if (final.trim()) {
        sendTranscript(final);
      } else {
        setStatus("idle");
      }
      transcriptRef.current = "";
    };
    recognitionRef.current = recognition;
    setTranscript("");
    transcriptRef.current = "";
    setStatus("listening");
    recognition.start();
  }, [sendTranscript]);

  const stopListening = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      // ignore
    }
  }, []);

  const handleToggle = () => {
    if (status === "listening") {
      stopListening();
    } else if (status === "idle") {
      startListening();
    }
  };

  const handleManualSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!manualText.trim()) return;
    sendTranscript(manualText);
    setManualText("");
  };

  // Ensure voices are loaded.
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  const statusLabel =
    status === "listening"
      ? "Escuchando..."
      : status === "thinking"
        ? "Pensando..."
        : status === "speaking"
          ? "Hablando..."
          : "Asistente viw";

  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-2 md:bottom-6 md:right-6">
      {showManual ? (
        <form
          onSubmit={handleManualSubmit}
          className="viw-glass mb-1 flex items-center gap-2 rounded-full px-3 py-2"
        >
          <input
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            placeholder="Escribe tu consulta..."
            className="w-44 bg-transparent text-[11px] text-viw-text outline-none placeholder:text-viw-text/30"
          />
          <button
            type="submit"
            className="text-[10px] font-semibold text-viw-accent"
          >
            Enviar
          </button>
        </form>
      ) : null}

      {transcript && status === "listening" ? (
        <div className="viw-glass max-w-[260px] rounded-2xl px-3 py-2 text-[10px] text-viw-text/70">
          {transcript}
        </div>
      ) : null}

      <button
        type="button"
        onClick={handleToggle}
        disabled={status === "thinking" || status === "speaking"}
        className={`flex h-12 w-12 items-center justify-center rounded-full border backdrop-blur-md transition-all ${
          status === "listening"
            ? "border-[#5CE1E6] bg-[#5CE1E6]/20 text-[#5CE1E6] shadow-[0_0_24px_rgba(92,225,230,0.4)]"
            : "border-[#EEF4F4]/15 bg-[#242321]/75 text-[#EEF4F4]/80 hover:border-[#5CE1E6]/40 hover:text-[#5CE1E6]"
        }`}
        aria-label={statusLabel}
        title={statusLabel}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
          <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
          <line x1="12" y1="18" x2="12" y2="22" />
        </svg>
      </button>
      <span className="text-[8px] uppercase tracking-[0.14em] text-viw-text/30">
        {statusLabel}
      </span>
    </div>
  );
}