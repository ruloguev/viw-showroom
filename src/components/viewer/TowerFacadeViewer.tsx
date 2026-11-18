"use client";

import {
  Moon,
  MousePointer2,
  Sun,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import UnitPreviewCard from "@/components/commercial/UnitPreviewCard";
import type {
  ProjectData,
  Unit,
  UnitFilter,
  UnitStatus,
} from "@/types/viw.types";

interface TowerFacadeViewerProps {
  project: ProjectData;
  units: Unit[];
  filter: UnitFilter;
  onOpenUnit: (unit: Unit) => void;
  onOpenFloorplan?: (floor: number) => void;
}

const STATUS_COLOR: Record<UnitStatus, string> = {
  available: "#5CE1E6",
  reserved: "#F59E0B",
  sold: "#EF4444",
};

export default function TowerFacadeViewer({
  project,
  units,
  filter,
  onOpenUnit,
  onOpenFloorplan,
}: TowerFacadeViewerProps) {
  const [mode, setMode] = useState<"day" | "night">("day");
  const [hoveredUnitId, setHoveredUnitId] = useState<string | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  const counts = useMemo(
    () => ({
      available: units.filter((unit) => unit.status === "available").length,
      reserved: units.filter((unit) => unit.status === "reserved").length,
      sold: units.filter((unit) => unit.status === "sold").length,
    }),
    [units],
  );

  const floors = useMemo(() => {
    const map = new Map<number, Unit[]>();
    for (const unit of units) {
      if (!map.has(unit.floor)) map.set(unit.floor, []);
      map.get(unit.floor)!.push(unit);
    }
    return [...map.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([floor, floorUnits]) => {
        const xs: number[] = [];
        const ys: number[] = [];
        for (const unit of floorUnits) {
          const pts = unit.facade.points
            .trim()
            .split(/\s+/)
            .map((point) => point.split(",").map(Number));
          for (const [x, y] of pts) {
            xs.push(x);
            ys.push(y);
          }
        }
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);
        const available = floorUnits.filter(
          (unit) => unit.status === "available",
        ).length;
        const statusColor =
          available > 0
            ? STATUS_COLOR.available
            : floorUnits.some((unit) => unit.status === "reserved")
              ? STATUS_COLOR.reserved
              : STATUS_COLOR.sold;
        return {
          floor,
          units: floorUnits,
          available,
          total: floorUnits.length,
          statusColor,
          facade: {
            points: `${minX},${minY} ${maxX},${minY} ${maxX},${maxY} ${minX},${maxY}`,
            labelX: (minX + maxX) / 2,
            labelY: (minY + maxY) / 2,
          },
        };
      });
  }, [units]);

  function openFloor(floor: number) {
    const floorData = floors.find((item) => item.floor === floor);
    const representative =
      floorData?.units.find((unit) => unit.status === "available") ??
      floorData?.units[0] ??
      null;
    if (onOpenFloorplan) {
      onOpenFloorplan(floor);
      return;
    }
    if (representative && matchesFilter(representative)) {
      setSelectedUnitId(representative.id);
      setHoveredUnitId(null);
    }
  }

  const previewUnit =
    units.find((unit) => unit.id === (hoveredUnitId ?? selectedUnitId)) ?? null;
  const previewIsVisible =
    previewUnit !== null &&
    (filter === "all" || previewUnit.status === "available");

  function matchesFilter(unit: Unit) {
    return filter === "all" || unit.status === "available";
  }

  return (
    <section
      className="relative h-full w-full overflow-hidden bg-[#1b1c19]"
      aria-label="Fachada interactiva de la torre Zpyra"
    >
      <div className="absolute inset-0">
        <Image
          src={project.images.day}
          alt="Fachada de la torre Zpyra durante el día"
          fill
          priority
          sizes="100vw"
          className={`object-cover object-[37.5%_50%] transition-opacity duration-[1100ms] ease-out md:object-[50%_50%] ${
            mode === "day" ? "opacity-100" : "opacity-0"
          }`}
        />
        <Image
          src={project.images.night}
          alt="Fachada de la torre Zpyra durante la noche"
          fill
          priority
          sizes="100vw"
          className={`object-cover object-[37.5%_50%] transition-opacity duration-[1100ms] ease-out md:object-[50%_50%] ${
            mode === "night" ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>

      <div
        className={`pointer-events-none absolute inset-0 transition-colors duration-1000 ${
          mode === "day" ? "bg-[#22231f]/10" : "bg-[#111311]/25"
        }`}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#171815]/72 via-[#171815]/18 to-[#171815]/15" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#171815]/80 via-transparent to-[#171815]/38" />
      <div className="pointer-events-none absolute inset-0 bg-viw-grid opacity-[0.09]" />

      <div className="absolute left-4 top-[91px] z-20 max-w-[62%] text-shadow-soft md:left-[104px] md:top-[112px] lg:left-[116px] lg:top-[122px] lg:max-w-[460px]">
        <div className="flex items-center gap-2">
          <span className="h-px w-5 bg-viw-accent/70" />
          <p className="text-[8px] font-medium uppercase tracking-[0.22em] text-viw-text/55">
            Vista 02 · Fachada interactiva
          </p>
        </div>

        <h1 className="mt-3 max-w-[360px] font-display text-[clamp(2.1rem,4vw,3.8rem)] font-medium leading-[0.95] tracking-[-0.06em] text-white/95">
          La torre,
          <br />
          <span className="text-white/45">de cerca.</span>
        </h1>

        <p className="mt-3 hidden max-w-[300px] text-[10px] leading-[1.7] text-white/38 sm:block">
          Dieciséis residencias de autor en los niveles 14 a 17. Pasa el cursor o
          toca una ventana para descubrir su residencia.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/15 px-2 py-1 text-[7px] font-medium uppercase tracking-[0.1em] text-white/38 backdrop-blur-sm">
            <Sparkles className="h-2.5 w-2.5 text-viw-accent/60" />
            {filter === "available"
              ? `${counts.available} disponibles`
              : `${units.length} residencias`}
          </span>
          <div className="flex items-center gap-2.5">
            <LegendDot color="#5CE1E6" label={`${counts.available}`} />
            <LegendDot color="#F59E0B" label={`${counts.reserved}`} />
            <LegendDot color="#EF4444" label={`${counts.sold}`} />
          </div>
        </div>
      </div>

      <div className="absolute right-3 top-[88px] z-30 md:right-5 md:top-[112px]">
        <div className="viw-glass flex items-center rounded-full p-1">
          <button
            type="button"
            onClick={() => setMode("day")}
            aria-pressed={mode === "day"}
            className={`flex h-8 items-center gap-1.5 rounded-full px-2.5 text-[8px] font-medium transition-all md:px-3 ${
              mode === "day"
                ? "bg-viw-text text-viw-base"
                : "text-viw-text/45 hover:text-viw-text/80"
            }`}
            aria-label="Ver fachada de día"
          >
            <Sun className="h-3 w-3" />
            <span className="hidden sm:inline">Día</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("night")}
            aria-pressed={mode === "night"}
            className={`flex h-8 items-center gap-1.5 rounded-full px-2.5 text-[8px] font-medium transition-all md:px-3 ${
              mode === "night"
                ? "bg-viw-text text-viw-base"
                : "text-viw-text/45 hover:text-viw-text/80"
            }`}
            aria-label="Ver fachada de noche"
          >
            <Moon className="h-3 w-3" />
            <span className="hidden sm:inline">Noche</span>
          </button>
        </div>
      </div>

      {[
        {
          viewBox: "0 0 1600 900",
          glowId: "facade-glow-desktop",
          visibility: "hidden md:block",
        },
        {
          viewBox: "400 0 500 900",
          glowId: "facade-glow-mobile",
          visibility: "md:hidden",
        },
      ].map((overlay) => (
        <svg
          key={overlay.glowId}
          viewBox={overlay.viewBox}
          preserveAspectRatio="xMidYMid slice"
          className={`pointer-events-none absolute inset-0 z-20 h-full w-full ${overlay.visibility}`}
          aria-label="Plano interactivo de residencias sobre la fachada"
          role="group"
        >
        <defs>
          <filter id={overlay.glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {floors.map((floorData) => {
          const enabled =
            filter === "all" ||
            floorData.units.some((unit) => unit.status === "available");
          const isActive =
            floorData.units.some(
              (unit) =>
                unit.id === hoveredUnitId || unit.id === selectedUnitId,
            );
          const statusColor = floorData.statusColor;
          const shortLabel = `N${floorData.floor}`;

          return (
            <g
              key={floorData.floor}
              role="button"
              tabIndex={enabled ? 0 : -1}
              aria-label={`Nivel ${floorData.floor}, ${floorData.available} de ${floorData.total} Disponibles.`}
              aria-pressed={isActive}
              onPointerEnter={() => {
                if (enabled) {
                  const rep =
                    floorData.units.find((unit) => unit.status === "available") ??
                    floorData.units[0];
                  if (rep) setHoveredUnitId(rep.id);
                }
              }}
              onPointerLeave={() => setHoveredUnitId(null)}
              onFocus={() => {
                if (enabled) {
                  const rep =
                    floorData.units.find((unit) => unit.status === "available") ??
                    floorData.units[0];
                  if (rep) setHoveredUnitId(rep.id);
                }
              }}
              onBlur={() => setHoveredUnitId(null)}
              onClick={() => openFloor(floorData.floor)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openFloor(floorData.floor);
                }
              }}
              style={{
                opacity: enabled ? 1 : 0.12,
                pointerEvents: enabled ? "auto" : "none",
                transition: "opacity 300ms ease",
              }}
              className="cursor-pointer outline-none"
            >
              <polygon
                points={floorData.facade.points}
                fill={statusColor}
                fillOpacity={isActive ? 0.3 : 0.12}
                stroke={statusColor}
                strokeOpacity={isActive ? 1 : 0.72}
                strokeWidth={isActive ? 2.6 : 1.4}
                vectorEffect="non-scaling-stroke"
                className="unit-polygon"
                filter={isActive ? `url(#${overlay.glowId})` : undefined}
              />

              <g style={{ pointerEvents: "none" }}>
                <rect
                  x={floorData.facade.labelX - 40}
                  y={floorData.facade.labelY - 10}
                  width={80}
                  height={20}
                  rx={10}
                  fill="#131816"
                  fillOpacity={isActive ? 0.9 : 0.74}
                  stroke={statusColor}
                  strokeOpacity={isActive ? 0.7 : 0.32}
                  strokeWidth={0.8}
                  style={{ transition: "fill-opacity 200ms ease" }}
                />
                <circle
                  cx={floorData.facade.labelX - 28}
                  cy={floorData.facade.labelY}
                  r={2.2}
                  fill={statusColor}
                />
                <text
                  x={floorData.facade.labelX - 6}
                  y={floorData.facade.labelY + 3.4}
                  textAnchor="middle"
                  fill={isActive ? "#FFFFFF" : "#E7EFEE"}
                  fontFamily="var(--font-poppins)"
                  fontSize={isActive ? 10.5 : 9.5}
                  fontWeight={600}
                  letterSpacing="-0.2"
                  style={{ transition: "font-size 200ms ease" }}
                >
                  {shortLabel} · {floorData.available}/{floorData.total}
                </text>
              </g>
            </g>
          );
        })}
        </svg>
      ))}

      <div className="absolute bottom-[84px] left-3 right-3 z-30 md:bottom-6 md:right-auto md:left-[104px] md:w-[300px] lg:left-[116px]">
        {previewIsVisible ? (
          <UnitPreviewCard
            unit={previewUnit}
            onOpen={onOpenUnit}
            onClose={() => {
              setSelectedUnitId(null);
              setHoveredUnitId(null);
            }}
            className="animate-panel-in"
          />
        ) : (
          <div className="viw-glass hidden items-center gap-3 rounded-2xl p-3.5 md:flex">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-viw-text/10 bg-white/[0.035]">
              <MousePointer2 className="h-4 w-4 stroke-[1.25] text-viw-text/40" />
            </span>
            <div>
              <p className="font-display text-[11px] font-medium tracking-[-0.02em] text-viw-text/70">
                Explora la fachada
              </p>
              <p className="mt-0.5 text-[9px] leading-relaxed text-viw-text/30">
                Selecciona una residencia para ver su ficha.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-7 right-5 z-20 hidden flex-col items-end gap-2 md:flex">
        <button
          type="button"
          onClick={() => setMode((current) => (current === "day" ? "night" : "day"))}
          className="flex items-center gap-2 text-[7px] font-medium uppercase tracking-[0.16em] text-white/25 transition-colors hover:text-white/55"
        >
          <span className="h-px w-8 bg-white/15" />
          Cambiar a {mode === "day" ? "noche" : "día"}
        </button>
        <p className="text-[7px] font-medium uppercase tracking-[0.16em] text-white/18">
          {project.name} · {mode === "day" ? "Daylight study" : "Nocturne study"}
        </p>
      </div>

      <p className="sr-only" aria-live="polite">
        {selectedUnitId
          ? `Residencia ${
              units.find((unit) => unit.id === selectedUnitId)?.code ?? ""
            } seleccionada.`
          : ""}
      </p>
    </section>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1 text-[7px] font-medium text-white/35">
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}
