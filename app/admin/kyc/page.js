"use client";

import { AdminKYCReview } from "@/components/kyc/admin-kyc-review";
import { useState } from "react";

export default function AdminKYCPage() {
  const [userRole, setUserRole] = useState("admin");

  return (
    <div className="min-h-screen bg-background">
      <AdminKYCReview userRole={userRole} />
    </div>
  );
}
