/**
 * GOVERNANCE RESOLUTION KERNEL
 * 
 * The deterministic policy engine that runs when code is touched, PRs are opened,
 * or the AI plans a task. Does not look at code yet — evaluates rules applicable
 * to the context and resolves who wins when rules fight.
 * 
 * This transforms architectural memory into executable governance.
 */

import type {
  ArchitecturalDecision,
  ConflictReport,
  GovernanceState,
  GovernanceHealth,
  IntentDriftAnalysis,
  ResolutionContext,
  ResolutionOutcome,
  ValidationStrategy,
  CONFLICT_RESOLUTION_STEPS,
  SEVERITY_RANKINGS,
  GOVERNANCE_SOURCE_AUTHORITY,
} from '../types/governance';

export class GovernanceKernel {
  private allDecisions: ArchitecturalDecision[] = [];
  private eventLog: any[] = [];
  
  /**
   * Main entry point: Resolve governance for a proposed change
   */
  public resolveGovernance(context: ResolutionContext): GovernanceState {
    // Step 1: Filter rules by scope
    const relevantRules = this.filterByScope(context.targetPaths);
    
    // Step 2: Group by decision type
    const groupedRules = this.groupByType(relevantRules);
    
    // Step 3: Arbitrate conflicts
    const { finalPolicies, conflicts } = this.arbitrate(groupedRules);
    
    // Step 4: Calculate intent drift
    const driftAnalysis = this.calculateDrift(finalPolicies, this.allDecisions);
    
    // Step 5: Determine overall enforcement
    const enforcement = this.calculateHighestEnforcement(finalPolicies);
    
    // Step 6: Extract validators
    const validators = this.extractValidators(finalPolicies);
    
    // Step 7: Calculate governance health
    const health = this.calculateGovernanceHealth();
    
    return {
      resolvedPolicies: finalPolicies,
      conflictsDetected: conflicts,
      enforcementLevel: enforcement,
      driftScore: driftAnalysis.current_drift_percentage / 100,
      requiredValidators: validators,
      governanceHealth: health,
    };
  }

  /**
   * Step 1: Filter rules by scope
   * Only grab rules where affected_paths intersect with targetPaths
   */
  private filterByScope(targetPaths: string[]): ArchitecturalDecision[] {
    return this.allDecisions.filter(rule => {
      // Check if any glob pattern matches any target path
      return rule.affected_paths.some(pattern => 
        this.globMatch(pattern, targetPaths)
      );
    });
  }

  /**
   * Glob pattern matching for affected_paths
   */
  private globMatch(pattern: string, targetPaths: string[]): boolean {
    // Convert glob pattern to regex
    const regex = new RegExp(
      '^' + pattern
        .replace(/\./g, '\\.')
        .replace(/\*/g, '[^/]*')
        .replace(/\*\*/g, '.*')
        + '$'
    );
    
    return targetPaths.some(path => regex.test(path));
  }

  /**
   * Step 2: Group rules by type
   */
  private groupByType(rules: ArchitecturalDecision[]): Map<string, ArchitecturalDecision[]> {
    const grouped = new Map<string, ArchitecturalDecision[]>();
    
    rules.forEach(rule => {
      const key = rule.domain; // Group by domain (e.g., 'SovereignMesh', 'AuthLayer')
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(rule);
    });
    
    return grouped;
  }

  /**
   * Step 3: The Cage Match - Arbitrate conflicts
   */
  private arbitrate(
    groupedRules: Map<string, ArchitecturalDecision[]>
  ): { finalPolicies: ArchitecturalDecision[]; conflicts: ConflictReport[] } {
    const finalPolicies: ArchitecturalDecision[] = [];
    const conflicts: ConflictReport[] = [];
    
    for (const [domain, rules] of groupedRules.entries()) {
      // Group by decision_type within each domain
      const byType = new Map<string, ArchitecturalDecision[]>();
      
      rules.forEach(rule => {
        if (!byType.has(rule.decision_type)) {
          byType.set(rule.decision_type, []);
        }
        byType.get(rule.decision_type)!.push(rule);
      });
      
      // Within each type, check for conflicts
      for (const [type, typedRules] of byType.entries()) {
        if (typedRules.length === 1) {
          finalPolicies.push(typedRules[0]);
        } else {
          // Multiple rules of same type = potential conflict
          const { winner, conflict } = this.resolveConflict(typedRules);
          finalPolicies.push(winner);
          
          if (conflict) {
            conflicts.push(conflict);
          }
        }
      }
    }
    
    return { finalPolicies, conflicts };
  }

