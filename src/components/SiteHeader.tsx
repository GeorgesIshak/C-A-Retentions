import Image from "next/image";
import Link from "next/link";
import { getCurrentUserFromToken } from "@/lib/actions/auth"; // <-- you already have this

export default async function SiteHeader() {
  // Check if user is logged in (server-side)
  const user = await getCurrentUserFromToken();
  const isLoggedIn = Boolean(user);

  // Dynamic link target
  const targetHref = isLoggedIn ? "/dashboard/profile" : "/login";

  return (
    <header className="mx-auto max-w-7xl border-b border-[#BDC4D4]">
      <div className="mx-auto max-w-7xl py-10 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard/">
          <Image
            src="/images/logo.svg"
            alt="C&A Retentions"
            width={265}
            height={60}
            priority
          />
        </Link>

        {/* Dynamic Login/Profile link */}
        <Link href={targetHref} aria-label={isLoggedIn ? "Profile" : "Login"}>
          <Image
            src="/images/user.svg"
            alt="User Icon"
            width={66}
            height={40}
            priority
          />
        </Link>
      </div>
    </header>
  );
}
