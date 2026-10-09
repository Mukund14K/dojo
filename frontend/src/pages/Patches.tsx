import { useState } from "react"
import { Badge, CodeBlock } from "../components/ui"
import { ShieldCheck, Search, Filter, X, GitMerge, CheckCircle2, Zap, ArrowRight, Activity, AlertTriangle, ExternalLink } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"
import { cn } from "../lib/utils"

const PATCHES = [
  {
    id: "P-042",
    vuln: "Context Injection",
    type: "SYSTEM PROMPT",
    target: "Support Bot",
    status: "Validated",
    breakBaseline: 41.2,
    breakPost: 7.1,
    testSet: "500 standard eval payloads",
    chartData: [
      { gen: "G0", before: 41.2, after: 7.1 },
      { gen: "G1", before: 35.8, after: 7.2 },
      { gen: "G2", before: 28.4, after: 6.8 },
      { gen: "G3", before: 19.1, after: 7.5 },
      { gen: "G4", before: 14.8, after: 7.0 },
    ],
    originalCode: `messages = [
  {"role": "system", "content": SYSTEM_PROMPT},
  {"role": "user", "content": f"Context: {context}\\n\\nUser: {user_input}"}
]`,
    patchedCode: `messages = [
  {"role": "system", "content": SYSTEM_PROMPT},
  {"role": "user", "content": user_input}
]
# Context moved to a secure data boundary via explicit tool-calling`,
    explanation: "Implementing strict role-based message separation prevents the LLM from confusing user context strings with system directives."
  },
  {
    id: "P-043",
    vuln: "Data Extraction",
    type: "INPUT FILTER",
    target: "Support Bot",
    status: "Proposed",
    breakBaseline: 28.4,
    breakPost: null, // Estimate or pending
    testSet: "Est. based on similar models",
    chartData: null,
    originalCode: `def process_query(query):
    return db.execute(query)`,
    patchedCode: `def process_query(query):
    if contains_pii_request(query):
        raise SecurityException()
    return db.execute(query)`,
    explanation: "Adding a pre-execution heuristic filter blocks obvious PII exfiltration attempts before they reach the database layer."
  },
  {
    id: "P-040",
    vuln: "Unauthorized Tool Execution",
    type: "TOOL PERMISSION",
    target: "Tool Agent",
    status: "Validated",
    breakBaseline: 18.4,
    breakPost: 0.2,
    testSet: "200 adversarial permutations",
    chartData: [
      { gen: "G0", before: 18.4, after: 0.2 },
      { gen: "G1", before: 19.1, after: 0.3 },
      { gen: "G2", before: 20.5, after: 0.2 },
      { gen: "G3", before: 21.0, after: 0.0 },
    ],
    originalCode: `def use_tool(tool_name, args):
    return tools[tool_name].execute(args)`,
    patchedCode: `def use_tool(tool_name, args, session):
    if not check_permissions(session.role, tools[tool_name].required_role):
        return "Unauthorized"
    return tools[tool_name].execute(args)`,
    explanation: "Validating user session roles against specific tool requirements prevents privilege escalation via natural language prompts."
  },
]

