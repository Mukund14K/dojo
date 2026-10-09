import { useState } from "react"
import { Badge, ProgressBar } from "../components/ui"
import { Network, ChevronRight, Activity, Cpu, Shield, Filter, Search, ChevronDown, ListTree } from "lucide-react"
import { cn } from "../lib/utils"

const GENERATIONS = [
  {
    gen: 0,
    attacks: 100,
    successful: 41,
    avgFit: 0.32,
    bestFit: 0.88,
  },
  {
    gen: 1,
    attacks: 100,
    successful: 35,
    avgFit: 0.45,
    bestFit: 0.92,
  },
  {
    gen: 2,
    attacks: 100,
    successful: 28,
    avgFit: 0.51,
    bestFit: 0.95,
  },
  {
    gen: 3,
    attacks: 100,
    successful: 19,
    avgFit: 0.62,
    bestFit: 0.97,
  },
  {
    gen: 4,
    attacks: 100,
    successful: 14,
    avgFit: 0.74,
    bestFit: 0.98,
  },
]

const ATTACKS_BY_GEN: Record<number, any[]> = {
  4: [
    { id: "ATK-0482", category: "Prompt Injection", result: "HIT", fit: "0.98", severity: "high", parent: "ATK-0391", mutations: ["Roleplay", "Obfuscation"] },
    { id: "ATK-0485", category: "Context Injection", result: "HIT", fit: "0.96", severity: "critical", parent: "ATK-0391", mutations: ["Context Length", "Encoding"] },
    { id: "ATK-0489", category: "Data Extraction", result: "BLOCKED", fit: "0.64", severity: "neutral", parent: "ATK-0382", mutations: ["Format Change"] },
    { id: "ATK-0491", category: "Jailbreak", result: "HIT", fit: "0.94", severity: "high", parent: "ATK-0395", mutations: ["Logic Flaw"] },
  ]
}

