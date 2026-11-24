/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import dynamic from "next/dynamic";
import {
  ArrowUpRight,
  Building2,
  CircleDot,
  Layers,
  LoaderCircle,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { useZpyraInventory } from "@/context/InventoryContext";
import LiveInventoryModal from "@/components/commercial/LiveInventoryModal";
import LaunchYourProjectModal from "@/components/commercial/LaunchYourProjectModal";
import UnitDetailDrawer from "@/components/commercial/UnitDetailDrawer";
import UnitPreviewCard from "@/components/commercial/UnitPreviewCard";
import SideNavRail from "@/components/layout/SideNavRail";
import TopNavbar from "@/components/layout/TopNavbar";
import AerialMasterplan from "@/components/viewer/AerialMasterplan";
import LocationView from "@/components/viewer/LocationView";
import TowerFacadeViewer from "@/components/viewer/TowerFacadeViewer";
import ShowroomLobby, { type LobbyTarget } from "@/components/lobby/ShowroomLobby";
import JarvisVoiceAssistant from "@/components/JarvisVoiceAssistant";
import { PLATFORM_CONFIG, ZPYRA_DEMO } from "@/data/zpyra-demo";
import { formatUSD } from "@/lib/utils";
import type {
  ProjectData,
  ShowroomView,
  Unit,
  UnitFilter,
  UnitStatus,
} from "@/types/viw.types";

const Panorama360VR = dynamic(
  () => import("@/components/viewer/Panorama360VR"),
  {
    ssr: false,
    loading: () => <ViewLoading label="Montando escena inmersiva" />,
  },
);

export default function ShowroomPage() {
  const [view, setView] = useState<ShowroomView>("aerial");
  const [filter, setFilter] = useState<UnitFilter>("all");
  const [query, setQuery] = useState("");
  const { units, setUnitStatus, setUnitPrice, resetInventory } = useZpyraInventory();
  const [activeUnitCode, setActiveUnitCode] = useState<string | null>(null);
  const [activeSceneId, setActiveSceneId] = useState(
    ZPYRA_DEMO.scenes[0].id,
  );
  const [activeFloor, setActiveFloor] = useState<number>(
    Math.max(...ZPYRA_DEMO.units.map((unit) => unit.floor)),
  );
  const [showLobby, setShowLobby] = useState(true);
  const [adminOpenRequest, setAdminOpenRequest] = useState(0);
  const [launchOpen, setLaunchOpen] = useState(false);
  const [jarvisFilter, setJarvisFilter] = useState<{
    recamaras?: number;
    presupuestoMax?: number;
    nivel?: number;
    orientacion?: string;
  }>({});
  const [cotizacion, setCotizacion] = useState<{
    code: string;
    price: number;
    enganche: number;
    plazo: number;
    mensualidad: number;
  } | null>(null);

  const activeUnit =
    units.find((unit) => unit.code === activeUnitCode) ?? null;

  const filteredUnits = useMemo(
    () =>
      filter === "available"
        ? units.filter((unit) => unit.status === "available")
        : units,
    [filter, units],
  );

  const displayUnits = useMemo(() => {
    return filteredUnits.filter((unit) => {
      if (
        jarvisFilter.recamaras !== undefined &&
        unit.bedrooms !== jarvisFilter.recamaras
      ) {
        return false;
      }
      if (
        jarvisFilter.presupuestoMax !== undefined &&
        unit.priceUsd > jarvisFilter.presupuestoMax
      ) {
        return false;
      }
      if (jarvisFilter.nivel !== undefined && unit.floor !== jarvisFilter.nivel) {
        return false;
      }
      if (
        jarvisFilter.orientacion !== undefined &&
        unit.orientation.toLowerCase() !== jarvisFilter.orientacion.toLowerCase()
      ) {
        return false;
      }
      return true;
    });
  }, [filteredUnits, jarvisFilter]);

  // One-time bootstrap from browser-only state: the ?unit= deep link and the
  // persisted live inventory. It intentionally runs after hydration so the
  // server and client render identical markup first.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedCode = params.get("unit");
    if (requestedCode) {
      const match = ZPYRA_DEMO.units.find(
        (unit) => unit.code.toLowerCase() === requestedCode.toLowerCase(),
      );
      if (match) {
        setActiveUnitCode(match.code);
        setView("tower");
        setShowLobby(false);
      }
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);

    if (activeUnitCode) {
      url.searchParams.set("unit", activeUnitCode);
    } else {
      url.searchParams.delete("unit");
    }

    if (url.toString() !== window.location.href) {
      window.history.replaceState({}, "", url);
    }
  }, [activeUnitCode]);

  useEffect(() => {
    const defaultTitle = `${ZPYRA_DEMO.name} · ${PLATFORM_CONFIG.fullName}`;
    document.title = activeUnit
      ? `${activeUnit.code} · ${activeUnit.name} · viw`
      : defaultTitle;
  }, [activeUnit]);

  const openUnit = useCallback((unit: Unit) => {
    setActiveUnitCode(unit.code);
  }, []);

  const closeUnit = useCallback(() => {
    setActiveUnitCode(null);
  }, []);

  const handleViewChange = useCallback((nextView: ShowroomView) => {
    setView(nextView);
    setActiveUnitCode(null);
  }, []);

  const handleJarvisAction = useCallback(
    (name: string, args: Record<string, any>) => {
      if (name === "filtrarUnidades") {
        setJarvisFilter({
          recamaras:
            typeof args.recamaras === "number" ? args.recamaras : undefined,
          presupuestoMax:
            typeof args.presupuestoMax === "number"
              ? args.presupuestoMax
              : undefined,
          nivel: typeof args.nivel === "number" ? args.nivel : undefined,
          orientacion:
            typeof args.orientacion === "string" ? args.orientacion : undefined,
        });
        setView("units");
        return;
      }
      if (name === "seleccionarUnidad") {
        const code = String(args.unidadId ?? "");
        const match = units.find(
          (unit) => unit.code.toLowerCase() === code.toLowerCase(),
        );
        if (match) {
          setActiveUnitCode(match.code);
          setView("tower");
        }
        return;
      }
      if (name === "calcularCotizacion") {
        const code = String(args.unidadId ?? "");
        const match = units.find(
          (unit) => unit.code.toLowerCase() === code.toLowerCase(),
        );
        if (!match) return;
        const pct =
          typeof args.porcentajeEnganche === "number"
            ? args.porcentajeEnganche
            : 30;
        const plazo =
          typeof args.plazoMeses === "number" ? args.plazoMeses : 24;
        const enganche = match.priceUsd * (pct / 100);
        const saldo = match.priceUsd - enganche;
        const mensualidad = saldo / plazo;
        setCotizacion({
          code: match.code,
          price: match.priceUsd,
          enganche,
          plazo,
          mensualidad,
        });
        setActiveUnitCode(match.code);
        return;
      }
      if (name === "reiniciarVista") {
        setJarvisFilter({});
        setFilter("all");
        setView("aerial");
        setCotizacion(null);
        return;
      }
    },
    [units],
  );

  const handleLobbyEnter = useCallback((target: LobbyTarget) => {
    setShowLobby(false);
    if (target === "admin") {
      setView("aerial");
      setAdminOpenRequest((value) => value + 1);
      return;
    }
    const viewMap: Record<Exclude<LobbyTarget, "admin">, ShowroomView> = {
      aerial: "aerial",
      tower: "tower",
      units: "units",
      tour: "tour",
      location: "location",
    };
    setView(viewMap[target]);
    setActiveUnitCode(null);
  }, []);

  const startTour = useCallback((sceneId: string) => {
    setActiveSceneId(sceneId);
    setActiveUnitCode(null);
    setView("tour");
  }, []);

  const handleStatusChange = useCallback(
    (unitId: string, status: UnitStatus) => {
      setUnitStatus(unitId, status);
    },
    [setUnitStatus],
  );

  const resetInventoryCallback = useCallback(() => {
    resetInventory();
  }, [resetInventory]);

  if (showLobby) {
    return <ShowroomLobby onEnter={handleLobbyEnter} />;
  }

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-viw-base text-viw-text">
      <TopNavbar
        project={ZPYRA_DEMO}
        units={units}
        filter={filter}
        query={query}
        onFilterChange={setFilter}
        onQueryChange={setQuery}
        onSelectUnit={openUnit}
        onOpenLaunch={() => setLaunchOpen(true)}
      />

      <SideNavRail
        activeView={view}
        onChange={handleViewChange}
        onOpenLobby={() => setShowLobby(true)}
      />

      <main className="relative h-dvh w-full overflow-hidden">
        <div key={view} className="absolute inset-0 animate-view-enter">
          {view === "aerial" ? (
            <AerialMasterplan
              project={ZPYRA_DEMO}
              units={units}
              onExploreTower={() => handleViewChange("tower")}
            />
          ) : null}

          {view === "tower" ? (
            <TowerFacadeViewer
              project={ZPYRA_DEMO}
              units={displayUnits}
              filter={filter}
              onOpenUnit={openUnit}
              onOpenFloorplan={(floor) => {
                setActiveFloor(floor);
                setView("units");
              }}
            />
          ) : null}

          {view === "units" ? (
            <UnitsExplorer
              project={ZPYRA_DEMO}
              units={displayUnits}
              filter={filter}
              activeFloor={activeFloor}
              onActiveFloorChange={setActiveFloor}
              onOpenUnit={openUnit}
            />
          ) : null}

          {view === "tour" ? (
            <Panorama360VR
              scenes={ZPYRA_DEMO.scenes}
              activeSceneId={activeSceneId}
              onSceneChange={setActiveSceneId}
            />
          ) : null}

          {view === "location" ? (
            <LocationView project={ZPYRA_DEMO} />
          ) : null}
        </div>
      </main>

      <LiveInventoryModal
        units={units}
        onStatusChange={handleStatusChange}
        onPriceChange={setUnitPrice}
        onReset={resetInventoryCallback}
        forceOpen={adminOpenRequest}
      />
      <LaunchYourProjectModal
        open={launchOpen}
        onClose={() => setLaunchOpen(false)}
      />
      <JarvisVoiceAssistant
        inventoryContext={units}
        onExecuteAction={handleJarvisAction}
      />
      {cotizacion ? (
        <div className="viw-glass fixed left-1/2 top-24 z-[85] w-[calc(100%-2rem)] max-w-[440px] -translate-x-1/2 rounded-2xl p-5 animate-panel-in shadow-2xl md:top-28">
          <div className="flex items-start justify-between gap-2">
            <p className="viw-eyebrow">Corrida financiera · {cotizacion.code}</p>
            <button
              type="button"
              onClick={() => setCotizacion(null)}
              className="text-viw-text/40 hover:text-viw-text"
            >
              ×
            </button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-[11px]">
            <div>
              <p className="text-viw-text/35">Precio</p>
              <p className="font-display text-[16px] font-medium text-viw-text">
                ${cotizacion.price.toLocaleString("en-US")}
              </p>
            </div>
            <div>
              <p className="text-viw-text/35">Enganche</p>
              <p className="font-display text-[16px] font-medium text-viw-text">
                ${cotizacion.enganche.toLocaleString("en-US")}
              </p>
            </div>
            <div>
              <p className="text-viw-text/35">Plazo</p>
              <p className="font-display text-[16px] font-medium text-viw-text">
                {cotizacion.plazo} meses
              </p>
            </div>
            <div>
              <p className="text-viw-text/35">Mensualidad</p>
              <p className="font-display text-[18px] font-medium text-viw-accent">
                ${cotizacion.mensualidad.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <UnitDetailDrawer
        unit={activeUnit}
        open={Boolean(activeUnit)}
        project={ZPYRA_DEMO}
        scenes={ZPYRA_DEMO.scenes}
        onClose={closeUnit}
        onStartTour={startTour}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}

function UnitsExplorer({
  project,
  units,
  filter,
  activeFloor,
  onActiveFloorChange,
  onOpenUnit,
}: {
  project: ProjectData;
  units: Unit[];
  filter: UnitFilter;
  activeFloor: number;
  onActiveFloorChange: (floor: number) => void;
  onOpenUnit: (unit: Unit) => void;
}) {
  const sortedUnits = useMemo(
    () => [...units].sort((a, b) => b.floor - a.floor),
    [units],
  );
  const availableCount = units.filter(
    (unit) => unit.status === "available",
  ).length;
  const { units: allUnits } = useZpyraInventory();
  const [hoveredUnitId, setHoveredUnitId] = useState<string | null>(null);
  const [calibrating, setCalibrating] = useState(false);

  const quadrantDefs = useMemo(
    () => [
      { key: "N" as const, points: "23,26  43,14  49.5,50  29,62", label: { x: 36, y: 38 } },
      { key: "E" as const, points: "43,14  62,4  69,39  49.5,50", label: { x: 56, y: 27 } },
      { key: "S" as const, points: "29,62  49.5,50  56,87  36,93", label: { x: 43, y: 73 } },
      { key: "W" as const, points: "49.5,50  69,39  75,75  56,87", label: { x: 62, y: 63 } },
    ],
    [],
  );

  const quadrantData = useMemo(
    () =>
      quadrantDefs.map(({ key, points, label }) => {
        const unit =
          allUnits.find(
            (u) => u.floor === activeFloor && u.quadrant === key,
          ) ?? null;
        const isActive =
          hoveredUnitId !== null && hoveredUnitId === unit?.id;
        const isAvailable = unit?.status === "available";
        const isReserved = unit?.status === "reserved";
        const isSold = unit?.status === "sold";
        const stroke = isAvailable
          ? "#5CE1E6"
          : isReserved
            ? "#F59E0B"
            : isSold
              ? "#EF4444"
              : "rgba(238,244,244,0.18)";
        const fillNormal = isAvailable
          ? "rgba(92, 225, 230, 0.28)"
          : isReserved
            ? "rgba(245, 158, 11, 0.30)"
            : isSold
              ? "rgba(239, 68, 68, 0.32)"
              : "transparent";
        const fillHover = isAvailable
          ? "rgba(92, 225, 230, 0.45)"
          : isReserved
            ? "rgba(245, 158, 11, 0.48)"
            : isSold
              ? "rgba(239, 68, 68, 0.48)"
              : "transparent";
        const code = unit ? unit.code : `ZP-${activeFloor}${key}`;
        return {
          key,
          points,
          label,
          unit,
          isActive,
          stroke,
          fillNormal,
          fillHover,
          code,
        };
      }),
    [allUnits, activeFloor, hoveredUnitId, quadrantDefs],
  );
  const [calibPoints, setCalibPoints] = useState<{ x: number; y: number }[]>([]);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.shiftKey && (event.key === "e" || event.key === "E")) {
        event.preventDefault();
        setCalibrating((current) => !current);
      }
      if (event.key === "Escape") setCalibrating(false);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  function handleCalibClick(event: ReactMouseEvent<HTMLDivElement>) {
    if (!calibrating) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const point = {
      x: Math.round(((event.clientX - rect.left) / rect.width) * 100),
      y: Math.round(((event.clientY - rect.top) / rect.height) * 100),
    };
    setCalibPoints((previous) => {
      const next = [...previous, point];
      const text = next.map((item) => `${item.x},${item.y}`).join("  ");
      try {
        void navigator.clipboard.writeText(text);
      } catch {
        // Clipboard may be unavailable in some contexts.
      }
      return next;
    });
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-viw-base">
      <div className="pointer-events-none absolute inset-0 bg-viw-grid opacity-[0.12]" />
      <div className="pointer-events-none absolute -right-32 -top-40 h-[500px] w-[500px] rounded-full bg-viw-accent/[0.035] blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-52 left-1/3 h-[460px] w-[460px] rounded-full bg-[#bfa379]/[0.025] blur-[120px]" />

      <div className="relative h-full overflow-y-auto overscroll-contain px-4 pb-32 pt-[92px] no-scrollbar md:pl-[104px] md:pr-6 md:pt-[112px] lg:pl-[116px] lg:pr-8 lg:pt-[122px]">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
            <div className="max-w-[720px]">
              <div className="flex items-center gap-2">
                <span className="h-px w-5 bg-viw-accent/70" />
                <p className="text-[8px] font-medium uppercase tracking-[0.22em] text-viw-text/45">
                  Inventario · Colección Horizonte
                </p>
              </div>

              <h1 className="mt-3 max-w-[640px] font-display text-[clamp(2rem,4.1vw,3.8rem)] font-medium leading-[0.96] tracking-[-0.06em] text-viw-text">
                Dieciséis formas de habitar
                <br />
                <span className="text-viw-text/38">el horizonte.</span>
              </h1>

              <p className="mt-3 max-w-[460px] text-[10px] leading-[1.7] text-viw-text/36">
                Cada residencia tiene una orientación, una terraza y una
                relación distinta con el paisaje. Explora la colección y
                encuentra tu lugar.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="viw-glass flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-viw-accent opacity-40" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-viw-accent" />
                </span>
                <div>
                  <p className="text-[7px] uppercase tracking-[0.14em] text-viw-text/28">
                    Disponibles en vivo
                  </p>
                  <p className="mt-0.5 font-display text-[15px] font-medium tracking-[-0.03em] text-viw-text/82">
                    {availableCount.toString().padStart(2, "0")}{" "}
                    <span className="text-[9px] font-normal text-viw-text/28">
                      / {project.totalUnits.toString().padStart(2, "0")}
                    </span>
                  </p>
                </div>
              </div>
              <div className="viw-glass flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5">
                <CircleDot className="h-3.5 w-3.5 text-viw-text/22" />
                <div>
                  <p className="text-[7px] uppercase tracking-[0.14em] text-viw-text/28">
                    Precio desde
                  </p>
                  <p className="mt-0.5 font-display text-[13px] font-medium tracking-[-0.025em] text-viw-text/75">
                    {formatUSD(project.priceFromUsd)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[8px] font-medium uppercase tracking-[0.14em] text-viw-text/35">
              Planta tipo · selecciona nivel
            </span>
            {calibrating ? (
              <span className="flex items-center gap-2 rounded-full border border-viw-accent/40 bg-viw-accent/10 px-2.5 py-1 text-[8px] font-medium uppercase tracking-[0.12em] text-viw-accent">
                Calibración activa · clic para marcar · Shift+E para salir
                {calibPoints.length > 0 ? ` · ${calibPoints.length} pts` : ""}
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setCalibPoints([]);
                  }}
                  className="ml-1 rounded-full border border-viw-accent/40 px-1.5 py-0.5 text-[7px] hover:bg-viw-accent/20"
                >
                  Limpiar
                </button>
              </span>
            ) : null}
            <div className="flex flex-wrap gap-1.5">
              {[14, 15, 16, 17].map((floor) => (
                <button
                  key={floor}
                  type="button"
                  onClick={() => onActiveFloorChange(floor)}
                  aria-pressed={activeFloor === floor}
                  className={`flex h-7 items-center rounded-full border px-2.5 text-[8px] font-medium uppercase tracking-[0.12em] transition-all ${
                    activeFloor === floor
                      ? "border-viw-accent/40 bg-viw-accent/15 text-viw-accent"
                      : "border-viw-text/10 bg-black/10 text-viw-text/45 hover:text-viw-text/80"
                  }`}
                >
                  Nivel {floor}
                </button>
              ))}
            </div>
          </div>

          <div className="viw-glass grid overflow-hidden rounded-[24px] lg:grid-cols-[1.02fr_0.98fr]">
            <div
              className="relative aspect-video w-full overflow-hidden"
              onClick={handleCalibClick}
            >
              <Image
                src="/assets/zpyra-floorplan.webp"
                alt="Planta tipo de Zpyra: cuatro residencias alrededor del núcleo central"
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="z-0 object-cover w-full h-full"
              />
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="absolute inset-0 z-10 h-full w-full"
                aria-hidden="true"
              >
                {quadrantData.map(({ key, points, unit, isActive, stroke, fillNormal, fillHover }) => (
                  <polygon
                    key={key}
                    points={points}
                    strokeLinejoin="round"
                    className="transition-all duration-200"
                    style={{
                      fill: unit !== null ? (isActive ? fillHover : fillNormal) : "transparent",
                      stroke: unit !== null ? stroke : "rgba(238,244,244,0.2)",
                      strokeOpacity: isActive ? 1 : 0.85,
                      strokeWidth: 0.5,
                      cursor: unit !== null ? "pointer" : "default",
                      pointerEvents: "auto",
                    }}
                    onMouseEnter={() => unit && setHoveredUnitId(unit.id)}
                    onMouseLeave={() => setHoveredUnitId(null)}
                    onClick={() => unit && onOpenUnit(unit)}
                  />
                ))}
              </svg>
              <div className="pointer-events-none absolute inset-0 z-20">
                {quadrantData.map(({ key, label, unit, isActive, code, stroke }) => (
                  <div
                    key={`label-${key}`}
                    className="absolute"
                    style={{
                      left: `${label.x}%`,
                      top: `${label.y}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <span
                      className={`inline-block whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide backdrop-blur-md sm:text-[11px] ${
                        isActive
                          ? "bg-[#242321]/90 text-white"
                          : "bg-[#242321]/75 text-white/90"
                      }`}
                      style={{
                        borderColor: unit ? stroke : "rgba(238,244,244,0.2)",
                      }}
                    >
                      {code}
                    </span>
                  </div>
                ))}
              </div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1b1c18]/70 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-[#242321]/50" />
              <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full border border-white/12 bg-black/25 px-2.5 py-1.5 text-[7px] font-medium uppercase tracking-[0.16em] text-white/60 backdrop-blur-md">
                <Layers className="h-2.5 w-2.5 stroke-[1.4] text-viw-accent/85" />
                Planta tipo
              </span>
              <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
                <div>
                  <p className="text-[7px] font-medium uppercase tracking-[0.16em] text-white/40">
                    Huella del nivel
                  </p>
                  <p className="mt-1 text-shadow-soft font-display text-[14px] font-medium tracking-[-0.025em] text-white/90">
                    4 residencias por planta
                  </p>
                </div>
                <span className="rounded-full border border-white/15 bg-black/25 px-2 py-1 text-[7px] font-medium uppercase tracking-[0.12em] text-white/55 backdrop-blur-md">
                  Niveles 14 — 17
                </span>
              </div>
            </div>

            <div className="flex flex-col justify-center gap-5 p-5 sm:p-6">
              <div>
                <p className="viw-eyebrow">Distribución</p>
                <h2 className="mt-2 font-display text-[24px] font-medium leading-[1.05] tracking-[-0.045em] text-viw-text">
                  Una planta,
                  <span className="text-viw-text/38"> cuatro residencias.</span>
                </h2>
                <p className="mt-2.5 max-w-[420px] text-[10px] leading-[1.7] text-viw-text/42">
                  Cada nivel se organiza alrededor del núcleo central con cuatro
                  residencias. Todas las plantas son réplica de esta
                  distribución.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "04", label: "por nivel" },
                  { value: "14–17", label: "niveles" },
                  { value: "16", label: "en showroom" },
                ].map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-xl border border-viw-text/10 bg-black/10 px-2.5 py-2"
                  >
                    <p className="font-display text-[16px] font-medium tracking-[-0.03em] text-viw-text/85">
                      {metric.value}
                    </p>
                    <p className="mt-0.5 text-[7px] font-medium uppercase tracking-[0.12em] text-viw-text/30">
                      {metric.label}
                    </p>
                  </div>
                ))}
              </div>

              <p className="flex items-start gap-2 border-t border-viw-text/10 pt-3 text-[8px] leading-relaxed text-viw-text/28">
                <CircleDot className="mt-0.5 h-3 w-3 shrink-0 text-viw-accent/60" />
                El showroom comercializa una selección de ocho residencias; la
                planta tipo muestra la distribución completa de un nivel.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 border-b border-viw-text/10 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-medium uppercase tracking-[0.13em] text-viw-text/35">
                {filter === "available" ? "Solo disponibles" : "Todas las residencias"}
              </span>
              <span className="rounded-full border border-viw-text/10 px-1.5 py-0.5 text-[8px] tabular-nums text-viw-text/30">
                {sortedUnits.length.toString().padStart(2, "0")}
              </span>
            </div>
            <p className="hidden items-center gap-1.5 text-[8px] uppercase tracking-[0.1em] text-viw-text/20 sm:flex">
              <Building2 className="h-3 w-3" />
              Niveles 14 — 17 · Zpyra
            </p>
          </div>

          {sortedUnits.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 pb-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {sortedUnits.map((unit) => {
                const scene =
                  project.scenes.find(
                    (projectScene) => projectScene.id === unit.tourSceneId,
                  ) ?? project.scenes[0];

                return (
                  <div
                    key={unit.id}
                    onMouseEnter={() => {
                      setHoveredUnitId(unit.id);
                      onActiveFloorChange(unit.floor);
                    }}
                    onMouseLeave={() => setHoveredUnitId(null)}
                    className={`transition-all duration-200 ${
                      hoveredUnitId === unit.id ? "scale-[1.01]" : ""
                    }`}
                  >
                    <UnitPreviewCard
                      unit={unit}
                      variant="gallery"
                      imageSrc={scene.image}
                      onOpen={onOpenUnit}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="viw-glass mt-2 flex flex-col items-center justify-center rounded-3xl px-6 py-20 text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-viw-text/10 bg-white/[0.03]">
                <CircleDot className="h-4 w-4 text-viw-text/25" />
              </span>
              <p className="mt-4 font-display text-lg font-medium tracking-[-0.03em] text-viw-text/70">
                No hay residencias disponibles con este filtro.
              </p>
              <p className="mt-1.5 max-w-[320px] text-[10px] leading-relaxed text-viw-text/30">
                Cambia el filtro a &quot;Todas&quot; en la barra superior para
                consultar las residencias reservadas.
              </p>
            </div>
          )}

          <div className="flex flex-col items-start justify-between gap-3 pb-4 pt-2 sm:flex-row sm:items-center">
            <p className="text-[8px] uppercase tracking-[0.14em] text-viw-text/20">
              Zpyra · Una experiencia de venta by Ultea
            </p>
            <a
              href={PLATFORM_CONFIG.developerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[8px] font-medium uppercase tracking-[0.12em] text-viw-text/28 transition-colors hover:text-viw-accent"
            >
              ultea.space
              <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function ViewLoading({ label }: { label: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-[#171815]">
      <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-viw-text/10">
        <LoaderCircle className="h-5 w-5 animate-spin text-viw-accent/70" />
        <span className="absolute inset-0 animate-spin-slow rounded-full border border-dashed border-viw-text/10" />
      </div>
      <p className="text-[8px] font-medium uppercase tracking-[0.18em] text-viw-text/30">
        {label}
      </p>
    </div>
  );
}
