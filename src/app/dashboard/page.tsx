// app/contacts/page.tsx  (or app/dashboard/contacts/page.tsx)
import ContactsPage from '@/app/dashboard/contacts/ContactsPage'; // keep your path
import { getCurrentUserFromToken } from '@/lib/actions/auth';
import { listClients } from '@/lib/actions/guest';

export const dynamic = 'force-dynamic';

export default async function ContactsRoute() {
  const user = await getCurrentUserFromToken();   // for the QR uid
  const initialRows = await listClients();        // server → backend

  return <ContactsPage userId={user?.id ?? null} initialRows={initialRows} />;
}