export default function AttackEvolution() {
  const [selectedGen, setSelectedGen] = useState(4)
  const [selectedAttack, setSelectedAttack] = useState<any>(ATTACKS_BY_GEN[4][0])
  const [showLineage, setShowLineage] = useState(false)

  if (showLineage) {
    return <LineageView onBack={() => setShowLineage(false)} />
  }

  return (
    <div className="flex flex-col gap-6 fade-in h-full">
      <div className="flex justify-between items-end border-b border-dojo-border pb-5">
        <div>
          <h1 className="text-xl font-semibold text-dojo-text-primary mb-1">
            Attack Evolution
          </h1>
          <p className="text-[13px] text-dojo-text-secondary">
            Analyze the genetic algorithm's progression and payload mutations over time.
          </p>
        </div>

        <button onClick={() => setShowLineage(true)} className="btn-secondary flex items-center gap-2">
          <Network className="w-4 h-4" /> Explore lineage
        </button>
      </div>

      {/* Horizontal Timeline */}
      <div className="bg-white border border-dojo-border rounded-lg shadow-sm p-4 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-[700px]">
          {GENERATIONS.map((g, i) => (
            <div key={g.gen} className="flex items-center gap-2 flex-1">
              <div
                onClick={() => {
                  setSelectedGen(g.gen)
                  if (ATTACKS_BY_GEN[g.gen]) {
                    setSelectedAttack(ATTACKS_BY_GEN[g.gen][0])
                  } else {
                    setSelectedAttack(null)
                  }
                }}
                className={cn(
                  "flex-1 p-4 rounded-md border transition-all cursor-pointer",
                  selectedGen === g.gen
                    ? "bg-dojo-surface/50 border-dojo-accent shadow-sm"
                    : "bg-white border-dojo-border hover:border-dojo-text-tertiary"
                )}
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="text-[12px] font-bold text-dojo-text-primary uppercase tracking-wider">
                    Generation {g.gen}
                  </div>
                  {g.gen === 4 && <Badge variant="accent">Active</Badge>}
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-dojo-text-secondary font-medium mb-0.5">Attacks</div>
                    <div className="font-mono text-dojo-text-primary font-medium">{g.attacks}</div>
                  </div>
                  <div>
                    <div className="text-dojo-text-secondary font-medium mb-0.5">Violations</div>
                    <div className="font-mono text-dojo-threat font-medium">{g.successful}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-dojo-text-secondary font-medium mb-1 flex justify-between">
                       <span>Avg Fitness</span>
                       <span className="font-mono text-dojo-text-primary">{g.avgFit}</span>
                    </div>
                    <ProgressBar progress={g.avgFit * 100} variant="neutral" className="h-1 rounded-full" />
                  </div>
                </div>
              </div>
              {i < GENERATIONS.length - 1 && (
                <ChevronRight className="w-5 h-5 text-dojo-text-tertiary shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Split Details View */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-[400px]">
         {/* List */}
         <div className="lg:flex-1 flex flex-col bg-white border border-dojo-border rounded-lg shadow-sm overflow-hidden">
           <div className="px-4 py-3 border-b border-dojo-border bg-dojo-surface flex justify-between items-center">
             <h3 className="text-[13px] font-semibold text-dojo-text-primary">
               Gen {selectedGen} Attacks
             </h3>
             <div className="flex gap-2">
               <button className="text-dojo-text-secondary hover:text-dojo-text-primary"><Filter className="w-4 h-4" /></button>
               <button className="text-dojo-text-secondary hover:text-dojo-text-primary"><Search className="w-4 h-4" /></button>
             </div>
           </div>
           <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-white border-b border-dojo-border sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-4 py-2.5 text-[11px] uppercase font-semibold text-dojo-text-secondary">
                      ID
                    </th>
                    <th className="px-4 py-2.5 text-[11px] uppercase font-semibold text-dojo-text-secondary">
                      Category
                    </th>
                    <th className="px-4 py-2.5 text-[11px] uppercase font-semibold text-dojo-text-secondary">
                      Fit
                    </th>
                    <th className="px-4 py-2.5 text-[11px] uppercase font-semibold text-dojo-text-secondary">
                      Result
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dojo-border text-[13px]">
                  {ATTACKS_BY_GEN[selectedGen] ? (
                    ATTACKS_BY_GEN[selectedGen].map((attack: any) => (
                    <tr
                      key={attack.id}
                      onClick={() => setSelectedAttack(attack)}
                      className={cn(
                        "transition-colors cursor-pointer",
                        selectedAttack?.id === attack.id ? "bg-dojo-accent/5 border-l-2 border-l-dojo-accent" : "hover:bg-dojo-surface border-l-2 border-l-transparent"
                      )}
                    >
                      <td className="px-4 py-3 text-dojo-text-primary font-mono text-[12px] whitespace-nowrap">
                        {attack.id}
                      </td>
                      <td className="px-4 py-3 text-dojo-text-secondary font-medium whitespace-nowrap">
                        {attack.category}
                      </td>
                      <td className="px-4 py-3 text-dojo-text-tertiary font-mono text-[12px] whitespace-nowrap">
                        {attack.fit}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                         <Badge variant={attack.result === "HIT" ? attack.severity : "safe"}>
                           {attack.result}
                         </Badge>
                      </td>
                    </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-[13px] text-dojo-text-secondary">
                        Data for Generation {selectedGen} is still processing or unavailable.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
           </div>
         </div>

         {/* Panel */}
         <div className="lg:flex-1 flex flex-col bg-white border border-dojo-border rounded-lg shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-dojo-border bg-dojo-surface flex items-center">
             <h3 className="text-[13px] font-semibold text-dojo-text-primary">
               Attack Profile
             </h3>
           </div>
           
           {selectedAttack ? (
             <div className="flex-1 p-5 overflow-auto space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-[11px] font-semibold text-dojo-text-secondary uppercase tracking-wider mb-1">Target Identity</div>
                    <div className="text-lg font-mono font-bold text-dojo-text-primary">{selectedAttack.id}</div>
                  </div>
                  <Badge variant={selectedAttack.result === "HIT" ? selectedAttack.severity : "safe"}>
                     {selectedAttack.result}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dojo-border">
                   <div>
                     <div className="text-[11px] font-semibold text-dojo-text-secondary uppercase mb-1 flex items-center gap-1.5"><Network className="w-3.5 h-3.5" /> Lineage Parent</div>
                     <div className="font-mono text-[13px] text-dojo-accent cursor-pointer hover:underline">{selectedAttack.parent}</div>
                   </div>
                   <div>
                     <div className="text-[11px] font-semibold text-dojo-text-secondary uppercase mb-1 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> Applied Mutations</div>
                     <div className="flex flex-wrap gap-1.5">
                       {selectedAttack.mutations.map((m: string) => (
                         <span key={m} className="px-2 py-0.5 bg-dojo-surface border border-dojo-border rounded text-[11px] font-medium text-dojo-text-secondary">{m}</span>
                       ))}
                     </div>
                   </div>
                </div>

                <div>
                   <div className="text-[11px] font-semibold text-dojo-text-secondary uppercase tracking-wider mb-2">Payload Strategy</div>
                   <div className="bg-dojo-bg border border-dojo-border rounded p-3 text-[13px] text-dojo-text-secondary leading-relaxed">
                     This attack combined {selectedAttack.mutations.join(" and ")} techniques derived from {selectedAttack.parent} to bypass context filtering parameters.
                   </div>
                </div>
             </div>
           ) : (
             <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-dojo-text-secondary">
               <p className="text-[13px]">Select an attack to view mutation details.</p>
             </div>
           )}
         </div>
      </div>
    </div>
  )
}

function LineageView({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col gap-6 fade-in h-full">
      <div className="flex justify-between items-center border-b border-dojo-border pb-5">
        <div>
          <h1 className="text-xl font-semibold text-dojo-text-primary flex items-center gap-3">
            Lineage Explorer
          </h1>
        </div>
        <button onClick={onBack} className="btn-secondary">
          Close lineage
        </button>
      </div>
      
      <div className="flex-1 bg-white border border-dojo-border rounded-lg shadow-sm flex items-center justify-center min-h-[500px]">
         <div className="text-center">
            <ListTree className="w-12 h-12 text-dojo-text-tertiary mx-auto mb-4" />
            <h3 className="text-lg font-medium text-dojo-text-primary mb-2">Lineage Graph (Expanded View)</h3>
            <p className="text-[13px] text-dojo-text-secondary">This optional view would render a complex parent-child tree mapping the entire attack history.</p>
         </div>
      </div>
    </div>
  )
}
