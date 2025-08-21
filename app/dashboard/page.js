"use client";

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";

export default function Dashboard() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (!session) {
    return <p>You are not signed in.</p>;
  }

  const { user } = session;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
        <p className="mb-2">
          <strong>Name:</strong> {user.name || "N/A"}
        </p>
        <p className="mb-2">
          <strong>Email:</strong> {user.email}
        </p>
        {user.image && (
          <Image
            width={100}
            height={100}
            src={user.image}
            alt="Profile"
            className="w-24 h-24 rounded-full mt-4"
          />
        )}
        <button
          onClick={() => signOut()}
          className="mt-6 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
