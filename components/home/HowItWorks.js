"use client";

import { Card } from "@/components/ui/card";
import { User, Search, CheckCircle, Wallet } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      icon: User,
      step: "Step 1",
      title: "Create Account",
      description:
        "Sign up and complete the simple KYC verification process to unlock all earning features.",
    },
    {
      icon: Search,
      step: "Step 2",
      title: "Browse Tasks",
      description:
        "Explore our wide variety of verified tasks that match your skills and interests.",
    },
    {
      icon: CheckCircle,
      step: "Step 3",
      title: "Complete Tasks",
      description:
        "Work on tasks at your own pace and submit for review when finished.",
    },
    {
      icon: Wallet,
      step: "Step 4",
      title: "Get Paid",
      description:
        "Receive instant credits to your wallet and withdraw anytime after KYC.",
    },
  ];

  return (
    <section className="container relative mx-auto px-4 py-16 sm:py-20">
      <div className="text-center z-1 mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          How EarnTask Works
        </h2>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          Start earning in just a few simple steps. Our streamlined process
          makes it easy to find and complete tasks.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <div key={index} className="relative">
            {index !== steps.length - 1 && (
              <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-purple-500 to-indigo-600"></div>
            )}
            <Card className="liquid-glass border border-white/10 bg-white/5 backdrop-blur-xl p-6 h-full hover:scale-[1.02] transition-transform duration-300">
              <div className="flex items-center mb-4">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-purple-500/20 mr-4">
                  <step.icon className="h-6 w-6 text-purple-400" />
                </div>
                <div className="text-sm font-semibold text-purple-400">
                  {step.step}
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {step.title}
              </h3>
              <p className="text-gray-300">{step.description}</p>
            </Card>
          </div>
        ))}
      </div>
    </section>
  );
}
