// src/app/admin/layout.tsx
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#F7FAFD] text-[#0F1F33] antialiased">
      <AdminSidebar />

      <div className="pl-64">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-[#E6EEF5]">
          <div className="mx-auto max-w-7xl px-6 py-4">
            <h1 className="text-[18px] font-semibold text-[#22384F]">Admin</h1>
            <p className="text-[12px] text-[#6B7C8F]">Super admin control panel</p>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-6 py-8">
          <div className="rounded-2xl border border-[#E6EEF5] bg-white p-6 shadow-[0_1px_0_0_rgba(16,24,40,0.02)]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
