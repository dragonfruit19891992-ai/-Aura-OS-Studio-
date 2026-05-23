/**
 * The Sovereign Governance Ledger Contracts
 * This defines the strict deterministic structure of architectural intent,
 * constraints, and conflict resolution rules.
 */

export type DecisionType = 'security' | 'data_integrity' | 'auth' | 'runtime_stability' | 'scalability' | 'performance' | 'ux_consistency' | 'styling';
export type Severity = 'advisory' | 'warning' | 'blocking' | 'critical';
export type ValidationStrategy = 'ast_scan' | 'regex' | 'schema_validator' | 'runtime_assertion' | 'lint_rule' | 'manual_review';
export type LifecycleState = 'proposed' | 'experimental' | 'active' | 'deprecated' | 'superseded';
export type GovernanceSource = 'core_manifest' | 'security_layer' | 'runtime_policy' | 'temporary_override' | 'experimental_branch';
export type ResolutionOutcome = 'allow' | 'allow_with_warning' | 'requires_review' | 'soft_block' | 'hard_block';

export interface ArchitecturalDecision {
  // --- 1. Identity ---
  intent_hash: string;       // Unique deterministic ID
  timestamp: number;
  created_from: 'human_decision' | 'ai_recommendation' | 'automated_patch' | 'security_incident' | 'migration';
  author: string;            // e.g., 'JOSEPH_BOUCHARD' or 'GEORGE_CORE'

  // --- 2. Intent ---
  title: string;
  rationale: string;         // The business/technical "Why"
  confidence_score: number;  // 0.0 to 1.0 (Dictates if auto-enforced or needs human review)

  // --- 3. Enforcement & Resolution ---
  decision_type: DecisionType;
  severity: Severity;
  priority_level: number;    // 1 (Security) to 8 (Styling) for autonomous conflict resolution
  enforced_rules: string[];  // Machine-readable constraints
  validation_strategy: ValidationStrategy[]; 

  // --- 4. Authority Lineage ---
  governance_source: GovernanceSource;
  is_override: boolean;
  ttl_expires_at?: number;   // Temporary overrides must have an expiration
  override_reason?: string;
  linked_ticket?: string;    // Required for overrides

  // --- 5. Scope ---
  domain: string;            // e.g., 'SovereignMesh', 'AuthLayer'
  affected_paths: string[];  // Glob patterns e.g., ['/auth/**', '/firestore.rules']

  // --- 6. Lifecycle & Impact ---
  status: LifecycleState;
  rollback_strategy: string; // Step-by-step un-do instructions
  supersedes?: string[];     // Array of intent_hashes this decision actively overwrites
}

export interface ConflictReport {
  winning_rule: string;
  losing_rule: string;
  resolution_reason: string;
}

export interface ResolutionContext {
  targetPaths: string[];         // e.g., ['/src/mesh/family/ledger.ts']
  proposedIntent: string;        // What the AI or human is trying to do
  activeDecisions: ArchitecturalDecision[];
}

export interface GovernanceState {
  resolvedPolicies: ArchitecturalDecision[]; // The final, composed list of rules that survived the cage match
  conflictsDetected: ConflictReport[];       // Log of which rules fought and who won
  enforcementLevel: ResolutionOutcome;       // The highest severity outcome (e.g., 'hard_block')
  driftScore: number;                        // e.g., 0.12 (12% drift from core manifest)
  requiredValidators: ValidationStrategy[];  // The instructions sent to the execution engine
}
