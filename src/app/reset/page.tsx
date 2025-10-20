import ResetForm from "./ResetForm";

export default function ResetPage({
  searchParams,
}: {
  searchParams: { error?: string; info?: string; email?: string };
}) {
  const { error = "", info = "", email = "" } = searchParams ?? {};

  return (
    <main className="min-h-dvh flex items-center justify-center p-6 bg-[#F6FAFD]">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-xl border border-[#E6EEF5]">
          <div className="mb-6 text-center">
            <h1 className="text-[#1C2E4A] text-2xl font-semibold">Reset your password</h1>
            <p className="mt-1 text-sm text-[#6B7C8F]">
              Enter the 6-digit code sent to your email and choose a new password.
            </p>
          </div>

          {info && (
            <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {info}
            </div>
          )}
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <ResetForm email={email} />
        </div>
      </div>
    </main>
  );
}
