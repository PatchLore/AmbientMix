// app/api/stripe/checkout/route.ts

import { NextResponse } from "next/server";

import Stripe from "stripe";



// Note: guest checkout is intentionally supported (the success page links the
// purchase to a profile via cookie when available), so authentication is not
// required here. Protection comes from the strict price allowlist below.

export async function POST(req: Request) {

  try {

    let priceId: unknown;
    try {
      priceId = (await req.json() as { priceId?: unknown })?.priceId;
    } catch {

      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

    }



    if (!priceId || typeof priceId !== "string") {

      return NextResponse.json({ error: "Missing priceId" }, { status: 400 });

    }

    // Only permit the known application price IDs. This resolves the naming
    // mismatch by accepting every configured name: the server-side lifetime
    // ID and both public IDs used by the pricing page.
    const allowedPriceIds = new Set(
      [
        process.env.STRIPE_LIFETIME_PRICE_ID,
        process.env.NEXT_PUBLIC_LIFETIME_PRICE_ID,
        process.env.NEXT_PUBLIC_PRO_MONTHLY_PRICE_ID,
      ].filter((id): id is string => typeof id === "string" && id.length > 0)
    );

    if (allowedPriceIds.size === 0) {
      console.error("Stripe Checkout Error: no price IDs configured");
      return NextResponse.json({ error: "Checkout unavailable" }, { status: 500 });
    }

    if (!allowedPriceIds.has(priceId)) {
      return NextResponse.json({ error: "Invalid priceId" }, { status: 400 });
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      console.error("Stripe Checkout Error: Stripe is not configured");
      return NextResponse.json({ error: "Checkout unavailable" }, { status: 500 });
    }
    const stripe = new Stripe(secretKey, {});

    const lifetimePriceIds = new Set(
      [process.env.STRIPE_LIFETIME_PRICE_ID, process.env.NEXT_PUBLIC_LIFETIME_PRICE_ID].filter(
        (id): id is string => typeof id === "string" && id.length > 0
      )
    );

    const session = await stripe.checkout.sessions.create({

      mode: lifetimePriceIds.has(priceId) ? "payment" : "subscription",

      line_items: [

        {

          price: priceId,

          quantity: 1,

        },

      ],

      customer_creation: "if_required",

      billing_address_collection: "auto",

      customer_email: undefined,

      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,

      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing/cancel`,

    });



    return NextResponse.json({ url: session.url });

  } catch (error) {

    console.error("Stripe Checkout Error:", error);

    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });

  }

}

