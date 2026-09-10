import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const create = mutation({
  args: {
    storeId: v.id("stores"),
    customerName: v.string(),
    customerPhone: v.string(),
    customerNotes: v.optional(v.string()),
    items: v.array(
      v.object({
        productId: v.string(),
        name: v.string(),
        price: v.number(),
        costPrice: v.optional(v.number()),
        qty: v.number(),
        discountType: v.optional(v.union(v.literal("percentage"), v.literal("nominal"))),
        discountValue: v.optional(v.number()),
        subtotal: v.number(),
      }),
    ),
    subtotal: v.number(),
    total: v.number(),
  },
  handler: async (ctx, args) => {
    const store = await ctx.db.get(args.storeId);
    if (!store) {
      throw new Error("Toko tidak ditemukan.");
    }
    if (store.onlineStoreEnabled === false) {
      throw new Error("Pemesanan online untuk toko ini sedang dinonaktifkan.");
    }

    if (args.items.length === 0) {
      throw new Error("Keranjang belanja kosong.");
    }

    // Check stock availability
    const enrichedItems = [];
    const insufficientStock: string[] = [];

    for (const item of args.items) {
      const prodId = ctx.db.normalizeId("products", item.productId);
      if (!prodId) {
        throw new Error(`Produk "${item.name}" tidak valid.`);
      }
      const product = await ctx.db.get(prodId);
      if (!product) {
        throw new Error(`Produk "${item.name}" tidak ditemukan.`);
      }
      if (product.stock < item.qty) {
        insufficientStock.push(`${item.name} (tersisa ${product.stock}, dipesan ${item.qty})`);
      }
      enrichedItems.push({
        ...item,
        costPrice: product.costPrice ?? 0,
      });
    }

    if (insufficientStock.length > 0) {
      throw new Error(`Stok tidak mencukupi: ${insufficientStock.join(", ")}`);
    }

    // Deduct/reserve stock immediately
    for (const item of args.items) {
      const prodId = ctx.db.normalizeId("products", item.productId);
      if (prodId) {
        const prod = await ctx.db.get(prodId);
        if (prod) {
          await ctx.db.patch(prodId, {
            stock: Math.max(0, prod.stock - item.qty),
          });
        }
      }
    }

    // Generate readable order number: e.g. ORD-6842
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-${randomSuffix}`;

    const now = Date.now();
    const expiresAt = now + 2 * 60 * 60 * 1000; // 2 hours

    const orderId = await ctx.db.insert("online_orders", {
      storeId: args.storeId,
      orderNumber,
      customerName: args.customerName.trim(),
      customerPhone: args.customerPhone.trim(),
      customerNotes: args.customerNotes?.trim() || undefined,
      items: enrichedItems,
      subtotal: args.subtotal,
      total: args.total,
      status: "pending",
      expiresAt,
      createdAt: now,
    });

    // Schedule 2-hour auto-void
    await ctx.scheduler.runAfter(2 * 60 * 60 * 1000, internal.onlineOrders.autoExpire, {
      orderId,
    });

    // Schedule background Web Push notification to store devices
    await ctx.scheduler.runAfter(0, (internal as any).pushNotifications.sendPushToStore, {
      storeId: args.storeId,
      title: `Pesanan Baru Masuk! #${orderNumber}`,
      body: `${args.customerName} • Rp ${args.total.toLocaleString("id-ID")}`,
      url: "/pesanan",
      tag: `order-${orderId}`,
    });


    return orderId;

  },
});

export const getById = query({
  args: { orderId: v.id("online_orders") },
  handler: async (ctx, { orderId }) => {
    const order = await ctx.db.get(orderId);
    if (!order) return null;

    const store = await ctx.db.get(order.storeId);

    const enrichedItems = await Promise.all(
      order.items.map(async (item) => {
        let imageUrl: string | null = null;
        if (item.productId) {
          const prodId = ctx.db.normalizeId("products", item.productId);
          if (prodId) {
            const prod = await ctx.db.get(prodId);
            if (prod?.imageId) {
              if (prod.imageId.startsWith("data:") || prod.imageId.startsWith("http")) {
                imageUrl = prod.imageId;
              } else {
                try {
                  imageUrl = await ctx.storage.getUrl(prod.imageId);
                } catch {
                  imageUrl = prod.imageId;
                }
              }
            }
          }
        }
        return {
          ...item,
          imageUrl,
        };
      }),
    );

    return {
      ...order,
      items: enrichedItems,
      store: store
        ? {
            name: store.name,
            address: store.address,
            category: store.category,
            slug: store.slug,
          }
        : null,
    };
  },
});

export const listByStore = query({
  args: {
    storeId: v.id("stores"),
    status: v.optional(
      v.union(
        v.literal("all"),
        v.literal("pending"),
        v.literal("preparing"),
        v.literal("ready_for_pickup"),
        v.literal("completed"),
        v.literal("cancelled"),
      ),
    ),
  },
  handler: async (ctx, { storeId, status }) => {
    let ordersQuery = ctx.db
      .query("online_orders")
      .withIndex("by_storeId", (q) => q.eq("storeId", storeId))
      .order("desc");

    const all = await ordersQuery.collect();

    if (!status || status === "all") {
      return all;
    }

    return all.filter((o) => o.status === status);
  },
});

