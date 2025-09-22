"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";

export default function JoinReferralPage() {
  const router = useRouter();
  const params = useParams();
  const { referId } = params;

  // Store referral ID in localStorage and redirect to register page
  React.useEffect(() => {
    if (referId) {
      // Store the referral ID in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("referrerId", referId);
      }
      // Redirect to registration page
      router.push("/register");
    } else {
      // Redirect to dashboard if no referral ID
      router.push("/dashboard/user/referrals");
    }
  }, [referId, router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <p className="text-lg">Processing referral...</p>
    </div>
  );
}