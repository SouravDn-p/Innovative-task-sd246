"use client";

import Link from "next/link";
import { Twitter, Linkedin, Github } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

export function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // "idle" | "loading" | "success" | "error"

  const subscribe = async (e) => {
    e.preventDefault();
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    try {
      // Replace with real API call
      await new Promise((r) => setTimeout(r, 700));
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <footer className="bg-gradient-to-b from-black to-gray-900 relative overflow-hidden">
      {/* Decorative background elements */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-96 w-96 animate-pulse rounded-full bg-gray-800/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-40 h-[28rem] w-[28rem] animate-pulse rounded-full bg-black/30 blur-3xl animation-delay-1000" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
        {/* Company Info */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="h-11 w-11 rounded-lg bg-gradient-to-r from-gray-800 to-black flex items-center justify-center shadow-md transform transition-transform hover:scale-105 backdrop-blur-sm">
              <Image src="/logos/logo.png" alt="Logo" width={36} height={36} />
            </div>
            <div>
              <span className="font-bold text-xl text-gray-300">
                Innovative Task Earn
              </span>
              <div className="text-xs text-gray-400">
                Smart task matching · Earn smarter
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-400 leading-relaxed">
            Empowering users to earn through curated tasks & referrals, while
            helping businesses expand with targeted campaigns.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <a
              aria-label="Twitter"
              href="#"
              className="rounded-full p-2 hover:bg-gray-800/40 transition backdrop-blur-sm border border-gray-800"
            >
              <Twitter className="h-5 w-5 text-gray-400" />
            </a>
            <a
              aria-label="LinkedIn"
              href="#"
              className="rounded-full p-2 hover:bg-gray-800/40 transition backdrop-blur-sm border border-gray-800"
            >
              <Linkedin className="h-5 w-5 text-gray-400" />
            </a>
            <a
              aria-label="GitHub"
              href="#"
              className="rounded-full p-2 hover:bg-gray-800/40 transition backdrop-blur-sm border border-gray-800"
            >
              <Github className="h-5 w-5 text-gray-400" />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold text-gray-300 mb-3">Quick Links</h3>
          <div className="space-y-2 text-sm">
            {["Home", "About Us", "Login", "Register"].map((link, i) => (
              <Link
                key={i}
                href={`/${
                  link === "Home" ? "" : link.toLowerCase().replace(/\s+/g, "-")
                }`}
                className="block text-gray-400 hover:text-gray-300 transition-colors transform hover:translate-x-1"
              >
                {link}
              </Link>
            ))}
          </div>
        </div>

        {/* For Users */}
        <div>
          <h3 className="font-semibold text-gray-300 mb-3">For Users</h3>
          <div className="space-y-2 text-sm">
            {["Dashboard", "Available Tasks", "Referrals", "Wallet"].map(
              (link, i) => (
                <Link
                  key={i}
                  href={`/user/${link.toLowerCase().replace(/\s+/g, "-")}`}
                  className="block text-gray-400 hover:text-gray-300 transition-colors transform hover:-translate-y-0.5"
                >
                  {link}
                </Link>
              )
            )}
          </div>
        </div>

        {/* Newsletter / Businesses */}
        <div>
          <h3 className="font-semibold text-gray-300 mb-3">Stay in the loop</h3>
          <p className="text-sm text-gray-400 mb-3">
            Get product updates, new tasks & tips in your inbox.
          </p>

          <form onSubmit={subscribe} className="flex gap-2">
            <label htmlFor="footer-email" className="sr-only">
              Email
            </label>
            <input
              id="footer-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-lg border border-gray-800 bg-gray-900/40 px-3 py-2 text-sm placeholder-gray-500 text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-700 backdrop-blur-sm"
            />
            <button
              type="submit"
              className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white hover:bg-black transition-transform hover:scale-105 backdrop-blur-sm border border-gray-700"
              disabled={status === "loading"}
            >
              {status === "loading" ? "Subscribing..." : "Subscribe"}
            </button>
          </form>

          <p
            className={`mt-2 text-sm ${
              status === "success"
                ? "text-green-400"
                : status === "error"
                ? "text-red-400"
                : "text-gray-400"
            }`}
          >
            {status === "success"
              ? "Subscribed — check your inbox!"
              : status === "error"
              ? "Please enter a valid email."
              : "We'll only send occasional updates."}
          </p>

          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-300 mb-2">
              For Businesses
            </h4>
            <div className="flex flex-col gap-2 text-sm">
              {["Advertiser Dashboard", "Create Campaign", "Analytics"].map(
                (link, i) => (
                  <Link
                    key={i}
                    href={`/advertiser/${link
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                    className="block text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    {link}
                  </Link>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 py-6 px-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-gradient-to-t from-black/40 to-gray-900/40 backdrop-blur-sm relative z-10">
        <p className="text-sm text-gray-400">
          © {new Date().getFullYear()} Innovative Task Earn. All rights
          reserved.
        </p>
        <div className="flex items-center gap-6 text-sm">
          <Link
            href="/privacy"
            className="text-gray-400 hover:text-gray-300 transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="text-gray-400 hover:text-gray-300 transition-colors"
          >
            Terms of Service
          </Link>
        </div>
      </div>

      {/* Minor style helpers */}
      <style jsx>{`
        .animation-delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </footer>
  );
}
