import { BarChart2, Play, Download, Server } from "lucide-react"

const BENCHMARKS = [
  {
    target: "Support Bot V2",
    before: 41.2,
    after: 7.1,
    vulns: 12,
    patchSuccess: 94,
    time: "14m 12s",
  },
  {
    target: "RAG Assistant",
    before: 28.4,
    after: 3.2,
    vulns: 8,
    patchSuccess: 100,
    time: "23m 45s",
  },
  {
    target: "Tool Agent (Beta)",
    before: 55.6,
    after: 14.8,
    vulns: 19,
    patchSuccess: 82,
    time: "46m 30s",
  },
  {
    target: "Internal API Bot",
    before: 18.2,
    after: 0.0,
    vulns: 3,
    patchSuccess: 100,
    time: "11m 50s",
  },
]

export default function Benchmarks() {
  return (
    <div className="flex flex-col gap-6 fade-in h-full">
      <div className="flex justify-between items-end border-b border-dojo-border pb-5">
        <div>
          <h1 className="text-xl font-semibold text-dojo-text-primary mb-1">
            Cross-Target Benchmarks
          </h1>
          <p className="text-[13px] text-dojo-text-secondary">
            Comparative security analysis and defensibility improvements across all applications.
          </p>
        </div>

        <div className="flex gap-2">
          <button className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Play className="w-4 h-4" /> Run Benchmark
          </button>
        </div>
      </div>

      <div className="bg-white border border-dojo-border rounded-lg shadow-sm overflow-hidden flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white border-b border-dojo-border sticky top-0 z-10">
              <tr>
                <th className="px-5 py-3 text-[11px] uppercase font-semibold text-dojo-text-secondary">
                  Target Identity
                </th>
                <th className="px-5 py-3 text-[11px] uppercase font-semibold text-dojo-text-secondary">
                  Pre-Patch Break Rate
                </th>
                <th className="px-5 py-3 text-[11px] uppercase font-semibold text-dojo-text-secondary">
                  Post-Patch Break Rate
                </th>
                <th className="px-5 py-3 text-[11px] uppercase font-semibold text-dojo-text-secondary">
                  Relative Delta
                </th>
                <th className="px-5 py-3 text-[11px] uppercase font-semibold text-dojo-text-secondary">
                  Vulns
                </th>
                <th className="px-5 py-3 text-[11px] uppercase font-semibold text-dojo-text-secondary">
                  Patch Success
                </th>
                <th className="px-5 py-3 text-[11px] uppercase font-semibold text-dojo-text-secondary text-right">
                  Avg. Time-to-Execute
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dojo-border text-[13px]">
              {BENCHMARKS.map((bench, i) => {
                const improvement = (
                  ((bench.before - bench.after) / bench.before) *
                  100
                ).toFixed(1)

                return (
                  <tr
                    key={i}
                    className="hover:bg-dojo-surface/50 transition-colors"
                  >
                    <td className="px-5 py-4 font-medium text-dojo-text-primary flex items-center gap-2">
                      <Server className="w-4 h-4 text-dojo-text-tertiary" />
                      {bench.target}
                    </td>
                    <td className="px-5 py-4 font-mono text-[12px] text-dojo-text-secondary">
                      {bench.before}%
                    </td>
                    <td className="px-5 py-4 font-mono text-[12px] text-dojo-safe font-semibold">
                      {bench.after}%
                    </td>
                    <td className="px-5 py-4 font-mono text-[12px] text-dojo-text-primary">
                      <span className="text-[11px] font-medium bg-dojo-surface border border-dojo-border px-2 py-0.5 rounded text-dojo-text-secondary">
                        ↓ {improvement}%
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-[12px] text-dojo-text-secondary">
                      {bench.vulns}
                    </td>
                    <td className="px-5 py-4 font-mono text-[12px] text-dojo-text-secondary">
                      {bench.patchSuccess}%
                    </td>
                    <td className="px-5 py-4 font-mono text-[12px] text-dojo-text-tertiary text-right">
                      {bench.time}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
