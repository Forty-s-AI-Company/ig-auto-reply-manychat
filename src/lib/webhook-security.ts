import { createHash, createHmac, timingSafeEqual } from "crypto";

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

export function verifyHmacSignature(input: {
  body: string;
  secret?: string;
  signatureHeader: string | null;
}) {
  if (!input.secret) return true;
  if (!input.signatureHeader?.startsWith("sha256=")) return false;

  const expected = createHmac("sha256", input.secret).update(input.body).digest("hex");
  const actual = input.signatureHeader.slice("sha256=".length);
  const expectedBuffer = Buffer.from(expected, "hex");
  const actualBuffer = Buffer.from(actual, "hex");

  return expectedBuffer.length === actualBuffer.length && timingSafeEqual(expectedBuffer, actualBuffer);
}
