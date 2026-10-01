"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <nav className="border-b border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold">
          DragoClient
        </Link>

        <div className="flex items-center gap-6 text-sm">
          <Link
            href="/dashboard"
            className={
              pathname === "/dashboard"
                ? "font-bold"
                : "text-gray-400"
            }
          >
            Dashboard
          </Link>

          <Link
            href="/pricing"
            className={
              pathname === "/pricing"
                ? "font-bold"
                : "text-gray-400"
            }
          >
            Pricing
          </Link>

          <button
            onClick={logout}
            className="rounded-lg border border-white/10 px-4 py-2 transition hover:bg-white/10"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}