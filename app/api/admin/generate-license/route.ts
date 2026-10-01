import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const OWNER_ID = "5ada1445-14d4-4977-87d1-2b7de6591fb1";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function generateLicenseKey() {
  const part = () =>
    crypto.randomBytes(3).toString("hex").toUpperCase();

  return `DRAGO-${part()}-${part()}-${part()}`;
}

export async function POST(request: Request) {
  try {
    const { plan, userId } = await request.json();

    // Owner kontrola
    if (userId !== OWNER_ID) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    if (plan !== "monthly" && plan !== "lifetime") {
      return NextResponse.json(
        { error: "Invalid plan" },
        { status: 400 }
      );
    }

    const licenseKey = generateLicenseKey();

    const { error } = await supabaseAdmin
      .from("licenses")
      .insert({
        license_key: licenseKey,
        user_id: null,
        plan,
        active: true,
        redeemed: false,
        expires_at: null,
      });

    if (error) {
      console.error(error);

      return NextResponse.json(
        { error: "Failed to create license" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      licenseKey,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}