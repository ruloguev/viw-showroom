export type UnitStatus = "available" | "reserved" | "sold";

export type UnitFilter = "all" | "available";

export type ShowroomView =
  | "aerial"
  | "tower"
  | "units"
  | "tour"
  | "location";

export interface PlatformConfig {
  name: string;
  fullName: string;
  developer: string;
  developerUrl: string;
  whatsappNumber: string;
  contactEmail: string;
  demoProjectName: string;
}

export interface ProjectImageSet {
  aerial: string;
  day: string;
  night: string;
}

export interface FacadeGeometry {
  /** Polygon coordinates in the 1600 × 900 facade viewBox. */
  points: string;
  labelX: number;
  labelY: number;
  level: string;
}

export interface Unit {
  id: string;
  code: string;
  name: string;
  model: string;
  status: UnitStatus;
  priceUsd: number;
  areaM2: number;
  terraceM2: number;
  bedrooms: number;
  bathrooms: number;
  parkingSpots: number;
  floor: number;
  quadrant?: "N" | "E" | "S" | "W";
  orientation: string;
  view: string;
  description: string;
  amenities: string[];
  highlights: string[];
  tourSceneId: string;
  facade: FacadeGeometry;
}

export interface AerialPin {
  id: string;
  eyebrow: string;
  label: string;
  description: string;
  position: {
    x: number;
    y: number;
  };
  action: "detail" | "tower";
  ctaLabel: string;
  statLabel: string;
  statValue: string;
}

export interface Hotspot {
  id: string;
  label: string;
  targetSceneId: string;
  /** Three.js world coordinates inside the 360° sphere. */
  position: [number, number, number];
}

export interface Scene360 {
  id: string;
  name: string;
  shortName: string;
  caption: string;
  image: string;
  initialYaw: number;
  hotspots: Hotspot[];
}

export type POICategory = "park" | "lifestyle" | "transport" | "health";

export interface POILocation {
  id: string;
  name: string;
  category: POICategory;
  description: string;
  distanceKm: number;
  mapPosition: {
    x: number;
    y: number;
  };
  coordinates: {
    lat: number;
    lng: number;
  };
  routeLabel: string;
}

export interface ProjectData {
  id: string;
  slug: string;
  name: string;
  descriptor: string;
  location: string;
  shortLocation: string;
  tagline: string;
  description: string;
  status: string;
  delivery: string;
  priceFromUsd: number;
  totalUnits: number;
  images: ProjectImageSet;
  amenities: string[];
  pins: AerialPin[];
  units: Unit[];
  scenes: Scene360[];
  pois: POILocation[];
}
