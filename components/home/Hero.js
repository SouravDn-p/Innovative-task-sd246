"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, Search } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-screen bg-gray-900 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full" viewBox="0 0 1200 800" fill="none">
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="#0d9488"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          {/* Network nodes */}
          <circle cx="200" cy="150" r="3" fill="#0d9488" />
          <circle cx="400" cy="200" r="3" fill="#0d9488" />
          <circle cx="600" cy="100" r="3" fill="#0d9488" />
          <circle cx="800" cy="250" r="3" fill="#0d9488" />
          <circle cx="1000" cy="180" r="3" fill="#0d9488" />
          {/* Connection lines */}
          <line
            x1="200"
            y1="150"
            x2="400"
            y2="200"
            stroke="#0d9488"
            strokeWidth="1"
            opacity="0.5"
          />
          <line
            x1="400"
            y1="200"
            x2="600"
            y2="100"
            stroke="#0d9488"
            strokeWidth="1"
            opacity="0.5"
          />
          <line
            x1="600"
            y1="100"
            x2="800"
            y2="250"
            stroke="#0d9488"
            strokeWidth="1"
            opacity="0.5"
          />
          <line
            x1="800"
            y1="250"
            x2="1000"
            y2="180"
            stroke="#0d9488"
            strokeWidth="1"
            opacity="0.5"
          />
        </svg>
      </div>

      <div className="relative z-10 container mx-auto px-4 flex flex-col items-center justify-center min-h-screen text-center">
        <div className="mb-8 inline-flex items-center space-x-2 bg-blue-600/20 border border-blue-500/30 rounded-full px-4 py-2 text-blue-400 text-sm font-medium">
          <Sparkles className="h-4 w-4" />
          <span>AI-Powered Task Matching</span>
        </div>

        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
          Ignite Your Earnings With
          <span className="block text-transparent bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text">
            Innovative Task Earn
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed">
          Our AI-powered platform connects you with tasks that perfectly match
          your skills, experience, and earning goals. Start earning faster with
          smart referrals.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300 flex items-center space-x-2">
            <Sparkles className="h-5 w-5" />
            <Link href="/register">Get Task Recommendations</Link>
          </Button>
          <Button
            variant="outline"
            className="border-2 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white px-8 py-4 text-lg font-semibold rounded-lg bg-transparent transition-all duration-300 flex items-center space-x-2"
          >
            <Search className="h-5 w-5" />
            <Link href="/tasks">Browse All Tasks</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
