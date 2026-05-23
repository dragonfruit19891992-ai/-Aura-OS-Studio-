import { ArchitecturalDecision } from './GovernanceSchema';

export interface DriftReport {
  score: number;
  percentage: string;
  warnings: string[];
  requiresRefactor: boolean;
}

export class IntentDriftDetector {
  /**
   * Calculates the architectural drift from the core manifest.
   * Intent Drift is the mathematical distance between the original
   * local-first architecture and the current state (filled with overrides).
   */
  public calculateDrift(activeDecisions: ArchitecturalDecision[]): DriftReport {
    let driftPoints = 0;
    const warnings: string[] = [];
    const now = Date.now();

    for (const rule of activeDecisions) {
      if (rule.is_override) {
        // Base penalty for active override
        driftPoints += 10;
        warnings.push(`[Active Override] ${rule.title} is bypassing ${rule.governance_source}`);
        
        // Critical penalty for expired override (Technical Debt)
        if (rule.ttl_expires_at && rule.ttl_expires_at < now) {
          driftPoints += 50;
          warnings.push(`[CRITICAL EXPIRED] Override "${rule.title}" exceeded its TTL. Architecture Review Required immediately.`);
        }

        // Security overrides carry extreme penalty
        if (rule.priority_level === 1) {
          driftPoints += 100;
          warnings.push(`[SECURITY DIVERGENCE] Core security policy is currently overridden by: ${rule.title}`);
        }
        
        // Developer bypasses are penalized highly
        if (rule.governance_source === 'temporary_override') {
          driftPoints += 25;
        }
      }
    }

    // Convert drift points to a percentage (0.0 to 1.0)
    const maxSafeDrift = 250; // Arbitrary ceiling for 100% drift
    const rawScore = Math.min(driftPoints / maxSafeDrift, 1.0);
    const percentage = (rawScore * 100).toFixed(1) + '%';
    
    // If drift hits 25%, the AI should force a strategic refactor
    const requiresRefactor = rawScore >= 0.25;

    if (requiresRefactor) {
      warnings.unshift(`⚠️ STRATEGIC REFACTOR REQUIRED: We have drifted ${percentage} from our original architecture.`);
    }

    return {
      score: rawScore,
      percentage,
      warnings,
      requiresRefactor
    };
  }
}
