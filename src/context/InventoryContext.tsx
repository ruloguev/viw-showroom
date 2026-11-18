"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ZPYRA_DEMO } from "@/data/zpyra-demo";
import type { Unit, UnitStatus } from "@/types/viw.types";

const STORAGE_KEY = "viw_zpyra_demo_inventory";

interface InventoryContextValue {
  units: Unit[];
  setUnitStatus: (unitId: string, status: UnitStatus) => void;
  setUnitPrice: (unitId: string, priceUsd: number) => void;
  resetInventory: () => void;
}

const InventoryContext = createContext<InventoryContextValue | null>(null);

function readStored(): Unit[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Unit[];
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

function persist(units: Unit[]) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(units));
  } catch {
    // Ignore storage restrictions.
  }
}

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [units, setUnits] = useState<Unit[]>(() => {
    const stored = readStored();
    return stored ?? ZPYRA_DEMO.units;
  });

  useEffect(() => {
    persist(units);
  }, [units]);

  const setUnitStatus = useCallback((unitId: string, status: UnitStatus) => {
    setUnits((current) =>
      current.map((unit) =>
        unit.id === unitId ? { ...unit, status } : unit,
      ),
    );
  }, []);

  const setUnitPrice = useCallback((unitId: string, priceUsd: number) => {
    setUnits((current) =>
      current.map((unit) =>
        unit.id === unitId ? { ...unit, priceUsd } : unit,
      ),
    );
  }, []);

  const resetInventory = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        window.sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore.
      }
    }
    setUnits(ZPYRA_DEMO.units);
  }, []);

  const value = useMemo(
    () => ({ units, setUnitStatus, setUnitPrice, resetInventory }),
    [units, setUnitStatus, setUnitPrice, resetInventory],
  );

  return (
    <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>
  );
}

export function useZpyraInventory() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error("useZpyraInventory must be used within InventoryProvider");
  }
  return context;
}