import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    const { plan } = await request.json();

    let priceId: string;
    let mode: "payment" | "subscription";

    if (plan === "lifetime") {
      priceId = process.env.STRIPE_LIFETIME_PRICE_ID!;
      mode = "payment";
    } else if (plan === "monthly") {
      priceId = process.env.STRIPE_MONTHLY_PRICE_ID!;
      mode = "subscription";
    } else {
      return NextResponse.json(
        { error: "Invalid plan." },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );

    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode,

      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],

      metadata: {
        user_id: user.id,
        plan: plan,
      },

      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?canceled=1`,
    });

    console.log("🔥 CREATED STRIPE SESSION:", {
      id: session.id,
      metadata: session.metadata,
    });

    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    console.error("🔥 CHECKOUT ERROR:", JSON.stringify(error, null, 2));

    return NextResponse.json(
      { error: "Could not create checkout session." },
      { status: 500 }
    );
  }
}