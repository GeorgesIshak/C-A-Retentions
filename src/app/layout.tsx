import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "C&A Retentions",
  description: "Packages & automation services",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-800 antialiased">
        {children}
      </body>
    </html>
  );
}
