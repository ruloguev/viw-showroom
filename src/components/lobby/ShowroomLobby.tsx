"use client";

import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import {
  ArrowRight,
  Building2,
  Compass,
  LayoutGrid,
  LockKeyhole,
  Orbit,
} from "lucide-react";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as THREE from "three";
import LaunchYourProjectModal from "@/components/commercial/LaunchYourProjectModal";


export type LobbyTarget =
  | "aerial"
  | "tower"
  | "units"
  | "tour"
  | "location"
  | "admin";

interface ShowroomLobbyProps {
  onEnter: (target: LobbyTarget) => void;
}

const DOCK_ITEMS: {
  id: LobbyTarget;
  label: string;
  icon: typeof Compass;
  title: string;
  description: string;
}[] = [
  {
    id: "aerial",
    label: "Masterplan Aéreo",
    icon: Compass,
    title: "Masterplan Aéreo",
    description:
      "Vista cenital del desarrollo con pines interactivos de llegada, amenidades y torre. El punto de partida de toda preventa.",
  },
  {
    id: "tower",
    label: "Torre Día / Noche",
    icon: Building2,
    title: "Torre Día / Noche",
    description:
      "Fachada interactiva con niveles clicables, estados de disponibilidad y cambio de iluminación día/noche en tiempo real.",
  },
  {
    id: "units",
    label: "Planta Tipo",
    icon: LayoutGrid,
    title: "Planta Tipo",
    description:
      "Planta cenital con los 4 departamentos por nivel, sincronizados con las tarjetas de inventario y el estado de cada unidad.",
  },
  {
    id: "tour",
    label: "Tour 360° & VR",
    icon: Orbit,
    title: "Tour 360° & VR",
    description:
      "Recorrido inmersivo con escenas encadenadas, hotspots y entrada WebXR para recorrer el desarrollo en cualquier dispositivo.",
  },
  {
    id: "admin",
    label: "Panel viw Admin",
    icon: LockKeyhole,
    title: "Panel viw Admin",
    description:
      "Consola de inventario en vivo: cambia disponibilidad (Disponible / Reservado / Vendido) y reinicia el demo al instante.",
  },
];

