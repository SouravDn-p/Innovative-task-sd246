"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function JoinReferralPage() {
  const router = useRouter();

  // Redirect to dashboard since we're handling referrals there now
  React.useEffect(() => {
    router.push("/dashboard/user/referrals");
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <p className="text-lg">Redirecting to referral dashboard...</p>
    </div>
  );
}
