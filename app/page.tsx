import Image from "next/image";
import Link from "next/link";
import Background from "../components/Background";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <Background />

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Navbar */}
        <nav className="flex items-center justify-between px-6 py-6 sm:px-10">
          <div className="flex items-center gap-3">
            <Image
              src="/drago-logo.png"
              alt="DragoClient"
              width={48}
              height={48}
              className="h-10 w-10 object-contain"
            />

            <span className="text-xl font-bold tracking-tight">
              DragoClient
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/pricing"
              className="rounded-xl px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/10 hover:text-white"
            >
              Pricing
            </Link>

            <Link
              href="/login"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium transition hover:bg-white/10"
            >
              Login
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="flex flex-1 items-center justify-center px-6 py-16">
          <div className="flex max-w-4xl flex-col items-center text-center">
            <div className="mb-8">
              <Image
                src="/drago-logo.png"
                alt="DragoClient logo"
                width={420}
                height={420}
                priority
                className="h-auto w-64 drop-shadow-[0_0_45px_rgba(37,99,235,0.45)] sm:w-80"
              />
            </div>

            <h1 className="text-5xl font-black tracking-tight sm:text-7xl">
              DragoClient
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400 sm:text-xl">
              A modern Minecraft client built for players who want a clean,
              fast and powerful experience.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/pricing"
                className="rounded-xl bg-blue-600 px-8 py-4 font-semibold transition hover:bg-blue-500"
              >
                Get DragoClient
              </Link>

              <Link
                href="/register"
                className="rounded-xl border border-white/10 bg-white/5 px-8 py-4 font-semibold transition hover:bg-white/10"
              >
                Create Account
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap justify-center gap-3 text-sm text-zinc-500">
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                ⚡ Fast
              </span>

              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                🛡️ Secure
              </span>

              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                🎮 Minecraft
              </span>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-6 text-center text-sm text-zinc-600">
          © {new Date().getFullYear()} DragoClient. All rights reserved.
        </footer>
      </div>
    </main>
  );
}