export type MetaOAuthMode = "facebook" | "instagram";
export type MetaBusinessLoginPreference = "facebook" | "instagram";

export function getMetaBusinessLoginPreference(
  mode: MetaOAuthMode,
  requestedLogin: string | null,
): MetaBusinessLoginPreference {
  return requestedLogin === "instagram" || requestedLogin === "facebook" ? requestedLogin : mode;
}
