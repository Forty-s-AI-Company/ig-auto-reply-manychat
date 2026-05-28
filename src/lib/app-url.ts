export function getAppUrl(request: Request) {
  const requestOrigin = new URL(request.url).origin;
  const hostname = new URL(requestOrigin).hostname;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return requestOrigin;
  }
  return (process.env.APP_URL || requestOrigin).replace(/\/$/, "");
}
