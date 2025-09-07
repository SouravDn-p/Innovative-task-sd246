"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "next-auth/react";
import { useAddReferralMutation } from "@/redux/api/api";
import Swal from "sweetalert2";

export default function ReferralModal({ open, onOpenChange, onReferralAdded }) {
  const [referralInput, setReferralInput] = useState("");
  const [referralError, setReferralError] = useState("");
  const { data: session } = useSession();
  const [addReferral] = useAddReferralMutation();

  // Check for referrerId in localStorage when modal opens
  useEffect(() => {
    if (open && typeof window !== "undefined") {
      const storedReferrerId = localStorage.getItem("referrerId");
      if (storedReferrerId) {
        setReferralInput(storedReferrerId);
      }
    }
  }, [open]);

  const handleAddReferral = async () => {
    if (!referralInput) {
      setReferralError("Please enter a referral ID");
      return;
    }

    try {
      const newUser = {
        name: session?.user?.name,
        email: session?.user?.email,
      };

      const res = await addReferral({
        referrerId: referralInput,
        newUser,
      }).unwrap();

      Swal.fire({
        icon: "success",
        title: "Referral Added!",
        text: "You've been successfully added as a referral.",
      });

      // Clear referrerId from localStorage after successful referral
      if (typeof window !== "undefined") {
        localStorage.removeItem("referrerId");
      }

      onOpenChange(false);
      setReferralInput("");
      setReferralError("");
      onReferralAdded();
    } catch (err) {
      console.error("Add referral error:", err);
      let errorMessage =
        "Failed to add referral. Please check the ID and try again.";

      // More specific error handling
      if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (err?.status === 404) {
        errorMessage = "Referrer not found. Please check the referral ID.";
      } else if (err?.status === 400) {
        if (err?.data?.message?.includes("already has a referrer")) {
          errorMessage = "You have already been referred by someone else.";
        } else if (err?.data?.message?.includes("Invalid referrer ID format")) {
          errorMessage =
            "Invalid referral ID format. Please check the ID and try again.";
        } else {
          errorMessage = "Invalid request. Please check the referral ID.";
        }
      } else if (err?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      }

      setReferralError(errorMessage);
    }
  };

  const handleSkip = () => {
    // Clear referrerId from localStorage if user skips
    if (typeof window !== "undefined") {
      localStorage.removeItem("referrerId");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enter Referral ID</DialogTitle>
          <DialogDescription>
            You were referred by a friend. Enter their referral ID below to join
            their network. If you don&apos;t have a referral ID, you can skip
            this step.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="referralId">Referral ID</Label>
            <Input
              id="referralId"
              value={referralInput}
              onChange={(e) => setReferralInput(e.target.value)}
              placeholder="Enter referral ID"
              className="border-teal-200 focus:border-teal-500"
            />
            {referralError && (
              <p className="text-sm text-red-500">{referralError}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleAddReferral}
              className="flex-1 bg-teal-600 hover:bg-teal-700"
            >
              Submit
            </Button>
            <Button
              variant="outline"
              onClick={handleSkip}
              className="flex-1 border-teal-200 text-teal-700 hover:bg-teal-50"
            >
              Skip
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
