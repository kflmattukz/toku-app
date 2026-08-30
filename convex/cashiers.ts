import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByStore = query({
  args: {
    storeId: v.id("stores"),
  },
  handler: async (ctx, { storeId }) => {
    return ctx.db
      .query("cashiers")
      .withIndex("by_storeId", (q) => q.eq("storeId", storeId))
      .collect();
  },
});

export const create = mutation({
  args: {
    storeId: v.id("stores"),
    name: v.string(),
    pin: v.string(),
    role: v.union(v.literal("owner"), v.literal("manager"), v.literal("cashier")),
  },
  handler: async (ctx, args) => {
    const store = await ctx.db.get(args.storeId);
    if (!store) throw new Error("Toko tidak ditemukan");

    // Check for duplicate PIN in the same store
    const existingCashiers = await ctx.db
      .query("cashiers")
      .withIndex("by_storeId", (q) => q.eq("storeId", args.storeId))
      .filter((q) => q.neq(q.field("active"), false))
      .collect();

    const duplicatePin = existingCashiers.find((c) => c.pin === args.pin);
    if (duplicatePin) {
      throw new Error(
        `PIN ${args.pin} sudah digunakan oleh staf "${duplicatePin.name}". Harap gunakan 4 digit PIN yang berbeda agar tidak tertukar.`,
      );
    }

    return ctx.db.insert("cashiers", {
      storeId: args.storeId,
      name: args.name,
      pin: args.pin,
      role: args.role,
      active: true,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("cashiers"),
    name: v.optional(v.string()),
    pin: v.optional(v.string()),
    role: v.optional(v.union(v.literal("owner"), v.literal("manager"), v.literal("cashier"))),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...patch }) => {
    const current = await ctx.db.get(id);
    if (!current) throw new Error("Kasir tidak ditemukan");

    // If downgrading from owner to another role, check minimum 1 owner
    if (patch.role && patch.role !== "owner" && current.role === "owner") {
      const existingOwners = await ctx.db
        .query("cashiers")
        .withIndex("by_storeId", (q) => q.eq("storeId", current.storeId))
        .filter((q) => q.and(q.eq(q.field("role"), "owner"), q.neq(q.field("active"), false)))
        .collect();

      if (existingOwners.length <= 1) {
        throw new Error(
          "Tidak dapat mengubah peran Pemilik Toko terakhir. Toko harus memiliki minimal satu akun Owner.",
        );
      }
    }

    // If changing PIN, verify uniqueness
    if (patch.pin && patch.pin !== current.pin) {
      const existingCashiers = await ctx.db
        .query("cashiers")
        .withIndex("by_storeId", (q) => q.eq("storeId", current.storeId))
        .filter((q) => q.neq(q.field("active"), false))
        .collect();

      const duplicatePin = existingCashiers.find((c) => c._id !== id && c.pin === patch.pin);
      if (duplicatePin) {
        throw new Error(
          `PIN ${patch.pin} sudah digunakan oleh staf "${duplicatePin.name}". Harap gunakan PIN berbeda.`,
        );
      }
    }

    await ctx.db.patch(id, patch);
  },
});

export const remove = mutation({
  args: {
    id: v.id("cashiers"),
  },
  handler: async (ctx, { id }) => {
    const target = await ctx.db.get(id);
    if (!target) return;

    if (target.role === "owner") {
      const existingOwners = await ctx.db
        .query("cashiers")
        .withIndex("by_storeId", (q) => q.eq("storeId", target.storeId))
        .filter((q) => q.and(q.eq(q.field("role"), "owner"), q.neq(q.field("active"), false)))
        .collect();

      if (existingOwners.length <= 1) {
        throw new Error(
          "Tidak dapat menghapus akun Pemilik Toko (Owner) terakhir. Toko harus memiliki minimal satu akun Owner.",
        );
      }
    }

    await ctx.db.delete(id);
  },
});

export const verifyPin = query({
  args: {
    storeId: v.id("stores"),
    pin: v.string(),
    cashierId: v.optional(v.id("cashiers")),
  },
  handler: async (ctx, { storeId, pin, cashierId }) => {
    if (cashierId) {
      const cashier = await ctx.db.get(cashierId);
      if (!cashier || cashier.storeId !== storeId || !cashier.active) return null;
      if (cashier.pin !== pin) return null;
      return {
        _id: cashier._id,
        name: cashier.name,
        role: cashier.role,
      };
    }

    const cashiers = await ctx.db
      .query("cashiers")
      .withIndex("by_storeId", (q) => q.eq("storeId", storeId))
      .filter((q) => q.eq(q.field("active"), true))
      .collect();

    const match = cashiers.find((c) => c.pin === pin);
    if (!match) return null;

    return {
      _id: match._id,
      name: match.name,
      role: match.role,
    };
  },
});
