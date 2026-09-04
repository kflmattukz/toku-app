import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ── Better Auth tables ──────────────────────────────────
  auth_users: defineTable({
    id: v.string(), // Better Auth generated ID
    name: v.string(),
    email: v.string(),
    emailVerified: v.boolean(),
    image: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_auth_id", ["id"])
    .index("by_email", ["email"]),

  auth_sessions: defineTable({
    id: v.string(),
    userId: v.string(),
    token: v.string(),
    expiresAt: v.number(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_auth_id", ["id"])
    .index("by_token", ["token"])
    .index("by_userId", ["userId"]),

  auth_accounts: defineTable({
    id: v.string(),
    userId: v.string(),
    accountId: v.string(),
    providerId: v.string(),
    accessToken: v.optional(v.string()),
    refreshToken: v.optional(v.string()),
    accessTokenExpiresAt: v.optional(v.number()),
    refreshTokenExpiresAt: v.optional(v.number()),
    scope: v.optional(v.string()),
    idToken: v.optional(v.string()),
    password: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_auth_id", ["id"])
    .index("by_userId", ["userId"])
    .index("by_providerId_accountId", ["providerId", "accountId"]),

  auth_verifications: defineTable({
    id: v.string(),
    identifier: v.string(),
    value: v.string(),
    expiresAt: v.number(),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_auth_id", ["id"])
    .index("by_identifier", ["identifier"]),

  // ── App tables ──────────────────────────────────────────
  stores: defineTable({
    userId: v.string(), // Better Auth user ID
    userEmail: v.optional(v.string()), // Permanent Google user email
    name: v.string(),
    category: v.union(
      v.literal("bengkel"),
      v.literal("laundry"),
      v.literal("barbershop_salon"),
      v.literal("kuliner_resto"),
      v.literal("fashion_butik"),
      v.literal("toko_bangunan"),
      v.literal("petshop"),
      v.literal("atk_fotokopi"),
      v.literal("sembako"),
      v.literal("warung_kopi"),
      v.literal("apotek"),
      v.literal("konter_pulsa"),
      v.literal("kelontong"),
      v.literal("lainnya"),
    ),
    address: v.optional(v.string()),
    createdAt: v.number(),
    tier: v.optional(v.union(v.literal("free"), v.literal("pro"))),
    proExpiresAt: v.optional(v.number()),
    lowStockThreshold: v.optional(v.number()),
    branchName: v.optional(v.string()),
    isMainBranch: v.optional(v.boolean()),
  })
    .index("by_userId", ["userId"])
    .index("by_userEmail", ["userEmail"]),

  cashiers: defineTable({
    storeId: v.id("stores"),
    name: v.string(),
    pin: v.string(), // 4-digit PIN
    role: v.union(v.literal("owner"), v.literal("manager"), v.literal("cashier")),
    active: v.boolean(),
    createdAt: v.number(),
  }).index("by_storeId", ["storeId"]),

  shifts: defineTable({
    storeId: v.id("stores"),
    cashierId: v.optional(v.id("cashiers")),
    cashierName: v.string(),
    startedAt: v.number(),
    endedAt: v.optional(v.number()),
    startingCash: v.number(),
    expectedCash: v.optional(v.number()),
    actualCash: v.optional(v.number()),
    difference: v.optional(v.number()),
    notes: v.optional(v.string()),
    status: v.union(v.literal("open"), v.literal("closed")),
  })
    .index("by_storeId", ["storeId"])
    .index("by_storeId_status", ["storeId", "status"]),

  subscriptions: defineTable({
    storeId: v.id("stores"),
    userId: v.string(),
    orderId: v.string(),
    plan: v.union(v.literal("monthly"), v.literal("yearly")),
    amount: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("settled"),
      v.literal("expired"),
      v.literal("failed"),
    ),
    snapToken: v.optional(v.string()),
    paymentType: v.optional(v.string()),
    createdAt: v.number(),
    settledAt: v.optional(v.number()),
  })
    .index("by_storeId", ["storeId"])
    .index("by_orderId", ["orderId"])
    .index("by_userId", ["userId"]),

  products: defineTable({
    storeId: v.id("stores"),
    name: v.string(),
    category: v.string(), // custom per store, e.g. "Minuman", "Makanan"
    price: v.number(), // IDR integer
    costPrice: v.optional(v.number()), // Modal / HPP per unit (IDR)
    stock: v.number(),
    barcode: v.optional(v.string()),
    imageId: v.optional(v.string()),
    discountType: v.optional(v.union(v.literal("percentage"), v.literal("nominal"))),
    discountValue: v.optional(v.number()),
    minStockAlert: v.optional(v.number()),
  }).index("by_storeId", ["storeId"]),

  expenses: defineTable({
    storeId: v.id("stores"),
    category: v.union(
      v.literal("operasional"),
      v.literal("gaji"),
      v.literal("sewa"),
      v.literal("utilitas"),
      v.literal("bahan_baku"),
      v.literal("lainnya"),
    ),
    amount: v.number(), // IDR integer
    date: v.number(), // timestamp ms
    notes: v.optional(v.string()),
    source: v.optional(v.union(v.literal("cash_drawer"), v.literal("bank"), v.literal("owner"))),
    shiftId: v.optional(v.string()),
    createdBy: v.string(),
    createdAt: v.number(),
  })
    .index("by_storeId", ["storeId"])
    .index("by_storeId_date", ["storeId", "date"])
    .index("by_storeId_category", ["storeId", "category"]),

  transactions: defineTable({
    storeId: v.id("stores"),
    items: v.array(
      v.object({
        productId: v.string(),
        name: v.string(),
        price: v.number(),
        costPrice: v.optional(v.number()), // Snapshot HPP at time of sale
        qty: v.number(),
        discountType: v.optional(v.union(v.literal("percentage"), v.literal("nominal"))),
        discountValue: v.optional(v.number()),
        subtotal: v.optional(v.number()),
      }),
    ),
    subtotal: v.optional(v.number()),
    discountType: v.optional(v.union(v.literal("percentage"), v.literal("nominal"))),
    discountValue: v.optional(v.number()),
    discountAmount: v.optional(v.number()),
    total: v.number(),
    paymentMethod: v.union(v.literal("cash"), v.literal("qris")),
    cashPaid: v.optional(v.number()),
    change: v.optional(v.number()),
    cashierId: v.optional(v.string()),
    cashierName: v.optional(v.string()),
    shiftId: v.optional(v.string()),
    status: v.optional(v.union(v.literal("completed"), v.literal("cancelled"))),
    cancelledAt: v.optional(v.number()),
    cancelReason: v.optional(v.string()),
    cancelledBy: v.optional(v.string()),
    createdAt: v.number(),
    syncedFromOffline: v.optional(v.boolean()),
  })
    .index("by_storeId", ["storeId"])
    .index("by_storeId_createdAt", ["storeId", "createdAt"]),
});

