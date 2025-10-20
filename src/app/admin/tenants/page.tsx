// app/dashboard/subscribers/page.tsx
import { cookies } from 'next/headers';
import SubscribersPage from './SubscribersPage';

// ⬇️ adjust this import to wherever you placed the functions/types I gave you
import { listSubscribersPage } from '@/lib/actions/admin-packages';

export default async function Page() {
  // If you already have a getUser() use that; here we just read the cookie presence
  const userId = (await cookies()).get('accessToken')?.value ? 'me' : null;

  const { items } = await listSubscribersPage({ page: 1, limit: 50 });

  // Map to the client-row shape (pick the latest payment if any)
  const initialRows = items.map((s): SubscriberRow => {
    const latest = Array.isArray(s.payments) && s.payments.length
      ? [...s.payments].sort((a, b) =>
          new Date(b.expiryDate ?? 0).getTime() - new Date(a.expiryDate ?? 0).getTime()
        )[0]
      : undefined;

    return {
      id: s.id,
      email: s.email,
      createdAt: s.createdAt,
      packageName: latest?.packageName ?? null,
      expiryDate: latest?.expiryDate ?? null,
    };
  });

  return <SubscribersPage userId={userId} initialRows={initialRows} />;
}

/** Row type passed to the client component */
export type SubscriberRow = {
  id: string;
  email: string;
  createdAt: string;          // ISO
  packageName: string | null;
  expiryDate: string | null;  // ISO
};
