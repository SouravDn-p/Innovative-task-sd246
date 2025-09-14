"use client"

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle,
  TrendingUp,
  Award,
  Zap,
  Shield,
  Star,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function EarnTaskFeatures() {
  const features = [
    {
      id: "verified",
      icon: <CheckCircle className="h-7 w-7" />,
      title: "Verified Tasks Only",
      desc: "All tasks are verified by our team to ensure legitimacy and fair compensation",
      accent: "from-teal-900/20 to-teal-800/20",
    },
    {
      id: "weekly",
      icon: <TrendingUp className="h-7 w-7" />,
      title: "Weekly Targets",
      desc: "Maintain activity with ₹1500 weekly earnings or 5 daily referrals to stay active",
      accent: "from-cyan-900/20 to-teal-900/20",
    },
    {
      id: "kyc",
      icon: <Award className="h-7 w-7" />,
      title: "KYC Protected",
      desc: "One-time ₹99 KYC verification unlocks all earning features and withdrawal access",
      accent: "from-emerald-900/20 to-teal-900/20",
    },
    {
      id: "instant",
      icon: <Zap className="h-7 w-7" />,
      title: "Instant Credits",
      desc: "Task earnings and referral bonuses are credited instantly to your wallet",
      accent: "from-teal-900/20 to-cyan-900/20",
    },
    {
      id: "fraud",
      icon: <Shield className="h-7 w-7" />,
      title: "Fraud Protection",
      desc: "Advanced fraud detection with random audits to maintain platform integrity",
      accent: "from-sky-900/20 to-teal-900/20",
    },
    {
      id: "support",
      icon: <Star className="h-7 w-7" />,
      title: "Professional Support",
      desc: "Dedicated support team with role-based management for quick issue resolution",
      accent: "from-teal-900/20 to-emerald-900/20",
    },
  ];

  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.06,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="">
      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-900 to-teal-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl lg:text-4xl font-serif font-extrabold text-teal-300 mb-3">
              Why Choose EarnTask?
            </h2>
            <p className="text-lg text-teal-400 max-w-2xl mx-auto">
              A polished, professional platform for serious earners — secure payouts,
              transparent processes, and powerful support.
            </p>
          </div>

          {/* Pinterest-like masonry using CSS columns for a lively layout */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6"
          >
            {features.map((f, idx) => (
              <motion.div key={f.id} variants={item} className="break-inside-avoid">
                <Card
                  className={`relative overflow-hidden transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl group border border-teal-500/30 bg-teal-900/20 backdrop-blur-md`}
                  aria-labelledby={`feature-${f.id}`}
                >
                  {/* Decorative gradient accent */}
                  <div
                    className={`pointer-events-none absolute -inset-x-6 -top-6 h-36 bg-gradient-to-r ${f.accent} opacity-30 skew-y-2 blur-xl`}
                    aria-hidden="true"
                  />

                  <CardHeader className="relative p-6">
                    <div className="flex items-start gap-4">
                      <div
                        className="flex-shrink-0 w-14 h-14 rounded-xl bg-teal-900/30 backdrop-blur-sm border border-teal-500/40 flex items-center justify-center shadow-sm group-hover:scale-105 transform transition"
                        aria-hidden
                      >
                        <div className="text-teal-400">{f.icon}</div>
                      </div>

                      <div className="flex-1">
                        <CardTitle
                          id={`feature-${f.id}`}
                          className="text-lg font-semibold text-teal-300"
                        >
                          {f.title}
                        </CardTitle>
                        <CardDescription className="mt-2 text-sm text-teal-400">
                          {f.desc}
                        </CardDescription>
                      </div>
                    </div>

                    {/* subtle CTA pill */}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-xs text-teal-400">Instant setup</div>
                      <div className="text-xs font-medium text-teal-300">Trusted</div>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* small explanatory row */}
          <div className="mt-8 flex flex-wrap gap-4 justify-center text-sm text-teal-400">
            <span className="inline-flex items-center gap-2">⚡ Instant credits & quick payouts</span>
            <span className="inline-flex items-center gap-2">🔒 Secure KYC flow</span>
            <span className="inline-flex items-center gap-2">🤝 Dedicated support</span>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 to-teal-800">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl lg:text-4xl font-serif font-extrabold mb-4 text-teal-300"
          >
            Ready to Start Earning?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.12 }}
            className="text-lg text-teal-400 mb-8 max-w-2xl mx-auto"
          >
            Join EarnTask today — verified tasks, real payouts, and a community for
            consistent earners.
          </motion.p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 text-lg rounded-full shadow-lg transform transition-all backdrop-blur-sm border border-teal-500/30"
            >
              <Link href="/register" className="flex items-center gap-2">
                <span>Create Account</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-lg px-8 py-3 rounded-full bg-teal-900/20 border border-teal-500/50 hover:bg-teal-900/30 hover:border-teal-400 text-teal-300 backdrop-blur-sm"
            >
              <Link href="/about">Learn More</Link>
            </Button>
          </div>

          {/* micro trust badges */}
          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-teal-400">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-teal-900/30 flex items-center justify-center shadow border border-teal-500/40 backdrop-blur-sm">✓</div>
              <span>Secure Withdrawals</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-teal-900/30 flex items-center justify-center shadow border border-teal-500/40 backdrop-blur-sm">₹</div>
              <span>Trusted Payouts</span>
            </div>
          </div>
        </div>
      </section>

      {/* Extra: small responsive helpers for accessibility */}
      <style jsx>{`
        /* Make sure the masonry look works across breakpoints */
        @media (min-width: 1024px) {
          .columns-1.sm\\:columns-2.lg\\:columns-3 {
            column-count: 3;
          }
        }

        @media (min-width: 640px) and (max-width: 1023px) {
          .columns-1.sm\\:columns-2.lg\\:columns-3 {
            column-count: 2;
          }
        }

        /* tiny card polish */
        .break-inside-avoid {
          break-inside: avoid;
        }
      `}</style>
    </div>
  );
}