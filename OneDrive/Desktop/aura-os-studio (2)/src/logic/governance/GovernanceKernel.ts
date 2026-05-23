import {
  ArchitecturalDecision,
  ConflictReport,
  GovernanceState,
  ResolutionContext,
  ValidationStrategy,
  ResolutionOutcome,
  DecisionType
} from './GovernanceSchema';

export class GovernanceKernel {
  /**
   * The core deterministic function that evaluates context against active architectural policies.
   */
  public resolveGovernance(context: ResolutionContext): GovernanceState {
    const relevantRules = this.filterByScope(context);
    const groupedRules = this.groupByType(relevantRules);
    
    const { finalPolicies, conflicts } = this.arbitrate(groupedRules);
    
    // In a real system, activeDecisions would be all historical rules; here we just use the subset
    // to calculate drift
    const driftScore = this.calculateDrift(finalPolicies, context.activeDecisions);
    const enforcementLevel = this.calculateHighestEnforcement(finalPolicies, conflicts);
    const requiredValidators = this.extractValidators(finalPolicies);

    return {
      resolvedPolicies: finalPolicies,
      conflictsDetected: conflicts,
      enforcementLevel,
      driftScore,
      requiredValidators
    };
  }

  /**
   * Filters rules to only those whose affected paths intersect with the target paths.
   */
  private filterByScope(context: ResolutionContext): ArchitecturalDecision[] {
    // Basic implementation: if any target path matches any affected path (simple substring or glob match)
    return context.activeDecisions.filter(decision => {
      // If it's a global rule (e.g. ['**/*']), it applies to everything
      if (decision.affected_paths.includes('**/*')) return true;
      
      return decision.affected_paths.some(affected => 
        context.targetPaths.some(target => target.includes(affected.replace('**', '')))
      );
    });
  }

  private groupByType(rules: ArchitecturalDecision[]): Map<DecisionType, ArchitecturalDecision[]> {
    const map = new Map<DecisionType, ArchitecturalDecision[]>();
    for (const rule of rules) {
      if (!map.has(rule.decision_type)) {
        map.set(rule.decision_type, []);
      }
      map.get(rule.decision_type)!.push(rule);
    }
    return map;
  }

  /**
   * The Cage Match: Resolves conflicts when multiple rules target the same domain/type.
   */
  private arbitrate(groupedRules: Map<DecisionType, ArchitecturalDecision[]>): { finalPolicies: ArchitecturalDecision[], conflicts: ConflictReport[] } {
    const finalPolicies: ArchitecturalDecision[] = [];
    const conflicts: ConflictReport[] = [];

    for (const [type, rules] of groupedRules.entries()) {
      if (rules.length === 1) {
        finalPolicies.push(rules[0]);
        continue;
      }

      // We have multiple rules for this type (e.g., Security).
      // Sort them by the arbitration hierarchy to find the undisputed winner.
      const sorted = [...rules].sort((a, b) => {
        // 1. Severity: critical > blocking > warning > advisory
        const sevMap = { critical: 4, blocking: 3, warning: 2, advisory: 1 };
        if (sevMap[a.severity] !== sevMap[b.severity]) return sevMap[b.severity] - sevMap[a.severity];

        // 2. Priority Level (1 is highest priority, 8 is lowest)
        if (a.priority_level !== b.priority_level) return a.priority_level - b.priority_level;

        // 3. Governance Source: core_manifest > security_layer > runtime_policy > experimental_branch
        const srcMap = { core_manifest: 5, security_layer: 4, runtime_policy: 3, temporary_override: 2, experimental_branch: 1 };
        if (srcMap[a.governance_source] !== srcMap[b.governance_source]) return srcMap[b.governance_source] - srcMap[a.governance_source];

        // 4. Status: active > experimental > proposed
        const statusMap = { active: 3, experimental: 2, proposed: 1, deprecated: 0, superseded: 0 };
        if (statusMap[a.status] !== statusMap[b.status]) return statusMap[b.status] - statusMap[a.status];

        // 5. Timestamp (Evolution: newer wins)
        if (a.timestamp !== b.timestamp) return b.timestamp - a.timestamp;

        // 6. Confidence Score
        return b.confidence_score - a.confidence_score;
      });

      const winner = sorted[0];
      finalPolicies.push(winner);

      // Log conflicts for the losers
      for (let i = 1; i < sorted.length; i++) {
        conflicts.push({
          winning_rule: winner.intent_hash,
          losing_rule: sorted[i].intent_hash,
          resolution_reason: `Winner outranked loser in arbitration hierarchy (Severity: ${winner.severity}, Priority: ${winner.priority_level}, Source: ${winner.governance_source})`
        });
      }
    }

    return { finalPolicies, conflicts };
  }

  private calculateDrift(finalPolicies: ArchitecturalDecision[], allActive: ArchitecturalDecision[]): number {
    let driftPoints = 0;
    const now = Date.now();

    for (const rule of allActive) {
      if (rule.is_override) {
        driftPoints += 10; // Base penalty for active override
        if (rule.ttl_expires_at && rule.ttl_expires_at < now) {
          driftPoints += 50; // Critical penalty for expired override
        }
      }
      // Security overrides carry extreme penalty
      if (rule.is_override && rule.priority_level === 1) {
        driftPoints += 100;
      }
    }

    // Convert drift points to a percentage (0.0 to 1.0)
    // Arbitrary scaling for demonstration: 200 points = 1.0 (100% drift)
    return Math.min(driftPoints / 200, 1.0);
  }

  private calculateHighestEnforcement(policies: ArchitecturalDecision[], conflicts: ConflictReport[]): ResolutionOutcome {
    let hasCritical = false;
    let hasBlocking = false;
    let hasWarning = false;

    for (const policy of policies) {
      if (policy.severity === 'critical') hasCritical = true;
      if (policy.severity === 'blocking') hasBlocking = true;
      if (policy.severity === 'warning') hasWarning = true;
    }

    if (hasCritical) return 'hard_block';
    if (hasBlocking) return 'soft_block';
    if (conflicts.length > 0) return 'requires_review';
    if (hasWarning) return 'allow_with_warning';
    return 'allow';
  }

  private extractValidators(policies: ArchitecturalDecision[]): ValidationStrategy[] {
    const strategies = new Set<ValidationStrategy>();
    policies.forEach(p => p.validation_strategy.forEach(v => strategies.add(v)));
    return Array.from(strategies);
  }
}
