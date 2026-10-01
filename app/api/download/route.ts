import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  console.log("🔥 DOWNLOAD ROUTE HIT");

  const authHeader = request.headers.get("Authorization");

  if (!authHeader) {
    return NextResponse.json(
      { error: "Not authenticated." },
      { status: 401 }
    );
  }

  const token = authHeader.replace("Bearer ", "");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token);

  console.log("🔥 USER:", user?.id);
  console.log("🔥 USER ERROR:", userError);

  if (userError || !user) {
    return NextResponse.json(
      { error: "Not authenticated." },
      { status: 401 }
    );
  }

  return NextResponse.json({
    message: "AUTH WORKS",
    user_id: user.id,
  });
}
{/* deploy test */}