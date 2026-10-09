import { Link } from "react-router-dom"
import {
  Swords,
  ArrowRight,
  BrainCircuit,
  ShieldCheck,
  Activity,
  Terminal,
  ShieldAlert,
} from "lucide-react"
import { cn } from "../lib/utils"

export default function Landing() {
  return (
    <div className="min-h-screen bg-dojo-bg text-dojo-text-primary selection:bg-dojo-accent-muted selection:text-dojo-text-primary font-sans overflow-x-hidden">
      {/* Navigation */}
      <nav className="border-b border-dojo-border bg-dojo-panel sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 text-dojo-text-primary">
            <Swords className="w-5 h-5 text-dojo-accent" />
            <span className="font-bold tracking-tighter text-lg">
              DOJO
            </span>
          </div>
          <div className="flex items-center gap-8 text-sm font-bold">
            <a
              href="#features"
              className="text-dojo-text-secondary hover:text-dojo-text-primary transition-colors"
            >
              Features
            </a>
            <a
              href="#models"
              className="text-dojo-text-secondary hover:text-dojo-text-primary transition-colors"
            >
              Architecture
            </a>
            <Link
              to="/dashboard"
              className="btn-primary"
            >
              Enter the Dojo
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-20 px-6 relative bg-white">
        <div className="max-w-4xl mx-auto text-center relative z-10">


          <h1 className="text-5xl md:text-7xl font-bold text-dojo-text-primary tracking-tight mb-6 leading-tight">
            Break your AI before <br />
            <span className="text-dojo-accent">
              attackers do.
            </span>
          </h1>

          <p className="text-lg text-dojo-text-secondary mb-10 max-w-2xl mx-auto leading-relaxed">
            Autonomous adversarial testing that evolves attacks, discovers
            vulnerabilities, generates defenses, and proves whether your AI
            actually became safer.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/dashboard"
              className="btn-primary px-6 py-3 text-base flex items-center gap-2"
            >
              Enter the Dojo <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/benchmarks"
              className="btn-secondary px-6 py-3 text-base flex items-center gap-2"
            >
              <Activity className="w-5 h-5" /> View Benchmarks
            </Link>
          </div>
        </div>

        {/* Hero Pipeline Visualization */}
        <div className="max-w-5xl mx-auto mt-20">
          <div className="flex flex-wrap justify-center items-center gap-4 text-xs font-semibold tracking-widest text-dojo-text-secondary uppercase">
            <PipelineStep
              text="ATTACK"
              active
            />
            <ArrowRight className="w-4 h-4 text-dojo-text-tertiary hidden md:block" />
            <PipelineStep
              text="EVOLVE"
            />
            <ArrowRight className="w-4 h-4 text-dojo-text-tertiary hidden md:block" />
            <PipelineStep
              text="DISCOVER"
            />
            <ArrowRight className="w-4 h-4 text-dojo-text-tertiary hidden md:block" />
            <PipelineStep
              text="PATCH"
            />
            <ArrowRight className="w-4 h-4 text-dojo-text-tertiary hidden md:block" />
            <PipelineStep
              text="RE-TEST"
            />
            <ArrowRight className="w-4 h-4 text-dojo-text-tertiary hidden md:block" />
            <PipelineStep
              text="PROVE"
            />
          </div>
        </div>
      </section>

      {/* Proof Section */}
      <section className="py-20 px-6 bg-dojo-bg border-t border-dojo-border">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-dojo-text-primary mb-6">
            Security improvement you can measure.
          </h2>
          <p className="text-dojo-text-secondary mb-10 max-w-xl mx-auto">
            Stop guessing if your AI is secure. DOJO provides mathematical proof
            of hardening by re-running the exact evolutionary attack suite
            against your patched application.
          </p>

          <div className="p-8 bg-white border border-dojo-border rounded-lg shadow-sm flex flex-col md:flex-row items-center justify-center gap-12 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-[11px] font-semibold text-dojo-text-secondary mb-2 uppercase tracking-wider">
                Before DOJO
              </div>
              <div className="text-5xl font-light font-mono text-dojo-threat">
                41.2%
              </div>
              <div className="text-[13px] text-dojo-text-secondary mt-2">
                Break Rate
              </div>
            </div>

            <ArrowRight className="w-6 h-6 text-dojo-text-tertiary hidden md:block" />

            <div className="text-center">
              <div className="text-[11px] font-semibold text-dojo-text-secondary mb-2 uppercase tracking-wider">
                After DOJO
              </div>
              <div className="text-5xl font-bold font-mono text-dojo-safe">
                7.1%
              </div>
              <div className="text-[13px] text-dojo-text-secondary mt-2">
                Break Rate
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-dojo-border text-center text-[12px] text-dojo-text-secondary bg-white">
        <div className="flex justify-center items-center gap-2 mb-2">
          <Swords className="w-4 h-4 text-dojo-text-secondary" /> DOJO Security
        </div>
        <p>© 2024 DOJO AI Security Evolution Arena. All rights reserved.</p>
      </footer>
    </div>
  )
}

function PipelineStep({
  text,
  active,
}: {
  text: string
  active?: boolean
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors",
        active
          ? "bg-white border border-dojo-border text-dojo-text-primary shadow-sm"
          : "text-dojo-text-secondary",
      )}
    >
      {text}
    </div>
  )
}
