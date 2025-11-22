export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold mb-4">Terms & Conditions</h1>
        <p className="text-muted-foreground">Last updated: [DATE]</p>

        <p>
          Welcome to AmbientMix (&quot;the Service&quot;). By accessing or using AmbientMix, you 
          agree to these Terms & Conditions. If you do not agree, do not use the Service.
        </p>

        <h2 className="text-xl font-semibold mt-6">1. Overview</h2>
        <p>
          AmbientMix is an online ambience-mixing application offering free access and
          optional paid upgrades, including Pro Monthly and Lifetime plans.
        </p>

        <h2 className="text-xl font-semibold mt-6">2. Accounts & Login</h2>
        <p>
          AmbientMix uses passwordless email login (Supabase). You agree to provide a
          valid email address, maintain account security, and refrain from sharing access.
          We may suspend accounts that violate these terms.
        </p>

        <h2 className="text-xl font-semibold mt-6">3. Payments & Subscriptions</h2>
        <p>
          Payments are handled securely via Stripe. Monthly subscriptions renew automatically.
          Lifetime access is a one-time, non-refundable purchase. You may cancel subscriptions
          anytime through the Stripe billing portal.
        </p>

        <h2 className="text-xl font-semibold mt-6">4. Refund Policy</h2>
        <p>
          Refund requests are reviewed individually. Email support at:{" "}
          <strong>allendunn815@yahoo.com</strong>.
        </p>

        <h2 className="text-xl font-semibold mt-6">5. Content & Usage</h2>
        <p>
          You may not misuse the Service, copy or redistribute the platform, reverse
          engineer features, or use AmbientMix for illegal purposes.
        </p>

        <h2 className="text-xl font-semibold mt-6">6. Availability & Changes</h2>
        <p>
          We may update or change the platform at any time, including adding or removing features.
        </p>

        <h2 className="text-xl font-semibold mt-6">7. Data & Privacy</h2>
        <p>
          Our Privacy Policy explains how your data is stored and used.
        </p>

        <h2 className="text-xl font-semibold mt-6">8. Limitation of Liability</h2>
        <p>
          AmbientMix is provided &quot;as is&quot;. We are not responsible for data loss or service
          interruptions.
        </p>

        <h2 className="text-xl font-semibold mt-6">9. Contact</h2>
        <p>
          Email: <strong>allendunn815@yahoo.com</strong>
        </p>
      </div>
    </div>
  );
}

