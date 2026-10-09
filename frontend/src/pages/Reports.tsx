import { Badge } from "../components/ui"
import { FileText, Download, ExternalLink, Server } from "lucide-react"

const REPORTS = [
  {
    id: "RPT-2024-03-A",
    project: "Customer Support AI V2",
    date: "Mar 12, 2024",
    attacks: 2500,
    vulns: 12,
    improvement: "82.7%",
    status: "Finalized",
  },
  {
    id: "RPT-2024-02-B",
    project: "RAG Assistant Production",
    date: "Feb 28, 2024",
    attacks: 1000,
    vulns: 8,
    improvement: "88.7%",
    status: "Finalized",
  },
  {
    id: "RPT-2024-02-A",
    project: "Tool Agent (Beta)",
    date: "Feb 15, 2024",
    attacks: 500,
    vulns: 19,
    improvement: "73.3%",
    status: "Draft",
  },
]

export default function Reports() {
  return (
    <div className="flex flex-col gap-6 fade-in max-w-4xl mx-auto w-full h-full">
      <div className="flex justify-between items-end border-b border-dojo-border pb-5">
        <div>
          <h1 className="text-xl font-semibold text-dojo-text-primary mb-1">
            Audit Reports
          </h1>
          <p className="text-[13px] text-dojo-text-secondary">
            Formal compliance evidence and executive security summaries.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {REPORTS.map((report) => (
          <div
            key={report.id}
            className="flex flex-row items-center justify-between p-4 rounded-lg bg-white border border-dojo-border hover:border-dojo-text-tertiary transition-colors shadow-sm group cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-dojo-surface rounded-md border border-dojo-border">
                <FileText className="w-5 h-5 text-dojo-text-secondary group-hover:text-dojo-accent transition-colors" />
              </div>
              <div>
                <h3 className="text-[14px] font-semibold text-dojo-text-primary mb-1 flex items-center gap-2">
                  <Server className="w-3.5 h-3.5 text-dojo-text-tertiary" />{" "}
                  {report.project} Security Audit
                  <Badge variant={report.status === "Finalized" ? "safe" : "neutral"} className="ml-2">
                    {report.status}
                  </Badge>
                </h3>
                <div className="flex items-center gap-2 text-[12px] font-medium text-dojo-text-tertiary">
                  <span className="font-mono">{report.id}</span>
                  <span>•</span>
                  <span>{report.date}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div className="hidden md:flex gap-8 text-[11px] font-medium text-right border-r border-dojo-border pr-8">
                <div>
                  <div className="text-dojo-text-secondary uppercase tracking-wider mb-1">Payloads</div>
                  <div className="font-mono text-[13px] text-dojo-text-primary">{report.attacks}</div>
                </div>
                <div>
                  <div className="text-dojo-text-secondary uppercase tracking-wider mb-1">Vulns</div>
                  <div className="font-mono text-[13px] text-dojo-threat">{report.vulns}</div>
                </div>
                <div>
                  <div className="text-dojo-text-secondary uppercase tracking-wider mb-1">
                    Improvement
                  </div>
                  <div className="font-mono text-[13px] text-dojo-safe">{report.improvement}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 text-dojo-text-secondary hover:text-dojo-text-primary hover:bg-dojo-surface rounded-md transition-colors" title="Download PDF">
                  <Download className="w-4 h-4" />
                </button>
                <button className="p-2 text-dojo-text-secondary hover:text-dojo-text-primary hover:bg-dojo-surface rounded-md transition-colors" title="View Details">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
