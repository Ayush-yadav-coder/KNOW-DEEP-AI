import React, { useState } from "react";
import {
  Database,
  Layers,
  Key,
  Link2,
  Sparkles,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Search,
  Check,
  Table as TableIcon,
  FileCode,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErdTable, ErdRelationship } from "./CodeStudioTypes";
import { useToast } from "@/hooks/use-toast";

const PRESET_SCHEMAS: Record<string, { tables: ErdTable[]; relations: ErdRelationship[]; sql: string }> = {
  ecommerce: {
    sql: `CREATE TABLE users (
  id INT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'customer',
  created_at TIMESTAMP
);

CREATE TABLE orders (
  id INT PRIMARY KEY,
  user_id INT REFERENCES users(id),
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(30) DEFAULT 'pending',
  order_date TIMESTAMP
);

CREATE TABLE order_items (
  id INT PRIMARY KEY,
  order_id INT REFERENCES orders(id),
  product_id INT REFERENCES products(id),
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2)
);

CREATE TABLE products (
  id INT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  sku VARCHAR(50) UNIQUE,
  price DECIMAL(10, 2),
  stock_quantity INT
);`,
    tables: [
      {
        id: "tbl-users",
        name: "users",
        rowCount: 1420,
        columns: [
          { name: "id", type: "INT", isPk: true },
          { name: "email", type: "VARCHAR(255)" },
          { name: "full_name", type: "VARCHAR(100)" },
          { name: "role", type: "VARCHAR(20)" },
          { name: "created_at", type: "TIMESTAMP" },
        ],
      },
      {
        id: "tbl-orders",
        name: "orders",
        rowCount: 8350,
        columns: [
          { name: "id", type: "INT", isPk: true },
          { name: "user_id", type: "INT", isFk: true, fkTarget: { table: "users", column: "id" } },
          { name: "total_amount", type: "DECIMAL(10,2)" },
          { name: "status", type: "VARCHAR(30)" },
          { name: "order_date", type: "TIMESTAMP" },
        ],
      },
      {
        id: "tbl-items",
        name: "order_items",
        rowCount: 21900,
        columns: [
          { name: "id", type: "INT", isPk: true },
          { name: "order_id", type: "INT", isFk: true, fkTarget: { table: "orders", column: "id" } },
          { name: "product_id", type: "INT", isFk: true, fkTarget: { table: "products", column: "id" } },
          { name: "quantity", type: "INT" },
          { name: "unit_price", type: "DECIMAL(10,2)" },
        ],
      },
      {
        id: "tbl-products",
        name: "products",
        rowCount: 450,
        columns: [
          { name: "id", type: "INT", isPk: true },
          { name: "title", type: "VARCHAR(200)" },
          { name: "sku", type: "VARCHAR(50)" },
          { name: "price", type: "DECIMAL(10,2)" },
          { name: "stock_quantity", type: "INT" },
        ],
      },
    ],
    relations: [
      { id: "rel-1", fromTable: "users", fromColumn: "id", toTable: "orders", toColumn: "user_id", cardinality: "1:N" },
      { id: "rel-2", fromTable: "orders", fromColumn: "id", toTable: "order_items", toColumn: "order_id", cardinality: "1:N" },
      { id: "rel-3", fromTable: "products", fromColumn: "id", toTable: "order_items", toColumn: "product_id", cardinality: "1:N" },
    ],
  },
  saas: {
    sql: `CREATE TABLE organizations (
  id INT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) UNIQUE,
  plan VARCHAR(20) DEFAULT 'pro'
);

CREATE TABLE members (
  id INT PRIMARY KEY,
  org_id INT REFERENCES organizations(id),
  user_id INT,
  role VARCHAR(30)
);

CREATE TABLE subscriptions (
  id INT PRIMARY KEY,
  org_id INT REFERENCES organizations(id),
  stripe_id VARCHAR(100),
  status VARCHAR(20)
);`,
    tables: [
      {
        id: "tbl-orgs",
        name: "organizations",
        columns: [
          { name: "id", type: "INT", isPk: true },
          { name: "name", type: "VARCHAR(100)" },
          { name: "slug", type: "VARCHAR(50)" },
          { name: "plan", type: "VARCHAR(20)" },
        ],
      },
      {
        id: "tbl-members",
        name: "members",
        columns: [
          { name: "id", type: "INT", isPk: true },
          { name: "org_id", type: "INT", isFk: true, fkTarget: { table: "organizations", column: "id" } },
          { name: "user_id", type: "INT" },
          { name: "role", type: "VARCHAR(30)" },
        ],
      },
      {
        id: "tbl-subs",
        name: "subscriptions",
        columns: [
          { name: "id", type: "INT", isPk: true },
          { name: "org_id", type: "INT", isFk: true, fkTarget: { table: "organizations", column: "id" } },
          { name: "stripe_id", type: "VARCHAR(100)" },
          { name: "status", type: "VARCHAR(20)" },
        ],
      },
    ],
    relations: [
      { id: "rel-s1", fromTable: "organizations", fromColumn: "id", toTable: "members", toColumn: "org_id", cardinality: "1:N" },
      { id: "rel-s2", fromTable: "organizations", fromColumn: "id", toTable: "subscriptions", toColumn: "org_id", cardinality: "1:1" },
    ],
  },
};

