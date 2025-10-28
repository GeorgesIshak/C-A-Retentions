// components/SiteHeader.tsx
import { getCurrentUserFromToken } from "@/lib/actions/auth";
import ClientHeader from "./TenantHeader";

export default async function SiteHeader() {
  const user = await getCurrentUserFromToken().catch(() => null);
  return <ClientHeader isLoggedIn={Boolean(user)} />;
}
