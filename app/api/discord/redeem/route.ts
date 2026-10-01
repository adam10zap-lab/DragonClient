import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    // =========================
    // CHECK SECRET
    // =========================

    const authorization = request.headers.get("authorization");

    const expectedSecret = process.env.DISCORD_ADMIN_SECRET;

    if (
      !expectedSecret ||
      authorization !== `Bearer ${expectedSecret}`
    ) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // =========================
    // GET DATA
    // =========================

    const { licenseKey, discordUserId } = await request.json();

    if (!licenseKey || !discordUserId) {
      return NextResponse.json(
        { error: "Missing license or Discord user ID." },
        { status: 400 }
      );
    }

    // =========================
    // FIND LICENSE
    // =========================

    const { data: license, error: licenseError } =
      await supabaseAdmin
        .from("licenses")
        .select(
          "id, license_key, active, redeemed, plan, expires_at, discord_user_id"
        )
        .eq("license_key", licenseKey.trim())
        .maybeSingle();

    if (licenseError) {
      console.error(licenseError);

      return NextResponse.json(
        { error: "Database error." },
        { status: 500 }
      );
    }

    if (!license) {
      return NextResponse.json(
        { error: "Invalid license key." },
        { status: 404 }
      );
    }

    // =========================
    // CHECK ACTIVE
    // =========================

    if (!license.active) {
      return NextResponse.json(
        { error: "This license is inactive." },
        { status: 403 }
      );
    }

    // =========================
    // CHECK EXPIRATION
    // =========================

    if (
      license.expires_at &&
      new Date(license.expires_at).getTime() <= Date.now()
    ) {
      return NextResponse.json(
        { error: "This license has expired." },
        { status: 403 }
      );
    }

    // =========================
    // CHECK REDEEMED
    // =========================

    if (license.redeemed) {
      return NextResponse.json(
        {
          error: "This license has already been redeemed.",
        },
        { status: 409 }
      );
    }

    // =========================
    // REDEEM LICENSE
    // =========================

    const { error: updateError } = await supabaseAdmin
      .from("licenses")
      .update({
        redeemed: true,
        discord_user_id: discordUserId,
      })
      .eq("id", license.id);

    if (updateError) {
      console.error(updateError);

      return NextResponse.json(
        { error: "Failed to redeem license." },
        { status: 500 }
      );
    }

    // =========================
    // SUCCESS
    // =========================

    return NextResponse.json({
      success: true,
      plan: license.plan,
      message: "License redeemed successfully.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }
}