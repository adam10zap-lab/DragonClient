"use client";

import Background from "../../components/Background";
import Navbar from "../../components/Navbar";
import { supabase } from "../../lib/supabase";

export default function PricingPage() {
  async function checkout(plan: "monthly" | "lifetime") {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      window.location.href = "/login";
      return;
    }

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ plan }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Something went wrong.");
      return;
    }

    if (data.url) {
      window.location.href = data.url;
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Background />
      <Navbar />

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-gray-500">
            DRAGOCLIENT
          </p>

          <h1 className="text-5xl font-bold">
            Choose your DragoClient license
          </h1>

          <p className="mt-5 text-gray-400">
            Purchase DragoClient, activate your license automatically,
            and download the client from your dashboard.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {/* MONTHLY */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 transition hover:border-white/20">
            <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
              DragoClient
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              Monthly
            </h2>

            <p className="mt-3 text-gray-400">
              Full access to DragoClient while your subscription is active.
            </p>

            <div className="mt-8 text-4xl font-bold">
              $10
              <span className="text-base font-normal text-gray-500">
                /month
              </span>
            </div>

            <ul className="mt-8 space-y-3 text-gray-300">
              <li>✓ Full DragoClient access</li>
              <li>✓ Client updates</li>
              <li>✓ Personal license</li>
              <li>✓ Secure downloads</li>
            </ul>

            <button
              onClick={() => checkout("monthly")}
              className="mt-8 block w-full rounded-xl bg-white px-5 py-3 text-center font-semibold text-black transition hover:bg-gray-200"
            >
              Get DragoClient
            </button>
          </div>

          {/* LIFETIME */}

          <div className="rounded-2xl border border-white/20 bg-white/[0.06] p-8 transition hover:border-white/30">
            <div className="mb-4 inline-block rounded-full bg-white px-3 py-1 text-xs font-bold text-black">
              LIFETIME
            </div>

            <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
              DragoClient
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              Lifetime
            </h2>

            <p className="mt-3 text-gray-400">
              One payment for permanent access to DragoClient.
            </p>

            <div className="mt-8 text-4xl font-bold">
              $17
              <span className="text-base font-normal text-gray-500">
                /one-time
              </span>
            </div>

            <ul className="mt-8 space-y-3 text-gray-300">
              <li>✓ Permanent DragoClient access</li>
              <li>✓ Future client updates</li>
              <li>✓ Personal lifetime license</li>
              <li>✓ Secure downloads</li>
            </ul>

            <button
              onClick={() => checkout("lifetime")}
              className="mt-8 block w-full rounded-xl bg-white px-5 py-3 text-center font-semibold text-black transition hover:bg-gray-200"
            >
              Get DragoClient
            </button>
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-2xl text-center text-sm text-gray-500">
          After your purchase, your DragoClient license will be connected
          to your account automatically.
        </div>
      </section>
    </main>
  );
}