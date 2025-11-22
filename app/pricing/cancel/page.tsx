"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function CancelPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-4">
      <AlertTriangle className="w-20 h-20 text-muted-foreground mb-6" />
      <h1 className="text-3xl font-bold mb-2">Payment Cancelled</h1>
      <p className="text-muted-foreground mb-6 max-w-md">
        No payment was processed. You can return to the pricing page if you&apos;d like to try again.
      </p>
      <Link href="/pricing">
        <Button variant="secondary" size="lg">
          Back to Pricing
        </Button>
      </Link>
    </div>
  );
}

