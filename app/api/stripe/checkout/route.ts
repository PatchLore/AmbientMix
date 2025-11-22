// app/api/stripe/checkout/route.ts

import { NextResponse } from "next/server";

import Stripe from "stripe";



const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {});



export async function POST(req: Request) {

  try {

    const { priceId } = await req.json();



    if (!priceId) {

      return NextResponse.json({ error: "Missing priceId" }, { status: 400 });

    }



    const session = await stripe.checkout.sessions.create({

      mode: priceId === process.env.STRIPE_LIFETIME_PRICE_ID ? "payment" : "subscription",

      line_items: [

        {

          price: priceId,

          quantity: 1,

        },

      ],

      customer_creation: "if_required",

      billing_address_collection: "auto",

      customer_email: undefined, // If you add login later, you can pass email here.

      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,

      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing/cancel`,

    });



    return NextResponse.json({ url: session.url });

  } catch (error: any) {

    console.error("Stripe Checkout Error:", error);

    return NextResponse.json({ error: error.message }, { status: 500 });

  }

}

