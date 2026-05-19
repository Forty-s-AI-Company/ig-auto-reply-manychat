import { AdminShell } from "@/components/AdminShell";
import { MockTesterClient } from "@/components/MockTesterClient";
import { requireUser } from "@/lib/auth";

export default async function MockTesterPage() {
  await requireUser();
  return (
    <AdminShell>
      <MockTesterClient />
    </AdminShell>
  );
}
