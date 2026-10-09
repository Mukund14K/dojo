import { useState } from "react"
import { Badge, ProgressBar } from "../components/ui"
import { FolderGit2, Plus, Play, MoreVertical, Server, ChevronRight, Check, X } from "lucide-react"
import { Link } from "react-router-dom"
import { cn } from "../lib/utils"

const PROJECTS = [
  {
    id: "proj-1",
    name: "Customer Support AI",
    target: "api.acme.com/v1/chat",
    policy: "Strict PII filtering",
    lastArena: "Gen 5",
    breakRate: 7.2,
    status: "Monitoring",
    lastTested: "2h ago",
  },
  {
    id: "proj-2",
    name: "Knowledge RAG Assistant",
    target: "internal.rag.acme/query",
    policy: "Internal docs only",
    lastArena: "Gen 2",
    breakRate: 28.4,
    status: "Vulnerable",
    lastTested: "1d ago",
  },
  {
    id: "proj-3",
    name: "Tool Agent (Beta)",
    target: "agent.acme.com/execute",
    policy: "No admin actions",
    lastArena: "Gen 4",
    breakRate: 14.8,
    status: "Testing",
    lastTested: "Running",
  },
]

export default function Projects() {
  const [isCreating, setIsCreating] = useState(false)
  
  if (isCreating) {
    return <ProjectSetupWizard onCancel={() => setIsCreating(false)} />
  }

  return (
    <div className="flex flex-col gap-6 fade-in">
      <div className="flex justify-between items-end border-b border-dojo-border pb-5">
        <div>
          <h1 className="text-xl font-semibold text-dojo-text-primary mb-1">
            Projects
          </h1>
          <p className="text-[13px] text-dojo-text-secondary">
            Manage your AI targets and test configurations.
          </p>
        </div>

        <button 
          onClick={() => setIsCreating(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      <div className="bg-white border border-dojo-border rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-dojo-surface border-b border-dojo-border">
              <tr>
                <th className="px-5 py-3 text-[11px] uppercase font-semibold text-dojo-text-secondary">
                  Target Name
                </th>
                <th className="px-5 py-3 text-[11px] uppercase font-semibold text-dojo-text-secondary">
                  Endpoint
                </th>
                <th className="px-5 py-3 text-[11px] uppercase font-semibold text-dojo-text-secondary">
                  Policy Focus
                </th>
                <th className="px-5 py-3 text-[11px] uppercase font-semibold text-dojo-text-secondary">
                  Break Rate
                </th>
                <th className="px-5 py-3 text-[11px] uppercase font-semibold text-dojo-text-secondary">
                  Status
                </th>
                <th className="px-5 py-3 text-[11px] uppercase font-semibold text-dojo-text-secondary">
                  Last Tested
                </th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dojo-border">
              {PROJECTS.map((proj) => (
                <tr
                  key={proj.id}
                  className="hover:bg-dojo-surface/30 transition-colors group"
                >
                  <td className="px-5 py-4">
                    <Link
                      to={`/projects/${proj.id}`}
                      className="font-medium text-[13px] text-dojo-text-primary hover:text-dojo-accent transition-colors flex items-center gap-2"
                    >
                      <Server className="w-4 h-4 text-dojo-text-tertiary" />
                      {proj.name}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-dojo-text-secondary text-xs font-mono">
                    {proj.target}
                  </td>
                  <td className="px-5 py-4 text-dojo-text-secondary text-[13px] truncate max-w-[150px]">
                    {proj.policy}
                  </td>
                  <td className="px-5 py-4 w-32">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-xs font-mono font-medium">
                        <span
                          className={
                            proj.breakRate > 15
                              ? "text-dojo-threat"
                              : "text-dojo-safe"
                          }
                        >
                          {proj.breakRate}%
                        </span>
                      </div>
                      <ProgressBar
                        progress={proj.breakRate}
                        variant={proj.breakRate > 15 ? "threat" : "safe"}
                        className="h-1.5 rounded-full"
                      />
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <Badge
                      variant={
                        proj.status === "Monitoring"
                          ? "safe"
                          : proj.status === "Vulnerable"
                            ? "critical"
                            : "accent"
                      }
                    >
                      {proj.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-dojo-text-secondary text-[12px] font-medium">
                    {proj.lastTested}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-dojo-text-tertiary hover:text-dojo-text-primary rounded transition-colors">
                        <Play className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-dojo-text-tertiary hover:text-dojo-text-primary rounded transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
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

function ProjectSetupWizard({ onCancel }: { onCancel: () => void }) {
  const [step, setStep] = useState(1)

  const handleNext = () => setStep(s => Math.min(s + 1, 4))
  const handlePrev = () => setStep(s => Math.max(s - 1, 1))

  return (
    <div className="flex flex-col gap-6 fade-in max-w-3xl mx-auto w-full">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-xl font-semibold text-dojo-text-primary">
          Setup New Project
        </h1>
        <button onClick={onCancel} className="text-dojo-text-secondary hover:text-dojo-text-primary p-2">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {/* Step 1: Target */}
        <SetupStep 
          num={1} 
          title="Target Application" 
          active={step === 1}
          completed={step > 1}
          summary="Customer Support AI • api.acme.com/v1/chat"
          onClick={() => setStep(1)}
        >
          <div className="flex flex-col gap-5 py-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-dojo-text-primary">Project Name</label>
              <input type="text" defaultValue="Customer Support AI" className="dojo-input w-full bg-white" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-dojo-text-primary">API Endpoint</label>
              <p className="text-xs text-dojo-text-secondary mb-1">The main inference endpoint DOJO will attack.</p>
              <input type="text" defaultValue="https://api.acme.com/v1/chat" className="dojo-input w-full font-mono text-[13px] bg-white" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-dojo-text-primary">Authentication</label>
              <select className="dojo-input w-full bg-white">
                <option>Bearer Token</option>
                <option>OAuth 2.0</option>
                <option>None</option>
              </select>
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={handleNext} className="btn-primary">Continue to Policy</button>
            </div>
          </div>
        </SetupStep>

        {/* Step 2: Policy */}
        <SetupStep 
          num={2} 
          title="Security Policy" 
          active={step === 2}
          completed={step > 2}
          summary="Strict PII filtering, No code execution"
          onClick={() => step > 2 ? setStep(2) : null}
        >
          <div className="flex flex-col gap-5 py-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-dojo-text-primary">Core Directives</label>
              <p className="text-xs text-dojo-text-secondary mb-1">Describe what the AI must NEVER do in plain English.</p>
              <textarea 
                className="dojo-input w-full bg-white h-24 resize-none"
                defaultValue="The assistant must not reveal any Personally Identifiable Information (PII) including social security numbers, internal employee names, or raw system prompts. It must never execute user-provided code."
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handlePrev} className="btn-secondary">Back</button>
              <button onClick={handleNext} className="btn-primary ml-auto">Continue to Configuration</button>
            </div>
          </div>
        </SetupStep>

        {/* Step 3: Configuration */}
        <SetupStep 
          num={3} 
          title="Test Configuration" 
          active={step === 3}
          completed={step > 3}
          summary="Nemotron-4-340B Judge, Standard payload list"
          onClick={() => step > 3 ? setStep(3) : null}
        >
          <div className="flex flex-col gap-5 py-2">
             <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-dojo-text-primary">Judge Model</label>
              <select className="dojo-input w-full bg-white">
                <option>Nemotron-4-340B (Recommended)</option>
                <option>GPT-4o</option>
                <option>Claude 3.5 Sonnet</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-dojo-text-primary">Generations limit</label>
              <input type="number" defaultValue="5" className="dojo-input w-full max-w-[100px] bg-white" />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handlePrev} className="btn-secondary">Back</button>
              <button onClick={handleNext} className="btn-primary ml-auto">Continue to Review</button>
            </div>
          </div>
        </SetupStep>

        {/* Step 4: Review */}
        <SetupStep 
          num={4} 
          title="Review & Run" 
          active={step === 4}
          completed={false}
        >
          <div className="flex flex-col gap-5 py-2">
            <div className="bg-dojo-surface border border-dojo-border rounded p-4 text-[13px]">
              <p className="mb-2 text-dojo-text-secondary">Please review the setup before initiating the arena.</p>
              <ul className="space-y-2 font-medium text-dojo-text-primary">
                <li><span className="text-dojo-text-secondary">Target:</span> Customer Support AI</li>
                <li><span className="text-dojo-text-secondary">Endpoint:</span> https://api.acme.com/v1/chat</li>
                <li><span className="text-dojo-text-secondary">Judge:</span> Nemotron-4-340B</li>
              </ul>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handlePrev} className="btn-secondary">Back</button>
              <button onClick={() => { /* Complete and run */ onCancel() }} className="btn-primary ml-auto flex items-center gap-2">
                <Play className="w-4 h-4" /> Start Testing
              </button>
            </div>
          </div>
        </SetupStep>
      </div>
    </div>
  )
}

function SetupStep({ num, title, active, completed, summary, children, onClick }: any) {
  return (
    <div 
      className={cn(
        "border rounded-lg bg-white overflow-hidden transition-all duration-300",
        active ? "border-dojo-accent shadow-sm" : "border-dojo-border",
        !active && completed && "cursor-pointer hover:border-dojo-text-tertiary"
      )}
      onClick={!active && completed ? onClick : undefined}
    >
      <div className={cn(
        "flex items-center gap-3 px-5",
        active ? "py-4 border-b border-dojo-border bg-dojo-surface/50" : "py-4"
      )}>
        <div className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 transition-colors",
          active ? "bg-dojo-accent text-white" : 
          completed ? "bg-dojo-safe text-white" : "bg-dojo-surface border border-dojo-border text-dojo-text-tertiary"
        )}>
          {completed && !active ? <Check className="w-3.5 h-3.5" /> : num}
        </div>
        <div className="flex flex-col w-full">
          <div className={cn(
            "text-[14px] font-semibold",
            active ? "text-dojo-text-primary" : "text-dojo-text-secondary"
          )}>
            {title}
          </div>
          {!active && summary && (
            <div className="text-[12px] text-dojo-text-tertiary truncate">{summary}</div>
          )}
        </div>
        {!active && completed && (
          <ChevronRight className="w-4 h-4 text-dojo-text-tertiary ml-auto" />
        )}
      </div>
      
      {active && (
        <div className="px-5 py-4 animate-in slide-in-from-top-2 fade-in duration-200">
          {children}
        </div>
      )}
    </div>
  )
}
