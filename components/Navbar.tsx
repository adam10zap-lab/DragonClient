"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
      setLoading(false);
    }

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="border-b border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

        {/* Logo */}
        <Link href={user ? "/dashboard" : "/"} className="flex items-center">
          <img
            src="/drago-logo.png"
            alt="DragoClient"
            className="h-10 w-10 object-contain drop-shadow-[0_0_15px_rgba(37,99,235,0.45)]"
          />
        </Link>

        <div className="flex items-center gap-6 text-sm">
          <Link
            href="/dashboard"
            className={
              pathname === "/dashboard"
                ? "font-bold"
                : "text-gray-400 hover:text-white"
            }
          >
            Dashboard
          </Link>

          <Link
            href="/pricing"
            className={
              pathname === "/pricing"
                ? "font-bold"
                : "text-gray-400 hover:text-white"
            }
          >
            Pricing
          </Link>

          {!loading && (
            <>
              {user ? (
                <button
                  onClick={logout}
                  className="rounded-lg border border-white/10 px-4 py-2 transition hover:bg-white/10"
                >
                  Logout
                </button>
              ) : (
                <Link
                  href="/login"
                  className="rounded-lg border border-white/10 px-4 py-2 transition hover:bg-white/10"
                >
                  Login
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}