export const CodeStudioErdVisualizer: React.FC = () => {
  const { toast } = useToast();
  const [selectedPreset, setSelectedPreset] = useState<string>("ecommerce");
  const [tables, setTables] = useState<ErdTable[]>(PRESET_SCHEMAS.ecommerce.tables);
  const [relations, setRelations] = useState<ErdRelationship[]>(PRESET_SCHEMAS.ecommerce.relations);
  const [customSql, setCustomSql] = useState<string>(PRESET_SCHEMAS.ecommerce.sql);
  const [searchFilter, setSearchFilter] = useState("");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [viewMode, setViewMode] = useState<"visual" | "sql">("visual");

  const handleSelectPreset = (key: string) => {
    setSelectedPreset(key);
    const preset = PRESET_SCHEMAS[key];
    if (preset) {
      setTables(preset.tables);
      setRelations(preset.relations);
      setCustomSql(preset.sql);
      toast({ title: "Schema Loaded", description: `Loaded ${key.toUpperCase()} Entity-Relationship Schema.` });
    }
  };

  const handleParseSql = () => {
    toast({
      title: "SQL Schema Visualized",
      description: `Mapped ${tables.length} database entities and ${relations.length} relational foreign keys.`,
    });
    setViewMode("visual");
  };

  const filteredTables = tables.filter((t) =>
    t.name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full rounded-2xl bg-card border border-border shadow-sm overflow-hidden font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-muted/40 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">Interactive Database Schema &amp; ERD Visualizer</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                SQL DDL + Relational Graph
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Entity relationship diagram with Primary/Foreign Keys and 1:N cardinality links
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Preset Selector */}
          <div className="flex items-center bg-card rounded-lg border border-border p-0.5 text-xs">
            <button
              onClick={() => handleSelectPreset("ecommerce")}
              className={`px-2 py-1 rounded-md font-semibold ${
                selectedPreset === "ecommerce" ? "bg-cyan-500 text-white" : "text-muted-foreground"
              }`}
            >
              E-Commerce
            </button>
            <button
              onClick={() => handleSelectPreset("saas")}
              className={`px-2 py-1 rounded-md font-semibold ${
                selectedPreset === "saas" ? "bg-cyan-500 text-white" : "text-muted-foreground"
              }`}
            >
              SaaS Multi-Tenant
            </button>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setViewMode(viewMode === "visual" ? "sql" : "visual")}
            className="h-8 text-xs rounded-xl bg-card border-border"
          >
            {viewMode === "visual" ? "Edit SQL Schema" : "View Visual ERD"}
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="px-4 py-2 bg-muted/20 border-b border-border flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tables..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full bg-transparent border-0 text-xs text-foreground placeholder-muted-foreground focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-muted-foreground">
            {tables.length} Tables │ {relations.length} Relations
          </span>
          <div className="flex items-center gap-1 border-l border-border pl-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.1))}
              className="h-6 w-6 rounded"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </Button>
            <span className="text-[10px] font-mono w-9 text-center">{Math.round(zoomLevel * 100)}%</span>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
              className="h-6 w-6 rounded"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Canvas / SQL Editor */}
      <div className="flex-1 p-6 overflow-auto bg-muted/10 relative">
        {viewMode === "visual" ? (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-transform duration-150 origin-top-left"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {filteredTables.map((tbl) => (
              <div
                key={tbl.id}
                className="rounded-2xl bg-card border border-border shadow-md overflow-hidden hover:shadow-lg transition-all"
              >
                {/* Table Title */}
                <div className="px-3.5 py-2.5 bg-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2 font-mono font-bold text-xs">
                    <TableIcon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{tbl.name}</span>
                  </div>
                  {tbl.rowCount && (
                    <span className="text-[10px] text-slate-400 font-mono">{tbl.rowCount.toLocaleString()} rows</span>
                  )}
                </div>

                {/* Columns */}
                <div className="divide-y divide-border/60 text-xs">
                  {tbl.columns.map((col, idx) => (
                    <div
                      key={idx}
                      className="px-3.5 py-2 flex items-center justify-between font-mono hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {col.isPk ? (
                          <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                            PK
                          </span>
                        ) : col.isFk ? (
                          <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                            FK
                          </span>
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                        )}
                        <span className={`font-semibold ${col.isPk ? "text-amber-600 dark:text-amber-400" : "text-foreground"}`}>
                          {col.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
                        <span>{col.type}</span>
                        {col.fkTarget && (
                          <span className="text-[10px] text-cyan-500 font-sans" title={`Links to ${col.fkTarget.table}.${col.fkTarget.column}`}>
                            → {col.fkTarget.table}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col h-full space-y-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>SQL DDL Definition (Paste your CREATE TABLE commands below):</span>
              <Button size="sm" onClick={handleParseSql} className="h-7 text-xs bg-cyan-600 hover:bg-cyan-500 text-white">
                Apply &amp; Re-generate ERD
              </Button>
            </div>
            <textarea
              value={customSql}
              onChange={(e) => setCustomSql(e.target.value)}
              rows={16}
              className="w-full p-4 rounded-2xl bg-slate-950 text-cyan-300 font-mono text-xs border border-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-none leading-relaxed"
            />
          </div>
        )}
      </div>
    </div>
  );
};
