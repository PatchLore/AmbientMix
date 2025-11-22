import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <div className="text-6xl mb-4">✅</div>
      <h1 className="text-3xl font-bold mb-2">Payment Successful</h1>
      <p className="text-gray-600 mb-6">
        Your AmbientMix access is now active. You can now close this page or return to the app.
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
