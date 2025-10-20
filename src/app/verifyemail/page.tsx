import VerifyEmailForm from "./VerifyEmailForm";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  const pick = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v ?? "";

  const email = pick(sp.email);
  const error = pick(sp.error);

  return (
    <main className="min-h-dvh grid place-items-center p-6 bg-[#F6FAFD]">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl border border-[#E6EEF5]">
        <h1 className="text-2xl font-semibold mb-6 text-center text-[#1C2E4A]">
          Verify your email
        </h1>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <VerifyEmailForm email={email} />
      </div>
    </main>
  );
}
