"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSubscriptionStatus } from "@/app/lib/getSubscriptionStatus";

export default function Home() {
  const [subStatus, setSubStatus] = useState<null | any>(null);

  useEffect(() => {
    const customerId = document.cookie
      .split("; ")
      .find((c) => c.startsWith("stripe_customer_id="))
      ?.split("=")[1] || null;

    if (!customerId) {
      setSubStatus({ status: "none" });
      return;
    }

    getSubscriptionStatus(customerId).then(setSubStatus);
  }, []);

  if (!subStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center">
        <div>Loading subscription…</div>
      </div>
    );
  }

  // Show subscription status banner
  const statusBanner = subStatus.status === "none" ? (
    <div className="text-center mb-8 p-4 bg-muted rounded-lg">
      <p className="text-lg mb-4">You are not a Pro user.</p>
      <Link href="/pricing">
        <Button>Upgrade to Pro</Button>
      </Link>
    </div>
  ) : subStatus.type === "lifetime" ? (
    <div className="text-center mb-8 p-4 bg-primary/10 rounded-lg">
      <div className="text-xl font-semibold">🔥 Lifetime Access Active</div>
    </div>
  ) : subStatus.type === "subscription" ? (
    <div className="text-center mb-8 p-4 bg-primary/10 rounded-lg">
      <div className="text-xl font-semibold">⭐ Pro Monthly Active</div>
    </div>
  ) : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-16">
        {/* Subscription Status Banner */}
        {statusBanner}

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Add rain, thunder, and ambience to your audio – in one click.
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Upload your track, layer in ambience, export perfect loops for YouTube, sleep, study, and meditation.
          </p>
          <Link href="/studio">
            <Button size="lg" className="text-lg px-8 py-6">
              Open Mixer
            </Button>
          </Link>
        </div>

        {/* How it Works Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <CardTitle>Upload your audio</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Drop your MP3 or WAV file. We support files up to 100 MB.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <CardTitle>Add ambience layers</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Layer in copyright-free rain, thunder, room tones, and more. Adjust volume and warmth to taste.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <CardTitle>Export a perfect loop</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Choose your duration (10, 30, or 60 minutes) and download a seamlessly looped MP3 mix.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-muted-foreground">
          <p>AmbientMix (beta) • No account required • All processing happens in your browser</p>
        </div>
      </div>
    </div>
  );
}

