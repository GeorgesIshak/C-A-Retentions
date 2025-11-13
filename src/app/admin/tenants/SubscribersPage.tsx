/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard/subscribers/SubscribersPage.tsx
'use client';

import React, { useMemo, useState } from 'react';
import type { SubscriberRow } from './page';
import { sendAdminEmails } from '@/lib/actions/admin-packages';

export default function SubscribersPage({
  initialRows,
}: {
  userId: string | null;
  initialRows: SubscriberRow[];
}) {
  const [rows] = useState<SubscriberRow[]>(initialRows);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  return (
    <main className="mx-auto max-w-7xl">
      {/* Top bar: title + search + send button */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
        <h1 className="text-[28px] font-bold text-[#0F1F33]">Subscribers</h1>

        <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center md:justify-end">
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

          <div className="flex items-center justify-between md:justify-end gap-2">
            <span className="text-xs md:text-sm text-[#6B7C8F]">
              Selected:&nbsp;
              <span className="font-semibold text-[#0F1F33]">{selectedCount}</span>
            </span>
            <button
              type="button"
              disabled={selectedCount === 0}
              onClick={() => setIsDialogOpen(true)}
              className="rounded-full bg-gradient-to-b from-[#3D6984] to-[#1C2E4A] px-4 py-2 text-sm text-white disabled:opacity-40"
            >
              Send Announcement
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-[#E6EEF5] bg-white">
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
                      if (el)
                        el.indeterminate = !allFilteredSelected && someFilteredSelected;
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
                <td
                  colSpan={6}
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

      {/* Simple announcement dialog */}
      {isDialogOpen && (
        <AnnouncementDialog
          onClose={() => setIsDialogOpen(false)}
          emails={selectedEmails}
        />
      )}
    </main>
  );
}

/* ---------- Announcement Dialog (simple & focused) ---------- */

function AnnouncementDialog({
  emails,
  onClose,
}: {
  emails: string[];
  onClose: () => void;
}) {
  const [subject, setSubject] = useState('Announcement from C&A Retention');
  const [body, setBody] = useState(
    'Hello,\n\nWe have an update to share...\n\nBest regards,\nC&A Retention'
  );
  const [pending, setPending] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  function textToHtml(text: string) {
    return text.replace(/\n/g, '<br />');
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!emails.length) return;

    setPending(true);
    setStatusMsg(null);

    try {
      const html = textToHtml(body);

      const res = await sendAdminEmails({
        name: 'subscribers-announcement',
        emails,
        emailTemplate: {
          subject,
          html,
        },
      });

      if (!res || (res as any).ok === false) {
        const error = (res as any)?.error || 'Failed to send emails.';
        setStatusMsg(`❌ ${error}`);
      } else {
        setStatusMsg(`✅ Email sent to ${emails.length} subscriber(s).`);
        // close after short delay
        setTimeout(onClose, 900);
      }
    } catch (err: any) {
      setStatusMsg(`❌ ${err?.message || 'Failed to send emails.'}`);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-xl font-semibold text-[#0F1F33]">
            Send Announcement
          </h4>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-[#E6EEF5] px-2 py-1 text-xs"
          >
            ✕
          </button>
        </div>

        <p className="mb-3 text-xs text-[#6B7C8F]">
          This email will be sent to{' '}
          <span className="font-semibold text-[#0F1F33]">{emails.length}</span>{' '}
          subscriber{emails.length === 1 ? '' : 's'}.
        </p>

        <form onSubmit={handleSend} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-[#0F1F33]">
              Subject
            </label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-xl border border-[#D6E3EE] bg-white px-3 py-2 text-sm text-[#0F1F33] outline-none focus:border-[#3D6984]"
              placeholder="Email subject"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#0F1F33]">
              Message
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full min-h-[120px] rounded-xl border border-[#D6E3EE] bg-white px-3 py-2 text-sm text-[#0F1F33] outline-none focus:border-[#3D6984]"
              placeholder="Write your announcement…"
            />
          </div>

          {statusMsg && (
            <div className="rounded-md border border-[#CFE4FF] bg-[#F1F8FF] p-2 text-xs text-[#0B3A75]">
              {statusMsg}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[#D6E3EE] px-4 py-2 text-xs text-[#0F1F33]"
              disabled={pending}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending || !subject.trim() || !body.trim()}
              className="rounded-full bg-gradient-to-b from-[#3D6984] to-[#1C2E4A] px-4 py-2 text-xs text-white disabled:opacity-40"
            >
              {pending ? 'Sending…' : 'Send Email'}
            </button>
          </div>
        </form>
      </div>
    </div>
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

function deriveStatus(
  expiryISO?: string | null
): { isActive: boolean; daysLeft: number | null } {
  if (!expiryISO) return { isActive: false, daysLeft: null };
  const expiry = new Date(expiryISO);
  if (Number.isNaN(expiry.getTime())) return { isActive: false, daysLeft: null };
  const ms = expiry.getTime() - Date.now();
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
  return { isActive: days > 0, daysLeft: days };
}
