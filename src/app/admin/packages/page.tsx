/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  listPackages,
  createPackage,
  deletePackage,
  updatePackage,
} from '@/lib/actions/admin-packages';
import type { Package } from '@/types/packagePlan';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import Link from 'next/link';

/* ---------- server actions ---------- */
async function createPkgAction(formData: FormData) {
  'use server';
  await createPackage(formData);
  revalidatePath('/admin/packages');
  redirect('/admin/packages');
}

async function deletePkgAction(formData: FormData) {
  'use server';
  const id = formData.get('id')?.toString();
  if (!id) return;
  await deletePackage(id);
  revalidatePath('/admin/packages');
  redirect('/admin/packages');
}

async function updatePkgAction(formData: FormData) {
  'use server';
  const id = formData.get('id')?.toString();
  if (!id) return;
  await updatePackage(id, formData);
  revalidatePath('/admin/packages');
  redirect('/admin/packages');
}

/* ---------- page ---------- */
export default async function AdminPackages({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  const showNew = sp?.new === '1';
  const rawDelete = sp?.delete;
  const deleteId =
    typeof rawDelete === 'string' ? rawDelete : Array.isArray(rawDelete) ? rawDelete[0] : undefined;

  const rawEdit = sp?.edit;
  const editId =
    typeof rawEdit === 'string' ? rawEdit : Array.isArray(rawEdit) ? rawEdit[0] : undefined;

  const qActive =
    sp?.active === undefined
      ? undefined
      : (Array.isArray(sp.active) ? sp.active[0] : sp.active) === 'true';
  const qPage = sp?.page ? Number(Array.isArray(sp.page) ? sp.page[0] : sp.page) : 1;
  const qLimit = sp?.limit ? Number(Array.isArray(sp.limit) ? sp.limit[0] : sp.limit) : 50;

  const rows: Package[] = await listPackages({
    active: qActive,
    page: Number.isFinite(qPage) && qPage > 0 ? qPage : 1,
    limit: Number.isFinite(qLimit) && qLimit > 0 ? qLimit : 50,
  });

  const pkgToDelete = deleteId ? rows.find((r) => r.id === deleteId) : undefined;
  const pkgToEdit = editId ? rows.find((r) => r.id === editId) : undefined;

  return (
    <main className="py-6 sm:py-8 max-w-7xl mx-auto space-y-4 sm:space-y-6 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#22384F]">Packages</h1>
          <p className="text-[#6B7C8F] text-sm">Create and manage your packages.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/packages?active=true"
            className="rounded-full border border-[#CAD7E5] px-3 py-1.5 text-sm text-[#2F4B6A] hover:bg-[#F1F6FA]"
          >
            Active
          </Link>
          <Link
            href="/admin/packages"
            className="rounded-full border border-[#CAD7E5] px-3 py-1.5 text-sm text-[#2F4B6A] hover:bg-[#F1F6FA]"
          >
            All
          </Link>
          <Link
            href="/admin/packages?new=1"
            className="inline-flex rounded-full bg-gradient-to-b from-[#3D6984] to-[#1C2E4A] px-4 py-2 text-sm text-white shadow hover:opacity-95"
          >
            + Create Package
          </Link>
        </div>
      </div>

      {/* Header bar */}
      <div className="hidden sm:block rounded-2xl bg-[#F1F6FA] px-5 py-3 text-[#22384F] font-semibold text-[12px] uppercase tracking-wide">
        <div className="grid grid-cols-7">
          <div>Date Added</div>
          <div>Package Name</div>
          <div>Price</div>
          <div>Duration</div>
          <div>Quota (SMS / Email)</div>
          <div>Stripe Price ID</div>
          <div className="text-right">Action</div>
        </div>
      </div>

      {/* Content */}
      {rows.length === 0 ? (
        <div className="mt-2 sm:mt-3 rounded-2xl border border-[#E6EEF5] bg-white">
          <div className="grid grid-cols-1 sm:grid-cols-6 items-center gap-3">
            <div className="sm:col-span-5 px-5 py-6 text-sm text-[#7B8896]">No packages found.</div>
            <div className="px-5 pb-6 sm:py-6 flex justify-end">
              <Link
                href="/admin/packages?new=1"
                className="rounded-full bg-gradient-to-b from-[#3D6984] to-[#1C2E4A] px-4 py-2 text-sm text-white shadow hover:opacity-95"
              >
                Create Package
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <ul className="mt-2 sm:mt-3 space-y-3">
          {rows.map((p) => (
            <li
              key={p.id}
              className="rounded-[14px] border border-[#E6EEF5] bg-white shadow-[0_1px_0_0_rgba(16,24,40,0.02)]"
            >
              {/* Desktop row */}
              <div className="hidden sm:grid grid-cols-7 items-center px-5 py-4 text-[14px] text-[#0F1F33]">
                <div className="text-[#6B7C8F]">
                  {p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-GB') : '—'}
                </div>

                <div className="min-w-0">
                  <div className="truncate font-medium">{p.name}</div>
                  <div className="text-xs text-[#6B7C8F] truncate">{p.description || '—'}</div>
                </div>

                <div className="text-[#2F4B6A] font-medium">
                  ${Number(p.price ?? 0).toFixed(2)}
                </div>

                <div className="text-[#2F4B6A]">{p.durationDays} days</div>

                <div className="text-[#2F4B6A]">
                  {p.smsCount} SMS / {p.emailCount} emails
                </div>

                <div className="text-xs text-[#6B7C8F] truncate max-w-[220px]" title={p.priceId ?? ''}>
                  {p.priceId ?? '—'}
                </div>

                <div className="flex justify-end gap-2">
                  <Link
                    href={`/admin/packages?edit=${encodeURIComponent(p.id)}`}
                    className="rounded-full border border-[#CAD7E5] px-3 py-1.5 text-sm text-[#2F4B6A] hover:bg-[#F1F6FA]"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/admin/packages?delete=${encodeURIComponent(p.id)}`}
                    className="rounded-full bg-gradient-to-b from-[#3D6984] to-[#1C2E4A] px-4 py-2 text-sm text-white hover:opacity-95"
                  >
                    Delete
                  </Link>
                </div>
              </div>

              {/* Mobile card */}
              <div className="sm:hidden px-4 py-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-[#6B7C8F]">
                    {p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-GB') : '—'}
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/packages?edit=${encodeURIComponent(p.id)}`}
                      className="rounded-full border border-[#CAD7E5] px-3 py-1.5 text-xs text-[#2F4B6A] hover:bg-[#F1F6FA]"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/admin/packages?delete=${encodeURIComponent(p.id)}`}
                      className="rounded-full bg-gradient-to-b from-[#3D6984] to-[#1C2E4A] px-3 py-1.5 text-xs text-white hover:opacity-95"
                    >
                      Delete
                    </Link>
                  </div>
                </div>

                <div>
                  <div className="font-medium text-[#0F1F33]">{p.name}</div>
                  <div className="text-xs text-[#6B7C8F]">{p.description || '—'}</div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm text-[#2F4B6A]">
                  <div>
                    <div className="text-xs text-[#6B7C8F]">Price</div>
                    <div className="font-medium">${Number(p.price ?? 0).toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-[#6B7C8F]">Duration</div>
                    <div className="font-medium">{p.durationDays} days</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-[#6B7C8F]">Quota</div>
                    <div className="font-medium">
                      {p.smsCount} SMS / {p.emailCount}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-[#6B7C8F]">Stripe Price ID</div>
                    <div className="font-mono text-xs break-all">{p.priceId ?? '—'}</div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Create modal via ?new=1 */}
      {showNew && (
        <div aria-modal="true" role="dialog" className="fixed inset-0 z-50 flex items-center justify-center">
          <Link href="/admin/packages" className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 w-full max-w-xl mx-4 sm:mx-0 rounded-2xl bg-white p-6 shadow-xl border border-[#E6EEF5]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#22384F]">Create Package</h2>
              <Link href="/admin/packages" aria-label="Close" className="rounded-full p-1 text-[#6B7C8F] hover:bg-[#F1F6FA]">
                ✕
              </Link>
            </div>

            <form action={createPkgAction} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input name="name" placeholder="Package name" className="border border-[#CAD7E5] p-2 rounded sm:col-span-2" required />
              <input name="durationDays" type="number" placeholder="Duration (days)" className="border border-[#CAD7E5] p-2 rounded" required />
              <input name="price" type="number" step="0.01" placeholder="Price ($)" className="border border-[#CAD7E5] p-2 rounded" required />
              <input name="smsCount" type="number" placeholder="SMS count" className="border border-[#CAD7E5] p-2 rounded" required />
              <input name="emailCount" type="number" placeholder="Email count" className="border border-[#CAD7E5] p-2 rounded" required />
              <input name="description" placeholder="Short description" className="border border-[#CAD7E5] p-2 rounded sm:col-span-2" />
              {/* REQUIRED Stripe price id */}
              <input
                name="priceId"
                placeholder="Stripe priceId"
                className="border border-[#CAD7E5] p-2 rounded sm:col-span-2 font-mono text-xs"
                required
              />
              {/* Checkbox fix: post false when unchecked */}
              <input type="hidden" name="isActive" value="false" />
              <label className="flex items-center gap-2 text-sm text-[#22384F] sm:col-span-2">
                <input type="checkbox" name="isActive" value="true" defaultChecked />
                Active package
              </label>

              <div className="sm:col-span-2 flex items-center justify-end gap-2 pt-2">
                <Link href="/admin/packages" className="rounded-full border border-[#CAD7E5] px-4 py-2 text-sm text-[#2F4B6A] hover:bg-[#F1F6FA]">
                  Cancel
                </Link>
                <button className="rounded-full bg-gradient-to-b from-[#3D6984] to-[#1C2E4A] px-4 py-2 text-sm text-white hover:opacity-95">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit modal via ?edit=<id> */}
      {editId && pkgToEdit && (
        <div aria-modal="true" role="dialog" className="fixed inset-0 z-50 flex items-center justify-center">
          <Link href="/admin/packages" className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 w-full max-w-xl mx-4 sm:mx-0 rounded-2xl bg-white p-6 shadow-xl border border-[#E6EEF5]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#22384F]">Edit Package</h2>
              <Link href="/admin/packages" aria-label="Close" className="rounded-full p-1 text-[#6B7C8F] hover:bg-[#F1F6FA]">
                ✕
              </Link>
            </div>

            <form action={updatePkgAction} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="hidden" name="id" value={editId} />

              <input name="name" defaultValue={pkgToEdit.name} placeholder="Package name" className="border border-[#CAD7E5] p-2 rounded sm:col-span-2" required />

              <input name="durationDays" type="number" defaultValue={pkgToEdit.durationDays} placeholder="Duration (days)" className="border border-[#CAD7E5] p-2 rounded" required />

              <input name="price" type="number" step="0.01" defaultValue={Number(pkgToEdit.price ?? 0)} placeholder="Price ($)" className="border border-[#CAD7E5] p-2 rounded" required />

              <input name="smsCount" type="number" defaultValue={pkgToEdit.smsCount} placeholder="SMS count" className="border border-[#CAD7E5] p-2 rounded" required />

              <input name="emailCount" type="number" defaultValue={pkgToEdit.emailCount} placeholder="Email count" className="border border-[#CAD7E5] p-2 rounded" required />

              <input name="description" defaultValue={pkgToEdit.description || ''} placeholder="Short description" className="border border-[#CAD7E5] p-2 rounded sm:col-span-2" />

              {/* REQUIRED priceId on edit */}
              <input
                name="priceId"
                defaultValue={pkgToEdit.priceId ?? ''}
                placeholder="Stripe priceId"
                className="border border-[#CAD7E5] p-2 rounded sm:col-span-2 font-mono text-xs"
                required
              />

              {/* Checkbox fix */}
              <input type="hidden" name="isActive" value="false" />
              <label className="flex items-center gap-2 text-sm text-[#22384F] sm:col-span-2">
                <input type="checkbox" name="isActive" value="true" defaultChecked={Boolean((pkgToEdit as any)?.isActive)} />
                Active package
              </label>

              <div className="sm:col-span-2 flex items-center justify-end gap-2 pt-2">
                <Link href="/admin/packages" className="rounded-full border border-[#CAD7E5] px-4 py-2 text-sm text-[#2F4B6A] hover:bg-[#F1F6FA]">
                  Cancel
                </Link>
                <button className="rounded-full bg-gradient-to-b from-[#3D6984] to-[#1C2E4A] px-4 py-2 text-sm text-white hover:opacity-95">
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete modal */}
      {deleteId && (
        <div aria-modal="true" role="dialog" className="fixed inset-0 z-50 flex items-center justify-center">
          <Link href="/admin/packages" className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 w-full max-w-md mx-4 sm:mx-0 rounded-2xl bg-white p-6 shadow-xl border border-[#E6EEF5]">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-[#22384F]">Delete Package</h2>
              <Link href="/admin/packages" aria-label="Close" className="rounded-full p-1 text-[#6B7C8F] hover:bg-[#F1F6FA]">
                ✕
              </Link>
            </div>

            <p className="text-sm text-[#0F1F33]">
              Are you sure you want to delete{' '}
              <span className="font-semibold">{pkgToDelete?.name || 'this package'}</span>?
              This action cannot be undone.
            </p>

            <form action={deletePkgAction} className="mt-5 flex items-center justify-end gap-2">
              <input type="hidden" name="id" value={deleteId} />
              <Link href="/admin/packages" className="rounded-full border border-[#CAD7E5] px-4 py-2 text-sm text-[#2F4B6A] hover:bg-[#F1F6FA]">
                Cancel
              </Link>
              <button className="rounded-full bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700">
                Delete
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
