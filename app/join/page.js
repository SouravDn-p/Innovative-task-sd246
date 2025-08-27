"use client";

import React, { useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useAddReferralMutation } from "@/redux/api/api";
import Swal from "sweetalert2";
import { useSearchParams } from "next/navigation";

export default function JoinPage({ context }) {
  const { params } = context;
  const referrerId = params.id;
  const { data: session } = useSession();
  // const searchParams = useSearchParams();
  const { id } = params;
  console.log("Referral ID from URL:", id);

  const [addReferral] = useAddReferralMutation();

  useEffect(() => {
    const handleReferral = async () => {
      if (!session?.user || !referrerId) return;

      try {
        const newUser = {
          name: session.user.name,
          email: session.user.email,
        };

        const res = await addReferral({ referrerId, newUser }).unwrap();

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
  }, [session, referrerId, addReferral]);

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
