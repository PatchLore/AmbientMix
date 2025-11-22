// app/api/stripe/webhook/route.ts

import { NextResponse } from "next/server";

import Stripe from "stripe";



const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {});



async function buffer(readable: ReadableStream<Uint8Array>) {

  const chunks = [];

  const reader = readable.getReader();



  while (true) {

    const { done, value } = await reader.read();

    if (done) break;

    if (value) chunks.push(value);

  }



  return Buffer.concat(chunks);

}



export async function POST(req: Request) {

  const sig = req.headers.get("stripe-signature") as string;

  const buf = await buffer(req.body as any);



  let event: Stripe.Event;



  try {

    event = stripe.webhooks.constructEvent(

      buf,

      sig,

      process.env.STRIPE_WEBHOOK_SECRET!

    );

  } catch (err: any) {

    console.error("Webhook signature error:", err.message);

    return NextResponse.json({ error: err.message }, { status: 400 });

  }



  try {

    switch (event.type) {

      case "checkout.session.completed":

        console.log("💰 Checkout successful:", event.data.object);

        break;



      case "invoice.payment_succeeded":

        console.log("🔁 Subscription payment succeeded:", event.data.object);

        break;



      case "customer.subscription.created":

        console.log("📅 Subscription created:", event.data.object);

        break;



      default:

        console.log(`Unhandled event type: ${event.type}`);

    }



    return NextResponse.json({ received: true });

  } catch (error: any) {

    console.error("Webhook handling error:", error);

    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });

  }

}

