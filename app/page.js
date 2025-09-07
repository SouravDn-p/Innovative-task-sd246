"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/home/Hero";
import EarnTaskFeatures from "@/components/EarnTaskFeatures/page";
import TaskEarnerHub from "@/components/TaskEarnerHub";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (status === "authenticated") {
      const role = session?.user?.role?.toLowerCase() || "user";
      if (role === "admin") {
        router.push("/dashboard/admin");
      } else if (role === "advertiser") {
        router.push("/dashboard/advertiser");
      } else {
        router.push("/dashboard/user");
      }
    }
  }, [status, session, router]);

  // Show loading state while checking auth status
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  // Only show home page content to unauthenticated users
  if (!session) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <Hero />
        {/* <TaskEarnerHub /> */}
        <EarnTaskFeatures />
        <Footer />
      </div>
    );
  }

  // Return null while redirecting authenticated users
  return null;
}
