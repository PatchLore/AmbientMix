import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return NextResponse.json({
      customerId: session.customer,
      customerEmail: session.customer_details?.email || null,
      paymentStatus: session.payment_status,
      amountTotal: session.amount_total,
    });
  } catch (err: any) {
    console.error("Failed to fetch session:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

