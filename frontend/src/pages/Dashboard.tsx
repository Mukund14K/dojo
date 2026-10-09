import { Card, Badge, ProgressBar } from "../components/ui"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import {
  Activity,
  Target,
  ShieldCheck,
  ChevronRight,
  Play,
  ArrowUpRight,
  Bug,
} from "lucide-react"
import { Link } from "react-router-dom"

const chartData = [
  { gen: "G0", rate: 41.2 },
  { gen: "G1", rate: 35.8 },
  { gen: "G2", rate: 28.4 },
  { gen: "G3", rate: 19.1 },
  { gen: "G4", rate: 14.8 },
  { gen: "G5", rate: 12.8 },
]

const RECENT_VULNS = [
  {
    id: "VUL-007",
    severity: "high",
    type: "Prompt Injection",
    target: "Support Bot",
    status: "Open",
    time: "2m ago",
  },
  {
    id: "VUL-008",
    severity: "critical",
    type: "Data Extraction",
    target: "Support Bot",
    status: "Open",
    time: "15m ago",
  },
  {
    id: "VUL-005",
    severity: "warning",
    type: "Policy Bypass",
    target: "RAG Agent",
    status: "Patching",
    time: "1h ago",
  },
  {
    id: "VUL-004",
    severity: "high",
    type: "Context Manipulation",
    target: "RAG Agent",
    status: "Validated",
    time: "3h ago",
  },
]

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-8 fade-in">
      {/* Top Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-dojo-border pb-5">
        <div>
          <h1 className="text-xl font-semibold text-dojo-text-primary mb-1">
            Dashboard
          </h1>
          <p className="text-[13px] text-dojo-text-secondary">
            System overview and active security operations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary flex items-center gap-2">
            Configure
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Play className="w-4 h-4" />
            Run security test
          </button>
        </div>
      </div>

      {/* Metrics Row - 3 items */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col gap-1.5 p-4 rounded-lg bg-white border border-dojo-border shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[12px] font-medium text-dojo-text-secondary">
              Current Break Rate
            </span>
            <Activity className="w-4 h-4 text-dojo-text-tertiary" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-mono font-semibold text-dojo-text-primary">
              12.8<span className="text-lg text-dojo-text-tertiary">%</span>
            </span>
            <span className="text-[12px] font-medium text-dojo-safe flex items-center">
              <ArrowUpRight className="w-3 h-3 mr-0.5 rotate-90" />
              2.0%
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 p-4 rounded-lg bg-white border border-dojo-border shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[12px] font-medium text-dojo-text-secondary">
              High-Severity Vulnerabilities
            </span>
            <Bug className="w-4 h-4 text-dojo-text-tertiary" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-mono font-semibold text-dojo-threat">
              5
            </span>
            <span className="text-[12px] font-medium text-dojo-text-secondary">
              Requires attention
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 p-4 rounded-lg bg-white border border-dojo-border shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[12px] font-medium text-dojo-text-secondary">
              Last Test Status
            </span>
            <ShieldCheck className="w-4 h-4 text-dojo-text-tertiary" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-medium text-dojo-text-primary mt-1.5">
              Completed
            </span>
            <span className="text-[12px] font-medium text-dojo-text-secondary">
              2h ago
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area - 2 Columns (65% / 35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Trend Chart (65%) */}
        <div className="lg:col-span-2 flex flex-col bg-white border border-dojo-border rounded-lg shadow-sm p-5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-semibold text-dojo-text-primary">
              Break Rate Trend
            </h3>
            <select className="bg-dojo-surface border border-dojo-border text-dojo-text-primary rounded text-xs px-2 py-1 focus:outline-none">
              <option>Last 6 Generations</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 5, bottom: 5, left: -20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-dojo-border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="gen"
                  stroke="var(--color-dojo-text-tertiary)"
                  tick={{
                    fill: "var(--color-dojo-text-secondary)",
                    fontSize: 11,
                    fontFamily: "monospace",
                  }}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="var(--color-dojo-text-tertiary)"
                  tick={{
                    fill: "var(--color-dojo-text-secondary)",
                    fontSize: 11,
                    fontFamily: "monospace",
                  }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-dojo-panel)",
                    border: "1px solid var(--color-dojo-border)",
                    borderRadius: "6px",
                    fontSize: "12px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                  }}
                  itemStyle={{
                    color: "var(--color-dojo-text-primary)",
                    fontFamily: "monospace",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="var(--color-dojo-text-primary)"
                  strokeWidth={2}
                  dot={{
                    r: 4,
                    fill: "var(--color-dojo-panel)",
                    stroke: "var(--color-dojo-text-primary)",
                    strokeWidth: 2,
                  }}
                  activeDot={{ r: 6, fill: "var(--color-dojo-accent)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Active Test Summary (35%) */}
        <div className="lg:col-span-1 flex flex-col bg-white border border-dojo-border rounded-lg shadow-sm p-5">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-sm font-semibold text-dojo-text-primary flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-dojo-accent animate-pulse"></span>
              Active Test
            </h3>
            <Badge variant="accent" className="text-[10px]">RUNNING</Badge>
          </div>

          <div className="flex-1 flex flex-col gap-4">
            <div>
              <div className="text-[11px] font-medium text-dojo-text-secondary uppercase tracking-wider mb-1">
                Target
              </div>
              <div className="text-sm font-medium text-dojo-text-primary">
                Support Bot V2
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[11px] font-medium text-dojo-text-secondary uppercase tracking-wider mb-1">
                  Generation
                </div>
                <div className="text-lg font-mono text-dojo-text-primary">
                  4<span className="text-sm text-dojo-text-tertiary">/5</span>
                </div>
              </div>
              <div>
                <div className="text-[11px] font-medium text-dojo-text-secondary uppercase tracking-wider mb-1">
                  Est. Time
                </div>
                <div className="text-lg font-mono text-dojo-text-primary">
                  12m
                </div>
              </div>
            </div>

            <div className="pt-2 mt-auto">
              <div className="flex justify-between text-[12px] mb-2 font-medium">
                <span className="text-dojo-text-secondary">Progress</span>
                <span className="text-dojo-text-primary font-mono">77%</span>
              </div>
              <ProgressBar
                progress={77}
                variant="accent"
                className="h-2 rounded-full bg-dojo-surface"
              />
            </div>

            <Link
              to="/arena"
              className="mt-2 pt-4 border-t border-dojo-border flex items-center justify-between text-[13px] font-medium text-dojo-text-secondary hover:text-dojo-text-primary transition-colors group"
            >
              View live telemetry
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom: Recent Findings Table */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold text-dojo-text-primary">
            Recent Findings
          </h3>
          <Link
            to="/vulnerabilities"
            className="text-[13px] font-medium text-dojo-accent hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="bg-white border border-dojo-border rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-dojo-surface border-b border-dojo-border">
              <tr>
                <th className="px-4 py-3 text-[11px] uppercase font-semibold text-dojo-text-secondary">
                  ID
                </th>
                <th className="px-4 py-3 text-[11px] uppercase font-semibold text-dojo-text-secondary">
                  Severity
                </th>
                <th className="px-4 py-3 text-[11px] uppercase font-semibold text-dojo-text-secondary">
                  Classification
                </th>
                <th className="px-4 py-3 text-[11px] uppercase font-semibold text-dojo-text-secondary">
                  Target
                </th>
                <th className="px-4 py-3 text-[11px] uppercase font-semibold text-dojo-text-secondary">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dojo-border">
              {RECENT_VULNS.map((vuln) => (
                <tr
                  key={vuln.id}
                  className="hover:bg-dojo-surface/50 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-[12px] text-dojo-text-secondary">
                    {vuln.id}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={vuln.severity as any}>
                      {vuln.severity}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-[13px] font-medium text-dojo-text-primary">
                    {vuln.type}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-dojo-text-secondary">
                    {vuln.target}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px] font-medium text-dojo-text-secondary">
                      {vuln.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
