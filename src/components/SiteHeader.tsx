import Image from "next/image";
import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="mx-auto max-w-7xl border-b border-[#BDC4D4]">
      <div className="mx-auto max-w-7xl  py-10 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image
            src="/images/logo.svg"
            alt="C&A Retentions"
            width={265}
            height={60}
            priority
          />
        </Link>

        <Link href="/signup" aria-label="Sign up">
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
