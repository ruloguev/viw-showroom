import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import { InventoryProvider } from "@/context/InventoryContext";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "viw · Interactive Sales Showroom",
  description:
    "Plataforma inmersiva de venta inmobiliaria para Zpyra, una colección residencial de Ultea en el corredor Mérida–Progreso. Masterplan, torre interactiva, tours 360° y disponibilidad en vivo.",
  applicationName: "viw — Interactive Real Estate Showroom",
  authors: [{ name: "Ultea", url: "https://ultea.space" }],
  creator: "Ultea",
  keywords: [
    "PropTech",
    "real estate",
    "showroom interactivo",
    "Zpyra",
    "Ultea",
    "residencias de lujo",
    "tour 360",
  ],
  openGraph: {
    title: "viw · Interactive Sales Showroom — Zpyra",
    description:
      "Descubre Zpyra: masterplan interactivo, fachada residencial, tours 360° y una experiencia de venta inmobiliaria diseñada por Ultea.",
    siteName: "viw by Ultea",
    type: "website",
    locale: "es_MX",
  },
  twitter: {
    card: "summary_large_image",
    title: "viw · Interactive Sales Showroom — Zpyra",
    description: "Una nueva forma de descubrir y vender arquitectura.",
  },
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='16' fill='%2331302D'/%3E%3Cpath d='M13 21h7l5 15 5-15h5l5 15 5-15h7L42 45h-5l-5-14-5 14h-5L13 21z' fill='%23EEF4F4'/%3E%3Ccircle cx='50' cy='17' r='4' fill='%235CE1E6'/%3E%3C/svg%3E",
  },
};

export const viewport: Viewport = {
  themeColor: "#31302D",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#31302D] font-sans text-[#EEF4F4]">
        <InventoryProvider>{children}</InventoryProvider>
      </body>
    </html>
  );
}
