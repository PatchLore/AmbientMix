"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

async function handleCheckout(priceId: string) {
  try {
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId }),
    });

    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Unable to start checkout session.");
    }
  } catch (err) {
    console.error("Checkout error:", err);
    alert("An error occurred.");
  }
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* FREE Plan */}
          <Card>
            <CardHeader>
              <CardTitle>FREE</CardTitle>
              <div className="mt-4">
                <span className="text-3xl font-bold">£0</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-px w-full bg-border" />
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Export up to 5 minutes</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Basic ambience (rain, window rain, thunder)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Mix 1 track</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Standard quality</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Occasional watermark</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Start Free
              </Button>
            </CardFooter>
          </Card>

          {/* PRO Plan - Highlighted */}
          <Card className="border-primary/50">
            <CardHeader>
              <CardTitle>PRO</CardTitle>
              <div className="mt-4">
                <span className="text-3xl font-bold">£6.99</span>
                <span className="text-muted-foreground ml-2">/mo</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-px w-full bg-border" />
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Unlimited export length</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Unlimited ambience layers</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">No watermark</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">High-quality export</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Save presets</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Creator Mode (faster rendering)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Full SFX library</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Priority rendering</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full"
                onClick={() => handleCheckout(process.env.NEXT_PUBLIC_PRO_MONTHLY_PRICE_ID!)}
              >
                Upgrade to Pro
              </Button>
            </CardFooter>
          </Card>

          {/* LIFETIME Plan */}
          <Card>
            <CardHeader>
              <CardTitle>LIFETIME</CardTitle>
              <div className="mt-4">
                <span className="text-3xl font-bold">£89</span>
                <span className="text-muted-foreground ml-2">one-time</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-px w-full bg-border" />
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Everything in Pro</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">All future updates</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">AmbientVideoLab included</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Advanced formats</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Batch rendering</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Early access features</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                variant="secondary" 
                className="w-full"
                onClick={() => handleCheckout(process.env.NEXT_PUBLIC_LIFETIME_PRICE_ID!)}
              >
                Get Lifetime Access
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