function PanoramaSphere() {
  const texture = useLoader(THREE.TextureLoader, "/assets/pano-1.webp");
  const group = useRef<THREE.Group>(null);
  const rotationTarget = useRef({ yaw: 0 });

  useEffect(() => {
    /* eslint-disable react-hooks/immutability */
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.minFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    /* eslint-enable react-hooks/immutability */
  }, [texture]);

  useFrame((_, delta) => {
    if (!group.current) return;
    rotationTarget.current.yaw += delta * 0.08;
    group.current.rotation.y = rotationTarget.current.yaw;
  });

  return (
    <group ref={group}>
      <mesh scale={[-1, 1, 1]}>
        <sphereGeometry args={[50, 72, 48]} />
        <meshBasicMaterial
          map={texture}
          side={THREE.BackSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

export default function ShowroomLobby({ onEnter }: ShowroomLobbyProps) {
  const [closing, setClosing] = useState(false);
  const [activeCard, setActiveCard] = useState<LobbyTarget | null>(null);
  const [launchOpen, setLaunchOpen] = useState(false);

  const handleEnter = useCallback(
    (target: LobbyTarget) => {
      setClosing(true);
      setTimeout(() => {
        onEnter(target);
      }, 420);
    },
    [onEnter],
  );

  const cardItem = useMemo(
    () => DOCK_ITEMS.find((item) => item.id === activeCard) ?? null,
    [activeCard],
  );

  return (
    <main
      className={`relative h-dvh w-screen overflow-hidden bg-[#171815] transition-opacity duration-[420ms] ease-out ${
        closing ? "opacity-0" : "opacity-100"
      }`}
      aria-label="Inicio viw"
    >
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 0, 0], fov: 78, near: 0.1, far: 100 }}
          dpr={[1, 1.75]}
          flat
          gl={{ antialias: true, powerPreference: "high-performance" }}
          onCreated={({ gl }) => gl.setClearColor("#171815", 1)}
        >
          <color attach="background" args={["#171815"]} />
          <Suspense fallback={null}>
            <PanoramaSphere />
          </Suspense>
        </Canvas>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(36,35,33,0.45)_0%,rgba(24,23,21,0.88)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#171815]/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#171815]/85 to-transparent" />

      {/* Header */}
      <header className="absolute inset-x-0 top-0 z-30 px-4 pt-4 md:px-6 md:pt-5">
        <div className="mx-auto flex max-w-[1640px] items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-[10px] border border-viw-accent/30 bg-viw-accent/10">
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
            <div className="flex flex-col leading-none">
              <span className="flex items-baseline gap-1.5">
                <span className="font-display text-[21px] font-semibold tracking-[-0.06em] text-viw-text">
                  viw
                </span>
                <span className="hidden text-[8px] font-medium uppercase tracking-[0.16em] text-viw-text/40 sm:inline">
                  by Ultea
                </span>
              </span>
              <span className="mt-1 hidden text-[7px] font-medium uppercase tracking-[0.22em] text-viw-text/38 md:block">
                Interactive showroom
              </span>
            </div>
          </div>
          <span className="viw-glass rounded-full px-3 py-1.5 text-[8px] font-medium uppercase tracking-[0.16em] text-viw-text/60">
            Demo interactivo · Proyecto conceptual
          </span>
        </div>
      </header>

      {/* Hero */}
      <div className="absolute inset-0 z-20 flex items-center justify-center px-4">
        <div className="mx-auto flex max-w-[720px] flex-col items-center text-center">
          <p className="text-[9px] font-medium uppercase tracking-[0.24em] text-viw-accent/80">
            viw · Interactive Real Estate Showroom
          </p>
          <h1 className="mt-4 font-display text-[clamp(2.2rem,5.2vw,4.6rem)] font-medium leading-[0.95] tracking-[-0.06em] text-white/95 drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
            Tu preventa inmobiliaria, viva en cualquier pantalla.
          </h1>
          <p className="mt-4 max-w-[560px] text-[12px] leading-[1.7] text-white/60 drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
            Sustituye los PDFs estáticos y listas de precios desactualizadas por
            un showroom interactivo con inventario en tiempo real y recorridos
            360°/VR.
          </p>
          <button
            type="button"
            onClick={() => handleEnter("aerial")}
            className="mt-7 flex h-12 items-center gap-2 rounded-full bg-viw-accent px-7 text-[11px] font-bold uppercase tracking-[0.14em] text-[#242321] shadow-[0_0_40px_rgba(92,225,230,0.35)] transition-transform hover:scale-[1.03]"
          >
            Explorar Demo (Proyecto Zpyra)
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setLaunchOpen(true)}
            className="mt-3 text-[10px] font-medium uppercase tracking-[0.16em] text-viw-text/45 underline-offset-4 transition-colors hover:text-viw-accent hover:underline"
          >
            Quiero viw en mi desarrollo →
          </button>
          <p className="mt-5 max-w-[520px] text-xs leading-relaxed text-[#EEF4F4]/70">
            *Nota: Zpyra es un desarrollo arquitectónico conceptual creado
            exclusivamente como entorno de demostración para viw. Datos,
            disponibilidad y precios son simulados.*
          </p>
        </div>
      </div>

      {/* Dock (side on desktop, bottom on mobile) */}
      {/* Dock on the left side (like the demo side nav); modals at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-30 px-3 pb-4 md:bottom-auto md:left-4 md:right-auto md:top-1/2 md:-translate-y-1/2 md:px-0 md:pb-0">
        <div className="mx-auto max-w-[920px] md:mx-0 md:max-w-none">
          <div className="viw-glass flex items-center justify-center gap-1 rounded-[22px] p-1.5 md:flex-col md:items-stretch md:justify-center">
            {DOCK_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeCard === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    setActiveCard((current) =>
                      current === item.id ? null : item.id,
                    )
                  }
                  className={`group flex flex-1 flex-col items-center gap-1 rounded-[16px] px-1 py-2 transition-all sm:px-2 md:flex-none md:px-2 md:py-2.5 ${
                    isActive
                      ? "bg-viw-accent/[0.12] text-viw-accent"
                      : "text-viw-text/45 hover:bg-viw-text/[0.05] hover:text-viw-text/80"
                  }`}
                >
                  <Icon className="h-[17px] w-[17px] stroke-[1.45]" />
                  <span className="hidden max-w-[90px] truncate text-[8px] font-medium tracking-[-0.01em] sm:block md:max-w-[70px]">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating module card at the bottom */}
      {cardItem ? (
        <div className="absolute bottom-4 left-1/2 z-30 w-[calc(100%-2rem)] max-w-[460px] -translate-x-1/2 md:bottom-6">
          <div className="viw-glass rounded-[20px] p-4 animate-panel-in">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="viw-eyebrow">{cardItem.label}</p>
                <h3 className="mt-1 font-display text-[16px] font-medium tracking-[-0.03em] text-viw-text">
                  {cardItem.title}
                </h3>
                <p className="mt-1.5 text-[10px] leading-relaxed text-viw-text/45">
                  {cardItem.description}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveCard(null)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-viw-text/40 hover:bg-viw-text/10 hover:text-viw-text"
                aria-label="Cerrar detalle"
              >
                ×
              </button>
            </div>
            <button
              type="button"
              onClick={() => handleEnter(cardItem.id)}
              className="mt-3 flex h-9 items-center gap-2 rounded-full bg-viw-accent/90 px-4 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#242321] transition-colors hover:bg-viw-accent"
            >
              Probar este módulo en el demo →
            </button>
          </div>
        </div>
      ) : null}
      <LaunchYourProjectModal
        open={launchOpen}
        onClose={() => setLaunchOpen(false)}
      />
    </main>
  );
}