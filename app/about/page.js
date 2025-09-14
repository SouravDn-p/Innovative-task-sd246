"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Target,
  Eye,
  Heart,
  TrendingUp,
  Shield,
  Award,
  Globe,
  ArrowRight,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

// ————————————————————————————
// Animation Presets
// ————————————————————————————
const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -24 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

const fadeInRight = {
  hidden: { opacity: 0, x: 24 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const hoverScale = {
  scale: 1.05,
  transition: { duration: 0.3 },
};

export default function AboutPage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef });
  const yBlob1 = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const yBlob2 = useTransform(scrollYProgress, [0, 1], [0, 50]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-teal-900 text-teal-300">
      {/* Background ornaments */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        {/* soft grid */}
        <div className="[mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)] absolute inset-0 bg-[linear-gradient(to_right,rgba(13,148,136,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(13,148,136,0.1)_1px,transparent_1px)] bg-[size:24px_24px] md:bg-[size:32px_32px]" />
        {/* animated blobs with parallax */}
        <motion.div
          style={{ y: yBlob1 }}
          className="absolute -top-32 -left-24 h-64 w-64 md:h-80 md:w-80 rounded-full bg-teal-600/30 blur-3xl animate-pulse-slow"
        />
        <motion.div
          style={{ y: yBlob2 }}
          className="absolute -bottom-24 -right-24 h-64 w-64 md:h-80 md:w-80 rounded-full bg-teal-500/30 blur-3xl animate-pulse-slow"
        />
      </div>

      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section - Enhanced with parallax blobs and more animations */}
        <section ref={heroRef} className="py-16 md:py-20 lg:py-28">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="max-w-4xl mx-auto text-center space-y-6 md:space-y-8"
          >
            <motion.div variants={scaleIn}>
              <Badge
                variant="secondary"
                className="mb-4 border border-teal-500/50 bg-teal-900/20 text-teal-300 px-4 py-1 text-sm md:text-base backdrop-blur-sm"
              >
                About TaskEarn Pro
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight"
            >
              Empowering the Future of
              <span className="block bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Digital Earning
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-base sm:text-lg md:text-xl text-teal-400 max-w-3xl mx-auto leading-relaxed"
            >
              We&apos;re building a trusted platform where real people complete
              meaningful tasks and businesses gain authentic growth and
              engagement.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex items-center justify-center gap-3"
            >
              <div className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
              <p className="text-sm text-teal-400">
                Secure • Transparent • Fair
              </p>
              <div className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
            </motion.div>
          </motion.div>
        </section>

        {/* Mission, Vision, Values - Added hover effects and responsive grid */}
        <section className="py-16">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              {
                title: "Our Mission",
                Icon: Target,
                color: "teal",
                copy: "To democratize earning opportunities by connecting users with meaningful tasks while helping businesses achieve authentic growth.",
              },
              {
                title: "Our Vision",
                Icon: Eye,
                color: "teal",
                copy: "To be the global leader in task‑based earning, creating a sustainable ecosystem where everyone benefits.",
              },
              {
                title: "Our Values",
                Icon: Heart,
                color: "teal",
                copy: "Trust, transparency, and fairness guide everything we do—creating genuine value for users and businesses.",
              },
            ].map(({ title, Icon, copy }, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                whileHover={hoverScale}
                className="group"
              >
                <Card className="border border-teal-500/50 bg-teal-900/20 shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:ring-1 group-hover:ring-teal-400 backdrop-blur-md">
                  <CardContent className="p-6 md:p-8 text-center">
                    <div className="group mx-auto mb-6 grid h-14 w-14 md:h-16 md:w-16 place-items-center rounded-2xl bg-teal-900/30 ring-1 ring-teal-500/40 transition-colors group-hover:bg-teal-900/50 backdrop-blur-sm">
                      <Icon className="h-6 w-6 md:h-8 md:w-8 text-teal-400 transition-transform group-hover:scale-110" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold mb-3 text-teal-300">
                      {title}
                    </h3>
                    <p className="text-sm md:text-base text-teal-400 leading-relaxed">
                      {copy}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Company Story - Improved layout for mobile, added left/right animations */}
        <section className="py-16 md:py-20">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12 md:mb-14"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-teal-300 mb-3">
                Our Story
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-teal-400">
                From a simple idea to a global platform serving thousands
              </p>
            </motion.div>

            <div className="space-y-12 md:space-y-16">
              {/* The Beginning */}
              <motion.div
                variants={stagger}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center"
              >
                <motion.div variants={fadeInLeft}>
                  <h3 className="text-xl md:text-2xl font-bold mb-4 text-teal-300">The Beginning</h3>
                  <p className="text-sm md:text-base text-teal-400 leading-relaxed mb-4">
                    TaskEarn Pro was founded in 2023 with a simple
                    observation: millions of people sought flexible earning
                    opportunities while businesses struggled to find authentic
                    user engagement.
                  </p>
                  <p className="text-sm md:text-base text-teal-400 leading-relaxed">
                    Our founders—experienced in fintech and digital
                    marketing—saw a way to build a platform that benefits both
                    sides of this equation.
                  </p>
                </motion.div>

                <motion.div
                  variants={fadeInRight}
                  className="relative overflow-hidden rounded-3xl p-6 md:p-8 text-center ring-1 ring-teal-500/50 bg-gradient-to-br from-teal-900/20 to-teal-800/20 backdrop-blur-md"
                >
                  <div className="absolute inset-0 opacity-30 [mask-image:radial-gradient(200px_200px_at_70%_-20%,black,transparent)] bg-[radial-gradient(circle_at_20%_20%,theme(colors.teal.400/40),transparent_50%),radial-gradient(circle_at_80%_80%,theme(colors.teal.400/40),transparent_50%)]" />
                  <div className="relative">
                    <div className="text-4xl md:text-5xl font-extrabold text-teal-400 mb-1">
                      2023
                    </div>
                    <div className="text-sm md:text-base text-teal-400">Founded</div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Today */}
              <motion.div
                variants={stagger}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center"
              >
                {/* Copy */}
                <motion.div variants={fadeInLeft}>
                  <h3 className="text-xl md:text-2xl font-bold mb-4 text-teal-300">Today</h3>
                  <p className="text-sm md:text-base text-teal-400 leading-relaxed mb-4">
                    We&apos;ve grown into a trusted platform serving over
                    50,000 active users and 500+ businesses across multiple
                    countries. Our users have completed over 1 million tasks
                    and earned more than ₹10 crores collectively.
                  </p>
                  <p className="text-sm md:text-base text-teal-400 leading-relaxed">
                    And we&apos;re just getting started—our vision is to
                    create lasting impact across the digital economy.
                  </p>
                </motion.div>

                {/* Stats */}
                <motion.div variants={fadeInRight}>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      {
                        kpi: "50K+",
                        label: "Active Users",
                      },
                      {
                        kpi: "1M+",
                        label: "Tasks Completed",
                      },
                      {
                        kpi: "500+",
                        label: "Business Partners",
                      },
                      {
                        kpi: "₹10Cr+",
                        label: "Paid to Users",
                      },
                    ].map(({ kpi, label }, i) => (
                      <motion.div
                        key={i}
                        whileHover={hoverScale}
                        className="group rounded-2xl bg-teal-900/20 p-4 md:p-6 text-center ring-1 ring-teal-500/50 transition-all hover:shadow-md backdrop-blur-md"
                      >
                        <div className="text-2xl md:text-3xl font-extrabold text-teal-400 mb-1 tracking-tight">
                          {kpi}
                        </div>
                        <div className="text-xs md:text-sm text-teal-400">{label}</div>
                        <div className="mt-2 md:mt-3 h-1 w-8 md:w-10 mx-auto rounded-full bg-gradient-to-r from-teal-400 to-teal-300 opacity-60 transition-opacity group-hover:opacity-100" />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Team Section - Enhanced cards with hover effects and better mobile spacing */}
        <section className="py-16 md:py-20">
          <div className="text-center mb-12 md:mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-3 text-teal-300">
              Meet Our Team
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-teal-400">
              The passionate individuals building the future of digital earning
            </p>
          </div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              {
                name: "Arjun Kumar",
                role: "CEO & Co‑Founder",
                init: "AK",
                bio: "Former fintech executive with 10+ years in digital payments and user acquisition.",
              },
              {
                name: "Sneha Patel",
                role: "CTO & Co‑Founder",
                init: "SP",
                bio: "Tech leader in scalable platforms and blockchain from top tech companies.",
              },
              {
                name: "Rohit Gupta",
                role: "Head of Operations",
                init: "RG",
                bio: "Operations expert ensuring smooth platform functioning and stellar UX.",
              },
            ].map(({ name, role, init, bio }, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                whileHover={hoverScale}
                className="group"
              >
                <Card className="relative overflow-hidden border border-teal-500/50 bg-teal-900/20 transition-all duration-300 group-hover:shadow-xl group-hover:ring-1 group-hover:ring-teal-400 backdrop-blur-md">
                  {/* glow */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(400px_200px_at_50%_-20%,theme(colors.teal.400/30),transparent)]"
                  />
                  <CardContent className="relative p-6 md:p-8 text-center">
                    <div className="mx-auto mb-6 grid h-20 w-20 md:h-24 md:w-24 place-items-center rounded-full bg-teal-900/30 ring-1 ring-teal-500/40 transition-colors group-hover:bg-teal-900/50 backdrop-blur-sm">
                      <span className="text-xl md:text-2xl font-extrabold text-teal-400">
                        {init}
                      </span>
                    </div>
                    <h3 className="text-lg md:text-xl font-semibold mb-1 text-teal-300">{name}</h3>
                    <p className="font-medium text-teal-400 mb-3 text-sm md:text-base">{role}</p>
                    <p className="text-xs md:text-sm text-teal-400">{bio}</p>

                    <div className="mt-4 md:mt-6 flex justify-center gap-3">
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="text-sm px-4 border-teal-500/50 text-teal-300 hover:bg-teal-600/30 hover:text-teal-200 backdrop-blur-sm"
                      >
                        <Link href="#">Connect</Link>
                      </Button>
                      <Button
                        asChild
                        size="sm"
                        className="text-sm px-4 bg-teal-600 hover:bg-teal-700 text-white backdrop-blur-sm border border-teal-500/30"
                      >
                        <Link href="#">View Profile</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Trust & Security - Grid responsive, hover effects */}
        <section className="py-16 md:py-20">
          <div className="text-center mb-12 md:mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-3 text-teal-300">
              Trust &amp; Security
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-teal-400">
              Your security and trust are our top priorities
            </p>
          </div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              {
                title: "KYC Verified",
                desc: "All users undergo strict KYC verification",
                Icon: Shield,
              },
              {
                title: "Certified Platform",
                desc: "ISO certified and compliant with regulations",
                Icon: Award,
              },
              {
                title: "Global Reach",
                desc: "Serving users across multiple countries",
                Icon: Globe,
              },
              {
                title: "Proven Track Record",
                desc: "Consistent growth and user satisfaction",
                Icon: TrendingUp,
              },
            ].map(({ title, desc, Icon }, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                whileHover={hoverScale}
                className="group"
              >
                <div className="text-center rounded-2xl bg-teal-900/20 p-6 md:p-8 ring-1 ring-teal-500/50 transition-all group-hover:shadow-md group-hover:ring-teal-400 backdrop-blur-md">
                  <div className="mx-auto mb-4 grid h-14 w-14 md:h-16 md:w-16 place-items-center rounded-2xl bg-teal-900/30 ring-1 ring-teal-500/40 transition-colors group-hover:bg-teal-900/50 backdrop-blur-sm">
                    <Icon className="h-6 w-6 md:h-8 md:w-8 text-teal-400 transition-transform group-hover:scale-110" />
                  </div>
                  <h3 className="font-semibold mb-2 text-teal-300 text-base md:text-lg">
                    {title}
                  </h3>
                  <p className="text-xs md:text-sm text-teal-400">{desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* CTA Section - Added scale animation and hover on buttons */}
        <section className="py-16 md:py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-600 to-teal-500 p-8 md:p-10 lg:p-14 text-center text-white shadow-lg backdrop-blur-md border border-teal-500/30"
          >
            {/* subtle noise & beams */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-20 bg-[radial-gradient(1000px_400px_at_50%_-10%,theme(colors.teal.400/30),transparent)]"
            />
            <div className="relative mx-auto max-w-3xl space-y-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold">
                Join Our Growing Community
              </h2>
              <p className="text-base sm:text-lg md:text-xl/relaxed text-teal-100">
                Be part of the digital earning revolution. Start your journey
                with TaskEarn Pro today and discover new opportunities to grow
                your income.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <motion.div whileHover={hoverScale}>
                  <Button
                    asChild
                    size="lg"
                    variant="secondary"
                    className="text-base md:text-lg px-6 md:px-8 bg-teal-900/30 text-teal-300 hover:bg-teal-900/50 border border-teal-500/50 backdrop-blur-sm"
                  >
                    <Link href="/register">
                      Get Started Now <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                    </Link>
                  </Button>
                </motion.div>
                <motion.div whileHover={hoverScale}>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="text-base md:text-lg px-6 md:px-8 border-teal-500/50 text-teal-300 hover:bg-teal-900/50 hover:text-teal-200 bg-transparent backdrop-blur-sm"
                  >
                    <Link href="/login">Login to Dashboard</Link>
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </section>
      </div>
      <Footer />
    </div>
  );
}