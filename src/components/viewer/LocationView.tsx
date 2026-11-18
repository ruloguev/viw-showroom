"use client";

import {
  ArrowUpRight,
  Bike,
  Car,
  ChevronRight,
  Footprints,
  HeartPulse,
  MapPin,
  Navigation,
  ShoppingBag,
  TrainFront,
  Trees,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import type { POICategory, POILocation, ProjectData } from "@/types/viw.types";

type TravelMode = "car" | "bike" | "walk";

interface LocationViewProps {
  project: ProjectData;
}

const MODES: {
  id: TravelMode;
  label: string;
  icon: LucideIcon;
  speedKmh: number;
  overheadMin: number;
  mapsMode: string;
}[] = [
  {
    id: "car",
    label: "Auto",
    icon: Car,
    speedKmh: 70,
    overheadMin: 2,
    mapsMode: "driving",
  },
  {
    id: "bike",
    label: "Bici",
    icon: Bike,
    speedKmh: 15,
    overheadMin: 0,
    mapsMode: "bicycling",
  },
  {
    id: "walk",
    label: "Caminando",
    icon: Footprints,
    speedKmh: 4.8,
    overheadMin: 0,
    mapsMode: "walking",
  },
];

const CATEGORY_META: Record<
  POICategory,
  { icon: LucideIcon; label: string; color: string }
> = {
  park: { icon: Trees, label: "Parque", color: "#8FC9A8" },
  lifestyle: { icon: ShoppingBag, label: "Lifestyle", color: "#D9C08D" },
  transport: { icon: TrainFront, label: "Transporte", color: "#5CE1E6" },
  health: { icon: HeartPulse, label: "Salud", color: "#F2A6A6" },
};

function getTravelMinutes(poi: POILocation, modeId: TravelMode) {
  const mode = MODES.find((item) => item.id === modeId) ?? MODES[0];
  return Math.max(
    2,
    Math.round((poi.distanceKm / mode.speedKmh) * 60 + mode.overheadMin),
  );
}

const PROJECT_ORIGIN = { x: 52, y: 46 };
const PROJECT_COORDINATES = "21.143889,-89.648361";

export default function LocationView({ project }: LocationViewProps) {
  const [selectedPoiId, setSelectedPoiId] = useState(project.pois[1].id);
  const [mode, setMode] = useState<TravelMode>("car");

  const selectedPoi =
    project.pois.find((poi) => poi.id === selectedPoiId) ?? project.pois[0];
  const activeMode = MODES.find((item) => item.id === mode) ?? MODES[0];
  const activeMinutes = getTravelMinutes(selectedPoi, mode);

  const routePath = useMemo(() => {
    const start = PROJECT_ORIGIN;
    const end = selectedPoi.mapPosition;
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    const controlX = start.x + deltaX * 0.55 - deltaY * 0.18;
    const controlY = start.y + deltaY * 0.55 + deltaX * 0.18;

    return `M ${start.x} ${start.y} Q ${controlX} ${controlY} ${end.x} ${end.y}`;
  }, [selectedPoi.mapPosition]);

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${PROJECT_COORDINATES}&destination=${selectedPoi.coordinates.lat},${selectedPoi.coordinates.lng}&travelmode=${activeMode.mapsMode}`;

  return (
    <section
      className="relative h-full w-full overflow-hidden bg-[#1d211d]"
      aria-label="Ubicación y puntos de interés de Zpyra"
    >
      <LocationMap
        project={project}
        selectedPoi={selectedPoi}
        onSelect={setSelectedPoiId}
        routePath={routePath}
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#171a16]/78 via-[#171a16]/22 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#171a16]/82 via-transparent to-[#171a16]/48" />
      <div className="pointer-events-none absolute inset-0 bg-viw-grid opacity-[0.075]" />

      <div className="absolute left-4 top-[91px] z-20 max-w-[70%] text-shadow-soft md:left-[104px] md:top-[112px] lg:left-[116px] lg:top-[122px]">
        <div className="flex items-center gap-2">
          <span className="h-px w-5 bg-viw-accent/70" />
          <p className="text-[8px] font-medium uppercase tracking-[0.22em] text-viw-text/55">
            Vista 04 · Ubicación & conectividad
          </p>
        </div>

        <h1 className="mt-3 max-w-[520px] font-display text-[clamp(2.15rem,4.2vw,4.1rem)] font-medium leading-[0.95] tracking-[-0.06em] text-white/95">
          Cerca de todo.
          <br />
          <span className="text-white/42">Lejos de lo ordinario.</span>
        </h1>

        <p className="mt-3 hidden max-w-[350px] text-[10px] leading-[1.7] text-white/38 md:block">
          Un enclave en Tamanché, sobre el corredor Mérida–Progreso, conectado
          a la costa, la ciudad y el aeropuerto.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/15 px-2.5 py-1.5 text-[7px] font-medium uppercase tracking-[0.12em] text-white/42 backdrop-blur-sm">
            <MapPin className="h-2.5 w-2.5 text-viw-accent/65" />
            {project.location}
          </span>
          <span className="flex items-center gap-1 text-[7px] font-medium uppercase tracking-[0.12em] text-white/25">
            <span className="h-1 w-1 rounded-full bg-viw-accent/60" />
            {project.pois.length} conexiones clave
          </span>
        </div>
      </div>

      <aside className="viw-glass absolute bottom-6 right-5 top-[112px] z-30 hidden w-[338px] flex-col overflow-hidden rounded-[24px] lg:flex">
        <div className="flex items-start justify-between border-b border-viw-text/10 p-4 pb-3.5">
          <div>
            <p className="viw-eyebrow">Mapa de conexiones</p>
            <h2 className="mt-1.5 font-display text-[18px] font-medium tracking-[-0.04em] text-viw-text/90">
              Lo esencial, más cerca.
            </h2>
          </div>
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-viw-text/10 bg-white/[0.035]">
            <Navigation className="h-3.5 w-3.5 stroke-[1.3] text-viw-accent/65" />
          </span>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-2.5 no-scrollbar">
          <div className="flex flex-col gap-1">
            {project.pois.map((poi) => {
              const meta = CATEGORY_META[poi.category];
              const Icon = meta.icon;
              const isActive = poi.id === selectedPoi.id;

              return (
                <button
                  key={poi.id}
                  type="button"
                  onClick={() => setSelectedPoiId(poi.id)}
                  aria-pressed={isActive}
                  className={`group flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition-all ${
                    isActive
                      ? "border-viw-accent/20 bg-viw-accent/[0.065]"
                      : "border-transparent hover:border-white/[0.06] hover:bg-white/[0.035]"
                  }`}
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border"
                    style={{
                      color: meta.color,
                      borderColor: `${meta.color}28`,
                      backgroundColor: `${meta.color}0D`,
                    }}
                  >
                    <Icon className="h-3.5 w-3.5 stroke-[1.5]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[10px] font-medium text-viw-text/75">
                      {poi.name}
                    </span>
                    <span className="mt-0.5 block text-[8px] uppercase tracking-[0.08em] text-viw-text/27">
                      {meta.label} · {poi.distanceKm} km
                    </span>
                  </span>
                  <ChevronRight
                    className={`h-3.5 w-3.5 shrink-0 transition-colors ${
                      isActive ? "text-viw-accent/60" : "text-viw-text/18"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <div className="mx-1 my-3 h-px bg-viw-text/10" />

          <div className="px-1.5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[7px] font-medium uppercase tracking-[0.14em] text-viw-text/27">
                  Destino seleccionado
                </p>
                <p className="mt-1 font-display text-[14px] font-medium tracking-[-0.025em] text-viw-text/82">
                  {selectedPoi.name}
                </p>
              </div>
              <span className="rounded-md border border-white/8 px-1.5 py-1 text-[7px] uppercase tracking-[0.08em] text-white/28">
                {activeMode.label}
              </span>
            </div>

            <p className="mt-2 text-[9px] leading-[1.7] text-viw-text/35">
              {selectedPoi.description}
            </p>

            <div className="mt-3 grid grid-cols-3 gap-1 rounded-xl border border-viw-text/10 bg-black/15 p-1">
              {MODES.map((travelMode) => {
                const Icon = travelMode.icon;
                const isActive = travelMode.id === mode;
                const minutes = getTravelMinutes(selectedPoi, travelMode.id);

                return (
                  <button
                    key={travelMode.id}
                    type="button"
                    onClick={() => setMode(travelMode.id)}
                    aria-pressed={isActive}
                    className={`flex flex-col items-center gap-1 rounded-lg py-2 transition-all ${
                      isActive
                        ? "bg-viw-text/[0.09] text-viw-text"
                        : "text-viw-text/30 hover:bg-viw-text/[0.035] hover:text-viw-text/60"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 stroke-[1.4]" />
                    <span className="text-[7px] font-medium uppercase tracking-[0.04em]">
                      {travelMode.label}
                    </span>
                    <span
                      className={`text-[8px] tabular-nums ${
                        isActive ? "text-viw-accent" : "text-viw-text/30"
                      }`}
                    >
                      {minutes} min
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex items-end justify-between border-t border-viw-text/10 pt-3">
              <div>
                <p className="text-[7px] uppercase tracking-[0.12em] text-viw-text/25">
                  Tiempo estimado
                </p>
                <p className="mt-0.5 flex items-baseline gap-1 font-display text-[26px] font-medium leading-none tracking-[-0.05em] text-viw-text">
                  {activeMinutes}
                  <span className="text-[10px] font-normal tracking-normal text-viw-text/35">
                    min
                  </span>
                </p>
              </div>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 items-center gap-1.5 rounded-xl bg-viw-text px-3 text-[8px] font-semibold text-viw-base transition-colors hover:bg-viw-accent"
              >
                Abrir ruta
                <ArrowUpRight className="h-3 w-3" />
              </a>
            </div>

            <p className="mt-3 flex items-center gap-1.5 text-[7px] text-viw-text/20">
              <span className="h-1 w-1 rounded-full bg-viw-accent/55" />
              Tiempos estimados · tráfico promedio
            </p>
          </div>
        </div>
      </aside>

      <div className="absolute inset-x-3 bottom-[128px] z-30 lg:hidden">
        <div className="viw-glass overflow-hidden rounded-[20px]">
          <div className="flex items-start justify-between gap-3 p-3.5 pb-2.5">
            <div className="flex min-w-0 items-start gap-2.5">
              <span
                className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border"
                style={{
                  color: CATEGORY_META[selectedPoi.category].color,
                  borderColor: `${CATEGORY_META[selectedPoi.category].color}28`,
                  backgroundColor: `${CATEGORY_META[selectedPoi.category].color}0D`,
                }}
              >
                {(() => {
                  const Icon = CATEGORY_META[selectedPoi.category].icon;
                  return <Icon className="h-3.5 w-3.5" />;
                })()}
              </span>
              <div className="min-w-0">
                <p className="text-[7px] font-medium uppercase tracking-[0.12em] text-viw-text/27">
                  {CATEGORY_META[selectedPoi.category].label} ·{" "}
                  {selectedPoi.distanceKm} km
                </p>
                <p className="mt-0.5 truncate font-display text-[15px] font-medium tracking-[-0.03em] text-viw-text/85">
                  {selectedPoi.name}
                </p>
              </div>
            </div>
            <span className="mt-0.5 shrink-0 font-display text-[13px] font-medium tracking-[-0.03em] text-viw-accent">
              {activeMinutes} min
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1 border-t border-viw-text/10 p-2">
            {MODES.map((travelMode) => {
              const Icon = travelMode.icon;
              const isActive = travelMode.id === mode;
              return (
                <button
                  key={travelMode.id}
                  type="button"
                  onClick={() => setMode(travelMode.id)}
                  aria-pressed={isActive}
                  className={`flex h-8 items-center justify-center gap-1.5 rounded-lg border text-[8px] font-medium transition-all ${
                    isActive
                      ? "border-viw-accent/20 bg-viw-accent/[0.08] text-viw-accent"
                      : "border-transparent bg-white/[0.025] text-viw-text/35"
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  {travelMode.label}
                  <span className="text-[7px] tabular-nums opacity-60">
                    {getTravelMinutes(selectedPoi, travelMode.id)}′
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 border-t border-viw-text/10 p-2">
            <p className="flex-1 truncate px-1 text-[7px] uppercase tracking-[0.1em] text-viw-text/24">
              {selectedPoi.routeLabel}
            </p>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-8 items-center gap-1.5 rounded-lg bg-viw-accent px-3 text-[8px] font-semibold text-[#142426]"
            >
              Cómo llegar
              <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>

      <div className="absolute bottom-7 left-[104px] z-20 hidden items-center gap-2 text-[7px] font-medium uppercase tracking-[0.14em] text-white/20 md:flex lg:left-[116px]">
        <span className="h-px w-8 bg-white/12" />
        Mapa ilustrativo · Tiempos calculados en tiempo real
      </div>

      <p className="sr-only" aria-live="polite">
        {selectedPoi.name} seleccionado. {activeMinutes} minutos en{" "}
        {activeMode.label.toLowerCase()}.
      </p>
    </section>
  );
}

function LocationMap({
  project,
  selectedPoi,
  onSelect,
  routePath,
}: {
  project: ProjectData;
  selectedPoi: POILocation;
  onSelect: (id: string) => void;
  routePath: string;
}) {
  return (
    <div className="absolute inset-0">
      <svg
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="map-base" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#252a24" />
            <stop offset="58%" stopColor="#20241f" />
            <stop offset="100%" stopColor="#191d19" />
          </linearGradient>
          <linearGradient id="map-sea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1B2426" />
            <stop offset="100%" stopColor="#141c1e" />
          </linearGradient>
          <linearGradient id="map-urban" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2f332d" />
            <stop offset="100%" stopColor="#262a24" />
          </linearGradient>
          <radialGradient id="map-light">
            <stop offset="0%" stopColor="#5CE1E6" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#5CE1E6" stopOpacity="0" />
          </radialGradient>
          <filter id="map-soft-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <pattern
            id="city-blocks"
            width="96"
            height="72"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(-8)"
          >
            <rect width="96" height="72" fill="none" />
            <rect x="8" y="8" width="34" height="22" rx="3" fill="#34372f" opacity="0.36" />
            <rect x="51" y="8" width="32" height="22" rx="3" fill="#31342d" opacity="0.3" />
            <rect x="8" y="38" width="23" height="21" rx="3" fill="#32352d" opacity="0.28" />
            <rect x="38" y="38" width="45" height="21" rx="3" fill="#373a32" opacity="0.26" />
          </pattern>
        </defs>

        <rect width="1600" height="900" fill="url(#map-base)" />

        {/* Sea / coast (top) */}
        <rect x="0" y="0" width="1600" height="150" fill="url(#map-sea)" />
        <path
          d="M0 150 Q400 132 800 150 T1600 148"
          fill="none"
          stroke="#3a4a4c"
          strokeOpacity="0.45"
          strokeWidth="1.6"
        />
        {/* Muelle fiscal de Progreso */}
        <rect x="760" y="0" width="80" height="150" fill="#1B2426" opacity="0.55" />
        <path d="M780 150 L780 185" stroke="#52696A" strokeOpacity="0.55" strokeWidth="2" />
        <path d="M820 150 L820 185" stroke="#52696A" strokeOpacity="0.55" strokeWidth="2" />
        <path d="M760 185 L840 185" stroke="#52696A" strokeOpacity="0.4" strokeWidth="1.5" />

        {/* Carretera Federal 261 (vertical center, cyan) */}
        <path
          d="M800 150 L800 820"
          stroke="#5CE1E6"
          strokeOpacity="0.4"
          strokeWidth="3"
        />
        <path
          d="M800 150 L800 820"
          stroke="#8B8D7C"
          strokeOpacity="0.15"
          strokeWidth="1.2"
          strokeDasharray="8 14"
        />

        {/* Secondary road: west to Komchén / Sierra Papacal */}
        <path
          d="M800 340 Q600 320 360 270"
          fill="none"
          stroke="#6B6E60"
          strokeOpacity="0.32"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <path
          d="M800 340 Q600 320 360 270"
          fill="none"
          stroke="#8B8D7C"
          strokeOpacity="0.12"
          strokeWidth="1"
          strokeDasharray="6 10"
        />

        {/* Secondary road: east to Tamanché / Country Club / Polo Norte */}
        <path
          d="M800 470 Q1020 450 1300 410"
          fill="none"
          stroke="#6B6E60"
          strokeOpacity="0.32"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <path
          d="M800 470 Q1020 450 1300 410"
          fill="none"
          stroke="#8B8D7C"
          strokeOpacity="0.12"
          strokeWidth="1"
          strokeDasharray="6 10"
        />

        {/* Anillo Periférico Norte (bottom arc) */}
        <path
          d="M220 760 Q800 610 1380 760"
          fill="none"
          stroke="#66695C"
          strokeOpacity="0.38"
          strokeWidth="22"
          strokeLinecap="round"
        />
        <path
          d="M220 760 Q800 610 1380 760"
          fill="none"
          stroke="#8B8D7C"
          strokeOpacity="0.16"
          strokeWidth="1.2"
          strokeDasharray="6 12"
        />

        {/* Urban mass (north Mérida) */}
        <g transform="translate(420 660)" opacity="0.75">
          <rect width="760" height="150" fill="url(#city-blocks)" opacity="0.6" />
        </g>

        {/* Glow around project pin */}
        <circle cx="832" cy="414" r="120" fill="url(#map-light)" filter="url(#map-soft-glow)" />

        {/* Labels */}
        <g
          fill="#9A9E8C"
          fillOpacity="0.32"
          fontSize="9"
          fontFamily="var(--font-inter)"
          letterSpacing="2.5"
        >
          <text x="800" y="135" textAnchor="middle">GOLFO DE MÉXICO</text>
          <text x="800" y="175" textAnchor="middle">PUERTO PROGRESO</text>
          <text x="1180" y="395">TAMANCHÉ</text>
          <text x="1260" y="425" fontSize="8">COUNTRY CLUB</text>
          <text x="300" y="255">KOMCHÉN</text>
          <text x="300" y="275" fontSize="8">SIERRA PAPACAL</text>
          <text x="800" y="500" textAnchor="middle" fontSize="8">CARR. FED. 261</text>
          <text x="800" y="700" textAnchor="middle">ANILLO PERIFÉRICO NORTE</text>
          <text x="600" y="720" fontSize="8">CABO NORTE</text>
          <text x="800" y="735" fontSize="8">LA ISLA</text>
          <text x="980" y="720" fontSize="8">TEMOZÓN</text>
          <text x="200" y="800" fontSize="8">AEROPUERTO MID</text>
        </g>

        <text
          x="1424"
          y="804"
          textAnchor="end"
          fill="#8EA7A5"
          fillOpacity="0.22"
          fontSize="12"
          letterSpacing="7"
          fontFamily="var(--font-inter)"
        >
          COSTA DE YUCATÁN
        </text>
      </svg>

      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 z-10 h-full w-full"
        aria-hidden="true"
      >
        <path
          d={routePath}
          fill="none"
          stroke="#5CE1E6"
          strokeOpacity="0.12"
          strokeWidth="1.8"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={routePath}
          fill="none"
          stroke="#5CE1E6"
          strokeOpacity="0.75"
          strokeWidth="1.1"
          strokeDasharray="2 2"
          vectorEffect="non-scaling-stroke"
          className="route-line"
        />
      </svg>

      <div
        className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${PROJECT_ORIGIN.x}%`,
          top: `${PROJECT_ORIGIN.y}%`,
        }}
      >
        <div className="flex flex-col items-center gap-1.5">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full border border-viw-accent/45 bg-[#222a25]/90 shadow-[0_0_30px_rgba(92,225,230,0.2)] backdrop-blur-sm">
            <span className="pin-pulse absolute inset-0 rounded-full" />
            <Image
              src="/assets/zpyra-isotipo.svg"
              alt="Zpyra"
              width={18}
              height={18}
              className="relative h-[18px] w-[18px] invert"
            />
          </div>
          <span className="whitespace-nowrap rounded-full border border-viw-accent/20 bg-[#20241f]/90 px-2.5 py-1 text-[7px] font-medium uppercase tracking-[0.14em] text-viw-accent/80 backdrop-blur-md">
            ZPYRA · 21°08&#39;38.0&quot;N 89°38&#39;54.1&quot;W
          </span>
        </div>
      </div>

      {project.pois.map((poi) => {
        const meta = CATEGORY_META[poi.category];
        const Icon = meta.icon;
        const isActive = poi.id === selectedPoi.id;

        return (
          <button
            key={poi.id}
            type="button"
            onClick={() => onSelect(poi.id)}
            aria-pressed={isActive}
            style={{
              left: `${poi.mapPosition.x}%`,
              top: `${poi.mapPosition.y}%`,
            }}
            className="group absolute z-20 -translate-x-1/2 -translate-y-1/2"
            aria-label={`${poi.name}, ${poi.distanceKm} kilómetros`}
          >
            <span
              className={`relative flex h-8 w-8 items-center justify-center rounded-full border shadow-lg backdrop-blur-md transition-all duration-300 ${
                isActive
                  ? "scale-110 border-viw-accent/60 bg-[#24302b]"
                  : "border-white/16 bg-[#202420]/82 group-hover:scale-110 group-hover:border-white/30"
              }`}
              style={
                isActive
                  ? { boxShadow: `0 0 24px ${meta.color}35` }
                  : undefined
              }
            >
              {isActive ? (
                <span className="pin-pulse absolute inset-0 rounded-full" />
              ) : null}
              <Icon
                className="relative h-3.5 w-3.5"
                style={{ color: isActive ? meta.color : "rgba(238,244,244,0.58)" }}
              />
            </span>
            <span
              className={`absolute left-[calc(100%+7px)] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border px-2 py-1.5 text-[7px] font-medium transition-all sm:flex ${
                isActive
                  ? "border-white/14 bg-[#202420]/92 text-white/78"
                  : "hidden border-transparent text-white/0 group-hover:border-white/10 group-hover:bg-[#202420]/85 group-hover:text-white/65"
              }`}
            >
              {poi.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}

