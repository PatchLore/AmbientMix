export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: [DATE]</p>

        <p>
          We value your privacy. This policy explains how AmbientMix collects, uses,
          and protects your data.
        </p>

        <h2 className="text-xl font-semibold mt-6">1. Information We Collect</h2>

        <h3 className="font-semibold mt-4">Account Data</h3>
        <p>Email address, Supabase user ID.</p>

        <h3 className="font-semibold mt-4">Payment Data</h3>
        <p>
          Stripe processes all payments. AmbientMix never stores card details. Stripe
          is PCI-DSS compliant.
        </p>

        <h3 className="font-semibold mt-4">Mixes & Preferences</h3>
        <p>We store mix settings you save (linked to your user ID).</p>

        <h3 className="font-semibold mt-4">Cookies</h3>
        <p>Used for authentication and remembering your Stripe customer ID.</p>

        <h2 className="text-xl font-semibold mt-6">2. How We Use Your Information</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Authentication</li>
          <li>Subscription verification</li>
          <li>Platform improvements</li>
          <li>Preventing abuse</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6">3. Third-Party Services</h2>
        <p><strong>Supabase:</strong> Authentication + database</p>
        <p><strong>Stripe:</strong> Payments + Billing Portal</p>

        <h2 className="text-xl font-semibold mt-6">4. Data Storage & Security</h2>
        <p>
          All data is stored securely in Supabase with Row Level Security enabled.
          We cannot guarantee absolute security but take reasonable measures.
        </p>

        <h2 className="text-xl font-semibold mt-6">5. Your GDPR Rights</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Access your data</li>
          <li>Request deletion</li>
          <li>Export your data</li>
          <li>Cancel subscription</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6">6. Contact</h2>
        <p>Email: <strong>allendunn815@yahoo.com</strong></p>
      </div>
    </div>
  );
}

