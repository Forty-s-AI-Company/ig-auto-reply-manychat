import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";

export async function requireAdminApiUser() {
  const auth = await requireApiUser();
  if (auth.response) return auth;
  if (auth.user.role !== "admin") {
    return {
      user: null,
      response: NextResponse.json({ error: "Admin only." }, { status: 403 }),
    };
  }
  return auth;
}
