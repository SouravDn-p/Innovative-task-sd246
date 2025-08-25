"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import { motion } from "framer-motion";

export default function DashboardLayoutPage({ children }) {
  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8"
      >
        {children}
      </motion.div>
    </DashboardLayout>
  );
}
