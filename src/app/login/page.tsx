import LoginForm from "./LoginForm";

export default function LoginPage({
  searchParams,
}: { searchParams: { error?: string; success?: string; next?: string } }) {
  const { error = "", success = "", next = "" } = searchParams ?? {};
  return (
    <main className="min-h-dvh flex items-center justify-center p-6 bg-[#F6FAFD]">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl border border-[#E6EEF5]">
        <h1 className="text-2xl font-semibold mb-6 text-center text-[#1C2E4A]">Sign In</h1>

        {success && (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <LoginForm nextUrl={next} />
      </div>
    </main>
  );
}
