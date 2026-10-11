const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

export interface Project {
  id: string;
  name: string;
  description?: string;
  target: string;
  policy: string;
  last_arena?: string;
  break_rate?: number;
  status: string;
  last_tested?: string;
  created_at: string;
  updated_at: string;
}

export interface ArenaResult {
  id: string;
  scenario_id: string;
  scenario_category: string;
  scenario_description: string;
  test_request: any;
  target_response: any;
  expected_outcome: string;
  observed_outcome: string;
  is_violation: boolean;
  is_vulnerability: boolean;
  duration_ms: number;
  error_details: string;
  scenario_source?: string;
  parent_scenario_id?: string;
  generator_model?: string;
  generation_status?: string;
  validation_status?: string;
}

export interface ArenaRun {
  id: string;
  project_name?: string;
  target: string;
  mode: string;
  status: string;
  total_scenarios: number;
  completed_scenarios: number;
  confirmed_violations: number;
  break_rate: number;
  error_summary: string;
  scenario_source?: string;
  generator_model?: string;
  generation_status?: string;
  variants_requested?: number;
  variants_accepted?: number;
  variants_rejected?: number;
  started_at: string;
  completed_at: string;
  results: ArenaResult[];
}

export const api = {
  async getProjects(): Promise<Project[]> {
    const res = await fetch(`${API_BASE}/projects/`);
    if (!res.ok) throw new Error("Failed to fetch projects");
    return res.json();
  },
  
  async createProject(data: Partial<Project>): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create project");
    return res.json();
  },
  
  async deleteProject(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/projects/${id}/`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete project");
  },

  async executeArenaRun(
    projectId: string | null, 
    mode: string, 
    scenarioSource: "predefined" | "ai_generated" = "predefined",
    variantsRequested: number = 3
  ): Promise<ArenaRun> {
    const res = await fetch(`${API_BASE}/arena-runs/execute/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        project_id: projectId, 
        mode,
        scenario_source: scenarioSource,
        variants_requested: variantsRequested
      }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(errData?.error || "Failed to execute arena run");
    }
    return res.json();
  },
  
  async getArenaRuns(): Promise<ArenaRun[]> {
    const res = await fetch(`${API_BASE}/arena-runs/`);
    if (!res.ok) throw new Error("Failed to fetch arena runs");
    return res.json();
  }
};
