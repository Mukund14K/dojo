import { useState } from "react"
import { Badge, CodeBlock } from "../components/ui"
import { Bug, Search, Filter, ShieldAlert, Server, X, GitMerge, AlertTriangle, ShieldCheck } from "lucide-react"
import { cn } from "../lib/utils"
import { Link } from "react-router-dom"

const VULNERABILITIES = [
  {
    id: "VUL-007",
    severity: "critical",
    title: "Customer Data Exposure via Context Injection",
    target: "Support Bot",
    category: "Data Leak",
    attacks: 23,
    seen: "Gen 2",
    status: "Open",
    cause: "The target application treats user-controlled context strings as trusted instructions. It fails to adequately separate the system directive from the user input boundary.",
    impact: "Exposes sensitive PII including email addresses and billing IDs to unauthorized users.",
    patch: `+ messages = [
+   {"role": "system", "content": SYSTEM_PROMPT},
+   {"role": "user", "content": user_input}
+ ]
+ # Context moved to a secure data boundary via explicit 
+ # tool-calling to prevent instruction override.`
  },
  {
    id: "VUL-008",
    severity: "high",
    title: "System Prompt Override",
    target: "Support Bot",
    category: "Prompt Injection",
    attacks: 15,
    seen: "Gen 1",
    status: "Open",
    cause: "Lack of input sanitization allows users to prematurely terminate the prompt structure and insert new directives.",
    impact: "Allows users to manipulate the bot's behavior, potentially leading to unauthorized actions.",
    patch: `+ sanitized_input = escape_system_delimiters(user_input)`
  },
  {
    id: "VUL-005",
    severity: "warning",
    title: "Unauthorized Tool Execution",
    target: "Tool Agent",
    category: "Tool Misuse",
    attacks: 8,
    seen: "Gen 3",
    status: "Patching",
    cause: "Agent executes tools without validating the user's role against the required permissions for that specific tool.",
    impact: "Potential execution of administrative commands by standard users.",
    patch: `+ if not check_permissions(user.role, tool.required_role):
+     return "Unauthorized"`
  },
  {
    id: "VUL-004",
    severity: "critical",
    title: "PII Extraction via Malformed JSON",
    target: "RAG Assistant",
    category: "Data Leak",
    attacks: 41,
    seen: "Gen 0",
    status: "Validated",
    cause: "The RAG pipeline retrieves unfiltered database records and passes them entirely to the LLM context.",
    impact: "Massive exfiltration of user database records.",
    patch: `+ context = filter_pii(db.retrieve(query))`
  },
]

