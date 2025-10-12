// src/app/admin/page.tsx
import { redirect } from 'next/navigation';

export default function AdminIndex() {
  // Always send admins directly to the main Packages page
  redirect('/admin/packages');
  // (No JSX return, this is a server redirect)
}
