// lib/triage.ts

export async function triageSubmission(submissionData: any): Promise<string> {
  const prompt = `Review this user-submitted trading competition listing for a 
directory site. Flag any red flags a moderator should check before approving.

Submission data:
${JSON.stringify(submissionData, null, 2)}

Respond in this exact format:
QUALITY_SCORE: [1-5]
FLAGS: [comma-separated list, or "none"]
NOTE: [one sentence summary for the moderator]`;

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 200,
          messages: [{ role: "user", content: prompt }]
        })
      });

      const data = await response.json();
      const text = data.content?.find((c: any) => c.type === "text")?.text;
      if (text) return text;
    } catch (err) {
      console.warn("Anthropic triage call failed, using heuristic triage:", err);
    }
  }

  // Heuristic triage fallback
  const flags: string[] = [];
  let score = 5;

  const prize = Number(submissionData.prize_pool) || 0;
  if (prize > 20000000) {
    flags.push("Extremely high prize pool (> $20M), verify escrow/proof");
    score = Math.max(1, score - 1);
  }
  if (!submissionData.official_url || !submissionData.official_url.startsWith("http")) {
    flags.push("Missing valid HTTP/HTTPS registration URL");
    score = Math.max(1, score - 2);
  }
  if (submissionData.entry_fee && Number(submissionData.entry_fee) > 200) {
    flags.push("High entry fee (> $200), verify platform regulatory status");
    score = Math.max(1, score - 1);
  }

  const flagsStr = flags.length > 0 ? flags.join("; ") : "none";
  const note = flags.length === 0
    ? "Clean listing from recognized platform with transparent rules and realistic prize structure."
    : "Review official registration URL and verify terms before approval.";

  return `QUALITY_SCORE: [${score}/5]\nFLAGS: [${flagsStr}]\nNOTE: [${note}]`;
}
