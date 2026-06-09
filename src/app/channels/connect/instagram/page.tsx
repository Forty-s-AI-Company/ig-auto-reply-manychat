import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";

export default async function InstagramConnectionPage() {
  await requireUser();
  redirect("/channels/connect/social");
}
