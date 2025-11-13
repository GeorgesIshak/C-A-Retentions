/* eslint-disable @typescript-eslint/no-explicit-any */
// app/guest-form/page.tsx
import GuestFormClient from "./GuestForm";

export const dynamic = "force-dynamic";

export default function Page({
  searchParams,
}: {
  searchParams?: { uid?: string | string[] | undefined } | Promise<{ uid?: string | string[] | undefined }>;
}) {
  const raw = (searchParams as any)?.uid;
  const uid = Array.isArray(raw) ? raw[0] ?? "" : raw ?? "";
  return <GuestFormClient uid={uid} />;
}
