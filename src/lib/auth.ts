import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import { tanstackStartCookies } from "better-auth/tanstack-start";

// ponytail: memory adapter — fine for dev/single-instance.
// Swap to a persistent adapter (Drizzle+SQLite or Convex custom) when multi-instance deployment matters.
const db: Parameters<typeof memoryAdapter>[0] = {
  user: [],
  session: [],
  account: [],
  verification: [],
};

export const auth = betterAuth({
  database: memoryAdapter(db),
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
