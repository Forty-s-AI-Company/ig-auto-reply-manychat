import { createHash, timingSafeEqual } from "crypto";

function digest(value: string) {
  return createHash("sha256").update(value).digest();
}

export function secureCompare(actual: string, expected: string) {
  return timingSafeEqual(digest(actual), digest(expected));
}

export function hasValidSharedSecret(
  request: Request,
  headerName: string,
  expectedSecret: string | undefined,
) {
  const actualSecret = request.headers.get(headerName);
  return Boolean(expectedSecret && actualSecret && secureCompare(actualSecret, expectedSecret));
}
