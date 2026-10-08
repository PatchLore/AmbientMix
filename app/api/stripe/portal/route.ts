import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseServer } from "@/app/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const supabase = await supabaseServer();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let requestedCustomerId: unknown = null;
    try {
      requestedCustomerId = (await req.json() as { customerId?: unknown })?.customerId ?? null;
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    // Resolve the customer from the authenticated user's profile, never from
    // an arbitrary browser-supplied ID alone.
    const { data: profile } = await supabase
      .from("profiles")
      .select("customer_id")
      .eq("id", user.id)
      .single();

    const ownedCustomerId: string | null = profile?.customer_id ?? null;

    if (!ownedCustomerId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (requestedCustomerId != null && requestedCustomerId !== ownedCustomerId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      console.error("Stripe portal error: Stripe is not configured");
      return NextResponse.json({ error: "Billing portal unavailable" }, { status: 500 });
    }
    const stripe = new Stripe(secretKey);

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: ownedCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/account`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err) {
    console.error("Stripe portal error:", err);
    return NextResponse.json({ error: "Billing portal failed" }, { status: 500 });
  }
}