  /**
   * Resolve conflict between two or more rules
   */
  private resolveConflict(rules: ArchitecturalDecision[]): {
    winner: ArchitecturalDecision;
    conflict: ConflictReport | null;
  } {
    let winner = rules[0];
    const losers: string[] = [];
    
    for (let i = 1; i < rules.length; i++) {
      const comparison = this.compareRules(winner, rules[i]);
      
      if (comparison > 0) {
        // winner stays
        losers.push(rules[i].intent_hash);
      } else {
        // challenger wins
        losers.push(winner.intent_hash);
        winner = rules[i];
      }
    }
    
    const conflict: ConflictReport | null = losers.length > 0 ? {
      conflicting_rules: [winner.intent_hash, ...losers],
      resolution_outcome: 'allow',
      winning_rule: winner.intent_hash,
      reason: this.explainResolution(winner, rules),
      escalation_required: winner.severity === 'critical',
      timestamp: Date.now(),
    } : null;
    
    return { winner, conflict };
  }

  /**
   * Compare two rules using conflict resolution hierarchy
   * Returns > 0 if rule1 wins, < 0 if rule2 wins
   */
  private compareRules(rule1: ArchitecturalDecision, rule2: ArchitecturalDecision): number {
    const steps = [
      'severity',
      'priority_level',
      'governance_source',
      'status',
      'timestamp',
      'confidence_score',
    ];
    
    for (const step of steps) {
      const diff = this.compareByFactor(rule1, rule2, step);
      if (diff !== 0) return diff;
    }
    
    return 0; // Equal
  }

  /**
   * Compare rules by a specific factor
   */
  private compareByFactor(
    rule1: ArchitecturalDecision,
    rule2: ArchitecturalDecision,
    factor: string
  ): number {
    switch (factor) {
      case 'severity':
        return (SEVERITY_RANKINGS[rule2.severity] || 0) - (SEVERITY_RANKINGS[rule1.severity] || 0);
      
      case 'priority_level':
        return rule1.priority_level - rule2.priority_level;
      
      case 'governance_source':
        return (GOVERNANCE_SOURCE_AUTHORITY[rule2.governance_source] || 0) - 
               (GOVERNANCE_SOURCE_AUTHORITY[rule1.governance_source] || 0);
      
      case 'status':
        const statusOrder: Record<string, number> = {
          'active': 4,
          'experimental': 3,
          'proposed': 2,
          'deprecated': 1,
          'superseded': 0,
        };
        return (statusOrder[rule2.status] || 0) - (statusOrder[rule1.status] || 0);
      
      case 'timestamp':
        return rule2.timestamp - rule1.timestamp; // Newer wins
      
      case 'confidence_score':
        return rule2.confidence_score - rule1.confidence_score;
      
      default:
        return 0;
    }
  }

  /**
   * Explain why one rule won over others
   */
  private explainResolution(winner: ArchitecturalDecision, losers: ArchitecturalDecision[]): string {
    const factors: string[] = [];
    
    if (SEVERITY_RANKINGS[winner.severity] > 2) {
      factors.push(`Severity level is ${winner.severity}`);
    }
    
    if (winner.priority_level < 5) {
      factors.push(`Priority level is ${winner.priority_level} (higher authority)`);
    }
    
    if (winner.governance_source === 'core_manifest' || winner.governance_source === 'security_layer') {
      factors.push(`Comes from ${winner.governance_source}`);
    }
    
    if (winner.status === 'active') {
      factors.push('Rule is currently active');
    }
    
    return factors.length > 0 
      ? `Rule selected because: ${factors.join('; ')}`
      : 'Rule selected by standard arbitration';
  }

  /**
   * Step 4: Calculate intent drift
   * Measure mathematical distance from original core_manifest
   */
  private calculateDrift(
    resolvedPolicies: ArchitecturalDecision[],
    allDecisions: ArchitecturalDecision[]
  ): IntentDriftAnalysis {
    // Find core_manifest decisions
    const coreManifest = allDecisions.filter(d => d.governance_source === 'core_manifest');
    
    // Count various drift factors
    const activeOverrides = allDecisions.filter(
      d => d.is_override && d.status === 'active'
    ).length;
    
    const expiredUnreviewed = allDecisions.filter(
      d => d.is_override && d.ttl_expires_at && d.ttl_expires_at < Date.now() && d.status === 'active'
    ).length;
    
    // Calculate drift percentage
    const totalDriftFactor = (activeOverrides * 0.15) + (expiredUnreviewed * 0.35);
    const driftPercentage = Math.min(totalDriftFactor * 100, 100);
    
    return {
      current_drift_percentage: driftPercentage,
      core_manifest_health: 100 - driftPercentage,
      override_accumulation: activeOverrides,
      decay_factor: expiredUnreviewed > 0 ? expiredUnreviewed * 0.1 : 0,
      threshold_exceeded: driftPercentage > 25,
      recommended_action: driftPercentage > 25 
        ? 'Strategic Refactor Required - Architecture has drifted from original intent'
        : 'Continue development - Governance health stable',
      drift_by_category: {
        active_overrides: activeOverrides,
        expired_unreviewed: expiredUnreviewed,
        schema_divergence: 0, // Would scan actual schema
        dependency_creep: 0,  // Would analyze dependency graph
        coupling_increase: 0, // Would measure module coupling
      },
    };
  }

