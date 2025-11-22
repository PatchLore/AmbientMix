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
          <footer className="w-full text-center py-6 text-sm text-muted-foreground border-t mt-auto">
            <a href="/legal/terms" className="mx-3 hover:underline">Terms</a>
            <a href="/legal/privacy" className="mx-3 hover:underline">Privacy</a>
          </footer>
        </UserProvider>
      </body>
    </html>
  );
}

