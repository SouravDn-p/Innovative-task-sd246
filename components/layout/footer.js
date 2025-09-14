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
    <footer className="bg-gradient-to-b from-gray-900 to-teal-900">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Company Info */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="h-11 w-11 rounded-lg bg-gradient-to-r from-teal-600 to-cyan-600 flex items-center justify-center shadow-md transform transition-transform hover:scale-105">
              <Image
                src="/logos/logo.png"
                alt="Logo"
                width={36}
                height={36}
              />
            </div>
            <div>
              <span className="font-bold text-xl text-teal-300">Innovative Task Earn</span>
              <div className="text-xs text-teal-400">Smart task matching · Earn smarter</div>
            </div>
          </div>

          <p className="text-sm text-teal-400 leading-relaxed">
            Empowering users to earn through curated tasks & referrals, while helping businesses expand with targeted campaigns.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <a aria-label="Twitter" href="#" className="rounded-full p-2 hover:bg-teal-600/20 transition backdrop-blur-sm">
              <Twitter className="h-5 w-5 text-teal-400" />
            </a>
            <a aria-label="LinkedIn" href="#" className="rounded-full p-2 hover:bg-teal-600/20 transition backdrop-blur-sm">
              <Linkedin className="h-5 w-5 text-teal-400" />
            </a>
            <a aria-label="GitHub" href="#" className="rounded-full p-2 hover:bg-teal-600/20 transition backdrop-blur-sm">
              <Github className="h-5 w-5 text-teal-400" />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold text-teal-300 mb-3">Quick Links</h3>
          <div className="space-y-2 text-sm">
            {["Home", "About Us", "Login", "Register"].map((link, i) => (
              <Link
                key={i}
                href={`/${link === "Home" ? "" : link.toLowerCase().replace(/\s+/g, "-")}`}
                className="block text-teal-400 hover:text-teal-300 transition-colors transform hover:translate-x-1"
              >
                {link}
              </Link>
            ))}
          </div>
        </div>

        {/* For Users */}
        <div>
          <h3 className="font-semibold text-teal-300 mb-3">For Users</h3>
          <div className="space-y-2 text-sm">
            {["Dashboard", "Available Tasks", "Referrals", "Wallet"].map((link, i) => (
              <Link
                key={i}
                href={`/user/${link.toLowerCase().replace(/\s+/g, "-")}`}
                className="block text-teal-400 hover:text-teal-300 transition-colors transform hover:-translate-y-0.5"
              >
                {link}
              </Link>
            ))}
          </div>
        </div>

        {/* Newsletter / Businesses */}
        <div>
          <h3 className="font-semibold text-teal-300 mb-3">Stay in the loop</h3>
          <p className="text-sm text-teal-400 mb-3">Get product updates, new tasks & tips in your inbox.</p>

          <form onSubmit={subscribe} className="flex gap-2">
            <label htmlFor="footer-email" className="sr-only">Email</label>
            <input
              id="footer-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-lg border border-teal-500/50 bg-teal-900/20 px-3 py-2 text-sm placeholder-teal-400 text-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-400 backdrop-blur-sm"
            />
            <button
              type="submit"
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-500 transition-transform hover:scale-105 backdrop-blur-sm border border-teal-500/30"
              disabled={status === "loading"}
            >
              {status === "loading" ? "Subscribing..." : "Subscribe"}
            </button>
          </form>

          <p className={`mt-2 text-sm ${status === "success" ? "text-green-400" : status === "error" ? "text-red-400" : "text-teal-400"}`}>
            {status === "success"
              ? "Subscribed — check your inbox!"
              : status === "error"
              ? "Please enter a valid email."
              : "We’ll only send occasional updates."}
          </p>

          <div className="mt-6">
            <h4 className="text-sm font-medium text-teal-300 mb-2">For Businesses</h4>
            <div className="flex flex-col gap-2 text-sm">
              {["Advertiser Dashboard", "Create Campaign", "Analytics"].map((link, i) => (
                <Link
                  key={i}
                  href={`/advertiser/${link.toLowerCase().replace(/\s+/g, "-")}`}
                  className="block text-teal-400 hover:text-teal-300 transition-colors"
                >
                  {link}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-teal-500/30 py-6 px-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-gradient-to-t from-teal-900/20 to-gray-900/20 backdrop-blur-sm">
        <p className="text-sm text-teal-400">© {new Date().getFullYear()} Innovative Task Earn. All rights reserved.</p>
        <div className="flex items-center gap-6 text-sm">
          <Link href="/privacy" className="text-teal-400 hover:text-teal-300 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-teal-400 hover:text-teal-300 transition-colors">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}