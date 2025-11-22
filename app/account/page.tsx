"use client";

import { useUser } from "@/app/context/UserContext";
import { useSubscriptionStatus } from "@/app/hooks/useSubscriptionStatus";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AccountPage() {
  const { user } = useUser();
  const sub = useSubscriptionStatus();
  const [loadingPortal, setLoadingPortal] = useState(false);

  async function openPortal() {
    if (!sub || sub.status !== "active" || !sub.customerId) return;

    setLoadingPortal(true);

    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: sub.customerId }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Unable to open billing portal.");
        setLoadingPortal(false);
      }
    } catch (err) {
      console.error("Portal error:", err);
      alert("An error occurred.");
      setLoadingPortal(false);
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Please log in to view your account.</h2>
          <Link href="/login">
            <Button>Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!sub) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="p-6">
          <p>Loading subscription status…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">My Account</h1>

        {/* User Email */}
        <Card>
          <CardHeader>
            <CardTitle>Email</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{user.email}</p>
          </CardContent>
        </Card>

        {/* Subscription Status */}
        <Card>
          <CardHeader>
            <CardTitle>Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sub.status === "none" && (
              <div>
                <p className="text-muted-foreground mb-4">Free User</p>
                <Link href="/pricing">
                  <Button>Upgrade to Pro</Button>
                </Link>
              </div>
            )}

            {sub.type === "subscription" && (
              <>
                <div>
                  <p className="text-purple-600 font-semibold text-lg mb-2">⭐ Pro Monthly</p>
                  {sub.renews && (
                    <p className="text-muted-foreground">
                      Renews on: {new Date(sub.renews * 1000).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <Button
                  onClick={openPortal}
                  disabled={loadingPortal}
                  className="w-full"
                >
                  {loadingPortal ? "Loading…" : "Manage Billing"}
                </Button>
              </>
            )}

            {sub.type === "lifetime" && (
              <div>
                <p className="text-orange-600 font-semibold text-lg">🔥 Lifetime Access</p>
                <p className="text-muted-foreground mt-2">
                  You have lifetime access to all Pro features.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Logout */}
        <div>
          <Link href="/logout">
            <Button variant="outline" className="w-full">
              Logout
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

