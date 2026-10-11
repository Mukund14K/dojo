import { Card, Badge, ProgressBar } from "../components/ui"
import { Play, Activity, Shield, Terminal, X, ChevronRight, Info, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "../lib/utils"
import { api, ArenaRun, ArenaResult, Project } from "../lib/api"

export default function Arena() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<string>("")
  const [mode, setMode] = useState<"vulnerable" | "hardened">("vulnerable")
  const [scenarioSource, setScenarioSource] = useState<"predefined" | "ai_generated">("predefined")
  const [variantsRequested, setVariantsRequested] = useState<number>(3)
  const [runs, setRuns] = useState<ArenaRun[]>([])
  const [activeRun, setActiveRun] = useState<ArenaRun | null>(null)
  const [selectedResult, setSelectedResult] = useState<ArenaResult | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [projs, pastRuns] = await Promise.all([
        api.getProjects(),
        api.getArenaRuns()
      ])
      setProjects(projs)
      if (projs.length > 0) setSelectedProject(projs[0].id)
      setRuns(pastRuns)
      if (pastRuns.length > 0) {
        setActiveRun(pastRuns[0])
        if (pastRuns[0].results?.length > 0) {
          setSelectedResult(pastRuns[0].results[0])
        }
      }
    } catch (err) {
      console.error(err)
      setError("Failed to load Arena data")
    }
  }

  const handleExecute = async () => {
    if (isExecuting) return
    setIsExecuting(true)
    setError("")
    try {
      const run = await api.executeArenaRun(selectedProject || null, mode, scenarioSource, variantsRequested)
      setRuns([run, ...runs])
      setActiveRun(run)
      if (run.results?.length > 0) {
        setSelectedResult(run.results[0])
      } else {
        setSelectedResult(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Execution failed")
    } finally {
      setIsExecuting(false)
    }
  }

  const results = activeRun?.results || []
  const breakRate = activeRun ? activeRun.break_rate : 0

  return (
    <div className="flex flex-col gap-6 fade-in h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-dojo-border pb-5 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-semibold text-dojo-text-primary">
              DOJO Arena Execution
            </h1>
            <Badge variant={isExecuting ? "accent" : (activeRun?.status === "Completed" ? "safe" : (activeRun?.status === "Failed" ? "critical" : "neutral"))} className="h-5">
              {isExecuting ? "EXECUTING" : (activeRun?.status || "READY")}
            </Badge>
            {activeRun?.scenario_source === "ai_generated" && (
              <Badge variant="accent" className="h-5 font-mono text-[10px]">
                NEMOTRON SUPER
              </Badge>
            )}
          </div>
          <div className="text-[13px] text-dojo-text-secondary flex flex-wrap items-center gap-2">
             <span>Target: {activeRun?.target || "http://127.0.0.1:8001"}</span>
             <span className="text-dojo-text-tertiary">•</span>
             <span className="font-medium capitalize">Mode: {activeRun?.mode || mode}</span>
             <span className="text-dojo-text-tertiary">•</span>
             <span>Source: <strong className="font-medium text-dojo-text-primary">{activeRun?.scenario_source === "ai_generated" ? "AI-Generated (Nemotron)" : "Predefined"}</strong></span>
             {activeRun?.scenario_source === "ai_generated" && activeRun?.generator_model && (
               <>
                 <span className="text-dojo-text-tertiary">•</span>
                 <span className="font-mono text-xs text-dojo-text-tertiary">{activeRun.generator_model}</span>
               </>
             )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select 
            value={selectedProject} 
            onChange={(e) => setSelectedProject(e.target.value)}
            className="bg-dojo-surface border border-dojo-border rounded text-sm px-2 py-1.5 focus:outline-none"
            disabled={isExecuting}
            title="Target Project"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <select 
            value={mode} 
            onChange={(e) => setMode(e.target.value as any)}
            className="bg-dojo-surface border border-dojo-border rounded text-sm px-2 py-1.5 focus:outline-none"
            disabled={isExecuting}
            title="Execution Mode"
          >
            <option value="vulnerable">Vulnerable Mode</option>
            <option value="hardened">Hardened Mode</option>
          </select>
          <select 
            value={scenarioSource} 
            onChange={(e) => setScenarioSource(e.target.value as any)}
            className="bg-dojo-surface border border-dojo-border rounded text-sm px-2 py-1.5 focus:outline-none font-medium"
            disabled={isExecuting}
            title="Scenario Source"
          >
            <option value="predefined">Predefined Suite</option>
            <option value="ai_generated">AI-Generated (Nemotron)</option>
          </select>
          {scenarioSource === "ai_generated" && (
            <select
              value={variantsRequested}
              onChange={(e) => setVariantsRequested(Number(e.target.value))}
              className="bg-dojo-surface border border-dojo-border rounded text-sm px-2 py-1.5 focus:outline-none font-mono"
              disabled={isExecuting}
              title="Requested AI Candidate Count"
            >
              <option value={1}>1 Candidate</option>
              <option value={2}>2 Candidates</option>
              <option value={3}>3 Candidates</option>
              <option value={4}>4 Candidates</option>
              <option value={5}>5 Candidates</option>
            </select>
          )}
          <button 
            onClick={handleExecute} 
            disabled={isExecuting}
            className="btn-primary flex items-center gap-1.5 disabled:opacity-50"
          >
             {isExecuting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />} 
             {isExecuting ? "Running..." : "Run Test"}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 text-sm text-dojo-threat bg-dojo-threat-muted/30 border border-dojo-threat/30 rounded">
          {error}
        </div>
      )}

      {activeRun?.status === "Failed" && activeRun.error_summary && (
        <div className="p-3 text-sm text-dojo-threat bg-dojo-threat-muted/30 border border-dojo-threat/30 rounded flex items-center justify-between">
          <span><strong>Run Error:</strong> {activeRun.error_summary}</span>
          <Badge variant="critical">FAILED</Badge>
        </div>
      )}

      {/* Metrics */}
      <div className="bg-white border border-dojo-border rounded-lg p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-6 sm:gap-8 flex-wrap">
             <div className="flex flex-col gap-0.5">
               <span className="text-[11px] font-medium text-dojo-text-secondary uppercase">Scenarios</span>
               <span className="text-lg font-mono font-semibold text-dojo-text-primary">
                 {activeRun?.completed_scenarios || 0} <span className="text-xs text-dojo-text-tertiary font-sans">/ {activeRun?.total_scenarios || 0}</span>
               </span>
             </div>
             <div className="w-px h-8 bg-dojo-border"></div>
             <div className="flex flex-col gap-0.5">
               <span className="text-[11px] font-medium text-dojo-text-secondary uppercase">Confirmed Violations</span>
               <span className="text-lg font-mono font-semibold text-dojo-threat">{activeRun?.confirmed_violations || 0}</span>
             </div>
             <div className="w-px h-8 bg-dojo-border"></div>
             <div className="flex flex-col gap-0.5">
               <span className="text-[11px] font-medium text-dojo-text-secondary uppercase">Break Rate</span>
               <span className="text-lg font-mono font-semibold text-dojo-text-primary">{breakRate}%</span>
             </div>
             {activeRun?.scenario_source === "ai_generated" && (
               <>
                 <div className="w-px h-8 bg-dojo-border"></div>
                 <div className="flex flex-col gap-0.5">
                   <span className="text-[11px] font-medium text-dojo-text-secondary uppercase">AI Candidates</span>
                   <span className="text-sm font-mono font-semibold text-dojo-text-primary">
                     <span className="text-dojo-safe">{activeRun.variants_accepted || 0} accepted</span>
                     {activeRun.variants_rejected ? <span className="text-dojo-threat ml-1">/ {activeRun.variants_rejected} rejected</span> : null}
                   </span>
                 </div>
               </>
             )}
          </div>
          
          <div className="hidden md:flex items-center gap-2 bg-dojo-surface border border-dojo-border rounded-md px-3 py-1.5">
            <span className="text-[10px] font-semibold text-dojo-text-secondary uppercase">Pipeline</span>
            <ChevronRight className="w-3 h-3 text-dojo-text-tertiary" />
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-dojo-text-primary">
              {activeRun?.scenario_source === "ai_generated" ? "Nemotron Super" : "Predefined Suite"}
            </div>
            <ChevronRight className="w-3 h-3 text-dojo-text-tertiary" />
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-dojo-text-primary">Target</div>
            <ChevronRight className="w-3 h-3 text-dojo-text-tertiary" />
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-dojo-text-primary">Deterministic Evaluator</div>
          </div>
        </div>
        <ProgressBar progress={activeRun?.total_scenarios ? (activeRun.completed_scenarios / activeRun.total_scenarios) * 100 : 0} variant="accent" className="h-1.5 rounded-full" />
      </div>

      {/* Main Workspace */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-[500px]">
        {/* Left: Feed */}
        <div className="lg:flex-[2] flex flex-col bg-white border border-dojo-border rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-dojo-border bg-dojo-surface/50 flex justify-between items-center">
            <h3 className="text-[13px] font-semibold text-dojo-text-primary flex items-center gap-2">
              <Terminal className="w-4 h-4 text-dojo-text-secondary" />
              Execution Results
            </h3>
            {activeRun && (
              <span className="text-xs text-dojo-text-tertiary font-mono">
                {activeRun.scenario_source === "ai_generated" ? "Generated by Nemotron" : "Predefined Scenarios"}
              </span>
            )}
          </div>
          <div className="flex-1 overflow-auto bg-white">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white border-b border-dojo-border sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-4 py-2.5 text-[11px] uppercase font-semibold text-dojo-text-secondary">ID</th>
                  <th className="px-4 py-2.5 text-[11px] uppercase font-semibold text-dojo-text-secondary">Type</th>
                  <th className="px-4 py-2.5 text-[11px] uppercase font-semibold text-dojo-text-secondary">Category</th>
                  <th className="px-4 py-2.5 text-[11px] uppercase font-semibold text-dojo-text-secondary">Outcome</th>
                  <th className="px-4 py-2.5 text-[11px] uppercase font-semibold text-dojo-text-secondary">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dojo-border text-[13px]">
                {results.map((res) => (
                  <tr
                    key={res.id}
                    onClick={() => setSelectedResult(res)}
                    className={cn(
                      "transition-colors cursor-pointer",
                      selectedResult?.id === res.id ? "bg-dojo-accent/5 border-l-2 border-l-dojo-accent" : "hover:bg-dojo-surface border-l-2 border-l-transparent"
                    )}
                  >
                    <td className="px-4 py-3 text-dojo-text-primary font-mono text-[12px] whitespace-nowrap">{res.scenario_id}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {res.scenario_source === "ai_generated" ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
                          AI-Gen
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-50 text-gray-600 border border-gray-200">
                          Predefined
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-dojo-text-secondary font-medium whitespace-nowrap">{res.scenario_category}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                       <Badge variant={res.is_violation ? "critical" as any : (res.observed_outcome === "blocked" ? "safe" as any : "neutral" as any)}>
                         {res.is_violation ? "VIOLATION" : res.observed_outcome.toUpperCase()}
                       </Badge>
                    </td>
                    <td className="px-4 py-3 text-dojo-text-tertiary text-xs whitespace-nowrap">{res.duration_ms} ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {results.length === 0 && !isExecuting && (
              <div className="flex items-center justify-center h-32 text-sm text-dojo-text-tertiary">
                {activeRun?.status === "Failed" ? "Execution failed. See error above." : "No runs found. Start a new test!"}
              </div>
            )}
          </div>
        </div>

        {/* Right: Inspector */}
        <div className="lg:flex-[1.2] flex flex-col bg-white border border-dojo-border rounded-lg shadow-sm overflow-hidden">
           {selectedResult ? (
             <div className="flex flex-col h-full">
               <div className="px-5 py-3 border-b border-dojo-border bg-dojo-surface/50 flex justify-between items-center shrink-0">
                  <h3 className="text-[13px] font-semibold text-dojo-text-primary">
                    Inspector: <span className="font-mono">{selectedResult.scenario_id}</span>
                  </h3>
                  <Badge variant={selectedResult.is_violation ? "critical" as any : "safe" as any}>
                    {selectedResult.is_violation ? "VIOLATION" : selectedResult.observed_outcome.toUpperCase()}
                  </Badge>
               </div>
               
               <div className="flex-1 overflow-auto p-5 space-y-5">
                 {/* Provenance Block */}
                 <div className="bg-dojo-surface border border-dojo-border rounded-lg p-3 space-y-2 text-xs">
                   <div className="font-semibold text-dojo-text-primary uppercase tracking-wider text-[10px]">
                     Provenance & Generator Provenance
                   </div>
                   <div className="grid grid-cols-2 gap-2 text-dojo-text-secondary">
                     <div>
                       <span className="text-dojo-text-tertiary block text-[10px]">Source:</span>
                       <span className="font-medium text-dojo-text-primary capitalize">{selectedResult.scenario_source || "Predefined"}</span>
                     </div>
                     <div>
                       <span className="text-dojo-text-tertiary block text-[10px]">Parent Scenario:</span>
                       <span className="font-mono">{selectedResult.parent_scenario_id || "None"}</span>
                     </div>
                     {selectedResult.generator_model && (
                       <div className="col-span-2">
                         <span className="text-dojo-text-tertiary block text-[10px]">Generator Model:</span>
                         <span className="font-mono text-[11px] text-dojo-text-primary">{selectedResult.generator_model}</span>
                       </div>
                     )}
                     <div>
                       <span className="text-dojo-text-tertiary block text-[10px]">Validation Status:</span>
                       <span className="font-mono text-dojo-safe">{selectedResult.validation_status || "valid"}</span>
                     </div>
                     <div>
                       <span className="text-dojo-text-tertiary block text-[10px]">Generation Status:</span>
                       <span className="font-mono text-dojo-safe">{selectedResult.generation_status || "success"}</span>
                     </div>
                   </div>
                 </div>

                 <div>
                   <div className="text-[11px] font-semibold text-dojo-text-secondary uppercase tracking-wider mb-2">Description</div>
                   <div className="text-[13px] text-dojo-text-primary">{selectedResult.scenario_description}</div>
                 </div>
                 
                 <div>
                   <div className="text-[11px] font-semibold text-dojo-text-secondary uppercase tracking-wider mb-2">Payload Sent</div>
                   <div className="bg-dojo-surface border border-dojo-border rounded p-3 font-mono text-[12px] text-dojo-text-primary whitespace-pre-wrap">
                     {JSON.stringify(selectedResult.test_request, null, 2)}
                   </div>
                 </div>

                 <div>
                   <div className="text-[11px] font-semibold text-dojo-text-secondary uppercase tracking-wider mb-2">Target Response</div>
                   <div className="bg-white border border-dojo-border rounded p-3 font-mono text-[12px] text-dojo-text-secondary whitespace-pre-wrap max-h-[150px] overflow-auto">
                     {JSON.stringify(selectedResult.target_response, null, 2)}
                   </div>
                 </div>
                 
                 {selectedResult.error_details && (
                   <div>
                     <div className="text-[11px] font-semibold text-dojo-text-secondary uppercase tracking-wider mb-2 text-dojo-threat">Error Details</div>
                     <div className="bg-dojo-threat-muted/30 border border-dojo-threat/30 rounded p-3 text-[12px] text-dojo-threat whitespace-pre-wrap">
                       {selectedResult.error_details}
                     </div>
                   </div>
                 )}
               </div>
             </div>
           ) : (
             <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-dojo-text-secondary">
               <Info className="w-8 h-8 text-dojo-text-tertiary mb-3" />
               <p className="text-[13px]">Select a scenario to view detailed telemetry.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  )
}
