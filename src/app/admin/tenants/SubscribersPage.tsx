// app/dashboard/subscribers/SubscribersPage.tsx
'use client';

import React, { useMemo, useState } from 'react';
import type { SubscriberRow } from './page';

export default function SubscribersPage({
  initialRows,
}: {
  userId: string | null;
  initialRows: SubscriberRow[];
}) {
  const [rows] = useState<SubscriberRow[]>(initialRows);
  const [query, setQuery] = useState('');

  const derived = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows
      .map((r) => ({ ...r, ...deriveStatus(r.expiryDate) }))
      .filter((r) => {
        if (!q) return true;
        const emailHit = r.email.toLowerCase().includes(q);
        const pkgHit = (r.packageName ?? '').toLowerCase().includes(q);
        return emailHit || pkgHit;
      });
  }, [rows, query]);

  return (
    <main className="mx-auto max-w-7xl">
      {/* Title + Search */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:items-center">
        <h1 className="text-[28px] font-bold text-[#0F1F33]">Subscribers</h1>

        <div className="flex justify-start md:justify-end">
          <div className="flex w-full max-w-sm items-center gap-2">
            <label htmlFor="sub-search" className="sr-only">
              Search by email or package
            </label>
            <input
              id="sub-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by email or package…"
              className="w-full rounded-full border border-[#D6E3EE] bg-white px-4 py-2 text-sm text-[#0F1F33] outline-none placeholder:text-[#7B8896] focus:border-[#3D6984]"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="rounded-full border border-[#D6E3EE] px-3 py-2 text-xs text-[#0F1F33] hover:bg-[#F1F6FA]"
                title="Clear"
                aria-label="Clear search"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table wrapper with rounded corners + scroll on mobile */}
      <div className="mt-4 overflow-x-auto rounded-2xl border border-[#E6EEF5] bg-white">
        <table className="min-w-full border-collapse" role="table" aria-label="Subscribers">
          <thead className="bg-[#F1F6FA] sticky top-0 z-10">
            <tr>
              <Th>Date Added</Th>
              <Th>Email</Th>
              <Th>Package Name</Th>
              <Th>Expiry Date</Th>
              <Th className="text-right pr-5">Status</Th>
            </tr>
          </thead>

          <tbody>
            {derived.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-6 text-sm text-[#7B8896]"
                  aria-live="polite"
                >
                  {query ? 'No results match your search.' : 'Table is empty.'}
                </td>
              </tr>
            ) : (
              derived.map((r, i) => (
                <tr
                  key={r.id}
                  className={`hover:bg-[#F8FBFE] ${
                    i !== derived.length - 1 ? 'border-b border-[#E6EEF5]' : ''
                  }`}
                >
                  <Td className="text-[#6B7C8F]">{fmtDate(r.createdAt)}</Td>

                  <Td>
                    <span className="truncate text-[#2F4B6A]" title={r.email}>
                      {r.email}
                    </span>
                  </Td>

                  <Td>
                    <span className="truncate" title={r.packageName ?? ''}>
                      {r.packageName ?? '—'}
                    </span>
                  </Td>

                  <Td className="text-[#2F4B6A]">
                    {r.expiryDate ? fmtDate(r.expiryDate) : '—'}
                  </Td>

                  <Td className="text-right pr-5">
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                        r.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {r.isActive ? 'Active' : 'Expired'}
                    </span>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

/* ---------- small table helpers for consistent styling ---------- */
function Th({
  children,
  className = '',
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <th
      scope="col"
      className={`px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#22384F] ${className}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className = '',
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <td className={`px-5 py-4 text-[14px] text-[#0F1F33] align-middle ${className}`}>
      {children}
    </td>
  );
}

/* ------------ utils ------------ */
function fmtDate(iso?: string | null) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB'); // DD/MM/YYYY
  } catch {
    return '—';
  }
}

function deriveStatus(expiryISO?: string | null): { isActive: boolean; daysLeft: number | null } {
  if (!expiryISO) return { isActive: false, daysLeft: null };
  const expiry = new Date(expiryISO);
  if (Number.isNaN(expiry.getTime())) return { isActive: false, daysLeft: null };
  const ms = expiry.getTime() - Date.now();
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
  return { isActive: days > 0, daysLeft: days };
}
