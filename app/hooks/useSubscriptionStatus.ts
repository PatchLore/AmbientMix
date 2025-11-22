"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";

export function useSubscriptionStatus() {
  const [status, setStatus] = useState<null | {
    status: string;
    type?: string;
    renews?: number;
    plan?: string;
    customerId?: string;
  }>(null);

  useEffect(() => {
    async function checkSubscription() {
      // 1. Try to get customerId from Supabase profile
      const { data: userData } = await supabase.auth.getUser();
      let customerId: string | undefined;

      if (userData?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("customer_id")
          .eq("id", userData.user.id)
          .single();

        customerId = profile?.customer_id;
      }

      // 2. Fallback to cookie if not in Supabase
      if (!customerId) {
        customerId = document.cookie
          .split("; ")
          .find((c) => c.startsWith("stripe_customer_id="))
          ?.split("=")[1];
      }

      if (!customerId) {
        setStatus({ status: "none" });
        return;
      }

      fetch("/api/subscription/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId }),
      })
        .then((res) => res.json())
        .then((data) => setStatus({ ...data, customerId }))
        .catch(() => setStatus({ status: "none" }));
    }

    checkSubscription();
  }, []);

  return status;
}

