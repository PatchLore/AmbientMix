import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

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
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string | null;
        
        // Retrieve session with line items to get price_id
        const sessionWithItems = await stripe.checkout.sessions.retrieve(session.id, {
          expand: ['line_items'],
        });
        
        const priceId = sessionWithItems.line_items?.data?.[0]?.price?.id ?? null;

        if (customerId) {
          // Lifetime vs subscription based on mode
          const planType = session.mode === "payment" ? "lifetime" : "subscription";

          await supabaseAdmin
            .from("subscriptions")
            .upsert(
              {
                customer_id: customerId,
                status: "active",
                plan_type: planType,
                price_id: priceId,
                last_event_type: event.type,
              },
              { onConflict: "customer_id" }
            );
        }

        console.log("💰 Checkout successful:", session.id);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as any; // Type assertion for Stripe subscription properties
        const customerId = sub.customer as string;

        await supabaseAdmin
          .from("subscriptions")
          .upsert(
            {
              customer_id: customerId,
              status: sub.status,
              plan_type: "subscription",
              price_id: sub.items?.data?.[0]?.price?.id ?? null,
              current_period_end: sub.current_period_end 
                ? new Date(sub.current_period_end * 1000).toISOString() 
                : null,
              last_event_type: event.type,
            },
            { onConflict: "customer_id" }
          );

        console.log(`📦 Subscription event stored: ${event.type}`, sub.id);
        break;
      }

      case "invoice.payment_succeeded":
        console.log("🔁 Subscription renewal paid:", event.data.object);
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
