// app/admin-login/page.tsx
import AdminLoginForm from "./AdminLoginForm";

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: { error?: string; info?: string; next?: string };
}) {
  const error = searchParams?.error ?? "";
  const info = searchParams?.info ?? "";
  const nextUrl = searchParams?.next ?? "/admin/packages";

  return (
    <main className="min-h-dvh flex items-center justify-center p-6 bg-[#F6FAFD]">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl border border-[#E6EEF5]">
        <h1 className="text-center text-[#1C2E4A] text-2xl font-semibold mb-6">
          Admin Sign In
        </h1>

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

        <AdminLoginForm nextUrl={nextUrl} />
      </div>
    </main>
  );
}
