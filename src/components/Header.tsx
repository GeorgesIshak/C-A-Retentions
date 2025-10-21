// components/SiteHeader.tsx
import { getCurrentUserFromToken } from "@/lib/actions/auth";
import ClientHeader from "./MainSiteHeader";

export default async function SiteHeader() {
  const user = await getCurrentUserFromToken();
  const isLoggedIn = Boolean(user);

  return <ClientHeader isLoggedIn={isLoggedIn} />;
}
