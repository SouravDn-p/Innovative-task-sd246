"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useGetKYCDataQuery } from "@/redux/api/api";

export default function TestKYCPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { data: kycData, isLoading, error, refetch } = useGetKYCDataQuery();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-3xl font-bold mb-6">KYC Flow Test</h1>

      {isLoading && <p>Loading KYC data...</p>}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>Error loading KYC data: {JSON.stringify(error)}</p>
        </div>
      )}

      {kycData && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">KYC Data</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(kycData, null, 2)}
          </pre>

          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-2">KYC Status</h3>
            <p>Status: {kycData.status}</p>
            <p>Completion: {kycData.completionPercentage}%</p>
            <p>Payment Status: {kycData.paymentStatus}</p>
          </div>

          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-2">Documents</h3>
            {Object.entries(kycData.documents).map(([docType, docData]) => (
              <div key={docType} className="mb-2">
                <p>
                  <strong>{docType}:</strong>{" "}
                  {docData.uploaded ? "Uploaded" : "Not uploaded"}
                </p>
                {docData.url && (
                  <p className="text-sm text-blue-600">
                    <a
                      href={docData.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Document
                    </a>
                  </p>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={refetch}
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Refresh Data
          </button>
        </div>
      )}
    </div>
  );
}
