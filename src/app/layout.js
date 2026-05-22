import { Playfair_Display, Outfit } from "next/font/google";
import "./globals.css";
import Noise from "@/components/Noise";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Jahnvi | Portfolio • Political Ecology, Green Governance & Sustainable Development",
  description: "Academic research and writing portfolio of Jahnvi, exploring political ecology, green governance, sustainable development, and Sanskrit-inspired ecological co-existence (Sarva Saha).",
  keywords: ["Jahnvi", "Political Ecology", "Green Governance", "Sustainable Development", "Sarva Saha", "UGC NET JRF", "Ecology Researcher"],
  authors: [{ name: "Jahnvi" }],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${playfair.variable} ${outfit.variable} h-full antialiased`}>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-cream text-charcoal" style={{ backgroundColor: '#FBF5E8' }}>
        <Noise />
        {children}
      </body>
    </html>
  );
}
