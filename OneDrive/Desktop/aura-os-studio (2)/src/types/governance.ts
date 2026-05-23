/**
 * SOVEREIGN GOVERNANCE LEDGER - The "Why" Layer
 * Architectural decisions become enforceable, queryable, deterministic policy
 * Not passive documentation — active governance intelligence
 */

// ─── DECISION CATEGORIZATION ─────────────────────────────────────────────────

export type DecisionType = 
  | 'security'
  | 'data_integrity'
  | 'auth'
  | 'runtime_stability'
  | 'scalability'
  | 'performance'
  | 'ux_consistency'
  | 'styling';

export type Severity = 
  | 'advisory'
  | 'warning'
  | 'blocking'
  | 'critical';

export type LifecycleState = 
  | 'proposed'
  | 'experimental'
  | 'active'
  | 'deprecated'
  | 'superseded';

export type ValidationStrategy = 
  | 'ast_scan'
  | 'regex'
  | 'schema_validator'
  | 'runtime_assertion'
  | 'lint_rule'
  | 'manual_review';

export type GovernanceSource = 
  | 'core_manifest'
  | 'security_layer'
  | 'runtime_policy'
  | 'temporary_override'
  | 'experimental_branch';

export type OverrideType = 
  | 'emergency_hotfix'
  | 'experimental'
  | 'migration_bridge'
  | 'performance_exception'
  | 'developer_bypass';

export type ResolutionOutcome = 
  | 'allow'
  | 'allow_with_warning'
  | 'requires_review'
  | 'soft_block'
  | 'hard_block'
  | 'superseded';

// ─── CORE SCHEMAS ───────────────────────────────────────────────────────────

/**
 * The master interface: Architectural Decision
 * All 5 layers: Identity, Intent, Enforcement, Scope, Lifecycle
 */
export interface ArchitecturalDecision {
  // ── 1. IDENTITY ──
  intent_hash: string;                    // Unique deterministic ID
  timestamp: number;                      // When decision was made (epoch ms)
  created_from: 'human_decision' | 'ai_recommendation' | 'automated_patch' | 'security_incident' | 'migration';
  author: string;                         // e.g., 'JOSEPH_BOUCHARD', 'SOVEREIGN_AGENT'
  
  // ── 2. INTENT ──
  title: string;                          // Human-readable decision name
  rationale: string;                      // The business/technical "Why"
  confidence_score: number;               // 0.0 to 1.0 (determines if auto-enforced or needs review)
  
  // ── 3. ENFORCEMENT & CONFLICT RESOLUTION ──
  decision_type: DecisionType;
  severity: Severity;
  priority_level: number;                 // 1 (Security) to 8 (Styling) — used for autonomous conflict resolution
  enforced_rules: string[];               // Machine-readable constraints
  validation_strategy: ValidationStrategy[];
  
  // ── 4. SCOPE ──
  domain: string;                         // e.g., 'SovereignMesh', 'AuthLayer', 'PortalDevice'
  affected_paths: string[];               // Glob patterns: ['/auth/**', '/firestore.rules', '/mesh/family/**']
  
  // ── 5. LIFECYCLE & IMPACT ──
  status: LifecycleState;
  rollback_strategy: string;              // Step-by-step undo instructions
  supersedes?: string[];                  // Array of intent_hashes this actively overwrites
  
  // ── AUTHORITY LINEAGE ──
  governance_source: GovernanceSource;    // Where this rule came from
  is_override: boolean;                   // Is this an exception/override?
  ttl_expires_at?: number;                // Temporary overrides must expire
  
  // ── GOVERNANCE DEBT TRACKING ──
  linked_review_ticket?: string;          // Architecture review issue/ticket ID
  mitigation?: string;                    // Temporary safety mechanism if override
}

/**
 * Override lineage — every exception creates governance debt
 */
export interface GovernanceOverride {
  override_id: string;
  decision_id: string;                    // Which decision is being bypassed
  reason: string;                         // Why was rule broken
  approver: string;                       // Who authorized this
  ttl_expires_at: number;                 // Hard expiration
  override_type: OverrideType;
  rollback_strategy: string;
  created_at: number;
  
  // Governance debt penalty
  drift_penalty: number;                  // How much this increases drift (0.0 to 1.0)
}

/**
 * Conflict report — when two rules fight
 */
export interface ConflictReport {
  conflicting_rules: string[];            // Array of intent_hashes
  resolution_outcome: ResolutionOutcome;
  winning_rule?: string;                  // Which rule won (if applicable)
  reason: string;                         // Why this resolution was chosen
  escalation_required: boolean;           // Does this need human review?
  timestamp: number;
}

/**
 * The resolved governance state after conflict arbitration
 */
