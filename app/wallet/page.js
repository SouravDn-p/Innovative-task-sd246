"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { WalletDashboard } from "@/components/wallet/wallet-dashboard";
import { WithdrawalForm } from "@/components/wallet/withdrawal-form";
import { AddFunds } from "@/components/wallet/add-funds";
import { TransactionHistory } from "@/components/wallet/transaction-history";

export default function WalletPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentView, setCurrentView] = useState("dashboard");

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

  const userType = session?.user?.role || "user";

  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return <WalletDashboard userType={userType} />;
      case "withdraw":
        return <WithdrawalForm onBack={() => setCurrentView("dashboard")} />;
      case "add-funds":
        return <AddFunds onBack={() => setCurrentView("dashboard")} />;
      case "history":
        return (
          <TransactionHistory onBack={() => setCurrentView("dashboard")} />
        );
      default:
        return <WalletDashboard userType={userType} />;
    }
  };

  return <div>{renderContent()}</div>;
}
