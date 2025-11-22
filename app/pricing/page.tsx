"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Sparkles, Crown } from "lucide-react";
import Link from "next/link";

interface Feature {
  text: string;
  included: boolean;
}

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: Feature[];
  buttonText: string;
  buttonVariant: "default" | "secondary" | "outline";
  highlight?: boolean;
  icon: React.ReactNode;
  badge?: string;
}

const plans: PricingPlan[] = [
  {
    name: "Free",
    price: "£0",
    period: "",
    description: "Perfect for trying out AmbientMix",
    icon: <Sparkles className="w-5 h-5" />,
    features: [
      { text: "Export up to 5 minutes", included: true },
      { text: "Basic ambience (rain, window rain, thunder)", included: true },
      { text: "Mix 1 audio track", included: true },
      { text: "Standard quality export", included: true },
      { text: "Occasional watermark", included: true },
    ],
    buttonText: "Start Free",
    buttonVariant: "outline",
  },
  {
    name: "Pro",
    price: "£6.99",
    period: "/month",
    description: "For creators and professionals",
    icon: <Crown className="w-5 h-5" />,
    badge: "Most Popular",
    highlight: true,
    features: [
      { text: "Unlimited export length", included: true },
      { text: "Unlimited ambience layers", included: true },
      { text: "No watermark", included: true },
      { text: "High-quality export", included: true },
      { text: "Save presets", included: true },
      { text: "Creator Mode (faster rendering)", included: true },
      { text: "Full SFX library (storms, cafe, forest, fire, wind)", included: true },
      { text: "AmbientVideoLab access (Basic)", included: true },
      { text: "Priority rendering", included: true },
    ],
    buttonText: "Upgrade to Pro",
    buttonVariant: "default",
  },
  {
    name: "Lifetime",
    price: "£89",
    period: " one-time",
    description: "Own it forever, get everything",
    icon: <Crown className="w-5 h-5" />,
    features: [
      { text: "Everything in Pro", included: true },
      { text: "All future updates included", included: true },
      { text: "AmbientVideoLab included", included: true },
      { text: "Unlimited ambience packs", included: true },
      { text: "Advanced export formats", included: true },
      { text: "Batch rendering", included: true },
      { text: "Early access features", included: true },
    ],
    buttonText: "Get Lifetime Access",
    buttonVariant: "secondary",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950">
      <div className="container mx-auto px-4 py-16 md:py-24">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-muted-foreground">
            Choose the plan that works for you. Start free, upgrade anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative overflow-hidden transition-all duration-300 ${
                plan.highlight
                  ? "border-primary/50 shadow-lg shadow-primary/20 scale-105 md:scale-110 bg-gradient-to-br from-neutral-900 to-neutral-950"
                  : "border-border/50 hover:border-border bg-neutral-900/50"
              }`}
            >
              {plan.highlight && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/60 to-primary" />
              )}
              
              {plan.badge && (
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    {plan.badge}
                  </span>
                </div>
              )}

              <CardHeader className="pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-2 rounded-lg ${plan.highlight ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {plan.icon}
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                </div>
                <CardDescription className="text-sm mt-2">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && (
                      <span className="text-muted-foreground text-lg">{plan.period}</span>
                    )}
                  </div>
                </div>

                <div className="h-[1px] w-full bg-border/50" />

                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className={`mt-0.5 flex-shrink-0 ${feature.included ? "text-primary" : "text-muted-foreground/30"}`}>
                        {feature.included ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-current" />
                        )}
                      </div>
                      <span className={`text-sm ${feature.included ? "text-foreground" : "text-muted-foreground/50 line-through"}`}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Link href="/studio" className="w-full">
                  <Button
                    variant={plan.buttonVariant}
                    className={`w-full ${plan.highlight ? "bg-primary hover:bg-primary/90" : ""}`}
                    size="lg"
                  >
                    {plan.buttonText}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="h-[1px] w-full bg-border/30" />
          
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">
              Ready to create your first ambient mix?
            </h2>
            <p className="text-muted-foreground">
              Start mixing today. No credit card required.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link href="/studio">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Start Free
              </Button>
            </Link>
            <Link href="/studio">
              <Button size="lg" className="w-full sm:w-auto">
                Upgrade to Pro
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

