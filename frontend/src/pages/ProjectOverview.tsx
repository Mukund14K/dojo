import { Card, Badge, ProgressBar } from "../components/ui"
import {
  FolderGit2,
  Play,
  ShieldAlert,
  Activity,
  CheckCircle2,
  Server,
} from "lucide-react"
import { Link, useParams } from "react-router-dom"

export default function ProjectOverview() {
  const { id } = useParams()

  return (
    <div className="flex flex-col gap-8 fade-in">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link
              to="/projects"
              className="text-dojo-text-secondary hover:text-dojo-text-primary text-sm"
            >
              Projects
            </Link>
            <span className="text-dojo-text-secondary text-sm">/</span>
            <span className="text-dojo-text-primary text-sm">
              Customer Support AI
            </span>
          </div>
          <h1 className="text-3xl text-xl font-semibold text-dojo-text-primary mb-2 flex items-center gap-3">
            Customer Support AI
          </h1>
          <div className="flex items-center gap-4 text-sm mt-4">
            <Badge variant="safe">MONITORING</Badge>
            <span className="flex items-center gap-2 text-dojo-text-secondary font-mono text-xs">
              <Server className="w-3 h-3" /> api.acme.com/v1/chat
            </span>
          </div>
        </div>

        <button className="btn-primary flex items-center gap-2 bg-threat-red text-dojo-text-primary border border-threat-red hover:bg-threat-red/80">
          <Play className="w-4 h-4 fill-current" /> Run Arena
        </button>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="items-center text-center py-4 bg-safe-green/5 border-safe-green/20">
          <div className="text-2xl font-display font-bold text-dojo-safe mb-1">
            A-
          </div>
          <div className="text-[10px] uppercase font-mono text-dojo-safe">
            Security Score
          </div>
        </Card>
        <Card className="items-center text-center py-4">
          <div className="text-2xl font-display font-light text-dojo-text-primary mb-1">
            7.2%
          </div>
          <div className="text-[10px] uppercase font-mono text-dojo-text-secondary">
            Break Rate
          </div>
        </Card>
        <Card className="items-center text-center py-4">
          <div className="text-2xl font-display font-light text-dojo-text-primary mb-1">
            2h ago
          </div>
          <div className="text-[10px] uppercase font-mono text-dojo-text-secondary">
            Last Scan
          </div>
        </Card>
        <Card className="items-center text-center py-4">
          <div className="text-2xl font-display font-light text-dojo-warn mb-1">
            2
          </div>
          <div className="text-[10px] uppercase font-mono text-dojo-text-secondary">
            Open Vulns
          </div>
        </Card>
        <Card className="items-center text-center py-4">
          <div className="text-2xl font-display font-light text-dojo-text-primary mb-1">
            94%
          </div>
          <div className="text-[10px] uppercase font-mono text-dojo-text-secondary">
            Patch Success
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Security Posture Before/After */}
        <Card className="lg:col-span-1 border-dojo-border">
          <h3 className="font-semibold text-dojo-text-primary mb-6">
            Security Posture
          </h3>
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center bg-dojo-bg p-4 rounded border border-dojo-border/50">
              <div className="text-xs font-mono text-dojo-text-secondary">
                BEFORE
              </div>
              <div className="text-2xl font-display text-dojo-threat">
                41.2%
              </div>
            </div>

            <div className="flex justify-center -my-2 z-10 relative">
              <div className="bg-dojo-panel px-2 py-1 rounded border border-dojo-border text-[10px] font-mono text-dojo-safe flex items-center gap-1">
                ↓ 82.7% Improvement
              </div>
            </div>

            <div className="flex justify-between items-center bg-safe-green/10 p-4 rounded border border-safe-green/20">
              <div className="text-xs font-mono text-dojo-safe">AFTER</div>
              <div className="text-2xl font-display text-dojo-safe font-bold">
                7.1%
              </div>
            </div>
          </div>
        </Card>

        {/* Attack Coverage */}
        <Card className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-dojo-text-primary">
              Attack Coverage
            </h3>
            <span className="text-xs font-mono text-dojo-text-secondary">
              Total Tests: 2,500
            </span>
          </div>

          <div className="space-y-5">
            <CoverageBar label="Prompt Injection" total={500} success={36} />
            <CoverageBar label="Data Leakage" total={400} success={12} />
            <CoverageBar label="Jailbreak" total={500} success={42} />
            <CoverageBar label="Policy Bypass" total={300} success={5} />
            <CoverageBar label="Tool Misuse" total={400} success={8} />
            <CoverageBar
              label="Context Manipulation"
              total={400}
              success={21}
            />
          </div>
        </Card>
      </div>
    </div>
  )
}

function CoverageBar({
  label,
  total,
  success,
}: {
  label: string
  total: number
  success: number
}) {
  const rate = (success / total) * 100
  const isHigh = rate > 10

  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-dojo-text-primary font-medium">{label}</span>
        <div className="flex gap-4 font-mono text-dojo-text-secondary">
          <span>
            <span className={isHigh ? "text-dojo-warn" : "text-dojo-safe"}>
              {success}
            </span>{" "}
            / {total}
          </span>
          <span className="w-12 text-right">{rate.toFixed(1)}%</span>
        </div>
      </div>
      <div className="w-full h-1.5 bg-dojo-bg rounded-full overflow-hidden border border-dojo-border/50 flex">
        <div
          className="h-full bg-dojo-surface transition-all"
          style={{ width: `${((total - success) / total) * 100}%` }}
        />
        <div
          className={cn(
            "h-full transition-all",
            isHigh ? "bg-threat-orange" : "bg-safe-green/50",
          )}
          style={{ width: `${(success / total) * 100}%` }}
        />
      </div>
    </div>
  )
}

import { cn } from "../lib/utils"
