import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { licenseId, deviceId, deviceName } = await req.json();

    if (!licenseId || !deviceId) {
      return NextResponse.json(
        { error: "Missing licenseId or deviceId" },
        { status: 400 }
      );
    }

    const { data: license, error: licenseError } = await supabase
      .from("licenses")
      .select("id, active")
      .eq("id", licenseId)
      .single();

    if (licenseError || !license) {
      return NextResponse.json(
        { error: "License not found" },
        { status: 404 }
      );
    }

    if (!license.active) {
      return NextResponse.json(
        { error: "License inactive" },
        { status: 403 }
      );
    }

    const { data: existing } = await supabase
      .from("license_devices")
      .select("device_id")
      .eq("license_id", licenseId)
      .maybeSingle();

    // První zařízení
    if (!existing) {
      const { error } = await supabase
        .from("license_devices")
        .insert({
          license_id: licenseId,
          device_id: deviceId,
          device_name: deviceName ?? "Unknown device",
        });

      if (error) {
        return NextResponse.json(
          { error: "Failed to activate device" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        status: "activated",
      });
    }

    // Stejné zařízení
    if (existing.device_id === deviceId) {
      await supabase
        .from("license_devices")
        .update({
          last_seen_at: new Date().toISOString(),
        })
        .eq("license_id", licenseId);

      return NextResponse.json({
        success: true,
        status: "already_activated",
      });
    }

    // Jiné zařízení
    return NextResponse.json(
      {
        success: false,
        error: "LICENSE_ALREADY_BOUND",
      },
      { status: 409 }
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}