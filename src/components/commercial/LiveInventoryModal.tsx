"use client";

import {
  Database,
  Eye,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { Unit, UnitStatus } from "@/types/viw.types";

interface LiveInventoryModalProps {
  units: Unit[];
  onStatusChange: (unitId: string, status: UnitStatus) => void;
  onPriceChange?: (unitId: string, priceUsd: number) => void;
  onReset: () => void;
  forceOpen?: number;
}

const STATUS_OPTIONS: {
  id: UnitStatus;
  label: string;
  color: string;
  className: string;
}[] = [
  {
    id: "available",
    label: "Disponible",
    color: "#5CE1E6",
    className:
      "border-[#5CE1E6]/30 bg-[#5CE1E6]/12 text-[#8BEFF2] shadow-[0_0_18px_rgba(92,225,230,0.08)]",
  },
  {
    id: "reserved",
    label: "Reservado",
    color: "#F59E0B",
    className:
      "border-[#F59E0B]/30 bg-[#F59E0B]/12 text-[#FCD38D] shadow-[0_0_18px_rgba(245,158,11,0.06)]",
  },
  {
    id: "sold",
    label: "Vendido",
    color: "#EF4444",
    className:
      "border-[#EF4444]/30 bg-[#EF4444]/12 text-[#FCA5A5] shadow-[0_0_18px_rgba(239,68,68,0.06)]",
  },
];

export default function LiveInventoryModal({
  units,
  onStatusChange,
  onPriceChange,
  onReset,
  forceOpen,
}: LiveInventoryModalProps) {
  const [open, setOpen] = useState(false);
  const [levelFilter, setLevelFilter] = useState<number | null>(null);

  const filteredUnits = useMemo(
    () =>
      levelFilter === null
        ? units
        : units.filter((unit) => unit.floor === levelFilter),
    [units, levelFilter],
  );

  const counts = useMemo(
    () => ({
      available: units.filter((unit) => unit.status === "available").length,
      reserved: units.filter((unit) => unit.status === "reserved").length,
      sold: units.filter((unit) => unit.status === "sold").length,
    }),
    [units],
  );

  useEffect(() => {
    if (!open) return;

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [open]);

  useEffect(() => {
    if (forceOpen) {
      /* eslint-disable-next-line react-hooks/set-state-in-effect */
      setOpen(true);
    }
  }, [forceOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="viw-glass-soft group fixed bottom-[88px] right-3 z-30 flex h-9 items-center gap-1.5 rounded-full px-3 text-[8px] font-medium uppercase tracking-[0.12em] text-viw-text/38 transition-all hover:border-viw-accent/25 hover:text-viw-text/75 md:bottom-5 md:right-5 md:h-10 md:px-3.5"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <LockKeyhole className="h-3 w-3 text-viw-text/30 transition-colors group-hover:text-viw-accent/70" />
        <span className="hidden sm:inline">Panel viw Admin</span>
        <span className="sm:hidden">Admin</span>
        <span className="relative ml-0.5 flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-viw-accent opacity-30" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-viw-accent/70" />
        </span>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-3 backdrop-blur-[7px] animate-fade-in sm:p-5"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="inventory-admin-title"
            onClick={(event) => event.stopPropagation()}
            className="viw-glass relative flex max-h-[88dvh] w-full max-w-[760px] flex-col overflow-hidden rounded-[24px] bg-[#242321]/75 animate-modal-in sm:rounded-[28px]"
          >
            <div className="flex items-start justify-between gap-4 border-b border-viw-text/10 px-4 py-4 sm:px-6 sm:py-5">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-viw-accent/18 bg-viw-accent/[0.07] text-viw-accent/80">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-display text-[15px] font-medium tracking-[-0.03em] text-viw-text/90">
                      Panel viw Admin
                    </p>
                    <span className="flex items-center gap-1 rounded-full border border-viw-accent/20 bg-viw-accent/[0.08] px-1.5 py-0.5 text-[7px] font-medium uppercase tracking-[0.1em] text-viw-accent/75">
                      <span className="h-1 w-1 rounded-full bg-viw-accent" />
                      Live
                    </span>
                  </div>
                  <p className="mt-1 text-[10px] text-viw-text/32">
                    Modo demostración comercial · cambios de inventario en
                    tiempo real.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-viw-text/10 text-viw-text/40 transition-colors hover:bg-viw-text/10 hover:text-viw-text"
                aria-label="Cerrar panel de inventario"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 border-b border-viw-text/10 bg-black/10 px-4 py-3 sm:px-6">
              <div className="flex items-center gap-4 sm:gap-6">
                <CountMetric
                  label="Disponibles"
                  value={counts.available}
                  color="#5CE1E6"
                />
                <CountMetric
                  label="Reservadas"
                  value={counts.reserved}
                  color="#F59E0B"
                />
                <CountMetric label="Vendidas" value={counts.sold} color="#EF4444" />
              </div>
              <div className="hidden items-center gap-1.5 text-[8px] uppercase tracking-[0.12em] text-viw-text/22 sm:flex">
                <Database className="h-3 w-3" />
                {units.length} registros
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4">
              <div className="mb-3 flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setLevelFilter(null)}
                  className={`rounded-full border px-2.5 py-1 text-[8px] font-medium uppercase tracking-[0.12em] transition-all ${
                    levelFilter === null
                      ? "border-viw-accent/40 bg-viw-accent/15 text-viw-accent"
                      : "border-viw-text/10 text-viw-text/40 hover:text-viw-text/70"
                  }`}
                >
                  Todos
                </button>
                {[14, 15, 16, 17].map((floor) => (
                  <button
                    key={floor}
                    type="button"
                    onClick={() => setLevelFilter(floor)}
                    className={`rounded-full border px-2.5 py-1 text-[8px] font-medium uppercase tracking-[0.12em] transition-all ${
                      levelFilter === floor
                        ? "border-viw-accent/40 bg-viw-accent/15 text-viw-accent"
                        : "border-viw-text/10 text-viw-text/40 hover:text-viw-text/70"
                    }`}
                  >
                    Nivel {floor}
                  </button>
                ))}
              </div>
              <div className="flex flex-col gap-1.5">
                {filteredUnits.map((unit) => (
                  <div
                    key={unit.id}
                    className="flex flex-col gap-2.5 rounded-[14px] border border-viw-text/[0.08] bg-viw-text/[0.025] p-3 transition-colors hover:bg-viw-text/[0.04] sm:flex-row sm:items-center sm:gap-3"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-viw-text/10 bg-black/20 font-display text-[8px] font-medium text-viw-text/45">
                        {unit.floor}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-[11px] font-medium text-viw-text/80">
                            {unit.code}
                          </p>
                          <span
                            className="hidden text-[8px] uppercase tracking-[0.08em] sm:inline"
                            style={{
                              color:
                                STATUS_OPTIONS.find(
                                  (option) => option.id === unit.status,
                                )?.color ?? "#EEF4F4",
                            }}
                          >
                            {STATUS_OPTIONS.find(
                              (option) => option.id === unit.status,
                            )?.label ?? unit.status}
                          </span>
                        </div>
                        <div className="mt-0.5 flex items-center gap-1.5 text-[9px] text-viw-text/30">
                          <span className="truncate">{unit.name}</span>
                          <span>·</span>
                          <input
                            type="number"
                            defaultValue={unit.priceUsd}
                            onBlur={(event) => {
                              const value = Number(event.target.value);
                              if (Number.isFinite(value) && value > 0) {
                                onPriceChange?.(unit.id, value);
                              }
                            }}
                            className="w-[74px] rounded border border-viw-text/10 bg-black/20 px-1 py-0.5 text-[9px] text-viw-text/60 outline-none focus:border-viw-accent/40"
                            aria-label={`Precio de ${unit.code}`}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid w-full shrink-0 grid-cols-3 gap-1 rounded-xl border border-viw-text/[0.08] bg-black/15 p-0.5 sm:w-[266px]">
                      {STATUS_OPTIONS.map((option) => {
                        const isActive = unit.status === option.id;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => onStatusChange(unit.id, option.id)}
                            aria-pressed={isActive}
                            className={`flex h-7 items-center justify-center gap-1 rounded-[9px] border px-1 text-[8px] font-medium transition-all ${
                              isActive
                                ? option.className
                                : "border-transparent text-viw-text/28 hover:bg-viw-text/[0.05] hover:text-viw-text/55"
                            }`}
                          >
                            <span
                              className="h-1 w-1 rounded-full"
                              style={{ backgroundColor: option.color }}
                            />
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-start justify-between gap-3 border-t border-viw-text/10 px-4 py-3.5 sm:flex-row sm:items-center sm:px-6">
              <p className="flex items-center gap-1.5 text-[8px] text-viw-text/25">
                <Eye className="h-3 w-3" />
                Torre, buscador y tarjetas se actualizan al instante.
              </p>
              <div className="flex w-full items-center gap-2 sm:w-auto">
                <button
                  type="button"
                  onClick={onReset}
                  className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg border border-viw-text/10 px-3 text-[8px] font-medium text-viw-text/35 transition-colors hover:border-viw-text/20 hover:text-viw-text/65 sm:flex-none"
                >
                  <RotateCcw className="h-3 w-3" />
                  Restaurar demo
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex h-8 flex-1 items-center justify-center rounded-lg bg-viw-text px-4 text-[8px] font-semibold text-viw-base transition-colors hover:bg-viw-accent sm:flex-none"
                >
                  Listo
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function CountMetric({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span
        className="font-display text-[15px] font-medium tabular-nums tracking-[-0.03em]"
        style={{ color }}
      >
        {value.toString().padStart(2, "0")}
      </span>
      <span className="text-[8px] uppercase tracking-[0.08em] text-viw-text/28">
        {label}
      </span>
    </div>
  );
}
