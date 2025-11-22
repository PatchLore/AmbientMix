export async function getSubscriptionStatus(customerId: string) {
  try {
    const res = await fetch("/api/subscription/status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ customerId }),
    });

    if (!res.ok) {
      console.error("Subscription status failed:", res.status);
      return { status: "none" };
    }

    return await res.json();
  } catch (err) {
    console.error("Subscription status request error:", err);
    return { status: "none" };
  }
}

