import { Card } from "../components/ui"
import {
  Settings as SettingsIcon,
  Key,
  Cpu,
  Bell,
  Shield,
  User,
} from "lucide-react"

export default function Settings() {
  return (
    <div className="flex flex-col gap-8 fade-in max-w-4xl">
      <div>
        <h1 className="text-3xl text-xl font-semibold text-dojo-text-primary mb-2 flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-dojo-text-secondary" />
          Settings
        </h1>
        <p className="text-dojo-text-secondary text-sm">
          Configure DOJO platform preferences, models, and access.
        </p>
      </div>

      <div className="flex gap-8">
        <aside className="w-48 shrink-0 flex flex-col gap-1">
          <SettingsNav icon={<User />} label="Profile" active />
          <SettingsNav icon={<Key />} label="API Keys" />
          <SettingsNav icon={<Cpu />} label="Models" />
          <SettingsNav icon={<Shield />} label="Security" />
          <SettingsNav icon={<Bell />} label="Notifications" />
        </aside>

        <div className="flex-1 space-y-6">
          <Card>
            <h3 className="font-semibold text-dojo-text-primary mb-6">
              Profile Settings
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-dojo-text-secondary uppercase mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  defaultValue="SecOps Team"
                  className="w-full bg-dojo-bg border border-dojo-border rounded p-2.5 text-sm text-dojo-text-primary focus:outline-none focus:border-brand-light-steel"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-dojo-text-secondary uppercase mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  defaultValue="security@acme.com"
                  className="w-full bg-dojo-bg border border-dojo-border rounded p-2.5 text-sm text-dojo-text-primary focus:outline-none focus:border-brand-light-steel"
                />
              </div>

              <div className="pt-4">
                <button className="btn-primary">Save Changes</button>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-dojo-text-primary mb-6">
              Organization Details
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-dojo-text-secondary uppercase mb-2">
                  Workspace ID
                </label>
                <input
                  type="text"
                  value="ws_9x8y7z6a"
                  disabled
                  className="w-full bg-dojo-bg/50 border border-dojo-border/50 rounded p-2.5 text-sm text-dojo-text-secondary cursor-not-allowed"
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function SettingsNav({
  icon,
  label,
  active,
}: {
  icon: React.ReactNode
  label: string
  active?: boolean
}) {
  return (
    <button
      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-left ${
        active
          ? "bg-dojo-surface text-dojo-text-primary"
          : "text-dojo-text-secondary hover:text-dojo-text-primary hover:bg-dojo-surface/50"
      }`}
    >
      <span className="[&>svg]:w-4 [&>svg]:h-4">{icon}</span>
      {label}
    </button>
  )
}
