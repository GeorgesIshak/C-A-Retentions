// app/guest-form/page.tsx
import GuestFormClient from "./GuestForm";

export const dynamic = "force-dynamic"; // avoid prerender errors

type PageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function Page({ searchParams }: PageProps) {
  const raw = searchParams?.uid;
  const uid = Array.isArray(raw) ? raw[0] ?? "" : raw ?? "";
  return <GuestFormClient uid={uid} />;
}
