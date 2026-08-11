import { query, mutation } from './_generated/server'
import { v } from 'convex/values'

export const list = query({
  args: { storeId: v.id('stores') },
  handler: async (ctx, { storeId }) => {
    return ctx.db
      .query('products')
      .withIndex('by_storeId', (q) => q.eq('storeId', storeId))
      .order('asc')
      .collect()
  },
})

export const create = mutation({
  args: {
    storeId: v.id('stores'),
    name: v.string(),
    category: v.string(),
    price: v.number(),
    stock: v.number(),
    barcode: v.optional(v.string()),
    imageId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert('products', args)
  },
})

export const update = mutation({
  args: {
    id: v.id('products'),
    name: v.optional(v.string()),
    category: v.optional(v.string()),
    price: v.optional(v.number()),
    stock: v.optional(v.number()),
    barcode: v.optional(v.string()),
    imageId: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...patch }) => {
    await ctx.db.patch(id, patch)
  },
})

export const remove = mutation({
  args: { id: v.id('products') },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id)
  },
})

export const adjustStock = mutation({
  args: { id: v.id('products'), delta: v.number() },
  handler: async (ctx, { id, delta }) => {
    const product = await ctx.db.get(id)
    if (!product) throw new Error('Product not found')
    await ctx.db.patch(id, { stock: Math.max(0, product.stock + delta) })
  },
})
