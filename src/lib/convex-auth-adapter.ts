import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import type { CustomAdapter } from "better-auth/adapters";
import { createAdapterFactory } from "better-auth/adapters";

// Map Better Auth model names to Convex table names
const MODEL_TO_TABLE: Record<string, string> = {
  user: "auth_users",
  session: "auth_sessions",
  account: "auth_accounts",
  verification: "auth_verifications",
};

function getTable(model: string): string {
  return MODEL_TO_TABLE[model] || model;
}

// Known Better Auth date fields that need Date <-> number conversion for Convex
const DATE_FIELDS = new Set([
  "createdAt",
  "updatedAt",
  "expiresAt",
  "accessTokenExpiresAt",
  "refreshTokenExpiresAt",
]);

// Convert JS Date objects to epoch ms numbers for Convex
function toConvex<T>(val: T): T {
  if (val === null || val === undefined) return val;
  if (val instanceof Date) return val.getTime() as any;
  if (Array.isArray(val)) return val.map(toConvex) as any;
  if (typeof val === "object") {
    const res: Record<string, any> = {};
    for (const [k, v] of Object.entries(val)) {
      if (v instanceof Date) {
        res[k] = v.getTime();
      } else if (DATE_FIELDS.has(k) && typeof v === "string") {
        const parsed = Date.parse(v);
        res[k] = isNaN(parsed) ? v : parsed;
      } else {
        res[k] = toConvex(v);
      }
    }
    return res as any;
  }
  return val;
}

// Convert timestamp numbers back to JS Date objects for Better Auth
function fromConvex<T>(record: T): T {
  if (!record || typeof record !== "object" || Array.isArray(record)) return record;
  const res: Record<string, any> = { ...record };
  for (const field of DATE_FIELDS) {
    if (typeof res[field] === "number") {
      res[field] = new Date(res[field]);
    } else if (typeof res[field] === "string") {
      const parsed = Date.parse(res[field]);
      if (!isNaN(parsed)) res[field] = new Date(parsed);
    }
  }
  return res as T;
}

// Strip Convex internal fields (_id, _creationTime) and deserialize dates
function cleanConvexRecord(record: any): any {
  if (!record) return record;
  const { _id, _creationTime, ...rest } = record;
  return fromConvex(rest);
}

/**
 * Better Auth adapter backed by Convex.
 * Uses ConvexHttpClient (server-side) to call mutations/queries in convex/betterAuth.ts.
 *
 * This replaces memoryAdapter so sessions survive serverless cold starts.
 */
