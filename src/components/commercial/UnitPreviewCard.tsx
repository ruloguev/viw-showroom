"use client";

import {
  ArrowUpRight,
  Bath,
  BedDouble,
  Car,
  Eye,
  Maximize2,
  X,
} from "lucide-react";
import Image from "next/image";
import { formatUSD } from "@/lib/utils";
import type { Unit, UnitStatus } from "@/types/viw.types";

const STATUS_META: Record<
  UnitStatus,
  { label: string; color: string; pill: string; dot: string }
> = {
  available: {
    label: "Disponible",
    color: "#5CE1E6",
    pill: "border-[#5CE1E6]/25 bg-[#5CE1E6]/10 text-[#8BEFF2]",
    dot: "bg-[#5CE1E6]",
  },
  reserved: {
    label: "Reservado",
    color: "#F59E0B",
    pill: "border-[#F59E0B]/25 bg-[#F59E0B]/10 text-[#FCD38D]",
    dot: "bg-[#F59E0B]",
  },
  sold: {
    label: "Vendido",
    color: "#EF4444",
    pill: "border-[#EF4444]/25 bg-[#EF4444]/10 text-[#FCA5A5]",
    dot: "bg-[#EF4444]",
  },
};

interface UnitPreviewCardProps {
  unit: Unit;
  variant?: "floating" | "gallery";
  imageSrc?: string;
  onOpen?: (unit: Unit) => void;
  onClose?: () => void;
  className?: string;
}

export default function UnitPreviewCard({
  unit,
  variant = "floating",
  imageSrc,
  onOpen,
  onClose,
  className = "",
}: UnitPreviewCardProps) {
  const status = STATUS_META[unit.status];

  if (variant === "gallery") {
    return (
      <article
        className={`group relative overflow-hidden rounded-[22px] border border-viw-text/12 bg-[#242321]/78 transition-all duration-500 hover:-translate-y-1 hover:border-viw-text/24 hover:bg-[#242321] ${className}`}
      >
        <div className="relative aspect-[16/9] overflow-hidden">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={`Interior de ${unit.name}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]"
            />
          ) : (
            <div className="h-full w-full bg-[radial-gradient(circle_at_30%_20%,rgba(92,225,230,0.12),transparent_60%),linear-gradient(135deg,#2d302b,#191b18)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#181816]/90 via-[#181816]/10 to-transparent" />
          <div className="absolute left-3 top-3 flex items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[8px] font-medium uppercase tracking-[0.12em] backdrop-blur-md ${status.pill}`}
            >
              <span className={`h-1 w-1 rounded-full ${status.dot}`} />
              {status.label}
            </span>
          </div>
          <span className="absolute right-3 top-3 rounded-full border border-white/10 bg-black/25 px-2 py-1 text-[8px] font-medium uppercase tracking-[0.12em] text-white/60 backdrop-blur-md">
            Nivel {unit.floor}
          </span>
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4">
            <div>
              <p className="text-[8px] font-medium uppercase tracking-[0.18em] text-white/45">
                {unit.model}
              </p>
              <h3 className="mt-1 font-display text-xl font-medium tracking-[-0.045em] text-white">
                {unit.name}
              </h3>
            </div>
            <span className="font-display text-[10px] font-medium tracking-[0.02em] text-white/60">
              {unit.code}
            </span>
          </div>
        </div>

        <div className="p-4 pt-3.5">
          <div className="flex items-center gap-3 text-[10px] text-viw-text/50">
            <span className="flex items-center gap-1">
              <Maximize2 className="h-3 w-3 text-viw-text/30" />
              {unit.areaM2} m²
            </span>
            <span className="flex items-center gap-1">
              <BedDouble className="h-3 w-3 text-viw-text/30" />
              {unit.bedrooms}
            </span>
            <span className="flex items-center gap-1">
              <Bath className="h-3 w-3 text-viw-text/30" />
              {unit.bathrooms}
            </span>
            <span className="flex items-center gap-1">
              <Car className="h-3 w-3 text-viw-text/30" />
              {unit.parkingSpots}
            </span>
          </div>

          <div className="mt-3.5 flex items-end justify-between border-t border-viw-text/10 pt-3.5">
            <div>
              <p className="text-[8px] uppercase tracking-[0.14em] text-viw-text/32">
                Desde
              </p>
              <p className="mt-1 font-display text-[15px] font-medium tracking-[-0.02em] text-viw-text/90">
                {formatUSD(unit.priceUsd)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpen?.(unit)}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-viw-text/12 bg-white/[0.045] px-3 text-[9px] font-medium text-viw-text/75 transition-all hover:border-viw-accent/30 hover:bg-viw-accent/10 hover:text-viw-accent"
              aria-label={`Ver ficha de ${unit.name}`}
            >
              Ver ficha
              <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      className={`viw-glass relative w-full overflow-hidden rounded-[20px] p-3.5 ${className}`}
    >
      <span
        className="absolute inset-x-0 top-0 h-px opacity-70"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${status.color} 50%, transparent 100%)`,
        }}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[8px] font-medium uppercase tracking-[0.1em] ${status.pill}`}
          >
            <span className={`h-1 w-1 rounded-full ${status.dot}`} />
            {status.label}
          </span>
          <span className="text-[8px] font-medium uppercase tracking-[0.13em] text-viw-text/30">
            Nivel {unit.floor}
          </span>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="-mr-1 -mt-1 flex h-6 w-6 items-center justify-center rounded-full text-viw-text/35 transition-colors hover:bg-viw-text/10 hover:text-viw-text"
            aria-label="Cerrar vista rápida"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="viw-eyebrow">{unit.model}</p>
          <h3 className="mt-1 truncate font-display text-[21px] font-medium tracking-[-0.045em] text-viw-text">
            {unit.name}
          </h3>
        </div>
        <span className="shrink-0 font-display text-[10px] font-medium tracking-[0.03em] text-viw-text/35">
          {unit.code}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2 text-[9px] text-viw-text/46">
        <span className="flex items-center gap-1">
          <Eye className="h-3 w-3 text-viw-text/25" />
          {unit.view}
        </span>
        <span className="h-2.5 w-px bg-viw-text/10" />
        <span>{unit.orientation}</span>
      </div>

      <div className="mt-3 grid grid-cols-3 divide-x divide-viw-text/10 rounded-xl border border-viw-text/10 bg-black/10 py-2.5">
        <Metric icon={<Maximize2 className="h-3 w-3" />} value={`${unit.areaM2} m²`} />
        <Metric
          icon={<BedDouble className="h-3 w-3" />}
          value={`${unit.bedrooms} rec.`}
        />
        <Metric icon={<Bath className="h-3 w-3" />} value={`${unit.bathrooms} baños`} />
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-[7px] uppercase tracking-[0.16em] text-viw-text/30">
            Precio de venta
          </p>
          <p className="mt-0.5 font-display text-[14px] font-medium tracking-[-0.02em] text-viw-text/90">
            {formatUSD(unit.priceUsd)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onOpen?.(unit)}
          className="flex h-9 items-center gap-1.5 rounded-xl bg-viw-text px-3.5 text-[9px] font-semibold text-viw-base transition-all hover:bg-viw-accent"
        >
          Ver ficha
          <ArrowUpRight className="h-3 w-3" />
        </button>
      </div>
    </article>
  );
}

function Metric({
  icon,
  value,
}: {
  icon: React.ReactNode;
  value: string;
}) {
  return (
    <span className="flex items-center justify-center gap-1 text-[8px] tabular-nums text-viw-text/55">
      <span className="text-viw-text/25">{icon}</span>
      {value}
    </span>
  );
}
