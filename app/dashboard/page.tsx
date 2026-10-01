"use client";

import Background from "../../components/Background";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import { supabase } from "../../lib/supabase";

type License = {
  id: string;
  license_key: string;
  user_id: string | null;
  plan: string;
  active: boolean;
  expires_at: string | null;
};

export default function DashboardPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [license, setLicense] = useState<License | null>(null);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setEmail(user.email ?? "");

      const { data, error } = await supabase
        .from("licenses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error(
          "🔥 LICENSE ERROR:",
          JSON.stringify(error, null, 2)
        );
      }

      setLicense(data ?? null);
      setLoading(false);
    }

    loadDashboard();
  }, [router]);

  async function redeemLicense() {
    const input = document.getElementById(
      "license-key"
    ) as HTMLInputElement | null;

    if (!input) {
      return;
    }

    const key = input.value.trim();

    if (!key) {
      alert("Enter a license key.");
      return;
    }

    setRedeeming(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: foundLicense, error } = await supabase
        .from("licenses")
        .select("*")
        .eq("license_key", key)
        .maybeSingle();

      if (error) {
        console.error(
          "🔥 REDEEM ERROR:",
          JSON.stringify(error, null, 2)
        );

        alert("Could not check license.");
        return;
      }

      if (!foundLicense) {
        alert("License not found.");
        return;
      }

      if (!foundLicense.active) {
        alert("This license is inactive.");
        return;
      }

      if (
        foundLicense.user_id &&
        foundLicense.user_id !== user.id
      ) {
        alert("This license belongs to another account.");
        return;
      }

      const { error: updateError } = await supabase
        .from("licenses")
        .update({
          user_id: user.id,
        })
        .eq("id", foundLicense.id);

      if (updateError) {
        console.error(
          "🔥 UPDATE LICENSE ERROR:",
          JSON.stringify(updateError, null, 2)
        );

        alert("Could not redeem license.");
        return;
      }

      alert("License redeemed successfully!");

      window.location.reload();
    } finally {
      setRedeeming(false);
    }
  }

  async function downloadJar() {
    setDownloading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        alert("You must be logged in.");
        router.push("/login");
        return;
      }

      console.log("🔥 DOWNLOAD BUTTON CLICKED");
      console.log(
        "🔥 ACCESS TOKEN EXISTS:",
        !!session.access_token
      );

      const response = await fetch("/api/download", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      console.log(
        "🔥 DOWNLOAD STATUS:",
        response.status
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        console.log(
          "🔥 DOWNLOAD ERROR RESPONSE:",
          data
        );

        alert(
          data?.error ??
            `Download failed (${response.status}).`
        );

        return;
      }

      const blob = await response.blob();

      console.log(
        "✅ DOWNLOAD SUCCESS:",
        blob.size,
        "bytes"
      );

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = "DragoClient.jar";

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("🔥 DOWNLOAD ERROR:", error);

      alert("Download failed.");
    } finally {
      setDownloading(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <Background />
        <Navbar />

        <p className="p-10 text-center text-gray-400">
          Loading...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Background />
      <Navbar />

      <section className="mx-auto max-w-6xl px-6 py-12">
        <p className="text-gray-500">
          Welcome back
        </p>

        <h1 className="mt-2 text-4xl font-bold">
          Dashboard
        </h1>

        <p className="mt-2 text-gray-400">
          {email}
        </p>

        <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-7">
          <h2 className="text-xl font-semibold">
            {license ? "Your License" : "Redeem License"}
          </h2>

          {!license ? (
            <>
              <p className="mt-2 text-gray-400">
                Already have a license key? Activate it here.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <input
                  id="license-key"
                  placeholder="DRAGO-XXXXXX-XXXXXX-XXXXXX"
                  className="flex-1 rounded-xl border border-white/10 bg-black px-4 py-3 font-mono outline-none transition focus:border-white/30"
                />

                <button
                  onClick={redeemLicense}
                  disabled={redeeming}
                  className="rounded-xl bg-white px-6 py-3 font-semibold text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {redeeming
                    ? "Redeeming..."
                    : "Redeem"}
                </button>
              </div>
            </>
          ) : (
            <p className="mt-2 text-gray-400">
              Your license is linked to this account.
            </p>
          )}
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7">
            <h2 className="text-xl font-semibold">
              License
            </h2>

            {license ? (
              <>
                <div className="mt-6">
                  <p className="text-sm text-gray-500">
                    Status
                  </p>

                  <p className="mt-1 font-semibold">
                    {license.active
                      ? "Active"
                      : "Inactive"}
                  </p>
                </div>

                <div className="mt-6">
                  <p className="text-sm text-gray-500">
                    Plan
                  </p>

                  <p className="mt-1 capitalize">
                    {license.plan}
                  </p>
                </div>

                <div className="mt-6">
                  <p className="text-sm text-gray-500">
                    Your License
                  </p>

                  <p className="mt-1 break-all font-mono text-sm">
                    {license.license_key}
                  </p>
                </div>

                <div className="mt-6">
                  <p className="text-sm text-gray-500">
                    Expiration
                  </p>

                  <p className="mt-1">
                    {license.expires_at
                      ? new Date(
                          license.expires_at
                        ).toLocaleDateString()
                      : "Never"}
                  </p>
                </div>
              </>
            ) : (
              <>
                <p className="mt-6 text-gray-400">
                  You don't have a license yet.
                </p>

                <Link
                  href="/pricing"
                  className="mt-6 inline-block rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-gray-200"
                >
                  View Pricing
                </Link>
              </>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7">
            <h2 className="text-xl font-semibold">
              Download
            </h2>

            <p className="mt-3 text-gray-400">
              Download the latest version of DragoClient.
            </p>

            {license?.active ? (
              <button
                onClick={downloadJar}
                disabled={downloading}
                className="mt-8 w-full rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {downloading
                  ? "Downloading..."
                  : "Download .jar"}
              </button>
            ) : (
              <button
                disabled
                className="mt-8 w-full cursor-not-allowed rounded-xl bg-white px-5 py-3 font-semibold text-black opacity-30"
              >
                Download .jar
              </button>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}