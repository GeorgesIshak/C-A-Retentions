import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import { hasActivePlan } from "@/lib/actions/subscription";


export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get("accessToken")?.value;
  if (!token) redirect("/login?next=/dashboard");

  const active = await hasActivePlan();
  if (!active) redirect("/?needsPlan=1"); // block access until paid

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl py-8">{children}</main>
    </>
  );
}
