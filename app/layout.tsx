import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AmbientMix - Add rain, thunder, and ambience to your audio",
  description: "Upload your track, layer in ambience, export perfect loops for YouTube, sleep, study, and meditation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

