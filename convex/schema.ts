import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  stores: defineTable({
    userId: v.string(), // Better Auth user ID
    userEmail: v.optional(v.string()), // Permanent Google user email
    name: v.string(),
    category: v.union(
      v.literal("sembako"),
      v.literal("warung_kopi"),
      v.literal("apotek"),
      v.literal("konter_pulsa"),
      v.literal("kelontong"),
      v.literal("lainnya"),
    ),
    address: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userEmail", ["userEmail"]),

  products: defineTable({
    storeId: v.id("stores"),
    name: v.string(),
    category: v.string(), // custom per store, e.g. "Minuman", "Makanan"
    price: v.number(), // IDR integer
    stock: v.number(),
    barcode: v.optional(v.string()),
    imageId: v.optional(v.string()),
  }).index("by_storeId", ["storeId"]),

  transactions: defineTable({
    storeId: v.id("stores"),
    items: v.array(
      v.object({
        productId: v.string(),
        name: v.string(),
        price: v.number(),
        qty: v.number(),
      }),
    ),
    total: v.number(),
    paymentMethod: v.union(v.literal("cash"), v.literal("qris")),
    cashPaid: v.optional(v.number()),
    change: v.optional(v.number()),
    createdAt: v.number(),
    syncedFromOffline: v.optional(v.boolean()),
  })
    .index("by_storeId", ["storeId"])
    .index("by_storeId_createdAt", ["storeId", "createdAt"]),
});
