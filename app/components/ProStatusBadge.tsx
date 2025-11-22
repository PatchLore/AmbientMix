"use client";

import { useSubscriptionStatus } from "@/app/hooks/useSubscriptionStatus";
import Link from "next/link";

export default function ProStatusBadge() {
  const sub = useSubscriptionStatus();

  if (!sub) {
    return (
      <div className="px-3 py-1 rounded-lg bg-muted text-muted-foreground text-sm animate-pulse">
        Checking…
      </div>
    );
  }

  // Lifetime Access Badge
  if (sub.type === "lifetime") {
    return (
      <div className="px-3 py-1 rounded-lg bg-orange-500 text-white font-medium shadow">
        🔥 Lifetime
      </div>
    );
  }

  // Monthly Subscription Badge
  if (sub.type === "subscription") {
    return (
      <div className="px-3 py-1 rounded-lg bg-purple-600 text-white font-medium shadow">
        ⭐ Pro
      </div>
    );
  }

  // Free User
  return (
    <Link
      href="/pricing"
      className="px-3 py-1 rounded-lg bg-blue-600 text-white font-medium shadow hover:bg-blue-700 transition"
    >
      Upgrade →
    </Link>
  );
}

