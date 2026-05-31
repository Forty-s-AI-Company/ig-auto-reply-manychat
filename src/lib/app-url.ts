export function getAppUrl(request: Request) {
  const requestOrigin = new URL(request.url).origin;
  const hostname = new URL(requestOrigin).hostname;
  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") {
    return requestOrigin;
  }
  if (!process.env.APP_URL && process.env.NODE_ENV === "production") {
    throw new Error("APP_URL must be configured outside localhost.");
  }
  return (process.env.APP_URL || requestOrigin).replace(/\/$/, "");
}
