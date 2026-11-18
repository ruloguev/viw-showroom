"use client";

import {
  ArrowUpRight,
  ChevronRight,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatUSD } from "@/lib/utils";
import type { ProjectData, Unit, UnitFilter, UnitStatus } from "@/types/viw.types";

interface TopNavbarProps {
  project: ProjectData;
  units: Unit[];
  filter: UnitFilter;
  query: string;
  onFilterChange: (filter: UnitFilter) => void;
  onQueryChange: (query: string) => void;
  onSelectUnit: (unit: Unit) => void;
  onOpenLaunch?: () => void;
}

const statusDot: Record<UnitStatus, string> = {
  available: "bg-status-available",
  reserved: "bg-status-reserved",
  sold: "bg-status-sold",
};

export default function TopNavbar({
  project,
  units,
  filter,
  query,
  onFilterChange,
  onQueryChange,
  onSelectUnit,
  onOpenLaunch,
}: TopNavbarProps) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const availableUnits = useMemo(
    () => units.filter((unit) => unit.status === "available"),
    [units],
  );

  const searchPool = filter === "available" ? availableUnits : units;
  const normalizedQuery = query.trim().toLocaleLowerCase("es");
  const results = useMemo(() => {
    if (!normalizedQuery) return [];

    return searchPool
      .filter((unit) =>
        [unit.code, unit.name, unit.model, `nivel ${unit.floor}`]
          .join(" ")
          .toLocaleLowerCase("es")
          .includes(normalizedQuery),
      )
      .slice(0, 5);
  }, [normalizedQuery, searchPool]);

  useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (window.innerWidth < 768) {
          setMobileSearchOpen(true);
        } else {
          desktopInputRef.current?.focus();
        }
      }

      if (event.key === "Escape" && !isTyping) {
        setMobileSearchOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, []);

  function selectUnit(unit: Unit) {
    onSelectUnit(unit);
    onQueryChange("");
    setMobileSearchOpen(false);
  }

  function handleSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && results[0]) {
      selectUnit(results[0]);
    }
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-4 md:pt-4">
      <div className="mx-auto flex h-14 w-full max-w-[1640px] items-center gap-2 rounded-[20px] border border-[#EEF4F4]/14 bg-[#242321]/58 px-3 backdrop-blur-2xl shadow-[0_18px_60px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.07)] transition-colors md:h-16 md:gap-3 md:rounded-[22px] md:px-4">
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2.5 rounded-xl focus-visible:outline-offset-[6px]"
          aria-label="viw · Inicio"
        >
          <span className="relative flex h-8 w-8 items-center justify-center rounded-[10px] border border-viw-accent/30 bg-viw-accent/10 md:h-9 md:w-9">
            <svg
              viewBox="0 0 28 28"
              className="h-[17px] w-[17px] text-viw-text"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M4 8.5 8.4 20 12 10.7 15.6 20 20 8.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="22.4" cy="7.3" r="1.7" fill="#5CE1E6" />
            </svg>
          </span>
          <span className="flex min-w-0 flex-col leading-none">
            <span className="flex items-baseline gap-1.5">
              <span className="font-display text-[21px] font-semibold tracking-[-0.06em] text-viw-text md:text-[23px]">
                viw
              </span>
              <span className="hidden text-[8px] font-medium uppercase tracking-[0.16em] text-viw-text/40 sm:inline">
                by Ultea
              </span>
            </span>
            <span className="mt-1 hidden text-[7px] font-medium uppercase tracking-[0.22em] text-viw-text/38 md:block">
              Interactive showroom
            </span>
          </span>
        </Link>

        <div className="mx-0.5 hidden h-7 w-px bg-viw-text/10 sm:block" />

        <div className="hidden min-w-0 items-center gap-2 sm:flex">
          <Image
            src="/assets/zpyra-isotipo.svg"
            alt="Isotipo Zpyra"
            width={20}
            height={20}
            className="h-5 w-5 shrink-0 opacity-85 invert"
          />
          <span className="max-w-[120px] truncate font-display text-[13px] font-medium tracking-[-0.02em] text-viw-text/90">
            {project.name}
          </span>
          <span className="rounded-[6px] border border-viw-text/10 bg-viw-text/[0.045] px-1.5 py-0.5 text-[8px] font-medium uppercase tracking-[0.13em] text-viw-text/45">
            Demo
          </span>
          <span className="viw-glass-soft rounded-full px-2 py-0.5 text-[7px] font-medium uppercase tracking-[0.14em] text-viw-accent/75">
            Demo conceptual
          </span>
        </div>

        <div className="ml-auto flex min-w-0 items-center justify-end gap-1.5 md:gap-2">
          <div className="relative hidden w-[188px] md:block xl:w-[270px]">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-viw-text/38"
            />
            <label htmlFor="unit-search" className="sr-only">
              Buscar unidades
            </label>
            <input
              ref={desktopInputRef}
              id="unit-search"
              type="text"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Buscar unidad..."
              autoComplete="off"
              className="h-9 w-full rounded-xl border border-viw-text/10 bg-black/15 pl-8 pr-14 text-[11px] text-viw-text outline-none transition-colors placeholder:text-viw-text/28 hover:border-viw-text/20 focus:border-viw-accent/50 focus:bg-black/25"
            />
            {query ? (
              <button
                type="button"
                onClick={() => onQueryChange("")}
                className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-viw-text/45 transition-colors hover:bg-viw-text/10 hover:text-viw-text"
                aria-label="Limpiar búsqueda"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : (
              <span className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded border border-viw-text/10 px-1 py-0.5 text-[8px] font-medium text-viw-text/28 xl:flex">
                ⌘ K
              </span>
            )}

            {query.trim() ? (
              <div className="viw-glass absolute left-0 right-0 top-[calc(100%+10px)] z-50 overflow-hidden rounded-2xl p-1.5 animate-panel-in">
                <div className="flex items-center justify-between px-2 pb-1.5 pt-1">
                  <span className="viw-eyebrow">Resultados</span>
                  <span className="text-[9px] text-viw-text/35">
                    {results.length} de {searchPool.length}
                  </span>
                </div>
                <SearchResults
                  results={results}
                  onSelect={selectUnit}
                  compact
                />
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => setMobileSearchOpen((open) => !open)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-viw-text/10 bg-black/10 text-viw-text/65 transition-colors hover:border-viw-text/20 hover:text-viw-text md:hidden"
            aria-label={mobileSearchOpen ? "Cerrar buscador" : "Buscar unidades"}
            aria-expanded={mobileSearchOpen}
          >
            {mobileSearchOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </button>

          <div
            role="group"
            aria-label="Filtrar inventario"
            className="flex h-9 shrink-0 items-center rounded-xl border border-viw-text/10 bg-black/10 p-0.5"
          >
            <button
              type="button"
              onClick={() => onFilterChange("all")}
              aria-pressed={filter === "all"}
              className={`flex h-8 items-center gap-1.5 rounded-[9px] px-2 text-[9px] font-medium transition-all sm:px-2.5 sm:text-[10px] ${
                filter === "all"
                  ? "bg-viw-text text-viw-base shadow-sm"
                  : "text-viw-text/45 hover:text-viw-text/80"
              }`}
            >
              <SlidersHorizontal className="h-3 w-3" aria-hidden="true" />
              <span className="hidden sm:inline">Todas</span>
              <span className="sr-only sm:hidden">Todas</span>
            </button>
            <button
              type="button"
              onClick={() => onFilterChange("available")}
              aria-pressed={filter === "available"}
              className={`flex h-8 items-center gap-1.5 rounded-[9px] px-2 text-[9px] font-medium transition-all sm:px-2.5 sm:text-[10px] ${
                filter === "available"
                  ? "bg-viw-accent text-[#142426] shadow-[0_0_20px_rgba(92,225,230,0.18)]"
                  : "text-viw-text/45 hover:text-viw-text/80"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  filter === "available" ? "bg-[#142426]" : "bg-status-available"
                }`}
              />
              <span className="hidden sm:inline">Disponibles</span>
              <span className="sr-only sm:hidden">Disponibles</span>
            </button>
          </div>

          <div className="hidden h-9 items-center gap-2 rounded-xl border border-viw-text/10 bg-black/10 px-3 xl:flex">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-viw-accent opacity-40" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-viw-accent" />
            </span>
            <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-viw-text/50">
              {availableUnits.length.toString().padStart(2, "0")} disponibles
            </span>
          </div>

          <button
            type="button"
            onClick={() => onOpenLaunch?.()}
            className="flex h-9 items-center gap-1.5 rounded-full border border-[#5CE1E6]/40 bg-[#5CE1E6]/10 px-3.5 py-1.5 text-xs font-semibold text-[#5CE1E6] backdrop-blur-md transition-all hover:bg-[#5CE1E6] hover:text-[#242321]"
          >
            Quiero viw →
          </button>
        </div>
      </div>

      {mobileSearchOpen ? (
        <div className="viw-glass mx-auto mt-2 max-w-[1640px] rounded-2xl p-2.5 animate-panel-in md:hidden">
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-viw-text/40"
            />
            <label htmlFor="unit-search-mobile" className="sr-only">
              Buscar unidades
            </label>
            <input
              id="unit-search-mobile"
              type="search"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Código, residencia o nivel..."
              autoComplete="off"
              autoFocus
              className="h-11 w-full rounded-xl border border-viw-text/12 bg-black/20 pl-9 pr-4 text-xs text-viw-text outline-none placeholder:text-viw-text/30 focus:border-viw-accent/50"
            />
          </div>
          {query.trim() ? (
            <div className="mt-1.5 max-h-[52vh] overflow-y-auto">
              <div className="flex items-center justify-between px-2 py-2">
                <span className="viw-eyebrow">Resultados</span>
                <span className="text-[9px] text-viw-text/35">
                  {results.length} encontrados
                </span>
              </div>
              <SearchResults results={results} onSelect={selectUnit} />
            </div>
          ) : (
            <div className="flex items-center justify-between px-2 pb-1 pt-3">
              <p className="text-[10px] text-viw-text/38">
                Busca por código o nombre de residencia.
              </p>
              <button
                type="button"
                onClick={() => onQueryChange("ZP-1701")}
                className="flex items-center gap-1 text-[10px] font-medium text-viw-accent/80 transition-colors hover:text-viw-accent"
              >
                Ejemplo <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      ) : null}
    </header>
  );
}

function SearchResults({
  results,
  onSelect,
  compact = false,
}: {
  results: Unit[];
  onSelect: (unit: Unit) => void;
  compact?: boolean;
}) {
  if (results.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-viw-text/10 px-3 py-5 text-center">
        <p className="text-[11px] text-viw-text/50">Sin coincidencias.</p>
        <p className="mt-1 text-[9px] text-viw-text/28">
          Prueba con ZP-1701 o &quot;Terraza&quot;.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      {results.map((unit) => (
        <button
          key={unit.id}
          type="button"
          onClick={() => onSelect(unit)}
          className={`group flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left transition-colors hover:bg-viw-text/[0.06] ${
            compact ? "min-h-[46px]" : "min-h-[52px]"
          }`}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-viw-text/10 bg-black/20 font-display text-[9px] font-medium text-viw-text/65">
            {unit.floor.toString().padStart(2, "0")}
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5">
              <span className="truncate text-[11px] font-medium text-viw-text/90">
                {unit.code}
              </span>
              <span className={`h-1 w-1 rounded-full ${statusDot[unit.status]}`} />
            </span>
            <span className="mt-0.5 block truncate text-[9px] text-viw-text/35">
              {unit.name} · {unit.areaM2} m²
            </span>
          </span>
          <span className="shrink-0 text-right">
            <span className="block text-[10px] font-medium tabular-nums text-viw-text/70">
              {formatUSD(unit.priceUsd).replace(" USD", "")}
            </span>
            <span className="mt-0.5 flex items-center justify-end gap-0.5 text-[8px] uppercase tracking-[0.12em] text-viw-text/25 transition-colors group-hover:text-viw-accent/70">
              Ver <ArrowUpRight className="h-2.5 w-2.5" />
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}
