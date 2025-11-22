import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const { customerId } = await req.json();

    if (!customerId) {
      return NextResponse.json(
        { status: "error", message: "Missing customerId" },
        { status: 400 }
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
  } catch (error: any) {
    console.error("Subscription status error:", error);
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}

