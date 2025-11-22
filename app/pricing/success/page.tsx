"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  // Read session_id from URL for future use (not displayed)
  const sessionId = searchParams.get("session_id");
  // sessionId is available but not displayed

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-4">
      <CheckCircle2 className="w-20 h-20 text-primary mb-6" />
      <h1 className="text-3xl font-bold mb-2">Payment Successful</h1>
      <p className="text-muted-foreground mb-6 max-w-md">
        Your AmbientMix access is now active. You can close this page or return to the app.
      </p>
      <Link href="/">
        <Button size="lg">
          Return Home
        </Button>
      </Link>
    </div>
  );
}