export const countActiveByStore = query({
  args: { storeId: v.id("stores") },
  handler: async (ctx, { storeId }) => {
    const orders = await ctx.db
      .query("online_orders")
      .withIndex("by_storeId", (q) => q.eq("storeId", storeId))
      .collect();

    let pending = 0;
    let preparing = 0;
    let ready_for_pickup = 0;

    for (const o of orders) {
      if (o.status === "pending") pending++;
      else if (o.status === "preparing") preparing++;
      else if (o.status === "ready_for_pickup") ready_for_pickup++;
    }

    return {
      pending,
      preparing,
      ready_for_pickup,
      totalActive: pending + preparing + ready_for_pickup,
    };
  },
});

export const updateStatus = mutation({
  args: {
    orderId: v.id("online_orders"),
    status: v.union(v.literal("preparing"), v.literal("ready_for_pickup")),
  },
  handler: async (ctx, { orderId, status }) => {
    const order = await ctx.db.get(orderId);
    if (!order) {
      throw new Error("Pesanan tidak ditemukan.");
    }

    if (order.status === "completed" || order.status === "cancelled") {
      throw new Error(`Pesanan sudah ${order.status === "completed" ? "selesai" : "dibatalkan"}.`);
    }

    const patch: Record<string, any> = { status };
    if (status === "preparing") patch.preparedAt = Date.now();
    if (status === "ready_for_pickup") patch.readyAt = Date.now();

    await ctx.db.patch(orderId, patch);
  },
});

export const cancel = mutation({
  args: {
    orderId: v.id("online_orders"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, { orderId, reason }) => {
    const order = await ctx.db.get(orderId);
    if (!order) {
      throw new Error("Pesanan tidak ditemukan.");
    }

    if (order.status === "completed") {
      throw new Error("Pesanan yang sudah dibayar/selesai tidak dapat dibatalkan dari sini.");
    }
    if (order.status === "cancelled") {
      return;
    }

    // Restore stock
    for (const item of order.items) {
      const prodId = ctx.db.normalizeId("products", item.productId);
      if (prodId) {
        const prod = await ctx.db.get(prodId);
        if (prod) {
          await ctx.db.patch(prodId, {
            stock: prod.stock + item.qty,
          });
        }
      }
    }

    await ctx.db.patch(orderId, {
      status: "cancelled",
      cancelReason: reason || "Dibatalkan oleh staf toko",
    });
  },
});

export const completeAndPay = mutation({
  args: {
    orderId: v.id("online_orders"),
    paymentMethod: v.union(v.literal("cash"), v.literal("qris")),
    cashPaid: v.optional(v.number()),
    change: v.optional(v.number()),
    cashierId: v.optional(v.string()),
    cashierName: v.optional(v.string()),
    shiftId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Pesanan tidak ditemukan.");
    }
    if (order.status === "completed") {
      return { orderId: args.orderId, transactionId: order.transactionId };
    }
    if (order.status === "cancelled") {
      throw new Error("Pesanan sudah dibatalkan sebelumnya.");
    }

    const now = Date.now();

    // Create record in POS transactions (stock was already deducted at order creation)
    const txId = await ctx.db.insert("transactions", {
      storeId: order.storeId,
      items: order.items,
      subtotal: order.subtotal,
      total: order.total,
      paymentMethod: args.paymentMethod,
      cashPaid: args.cashPaid,
      change: args.change,
      cashierId: args.cashierId,
      cashierName: args.cashierName,
      shiftId: args.shiftId,
      status: "completed",
      createdAt: now,
    });

    // Mark online order as completed
    await ctx.db.patch(args.orderId, {
      status: "completed",
      completedAt: now,
      transactionId: txId,
      paymentMethod: args.paymentMethod,
      cashPaid: args.cashPaid,
      change: args.change,
    });

    return { orderId: args.orderId, transactionId: txId };
  },
});

export const autoExpire = internalMutation({
  args: { orderId: v.id("online_orders") },
  handler: async (ctx, { orderId }) => {
    const order = await ctx.db.get(orderId);
    if (!order) return;

    // Only auto-void if order is still active
    if (
      order.status === "pending" ||
      order.status === "preparing" ||
      order.status === "ready_for_pickup"
    ) {
      // Restore stock
      for (const item of order.items) {
        const prodId = ctx.db.normalizeId("products", item.productId);
        if (prodId) {
          const prod = await ctx.db.get(prodId);
          if (prod) {
            await ctx.db.patch(prodId, {
              stock: prod.stock + item.qty,
            });
          }
        }
      }

      await ctx.db.patch(orderId, {
        status: "cancelled",
        cancelReason: "Waktu pengambilan pesanan habis (2 jam)",
      });
    }
  },
});
