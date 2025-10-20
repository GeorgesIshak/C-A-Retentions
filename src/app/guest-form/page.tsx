// app/guest-form/page.tsx
import GuestFormClient from './GuestForm';

type SearchParams = { [key: string]: string | string[] | undefined };

export default function Page({ searchParams }: { searchParams: SearchParams }) {
  const raw = searchParams?.uid;
  const uid = Array.isArray(raw) ? raw[0] ?? '' : raw ?? '';

  return <GuestFormClient uid={uid} />;
}
