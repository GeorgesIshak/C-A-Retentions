// app/dashboard/layout.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = (await cookies()).get("accessToken")?.value;
  if (!token) redirect("/login");

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl py-8">
        {children}
      </main>
    </>
  );
}
