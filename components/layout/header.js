"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, User, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session } = useSession();

  // lock scroll when sidebar open
  useEffect(() => {
    if (typeof window === "undefined") return;
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [isMenuOpen]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Tasks", href: "/tasks" },
    { name: "Referrals", href: "/referrals" },
    { name: "About", href: "/about" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-lg dark:bg-gray-900/70 border-b border-gray-100 dark:border-gray-800 shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 shadow-lg"
            >
              <span className="font-semibold text-white">TE</span>
            </motion.div>
            <div className="hidden md:flex flex-col leading-tight">
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                TaskEarn
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Smart task matching
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="relative text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:text-teal-600"
              >
                <span className="inline-block py-2 px-1">{link.name}</span>
                <motion.span
                  layoutId="underline"
                  className="absolute left-0 bottom-0 h-0.5 w-full scale-x-0 bg-teal-500 origin-left"
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {session ? (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="hidden md:flex items-center gap-3"
              >
                <button className="hidden sm:inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium hover:bg-teal-50 dark:hover:bg-gray-800 transition-colors">
                  <User className="h-4 w-4 text-teal-600" />
                  <span>{session.user?.name || "You"}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut()}
                  className="hover:text-red-500 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </motion.div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="px-3 py-2 hover:text-teal-600"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="rounded-full px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white shadow-md hover:scale-105 transition-transform">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen((s) => !s)}
                aria-expanded={isMenuOpen}
                aria-label="Toggle menu"
                className="inline-flex items-center justify-center rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* sidebar */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 z-50 h-full w-64 bg-white dark:bg-gray-900 shadow-xl p-6 flex flex-col"
            >
              {/* header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-teal-600 flex items-center justify-center text-white font-semibold">
                    TE
                  </div>
                  <span className="font-bold text-gray-900 dark:text-gray-100">
                    TaskEarn
                  </span>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* nav */}
              <nav className="flex flex-col gap-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>

              {/* actions */}
              <div className="mt-auto">
                {session ? (
                  <button
                    onClick={() => {
                      signOut();
                      setIsMenuOpen(false);
                    }}
                    className="w-full mt-4 rounded-md border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm hover:bg-teal-50 dark:hover:bg-gray-800 transition"
                  >
                    Sign out
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                      <button className="w-full rounded-md border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm hover:bg-teal-50 dark:hover:bg-gray-800 transition">
                        Login
                      </button>
                    </Link>
                    <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                      <button className="w-full rounded-md bg-teal-600 text-white px-3 py-2 text-sm font-medium hover:bg-teal-500 transition">
                        Get Started
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}