"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { BecomeAdvertiser } from "@/components/user/become-advertiser";
import { ArrowLeft } from "lucide-react";

export default function BecomeAdvertiserPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        <span className="ml-2 text-teal-800">Loading...</span>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  // If user is already an advertiser or has a pending request
  if (session?.user?.role === "advertiser") {
    router.push("/dashboard/advertiser");
    return null;
  }

  if (session?.user?.advertiserRequestStatus === "pending") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto p-4"
      >
        <Card className="border-teal-200 shadow-md">
          <CardHeader>
            <CardTitle className="text-teal-800">
              Advertiser Request Pending
            </CardTitle>
            <CardDescription>
              Your request to become an advertiser is under review
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="bg-amber-100 text-amber-800 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-lg text-teal-700 mb-2">
                Thank you for your interest in becoming an advertiser.
              </p>
              <p className="text-teal-600 mb-6">
                Our team is currently reviewing your request. You will receive
                an email notification once your advertiser account is approved.
              </p>
              <Button
                onClick={() => router.push("/dashboard/user")}
                className="bg-teal-600 hover:bg-teal-700"
              >
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-4"
    >
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/user")}
          className="border-teal-200 text-teal-700 hover:bg-teal-50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl font-bold text-teal-900">
          Become an Advertiser
        </h1>
      </div>

      <BecomeAdvertiser />
    </motion.div>
  );
}
