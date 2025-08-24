"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Banknote,
  HandCoins,
  SendHorizontal,
  Gift,
  ClipboardList,
  User2,
  UserPlus,
  ReceiptText,
  Headphones,
  Settings2,
  ChevronRight,
} from "lucide-react";

/**
 * TaskEarnerHub
 * A polished, mobile‑first dashboard section inspired by the provided reference.
 * – Teal-forward theme, subtle glassmorphism, tasteful motion, and hover effects
 * – Fully responsive, keyboard accessible, and easy to drop into any page
 */
export default function TaskEarnerHub() {
  const [showBalance, setShowBalance] = useState(false);

  const actions = [
    { label: "Deposit", icon: Banknote, key: "deposit" },
    { label: "Withdraw", icon: HandCoins, key: "withdraw" },
    { label: "Transfer", icon: SendHorizontal, key: "transfer" },
    { label: "Packages", icon: Gift, key: "packages" },
    { label: "My Task", icon: ClipboardList, key: "task" },
    { label: "Profile", icon: User2, key: "profile" },
    { label: "Refer", icon: UserPlus, key: "refer" },
    { label: "Transactions", icon: ReceiptText, key: "transactions" },
    { label: "Support", icon: Headphones, key: "support" },
    { label: "Settings", icon: Settings2, key: "settings" },
  ];

  const cardVariants = {
    initial: { opacity: 0, y: 10 },
    in: { opacity: 1, y: 0 },
  };

  return (
    <section className="relative w-full py-4 overflow-x-hidden">
      {/* Decorative gradient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-[-20%] h-[380px] bg-gradient-to-b from-teal-600/25 via-teal-500/10 to-transparent blur-2xl" />
        <div className="absolute right-[-10%] top-[15%] h-40 w-40 rounded-full bg-emerald-400/20 blur-2xl" />
        <div className="absolute left-[-10%] top-[50%] h-40 w-40 rounded-full bg-cyan-400/20 blur-2xl" />
      </div>

      {/* Billboard */}
      <div className="mx-auto mt-6 w-full max-w-6xl px-4">
        <motion.div
          variants={cardVariants}
          initial="initial"
          animate="in"
          transition={{ duration: 0.45, delay: 0.1 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 via-emerald-600 to-cyan-600 p-1 shadow-lg"
        >
          <div className="rounded-[22px] bg-white/80 p-6 backdrop-blur-md dark:bg-zinc-900/70">
            <div className="grid items-center gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white md:text-3xl">Earn by Completing Simple Tasks</h2>
                <p className="text-zinc-700 dark:text-zinc-300">
                  TaskEarner helps you monetize micro‑actions: watch, click, review, and refer. Withdraw anytime. Built with transparency and a fair reward system.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  {[
                    "Instant Payout Queue",
                    "Fraud‑Safe Tracking",
                    "Referral Boost",
                    "Daily Streaks",
                  ].map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-teal-400/40 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-800 dark:border-teal-300/20 dark:bg-teal-900/30 dark:text-teal-100"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
              <div className="relative">
                {/* Illustration */}
                <div className="relative mx-auto aspect-[16/9] w-full max-w-md overflow-hidden rounded-2xl ring-1 ring-white/30">
                  <Image
                    src="/inno-dash.png"
                    alt="Earnings growth illustration"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-teal-700/40 to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Action Grid */}
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {actions.map(({ label, icon: Icon, key }, idx) => (
            <motion.button
              key={key}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.3, delay: 0.02 * idx }}
              className="group relative flex flex-col items-center gap-3 rounded-2xl border border-teal-500/10 bg-white/70 p-4 text-left shadow-sm outline-none ring-1 ring-transparent backdrop-blur-md transition hover:-translate-y-0.5 hover:border-teal-500/30 hover:shadow-md focus:ring-teal-500/40 dark:border-zinc-700/50 dark:bg-zinc-900/50"
              aria-label={label}
            >
              <span className="relative inline-flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-500 text-white shadow-sm transition group-hover:scale-105">
                <Icon className="size-7" />
                {/* subtle shine */}
                <span className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity group-hover:opacity-100" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 40%)" }} />
              </span>
              <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{label}</span>
              {/* hover ring */}
              <span className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-transparent transition group-hover:ring-teal-500/30" />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Info / Safety strip */}
      <div className="mx-auto mt-10 w-full max-w-6xl px-4">
        <div className="rounded-2xl border border-teal-500/20 bg-teal-50 p-4 text-sm text-teal-900 shadow-sm dark:border-teal-400/20 dark:bg-teal-900/30 dark:text-teal-100">
          <p className="leading-relaxed">
            Pro tip: keep your account secure with 2‑step verification and only complete tasks from verified partners. Need help? Open a support ticket — average response time is under 2 hours.
          </p>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="mx-auto mt-8 w-full max-w-6xl px-4 pb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center justify-between gap-4 rounded-2xl bg-white/70 p-5 shadow-sm ring-1 ring-white/40 backdrop-blur-md dark:bg-zinc-900/60 dark:ring-zinc-700 md:flex-row"
        >
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Ready to start earning?</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Join daily campaigns and climb the leaderboard with streak bonuses.</p>
          </div>
          <div className="flex gap-3">
            <a
              href="/tasks"
              className="inline-flex items-center justify-center rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
            >
              Explore Tasks
            </a>
            <a
              href="/referrals"
              className="inline-flex items-center justify-center rounded-xl border border-teal-500/30 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-800 transition hover:border-teal-500/50 hover:bg-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-500/40 dark:border-teal-400/20 dark:bg-teal-900/30 dark:text-teal-100"
            >
              Refer & Earn
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}