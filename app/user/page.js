"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UserDashboard } from "@/components/user/dashboard";
import { TasksPage } from "@/components/user/tasks-page";
import { ReferralsPage } from "@/components/user/referrals-page";
import { MobileNav } from "@/components/user/mobile-nav";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function UserPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (status === "unauthenticated") {
    return null;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <UserDashboard />;
      case "tasks":
        return <TasksPage />;
      case "referrals":
        return <ReferralsPage />;
      case "wallet":
        return <div className="p-4">Wallet page coming soon...</div>;
      case "profile":
        return <div className="p-4">Profile page coming soon...</div>;
      default:
        return <UserDashboard />;
    }
  };

  return (
    <div className="pb-16">
      {renderContent()}
      <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
