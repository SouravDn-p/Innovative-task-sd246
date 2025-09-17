"use client";

import { Button } from "@/components/ui/button";

export function TaskEarnHero() {
  return (
    <section className=" isolate overflow-hidden">
      <div className="container  mx-auto px-4">
        <div className="flex flex-col items-center justify-center py-14 sm:py-20">
          <div className="mb-5 flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <p className="text-sm uppercase tracking-[0.25em] text-purple-400/80">
              EarnTask
            </p>
          </div>
          <h1 className="mt-3 text-center text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            <span className="block">Ignite Your Earnings With</span>
            <span className="block bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent">
              Innovative Task Earn
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-center text-lg text-gray-300">
            Our AI connects you with tasks that fit your skills, experience, and
            goals—so you earn faster with smart, high-match referrals.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button className="rounded-full bg-purple-600 px-6 text-white hover:bg-purple-700">
              Create Account
            </Button>
            <Button
              variant="outline"
              className="rounded-full border-purple-500 text-purple-400 hover:bg-purple-500/10"
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
