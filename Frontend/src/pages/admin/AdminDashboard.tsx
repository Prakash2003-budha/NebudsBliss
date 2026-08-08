import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { API_ENDPOINTS } from "../../constants/constants";
import shared from "./admin.shared.module.scss";
import styles from "./AdminDashboard.module.scss";

interface OrderItem {
  productId?: string;
  name?: string;
  quantity?: number;
  price?: number;
}

interface Order {
  _id: string;
  userId?: string;
  fullName?: string;
  phone?: string;
  email?: string;
  items?: OrderItem[];
  totalAmount?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  orderStatus?: string;
  createdAt?: string;
}

interface Item {
  _id: string;
  name: string;
  category?: string;
  price?: number;
  stockQuantity?: number;
  isActive?: boolean;
  images?: { url?: string }[];
}

type RangeKey = "7" | "30" | "90" | "all";

const RANGES: { key: RangeKey; label: string; days: number }[] = [
  { key: "7", label: "7D", days: 7 },
  { key: "30", label: "30D", days: 30 },
  { key: "90", label: "90D", days: 90 },
  { key: "all", label: "All", days: Infinity },
];

const DAY_MS = 86400000;

const ORDER_STATUS_LABEL: Record<string, string> = {
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_COLORS: Record<string, string> = {
  processing: "#7c3aed",
  shipped: "#0ea5e9",
  delivered: "#10b981",
  cancelled: "#e53935",
};

const STATUS_ORDER = ["processing", "shipped", "delivered", "cancelled"];

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  cash: "Cash on delivery",
  bank: "Bank transfer",
};

const authHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return { Authorization: token ? `Bearer ${token}` : "" };
};

const formatPrice = (value?: number): string => {
  const n = Number(value ?? 0);
  return `Rs. ${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
};

const shortId = (id?: string): string => {
  if (!id) return "-";
  return id.length > 10 ? `#${id.slice(-6).toUpperCase()}` : `#${id.toUpperCase()}`;
};

const formatDate = (value?: string): string => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const orderBadgeClass = (status?: string): string => {
  const map: Record<string, string> = {
    processing: shared.badgeViolet,
    shipped: shared.badgeCyan,
    delivered: shared.badgeGreen,
    cancelled: shared.badgeRed,
  };
  return map[status ?? ""] || shared.badgeGray;
};

const paymentBadgeClass = (status?: string): string => {
  const map: Record<string, string> = {
    pending: shared.badgeAmber,
    completed: shared.badgeGreen,
    failed: shared.badgeRed,
  };
  return map[status ?? ""] || shared.badgeGray;
};

/* ---------------- Small chart / KPI building blocks ---------------- */

const Trend: React.FC<{ current: number; previous: number }> = ({ current, previous }) => {
  if (previous <= 0) {
    if (current > 0) {
      return <span className={`${styles.kpiTrend} ${styles.trendUp}`}>▲ New</span>;
    }
    return <span className={`${styles.kpiTrend} ${styles.trendFlat}`}>—</span>;
  }
  const delta = ((current - previous) / previous) * 100;
  const up = delta >= 0;
  return (
    <span className={`${styles.kpiTrend} ${up ? styles.trendUp : styles.trendDown}`}>
      {up ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}%
    </span>
  );
};

interface KpiCardProps {
  icon: React.ReactNode;
  iconClass: string;
  label: string;
  value: string;
  sub?: string;
  trend?: { current: number; previous: number };
}

const KpiCard: React.FC<KpiCardProps> = ({ icon, iconClass, label, value, sub, trend }) => (
  <div className={`${shared.card} ${styles.kpi}`}>
    <div className={styles.kpiRow}>
      <div className={`${shared.statIcon} ${iconClass}`}>{icon}</div>
      <div>
        <div className={styles.kpiValue}>{value}</div>
        <div className={styles.kpiLabel}>{label}</div>
      </div>
    </div>
    <div className={styles.kpiFoot}>
      {trend && <Trend current={trend.current} previous={trend.previous} />}
      {sub && <span className={styles.kpiSub}>{sub}</span>}
    </div>
  </div>
);

interface ChartPoint {
  label: string;
  value: number;
}

