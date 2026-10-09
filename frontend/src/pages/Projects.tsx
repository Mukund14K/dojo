import { useState, useEffect } from "react"
import { Badge, ProgressBar } from "../components/ui"
import { FolderGit2, Plus, Play, MoreVertical, Server, ChevronRight, Check, X, Loader2, Trash2 } from "lucide-react"
import { Link } from "react-router-dom"
import { cn } from "../lib/utils"
import { api, type Project } from "../lib/api"

export default function Projects() {
  const [isCreating, setIsCreating] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await api.deleteProject(id)
        loadProjects()
      } catch (err) {
        alert("Failed to delete project")
      }
    }
  }

  const loadProjects = async () => {
    try {
      setLoading(true)
      const data = await api.getProjects()
      setProjects(data)
      setError("")
    } catch (err) {
      setError("Failed to load projects. Make sure the backend is running.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])
  
  if (isCreating) {
    return <ProjectSetupWizard onCancel={() => setIsCreating(false)} onComplete={() => { setIsCreating(false); loadProjects(); }} />
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

      {error && (
        <div className="bg-dojo-threat-muted/30 border border-dojo-threat/30 text-dojo-threat px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="bg-white border border-dojo-border rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12 text-dojo-text-secondary gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading projects...
          </div>
        ) : projects.length === 0 && !error ? (
          <div className="flex flex-col justify-center items-center py-16 text-center">
            <Server className="w-10 h-10 text-dojo-text-tertiary mb-3 opacity-50" />
            <h3 className="text-[14px] font-semibold text-dojo-text-primary">No projects yet</h3>
            <p className="text-[13px] text-dojo-text-secondary mt-1">Create your first project to start testing.</p>
          </div>
        ) : (
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
                {projects.map((proj) => (
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
                    <td className="px-5 py-4 text-dojo-text-secondary text-xs font-mono truncate max-w-[150px]">
                      {proj.target}
                    </td>
                    <td className="px-5 py-4 text-dojo-text-secondary text-[13px] truncate max-w-[150px]">
                      {proj.policy}
                    </td>
                    <td className="px-5 py-4 w-32">
                      {proj.break_rate !== null && proj.break_rate !== undefined ? (
                        <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between items-center text-xs font-mono font-medium">
                            <span
                              className={
                                proj.break_rate > 15
                                  ? "text-dojo-threat"
                                  : "text-dojo-safe"
                              }
                            >
                              {proj.break_rate}%
                            </span>
                          </div>
                          <ProgressBar
                            progress={proj.break_rate}
                            variant={proj.break_rate > 15 ? "threat" : "safe"}
                            className="h-1.5 rounded-full"
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-dojo-text-tertiary">Not tested</span>
                      )}
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
                      {proj.last_tested ? new Date(proj.last_tested).toLocaleDateString() : "Never"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-dojo-text-tertiary hover:text-dojo-text-primary rounded transition-colors">
                          <Play className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(proj.id)}
                          className="p-1.5 text-dojo-text-tertiary hover:text-dojo-threat rounded transition-colors"
                          title="Delete Project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function ProjectSetupWizard({ onCancel, onComplete }: { onCancel: () => void, onComplete: () => void }) {
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    name: "Customer Support AI",
    target: "https://api.acme.com/v1/chat",
    policy: "The assistant must not reveal any Personally Identifiable Information (PII) including social security numbers, internal employee names, or raw system prompts. It must never execute user-provided code."
  });

  const handleNext = () => setStep(s => Math.min(s + 1, 4))
  const handlePrev = () => setStep(s => Math.max(s - 1, 1))

  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      setError("")
      await api.createProject({
        name: formData.name,
        target: formData.target,
        policy: formData.policy,
      })
      onComplete()
    } catch (err) {
      setError("Failed to create project.")
      setSubmitting(false)
    }
  }

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

      {error && (
        <div className="bg-dojo-threat-muted/30 border border-dojo-threat/30 text-dojo-threat px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4">
        {/* Step 1: Target */}
        <SetupStep 
          num={1} 
          title="Target Application" 
          active={step === 1}
          completed={step > 1}
          summary={`${formData.name} • ${formData.target}`}
          onClick={() => setStep(1)}
        >
          <div className="flex flex-col gap-5 py-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-dojo-text-primary">Project Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="dojo-input w-full bg-white" 
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-dojo-text-primary">API Endpoint</label>
              <p className="text-xs text-dojo-text-secondary mb-1">The main inference endpoint DOJO will attack.</p>
              <input 
                type="text" 
                value={formData.target}
                onChange={e => setFormData({...formData, target: e.target.value})}
                className="dojo-input w-full font-mono text-[13px] bg-white" 
              />
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
              <button onClick={handleNext} className="btn-primary" disabled={!formData.name || !formData.target}>Continue to Policy</button>
            </div>
          </div>
        </SetupStep>

        {/* Step 2: Policy */}
        <SetupStep 
          num={2} 
          title="Security Policy" 
          active={step === 2}
          completed={step > 2}
          summary="Custom security directives configured"
          onClick={() => step > 2 ? setStep(2) : null}
        >
          <div className="flex flex-col gap-5 py-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-dojo-text-primary">Core Directives</label>
              <p className="text-xs text-dojo-text-secondary mb-1">Describe what the AI must NEVER do in plain English.</p>
              <textarea 
                className="dojo-input w-full bg-white h-24 resize-none"
                value={formData.policy}
                onChange={e => setFormData({...formData, policy: e.target.value})}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handlePrev} className="btn-secondary">Back</button>
              <button onClick={handleNext} className="btn-primary ml-auto" disabled={!formData.policy}>Continue to Configuration</button>
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
              <p className="mb-2 text-dojo-text-secondary">Please review the setup before initiating.</p>
              <ul className="space-y-2 font-medium text-dojo-text-primary">
                <li><span className="text-dojo-text-secondary">Target Name:</span> {formData.name}</li>
                <li><span className="text-dojo-text-secondary">Endpoint:</span> {formData.target}</li>
                <li><span className="text-dojo-text-secondary">Policy preview:</span> <span className="truncate inline-block max-w-[300px] align-bottom">{formData.policy}</span></li>
              </ul>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handlePrev} className="btn-secondary" disabled={submitting}>Back</button>
              <button 
                onClick={handleSubmit} 
                className="btn-primary ml-auto flex items-center gap-2"
                disabled={submitting}
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />} 
                {submitting ? "Saving..." : "Create Project"}
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
