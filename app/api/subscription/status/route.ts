import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseServer } from "@/app/lib/supabaseServer";

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return null;
  }
  return new Stripe(secretKey);
}

export async function POST(req: Request) {
  try {
    // Require an authenticated user. The Stripe customer is resolved from
    // the authenticated user's profile, never from an arbitrary browser value.
    const supabase = await supabaseServer();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("customer_id")
      .eq("id", user.id)
      .single();

    const ownedCustomerId: string | null = profile?.customer_id ?? null;

    let requestedCustomerId: unknown = null;
    try {
      const body = await req.json();
      requestedCustomerId = (body as { customerId?: unknown })?.customerId ?? null;
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    // If the caller supplies a customer ID it must match their own profile.
    if (requestedCustomerId != null && requestedCustomerId !== ownedCustomerId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const customerId = ownedCustomerId;

    if (!customerId) {
      return NextResponse.json({
        status: "none",
      });
    }

    const stripe = getStripe();
    if (!stripe) {
      console.error("Subscription status error: Stripe is not configured");
      return NextResponse.json(
        { status: "error", message: "Subscription check unavailable" },
        { status: 500 }
      );
    }

    // Fetch all customer charges (used to detect Lifetime purchases)
    const charges = await stripe.charges.list({
      customer: customerId,
      limit: 100, // across last 100 charges
    });

    const hasLifetime = charges.data.some(
      (c) =>
        c.paid &&
        c.amount === 8900 && // £89 lifetime
        c.status === "succeeded"
    );

    if (hasLifetime) {
      return NextResponse.json({
        status: "active",
        type: "lifetime",
      });
    }

    // Fetch all subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
    });

    const activeSub = subscriptions.data.find(
      (sub) =>
        sub.status === "active" ||
        sub.status === "trialing" ||
        sub.status === "past_due"
    );

    if (activeSub) {
      const subscription = activeSub as any; // Type assertion for Stripe subscription properties
      return NextResponse.json({
        status: "active",
        type: "subscription",
        renews: subscription.current_period_end || null,
        plan: subscription.items?.data?.[0]?.price?.id || null,
      });
    }

    // Default: no active access
    return NextResponse.json({
      status: "none",
    });
  } catch (error) {
    console.error("Subscription status error:", error);
    return NextResponse.json(
      { status: "error", message: "Subscription check failed" },
      { status: 500 }
    );
  }
}

