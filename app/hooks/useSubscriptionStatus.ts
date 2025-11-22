"use client";

import { useEffect, useState } from "react";

export function useSubscriptionStatus() {
  const [status, setStatus] = useState<null | {
    status: string;
    type?: string;
  }>(null);

  useEffect(() => {
    const customerId = document.cookie
      .split("; ")
      .find((c) => c.startsWith("stripe_customer_id="))
      ?.split("=")[1];

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
      .then((data) => setStatus(data))
      .catch(() => setStatus({ status: "none" }));
  }, []);

  return status;
}

