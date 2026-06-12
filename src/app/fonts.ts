import localFont from "next/font/local";

// Self-hosted (hermetic build — no Google Fonts fetch). General Sans is the
// workbench chassis; JetBrains Mono carries the document and every value.

export const generalSans = localFont({
  src: [
    { path: "../fonts/general-sans-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/general-sans-500.woff2", weight: "500", style: "normal" },
    { path: "../fonts/general-sans-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-general-sans",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

export const jetbrainsMono = localFont({
  src: [
    { path: "../fonts/jetbrains-mono-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/jetbrains-mono-500.woff2", weight: "500", style: "normal" },
    { path: "../fonts/jetbrains-mono-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-jetbrains-mono",
  display: "swap",
  fallback: ["ui-monospace", "SFMono-Regular", "monospace"],
});
