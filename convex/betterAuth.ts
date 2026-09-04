import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ── Generic CRUD for Better Auth adapter ──────────────────
// Each table uses a string `id` field (Better Auth's own generated IDs).
// The adapter calls these via ConvexHttpClient from the server.
//
// Note: `as any` on query builder calls because Convex can't resolve
// index types from a dynamic string table name. Safe — table names
// are validated at the adapter layer.

// ── Create ────────────────────────────────────────────────
export const createRecord = mutation({
  args: {
    table: v.string(),
    data: v.any(),
  },
  handler: async (ctx, { table, data }) => {
    await (ctx.db as any).insert(table, data);
    return data;
  },
});

// ── Find by field (single record) ─────────────────────────
export const findOne = query({
  args: {
    table: v.string(),
    field: v.string(),
    value: v.any(),
  },
  handler: async (ctx, { table, field, value }) => {
    // Use indexes for common lookups
    if (field === "id") {
      return (ctx.db as any)
        .query(table)
        .withIndex("by_auth_id", (q: any) => q.eq("id", value))
        .first();
    }
    if (field === "email" && table === "auth_users") {
      return (ctx.db as any)
        .query(table)
        .withIndex("by_email", (q: any) => q.eq("email", value))
        .first();
    }
    if (field === "token" && table === "auth_sessions") {
      return (ctx.db as any)
        .query(table)
        .withIndex("by_token", (q: any) => q.eq("token", value))
        .first();
    }
    if (field === "userId") {
      return (ctx.db as any)
        .query(table)
        .withIndex("by_userId", (q: any) => q.eq("userId", value))
        .first();
    }

    // Fallback: full scan (rare)
    const all = await (ctx.db as any).query(table).collect();
    return all.find((row: any) => row[field] === value) ?? null;
  },
});

// ── Find many by field ────────────────────────────────────
export const findMany = query({
  args: {
    table: v.string(),
    field: v.optional(v.string()),
    value: v.optional(v.any()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { table, field, value, limit }) => {
    if (!field || value === undefined) {
      const all = await (ctx.db as any).query(table).collect();
      return limit ? all.slice(0, limit) : all;
    }

    if (field === "userId") {
      const results = await (ctx.db as any)
        .query(table)
        .withIndex("by_userId", (q: any) => q.eq("userId", value))
        .collect();
      return limit ? results.slice(0, limit) : results;
    }

    // Fallback
    const all = await (ctx.db as any).query(table).collect();
    const filtered = all.filter((row: any) => row[field] === value);
    return limit ? filtered.slice(0, limit) : filtered;
  },
});

// ── Find by compound key ──────────────────────────────────
export const findByCompound = query({
  args: {
    table: v.string(),
    filters: v.any(), // Record<string, any>
  },
  handler: async (ctx, { table, filters }) => {
    // Use compound index for accounts
    if (
      table === "auth_accounts" &&
      filters.providerId !== undefined &&
      filters.accountId !== undefined
    ) {
      return (ctx.db as any)
        .query(table)
        .withIndex("by_providerId_accountId", (q: any) =>
          q.eq("providerId", filters.providerId).eq("accountId", filters.accountId),
        )
        .first();
    }

    // Fallback: full scan with multi-field match
    const all = await (ctx.db as any).query(table).collect();
    return (
      all.find((row: any) => Object.entries(filters).every(([k, v]) => row[k] === v)) ?? null
    );
  },
});

// ── Update by id ──────────────────────────────────────────
export const updateRecord = mutation({
  args: {
    table: v.string(),
    id: v.string(), // Better Auth string id
    data: v.any(),
  },
  handler: async (ctx, { table, id, data }) => {
    const record = await (ctx.db as any)
      .query(table)
      .withIndex("by_auth_id", (q: any) => q.eq("id", id))
      .first();
    if (!record) return null;
    await ctx.db.patch(record._id, data);
    return { ...record, ...data };
  },
});

// ── Update many by field ──────────────────────────────────
export const updateMany = mutation({
  args: {
    table: v.string(),
    field: v.string(),
    value: v.any(),
    data: v.any(),
  },
  handler: async (ctx, { table, field, value, data }) => {
    let records: any[];

    if (field === "userId") {
      records = await (ctx.db as any)
        .query(table)
        .withIndex("by_userId", (q: any) => q.eq("userId", value))
        .collect();
    } else {
      const all = await (ctx.db as any).query(table).collect();
      records = all.filter((row: any) => row[field] === value);
    }

    for (const record of records) {
      await ctx.db.patch(record._id, data);
    }
    return records.length;
  },
});

// ── Delete by id ──────────────────────────────────────────
export const deleteRecord = mutation({
  args: {
    table: v.string(),
    id: v.string(),
  },
  handler: async (ctx, { table, id }) => {
    const record = await (ctx.db as any)
      .query(table)
      .withIndex("by_auth_id", (q: any) => q.eq("id", id))
      .first();
    if (record) {
      await ctx.db.delete(record._id);
    }
  },
});

// ── Delete many by field ──────────────────────────────────
export const deleteMany = mutation({
  args: {
    table: v.string(),
    field: v.string(),
    value: v.any(),
  },
  handler: async (ctx, { table, field, value }) => {
    let records: any[];

    if (field === "userId") {
      records = await (ctx.db as any)
        .query(table)
        .withIndex("by_userId", (q: any) => q.eq("userId", value))
        .collect();
    } else {
      const all = await (ctx.db as any).query(table).collect();
      records = all.filter((row: any) => row[field] === value);
    }

    for (const record of records) {
      await ctx.db.delete(record._id);
    }
    return records.length;
  },
});

// ── Count ─────────────────────────────────────────────────
export const countRecords = query({
  args: {
    table: v.string(),
    field: v.optional(v.string()),
    value: v.optional(v.any()),
  },
  handler: async (ctx, { table, field, value }) => {
    if (!field || value === undefined) {
      const all = await (ctx.db as any).query(table).collect();
      return all.length;
    }

    if (field === "userId") {
      const results = await (ctx.db as any)
        .query(table)
        .withIndex("by_userId", (q: any) => q.eq("userId", value))
        .collect();
      return results.length;
    }

    const all = await (ctx.db as any).query(table).collect();
    return all.filter((row: any) => row[field] === value).length;
  },
});
