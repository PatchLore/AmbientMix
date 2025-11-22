import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function buffer(readable: ReadableStream<Uint8Array>): Promise<Buffer> {
  const chunks: Uint8Array[] = [];
  const reader = readable.getReader();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }

  return Buffer.concat(chunks);
}

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    console.error("❌ Missing Stripe signature header");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const buf = await buffer(req.body as any);

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  console.log(`📩 Received event: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed":
        console.log("💰 Payment completed:", event.data.object);
        break;

      case "customer.subscription.created":
        console.log("🟢 Subscription created:", event.data.object);
        break;

      case "invoice.payment_succeeded":
        console.log("🔁 Subscription renewal paid:", event.data.object);
        break;

      case "customer.subscription.updated":
        console.log("🔄 Subscription updated:", event.data.object);
        break;

      case "customer.subscription.deleted":
        console.log("⚠️ Subscription cancelled:", event.data.object);
        break;

      default:
        console.log("ℹ️ Unhandled event type:", event.type);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: any) {
    console.error("❌ Webhook handler error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