  /**
   * Step 5: Calculate highest enforcement level
   */
  private calculateHighestEnforcement(policies: ArchitecturalDecision[]): ResolutionOutcome {
    let maxSeverity = 0;
    
    for (const policy of policies) {
      const severity = SEVERITY_RANKINGS[policy.severity] || 0;
      if (severity > maxSeverity) {
        maxSeverity = severity;
      }
    }
    
    if (maxSeverity >= 4) return 'hard_block';
    if (maxSeverity >= 3) return 'soft_block';
    if (maxSeverity >= 2) return 'allow_with_warning';
    return 'allow';
  }

  /**
   * Step 6: Extract required validators
   */
  private extractValidators(policies: ArchitecturalDecision[]): ValidationStrategy[] {
    const validators = new Set<ValidationStrategy>();
    
    policies.forEach(policy => {
      policy.validation_strategy.forEach(v => validators.add(v));
    });
    
    return Array.from(validators);
  }

  /**
   * Step 7: Calculate governance health score
   */
  private calculateGovernanceHealth(): GovernanceHealth {
    const activeOverrides = this.allDecisions.filter(d => d.is_override && d.status === 'active').length;
    const expiredOverrides = this.allDecisions.filter(
      d => d.is_override && d.ttl_expires_at && d.ttl_expires_at < Date.now()
    ).length;
    const securityExceptions = this.allDecisions.filter(
      d => d.is_override && d.decision_type === 'security'
    ).length;
    
    const coreManifest = this.allDecisions.filter(d => d.governance_source === 'core_manifest');
    const divergence = this.allDecisions.filter(d => d.is_override).length / (coreManifest.length || 1);
    
    const score = Math.max(0, 100 - (activeOverrides * 5) - (expiredOverrides * 15) - (securityExceptions * 20));
    
    return {
      score: Math.round(score),
      active_overrides: activeOverrides,
      expired_overrides: expiredOverrides,
      suppressed_warnings: 0,
      unreviewed_exceptions: expiredOverrides,
      security_exceptions: securityExceptions,
      core_manifest_divergence: Math.round(divergence * 100),
      last_audit: Date.now(),
    };
  }

  /**
   * Register a new architectural decision
   */
  public registerDecision(decision: ArchitecturalDecision): void {
    this.allDecisions.push(decision);
    this.logEvent('DECISION_ACTIVATED', decision.intent_hash, decision);
  }

  /**
   * Log governance event
   */
  private logEvent(eventType: string, decisionId: string, data: any): void {
    this.eventLog.push({
      event_type: eventType,
      decision_id: decisionId,
      timestamp: Date.now(),
      data,
    });
  }

  /**
   * Get event log (for observability)
   */
  public getEventLog(): any[] {
    return this.eventLog;
  }

  /**
   * Check if a proposed change violates any hard-blocking rules
   */
  public validateProposedChange(context: ResolutionContext): {
    allowed: boolean;
    violations: ConflictReport[];
    warnings: string[];
  } {
    const state = this.resolveGovernance(context);
    
    return {
      allowed: state.enforcementLevel !== 'hard_block',
      violations: state.conflictsDetected.filter(c => 
        SEVERITY_RANKINGS[c.conflicting_rules] >= 3
      ),
      warnings: state.conflictsDetected
        .filter(c => SEVERITY_RANKINGS[c.conflicting_rules] === 2)
        .map(c => c.reason),
    };
  }
}

// ─── SINGLETON INSTANCE ──────────────────────────────────────────────────────

let kernel: GovernanceKernel | null = null;

export function getGovernanceKernel(): GovernanceKernel {
  if (!kernel) {
    kernel = new GovernanceKernel();
  }
  return kernel;
}
