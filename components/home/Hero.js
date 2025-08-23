"use client";


import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, Search, Star, ShieldCheck, Zap } from "lucide-react";
import { useEffect, useState } from "react";


export function Hero() {
  // Simple inspiring quotes rotator (no external libs)
  const quotes = [
    { text: "The future belongs to those who create it.", author: "IM" },
    { text: "Small tasks done well become big opportunities.", author: "NASA" },
    { text: "Move fast, learn faster, earn smarter.", author: "MZ" },
    { text: "Consistency compounds more than intensity.", author: "BD" },
    { text: "Make it simple, make it useful, make it ship.", author: "AM" },
  ];


  const [quoteIndex, setQuoteIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setQuoteIndex((i) => (i + 1) % quotes.length);
    }, 3800);
    return () => clearInterval(id);
  }, []);


  return (
    <section
      className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white via-gray-50 to-gray-100"
      aria-label="Hero section"
    >
      {/* Top banner */}
      <div className="relative z-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mt-4 rounded-2xl border border-teal-200 bg-teal-50 p-3 text-teal-700 shadow-md backdrop-blur supports-[backdrop-filter]:backdrop-blur-md">
            <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
              <p className="text-sm sm:text-base">
                ✨ New: Smart matching gets you higher-paying tasks in less time.
              </p>
              <div className="flex items-center gap-2">
                <div className="hidden h-2 w-2 animate-pulse rounded-full bg-teal-500 sm:block" />
                <span className="text-xs text-teal-600">Live · Updated in real-time</span>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Decorative background grid + animated orbs */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {/* gradient orbs */}
        <div className="absolute -top-40 -left-40 h-96 w-96 animate-pulse rounded-full bg-teal-200/50 blur-3xl" />
        <div className="absolute -bottom-32 -right-40 h-[28rem] w-[28rem] animate-pulse rounded-full bg-cyan-200/40 blur-3xl animation-delay-1000" />
        {/* grid + network */}
        <svg className="absolute inset-0 h-full w-full opacity-10" viewBox="0 0 1200 800" fill="none">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#14b8a6" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          {/* network nodes */}
          <circle cx="200" cy="150" r="3" fill="#14b8a6" />
          <circle cx="420" cy="220" r="3" fill="#14b8a6" />
          <circle cx="640" cy="120" r="3" fill="#14b8a6" />
          <circle cx="860" cy="260" r="3" fill="#14b8a6" />
          <circle cx="1040" cy="180" r="3" fill="#14b8a6" />
          {/* links */}
          <line x1="200" y1="150" x2="420" y2="220" stroke="#14b8a6" strokeWidth="1" opacity="0.45" />
          <line x1="420" y1="220" x2="640" y2="120" stroke="#14b8a6" strokeWidth="1" opacity="0.45" />
          <line x1="640" y1="120" x2="860" y2="260" stroke="#14b8a6" strokeWidth="1" opacity="0.45" />
          <line x1="860" y1="260" x2="1040" y2="180" stroke="#14b8a6" strokeWidth="1" opacity="0.45" />
        </svg>
      </div>


      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col items-center justify-center px-4 text-center">
        {/* Pill */}
        <div className="my-6 inline-flex items-center gap-2 rounded-full border border-teal-300 bg-teal-100 px-4 py-2 text-teal-700 shadow-sm">
          <Sparkles className="h-4 w-4" aria-hidden />
          <span className="text-sm font-medium tracking-wide">AI-Powered Task Matching</span>
        </div>


        {/* Heading */}
        <h1 className="mb-4 text-5xl font-bold leading-tight text-gray-900 sm:text-6xl lg:text-7xl">
          Ignite Your Earnings With
          <span className="block bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
            Innovative Task Earn
          </span>
        </h1>


        {/* Subheading */}
        <p className="mx-auto mb-10 max-w-3xl text-lg text-gray-700 sm:text-xl">
          Our AI connects you with tasks that fit your skills, experience, and goals—so you earn faster with smart, high-match referrals.
        </p>


        {/* CTAs */}
        <div className="group mb-12 flex flex-col items-center gap-4 sm:flex-row">
          <Button
            asChild
            className="relative gap-2 rounded-xl bg-teal-600 px-8 py-6 text-base font-semibold text-white shadow-lg shadow-teal-600/20 transition hover:-translate-y-0.5 hover:bg-teal-500 focus-visible:ring-teal-400"
          >
            <Link href="/register" aria-label="Get task recommendations">
              <Sparkles className="h-5 w-5" aria-hidden />
              Get Task Recommendations
              <span className="absolute inset-0 -z-10 rounded-xl bg-teal-400/0 transition group-hover:bg-teal-400/10" />
            </Link>
          </Button>


          <Button
            asChild
            variant="outline"
            className="gap-2 rounded-xl border-2 border-teal-300 bg-white px-8 py-6 text-base font-semibold text-teal-700 transition hover:-translate-y-0.5 hover:bg-teal-50 hover:text-teal-900 focus-visible:ring-teal-400"
          >
            <Link href="/tasks" aria-label="Browse all tasks">
              <Search className="h-5 w-5" aria-hidden />
              Browse All Tasks
            </Link>
          </Button>
        </div>


        {/* Trust / Stats row */}
        <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              icon: <Star className="h-5 w-5" />,
              title: "High-Match Score",
              desc: "90%+ avg. suitability",
            },
            {
              icon: <Zap className="h-5 w-5" />,
              title: "Faster Placement",
              desc: "Up to 2× quicker",
            },
            {
              icon: <ShieldCheck className="h-5 w-5" />,
              title: "Verified Tasks",
              desc: "Vetted & trustworthy",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="group/card relative overflow-hidden rounded-2xl border border-teal-200 bg-gradient-to-b from-white to-gray-50 p-5 text-left text-gray-800 shadow-xl transition will-change-transform hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-teal-100/0 via-teal-100/40 to-cyan-100/0 opacity-0 transition group-hover/card:opacity-100" />
              <div className="mb-2 inline-flex items-center gap-2 text-teal-600">
                {item.icon}
                <span className="text-sm font-medium tracking-wide">{item.title}</span>
              </div>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>


        {/* Quotes ticker */}
        <div className="mt-10 w-full">
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl border border-teal-200 bg-white p-4 shadow-sm backdrop-blur">
            <div className="flex items-center justify-center gap-2 text-teal-700">
              <Star className="h-4 w-4 shrink-0" aria-hidden />
              <p className="select-none text-sm sm:text-base">
                “{quotes[quoteIndex].text}”
                <span className="ml-2 text-teal-500">— {quotes[quoteIndex].author}</span>
              </p>
            </div>
          </div>
        </div>


        {/* Subtle bottom glow */}
        <div aria-hidden className="pointer-events-none mt-14 h-px w-64 bg-gradient-to-r from-transparent via-teal-400/60 to-transparent" />
      </div>


      {/* Decorative bottom waves */}
      <div aria-hidden className="absolute inset-x-0 bottom-0">
        <svg
          className="h-24 w-full opacity-60"
          viewBox="0 0 1440 120"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M0,96L60,85.3C120,75,240,53,360,53.3C480,53,600,75,720,80C840,85,960,75,1080,64C1200,53,1320,43,1380,37.3L1440,32L1440,120L1380,120C1320,120,1200,120,1080,120C960,120,840,120,720,120C600,120,480,120,360,120C240,120,120,120,60,120L0,120Z"
            fill="url(#waveGradient)"
          />
          <defs>
            <linearGradient id="waveGradient" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#99f6e4" />
              <stop offset="50%" stopColor="#5eead4" />
              <stop offset="100%" stopColor="#2dd4bf" />
            </linearGradient>
          </defs>
        </svg>
      </div>


      {/* Minor style helpers */}
      <style jsx>{`
        .animation-delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </section>
  );
}