const AreaChart: React.FC<{ data: ChartPoint[]; height?: number }> = ({ data, height = 240 }) => {
  const [active, setActive] = useState<number | null>(null);
  const W = 600;
  const pad = 10;

  if (data.length === 0) {
    return (
      <div className={styles.chartWrap} style={{ height }}>
        <div className={styles.chartEmpty}>No sales data in this period.</div>
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.value), 1);
  const step = data.length > 1 ? (W - pad * 2) / (data.length - 1) : 0;
  const x = (i: number) => (data.length === 1 ? W / 2 : pad + i * step);
  const y = (v: number) => height - pad - (v / max) * (height - pad * 2);

  const linePath = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(2)} ${y(d.value).toFixed(2)}`)
    .join(" ");
  const areaPath = `${linePath} L ${x(data.length - 1).toFixed(2)} ${(height - pad).toFixed(2)} L ${x(0).toFixed(2)} ${(height - pad).toFixed(2)} Z`;

  const hitWidth = data.length > 1 ? step : W;
  const labelStep = Math.max(1, Math.ceil(data.length / 6));
  const axisLabels = data.filter((_, i) => i % labelStep === 0 || i === data.length - 1);

  const tooltipPos = (i: number) => {
    const px = (x(i) / W) * 100;
    const py = (y(data[i].value) / height) * 100;
    return {
      left: `clamp(72px, ${px}%, calc(100% - 72px))`,
      top: `${py}%`,
      transform: py < 16 ? "translate(-50%, 26px)" : "translate(-50%, -135%)",
    };
  };

  return (
    <>
      <div className={styles.chartWrap} style={{ height }}>
        <svg viewBox={`0 0 ${W} ${height}`} className={styles.chartSvg} preserveAspectRatio="none">
          <defs>
            <linearGradient id="revenueArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#085ff6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#085ff6" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((f) => (
            <line key={f} x1={pad} x2={W - pad} y1={height * f} y2={height * f} stroke="#eef2f7" strokeWidth="1" />
          ))}
          <path d={areaPath} fill="url(#revenueArea)" />
          <path
            d={linePath}
            fill="none"
            stroke="#085ff6"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {data.map((_, i) => (
            <rect
              key={i}
              x={x(i) - hitWidth / 2}
              y={0}
              width={hitWidth}
              height={height}
              fill="transparent"
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
            />
          ))}
        </svg>
        {active !== null && (
          <>
            <div className={styles.chartGuide} style={{ left: `${(x(active) / W) * 100}%` }} />
            <div
              className={styles.chartDot}
              style={{ left: `${(x(active) / W) * 100}%`, top: `${(y(data[active].value) / height) * 100}%` }}
            />
            <div
              className={styles.chartTooltip}
              style={tooltipPos(active)}
            >
              <div className={styles.chartTooltipLabel}>{data[active].label}</div>
              <div className={styles.chartTooltipValue}>{formatPrice(data[active].value)}</div>
            </div>
          </>
        )}
      </div>
      <div className={styles.chartAxis}>
        {axisLabels.map((d, i) => (
          <span key={i} style={{ left: `${(x(data.indexOf(d)) / W) * 100}%` }}>
            {d.label}
          </span>
        ))}
      </div>
    </>
  );
};

const Donut: React.FC<{ counts: Record<string, number> }> = ({ counts }) => {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const R = 70;
  const C = 2 * Math.PI * R;
  let cumulative = 0;
  const segments = STATUS_ORDER.filter((key) => (counts[key] ?? 0) > 0).map((key) => {
    const frac = (counts[key] ?? 0) / (total || 1);
    const segment = {
      key,
      color: STATUS_COLORS[key] ?? "#64748b",
      dash: frac * C,
      offset: -cumulative * C,
    };
    cumulative += frac;
    return segment;
  });

  return (
    <div className={styles.donutWrap}>
      <svg viewBox="0 0 220 220" className={styles.donut}>
        <circle cx="110" cy="110" r={R} fill="none" stroke="#eef2f7" strokeWidth="24" />
        {segments.map((segment) => (
          <circle
            key={segment.key}
            cx="110"
            cy="110"
            r={R}
            fill="none"
            stroke={segment.color}
            strokeWidth="24"
            strokeDasharray={`${segment.dash} ${C - segment.dash}`}
            strokeDashoffset={segment.offset}
            transform="rotate(-90 110 110)"
          />
        ))}
      </svg>
      <div className={styles.donutCenter}>
        <span className={styles.donutValue}>{total}</span>
        <span className={styles.donutLabel}>orders</span>
      </div>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<RangeKey>("30");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersRes, itemsRes] = await Promise.all([
        axios.get(API_ENDPOINTS.GET_ALL_ORDERS, { headers: authHeaders() }),
        axios.get(API_ENDPOINTS.GET_ALL_ITEMS, { headers: authHeaders() }),
      ]);
      setOrders(ordersRes.data?.data ?? []);
      setItems(itemsRes.data?.data ?? []);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      toast.error("Failed to load dashboard data. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const itemById = useMemo(() => new Map(items.map((item) => [item._id, item])), [items]);

  const activeRange = RANGES.find((r) => r.key === range) ?? RANGES[1];
  const nowTs = Date.now();
  const cutoff = activeRange.days === Infinity ? 0 : nowTs - activeRange.days * DAY_MS;
  const prevCutoff = activeRange.days === Infinity ? null : cutoff - activeRange.days * DAY_MS;

  const revenueOf = (order: Order): number =>
    order.orderStatus !== "cancelled" && order.paymentStatus !== "failed"
      ? Number(order.totalAmount ?? 0)
      : 0;

  const inWindow = (order: Order): boolean => {
    const t = new Date(order.createdAt ?? nowTs).getTime();
    return t >= cutoff;
  };

  const rangeOrders = useMemo(() => orders.filter(inWindow), [orders, cutoff]);

  const prevOrders = useMemo(
    () =>
      prevCutoff === null
        ? []
        : orders.filter((order) => {
            const t = new Date(order.createdAt ?? nowTs).getTime();
            return t < cutoff && t >= prevCutoff;
          }),
    [orders, cutoff, prevCutoff]
  );

  const sumRevenue = (list: Order[]): number =>
    list.reduce((sum, order) => sum + revenueOf(order), 0);

  const revenue = sumRevenue(rangeOrders);
  const prevRevenue = sumRevenue(prevOrders);
  const orderCount = rangeOrders.length;
  const prevOrderCount = prevOrders.length;
  const aov = orderCount ? revenue / orderCount : 0;
  const prevAov = prevOrderCount ? prevRevenue / prevOrderCount : 0;
  const customerCount = new Set(rangeOrders.map((o) => o.userId).filter(Boolean)).size;
  const prevCustomerCount = new Set(prevOrders.map((o) => o.userId).filter(Boolean)).size;

  const pendingList = rangeOrders.filter(
    (o) => o.paymentStatus === "pending" && o.orderStatus !== "cancelled"
  );
  const pendingAmount = pendingList.reduce((s, o) => s + Number(o.totalAmount ?? 0), 0);
  const periodLabel = activeRange.days === Infinity ? "period" : `previous ${activeRange.days} days`;

  const revenueSeries = useMemo(() => {
    if (rangeOrders.length === 0) return [];
    const minTs = Math.min(...rangeOrders.map((o) => new Date(o.createdAt ?? nowTs).getTime()));
    const spanDays =
      activeRange.days === Infinity ? Math.max(Math.ceil((nowTs - minTs) / DAY_MS), 1) : activeRange.days;
    const weekly = spanDays > 120;
    const bucketMs = weekly ? 7 * DAY_MS : DAY_MS;
    const bucketCount = weekly ? Math.ceil(spanDays / 7) : spanDays;
    const buckets = new Array(bucketCount).fill(0);
    rangeOrders.forEach((order) => {
      const t = new Date(order.createdAt ?? nowTs).getTime();
      const idx = Math.min(bucketCount - 1, Math.max(0, Math.floor((nowTs - t) / bucketMs)));
      buckets[bucketCount - 1 - idx] += revenueOf(order);
    });
    return buckets.map((value, i) => {
      const date = new Date(nowTs - (bucketCount - 1 - i) * bucketMs);
      return {
        label: date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
        value,
      };
    });
  }, [rangeOrders, activeRange.days]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    rangeOrders.forEach((order) => {
      const status = order.orderStatus ?? "processing";
      counts[status] = (counts[status] ?? 0) + 1;
    });
    return counts;
  }, [rangeOrders]);
  const statusTotal = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  const categoryStats = useMemo(() => {
    const map = new Map<string, { qty: number; revenue: number }>();
    rangeOrders.forEach((order) =>
      (order.items ?? []).forEach((it) => {
        const category = itemById.get(it.productId ?? "")?.category ?? "Other";
        const entry = map.get(category) ?? { qty: 0, revenue: 0 };
        const qty = Number(it.quantity ?? 0);
        entry.qty += qty;
        entry.revenue += qty * Number(it.price ?? 0);
        map.set(category, entry);
      })
    );
    return [...map.entries()]
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [rangeOrders, itemById]);
  const maxCategoryRevenue = categoryStats.length ? categoryStats[0].revenue : 1;

  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; productId?: string; qty: number; revenue: number }>();
    rangeOrders.forEach((order) =>
      (order.items ?? []).forEach((it) => {
        const key = it.productId ?? it.name ?? "Unknown";
        const entry = map.get(key) ?? {
          name: it.name ?? "Unknown",
          productId: it.productId,
          qty: 0,
          revenue: 0,
        };
        const qty = Number(it.quantity ?? 0);
        entry.qty += qty;
        entry.revenue += qty * Number(it.price ?? 0);
        map.set(key, entry);
      })
    );
    return [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 6);
  }, [rangeOrders]);

  const lowStockItems = useMemo(
    () =>
      items
        .filter((item) => Number(item.stockQuantity ?? 0) <= 5)
        .sort((a, b) => Number(a.stockQuantity ?? 0) - Number(b.stockQuantity ?? 0))
        .slice(0, 6),
    [items]
  );

  const recentOrders = useMemo(
    () =>
      [...rangeOrders]
        .sort(
          (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
        )
        .slice(0, 6),
    [rangeOrders]
  );

  const itemCount = (order: Order): number =>
    (order.items ?? []).reduce((sum, it) => sum + Number(it.quantity ?? 0), 0);

  return (
    <div className={shared.page}>
      <div className={shared.pageHead}>
        <div>
          <h1 className={shared.pageTitle}>Dashboard</h1>
          <p className={shared.pageSubtitle}>Store performance and order analytics at a glance.</p>
        </div>
        <div className={shared.toolbar}>
          <div className={styles.rangePills}>
            {RANGES.map((r) => (
              <button
                key={r.key}
                className={`${styles.rangePill} ${range === r.key ? styles.rangePillActive : ""}`}
                onClick={() => setRange(r.key)}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button className={`${shared.btn} ${shared.btnNeutral}`} onClick={loadData}>
            ⟳ Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className={shared.loading}>
          <span className={shared.spinner} /> Loading dashboard…
        </div>
      ) : (
        <>
          <div className={styles.kpiGrid}>
            <KpiCard
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              }
              iconClass={shared.iconGreen}
              label="Total revenue"
              value={formatPrice(revenue)}
              trend={{ current: revenue, previous: prevRevenue }}
              sub={`vs ${periodLabel}`}
            />
            <KpiCard
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              }
              iconClass={shared.iconBlue}
              label="Orders"
              value={orderCount.toString()}
              trend={{ current: orderCount, previous: prevOrderCount }}
              sub={`vs ${periodLabel}`}
            />
            <KpiCard
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
              }
              iconClass={shared.iconAmber}
              label="Avg order value"
              value={formatPrice(aov)}
              trend={{ current: aov, previous: prevAov }}
              sub="per order"
            />
            <KpiCard
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              }
              iconClass={shared.iconViolet}
              label="Customers"
              value={customerCount.toString()}
              trend={{ current: customerCount, previous: prevCustomerCount }}
              sub={`vs ${periodLabel}`}
            />
            <KpiCard
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              }
              iconClass={shared.iconRed}
              label="Pending payments"
              value={pendingList.length.toString()}
              sub={`${formatPrice(pendingAmount)} awaiting verification`}
            />
          </div>

          <div className={styles.dashGridWide}>
            <div className={`${shared.card} ${shared.cardBodyFlush}`}>
              <div className={shared.cardHead}>
                <h2 className={shared.cardTitle}>Revenue</h2>
                <span className={shared.statLabel}>
                  {formatPrice(revenue)} · {orderCount} orders
                </span>
              </div>
              <div className={shared.cardBody}>
                <AreaChart data={revenueSeries} />
              </div>
            </div>

            <div className={`${shared.card} ${shared.cardBodyFlush}`}>
              <div className={shared.cardHead}>
                <h2 className={shared.cardTitle}>Orders by status</h2>
              </div>
              <div className={shared.cardBody}>
                {statusTotal === 0 ? (
                  <div className={styles.widgetEmpty}>No orders in this period.</div>
                ) : (
                  <div className={styles.donutLayout}>
                    <Donut counts={statusCounts} />
                    <div className={styles.legend}>
                      {STATUS_ORDER.map((key) => {
                        const count = statusCounts[key] ?? 0;
                        const pct = statusTotal ? Math.round((count / statusTotal) * 100) : 0;
                        return (
                          <div key={key} className={styles.legendItem}>
                            <span className={styles.legendDot} style={{ background: STATUS_COLORS[key] }} />
                            <span className={styles.legendName}>{ORDER_STATUS_LABEL[key]}</span>
                            <span className={styles.legendCount}>
                              {count} · {pct}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.dashGrid}>
            <div className={shared.card}>
              <div className={shared.cardHead}>
                <h2 className={shared.cardTitle}>Sales by category</h2>
                <Link to="/admin/products" className={`${shared.btn} ${shared.btnGhost} ${shared.btnSm}`}>
                  Products
                </Link>
              </div>
              <div className={shared.cardBody}>
                {categoryStats.length === 0 ? (
                  <div className={styles.widgetEmpty}>No sales data in this period.</div>
                ) : (
                  <div className={styles.barRows}>
                    {categoryStats.map((category) => (
                      <div key={category.name} className={styles.barRow}>
                        <div className={styles.barTop}>
                          <span className={styles.barName}>{category.name}</span>
                          <span className={styles.barVal}>
                            {category.qty} items · {formatPrice(category.revenue)}
                          </span>
                        </div>
                        <div className={styles.barTrack}>
                          <div
                            className={styles.barFill}
                            style={{ width: `${(category.revenue / maxCategoryRevenue) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className={shared.card}>
              <div className={shared.cardHead}>
                <h2 className={shared.cardTitle}>Pending payments</h2>
                <Link to="/admin/orders" className={`${shared.btn} ${shared.btnGhost} ${shared.btnSm}`}>
                  Orders
                </Link>
              </div>
              <div className={shared.cardBody}>
                {pendingList.length === 0 ? (
                  <div className={styles.widgetEmpty}>No payments waiting for verification 🎉</div>
                ) : (
                  <>
                    {pendingList.slice(0, 5).map((order) => (
                      <div key={order._id} className={styles.pendingRow}>
                        <div className={styles.pendingInfo}>
                          <div className={styles.pendingName}>{order.fullName || "Guest"}</div>
                          <div className={styles.pendingMeta}>
                            {shortId(order._id)} ·{" "}
                            {PAYMENT_METHOD_LABEL[order.paymentMethod ?? ""] ?? order.paymentMethod ?? "-"}
                          </div>
                        </div>
                        <div className={styles.pendingAmount}>{formatPrice(order.totalAmount)}</div>
                      </div>
                    ))}
                    {pendingAmount > 0 && (
                      <p className={shared.emptyText} style={{ marginTop: "0.75rem", fontWeight: 600 }}>
                        {formatPrice(pendingAmount)} awaiting verification
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className={styles.dashGrid}>
            <div className={shared.card}>
              <div className={shared.cardHead}>
                <h2 className={shared.cardTitle}>Top products</h2>
                <Link to="/admin/products" className={`${shared.btn} ${shared.btnGhost} ${shared.btnSm}`}>
                  View all
                </Link>
              </div>
              <div className={shared.cardBody}>
                {topProducts.length === 0 ? (
                  <div className={styles.widgetEmpty}>No sales data in this period.</div>
                ) : (
                  topProducts.map((product, index) => {
                    const stock = itemById.get(product.productId ?? "")?.stockQuantity;
                    return (
                      <div key={product.productId ?? product.name} className={styles.rankRow}>
                        <span className={styles.rankNum}>{index + 1}</span>
                        <div style={{ minWidth: 0 }}>
                          <div className={styles.rankName}>{product.name}</div>
                          <div className={styles.rankMeta}>
                            {product.qty} sold{stock !== undefined ? ` · stock ${stock}` : ""}
                          </div>
                        </div>
                        <div className={styles.rankRight}>
                          <div className={styles.rankRevenue}>{formatPrice(product.revenue)}</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className={shared.card}>
              <div className={shared.cardHead}>
                <h2 className={shared.cardTitle}>Low stock alerts</h2>
                <Link to="/admin/products" className={`${shared.btn} ${shared.btnGhost} ${shared.btnSm}`}>
                  Manage
                </Link>
              </div>
              <div className={shared.cardBody}>
                {lowStockItems.length === 0 ? (
                  <div className={styles.widgetEmpty}>All products are well stocked 🎉</div>
                ) : (
                  lowStockItems.map((item) => {
                    const stock = Number(item.stockQuantity ?? 0);
                    return (
                      <div key={item._id} className={styles.stockRow}>
                        {item.images?.[0]?.url ? (
                          <img src={item.images[0].url} className={shared.thumb} alt="" />
                        ) : (
                          <div className={shared.thumb} />
                        )}
                        <div style={{ minWidth: 0 }}>
                          <div className={styles.stockName}>{item.name}</div>
                          <div className={styles.stockMeta}>{item.category ?? "-"}</div>
                        </div>
                        <span className={`${styles.stockBadge} ${stock === 0 ? styles.stockOut : styles.stockLow}`}>
                          {stock === 0 ? "Out of stock" : `${stock} left`}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className={`${shared.card} ${shared.cardBodyFlush}`}>
            <div className={shared.cardHead}>
              <h2 className={shared.cardTitle}>Recent orders</h2>
              <Link to="/admin/orders" className={`${shared.btn} ${shared.btnGhost} ${shared.btnSm}`}>
                View all orders
              </Link>
            </div>
            {recentOrders.length === 0 ? (
              <div className={shared.emptyState}>
                <div className={shared.emptyIcon}>📦</div>
                <div className={shared.emptyTitle}>No orders yet</div>
                <p className={shared.emptyText}>When customers place orders they will appear here.</p>
              </div>
            ) : (
              <div className={shared.tableWrapper}>
                <table className={shared.table}>
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Payment</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order._id}>
                        <td>
                          <Link to="/admin/orders" className={styles.orderLink}>
                            {shortId(order._id)}
                          </Link>
                        </td>
                        <td>
                          <span className={shared.cellMain}>{order.fullName || "Guest"}</span>
                        </td>
                        <td className={shared.cellSub}>{formatDate(order.createdAt)}</td>
                        <td className={shared.cellSub}>{itemCount(order)}</td>
                        <td className={shared.cellMain}>{formatPrice(order.totalAmount)}</td>
                        <td>
                          <span className={`${shared.badge} ${paymentBadgeClass(order.paymentStatus ?? "")}`}>
                            {order.paymentStatus ?? "-"}
                          </span>
                        </td>
                        <td>
                          <span className={`${shared.badge} ${orderBadgeClass(order.orderStatus ?? "")}`}>
                            {order.orderStatus ?? "-"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className={shared.card}>
            <div className={shared.cardHead}>
              <h2 className={shared.cardTitle}>Quick actions</h2>
            </div>
            <div className={shared.cardBody}>
              <div className={styles.quickActions}>
                <Link to="/admin/products/new" className={styles.quickAction}>
                  <span className={`${styles.quickIcon} ${shared.iconBlue}`}>🆕</span>
                  <span className={styles.quickLabel}>Add product</span>
                </Link>
                <Link to="/admin/products" className={styles.quickAction}>
                  <span className={`${styles.quickIcon} ${shared.iconViolet}`}>📦</span>
                  <span className={styles.quickLabel}>Manage products</span>
                </Link>
                <Link to="/admin/orders" className={styles.quickAction}>
                  <span className={`${styles.quickIcon} ${shared.iconAmber}`}>🧾</span>
                  <span className={styles.quickLabel}>View orders</span>
                </Link>
                <Link to="/admin/media" className={styles.quickAction}>
                  <span className={`${styles.quickIcon} ${shared.iconCyan}`}>🖼️</span>
                  <span className={styles.quickLabel}>Banners & media</span>
                </Link>
                <Link to="/admin/promos" className={styles.quickAction}>
                  <span className={`${styles.quickIcon} ${shared.iconGreen}`}>🏷️</span>
                  <span className={styles.quickLabel}>Promo codes</span>
                </Link>
                <Link to="/admin/reviews" className={styles.quickAction}>
                  <span className={`${styles.quickIcon} ${shared.iconRed}`}>⭐</span>
                  <span className={styles.quickLabel}>Reviews</span>
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;



