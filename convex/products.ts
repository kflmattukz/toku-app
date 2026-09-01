import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const list = query({
  args: { storeId: v.id("stores") },
  handler: async (ctx, { storeId }) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_storeId", (q) => q.eq("storeId", storeId))
      .order("asc")
      .collect();

    return Promise.all(
      products.map(async (p) => {
        let imageUrl: string | null = null;
        if (p.imageId) {
          if (p.imageId.startsWith("data:") || p.imageId.startsWith("http")) {
            imageUrl = p.imageId;
          } else {
            try {
              imageUrl = await ctx.storage.getUrl(p.imageId);
            } catch {
              imageUrl = p.imageId;
            }
          }
        }
        return {
          ...p,
          imageUrl: imageUrl ?? p.imageId ?? null,
        };
      })
    );
  },
});

export const create = mutation({
  args: {
    storeId: v.id("stores"),
    name: v.string(),
    category: v.string(),
    price: v.number(),
    costPrice: v.optional(v.number()),
    stock: v.number(),
    barcode: v.optional(v.string()),
    imageId: v.optional(v.string()),
    discountType: v.optional(v.union(v.literal("percentage"), v.literal("nominal"))),
    discountValue: v.optional(v.number()),
    minStockAlert: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("products", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("products"),
    name: v.optional(v.string()),
    category: v.optional(v.string()),
    price: v.optional(v.number()),
    costPrice: v.optional(v.number()),
    stock: v.optional(v.number()),
    barcode: v.optional(v.string()),
    imageId: v.optional(v.string()),
    discountType: v.optional(v.union(v.literal("percentage"), v.literal("nominal"))),
    discountValue: v.optional(v.number()),
    minStockAlert: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...patch }) => {

    if (patch.imageId !== undefined) {
      const existing = await ctx.db.get(id);
      if (
        existing?.imageId &&
        existing.imageId !== patch.imageId &&
        !existing.imageId.startsWith("data:") &&
        !existing.imageId.startsWith("http")
      ) {
        try {
          await ctx.storage.delete(existing.imageId);
        } catch {
          // ignore if already deleted or invalid
        }
      }
    }
    await ctx.db.patch(id, patch);
  },
});

export const remove = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, { id }) => {
    const product = await ctx.db.get(id);
    if (
      product?.imageId &&
      !product.imageId.startsWith("data:") &&
      !product.imageId.startsWith("http")
    ) {
      try {
        await ctx.storage.delete(product.imageId);
      } catch {
        // ignore if already deleted or invalid
      }
    }
    await ctx.db.delete(id);
  },
});

export const adjustStock = mutation({
  args: { id: v.id("products"), delta: v.number() },
  handler: async (ctx, { id, delta }) => {
    const product = await ctx.db.get(id);
    if (!product) throw new Error("Product not found");
    await ctx.db.patch(id, { stock: Math.max(0, product.stock + delta) });
  },
});
