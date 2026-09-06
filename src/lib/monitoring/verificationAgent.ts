// lib/monitoring/verificationAgent.ts
import { db } from '../db';
import { Competition, ExtractionResult, ParticipantConfidence, MonitoringRunResult } from '@/types';

interface VerifyAndSaveOptions {
  competition: Competition;
  extraction: ExtractionResult;
}

export async function verifyAndSaveParticipantCount(options: VerifyAndSaveOptions): Promise<MonitoringRunResult> {
  const { competition, extraction } = options;
  const previousCount = competition.participant_count ?? null;
  const checkedAt = new Date().toISOString();

  // Case 1: Extraction did not find an explicit count
  if (!extraction.found || extraction.count === undefined || extraction.count === null) {
    // We update checked_at without overwriting previous valid count
    db.updateCompetitionParticipant(competition.id, {
      confidence: previousCount !== null ? 'low' : 'unavailable',
      source_text: extraction.reasoning,
      url: extraction.url,
      checked_at: checkedAt
    });

    return {
      competition_id: competition.id,
      competition_title: competition.title,
      status: 'unavailable',
      previous_count: previousCount,
      new_count: null,
      confidence: 'unavailable',
      reason: extraction.reasoning
    };
  }

  const newCount = extraction.count;

  // Case 2: Anomaly checks against previous count
  if (previousCount !== null && previousCount > 0) {
    // Check for drop below 50%
    if (newCount < previousCount * 0.5) {
      const dropPct = Math.round(((previousCount - newCount) / previousCount) * 100);
      const reason = `Suspicious drop: count dropped from ${previousCount.toLocaleString()} to ${newCount.toLocaleString()} (-${dropPct}% drop below 50% threshold). Possible tournament reset, qualification purge, or subpage error.`;

      db.addParticipantFlag({
        competition_id: competition.id,
        competition_title: competition.title,
        reason,
        previous_count: previousCount,
        attempted_count: newCount,
        raw_extraction: {
          ...extraction,
          source_text: extraction.source_phrase
        },
        resolved: false
      });

      return {
        competition_id: competition.id,
        competition_title: competition.title,
        status: 'flagged',
        previous_count: previousCount,
        new_count: newCount,
        confidence: extraction.confidence,
        source_phrase: extraction.source_phrase,
        reason
      };
    }

    // Check for jump more than 20x
    if (newCount > previousCount * 20) {
      const jumpMultiple = (newCount / previousCount).toFixed(1);
      const reason = `Suspicious spike: count jumped from ${previousCount.toLocaleString()} to ${newCount.toLocaleString()} (${jumpMultiple}x jump over 20x threshold). Likely scraped total platform users or trading volume rather than registrations.`;

      db.addParticipantFlag({
        competition_id: competition.id,
        competition_title: competition.title,
        reason,
        previous_count: previousCount,
        attempted_count: newCount,
        raw_extraction: {
          ...extraction,
          source_text: extraction.source_phrase
        },
        resolved: false
      });

      return {
        competition_id: competition.id,
        competition_title: competition.title,
        status: 'flagged',
        previous_count: previousCount,
        new_count: newCount,
        confidence: extraction.confidence,
        source_phrase: extraction.source_phrase,
        reason
      };
    }
  }

  // Case 3: Verified safe and honest — commit to DB and History
  const confidence: ParticipantConfidence = extraction.confidence;

  // Update competition record
  db.updateCompetitionParticipant(competition.id, {
    count: newCount,
    source_text: extraction.source_phrase || null,
    confidence,
    url: extraction.url,
    checked_at: checkedAt
  });

  // Record history point for charts
  db.addParticipantHistory({
    competition_id: competition.id,
    count: newCount,
    confidence,
    checked_at: checkedAt
  });

  return {
    competition_id: competition.id,
    competition_title: competition.title,
    status: 'updated',
    previous_count: previousCount,
    new_count: newCount,
    confidence,
    source_phrase: extraction.source_phrase,
    reason: `Verified valid count: ${newCount.toLocaleString()}`
  };
}
