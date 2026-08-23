import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth: session, request }) {
      const isLoggedIn = !!session?.user;
      const isOnAdmin = request.nextUrl.pathname.startsWith("/admin");
      const isOnLogin = request.nextUrl.pathname === "/login";

      if (isOnAdmin) {
        return isLoggedIn;
      }

      if (isOnLogin && isLoggedIn) {
        return Response.redirect(new URL("/admin", request.nextUrl));
      }

      return true;
    },
  },
  providers: [], // Added in auth/index.ts for Node.js runtime
};