export default function Vulnerabilities() {
  const [selectedVuln, setSelectedVuln] = useState<any>(null)

  return (
    <div className="flex flex-col gap-6 fade-in h-full">
      <div className="flex justify-between items-end border-b border-dojo-border pb-5">
        <div>
          <h1 className="text-xl font-semibold text-dojo-text-primary mb-1">
            Vulnerabilities
          </h1>
          <p className="text-[13px] text-dojo-text-secondary">
            Discovered weaknesses, root causes, and generated patches.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-[500px]">
        {/* Main Table Area */}
        <div className={cn(
          "flex flex-col bg-white border border-dojo-border rounded-lg shadow-sm overflow-hidden transition-all duration-300",
          selectedVuln ? "lg:flex-[1.5]" : "lg:flex-1"
        )}>
          <div className="px-5 py-3 border-b border-dojo-border bg-dojo-surface flex justify-between items-center">
            <div className="relative group w-64">
              <Search className="w-4 h-4 text-dojo-text-tertiary absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-dojo-accent transition-colors" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-9 pr-4 py-1.5 bg-white border border-dojo-border rounded text-[13px] text-dojo-text-primary focus:outline-none focus:border-dojo-accent transition-colors shadow-sm"
              />
            </div>
            <button className="btn-secondary py-1.5 px-3 text-[12px] flex items-center gap-2">
              <Filter className="w-3.5 h-3.5" /> Filter
            </button>
          </div>

          <div className="flex-1 overflow-x-auto bg-white">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white border-b border-dojo-border sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-5 py-3 text-[11px] uppercase font-semibold text-dojo-text-secondary">
                    Severity
                  </th>
                  <th className="px-5 py-3 text-[11px] uppercase font-semibold text-dojo-text-secondary">
                    Vulnerability
                  </th>
                  <th className="px-5 py-3 text-[11px] uppercase font-semibold text-dojo-text-secondary">
                    Target
                  </th>
                  <th className="px-5 py-3 text-[11px] uppercase font-semibold text-dojo-text-secondary">
                    Evidence Count
                  </th>
                  <th className="px-5 py-3 text-[11px] uppercase font-semibold text-dojo-text-secondary">
                    Status
                  </th>
                  <th className="px-5 py-3 text-[11px] uppercase font-semibold text-dojo-text-secondary text-right">
                    Last Seen
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dojo-border text-[13px]">
                {VULNERABILITIES.map((vuln) => (
                  <tr
                    key={vuln.id}
                    onClick={() => setSelectedVuln(vuln)}
                    className={cn(
                      "cursor-pointer transition-colors",
                      selectedVuln?.id === vuln.id ? "bg-dojo-accent/5 border-l-2 border-l-dojo-accent" : "hover:bg-dojo-surface border-l-2 border-l-transparent"
                    )}
                  >
                    <td className="px-5 py-4 whitespace-nowrap">
                      <Badge variant={vuln.severity as any}>
                        {vuln.severity}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 font-medium text-dojo-text-primary max-w-[200px] truncate" title={vuln.title}>
                      {vuln.title}
                    </td>
                    <td className="px-5 py-4 text-dojo-text-secondary whitespace-nowrap">
                      {vuln.target}
                    </td>
                    <td className="px-5 py-4 font-mono text-dojo-text-secondary text-[12px] whitespace-nowrap">
                      {vuln.attacks}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="text-[12px] font-medium text-dojo-text-secondary">
                        {vuln.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-[12px] text-dojo-text-tertiary text-right whitespace-nowrap">
                      {vuln.seen}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side Panel (Inspector) */}
        {selectedVuln && (
          <div className="lg:flex-1 flex flex-col bg-white border border-dojo-border rounded-lg shadow-sm overflow-hidden animate-in slide-in-from-right-4 fade-in duration-200">
             <div className="px-5 py-4 border-b border-dojo-border bg-dojo-surface/50 flex justify-between items-start shrink-0">
               <div>
                 <div className="text-[11px] font-mono text-dojo-text-tertiary mb-1">{selectedVuln.id}</div>
                 <h2 className="text-[15px] font-semibold text-dojo-text-primary leading-tight pr-4">
                   {selectedVuln.title}
                 </h2>
               </div>
               <button onClick={() => setSelectedVuln(null)} className="text-dojo-text-secondary hover:text-dojo-text-primary p-1">
                 <X className="w-5 h-5" />
               </button>
             </div>
             
             <div className="flex-1 overflow-auto p-6 space-y-8 bg-white">
                {/* Root Cause */}
                <div>
                   <h3 className="text-[11px] font-semibold text-dojo-text-secondary uppercase tracking-wider mb-3 flex items-center gap-2">
                     <AlertTriangle className="w-4 h-4 text-dojo-warn" /> Root Cause
                   </h3>
                   <div className="bg-dojo-warn-muted/50 border border-dojo-warn/20 rounded-md p-4 text-[13px] text-dojo-text-primary leading-relaxed">
                     {selectedVuln.cause}
                   </div>
                </div>

                {/* Impact */}
                <div>
                   <h3 className="text-[11px] font-semibold text-dojo-text-secondary uppercase tracking-wider mb-3 flex items-center gap-2">
                     <ShieldAlert className="w-4 h-4 text-dojo-threat" /> Business Impact
                   </h3>
                   <div className="text-[13px] text-dojo-text-secondary leading-relaxed">
                     {selectedVuln.impact}
                   </div>
                </div>

                {/* Supporting Attacks Summary */}
                <div>
                   <h3 className="text-[11px] font-semibold text-dojo-text-secondary uppercase tracking-wider mb-3 flex items-center gap-2">
                     <Bug className="w-4 h-4" /> Supporting Evidence
                   </h3>
                   <div className="bg-dojo-surface border border-dojo-border rounded-md p-4 flex justify-between items-center">
                     <div>
                       <div className="text-[12px] text-dojo-text-primary font-medium">Derived from {selectedVuln.attacks} successful hits.</div>
                       <div className="text-[12px] text-dojo-text-secondary">Primary vector: {selectedVuln.category}</div>
                     </div>
                     <button className="text-[12px] font-medium text-dojo-accent hover:underline">
                       View traces
                     </button>
                   </div>
                </div>

                {/* Recommended Patch */}
                <div>
                   <div className="flex justify-between items-center mb-3">
                     <h3 className="text-[11px] font-semibold text-dojo-text-secondary uppercase tracking-wider flex items-center gap-2">
                       <ShieldCheck className="w-4 h-4 text-dojo-safe" /> Recommended Patch
                     </h3>
                   </div>
                   <div className="border border-dojo-safe/30 rounded-md overflow-hidden bg-white">
                     <div className="px-4 py-2 bg-dojo-safe-muted flex justify-between items-center border-b border-dojo-safe/30">
                       <span className="text-[11px] font-mono text-dojo-text-secondary">router.py</span>
                       <Badge variant="safe">Ready</Badge>
                     </div>
                     <CodeBlock
                       variant="neutral"
                       className="border-none rounded-none"
                       code={selectedVuln.patch}
                     />
                   </div>
                </div>
                
                <div className="pt-2">
                  <Link
                    to={`/patches/${selectedVuln.id}/validation`}
                    className="btn-primary w-full flex items-center justify-center gap-2 bg-dojo-safe text-white hover:bg-dojo-safe/90"
                  >
                    <GitMerge className="w-4 h-4" /> Start Patch Validation
                  </Link>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  )
}
