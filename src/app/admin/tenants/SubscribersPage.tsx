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
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [subject, setSubject] = useState('Announcement from C&A Retention');
  const [body, setBody] = useState('Hello,\n\nWe have an update to share...\n\nBest regards,\nC&A Retention');
  const [showList, setShowList] = useState(false);

  // Filter + derive status
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

  // Selection helpers
  const filteredIds = useMemo(() => derived.map((r) => r.id), [derived]);
  const selectedCount = useMemo(
    () => filteredIds.reduce((acc, id) => acc + (selected[id] ? 1 : 0), 0),
    [filteredIds, selected]
  );
  const allFilteredSelected = useMemo(
    () => filteredIds.length > 0 && filteredIds.every((id) => selected[id]),
    [filteredIds, selected]
  );
  const someFilteredSelected = useMemo(
    () => filteredIds.some((id) => selected[id]),
    [filteredIds, selected]
  );
  const selectedEmails = useMemo(
    () => derived.filter((r) => selected[r.id]).map((r) => r.email),
    [derived, selected]
  );

  function toggleRow(id: string) {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function toggleSelectAllFiltered() {
    setSelected((prev) => {
      const next = { ...prev };
      if (allFilteredSelected) {
        for (const id of filteredIds) next[id] = false;
      } else {
        for (const id of filteredIds) next[id] = true;
      }
      return next;
    });
  }

  function clearSelection() {
    setSelected((prev) => {
      const next = { ...prev };
      for (const id of filteredIds) next[id] = false;
      return next;
    });
  }

  function handleSendAnnouncement() {
    if (selectedEmails.length === 0) return;

    const bcc = selectedEmails.join(',');
    const mailto =
      `mailto:?` +
      `bcc=${encodeURIComponent(bcc)}` +
      `&subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;

    if (mailto.length > 1900) {
      const list = selectedEmails.join(', ');
      navigator.clipboard
        .writeText(list)
        .then(() => {
          alert(
            `There are too many recipients for a single mailto link.\n\n` +
              `All selected emails were copied to your clipboard.\n` +
              `Open your email client and paste them into the BCC field.\n\n` +
              `Subject:\n${subject}\n\n` +
              `Body:\n${body}`
          );
        })
        .catch(() => {
          alert(`Too many recipients for mailto and copy failed. Please try again.`);
        });
      return;
    }

    window.location.href = mailto;
  }

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

      {/* Announcement (stacked, comfy spacing) */}
      <section className="mt-5 rounded-2xl border border-[#E6EEF5] bg-white p-5">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-[#0F1F33]">Send Announcement</h2>
          <p className="mt-1 text-sm text-[#6B7C8F]">
            Select recipients from the table below, then compose your subject and message.
          </p>
        </div>

        {/* Selection block (stacked) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-[#0F1F33]">
              Selected:&nbsp;<span className="font-semibold">{selectedCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSelectAllFiltered}
                className="rounded-full border border-[#D6E3EE] px-3 py-2 text-sm hover:bg-[#F1F6FA]"
              >
                {allFilteredSelected ? 'Unselect all (filtered)' : 'Select all (filtered)'}
              </button>
              {someFilteredSelected && (
                <button
                  onClick={clearSelection}
                  className="rounded-full border border-[#D6E3EE] px-3 py-2 text-sm hover:bg-[#F1F6FA]"
                >
                  Clear selection
                </button>
              )}
            </div>
          </div>

          {/* Optional: collapsible preview of selected emails */}
          {someFilteredSelected && (
            <div className="rounded-xl border border-[#E6EEF5] bg-[#F8FBFE] p-3">
              <button
                type="button"
                onClick={() => setShowList((v) => !v)}
                className="w-full text-left text-sm text-[#0F1F33] underline underline-offset-2 hover:opacity-80"
              >
                {showList ? 'Hide selected recipients' : 'Show selected recipients'}
              </button>
              {showList && (
                <div className="mt-2 max-h-32 overflow-auto text-sm text-[#2F4B6A]">
                  {selectedEmails.join(', ')}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Subject (full width) */}
        <div className="mt-5">
          <label className="mb-1 block text-sm font-medium text-[#0F1F33]">Subject</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Email subject"
            className="w-full rounded-xl border border-[#D6E3EE] bg-white px-3 py-2 text-sm text-[#0F1F33] outline-none focus:border-[#3D6984]"
          />
        </div>

        {/* Body (full width, taller) */}
        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium text-[#0F1F33]">Message</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your announcement…"
            className="w-full min-h-[140px] rounded-xl border border-[#D6E3EE] bg-white px-3 py-2 text-sm text-[#0F1F33] outline-none focus:border-[#3D6984]"
          />
          <p className="mt-1 text-xs text-[#7B8896]">
            Tip: long recipient lists may open your email client without BCC (we’ll copy BCC to your clipboard if needed).
          </p>
        </div>

        {/* Primary action (full width, stacked) */}
        <div className="mt-5">
          <button
            onClick={handleSendAnnouncement}
            disabled={selectedCount === 0}
            className="w-full rounded-full bg-gradient-to-b from-[#3D6984] to-[#1C2E4A] px-4 py-3 text-white text-[15px] font-medium shadow hover:opacity-95 disabled:opacity-50"
            title="Open your email client with BCC of selected emails"
          >
            Send Announcement
          </button>
        </div>
      </section>

      {/* Table */}
      <div className="mt-5 overflow-x-auto rounded-2xl border border-[#E6EEF5] bg-white">
        <table className="min-w-full border-collapse" role="table" aria-label="Subscribers">
          <thead className="bg-[#F1F6FA] sticky top-0 z-10">
            <tr>
              <Th className="w-[48px]">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    aria-label="Select all filtered"
                    checked={allFilteredSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = !allFilteredSelected && someFilteredSelected;
                    }}
                    onChange={toggleSelectAllFiltered}
                  />
                </label>
              </Th>
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
                <td colSpan={6} className="px-5 py-6 text-sm text-[#7B8896]" aria-live="polite">
                  {query ? 'No results match your search.' : 'Table is empty.'}
                </td>
              </tr>
            ) : (
              derived.map((r, i) => (
                <tr
                  key={r.id}
                  className={`hover:bg-[#F8FBFE] ${i !== derived.length - 1 ? 'border-b border-[#E6EEF5]' : ''}`}
                >
                  <Td className="w-[48px]">
                    <input
                      type="checkbox"
                      aria-label={`Select ${r.email}`}
                      checked={!!selected[r.id]}
                      onChange={() => toggleRow(r.id)}
                    />
                  </Td>

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
                        r.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
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

/* ---------- helpers ---------- */
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
    return d.toLocaleDateString('en-GB');
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
