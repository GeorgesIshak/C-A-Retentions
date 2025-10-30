// app/dashboard/subscribers/page.tsx
import { cookies } from "next/headers";
import SubscribersPage from "./SubscribersPage";
import { listSubscribersPage } from "@/lib/actions/admin-packages";

export type SubscriberRow = {
  id: string;
  email: string;
  createdAt: string;          // ISO
  packageName: string | null;
  expiryDate: string | null;  // ISO
};

export default async function Page() {
  const hasToken = Boolean((await cookies()).get("accessToken")?.value);
  const userId = hasToken ? "me" : null;

  const res = await listSubscribersPage({ page: 1, limit: 50 });

  // ❗ handle errors gracefully
  if (!res.ok || !Array.isArray(res.data)) {
    console.error("Failed to load subscribers:", res.error);
    return <SubscribersPage userId={userId} initialRows={[]} />;
  }

  const items = res.data;

  // ✅ safely map over items
  const initialRows: SubscriberRow[] = items.map((s) => {
    const latest =
      Array.isArray(s.payments) && s.payments.length
        ? [...s.payments].sort(
            (a, b) =>
              new Date(b.expiryDate ?? 0).getTime() -
              new Date(a.expiryDate ?? 0).getTime()
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
