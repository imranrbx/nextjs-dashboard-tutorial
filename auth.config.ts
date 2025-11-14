import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isAuthPage =
        nextUrl.pathname === '/login' || nextUrl.pathname === '/sign-up';

      // Restrict /dashboard to ADMIN only; redirect non-admins to login
      if (isOnDashboard) {
        // .role may come from auth.user or session, check both (adjust for your session shape)
        const role = auth?.user?.role ?? auth?.role;
        if (isLoggedIn && role === 'ADMIN') {
          return true;
        }
        // Not admin? Redirect to login (or display error)
        if (isLoggedIn) {
          // If logged in as non-admin, redirect to /login with error query or just false for access denied
          return Response.redirect(new URL('/login?error=forbidden', nextUrl));
        }
        return false;
      }

      if (isAuthPage && isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      return true;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;