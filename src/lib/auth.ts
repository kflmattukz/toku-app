import { betterAuth } from 'better-auth'
import { memoryAdapter } from 'better-auth/adapters/memory'
import { tanstackStartCookies } from 'better-auth/tanstack-start'

// ponytail: memory adapter — fine for dev/single-instance.
// Swap to a persistent adapter (Drizzle+SQLite or Convex custom) when multi-instance deployment matters.
const db: Parameters<typeof memoryAdapter>[0] = {
  user: [],
  session: [],
  account: [],
  verification: [],
}

export const auth = betterAuth({
  database: memoryAdapter(db),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  plugins: [tanstackStartCookies()],
})
