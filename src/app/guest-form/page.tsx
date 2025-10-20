// app/guest-form/page.tsx
import GuestFormClient from './GuestForm';

export const dynamic = 'force-dynamic'; // avoid prerender errors

type SearchParams = Record<string, string | string[] | undefined>;

export default function Page(props: { searchParams?: SearchParams }) {
  const sp = props.searchParams ?? {};
  const raw = sp.uid;
  const uid =
    typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] ?? '' : '';

  return <GuestFormClient uid={uid} />;
}
