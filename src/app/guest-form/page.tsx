/* eslint-disable @typescript-eslint/no-explicit-any */
// app/guest-form/page.tsx
import GuestFormClient from './GuestForm';

export const dynamic = 'force-dynamic'; // avoid prerender errors


export default function Page({ searchParams }: any) {
  const raw = searchParams?.uid;
  const uid = Array.isArray(raw) ? raw[0] ?? '' : raw ?? '';
  return <GuestFormClient uid={uid} />;
}
