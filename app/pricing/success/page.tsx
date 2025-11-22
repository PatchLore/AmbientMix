"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/app/lib/supabaseClient";

function SuccessContent() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");

  useEffect(() => {
    if (!sessionId) return;

    fetch("/api/stripe/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .then((res) => res.json())
      .then(async (data) => {
        if (!data.customerId) return;

        // 1. Save to cookie (fallback)
        document.cookie = `stripe_customer_id=${data.customerId}; path=/; max-age=${60 * 60 * 24 * 365}`;

        // 2. Save to Supabase (persistent)
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          await supabase
            .from("profiles")
            .update({ customer_id: data.customerId })
            .eq("id", userData.user.id);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch session:", err);
      });
  }, [sessionId]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <div className="text-6xl mb-4">✅</div>
      <h1 className="text-3xl font-bold mb-2">Payment Successful</h1>
      <p className="text-gray-600 mb-6">
        Your AmbientMix access is now active.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
      >
        Return Home
      </Link>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
