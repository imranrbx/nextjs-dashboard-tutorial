import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isAuthPage = nextUrl.pathname === '/login' || nextUrl.pathname === '/sign-up';

      // Restrict /dashboard to ADMIN only; redirect non-admins to login
      const role = auth?.user.role ? auth?.user.role : null;

      console.log("On Dashboard roles", isOnDashboard, role)
      if (isOnDashboard && role === "ADMIN") {
        // .role may come from auth.user or session, check both (adjust for your session shape)
        if (isLoggedIn) {
          return true;
        }
        // Not admin? Redirect to login (or display error)
        if (isAuthPage && isLoggedIn && role !== "ADMIN") {
          // If logged in as non-admin, redirect to /login with error query or just false for access denied
          return Response.redirect(new URL('/login?error=forbidden', nextUrl));
        }
        return true;
      }
      if (isAuthPage && isLoggedIn) {

        return Response.redirect(new URL('/account/orders', nextUrl));
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.role = typeof token.role === 'string' ? token.role : undefined
        session.user.id = typeof token.role === 'string' ? token.id : undefined
      }
      return session
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;