export default function Patches() {
  const [selectedPatch, setSelectedPatch] = useState<any>(null)

  return (
    <div className="flex flex-col gap-6 fade-in h-full">
      <div className="flex justify-between items-end border-b border-dojo-border pb-5">
        <div>
          <h1 className="text-xl font-semibold text-dojo-text-primary mb-1">
            Hardening & Patches
          </h1>
          <p className="text-[13px] text-dojo-text-secondary">
            Review proposed defensive measures and verify empirical regression data.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-[500px]">
        {/* Main Table Area */}
        <div className={cn(
          "flex flex-col bg-white border border-dojo-border rounded-lg shadow-sm overflow-hidden transition-all duration-300",
          selectedPatch ? "lg:flex-[1.2]" : "lg:flex-1"
        )}>
          <div className="px-5 py-3 border-b border-dojo-border bg-dojo-surface flex justify-between items-center">
            <div className="relative group w-64">
              <Search className="w-4 h-4 text-dojo-text-tertiary absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-dojo-accent transition-colors" />
              <input
                type="text"
                placeholder="Search patches..."
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
                    Patch ID
                  </th>
                  <th className="px-5 py-3 text-[11px] uppercase font-semibold text-dojo-text-secondary">
                    Vulnerability
                  </th>
                  <th className="px-5 py-3 text-[11px] uppercase font-semibold text-dojo-text-secondary">
                    Type
                  </th>
                  <th className="px-5 py-3 text-[11px] uppercase font-semibold text-dojo-text-secondary">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dojo-border text-[13px]">
                {PATCHES.map((patch) => (
                  <tr
                    key={patch.id}
                    onClick={() => setSelectedPatch(patch)}
                    className={cn(
                      "cursor-pointer transition-colors",
                      selectedPatch?.id === patch.id ? "bg-dojo-accent/5 border-l-2 border-l-dojo-accent" : "hover:bg-dojo-surface border-l-2 border-l-transparent"
                    )}
                  >
                    <td className="px-5 py-4 font-mono text-[12px] text-dojo-text-primary whitespace-nowrap">
                      {patch.id}
                    </td>
                    <td className="px-5 py-4 font-medium text-dojo-text-primary">
                      {patch.vuln}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="text-[10px] font-mono text-dojo-text-secondary bg-dojo-surface border border-dojo-border px-2 py-0.5 rounded uppercase tracking-wider">
                        {patch.type}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={cn(
                        "flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider",
                        patch.status === "Validated" ? "text-dojo-safe" : "text-dojo-warn"
                      )}>
                        {patch.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side Panel (Inspector) */}
        {selectedPatch && (
          <div className="lg:flex-[1.8] flex flex-col bg-white border border-dojo-border rounded-lg shadow-sm overflow-hidden animate-in slide-in-from-right-4 fade-in duration-200">
             <div className="px-5 py-4 border-b border-dojo-border bg-dojo-surface/50 flex justify-between items-start shrink-0">
               <div>
                 <div className="text-[11px] font-mono text-dojo-text-tertiary mb-1">{selectedPatch.id} • {selectedPatch.target}</div>
                 <h2 className="text-[16px] font-semibold text-dojo-text-primary leading-tight">
                   Patch: {selectedPatch.vuln}
                 </h2>
               </div>
               <button onClick={() => setSelectedPatch(null)} className="text-dojo-text-secondary hover:text-dojo-text-primary p-1">
                 <X className="w-5 h-5" />
               </button>
             </div>
             
             <div className="flex-1 overflow-auto bg-white">
                {/* Proposed Changes Section */}
                <div className="p-6 border-b border-dojo-border">
                  <h3 className="text-[13px] font-semibold text-dojo-text-primary mb-4 flex items-center gap-2">
                    <GitMerge className="w-4 h-4 text-dojo-text-secondary" /> Proposed Implementation
                  </h3>
                  
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">
                     <div>
                       <div className="text-[11px] uppercase font-semibold text-dojo-text-secondary mb-2">Original Behavior</div>
                       <CodeBlock variant="neutral" code={selectedPatch.originalCode} className="h-[180px]" />
                     </div>
                     <div>
                       <div className="text-[11px] uppercase font-semibold text-dojo-text-secondary mb-2">Proposed Change</div>
                       <CodeBlock variant="safe" code={selectedPatch.patchedCode} className="h-[180px]" />
                     </div>
                  </div>
                  
                  <div className="bg-dojo-surface rounded-md p-4 text-[13px] text-dojo-text-secondary leading-relaxed border border-dojo-border">
                    <span className="font-semibold text-dojo-text-primary">Explanation:</span> {selectedPatch.explanation}
                  </div>
                </div>

                {/* Validation Evidence Section */}
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-[13px] font-semibold text-dojo-text-primary flex items-center gap-2">
                      <Activity className="w-4 h-4 text-dojo-text-secondary" /> Validation Evidence
                    </h3>
                    {selectedPatch.status === "Proposed" && (
                      <button className="btn-primary py-1.5 flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5" /> Validate Patch
                      </button>
                    )}
                  </div>

                  {selectedPatch.status === "Validated" ? (
                    <div className="space-y-6">
                       {/* Metrics Row */}
                       <div className="grid grid-cols-3 gap-4">
                          <div className="bg-white border border-dojo-border rounded-md p-4 shadow-sm">
                            <div className="text-[11px] text-dojo-text-secondary font-medium uppercase tracking-wider mb-1">Baseline Break Rate</div>
                            <div className="text-2xl font-mono text-dojo-text-primary">{selectedPatch.breakBaseline}%</div>
                            <div className="text-[11px] text-dojo-text-tertiary mt-2">Measured ({selectedPatch.testSet})</div>
                          </div>
                          <div className="bg-dojo-safe-muted/20 border border-dojo-safe/30 rounded-md p-4 shadow-sm relative overflow-hidden">
                            <div className="text-[11px] text-dojo-safe/80 font-medium uppercase tracking-wider mb-1">Post-Patch Break Rate</div>
                            <div className="text-2xl font-mono text-dojo-safe font-semibold">{selectedPatch.breakPost}%</div>
                            <div className="text-[11px] text-dojo-safe/60 mt-2">Measured ({selectedPatch.testSet})</div>
                          </div>
                          <div className="bg-white border border-dojo-border rounded-md p-4 shadow-sm flex flex-col justify-center">
                            <div className="text-[11px] text-dojo-text-secondary font-medium uppercase tracking-wider mb-1">Relative Reduction</div>
                            <div className="text-xl font-mono text-dojo-text-primary flex items-center gap-1.5">
                              <ArrowRight className="w-4 h-4 text-dojo-safe rotate-90" />
                              {((1 - (selectedPatch.breakPost / selectedPatch.breakBaseline)) * 100).toFixed(1)}%
                            </div>
                          </div>
                       </div>

                       {/* Chart & Regression Details */}
                       <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                         <div className="xl:col-span-2 bg-white border border-dojo-border rounded-md p-4 shadow-sm">
                            <div className="text-[11px] font-semibold text-dojo-text-secondary uppercase tracking-wider mb-4">Regression Test Chart</div>
                            <div className="h-48 w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={selectedPatch.chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-dojo-border)" vertical={false} />
                                  <XAxis dataKey="gen" stroke="var(--color-dojo-text-tertiary)" tick={{ fill: "var(--color-dojo-text-secondary)", fontSize: 10, fontFamily: "monospace" }} tickLine={false} axisLine={false} dy={5} />
                                  <YAxis stroke="var(--color-dojo-text-tertiary)" tick={{ fill: "var(--color-dojo-text-secondary)", fontSize: 10, fontFamily: "monospace" }} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                                  <Tooltip contentStyle={{ backgroundColor: "var(--color-dojo-panel)", border: "1px solid var(--color-dojo-border)", borderRadius: "4px", fontSize: "11px", fontFamily: "monospace", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }} itemStyle={{ color: "var(--color-dojo-text-primary)" }} />
                                  <Line type="monotone" name="Baseline" dataKey="before" stroke="var(--color-dojo-threat)" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                                  <Line type="monotone" name="Patched" dataKey="after" stroke="var(--color-dojo-safe)" strokeWidth={2} dot={{ r: 3, fill: "var(--color-dojo-panel)", stroke: "var(--color-dojo-safe)", strokeWidth: 2 }} activeDot={{ r: 5, fill: "var(--color-dojo-safe)" }} />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                         </div>
                         <div className="xl:col-span-1 flex flex-col gap-3">
                            <div className="text-[11px] font-semibold text-dojo-text-secondary uppercase tracking-wider mb-1">Regression Summary</div>
                            
                            <div className="flex justify-between items-center p-2.5 rounded bg-dojo-surface border border-dojo-border">
                              <span className="text-[12px] text-dojo-text-primary">Policy compliance</span>
                              <Badge variant="safe"><CheckCircle2 className="w-3 h-3 mr-1 inline-block" /> PASS</Badge>
                            </div>
                            <div className="flex justify-between items-center p-2.5 rounded bg-dojo-surface border border-dojo-border">
                              <span className="text-[12px] text-dojo-text-primary">False positive rate</span>
                              <span className="text-[12px] font-mono text-dojo-text-primary">7.4%</span>
                            </div>
                            
                            <div className="mt-auto pt-4">
                              <button className="text-[12px] font-medium text-dojo-accent hover:underline flex items-center gap-1.5">
                                View {Math.floor((selectedPatch.breakPost / 100) * 500)} remaining successful attacks <ExternalLink className="w-3 h-3" />
                              </button>
                            </div>
                         </div>
                       </div>
                    </div>
                  ) : (
                    <div className="bg-dojo-surface border border-dojo-border border-dashed rounded-md p-8 flex flex-col items-center justify-center text-center">
                      <AlertTriangle className="w-8 h-8 text-dojo-warn mb-3 opacity-80" />
                      <h4 className="text-[14px] font-medium text-dojo-text-primary mb-1">Patch Not Validated</h4>
                      <p className="text-[13px] text-dojo-text-secondary max-w-md">
                         This patch has been proposed based on vulnerability patterns but has not yet been subjected to empirical regression testing. Start validation to measure its actual efficacy.
                      </p>
                      <div className="mt-4 grid grid-cols-2 gap-4 text-left w-full max-w-sm">
                        <div className="bg-white border border-dojo-border rounded p-3 shadow-sm">
                           <div className="text-[10px] text-dojo-text-secondary font-medium uppercase tracking-wider mb-1">Baseline Break Rate</div>
                           <div className="text-lg font-mono text-dojo-text-primary">{selectedPatch.breakBaseline}%</div>
                        </div>
                        <div className="bg-white border border-dojo-border rounded p-3 shadow-sm">
                           <div className="text-[10px] text-dojo-text-secondary font-medium uppercase tracking-wider mb-1">Estimated Post-Patch</div>
                           <div className="text-lg font-mono text-dojo-text-tertiary">~5.0%</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  )
}
