"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation"; // ✅ useParams import
import { useSession, signIn } from "next-auth/react";
import { useAddReferralMutation } from "@/redux/api/api";
import Swal from "sweetalert2";

export default function JoinReferralPage() {
  const params = useParams();
  const id = params?.id; // ✅ referral ID from URL
  console.log("Referral ID from URL:", id);

  const { data: session } = useSession();
  const [addReferral] = useAddReferralMutation();

  useEffect(() => {
    const handleReferral = async () => {
      if (!session?.user || !id) return;

      try {
        const newUser = {
          name: session.user.name,
          email: session.user.email,
        };

        const res = await addReferral({ referrerId: id, newUser }).unwrap();

        Swal.fire({
          icon: "success",
          title: "Referral Success 🎉",
          text: `You joined with referral! ${res.referrer.name} earned ₹50.`,
        });
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err?.data?.message || "Referral failed",
        });
      }
    };

    handleReferral();
  }, [session, id, addReferral]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {!session ? (
        <button
          onClick={() => signIn("google")}
          className="px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700"
        >
          Sign in with Google
        </button>
      ) : (
        <p className="text-lg">
          Welcome {session.user.name}! Checking referral...
        </p>
      )}
    </div>
  );
}
