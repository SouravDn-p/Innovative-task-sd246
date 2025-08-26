"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const role = session?.user?.role?.toLowerCase() || "user";

  useEffect(() => {
    if (status === "authenticated") {
      if (role === "admin") {
        router.push("/dashboard/admin");
      } else if (role === "advertiser") {
        router.push("/dashboard/advertiser");
      } else {
        router.push("/dashboard/user");
      }
    }
  }, [status, role, router]);

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-center">
        <p className="text-teal-600">Redirecting to your dashboard...</p>
      </div>
    </motion.div>
  );
}
