// components/Faq.tsx
"use client";

import { useRef, useState } from "react";
import { ChevronRight } from "lucide-react";

type Item = { q: string; a: React.ReactNode };

export default function Faq({ items }: { items: Item[] }) {
  return (
    <section className="mx-auto mt-14 max-w-7xl px-4 md:mt-16 lg:px-6">
      <h2 className="text-2xl font-bold text-[#1C2E4A] md:text-3xl">FAQs</h2>
      <p className="mt-1 text-[#546274]">Quick answers to common questions.</p>

      <ul className="mt-6 space-y-3">
        {items.map((it, i) => (
          <li key={i}>
            <AccordionItem {...it} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function AccordionItem({ q, a }: { q: string; a: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const height = open ? ref.current?.scrollHeight ?? 0 : 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E6EEF5] bg-white shadow-sm transition hover:shadow-md">
      <button
        onClick={() => setOpen((s) => !s)}
        className="flex w-full items-center justify-between px-5 py-4 text-left text-[15px] font-medium text-[#0F1F33]"
      >
        <span>{q}</span>
        <ChevronRight
          className={`h-5 w-5 text-[#3D6984] transition-transform duration-300 ${
            open ? "rotate-90" : ""
          }`}
          aria-hidden
        />
      </button>

      <div
        style={{ height }}
        className="px-5 transition-[height] duration-300 ease-in-out"
        aria-hidden={!open}
      >
        <div ref={ref} className="pb-5 text-[#546274]">
          {a}
        </div>
      </div>
    </div>
  );
}
