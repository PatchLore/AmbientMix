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

    let sessionId: unknown;
    try {
      sessionId = (await req.json() as { sessionId?: unknown })?.sessionId;
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      console.error("Stripe session error: Stripe is not configured");
      return NextResponse.json({ error: "Session lookup unavailable" }, { status: 500 });
    }
    const stripe = new Stripe(secretKey);

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Ownership check: the session's customer must match the authenticated
    // user's stored Stripe customer ID.
    const { data: profile } = await supabase
      .from("profiles")
      .select("customer_id")
      .eq("id", user.id)
      .single();

    const ownedCustomerId: string | null = profile?.customer_id ?? null;
    const sessionCustomer =
      typeof session.customer === "string" ? session.customer : null;

    if (!ownedCustomerId || !sessionCustomer || sessionCustomer !== ownedCustomerId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      customerId: session.customer,
      customerEmail: session.customer_details?.email || null,
      paymentStatus: session.payment_status,
      amountTotal: session.amount_total,
    });
  } catch (err) {
    console.error("Failed to fetch session:", err);
    return NextResponse.json({ error: "Session lookup failed" }, { status: 500 });
  }
}

