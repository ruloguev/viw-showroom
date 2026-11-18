"use client";

import {
  ArrowUpRight,
  Bath,
  BedDouble,
  Building2,
  Car,
  Compass,
  Layers,
  MapPin,
  Maximize2,
  MessageCircle,
  Play,
  QrCode,
  Share2,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { formatUSD } from "@/lib/utils";

import type { ProjectData, Scene360, Unit, UnitStatus } from "@/types/viw.types";
import QrShareModal from "@/components/ui/QrShareModal";

interface UnitDetailDrawerProps {
  unit: Unit | null;
  open: boolean;
  project: ProjectData;
  scenes: Scene360[];
  onClose: () => void;
  onStartTour: (sceneId: string) => void;
  onStatusChange?: (unitId: string, status: UnitStatus) => void;
}

const STATUS_META: Record<
  UnitStatus,
  { label: string; color: string; className: string }
> = {
  available: {
    label: "Disponible",
    color: "#5CE1E6",
    className: "border-[#5CE1E6]/25 bg-[#5CE1E6]/10 text-[#9AF3F5]",
  },
  reserved: {
    label: "Reservado",
    color: "#F59E0B",
    className: "border-[#F59E0B]/25 bg-[#F59E0B]/10 text-[#FCD38D]",
  },
  sold: {
    label: "Vendido",
    color: "#EF4444",
    className: "border-[#EF4444]/25 bg-[#EF4444]/10 text-[#FCA5A5]",
  },
};

export default function UnitDetailDrawer({
  unit,
  open,
  project,
  scenes,
  onClose,
  onStartTour,
  onStatusChange,
}: UnitDetailDrawerProps) {
  const [qrOpen, setQrOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape" && !qrOpen) onClose();
    }

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [open, onClose, qrOpen]);

  function closeDrawer() {
    setQrOpen(false);
    onClose();
  }

  if (!open || !unit) return null;

  const status = STATUS_META[unit.status];
  const tourScene =
    scenes.find((scene) => scene.id === unit.tourSceneId) ?? scenes[0];
  const cotizarMessage = `Hola, me interesa cotizar la residencia ${unit.code} del demo Zpyra en viw`;
  const cotizarLink = `https://wa.me/525568661831?text=${encodeURIComponent(
    cotizarMessage,
  )}`;

  return (
    <div className="fixed inset-0 z-[70]">
      <button
        type="button"
        aria-label="Cerrar ficha de residencia"
        className="absolute inset-0 h-full w-full bg-black/55 backdrop-blur-[5px] animate-fade-in"
        onClick={closeDrawer}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="unit-detail-title"
        className="viw-glass animate-drawer-in absolute bottom-2 right-2 top-2 flex w-[calc(100%-1rem)] max-w-[480px] flex-col overflow-hidden rounded-[26px] bg-[#242321]/75 sm:bottom-3 sm:right-3 sm:top-3"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 z-40 flex items-start justify-between p-3">
          <span className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/10 bg-[#1e1d1b]/60 px-3 py-1.5 backdrop-blur-xl">
            <span className="flex h-4 w-4 items-center justify-center rounded-[5px] bg-viw-text/90">
              <span className="font-display text-[7px] font-bold tracking-[-0.08em] text-viw-base">
                viw
              </span>
            </span>
            <span className="text-[8px] font-medium uppercase tracking-[0.15em] text-white/55">
              Ficha privada
            </span>
          </span>

          <div className="pointer-events-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setQrOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-[#1e1d1b]/60 text-white/65 backdrop-blur-xl transition-colors hover:border-viw-accent/30 hover:text-viw-accent"
              aria-label="Compartir con código QR"
            >
              <Share2 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={closeDrawer}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-[#1e1d1b]/60 text-white/65 backdrop-blur-xl transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain no-scrollbar">
          <div className="relative aspect-[1.38/1] w-full overflow-hidden">
            <Image
              src={tourScene.image}
              alt={`Vista interior de ${unit.name}`}
              fill
              priority
              sizes="(max-width: 640px) 100vw, 480px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#242321] via-[#242321]/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 pb-4">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[8px] font-medium uppercase tracking-[0.18em] text-white/46">
                    {project.name} · {unit.model}
                  </p>
                  <h2
                    id="unit-detail-title"
                    className="mt-1.5 font-display text-[28px] font-medium leading-none tracking-[-0.05em] text-white"
                  >
                    {unit.name}
                  </h2>
                </div>
                <button
                  type="button"
                  className="mb-0.5 flex shrink-0 items-center gap-1.5 rounded-full border border-white/15 bg-black/20 px-2.5 py-1.5 text-[8px] font-medium uppercase tracking-[0.1em] text-white/65 backdrop-blur-md transition-colors hover:bg-black/35 hover:text-white"
                  aria-label="Ver ficha QR"
                  onClick={() => setQrOpen(true)}
                >
                  <QrCode className="h-3 w-3" />
                  QR
                </button>
              </div>
            </div>
          </div>

          <div className="px-5 pb-6 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[8px] font-medium uppercase tracking-[0.12em] ${status.className}`}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: status.color }}
                  />
                  {status.label}
                </span>
                <span className="rounded-full border border-white/10 px-2.5 py-1 text-[8px] font-medium uppercase tracking-[0.12em] text-white/36">
                  {unit.facade.level}
                </span>
              </div>
              <span className="font-display text-[10px] font-medium tracking-[0.05em] text-white/30">
                {unit.code}
              </span>
            </div>

            <div className="mt-5 flex items-end justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <p className="viw-eyebrow">Precio de venta</p>
                <p className="mt-1.5 font-display text-[25px] font-medium tracking-[-0.045em] text-viw-text">
                  {formatUSD(unit.priceUsd)}
                </p>
              </div>
              <div className="text-right">
                <p className="viw-eyebrow">Nivel</p>
                <p className="mt-1.5 font-display text-[22px] font-medium tracking-[-0.04em] text-viw-text/45">
                  {unit.floor.toString().padStart(2, "0")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-4 divide-x divide-white/10 py-5">
              <DetailMetric
                icon={<Maximize2 className="h-3.5 w-3.5" />}
                value={`${unit.areaM2}`}
                label="m² interior"
              />
              <DetailMetric
                icon={<Layers className="h-3.5 w-3.5" />}
                value={`${unit.terraceM2}`}
                label="m² terraza"
              />
              <DetailMetric
                icon={<BedDouble className="h-3.5 w-3.5" />}
                value={`${unit.bedrooms}`}
                label="recámaras"
              />
              <DetailMetric
                icon={<Bath className="h-3.5 w-3.5" />}
                value={`${unit.bathrooms}`}
                label="baños"
              />
            </div>

            <div className="border-t border-white/10 pt-5">
              <p className="text-[12px] leading-[1.75] text-viw-text/55">
                {unit.description}
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <Attribute
                icon={<Compass className="h-3.5 w-3.5" />}
                label="Orientación"
                value={unit.orientation}
              />
              <Attribute
                icon={<Car className="h-3.5 w-3.5" />}
                label="Estacionamiento"
                value={`${unit.parkingSpots} cajones`}
              />
              <Attribute
                icon={<Building2 className="h-3.5 w-3.5" />}
                label="Vista"
                value={unit.view}
              />
              <Attribute
                icon={<MapPin className="h-3.5 w-3.5" />}
                label="Ubicación"
                value={project.shortLocation}
              />
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <p className="viw-eyebrow">Amenidades de la residencia</p>
                <span className="text-[8px] text-viw-text/25">
                  {unit.amenities.length} detalles
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {unit.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="rounded-lg border border-white/10 bg-white/[0.035] px-2.5 py-1.5 text-[9px] text-white/55"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onStartTour(unit.tourSceneId)}
              className="group mt-6 flex w-full items-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-black/15 p-2 text-left transition-colors hover:border-viw-accent/30 hover:bg-black/25"
            >
              <div className="relative h-[64px] w-[92px] shrink-0 overflow-hidden rounded-xl">
                <Image
                  src={tourScene.image}
                  alt=""
                  fill
                  sizes="92px"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/25" />
                <span className="absolute left-1/2 top-1/2 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/35 backdrop-blur-sm">
                  <Play className="ml-0.5 h-3 w-3 fill-white text-white" />
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[8px] font-medium uppercase tracking-[0.15em] text-viw-accent/80">
                  Tour 360° inmersivo
                </p>
                <p className="mt-0.5 truncate font-display text-[13px] font-medium tracking-[-0.02em] text-white/80">
                  {tourScene.name}
                </p>
                <p className="mt-0.5 text-[9px] text-white/30">
                  4 escenas encadenadas · WebXR
                </p>
              </div>
              <ArrowUpRight className="mr-2 h-4 w-4 shrink-0 text-white/30 transition-colors group-hover:text-viw-accent" />
            </button>

            <div className="mt-4 rounded-xl border border-viw-text/[0.08] bg-viw-text/[0.025] p-2.5">
              <p className="mb-1.5 text-[8px] font-medium uppercase tracking-[0.14em] text-viw-text/35">
                Simular estatus (Demo)
              </p>
              <div className="grid grid-cols-3 gap-1">
                {(
                  [
                    { id: "available" as UnitStatus, label: "Disponible", color: "#5CE1E6" },
                    { id: "reserved" as UnitStatus, label: "Reservado", color: "#F59E0B" },
                    { id: "sold" as UnitStatus, label: "Vendido", color: "#EF4444" },
                  ]
                ).map((option) => {
                  const isActive = unit.status === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => onStatusChange?.(unit.id, option.id)}
                      aria-pressed={isActive}
                      className={`flex h-7 items-center justify-center gap-1 rounded-[9px] border text-[8px] font-medium transition-all ${
                        isActive
                          ? "border-transparent text-[#142426]"
                          : "border-viw-text/10 text-viw-text/40 hover:bg-viw-text/[0.05] hover:text-viw-text/70"
                      }`}
                      style={
                        isActive
                          ? { backgroundColor: option.color }
                          : undefined
                      }
                    >
                      <span
                        className="h-1 w-1 rounded-full"
                        style={{ backgroundColor: isActive ? "#142426" : option.color }}
                      />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="mt-4 text-center text-[8px] leading-relaxed text-white/22">
              Precios en USD. Disponibilidad y acabados sujetos a cambio sin
              previo aviso. Documento demostrativo viw.
            </p>
          </div>
        </div>

        <div className="border-t border-white/10 bg-[#242321]/95 p-3 backdrop-blur-xl">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onStartTour(unit.tourSceneId)}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-viw-text/12 bg-white/[0.045] text-[10px] font-semibold text-viw-text transition-all hover:border-viw-accent/35 hover:bg-viw-accent/10 hover:text-viw-accent"
            >
              <Play className="h-3.5 w-3.5" />
              Iniciar Tour 360°
            </button>
            <a
              href={cotizarLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 flex-[1.2] items-center justify-center gap-2 rounded-xl bg-viw-accent text-[10px] font-semibold text-[#142426] transition-all hover:bg-[#79F1F5]"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Cotizar por WhatsApp
              <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
          <p className="mt-2 flex items-center justify-center gap-1.5 text-[8px] text-white/24">
            <span className="h-1 w-1 rounded-full bg-viw-accent/80" />
            Asesor dedicado · Respuesta en menos de 15 min
          </p>
        </div>
      </section>

      <QrShareModal
        open={qrOpen}
        unit={unit}
        onClose={() => setQrOpen(false)}
      />
    </div>
  );
}

function DetailMetric({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center px-1 text-center">
      <span className="text-viw-text/25">{icon}</span>
      <span className="mt-1.5 font-display text-[16px] font-medium tracking-[-0.035em] text-viw-text/85">
        {value}
      </span>
      <span className="mt-0.5 text-[7px] uppercase tracking-[0.1em] text-viw-text/30">
        {label}
      </span>
    </div>
  );
}

function Attribute({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 py-2.5">
      <span className="mt-0.5 text-viw-text/25">{icon}</span>
      <div className="min-w-0">
        <p className="text-[7px] uppercase tracking-[0.12em] text-white/24">
          {label}
        </p>
        <p className="mt-0.5 truncate text-[9px] font-medium text-white/65">
          {value}
        </p>
      </div>
    </div>
  );
}
