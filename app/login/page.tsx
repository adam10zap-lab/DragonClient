"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function login() {
    setMessage("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-6 text-white">
      {/* Background glow */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <img
            src="/drago-logo.png"
            alt="DragoClient"
            className="h-20 w-20 object-contain drop-shadow-[0_0_30px_rgba(37,99,235,0.45)]"
          />
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome Back
            </h1>

            <p className="mt-2 text-zinc-400">
              Login to your DragoClient account.
            </p>
          </div>

          <div className="mt-8 space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-blue-500 focus:bg-black/60"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-blue-500 focus:bg-black/60"
              />
            </div>

            {/* Login button */}
            <button
              type="button"
              onClick={login}
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 py-3.5 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>

          {/* Message */}
          {message && (
            <p className="mt-5 rounded-xl border border-white/10 bg-black/30 p-3 text-center text-sm text-red-400">
              {message}
            </p>
          )}

          {/* Register */}
          <div className="mt-6 text-center text-sm text-zinc-400">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-blue-500 transition hover:text-blue-400"
            >
              Register
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-600">
          Welcome back to DragoClient.
        </p>
      </div>
    </main>
  );
}