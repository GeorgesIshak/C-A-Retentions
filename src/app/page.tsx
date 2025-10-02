import PackageGrid from "@/components/packages/PackageGrid";
import type { PackagePlan } from "@/types/packagePlan";
import { MOCK_PACKAGES } from "@/mocks/packages";

const USE_API = false;
const API_URL =
  process.env.NEXT_PUBLIC_PACKAGES_API ?? "http://localhost:3000/api/packages";

async function fetchPackages(): Promise<PackagePlan[]> {
  if (USE_API) {
    const res = await fetch(API_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load packages");
    const data = (await res.json()) as PackagePlan[];
    return data;
  }

  // fallback
  return MOCK_PACKAGES;
}

export default async function Page() {
  let packages: PackagePlan[] = [];
  try {
    packages = await fetchPackages();
  } catch (e) {
    console.error("Error fetching packages:", e);
  }

  // 👇 your section + grid
  return (
    <main className="mx-auto max-w-7xl ">
      <section className="pt-10 md:pt-14 text-white">
        <h2 className="mb-6 text-2xl md:text-3xl font-bold">
          The title goes here.
        </h2>

        <p className="mb-4 text-white/70 leading-relaxed">
          Melit sed risus. Maecenas eget condimentum velit, sit amet feugiat
          lectus. Class aptent taciti sociosqu ad litora torquent per conubia
          nostra, per inceptos himenaeos. Praesent auctor purus luctus enim
          egestas, ac scelerisque ante pulvinar. Donec ut rhoncus ex.
          Suspendisse ac rhoncus nisl, eu tempor urna. Curabitur vel bibendum
          lorem. Praesent auctor purus luctus enim egestas, ac scelerisque ante
          pulvinar. Donec ut rhoncus ex. Suspendisse ac rhoncus nisl, eu tempor
          urna. Curabitur vel bibendum lorem. Morbi convallis convallis diam sit
          amet lacinia. Aliquam in elementum tellus.
        </p>

        <p className="mt-4 text-white/70 leading-relaxed">
          Morem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu
          turpis molestie, dictum est a, mattis tellus. Sed dignissim, metus nec
          fringilla accumsan, risus sem sollicitudin lacus, ut interdum tellus
          elit sed risus. Maecenas eget condimentum velit, sit amet feugiat
          lectus. Lante pulvinar. Donec ut rhoncus ex. Suspendisse ac rhoncus
          nisl, eu tempor urna. Curabitur vel bibendum lorem. Morbi convallis
          convallis diam sit amet lacinia. Aliquam in elementum tellus.
        </p>
      </section>

      <PackageGrid packages={packages} />

      <div className="h-10 md:h-12" />
    </main>
  );
}
