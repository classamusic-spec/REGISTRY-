import { Comforter_Brush, Cormorant_Garamond, Patrick_Hand } from "next/font/google";
import "./globals.css";
import { config } from "../lib/config";

const script = Comforter_Brush({ weight: "400", subsets: ["latin"], variable: "--font-script" });
const hand = Patrick_Hand({ weight: "400", subsets: ["latin"], variable: "--font-hand" });
const serif = Cormorant_Garamond({ weight: ["500", "600"], subsets: ["latin"], variable: "--font-serif" });

export const metadata = {
  title: `A Sweet Little Hunny — ${config.momName}'s Baby Registry`,
  description: `Baby shower gift registry for ${config.momName}. Pick a gift and mark it purchased so nobody doubles up.`,
  icons: { icon: "/icon.svg" },
  openGraph: {
    title: "A sweet little hunny is on the way 🍯",
    description: `Baby shower registry for ${config.momName}`,
  },
};

export const viewport = { themeColor: "#FFF7DD" };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${script.variable} ${hand.variable} ${serif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
