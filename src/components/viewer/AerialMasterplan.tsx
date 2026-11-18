"use client";

import {
  ArrowUpRight,
  Building2,
  Compass,
  MapPin,
  Waves,
  X,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { formatUSD } from "@/lib/utils";
import type { ProjectData, Unit } from "@/types/viw.types";

interface AerialMasterplanProps {
  project: ProjectData;
  units: Unit[];
  onExploreTower: () => void;
}

export default function AerialMasterplan({
  project,
  units,
  onExploreTower,
}: AerialMasterplanProps) {
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const availableUnits = units.filter((unit) => unit.status === "available");
  const selectedPin =
    project.pins.find((pin) => pin.id === selectedPinId) ?? null;

  function renderPin(
    pin: ProjectData["pins"][number],
    index: number,
    compact: boolean,
  ) {
    const isSelected = pin.id === selectedPinId;
    const labelOnLeft = pin.position.x > 58;

    return (
      <button
        key={pin.id}
        type="button"
        onClick={() =>
          setSelectedPinId((current) => (current === pin.id ? null : pin.id))
        }
        aria-pressed={isSelected}
        aria-label={`${pin.label}: ${pin.description}`}
        style={{
          left: `${pin.position.x}%`,
          top: `${pin.position.y}%`,
        }}
        className="group pointer-events-auto absolute z-20 -translate-x-1/2 -translate-y-1/2 focus-visible:outline-offset-8"
      >
        <span
          className={`relative flex items-center justify-center rounded-full border shadow-[0_6px_24px_rgba(0,0,0,0.3)] backdrop-blur-md transition-all duration-300 ${
            isSelected
              ? "border-viw-accent/70 bg-viw-accent text-[#152325]"
              : "border-white/35 bg-[#242522]/70 text-white/85 group-hover:scale-110 group-hover:border-viw-accent/60 group-hover:bg-[#242522]/90"
          } ${compact ? "h-8 w-8" : isSelected ? "h-10 w-10" : "h-9 w-9"}`}
        >
          {isSelected ? (
            <span className="pin-pulse absolute inset-0 rounded-full" />
          ) : null}
          <span className="relative font-display text-[9px] font-semibold tracking-[0.02em]">
            {String(index + 1).padStart(2, "0")}
          </span>
          {!isSelected ? (
            <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full border border-[#22231f] bg-viw-accent" />
          ) : null}
        </span>

        {compact ? null : (
          <span
            className={`absolute top-1/2 flex -translate-y-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1.5 text-[8px] font-medium shadow-lg backdrop-blur-md transition-all duration-300 ${
              labelOnLeft
                ? "right-[calc(100%+8px)]"
                : "left-[calc(100%+8px)]"
            } ${
              isSelected
                ? "border-viw-accent/25 bg-[#242321]/90 text-viw-text"
                : "border-white/10 bg-[#20211e]/62 text-white/62 group-hover:border-white/22 group-hover:text-white"
            }`}
          >
            {pin.action === "tower" ? (
              <Building2 className="h-2.5 w-2.5 text-viw-accent/80" />
            ) : (
              <span className="h-1 w-1 rounded-full bg-white/35" />
            )}
            {pin.label}
          </span>
        )}
      </button>
    );
  }

  return (
    <section
      className="relative h-full w-full overflow-hidden bg-[#1c1d19]"
      aria-label="Masterplan aéreo de Zpyra"
    >
      {/* Mobile: atmospheric backdrop + framed masterplan card */}
      <div className="absolute inset-0 md:hidden">
        <Image
          src={project.images.aerial}
          alt=""
          fill
          sizes="100vw"
          className="scale-125 object-cover object-center opacity-40 blur-2xl"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-[#141512]/60" />
        <div className="absolute inset-0 stage-vignette" />
      </div>

      {/* Desktop: full-bleed aerial, pins anchored to the image box */}
      <div className="absolute inset-0 hidden overflow-hidden md:block">
        <div className="absolute inset-x-0 top-1/2 aspect-[1320/743] -translate-y-1/2">
          <Image
            src={project.images.aerial}
            alt="Vista aérea del masterplan de Zpyra en el corredor Mérida–Progreso"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="pointer-events-none absolute inset-0 z-20">
            {project.pins.map((pin, index) =>
              renderPin(pin, index, false),
            )}
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[#151714]/25" />
      <div className="pointer-events-none absolute inset-0 stage-vignette" />
      <div className="pointer-events-none absolute inset-0 bg-viw-grid opacity-20 [mask-image:linear-gradient(to_bottom,black_0%,transparent_55%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-[#242321]/85 via-[#242321]/35 to-transparent" />

      <div className="absolute left-4 top-[91px] z-20 max-w-[74%] text-shadow-soft sm:max-w-[64%] md:left-[104px] md:top-[110px] lg:left-[116px] lg:top-[122px]">
        <div className="flex items-center gap-2">
          <span className="h-px w-5 bg-viw-accent/70" />
          <p className="text-[8px] font-medium uppercase tracking-[0.22em] text-viw-text/55">
            Vista 01 · Masterplan aéreo
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Image
            src="/assets/zpyra-isotipo.svg"
            alt="Isotipo Zpyra"
            width={80}
            height={80}
            className="h-14 w-14 shrink-0 opacity-90 invert drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] sm:h-20 sm:w-20"
          />
          <h1 className="font-display text-[clamp(3.2rem,8vw,7rem)] font-medium leading-[0.85] tracking-[-0.075em] text-white/95 drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
          Zpyra
          <span className="text-viw-accent">.</span>
        </h1>
        </div>

        <p className="mt-3 max-w-[290px] font-display text-[12px] font-medium leading-[1.45] tracking-[-0.02em] text-white/70 drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)] sm:max-w-sm sm:text-[14px]">
          {project.tagline}
          <span className="block text-white/45">{project.descriptor}</span>
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[8px] font-medium uppercase tracking-[0.12em] text-white/52 drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-2.5 w-2.5 text-viw-accent/65" />
            {project.location}
          </span>
          <span className="hidden h-2.5 w-px bg-white/15 sm:block" />
          <span className="hidden sm:block">{project.delivery}</span>
        </div>
      </div>

      <div className="absolute right-4 top-[97px] z-20 hidden items-start gap-4 lg:right-6 lg:top-[112px] lg:flex">
        <div className="text-right">
          <p className="text-[7px] font-medium uppercase tracking-[0.16em] text-white/28">
            Coordenadas del sitio
          </p>
          <p className="mt-1 text-[9px] font-medium tabular-nums tracking-[0.08em] text-white/50">
            21°08&apos;38.0&quot; N · 89°38&apos;54.1&quot; O
          </p>
          <div className="mt-3 flex items-center justify-end gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-viw-accent opacity-40" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-viw-accent" />
            </span>
            <span className="text-[7px] font-medium uppercase tracking-[0.14em] text-white/35">
              Inventario en vivo
            </span>
          </div>
        </div>
        <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-white/12 bg-black/10 backdrop-blur-sm">
          <div className="absolute inset-2 rounded-full border border-dashed border-white/12" />
          <Compass className="h-5 w-5 stroke-[1] text-white/38" />
          <span className="absolute -top-0.5 text-[7px] font-semibold tracking-[0.1em] text-viw-accent/85">
            N
          </span>
        </div>
      </div>

      {/* Mobile: framed masterplan with compact pins */}
      <div className="absolute inset-x-0 top-[248px] bottom-[150px] z-20 flex items-center px-4 md:hidden">
        <div className="relative h-full max-h-[340px] w-full overflow-hidden rounded-[24px] border border-white/12 bg-[#1c1d19] shadow-[0_28px_90px_rgba(0,0,0,0.5)]">
          <div
            className="absolute left-0 top-1/2 aspect-[1320/743] h-full"
            style={{ transform: "translate(calc(22px - 24%), -50%)" }}
          >
            <Image
              src={project.images.aerial}
              alt="Vista aérea del masterplan de Zpyra en el corredor Mérida–Progreso"
              fill
              sizes="(max-width: 768px) 175vw, 0vw"
              className="object-cover"
            />
            <div className="pointer-events-none absolute inset-0 z-20">
              {project.pins.map((pin, index) => renderPin(pin, index, true))}
            </div>
          </div>

          <div className="pointer-events-none absolute inset-0 bg-[#12130f]/10" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/45 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />

          <div className="absolute left-3 top-3 z-20 flex items-center gap-1.5 rounded-full border border-white/12 bg-black/30 px-2.5 py-1.5 backdrop-blur-md">
            <Compass className="h-2.5 w-2.5 stroke-[1.4] text-viw-accent/85" />
            <span className="text-[7px] font-medium uppercase tracking-[0.16em] text-white/65">
              Plan maestro
            </span>
          </div>

          <div className="pointer-events-none absolute inset-x-3 bottom-3 z-20 flex items-end justify-between gap-3">
            <span className="flex items-center gap-1.5 text-[7px] font-medium uppercase tracking-[0.14em] text-white/55">
              <span className="h-1 w-1 rounded-full bg-viw-accent" />
              Toca un punto para ver el detalle
            </span>
            <span className="text-[7px] tabular-nums tracking-[0.1em] text-white/35">
              3 PUNTOS
            </span>
          </div>
        </div>
      </div>

      <div
        className={`absolute inset-x-3 z-30 md:bottom-6 md:left-[104px] md:right-auto md:w-[400px] lg:left-[116px] ${
          selectedPin ? "bottom-[128px]" : "bottom-[84px]"
        }`}
      >
        {selectedPin ? (
          <div className="viw-glass animate-panel-in overflow-hidden rounded-[22px]">
            <div className="flex items-start justify-between gap-4 p-4 pb-3">
              <div>
                <p className="viw-eyebrow">{selectedPin.eyebrow}</p>
                <h2 className="mt-1.5 font-display text-[22px] font-medium leading-tight tracking-[-0.045em] text-viw-text">
                  {selectedPin.label}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPinId(null)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-viw-text/10 text-viw-text/35 transition-colors hover:bg-viw-text/10 hover:text-viw-text"
                aria-label="Cerrar detalle del punto"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <p className="px-4 text-[10px] leading-[1.7] text-viw-text/48">
              {selectedPin.description}
            </p>

            <div className="mt-3 flex items-end justify-between gap-3 border-t border-viw-text/10 p-4 pt-3">
              <div>
                <p className="text-[7px] uppercase tracking-[0.14em] text-viw-text/28">
                  {selectedPin.statLabel}
                </p>
                <p className="mt-1 font-display text-[17px] font-medium tracking-[-0.03em] text-viw-text/90">
                  {selectedPin.statValue}
                </p>
              </div>

              {selectedPin.action === "tower" ? (
                <button
                  type="button"
                  onClick={onExploreTower}
                  className="group flex h-9 items-center gap-2 rounded-xl bg-viw-accent px-3.5 text-[9px] font-semibold text-[#142426] transition-all hover:bg-[#7CF1F4]"
                >
                  {selectedPin.ctaLabel}
                  <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const currentIndex = project.pins.findIndex(
                      (pin) => pin.id === selectedPin.id,
                    );
                    const next = project.pins[(currentIndex + 1) % project.pins.length];
                    setSelectedPinId(next.id);
                  }}
                  className="flex h-9 items-center gap-1.5 rounded-xl border border-viw-text/12 bg-white/[0.035] px-3 text-[9px] font-medium text-viw-text/55 transition-colors hover:border-viw-text/22 hover:text-viw-text"
                >
                  Siguiente punto
                  <ArrowUpRight className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="viw-glass hidden overflow-hidden rounded-[22px] p-4 md:block">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-viw-accent/20 bg-viw-accent/[0.08]">
                    <Building2 className="h-3.5 w-3.5 text-viw-accent/80" />
                  </span>
                  <div>
                    <p className="text-[8px] font-medium uppercase tracking-[0.14em] text-viw-text/30">
                      Colección Horizonte
                    </p>
                    <p className="mt-0.5 font-display text-[12px] font-medium tracking-[-0.025em] text-viw-text/80">
                      {project.totalUnits} residencias · {availableUnits.length}{" "}
                      disponibles
                    </p>
                  </div>
                </div>
                <Waves className="h-4 w-4 stroke-[1.2] text-viw-text/20" />
              </div>
              <div className="mt-3 h-px w-full bg-viw-text/10" />
              <div className="mt-3 flex items-end justify-between gap-3">
                <div>
                  <p className="text-[7px] uppercase tracking-[0.14em] text-viw-text/28">
                    Desde
                  </p>
                  <p className="mt-1 font-display text-[14px] font-medium tracking-[-0.02em] text-viw-text/75">
                    {formatUSD(project.priceFromUsd)}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-[8px] text-viw-text/30">
                  <span className="h-1 w-1 rounded-full bg-viw-accent/70" />
                  Selecciona un punto para explorar
                </div>
              </div>
            </div>

            <div className="viw-glass-soft flex items-center gap-2.5 rounded-full px-3.5 py-2.5 md:hidden">
              <span className="relative flex h-6 w-6 items-center justify-center rounded-full border border-viw-accent/25">
                <span className="absolute inset-0 rounded-full border border-viw-accent/30 animate-soft-pulse" />
                <span className="h-1.5 w-1.5 rounded-full bg-viw-accent" />
              </span>
              <div>
                <p className="text-[9px] font-medium text-viw-text/70">
                  Explora el masterplan
                </p>
                <p className="text-[8px] text-viw-text/32">
                  Toca cualquiera de los 3 puntos
                </p>
              </div>
              <ArrowUpRight className="ml-auto h-3.5 w-3.5 text-viw-text/25" />
            </div>
          </>
        )}
      </div>

      <div className="absolute bottom-7 right-5 z-20 hidden flex-col items-end gap-1.5 md:flex">
        <div className="h-10 w-px bg-gradient-to-b from-transparent via-white/25 to-transparent" />
        <span className="text-[7px] font-medium uppercase tracking-[0.18em] text-white/22">
          Zpyra · 2027
        </span>
      </div>
    </section>
  );
}
