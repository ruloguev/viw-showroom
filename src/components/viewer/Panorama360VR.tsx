"use client";

import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { XR, createXRStore } from "@react-three/xr";
import {
  ArrowRight,
  Glasses,
  LoaderCircle,
  MousePointer2,
  RotateCcw,
} from "lucide-react";
import Image from "next/image";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as THREE from "three";
import type { Hotspot, Scene360 } from "@/types/viw.types";

interface Panorama360VRProps {
  scenes: Scene360[];
  activeSceneId: string;
  onSceneChange: (sceneId: string) => void;
}

type RotationTarget = {
  yaw: number;
  pitch: number;
};

type XRNavigator = Navigator & {
  xr?: {
    isSessionSupported: (mode: string) => Promise<boolean>;
  };
};

function getSceneIndex(scenes: Scene360[], sceneId: string) {
  const index = scenes.findIndex((scene) => scene.id === sceneId);
  return index >= 0 ? index : 0;
}

export default function Panorama360VR({
  scenes,
  activeSceneId,
  onSceneChange,
}: Panorama360VRProps) {
  const [xrStore] = useState(() => createXRStore());
  const activeIndex = getSceneIndex(scenes, activeSceneId);
  const activeScene = scenes[activeIndex];
  const rotationTarget = useRef<RotationTarget>({
    yaw: activeScene.initialYaw,
    pitch: 0,
  });
  const dragState = useRef({
    active: false,
    lastX: 0,
    lastY: 0,
  });
  const dragDistance = useRef(0);
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [ready, setReady] = useState(false);
  const [blackout, setBlackout] = useState(false);
  const [supportsVR, setSupportsVR] = useState(false);
  const [enteringVR, setEnteringVR] = useState(false);
  const [vrError, setVrError] = useState(false);

  const handleReady = useCallback(() => setReady(true), []);

  useEffect(() => {
    const nextScene = scenes[getSceneIndex(scenes, activeSceneId)];
    rotationTarget.current = {
      yaw: nextScene.initialYaw,
      pitch: 0,
    };
  }, [activeSceneId, scenes]);

  useEffect(() => {
    const xr = (navigator as XRNavigator).xr;
    if (!xr?.isSessionSupported) return;

    let mounted = true;
    xr.isSessionSupported("immersive-vr")
      .then((supported) => {
        if (mounted) setSupportsVR(supported);
      })
      .catch(() => {
        if (mounted) setSupportsVR(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      if (!dragState.current.active) return;

      const deltaX = event.clientX - dragState.current.lastX;
      const deltaY = event.clientY - dragState.current.lastY;
      dragState.current.lastX = event.clientX;
      dragState.current.lastY = event.clientY;
      dragDistance.current += Math.abs(deltaX) + Math.abs(deltaY);

      rotationTarget.current.yaw -= deltaX * 0.0044;
      rotationTarget.current.pitch = THREE.MathUtils.clamp(
        rotationTarget.current.pitch - deltaY * 0.0032,
        -0.52,
        0.52,
      );
    }

    function finishDrag() {
      if (!dragState.current.active) return;
      dragState.current.active = false;
      setIsDragging(false);
    }

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    window.addEventListener("pointerup", finishDrag);
    window.addEventListener("pointercancel", finishDrag);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", finishDrag);
      window.removeEventListener("pointercancel", finishDrag);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (transitionTimer.current) clearTimeout(transitionTimer.current);
    };
  }, []);

  function handlePointerDown(event: React.PointerEvent<HTMLElement>) {
    if (event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (target.closest("[data-ui='true']")) return;

    dragState.current = {
      active: true,
      lastX: event.clientX,
      lastY: event.clientY,
    };
    dragDistance.current = 0;
    setIsDragging(true);
    setHasInteracted(true);
  }

  function transitionToScene(sceneId: string) {
    if (sceneId === activeSceneId) return;
    if (transitionTimer.current) clearTimeout(transitionTimer.current);

    setBlackout(true);
    transitionTimer.current = setTimeout(() => {
      onSceneChange(sceneId);
      setBlackout(false);
    }, 220);
  }

  function resetView() {
    const currentScene = scenes[getSceneIndex(scenes, activeSceneId)];
    rotationTarget.current = {
      yaw: currentScene.initialYaw,
      pitch: 0,
    };
  }

  async function enterVR() {
    setVrError(false);
    setEnteringVR(true);
    try {
      await xrStore.enterVR();
    } catch {
      setVrError(true);
    } finally {
      setEnteringVR(false);
    }
  }

  return (
    <section
      className={`relative h-full w-full select-none overflow-hidden bg-[#171815] ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
      onPointerDown={handlePointerDown}
      style={{ touchAction: "none" }}
      aria-label="Tour virtual 360 grados de Zpyra"
    >
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 0, 0], fov: 78, near: 0.1, far: 100 }}
          dpr={[1, 1.75]}
          flat
          gl={{ antialias: true, powerPreference: "high-performance" }}
          onCreated={({ gl }) => {
            gl.setClearColor("#171815", 1);
          }}
        >
          <color attach="background" args={["#171815"]} />
          <XR store={xrStore}>
            <Suspense fallback={null}>
              <PanoramaScene
                scenes={scenes}
                activeIndex={activeIndex}
                rotationTarget={rotationTarget}
                dragDistance={dragDistance}
                onNavigate={transitionToScene}
                onReady={handleReady}
              />
            </Suspense>
          </XR>
        </Canvas>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-72 bg-gradient-to-b from-[#242321]/85 via-[#242321]/35 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[440px] bg-gradient-to-r from-[#101210]/55 via-[#101210]/15 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-64 bg-gradient-to-t from-[#101210]/85 via-[#101210]/25 to-transparent" />

      <div className="pointer-events-none absolute left-4 top-[91px] z-20 max-w-[68%] text-shadow-soft md:left-[104px] md:top-[112px] lg:left-[116px] lg:top-[122px]">
        <div className="flex items-center gap-2">
          <span className="h-px w-5 bg-viw-accent/70" />
          <p className="text-[8px] font-medium uppercase tracking-[0.22em] text-white/55">
            Vista 03 · Tour inmersivo
          </p>
        </div>

        <div className="mt-3 flex items-end gap-3">
          <span className="font-display text-[clamp(2.45rem,4.7vw,4.7rem)] font-medium leading-[0.9] tracking-[-0.065em] text-white/92 drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
            360°
          </span>
          <div className="mb-1 hidden items-center gap-2 rounded-full border border-white/12 bg-black/15 px-2.5 py-1.5 backdrop-blur-sm sm:flex">
            <span className="h-1.5 w-1.5 animate-soft-pulse rounded-full bg-viw-accent" />
            <span className="text-[7px] font-medium uppercase tracking-[0.16em] text-white/45">
              Panorama navegable
            </span>
          </div>
        </div>

        <div className="mt-4 border-l border-white/15 pl-3">
          <p className="text-[8px] font-medium uppercase tracking-[0.16em] text-viw-accent/85">
            {String(activeIndex + 1).padStart(2, "0")} /{" "}
            {String(scenes.length).padStart(2, "0")} · {activeScene.shortName}
          </p>
          <h1 className="mt-1.5 font-display text-[19px] font-medium tracking-[-0.035em] text-white/85 drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)] sm:text-[24px]">
            {activeScene.name}
          </h1>
          <p className="mt-1.5 hidden max-w-[270px] text-[9px] leading-[1.65] text-white/50 lg:block">
            {activeScene.caption}
          </p>
        </div>
      </div>

      <div
        data-ui="true"
        className="absolute right-3 top-[88px] z-30 flex items-center gap-1.5 md:right-5 md:top-[112px]"
      >
        {supportsVR ? (
          <button
            type="button"
            onClick={enterVR}
            disabled={enteringVR}
            className="viw-glass flex h-9 items-center gap-2 rounded-full px-3 text-[8px] font-medium uppercase tracking-[0.1em] text-viw-text/70 transition-colors hover:border-viw-accent/30 hover:text-viw-accent disabled:opacity-50"
          >
            {enteringVR ? (
              <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Glasses className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">
              {enteringVR ? "Conectando" : "Entrar en VR"}
            </span>
            <span className="sm:hidden">VR</span>
          </button>
        ) : null}
        <button
          type="button"
          onClick={resetView}
          className="viw-glass flex h-9 w-9 items-center justify-center rounded-full text-viw-text/55 transition-colors hover:border-viw-accent/30 hover:text-viw-accent"
          aria-label="Centrar vista"
          title="Centrar vista"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      {vrError ? (
        <div
          data-ui="true"
          className="absolute right-3 top-[132px] z-30 rounded-xl border border-status-reserved/25 bg-[#242321]/75 px-3 py-2 text-[8px] text-status-reserved/90 backdrop-blur-xl md:right-5 md:top-[158px]"
        >
          No fue posible iniciar WebXR en este dispositivo.
        </div>
      ) : null}

      <div
        data-ui="true"
        className="absolute inset-x-3 bottom-[84px] z-30 mx-auto max-w-[640px] md:bottom-5"
      >
        <div className="mb-2 flex items-center justify-between px-1">
          <p className="flex items-center gap-1.5 text-[7px] font-medium uppercase tracking-[0.15em] text-white/32">
            <MousePointer2 className="h-3 w-3 text-white/25" />
            Arrastra para mirar
          </p>
          <p className="text-[7px] font-medium uppercase tracking-[0.15em] text-white/25">
            {activeScene.shortName} · {activeScene.hotspots.length} conexiones
          </p>
        </div>

        <div className="viw-glass flex items-stretch gap-1 rounded-[18px] p-1.5">
          {scenes.map((scene, index) => {
            const isActive = scene.id === activeSceneId;

            return (
              <button
                key={scene.id}
                type="button"
                onClick={() => transitionToScene(scene.id)}
                aria-current={isActive ? "true" : undefined}
                aria-label={`Ir a ${scene.name}`}
                className={`group relative min-w-0 flex-1 overflow-hidden rounded-[12px] border p-1 text-left transition-all duration-300 ${
                  isActive
                    ? "border-viw-accent/35 bg-viw-accent/[0.08]"
                    : "border-transparent hover:bg-white/[0.045]"
                }`}
              >
                <div className="relative aspect-[16/8] overflow-hidden rounded-[8px]">
                  <Image
                    src={scene.image}
                    alt={scene.name}
                    fill
                    sizes="160px"
                    className={`object-cover transition-all duration-700 ${
                      isActive
                        ? "opacity-90"
                        : "opacity-52 group-hover:opacity-75"
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                  <span className="absolute left-1.5 top-1.5 rounded bg-black/35 px-1 py-0.5 font-display text-[6px] font-medium text-white/55 backdrop-blur-sm">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {isActive ? (
                    <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-viw-accent shadow-[0_0_8px_rgba(92,225,230,0.9)]" />
                  ) : null}
                </div>
                <div className="flex items-center justify-between gap-1 px-0.5 pb-0.5 pt-1.5">
                  <span
                    className={`truncate text-[8px] font-medium tracking-[-0.01em] ${
                      isActive ? "text-viw-accent" : "text-white/40"
                    }`}
                  >
                    {scene.shortName}
                  </span>
                  {isActive ? (
                    <ArrowRight className="h-2.5 w-2.5 shrink-0 text-viw-accent/60" />
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div
        data-ui="true"
        className={`pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-500 ${
          hasInteracted ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="viw-glass flex items-center gap-2 rounded-full px-4 py-2.5 shadow-2xl">
          <MousePointer2 className="h-3.5 w-3.5 text-viw-accent" />
          <span className="text-[9px] font-medium uppercase tracking-[0.16em] text-white/75">
            Arrastra para explorar en 360°
          </span>
        </div>
      </div>

      <div
        className={`pointer-events-none absolute inset-0 z-40 bg-[#0f100e] transition-opacity duration-300 ${
          blackout ? "opacity-90" : "opacity-0"
        }`}
      />

      <div
        className={`pointer-events-none absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-[#171815] transition-opacity duration-700 ${
          ready ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-white/10">
          <span className="absolute inset-0 animate-spin-slow rounded-full border border-dashed border-viw-accent/25" />
          <span className="h-1.5 w-1.5 rounded-full bg-viw-accent shadow-[0_0_16px_rgba(92,225,230,0.8)]" />
        </div>
        <p className="text-[8px] font-medium uppercase tracking-[0.18em] text-white/30">
          Preparando recorrido inmersivo
        </p>
      </div>

      <p className="sr-only" aria-live="polite">
        Escena actual: {activeScene.name}. {activeScene.caption}
      </p>
    </section>
  );
}

function PanoramaScene({
  scenes,
  activeIndex,
  rotationTarget,
  dragDistance,
  onNavigate,
  onReady,
}: {
  scenes: Scene360[];
  activeIndex: number;
  rotationTarget: { current: RotationTarget };
  dragDistance: { current: number };
  onNavigate: (sceneId: string) => void;
  onReady: () => void;
}) {
  const group = useRef<THREE.Group>(null);
  const textures = useLoader(
    THREE.TextureLoader,
    scenes.map((scene) => scene.image),
  ) as THREE.Texture[];

  useEffect(() => {
    textures.forEach((texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.minFilter = THREE.LinearFilter;
      texture.needsUpdate = true;
    });
    onReady();
  }, [textures, onReady]);

  useFrame((_, delta) => {
    if (!group.current) return;
    const easing = 1 - Math.exp(-9 * delta);
    group.current.rotation.y = THREE.MathUtils.lerp(
      group.current.rotation.y,
      rotationTarget.current.yaw,
      easing,
    );
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      rotationTarget.current.pitch,
      easing,
    );
  });

  const activeScene = scenes[activeIndex] ?? scenes[0];

  return (
    <group ref={group}>
      <mesh
        scale={[-1, 1, 1]}
        rotation={[0, -Math.PI / 2, 0]}
        renderOrder={-1}
      >
        <sphereGeometry args={[50, 72, 48]} />
        <meshBasicMaterial
          map={textures[activeIndex]}
          side={THREE.BackSide}
          toneMapped={false}
        />
      </mesh>

      {activeScene.hotspots.map((hotspot, index) => (
        <SceneHotspot
          key={`${activeScene.id}-${hotspot.id}`}
          hotspot={hotspot}
          index={index}
          dragDistance={dragDistance}
          onNavigate={onNavigate}
        />
      ))}
    </group>
  );
}

function SceneHotspot({
  hotspot,
  index,
  dragDistance,
  onNavigate,
}: {
  hotspot: Hotspot;
  index: number;
  dragDistance: { current: number };
  onNavigate: (sceneId: string) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const markerTexture = useMemo(() => createMarkerTexture(), []);
  const label = useMemo(
    () => createLabelTexture(hotspot.label),
    [hotspot.label],
  );

  useFrame(({ clock }, delta) => {
    if (!group.current) return;
    const targetScale = hovered ? 1.16 : 1;
    const nextScale = THREE.MathUtils.lerp(
      group.current.scale.x,
      targetScale,
      1 - Math.exp(-10 * delta),
    );
    group.current.scale.setScalar(nextScale);
    group.current.position.y =
      hotspot.position[1] + Math.sin(clock.elapsedTime * 1.45 + index) * 0.075;
  });

  useEffect(() => {
    return () => {
      document.body.style.cursor = "";
    };
  }, []);

  return (
    <group
      ref={group}
      position={hotspot.position}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "";
      }}
      onClick={(event) => {
        event.stopPropagation();
        if (dragDistance.current > 8) return;
        onNavigate(hotspot.targetSceneId);
      }}
    >
      <sprite scale={[1.25, 1.25, 1]} renderOrder={2}>
        <spriteMaterial
          map={markerTexture}
          transparent
          opacity={hovered ? 1 : 0.88}
          depthTest={false}
          depthWrite={false}
          toneMapped={false}
        />
      </sprite>
      <sprite
        position={[0, -0.82, 0]}
        scale={[label.aspect * 0.58, 0.58, 1]}
        renderOrder={3}
      >
        <spriteMaterial
          map={label.texture}
          transparent
          depthTest={false}
          depthWrite={false}
          toneMapped={false}
        />
      </sprite>
    </group>
  );
}

function createMarkerTexture() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.clearRect(0, 0, size, size);

  const glow = ctx.createRadialGradient(
    size / 2,
    size / 2,
    8,
    size / 2,
    size / 2,
    size / 2,
  );
  glow.addColorStop(0, "rgba(92, 225, 230, 0.55)");
  glow.addColorStop(0.42, "rgba(92, 225, 230, 0.16)");
  glow.addColorStop(1, "rgba(92, 225, 230, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);

  ctx.beginPath();
  ctx.arc(size / 2, size / 2, 54, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(28, 31, 29, 0.88)";
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = "rgba(92, 225, 230, 0.95)";
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(size / 2, size / 2, 40, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  const center = size / 2;
  ctx.strokeStyle = "#EEF4F4";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(center - 16, center + 6);
  ctx.lineTo(center + 14, center - 14);
  ctx.moveTo(center - 2, center - 14);
  ctx.lineTo(center + 14, center - 14);
  ctx.lineTo(center + 14, center + 2);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createLabelTexture(label: string) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const dpr = 2;
  const fontSize = 27;
  const horizontalPadding = 78;
  const height = 84;

  if (!ctx) {
    canvas.width = 512;
    canvas.height = height * dpr;
    return {
      texture: new THREE.CanvasTexture(canvas),
      aspect: 512 / height,
    };
  }

  ctx.font = `500 ${fontSize}px "Inter", "Helvetica Neue", sans-serif`;
  const textWidth = Math.ceil(ctx.measureText(label).width);
  const width = Math.max(280, textWidth + horizontalPadding);
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "rgba(30, 32, 29, 0.88)";
  roundedRect(ctx, 2, 4, width - 4, height - 8, height / 2);
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(238, 244, 244, 0.18)";
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(31, height / 2, 5, 0, Math.PI * 2);
  ctx.fillStyle = "#5CE1E6";
  ctx.fill();

  ctx.fillStyle = "#EEF4F4";
  ctx.font = `500 ${fontSize}px "Inter", "Helvetica Neue", sans-serif`;
  ctx.textBaseline = "middle";
  ctx.fillText(label, 48, height / 2 + 1);

  ctx.strokeStyle = "rgba(92, 225, 230, 0.7)";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const arrowX = width - 36;
  ctx.beginPath();
  ctx.moveTo(arrowX - 7, height / 2);
  ctx.lineTo(arrowX + 6, height / 2);
  ctx.moveTo(arrowX + 1, height / 2 - 5);
  ctx.lineTo(arrowX + 6, height / 2);
  ctx.lineTo(arrowX + 1, height / 2 + 5);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.needsUpdate = true;

  return {
    texture,
    aspect: width / height,
  };
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}
