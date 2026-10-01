"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function GenerateLicensePage() {
  const [plan, setPlan] = useState("lifetime");
  const [license, setLicense] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function generateLicense() {
    setLoading(true);
    setMessage("");
    setLicense("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("You must be logged in.");
      setLoading(false);
      return;
    }

    const response = await fetch("/api/admin/generate-license", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
      plan,
      userId: user.id,
     }),
 });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error || "Failed to generate license.");
      setLoading(false);
      return;
    }

    setLicense(data.licenseKey);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
          <h1 className="text-3xl font-bold">
            Generate License
          </h1>

          <p className="mt-2 text-zinc-400">
            Create a gift license for DragoClient.
          </p>

          <div className="mt-8">
            <label className="mb-2 block text-sm text-zinc-300">
              License type
            </label>

            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none"
            >
              <option value="lifetime">Lifetime</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <button
            onClick={generateLicense}
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-blue-600 py-3 font-semibold transition hover:bg-blue-500 disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate License"}
          </button>

          {license && (
            <div className="mt-6 rounded-xl border border-green-500/20 bg-green-500/10 p-4">
              <p className="text-sm text-zinc-400">
                Generated license:
              </p>

              <p className="mt-2 break-all font-mono text-lg font-bold text-green-400">
                {license}
              </p>

              <button
                onClick={() => navigator.clipboard.writeText(license)}
                className="mt-4 rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/10"
              >
                Copy
              </button>
            </div>
          )}

          {message && (
            <p className="mt-5 text-center text-sm text-red-400">
              {message}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}