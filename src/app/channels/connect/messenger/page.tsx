import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";

export default async function MessengerConnectionPage() {
  await requireUser();
  redirect("/channels/connect/social");
}
