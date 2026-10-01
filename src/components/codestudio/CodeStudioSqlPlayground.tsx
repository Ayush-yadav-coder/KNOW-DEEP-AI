import React, { useState, useMemo } from "react";
import {
  Database,
  Play,
  Table as TableIcon,
  Download,
  Copy,
  Check,
  Sparkles,
  Layers,
  FileSpreadsheet,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface SampleRow {
  [key: string]: any;
}

const SAMPLE_DATABASE = {
  customers: [
    { customer_id: 1, name: "Alice Johnson", email: "alice@example.com", country: "USA", tier: "Gold" },
    { customer_id: 2, name: "Bob Smith", email: "bob@sample.co.uk", country: "UK", tier: "Silver" },
    { customer_id: 3, name: "Charlie Davis", email: "charlie@enterprise.de", country: "Germany", tier: "Platinum" },
    { customer_id: 4, name: "Diana Prince", email: "diana@global.com", country: "USA", tier: "Gold" },
    { customer_id: 5, name: "Evan Wright", email: "evan@tech.io", country: "Canada", tier: "Bronze" },
  ],
  orders: [
    { order_id: 101, customer_id: 1, product: "MacBook Pro 16", amount: 2499.0, status: "COMPLETED", order_date: "2026-01-15" },
    { order_id: 102, customer_id: 3, product: "4K OLED Monitor", amount: 899.5, status: "COMPLETED", order_date: "2026-01-18" },
    { order_id: 103, customer_id: 1, product: "Wireless Mouse", amount: 79.99, status: "COMPLETED", order_date: "2026-02-01" },
    { order_id: 104, customer_id: 2, product: "Mechanical Keyboard", amount: 149.0, status: "PENDING", order_date: "2026-02-10" },
    { order_id: 105, customer_id: 3, product: "Studio Headphones", amount: 349.0, status: "COMPLETED", order_date: "2026-02-14" },
    { order_id: 106, customer_id: 4, product: "USB-C Hub Pro", amount: 89.0, status: "COMPLETED", order_date: "2026-02-20" },
    { order_id: 107, customer_id: 5, product: "Ergonomic Chair", amount: 499.0, status: "CANCELLED", order_date: "2026-02-25" },
  ],
  products: [
    { product_id: "P1", name: "MacBook Pro 16", category: "Laptops", stock: 45, unit_price: 2499.0 },
    { product_id: "P2", name: "4K OLED Monitor", category: "Displays", stock: 80, unit_price: 899.5 },
    { product_id: "P3", name: "Wireless Mouse", category: "Accessories", stock: 320, unit_price: 79.99 },
    { product_id: "P4", name: "Mechanical Keyboard", category: "Accessories", stock: 150, unit_price: 149.0 },
    { product_id: "P5", name: "Studio Headphones", category: "Audio", stock: 95, unit_price: 349.0 },
  ],
};

const PRESET_SQL_QUERIES = [
  {
    name: "Customer Lifetime Value",
    query: `SELECT c.name, c.country, c.tier, COUNT(o.order_id) as total_orders, SUM(o.amount) as lifetime_spent\nFROM customers c\nJOIN orders o ON c.customer_id = o.customer_id\nWHERE o.status = 'COMPLETED'\nGROUP BY c.customer_id, c.name\nORDER BY lifetime_spent DESC;`,
  },
  {
    name: "All Completed Orders",
    query: `SELECT * FROM orders WHERE status = 'COMPLETED' ORDER BY amount DESC;`,
  },
  {
    name: "Inventory & Category Stock",
    query: `SELECT category, COUNT(product_id) as total_items, SUM(stock) as total_inventory\nFROM products\nGROUP BY category;`,
  },
  {
    name: "USA High Tier Customers",
    query: `SELECT customer_id, name, email, tier FROM customers WHERE country = 'USA';`,
  },
];

export const CodeStudioSqlPlayground: React.FC = () => {
  const { toast } = useToast();
  const [sqlQuery, setSqlQuery] = useState<string>(PRESET_SQL_QUERIES[0].query);
  const [activeSchemaTab, setActiveSchemaTab] = useState<"customers" | "orders" | "products">("customers");
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [resultRows, setResultRows] = useState<SampleRow[]>([]);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Execute in-memory simulated query engine
  const handleExecuteQuery = () => {
    setQueryError(null);
    const startTime = performance.now();

    try {
      const clean = sqlQuery.trim().toLowerCase();

      // Check if it's querying customers, orders, or products
      let data: SampleRow[] = [];

      if (clean.includes("join orders") || (clean.includes("customers") && clean.includes("orders"))) {
        // Joined view
        data = SAMPLE_DATABASE.customers.map((c) => {
          const custOrders = SAMPLE_DATABASE.orders.filter(
            (o) => o.customer_id === c.customer_id && (!clean.includes("completed") || o.status === "COMPLETED")
          );
          const totalSpent = custOrders.reduce((sum, o) => sum + o.amount, 0);
          return {
            name: c.name,
            country: c.country,
            tier: c.tier,
            total_orders: custOrders.length,
            lifetime_spent: Number(totalSpent.toFixed(2)),
          };
        }).filter(r => r.total_orders > 0);

        if (clean.includes("order by") && clean.includes("desc")) {
          data.sort((a, b) => b.lifetime_spent - a.lifetime_spent);
        }
      } else if (clean.includes("from products")) {
        if (clean.includes("group by category")) {
          const categoryMap = new Map<string, { total_items: number; total_inventory: number }>();
          SAMPLE_DATABASE.products.forEach((p) => {
            const current = categoryMap.get(p.category) || { total_items: 0, total_inventory: 0 };
            categoryMap.set(p.category, {
              total_items: current.total_items + 1,
              total_inventory: current.total_inventory + p.stock,
            });
          });
          data = Array.from(categoryMap.entries()).map(([category, stats]) => ({
            category,
            total_items: stats.total_items,
            total_inventory: stats.total_inventory,
          }));
        } else {
          data = [...SAMPLE_DATABASE.products];
        }
      } else if (clean.includes("from orders")) {
        let rows = [...SAMPLE_DATABASE.orders];
        if (clean.includes("status = 'completed'")) {
          rows = rows.filter((r) => r.status === "COMPLETED");
        }
        if (clean.includes("order by amount desc")) {
          rows.sort((a, b) => b.amount - a.amount);
        }
        data = rows;
      } else {
        let rows = [...SAMPLE_DATABASE.customers];
        if (clean.includes("country = 'usa'")) {
          rows = rows.filter((r) => r.country === "USA");
        }
        data = rows;
      }

      const elapsed = Math.round((performance.now() - startTime + Math.random() * 4) * 10) / 10;
      setExecutionTime(elapsed);
      setResultRows(data);
      toast({ title: "Query Executed", description: `Returned ${data.length} records in ${elapsed}ms.` });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setQueryError(msg);
      setResultRows([]);
    }
  };

  // Initial execution
  useState(() => {
    handleExecuteQuery();
  });

  const columns = useMemo(() => {
    if (resultRows.length === 0) return [];
    return Object.keys(resultRows[0]);
  }, [resultRows]);

  const handleExportCsv = () => {
    if (resultRows.length === 0) return;
    const header = columns.join(",");
    const rows = resultRows.map((r) => columns.map((col) => JSON.stringify(r[col] ?? "")).join(","));
    const csvContent = "data:text/csv;charset=utf-8," + [header, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "query_results.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Exported CSV", description: "Query results downloaded." });
  };

  return (
    <div className="flex flex-col h-full rounded-2xl bg-card border border-border shadow-sm overflow-hidden text-card-foreground">
      {/* SQL Editor Header & Presets */}
      <div className="p-3 bg-muted/40 border-b border-border flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase text-foreground flex items-center gap-1.5">
            <Database className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            SQL Query &amp; Schema Workbench
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleExecuteQuery}
            className="h-8 text-xs rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5 shadow-xs"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Run SQL
          </Button>

          {resultRows.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportCsv}
              className="h-8 text-xs rounded-xl gap-1 text-muted-foreground hover:text-foreground"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* Preset Queries Pills */}
      <div className="px-3 py-1.5 bg-muted/20 border-b border-border/60 flex items-center gap-1.5 overflow-x-auto text-[11px]">
        <span className="text-muted-foreground font-medium shrink-0">Sample Queries:</span>
        {PRESET_SQL_QUERIES.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => setSqlQuery(preset.query)}
            className="px-2 py-0.5 rounded-lg bg-card border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* SQL Editor & Live Table Split View */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-px bg-border overflow-auto">
        {/* SQL Query Textarea (5 cols) */}
        <div className="lg:col-span-5 bg-card p-3 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-border/60 mb-2">
            <span className="text-[11px] font-bold uppercase text-muted-foreground">SQL Script</span>
            <span className="text-[10px] text-muted-foreground font-mono">ANSI SQL</span>
          </div>
          <textarea
            value={sqlQuery}
            onChange={(e) => setSqlQuery(e.target.value)}
            spellCheck={false}
            placeholder="SELECT * FROM table..."
            className="flex-1 w-full p-3 rounded-xl bg-muted/40 font-mono text-xs text-foreground border border-border resize-none outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Query Results Table (7 cols) */}
        <div className="lg:col-span-7 bg-card p-3 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-border/60 mb-2">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold uppercase text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
                <TableIcon className="w-3.5 h-3.5" />
                Result Set ({resultRows.length} rows)
              </span>
              {executionTime !== null && (
                <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {executionTime} ms
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 rounded-xl bg-background border border-border/70 overflow-auto">
            {queryError ? (
              <div className="p-4 text-xs text-rose-500 font-mono">{queryError}</div>
            ) : resultRows.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">No records returned.</div>
            ) : (
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="bg-muted/60 border-b border-border text-muted-foreground">
                    {columns.map((col) => (
                      <th key={col} className="p-2.5 font-bold uppercase text-[10px]">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {resultRows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-muted/30 transition-colors">
                      {columns.map((col) => (
                        <td key={col} className="p-2.5 text-foreground whitespace-nowrap">
                          {typeof row[col] === "number"
                            ? row[col].toLocaleString()
                            : String(row[col] ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Schema Reference Footer */}
      <div className="px-3 py-2 bg-muted/40 border-t border-border flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground">Available Tables:</span>
          <span className="px-2 py-0.5 rounded bg-card border border-border text-[11px] font-mono">
            customers (id, name, email, country, tier)
          </span>
          <span className="px-2 py-0.5 rounded bg-card border border-border text-[11px] font-mono">
            orders (id, customer_id, product, amount, status)
          </span>
          <span className="px-2 py-0.5 rounded bg-card border border-border text-[11px] font-mono">
            products (id, name, category, stock, unit_price)
          </span>
        </div>
      </div>
    </div>
  );
};
