"use client";

import { useSubscriptionStatus } from "@/app/hooks/useSubscriptionStatus";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProGate({ children }: { children: React.ReactNode }) {
  const sub = useSubscriptionStatus();

  if (!sub) {
    return (
      <div className="text-center p-6 border rounded-xl bg-muted">
        <div>Checking Pro status…</div>
      </div>
    );
  }

  // User is NOT Pro
  if (sub.status === "none") {
    return (
      <div className="text-center p-6 border rounded-xl bg-muted">
        <h2 className="text-xl font-semibold mb-2">Pro Feature</h2>
        <p className="text-muted-foreground mb-4">
          Unlock this feature with AmbientMix Pro or Lifetime Access.
        </p>
        <Link href="/pricing">
          <Button>Upgrade Now</Button>
        </Link>
      </div>
    );
  }

  // User IS Pro → show real feature
  return <>{children}</>;
}

