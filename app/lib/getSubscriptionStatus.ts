const SUBSCRIPTION_STATUS_TIMEOUT_MS = 8000;

export async function getSubscriptionStatus(customerId: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SUBSCRIPTION_STATUS_TIMEOUT_MS);

  try {
    const res = await fetch("/api/subscription/status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ customerId }),
      signal: controller.signal,
    });

    if (!res.ok) {
      // 401 (logged out) and 403 (not the owner) both mean "free tier" here.
      // Never leave the caller hanging on a failed subscription check.
      console.error("Subscription status failed:", res.status);
      return { status: "none" };
    }

    return await res.json();
  } catch (err) {
    console.error("Subscription status request error:", err);
    return { status: "none" };
  } finally {
    clearTimeout(timeout);
  }
}

