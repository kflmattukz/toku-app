import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { convexAdapter } from "./convex-auth-adapter";

const CONVEX_URL = process.env.VITE_CONVEX_URL!;

export const auth = betterAuth({
  database: convexAdapter(CONVEX_URL),
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days (1 month)
    updateAge: 60 * 60 * 24, // 1 day - auto-refresh session if active
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 30, // 30 days
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  plugins: [tanstackStartCookies()],
});
