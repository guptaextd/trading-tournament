// lib/monitoring/scheduler.ts
import { db } from '../db';
import { Competition, MonitoringRunResult } from '@/types';
import { extractParticipantCount } from './extractionAgent';
import { verifyAndSaveParticipantCount } from './verificationAgent';

export interface SchedulerBatchSummary {
  startedAt: string;
  completedAt: string;
  totalCompetitions: number;
  eligibleCount: number;
  updated: number;
  flagged: number;
  unavailable: number;
  skipped: number;
  results: MonitoringRunResult[];
}

export function isEligibleForCheck(comp: Competition): { eligible: boolean; reason: string } {
  if (comp.status === 'ended') {
    return { eligible: false, reason: 'Tournament status is ended: monitoring ceased.' };
  }

  const lastChecked = comp.participant_count_checked_at 
    ? new Date(comp.participant_count_checked_at).getTime() 
    : 0;
  const elapsedMs = Date.now() - lastChecked;

  if (comp.status === 'live') {
    // Live tournaments: check every 45 minutes
    const cadenceMs = 45 * 60 * 1000;
    if (elapsedMs < cadenceMs) {
      const minutesAgo = Math.round(elapsedMs / 60000);
      return { eligible: false, reason: `Live tournament checked recently (${minutesAgo}m ago, cadence is 45m).` };
    }
    return { eligible: true, reason: 'Live tournament due for 45m interval check.' };
  }

  if (comp.status === 'upcoming') {
    // Upcoming tournaments: check once daily (24h)
    const cadenceMs = 24 * 60 * 60 * 1000;
    if (elapsedMs < cadenceMs) {
      const hoursAgo = Math.round(elapsedMs / 3600000);
      return { eligible: false, reason: `Upcoming tournament checked recently (${hoursAgo}h ago, cadence is 24h).` };
    }
    return { eligible: true, reason: 'Upcoming tournament due for 24h interval check.' };
  }

  return { eligible: false, reason: 'Unknown tournament status.' };
}

export async function runMonitoringPipeline(targetCompetitionId?: string): Promise<SchedulerBatchSummary> {
  const startedAt = new Date().toISOString();
  const compResponse = db.getCompetitions();
  const allCompetitions = compResponse.items;

  let targetList: Competition[] = [];
  if (targetCompetitionId) {
    const single = allCompetitions.find(c => c.id === targetCompetitionId);
    if (single) targetList = [single];
  } else {
    targetList = allCompetitions;
  }

  const results: MonitoringRunResult[] = [];
  let updated = 0;
  let flagged = 0;
  let unavailable = 0;
  let skipped = 0;

  for (const comp of targetList) {
    // If targetCompetitionId was explicitly passed, bypass cadence restriction for on-demand test
    const eligibility = targetCompetitionId 
      ? { eligible: true, reason: 'Manual trigger override' } 
      : isEligibleForCheck(comp);

    if (!eligibility.eligible) {
      skipped++;
      results.push({
        competition_id: comp.id,
        competition_title: comp.title,
        status: 'skipped',
        previous_count: comp.participant_count ?? null,
        reason: eligibility.reason
      });
      continue;
    }

    // Determine target URL (prefer discovery URL if found, else official_url)
    const targetUrl = comp.participant_count_url || comp.official_url;

    try {
      // 1. Run Extraction Agent
      const extraction = await extractParticipantCount({
        url: targetUrl,
        competitionTitle: comp.title
      });

      // 2. Run Verification Agent (compares against previous, flags anomalies, or saves)
      const outcome = await verifyAndSaveParticipantCount({
        competition: comp,
        extraction
      });

      results.push(outcome);

      if (outcome.status === 'updated') updated++;
      else if (outcome.status === 'flagged') flagged++;
      else if (outcome.status === 'unavailable') unavailable++;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      results.push({
        competition_id: comp.id,
        competition_title: comp.title,
        status: 'error',
        previous_count: comp.participant_count ?? null,
        reason: `Extraction pipeline exception: ${message}`
      });
    }
  }

  return {
    startedAt,
    completedAt: new Date().toISOString(),
    totalCompetitions: allCompetitions.length,
    eligibleCount: targetList.length - skipped,
    updated,
    flagged,
    unavailable,
    skipped,
    results
  };
}
