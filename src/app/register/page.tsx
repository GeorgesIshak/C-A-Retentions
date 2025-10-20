import RegisterForm from "./RegisterForm";

export default function RegisterPage({ searchParams }: { searchParams: { error?: string } }) {
  const error = searchParams?.error ?? "";
  return (
    <main className="min-h-dvh flex items-center justify-center p-6 bg-[#F6FAFD]">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-xl border border-[#E6EEF5]">
        <h1 className="text-2xl font-semibold mb-6 text-center text-[#1C2E4A]">Create Account</h1>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <RegisterForm />
      </div>
    </main>
  );
}