export function convexAdapter(convexUrl: string) {
  const client = new ConvexHttpClient(convexUrl);

  return createAdapterFactory({
    config: {
      adapterId: "convex",
      adapterName: "Convex Adapter",
      usePlural: false,
      debugLogs: false,
      supportsArrays: true,
      // Convex has no native transactions usable from ConvexHttpClient
      transaction: false,
    },
    adapter: ({ getModelName }) => {
      // Helper: extract first where clause for simple single-field lookups
      function firstWhere(where: { field: string; value: any; operator?: string }[]) {
        return where[0] || { field: "id", value: undefined };
      }

      // Helper: match a record against where clauses (client-side filtering for complex queries)
      function matchesWhere(
        record: Record<string, any>,
        where: { field: string; value: any; operator?: string; connector?: string }[],
      ): boolean {
        if (!where.length) return true;
        let result = evalClause(record, where[0]);
        for (let i = 1; i < where.length; i++) {
          const clause = where[i];
          const clauseResult = evalClause(record, clause);
          if (clause.connector === "OR") result = result || clauseResult;
          else result = result && clauseResult;
        }
        return result;
      }

      function evalClause(
        record: Record<string, any>,
        clause: { field: string; value: any; operator?: string },
      ): boolean {
        const { field, value, operator = "eq" } = clause;
        let recordVal = record[field];
        let targetVal = value;

        if (recordVal instanceof Date) recordVal = recordVal.getTime();
        if (targetVal instanceof Date) targetVal = targetVal.getTime();

        switch (operator) {
          case "eq":
            return targetVal === null ? recordVal == null : recordVal === targetVal;
          case "ne":
            return recordVal !== targetVal;
          case "gt":
            return recordVal > targetVal;
          case "gte":
            return recordVal >= targetVal;
          case "lt":
            return recordVal < targetVal;
          case "lte":
            return recordVal <= targetVal;
          case "in":
            return (
              Array.isArray(targetVal) &&
              targetVal.map((v: any) => (v instanceof Date ? v.getTime() : v)).includes(recordVal)
            );
          case "not_in":
            return (
              Array.isArray(targetVal) &&
              !targetVal.map((v: any) => (v instanceof Date ? v.getTime() : v)).includes(recordVal)
            );
          case "contains":
            return typeof recordVal === "string" && recordVal.includes(targetVal);
          case "starts_with":
            return typeof recordVal === "string" && recordVal.startsWith(targetVal);
          case "ends_with":
            return typeof recordVal === "string" && recordVal.endsWith(targetVal);
          default:
            return recordVal === targetVal;
        }
      }

      const adapter: CustomAdapter = {
        create: async ({ model, data }) => {
          const table = getTable(getModelName(model));
          await client.mutation(api.betterAuth.createRecord, {
            table,
            data: toConvex(data),
          });
          return fromConvex(data);
        },

        findOne: async ({ model, where }) => {
          const table = getTable(getModelName(model));
          const w = firstWhere(where);

          // Try compound lookup for accounts
          if (where.length > 1) {
            const filters = Object.fromEntries(where.map((w) => [w.field, toConvex(w.value)]));
            const result = await client.query(api.betterAuth.findByCompound, { table, filters });
            return result ? cleanConvexRecord(result) : null;
          }

          const result = await client.query(api.betterAuth.findOne, {
            table,
            field: w.field,
            value: toConvex(w.value),
          });
          return result ? cleanConvexRecord(result) : null;
        },

        findMany: async ({ model, where, limit, sortBy, offset }) => {
          const table = getTable(getModelName(model));
          const w = where?.[0];

          let results = await client.query(api.betterAuth.findMany, {
            table,
            field: w?.field,
            value: toConvex(w?.value),
            limit: undefined, // fetch all, filter client-side for complex where
          });

          results = results.map(cleanConvexRecord);

          // Client-side filtering for multi-field where
          if (where && where.length > 1) {
            results = results.filter((r: any) => matchesWhere(r, where));
          }

          // Sort
          if (sortBy) {
            results.sort((a: any, b: any) => {
              const aVal =
                a[sortBy.field] instanceof Date ? a[sortBy.field].getTime() : a[sortBy.field];
              const bVal =
                b[sortBy.field] instanceof Date ? b[sortBy.field].getTime() : b[sortBy.field];
              const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
              return sortBy.direction === "asc" ? cmp : -cmp;
            });
          }

          // Offset + limit
          if (offset) results = results.slice(offset);
          if (limit) results = results.slice(0, limit);

          return results;
        },

        update: async ({ model, where, update }) => {
          const table = getTable(getModelName(model));
          const w = firstWhere(where);

          // Find the record first to get its Better Auth id
          let record: any;
          if (where.length > 1) {
            const filters = Object.fromEntries(where.map((w) => [w.field, toConvex(w.value)]));
            record = await client.query(api.betterAuth.findByCompound, { table, filters });
          } else {
            record = await client.query(api.betterAuth.findOne, {
              table,
              field: w.field,
              value: toConvex(w.value),
            });
          }

          if (!record) return null;

          const result = await client.mutation(api.betterAuth.updateRecord, {
            table,
            id: record.id,
            data: toConvex(update as Record<string, any>),
          });
          return result ? cleanConvexRecord(result) : null;
        },

        updateMany: async ({ model, where, update }) => {
          const table = getTable(getModelName(model));
          const w = firstWhere(where);
          return client.mutation(api.betterAuth.updateMany, {
            table,
            field: w.field,
            value: toConvex(w.value),
            data: toConvex(update),
          });
        },

        delete: async ({ model, where }) => {
          const table = getTable(getModelName(model));
          const w = firstWhere(where);

          // Find by field first, then delete by id
          const record: any = await client.query(api.betterAuth.findOne, {
            table,
            field: w.field,
            value: toConvex(w.value),
          });
          if (record) {
            await client.mutation(api.betterAuth.deleteRecord, { table, id: record.id });
          }
        },

        deleteMany: async ({ model, where }) => {
          const table = getTable(getModelName(model));
          const w = firstWhere(where);
          return client.mutation(api.betterAuth.deleteMany, {
            table,
            field: w.field,
            value: toConvex(w.value),
          });
        },

        count: async ({ model, where }) => {
          const table = getTable(getModelName(model));
          const w = where?.[0];
          return client.query(api.betterAuth.countRecords, {
            table,
            field: w?.field,
            value: toConvex(w?.value),
          });
        },
      };

      return adapter;
    },
  });
}
