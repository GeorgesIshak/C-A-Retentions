/* eslint-disable @typescript-eslint/no-explicit-any */
// app/guest-form/page.tsx
import GuestFormClient from "./GuestForm"; // make sure filename matches

export const dynamic = "force-dynamic";

export default function Page({ searchParams }: any) {
  const raw = searchParams?.uid;
  const uid = Array.isArray(raw) ? raw[0] ?? "" : raw ?? "";
  return <GuestFormClient uid={uid} />;
}