export interface GovernanceState {
  resolvedPolicies: ArchitecturalDecision[];
  conflictsDetected: ConflictReport[];
  enforcementLevel: ResolutionOutcome;    // Highest severity outcome
  driftScore: number;                     // 0.0 to 1.0 (how far from core intent)
  requiredValidators: ValidationStrategy[];
  governanceHealth: GovernanceHealth;
}

/**
 * Governance health scoring
 */
export interface GovernanceHealth {
  score: number;                          // 0 (broken) to 100 (perfect)
  active_overrides: number;
  expired_overrides: number;
  suppressed_warnings: number;
  unreviewed_exceptions: number;
  security_exceptions: number;            // Critical alert if > 0
  core_manifest_divergence: number;       // Percentage drift
  last_audit: number;
}

/**
 * Intent drift detection — architectural decay warning system
 */
export interface IntentDriftAnalysis {
  current_drift_percentage: number;       // e.g., 37.2%
  core_manifest_health: number;           // How well is original architecture preserved
  override_accumulation: number;          // How many temporary exceptions exist
  decay_factor: number;                   // Rate of drift acceleration
  threshold_exceeded: boolean;
  recommended_action: string;             // e.g., "Strategic Refactor Required"
  
  // Detailed breakdown
  drift_by_category: {
    active_overrides: number;
    expired_unreviewed: number;
    schema_divergence: number;
    dependency_creep: number;
    coupling_increase: number;
  };
}

/**
 * Resolution context — what changed and why
 */
export interface ResolutionContext {
  targetPaths: string[];                  // Files/systems being modified
  proposedIntent: string;                 // What's being attempted
  activeDecisions: ArchitecturalDecision[];
  changedFiles?: string[];
  runtimeContext?: Record<string, any>;
}

/**
 * Governance event — observable state change
 */
export type GovernanceEventType = 
  | 'OVERRIDE_CREATED'
  | 'RULE_SUPERSEDED'
  | 'DRIFT_THRESHOLD_EXCEEDED'
  | 'SECURITY_POLICY_BLOCKED'
  | 'TEMP_OVERRIDE_EXPIRED'
  | 'ARCHITECTURE_REVIEW_REQUIRED'
  | 'CONFLICT_DETECTED'
  | 'VALIDATION_FAILED'
  | 'DECISION_ACTIVATED'
  | 'DECISION_DEPRECATED';

export interface GovernanceEvent {
  event_id: string;
  event_type: GovernanceEventType;
  timestamp: number;
  decision_id?: string;
  related_decisions?: string[];
  data: Record<string, any>;
  severity: Severity;
}

// ─── PRIORITY HIERARCHY (Used for Autonomous Conflict Resolution) ────────────
// Lower number = higher priority

export const PRIORITY_HIERARCHY: Record<DecisionType, number> = {
  'security': 1,
  'data_integrity': 2,
  'auth': 3,
  'runtime_stability': 4,
  'scalability': 5,
  'performance': 6,
  'ux_consistency': 7,
  'styling': 8,
};

// ─── CONFLICT RESOLUTION ORDER (Used by Governance Kernel) ──────────────────

export const CONFLICT_RESOLUTION_STEPS = [
  'severity',                 // critical > blocking > warning > advisory
  'priority_level',           // 1-8 hierarchy
  'governance_source',        // core_manifest > security_layer > runtime_policy > experimental
  'status',                   // active > proposed > experimental > deprecated
  'timestamp',                // newer wins (evolution)
  'confidence_score',         // higher confidence wins
];

// ─── VALIDATION STRATEGIES (How rules are enforced) ──────────────────────────

export const VALIDATION_STRATEGY_EXECUTORS: Record<ValidationStrategy, string> = {
  'ast_scan': 'Run Abstract Syntax Tree analysis',
  'regex': 'Apply regex pattern matching',
  'schema_validator': 'Validate against schema definition',
  'runtime_assertion': 'Check at runtime execution',
  'lint_rule': 'Run linter with custom rules',
  'manual_review': 'Require human review before proceeding',
};

// ─── SEVERITY RANKINGS (Determines enforcement) ──────────────────────────────

export const SEVERITY_RANKINGS: Record<Severity, number> = {
  'advisory': 1,
  'warning': 2,
  'blocking': 3,
  'critical': 4,
};

// ─── GOVERNANCE SOURCE AUTHORITY (For conflict resolution) ──────────────────

export const GOVERNANCE_SOURCE_AUTHORITY: Record<GovernanceSource, number> = {
  'core_manifest': 100,
  'security_layer': 90,
  'runtime_policy': 70,
  'temporary_override': 40,
  'experimental_branch': 10,
};
