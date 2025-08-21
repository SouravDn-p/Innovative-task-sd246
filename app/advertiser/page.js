"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AdvertiserDashboard } from "@/components/advertiser/dashboard";
import { CreateCampaign } from "@/components/advertiser/create-campaign";
import { AdvertiserAnalytics } from "@/components/advertiser/analytics";

export default function AdvertiserPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentView, setCurrentView] = useState("dashboard");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (
      status === "authenticated" &&
      session?.user?.role !== "advertiser"
    ) {
      // Redirect non-advertiser users to their appropriate dashboard
      const redirectPath = session?.user?.role === "admin" ? "/admin" : "/user";
      router.push(redirectPath);
    }
  }, [status, session, router]);

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  // Redirect if not authenticated or not advertiser
  if (status === "unauthenticated" || session?.user?.role !== "advertiser") {
    return null;
  }

  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return <AdvertiserDashboard />;
      case "create":
        return <CreateCampaign />;
      case "analytics":
        return <AdvertiserAnalytics />;
      default:
        return <AdvertiserDashboard />;
    }
  };

  return <div>{renderContent()}</div>;
}
