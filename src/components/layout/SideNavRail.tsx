"use client";

import {
  Building2,
  Compass,
  LayoutGrid,
  MapPin,
  Orbit,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ShowroomView } from "@/types/viw.types";

interface SideNavRailProps {
  activeView: ShowroomView;
  onChange: (view: ShowroomView) => void;
  onOpenLobby?: () => void;
}

interface NavItem {
  id: ShowroomView;
  label: string;
  mobileLabel: string;
  description: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "aerial",
    label: "Masterplan",
    mobileLabel: "Aéreo",
    description: "Vista aérea y masterplan",
    icon: Compass,
  },
  {
    id: "tower",
    label: "Torre",
    mobileLabel: "Torre",
    description: "Fachada interactiva día / noche",
    icon: Building2,
  },
  {
    id: "units",
    label: "Unidades",
    mobileLabel: "Unidades",
    description: "Colección de residencias",
    icon: LayoutGrid,
  },
  {
    id: "tour",
    label: "Tour 360°",
    mobileLabel: "Tour 360°",
    description: "Recorrido inmersivo",
    icon: Orbit,
  },
  {
    id: "location",
    label: "Ubicación",
    mobileLabel: "Ubicación",
    description: "Mapa y puntos de interés",
    icon: MapPin,
  },
];

export default function SideNavRail({
  activeView,
  onChange,
  onOpenLobby,
}: SideNavRailProps) {
  return (
    <>
      <nav
        className="fixed left-3 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center md:flex"
        aria-label="Secciones del showroom"
      >
        <div className="viw-glass flex max-h-[calc(100dvh-7rem)] flex-col items-center overflow-y-auto rounded-[24px] p-1.5 no-scrollbar">
          {onOpenLobby ? (
            <button
              type="button"
              onClick={onOpenLobby}
              className="mb-1 flex w-[62px] flex-col items-center justify-center gap-1 rounded-[16px] py-2 text-viw-text/45 transition-all hover:bg-viw-text/[0.05] hover:text-viw-accent"
              aria-label="Volver al inicio"
            >
              <span className="text-[9px] font-medium">↩</span>
              <span className="max-w-[54px] truncate text-[8px] font-medium tracking-[-0.01em]">
                Inicio
              </span>
            </button>
          ) : null}
          <div className="flex flex-col items-center gap-1 pb-1 pt-2.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-viw-accent opacity-35" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-viw-accent" />
            </span>
            <span className="mt-1.5 text-[7px] font-medium uppercase tracking-[0.18em] text-viw-text/28">
              Explore
            </span>
          </div>

          <div className="mb-1 h-px w-8 bg-viw-text/10" />

          <div className="flex flex-col items-stretch gap-0.5">
            {NAV_ITEMS.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onChange(item.id)}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={`${item.label}: ${item.description}`}
                  className={`group relative flex w-[62px] flex-col items-center justify-center gap-1 rounded-[16px] py-2.5 transition-all duration-300 ${
                    isActive
                      ? "bg-viw-accent/[0.11] text-viw-accent"
                      : "text-viw-text/42 hover:bg-viw-text/[0.05] hover:text-viw-text/80"
                  }`}
                >
                  {isActive ? (
                    <span className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full bg-viw-accent shadow-[0_0_12px_rgba(92,225,230,0.7)]" />
                  ) : null}
                  <span className="absolute right-1.5 top-1.5 text-[6px] font-medium tabular-nums tracking-[0.05em] text-current opacity-30">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <Icon
                    className="h-[17px] w-[17px] stroke-[1.45]"
                    aria-hidden="true"
                  />
                  <span className="max-w-[54px] truncate text-[8px] font-medium tracking-[-0.01em]">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mb-1 mt-2 h-px w-8 bg-viw-text/10" />
          <div className="flex flex-col items-center gap-1 py-2">
            <span className="font-display text-[8px] font-medium tracking-[-0.03em] text-viw-text/25">
              viw<sup className="ml-0.5 text-[5px] text-viw-accent/70">®</sup>
            </span>
            <span className="text-[6px] uppercase tracking-[0.12em] text-viw-text/18">
              by Ultea
            </span>
          </div>
        </div>
      </nav>

      <nav
        className="viw-glass fixed inset-x-3 bottom-3 z-40 flex items-stretch rounded-[20px] p-1.5 pb-safe md:hidden"
        aria-label="Secciones del showroom"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              aria-current={isActive ? "page" : undefined}
              className={`relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-[14px] px-0.5 py-2 transition-all ${
                isActive
                  ? "bg-viw-accent/[0.11] text-viw-accent"
                  : "text-viw-text/38 active:bg-viw-text/[0.05]"
              }`}
            >
              {isActive ? (
                <span className="absolute -top-1.5 left-1/2 h-[2px] w-5 -translate-x-1/2 rounded-full bg-viw-accent" />
              ) : null}
              <Icon className="h-[17px] w-[17px] stroke-[1.5]" aria-hidden="true" />
              <span className="truncate text-[7px] font-medium tracking-[-0.01em]">
                {item.mobileLabel}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
