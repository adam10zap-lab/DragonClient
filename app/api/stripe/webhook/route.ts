
import Stripe from "stripe";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

function generateLicenseKey() {
  const part = () =>
    crypto.randomBytes(3).toString("hex").toUpperCase();

  return `DRAGO-${part()}-${part()}-${part()}`;
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  console.log("🔥 WEBHOOK HIT");
  console.log("🔥 SIGNATURE EXISTS:", !!signature);
  console.log(
    "🔥 STRIPE SECRET EXISTS:",
    !!process.env.STRIPE_WEBHOOK_SECRET
  );

  if (!signature) {
    console.log("❌ 400: Missing Stripe signature");

    return new NextResponse("Missing Stripe signature", {
      status: 400,
    });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.log("🔥🔥🔥 CONSTRUCT EVENT FAILED 🔥🔥🔥");
    console.log(error);

    return new NextResponse("Webhook signature invalid", {
      status: 400,
    });
  }

  console.log("✅ Stripe event verified:", event.type);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const userId = session.metadata?.user_id;
    const plan = session.metadata?.plan;

    console.log("🔥 Metadata:", {
      userId,
      plan,
    });

    if (!userId || !plan) {
      console.log("❌ 400: Missing metadata");

      return new NextResponse("Missing metadata", {
        status: 400,
      });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: existingLicense } = await supabaseAdmin
      .from("licenses")
      .select("id")
      .eq("stripe_checkout_session_id", session.id)
      .maybeSingle();

    if (existingLicense) {
      console.log("ℹ️ License already exists");

      return NextResponse.json({
        received: true,
      });
    }

    const licenseKey = generateLicenseKey();

    let expiresAt: string | null = null;

    if (plan === "monthly") {
      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id;

      if (subscriptionId) {
        const subscription =
          await stripe.subscriptions.retrieve(subscriptionId);

        const periodEnd = (subscription as any).current_period_end;

        if (periodEnd) {
          expiresAt = new Date(
            periodEnd * 1000
          ).toISOString();
        }
      }
    }

    const { error } = await supabaseAdmin
      .from("licenses")
      .insert({
        license_key: licenseKey,
        user_id: userId,
        plan,
        active: true,
        expires_at: expiresAt,
        stripe_checkout_session_id: session.id,
        stripe_customer_id:
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id ?? null,
        stripe_subscription_id:
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id ?? null,
      });

    if (error) {
      console.error("❌ License creation error:", JSON.stringify(error, null, 2));

      return new NextResponse("Could not create license", {
        status: 500,
      });
    }

    console.log(
      `✅ Created DragoClient ${plan} license: ${licenseKey}`
    );
  }

  console.log("🔥 WEBHOOK FINISHED");

  return NextResponse.json({
    received: true,
  });
}

