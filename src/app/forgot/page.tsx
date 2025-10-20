import ForgotForm from "./ForgotForm";

export default function ForgotPage({
  searchParams,
}: {
  searchParams: { error?: string; info?: string; email?: string };
}) {
  const { error = "", info = "", email = "" } = searchParams ?? {};

  return (
    <main className="min-h-dvh flex items-center justify-center p-6 bg-[#F6FAFD]">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl border border-[#E6EEF5]">
        <h1 className="text-2xl font-semibold mb-6 text-center text-[#1C2E4A]">
          Forgot Password
        </h1>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {info && (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {info}
          </div>
        )}

        <ForgotForm prefillEmail={email} />
      </div>
    </main>
  );
}
