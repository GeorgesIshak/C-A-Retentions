import { listClients } from "@/lib/actions/guest";
import ContactsPage from "./ContactsPage";

export default async function Page() {
  const rows = await listClients(); // your server action from earlier
  // If you also have userId from cookies/session, pass it here
  const userId = null; // replace with real one

  return <ContactsPage userId={userId} initialRows={rows} />;
}
