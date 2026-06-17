"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* ─── NAV ─────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <Image
                src="/logo.png"
                alt="Midaas"
                width={100}
                height={32}
                className="object-contain"
              />
            </Link>

            {/* Desktop nav links */}
            <nav className="hidden md:flex items-center gap-8">
              <Link
                href="/#features"
                className="text-sm text-gray-600 hover:text-[#50E3C2] transition-colors font-MontserratRegular"
              >
                Features
              </Link>
              <Link
                href="/#how-it-works"
                className="text-sm text-gray-600 hover:text-[#50E3C2] transition-colors font-MontserratRegular"
              >
                How It Works
              </Link>
              <Link
                href="/explore"
                className="text-sm text-gray-600 hover:text-[#50E3C2] transition-colors font-MontserratRegular"
              >
                Explore Projects
              </Link>
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/auth/signin"
                className="px-5 py-2 text-sm font-MontserratSemiBold text-gray-700 hover:text-[#50E3C2] transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="px-5 py-2.5 text-sm font-MontserratSemiBold text-white bg-[#50E3C2] rounded-full hover:bg-[#00c800] transition-colors shadow-sm"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                {mobileMenuOpen ? (
                  <>
                    <path d="M6 18L18 6M6 6l12 12" />
                  </>
                ) : (
                  <>
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={twMerge(
            "md:hidden overflow-hidden transition-all duration-300",
            mobileMenuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <div className="px-4 py-4 space-y-3 border-t border-gray-100">
            <Link
              href="/#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-gray-600 py-2"
            >
              Features
            </Link>
            <Link
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-gray-600 py-2"
            >
              How It Works
            </Link>
            <Link
              href="/explore"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-gray-600 py-2"
            >
              Explore Projects
            </Link>
            <hr className="border-gray-100" />
            <Link
              href="/auth/signin"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-MontserratSemiBold text-gray-700 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-center text-sm font-MontserratSemiBold text-white bg-[#50E3C2] rounded-full py-2.5"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ─── HERO ────────────────────────────── */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#50E3C2]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#50E3C2]/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-MontserratSemiBold text-[#50E3C2] bg-[#50E3C2]/10 rounded-full tracking-wide uppercase">
              Inclusive Investment in Africa
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-MontserratBold text-gray-900 leading-tight tracking-tight">
              Invest in Local{" "}
              <span className="text-[#50E3C2]">African Businesses</span>{" "}
              Transparently
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto">
              Discover, vet, and back real entrepreneurial initiatives across
              Africa. Track every milestone, release funds securely, and follow
              the impact of your capital — from pledge to completion.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-MontserratSemiBold text-white bg-[#50E3C2] rounded-full hover:bg-[#00c800] transition-colors shadow-lg shadow-[#50E3C2]/25"
              >
                Start Investing
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-MontserratSemiBold text-gray-700 border border-gray-200 rounded-full hover:border-[#50E3C2] hover:text-[#50E3C2] transition-colors"
              >
                Explore Projects
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ────────────────────────── */}
      <section id="features" className="py-20 md:py-28 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-MontserratBold text-gray-900">
              Why Midaas?
            </h2>
            <p className="mt-4 text-gray-500 leading-relaxed">
              We bridge the gap between local entrepreneurs and conscious
              investors through transparency, security, and real-time tracking.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group relative bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md hover:border-[#50E3C2]/20 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-[#50E3C2]/10 flex items-center justify-center mb-5 group-hover:bg-[#50E3C2]/20 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-MontserratSemiBold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ────────────────────── */}
      <section id="how-it-works" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-MontserratBold text-gray-900">
              How It Works
            </h2>
            <p className="mt-4 text-gray-500 leading-relaxed">
              From discovery to impact — four simple steps to start making a
              difference.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connector line (desktop) */}
            <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-[2px] bg-[#50E3C2]/20" />

            {steps.map((step, i) => (
              <div key={i} className="relative text-center">
                <div className="w-24 h-24 mx-auto rounded-full bg-[#50E3C2]/10 flex items-center justify-center mb-6 relative z-10">
                  <span className="text-2xl font-MontserratBold text-[#50E3C2]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="text-base font-MontserratSemiBold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed max-w-[220px] mx-auto">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STATS BANNER ────────────────────── */}
      <section className="py-16 bg-[#50E3C2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, i) => (
              <div key={i}>
                <p className="text-3xl md:text-4xl font-MontserratBold text-white">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-white/80">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-MontserratBold text-gray-900">
              Ready to Make an Impact?
            </h2>
            <p className="mt-4 text-gray-500 leading-relaxed">
              Join a growing community of investors and entrepreneurs building
              Africa&apos;s future — one milestone at a time.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-MontserratSemiBold text-white bg-[#50E3C2] rounded-full hover:bg-[#00c800] transition-colors shadow-lg shadow-[#50E3C2]/25"
              >
                Create Your Account
              </Link>
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-MontserratSemiBold text-gray-700 border border-gray-200 rounded-full hover:border-[#50E3C2] hover:text-[#50E3C2] transition-colors"
              >
                Browse Projects
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────── */}
      <footer className="border-t border-gray-100 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Midaas"
                width={80}
                height={26}
                className="object-contain"
              />
            </div>
            <p className="text-xs text-gray-400">
              &copy; {new Date().getFullYear()} Midaas. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/explore"
                className="text-xs text-gray-400 hover:text-[#50E3C2] transition-colors"
              >
                Projects
              </Link>
              <Link
                href="/auth/signin"
                className="text-xs text-gray-400 hover:text-[#50E3C2] transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="text-xs text-gray-400 hover:text-[#50E3C2] transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── Data ────────────────────────────── */

const features = [
  {
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#50E3C2"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    title: "Milestone-Based Escrow",
    description:
      "Funds are released progressively, tied to verified milestone completions. Your capital stays protected until proof of progress is approved.",
  },
  {
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#50E3C2"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Verified Entrepreneurs",
    description:
      "Every entrepreneur undergoes identity verification (KYC) and business document validation before launching a campaign on the platform.",
  },
  {
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#50E3C2"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
    title: "Real-Time Portfolio Tracking",
    description:
      "Monitor your investments in real time. See fund allocation, project progress, and completed milestones from your personalized dashboard.",
  },
];

const steps = [
  {
    title: "Discover",
    description:
      "Browse verified projects across multiple sectors — agribusiness, tech, retail, healthcare, and energy.",
  },
  {
    title: "Invest",
    description:
      "Choose the projects that resonate with you and contribute capital with full transparency on where it goes.",
  },
  {
    title: "Track",
    description:
      "Follow each milestone in real time. Get notified when entrepreneurs submit progress evidence for review.",
  },
  {
    title: "Impact",
    description:
      "Watch your capital create tangible change. Funds are released only when milestones are verified and approved.",
  },
];

const stats = [
  { value: "4+", label: "Active Entrepreneurs" },
  { value: "0", label: "Projects Funded" },
  { value: "0 FCFA", label: "Total Invested" },
  { value: "100%", label: "Transparency" },
];
