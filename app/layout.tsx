import type { Metadata } from "next";
import "./globals.css";
import { UserProvider } from "@/app/context/UserContext";

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
      <body>
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}

