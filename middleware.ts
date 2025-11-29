export { auth as middleware } from "next-auth";

export const config = {
  matcher: ["/dashboard/:path*", "/tests/:path*", "/writing/:path*", "/admin/:path*"]
};
