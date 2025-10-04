"use client";

import Image from "next/image";
import { MouseEvent } from "react";


type Props = {
  title: string;
  price: number;
  description: string;
  sms: number;
  emails: number;
  open: boolean;
  onClick: () => void;           
  onProceed?: () => void;        
  className?: string;
  bgImage: string;
  ctaLabel?: string;             
};

export default function PackageCard({
  title,
  price,
  description,
  sms,
  emails,
  open,
  onClick,
  onProceed,
  className = "",
  bgImage,
  ctaLabel = "Proceed",
}: Props) {

  function onCtaClick(e: MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    // Pure UI: let parent handle the action
    onProceed?.();
  }

  return (
    <div
      onClick={onClick}
      className={`group relative cursor-pointer transition-all duration-300 ease-out ${className} ${
        open
          ? "rounded-tl-[32px] rounded-tr-[32px] rounded-bl-[32px] rounded-br-[0px] overflow-visible shadow-[0_20px_60px_-20px_rgba(2,26,64,0.35)]"
          : "rounded-[32px] overflow-hidden"
      }`}
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      aria-pressed={open}
      role="button"
    >
      {/* overlay only when CLOSED */}
      {!open && (
        <div className="absolute inset-0 z-0 bg-[#151515]/25 transition-colors duration-200 group-hover:bg-[#151515]/20" />
      )}

      {!open ? (
        <div className="relative z-10 flex h-[420px] md:h-[520px] items-center justify-center p-6">
          <span
            className="text-white font-extrabold tracking-wide text-[28px]/[28px] select-none drop-shadow"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            {title}
          </span>
        </div>
      ) : (
        <div className="relative p-6 sm:p-8 md:p-10 min-h-[520px] flex flex-col">
          {/* header */}
          <div className="flex items-start justify-between gap-6">
            <h3 className="text-[28px] sm:text-[34px] font-extrabold text-[#172A45]">
              {title}
            </h3>
            <div className="flex items-baseline gap-2 text-right">
              <div className="text-[22px] sm:text-[26px] font-extrabold text-[#172A45]">
                {price.toFixed(2)}$
              </div>
              <span className="text-[12px] sm:text-[13px] text-[#415974] leading-none">
                /month
              </span>
            </div>
          </div>

          {/* description */}
          <p className="mt-5 mb-8 text-[#415974]">{description}</p>

          {/* features list */}
          <ul className="mt-auto grid gap-4 text-[#172A45]">
            {[`${sms}+ Number of SMS`, `${emails}+ Number of Emails`].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <Image
                  src="/images/checkcircle.svg"
                  alt=""
                  width={20}
                  height={20}
                  className="shrink-0"
                />
                <span className="text-[15px]">{item}</span>
              </li>
            ))}
          </ul>

          {/* slide-down tail */}
          {open && (
            <div
              className="
                pointer-events-none
                absolute right-0 bottom-0
                w-[86px] h-[50px]
                translate-y-[calc(100%_-_50px)]
              "
            >
              <div className="h-full w-full rounded-tl-[32px] bg-white/85 shadow-[0_12px_30px_-10px_rgba(2,26,64,0.25)] flex items-end justify-end">
                <button
                  type="button"
                  aria-label={ctaLabel}
                  onClick={onCtaClick}
                  className="pointer-events-auto m-1 h-10 w-[76px] rounded-[32px] bg-gradient-to-b from-[#3D6984] to-[#1C2E4A] flex items-center justify-center hover:scale-105 transition"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-6 w-6 fill-none stroke-white stroke-[2]"
                    aria-hidden="true"
                  >
                    <path
                      d="M5 12h12m0 0-4-4m4 4-4 4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
